import { buildInputPrompt } from './conversationPrompt.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SAKHI_TOOL_DECLARATIONS, dispatchToolCall } from './tools/index.js';
import { createWithRetry, formatAiError, getAiRequestPolicy, withRequestDeadline } from './requestPolicy.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const providerError = (status, message) => Object.assign(new Error(message), { status });

export const extractReplyText = (response) => {
    if (typeof response.output_text === 'string' && response.output_text.trim()) return response.output_text.trim();
    const outputs = response.outputs || response.steps?.filter((step) => step.type === 'model_output').flatMap((step) => step.content || []) || [];
    return outputs.filter((part) => part.type === 'text' || !part.type).map((part) => part.text || '').join('\n').trim();
};

// All provider requests, retries and tool rounds share one deadline.
export const callCloudLlm = async ({ prompt, messages = [], systemInstruction = '', allowTools = true, signal }, dependencies = {}) => {
    const apiKey = dependencies.apiKey ?? (process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY || '');
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const policy = dependencies.policy || getAiRequestPolicy();
    try {
        if (!apiKey || apiKey === 'your_gemini_api_key_here') throw providerError(401, 'Missing provider API key');
        const ai = dependencies.client || new GoogleGenAI({ apiKey });
        const dispatch = dependencies.dispatch || dispatchToolCall;
        const input = buildInputPrompt({ prompt, messages });
        if (!input) throw providerError(400, 'Empty provider input');
        return await withRequestDeadline(async (budget) => {
            const tools = allowTools ? SAKHI_TOOL_DECLARATIONS : [];
            const base = { model, system_instruction: systemInstruction, tools };
            const create = (payload) => createWithRetry(ai.interactions.create.bind(ai.interactions), payload, budget, policy);
            let response = await create({ ...base, input });
            const cards = { jobs: [], courses: [], schemes: [] };
            const actions = [];
            for (let round = 0; round <= 2; round++) {
                const calls = (response.steps || response.outputs || []).filter((step) => step.type === 'function_call');
                if (!calls.length) {
                    const text = extractReplyText(response);
                    if (!text) throw providerError(502, 'Invalid or incomplete provider response');
                    return { text, cards, actions };
                }
                if (!allowTools || round === 2 || calls.length > 3 || !response.id || calls.some((call) => !call.id)) throw providerError(502, 'Invalid or incomplete provider response');
                const results = await Promise.all(calls.map(async (call) => {
                    if (budget.signal.aborted) throw providerError(504, 'Request deadline exceeded');
                    let result;
                    try {
                        result = await dispatch(call.name, call.arguments || {});
                    } catch {
                        result = { success: false, message: 'This data source is temporarily unavailable.' };
                    }
                    if (result?.success) {
                        for (const domain of Object.keys(cards)) cards[domain].push(...(result[domain] || []));
                        if (result.action) actions.push(result.action);
                    }
                    return { type: 'function_result', name: call.name, call_id: call.id,
                        result: [{ type: 'text', text: JSON.stringify(result) }] };
                }));
                for (const domain of Object.keys(cards)) cards[domain] = cards[domain].slice(0, 4);
                response = await create({ ...base, previous_interaction_id: response.id, input: results });
            }
        }, policy.timeoutMs, signal);
    } catch (error) {
        const formatted = formatAiError(error);
        console.error(`[Cloud LLM]: model=${model}, status=${error.status || error.statusCode || 'network'}`);
        throw formatted;
    }
};
