import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SAKHI_TOOL_DECLARATIONS, dispatchToolCall } from './tools/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Cloud LLM Provider Abstraction Module for Sakhi AI
 * Autonomous Agent Tool Calling Engine (`ai.interactions.create`).
 */

const getApiKey = () => {
    return process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY || '';
};

const getModelName = () => {
    return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
};

/**
 * Call Cloud LLM API using Google Gemini Interactions API with Autonomous Tool Calling
 * @param {Object} options
 * @param {string} [options.prompt] - Single user query string
 * @param {Array} [options.messages] - Multi-turn conversation messages [{ role: 'user'|'assistant', content: string }]
 * @param {string} [options.systemInstruction] - Optional system prompt instruction
 * @returns {Promise<string>} Generative text response from LLM
 */
export const callCloudLlm = async ({ prompt, messages = [], systemInstruction = '' }) => {
    const apiKey = getApiKey();
    const model = getModelName();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        const error = new Error('GEMINI_API_KEY is not configured in Sakhi-Backend/.env. Please add your Gemini API key.');
        error.statusCode = 401;
        throw error;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        let inputPrompt = '';
        if (Array.isArray(messages) && messages.length > 0) {
            inputPrompt = messages
                .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
                .join('\n');
        } else {
            inputPrompt = prompt || '';
        }

        const interactionPayload = {
            model,
            input: inputPrompt,
            tools: SAKHI_TOOL_DECLARATIONS
        };

        if (systemInstruction) {
            interactionPayload.system_instruction = systemInstruction;
        }

        /**
         * Helper to execute Gemini Interaction API requests with retries ONLY for transient server/network errors (5xx/timeouts).
         * Non-retryable status codes (400, 401, 403, 404, 429 quota) immediately fail without retrying.
         */
        const createWithRetry = async (payload, maxRetries = 1) => {
            let attempt = 0;
            while (true) {
                try {
                    return await ai.interactions.create(payload);
                } catch (err) {
                    const status = err.status || err.statusCode || 500;
                    const errMessage = err.message || err.toString() || '';

                    // Do NOT retry quota/rate-limit errors (429), authentication (401/403), client errors (400), or missing model (404)
                    const isQuotaOr429 = status === 429 || errMessage.includes('429') || errMessage.includes('Quota exceeded') || errMessage.includes('RESOURCE_EXHAUSTED');
                    const isNonRetryable = isQuotaOr429 || status === 400 || status === 401 || status === 403 || status === 404;

                    if (isNonRetryable || attempt >= maxRetries) {
                        throw err;
                    }

                    attempt++;
                    console.warn(`[Cloud LLM]: Transient error (${status}). Retrying attempt ${attempt}/${maxRetries} in 1s...`);
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }
        };

        // Pass 1: Call Google Gemini Interactions API with tools declared
        let response = await createWithRetry(interactionPayload);

        let actions = [];

        // Check if Gemini autonomous agent requested tool calls (status === 'requires_action')
        const toolCallSteps = response.steps ? response.steps.filter((s) => s.type === 'function_call') : [];

        if (response.status === 'requires_action' && toolCallSteps.length > 0) {
            console.log(`[Sakhi AI Agent]: Gemini requested execution of ${toolCallSteps.length} tool(s).`);

            // Execute all requested tools in parallel via Sakhi AI Tool Dispatcher
            const toolResults = await Promise.all(
                toolCallSteps.map(async (step) => {
                    const res = await dispatchToolCall(step.name, step.arguments || {});
                    return { toolName: step.name, arguments: step.arguments, result: res };
                })
            );

            // Collect structured action objects from tool outputs
            actions = toolResults
                .map((tr) => tr.result && tr.result.action)
                .filter(Boolean);

            const formattedResults = toolResults
                .map((tr) => `Sakhi Tool "${tr.toolName}" returned: ${JSON.stringify(tr.result)}`)
                .join('\n\n');

            // Pass 2: Feed all structured tool execution results back to Gemini to synthesize combined response
            const synthesisPrompt = `User query: "${inputPrompt}"\n\n${formattedResults}\n\nPlease synthesize a friendly, clear, and structured response for the user. When multiple tools are invoked (such as jobs and courses), clearly separate your response into:\n- Recommended Jobs\n- Recommended Courses\n- Why each recommendation is relevant to their goals.`;

            const synthesisPayload = {
                model,
                input: synthesisPrompt
            };

            if (systemInstruction) {
                synthesisPayload.system_instruction = systemInstruction;
            }

            response = await createWithRetry(synthesisPayload);
        }

        // Extract response text from Interactions API response object
        const replyText = (
            response.output_text ||
            response.outputs?.[0]?.text ||
            (response.steps && response.steps.find((s) => s.type === 'model_output')?.content?.[0]?.text) ||
            ''
        ).trim();

        if (!replyText) {
            throw new Error('LLM returned an empty response candidate.');
        }

        return {
            text: replyText,
            actions
        };
    } catch (error) {
        if (error.statusCode && error.statusCode !== 500) {
            throw error;
        }

        const status = error.status || error.statusCode || 500;
        const errMessage = error.message || error.toString() || '';

        let cleanStatusCode = status;
        let userFriendlyMessage = 'An error occurred while processing your AI request.';

        if (status === 429 || errMessage.includes('429') || errMessage.includes('Quota exceeded') || errMessage.includes('RESOURCE_EXHAUSTED')) {
            cleanStatusCode = 429;
            // Extract retry delay in seconds from Google's API error message (e.g., "Please retry in 37.711s")
            const retryMatch = errMessage.match(/retry in ([0-9]+(?:\.[0-9]+)?)s/i) || errMessage.match(/retry in (?:about|approximately)?\s*([0-9]+)\s*seconds/i);
            const seconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 40;
            userFriendlyMessage = `AI service quota has been reached. Please try again in about ${seconds} seconds.`;
        } else if (status === 401 || status === 403 || errMessage.includes('401') || errMessage.includes('API_KEY_INVALID')) {
            cleanStatusCode = 401;
            userFriendlyMessage = 'Invalid or unauthorized GEMINI_API_KEY. Please verify your API key in Sakhi-Backend/.env.';
        } else if (status === 404 || errMessage.includes('404') || errMessage.includes('not_found')) {
            cleanStatusCode = 404;
            userFriendlyMessage = `The specified Gemini model "${model}" was not found or is deprecated. Please set GEMINI_MODEL=gemini-3.6-flash in Sakhi-Backend/.env.`;
        } else if (status === 400 || errMessage.includes('400')) {
            cleanStatusCode = 400;
            userFriendlyMessage = 'Invalid request parameters sent to AI service.';
        } else if (status === 504 || errMessage.includes('TIMEOUT') || errMessage.includes('ETIMEDOUT')) {
            cleanStatusCode = 504;
            userFriendlyMessage = 'Cloud LLM API request timed out. Please try again.';
        } else {
            cleanStatusCode = 500;
            userFriendlyMessage = 'Cloud LLM service encountered an unexpected error. Please try again.';
        }

        // Log error once in a clean, concise format (no huge multi-page stack traces)
        console.error(`[Cloud LLM Error]: HTTP ${cleanStatusCode} - ${userFriendlyMessage}`);

        const formattedError = new Error(userFriendlyMessage);
        formattedError.statusCode = cleanStatusCode;
        throw formattedError;
    }
};
