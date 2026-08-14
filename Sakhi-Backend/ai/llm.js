import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Cloud LLM Provider Abstraction Module for Sakhi AI
 * Decouples the backend from specific LLM vendors (e.g. Gemini, OpenAI, Anthropic).
 */

const getApiKey = () => {
    return process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY || '';
};

/**
 * Call Cloud LLM API with prompt and system instruction
 * @param {Object} options
 * @param {string} options.prompt - The user input or conversation text
 * @param {string} [options.systemInstruction] - Optional system prompt instruction
 * @param {Array} [options.history] - Optional conversation history
 * @returns {Promise<string>} Generative text response from LLM
 */
export const callCloudLlm = async ({ prompt, systemInstruction = '', history = [] }) => {
    const apiKey = getApiKey();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        const error = new Error('GEMINI_API_KEY is not configured in Sakhi-Backend/.env. Please add your Gemini API key.');
        error.statusCode = 401;
        throw error;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const config = {};
        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        }

        // Generate response using gemini-2.5-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config
        });

        const replyText = response.text ? response.text.trim() : '';

        if (!replyText) {
            throw new Error('LLM returned an empty response candidate.');
        }

        return replyText;
    } catch (error) {
        console.error('[Cloud LLM Error]:', error.message || error);

        // Classify errors for proper HTTP status propagation
        if (error.statusCode) throw error;

        const errMessage = error.message || '';
        const newErr = new Error(errMessage || 'Failed to generate response from Cloud LLM.');

        if (errMessage.includes('API_KEY_INVALID') || errMessage.includes('API key not valid') || errMessage.includes('401')) {
            newErr.statusCode = 401;
            newErr.message = 'Invalid or unauthorized GEMINI_API_KEY. Please verify your API key in Sakhi-Backend/.env.';
        } else if (errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED') || errMessage.includes('Quota exceeded')) {
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
