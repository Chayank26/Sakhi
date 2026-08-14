import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Cloud LLM Provider Abstraction Module for Sakhi AI
 * Migrated to Google's official Gemini Interactions API (`ai.interactions.create`).
 */

const getApiKey = () => {
    return process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY || '';
};

const getModelName = () => {
    return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
};

/**
 * Call Cloud LLM API using Google Gemini Interactions API
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
            // Format multi-turn conversation turns
            inputPrompt = messages
                .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
                .join('\n');
        } else {
            inputPrompt = prompt || '';
        }

        const interactionPayload = {
            model,
            input: inputPrompt
        };

        if (systemInstruction) {
            interactionPayload.system_instruction = systemInstruction;
        }

        // Call Google Gemini Interactions API
        const response = await ai.interactions.create(interactionPayload);

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

        return replyText;
    } catch (error) {
        console.error('[Cloud LLM Error]:', error.message || error);

        if (error.statusCode) throw error;

        const errMessage = error.message || '';
        const newErr = new Error(errMessage || 'Failed to generate response from Cloud LLM.');

        if (errMessage.includes('API_KEY_INVALID') || errMessage.includes('API key not valid') || errMessage.includes('401') || error.status === 401) {
            newErr.statusCode = 401;
            newErr.message = 'Invalid or unauthorized GEMINI_API_KEY. Please verify your API key in Sakhi-Backend/.env.';
        } else if (errMessage.includes('no longer available') || errMessage.includes('not_found') || error.status === 404) {
            newErr.statusCode = 404;
            newErr.message = `The specified Gemini model "${model}" was not found or is deprecated. Please set GEMINI_MODEL=gemini-3.6-flash in Sakhi-Backend/.env.`;
        } else if (errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED') || errMessage.includes('Quota exceeded') || error.status === 429) {
            newErr.statusCode = 429;
            newErr.message = 'Cloud LLM API rate limit or quota exceeded. Please try again in a few moments.';
        } else if (errMessage.includes('TIMEOUT') || errMessage.includes('ETIMEDOUT')) {
            newErr.statusCode = 504;
            newErr.message = 'Cloud LLM API request timed out. Please try again.';
        } else {
            newErr.statusCode = 500;
        }

        throw newErr;
    }
};
