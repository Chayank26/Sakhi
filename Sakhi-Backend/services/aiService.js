import { buildSessionContext } from './aiSessionService.js';
import { callCloudLlm } from '../ai/llm.js';
import { SAKHI_SYSTEM_PROMPT } from '../ai/prompts/sakhiSystemPrompt.js';
import { buildProfileContext } from './aiPersonalizationService.js';
import { buildGroundingContext, extractGroundingSignals } from './aiGroundingService.js';
import { buildToolExecutionPlan } from './aiToolOrchestrationService.js';
import { buildRecommendationSet, rankRecommendations } from './aiRecommendationService.js';
import { evaluateSafety } from './aiSafetyService.js';
import { evaluateResponseQuality } from './aiFeedbackEvalService.js';
import { retrieveGroundingData, describeRetrievalStatus } from './aiRetrievalService.js';

/**
 * Sakhi AI Service Abstraction Layer
 * Isolates AI response generation logic from HTTP controllers and Express routes.
 */

export const normalizeMessages = (messages = []) => {
    if (!Array.isArray(messages)) return [];

    return messages
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: typeof item.content === 'string' ? item.content.trim() : ''
        }))
        .filter((item) => item.content && ['user', 'assistant'].includes(item.role));
};

export const createFallbackAiResponse = (context = '') => ({
    message: context
        ? `I’m here to help with Sakhi jobs, courses, schemes, and support. Could you rephrase your question about “${context.slice(0, 80)}”?`
        : 'I’m here to help with Sakhi jobs, courses, schemes, and support. Please tell me what you want help with.',
    actions: [],
    cards: { jobs: [], courses: [], schemes: [] },
    timestamp: new Date().toISOString()
});

/**
 * Generate AI chat response from user message or conversation history
 * @param {Object} params
 * @param {string} [params.message] - Single user message string
 * @param {Array} [params.messages] - Multi-turn message history array
 * @returns {Promise<Object>} Object containing response message
 */
export const generateAiResponseService = async ({ message, messages, profile = {}, grounding = {}, signal },
    { callLlm = callCloudLlm, retrieve = retrieveGroundingData } = {}) => {
    signal?.throwIfAborted();
    const normalizedMessages = buildSessionContext(messages);
    const promptText = (typeof message === 'string' ? message.trim() : '') ||
        [...normalizedMessages].reverse().find((entry) => entry.role === 'user')?.content || '';
    const safetyCheck = evaluateSafety(promptText || normalizedMessages.map((entry) => entry.content).join(' '));

    if (!safetyCheck.safe) {
        return {
            message: safetyCheck.reason,
            actions: [],
            cards: { jobs: [], courses: [], schemes: [] },
            timestamp: new Date().toISOString()
        };
    }

    const profileContext = buildProfileContext(profile);
    const retrievedGrounding = await retrieve({ message: promptText, messages: normalizedMessages, profile });
    signal?.throwIfAborted();
    const mergedGrounding = {
        ...grounding,
        jobs: [...(grounding.jobs || []), ...retrievedGrounding.jobs],
        courses: [...(grounding.courses || []), ...retrievedGrounding.courses],
        schemes: [...(grounding.schemes || []), ...retrievedGrounding.schemes]
    };
    for (const domain of ['jobs', 'courses', 'schemes']) mergedGrounding[domain] = rankRecommendations(mergedGrounding[domain], profile, promptText);
    const retrievalNotice = describeRetrievalStatus(retrievedGrounding.status);
    const hasRetrieval = retrievedGrounding.domains?.length > 0;
    const hasRecords = ['jobs', 'courses', 'schemes'].some((domain) => mergedGrounding[domain].length);
    if (hasRetrieval && !hasRecords) {
        return { message: retrievalNotice, actions: retrievedGrounding.actions,
            cards: { jobs: [], courses: [], schemes: [] }, timestamp: new Date().toISOString() };
    }
    const groundingContext = buildGroundingContext(mergedGrounding);
    const groundingSignals = extractGroundingSignals(promptText, profile);
    const toolPlan = buildToolExecutionPlan(promptText, profile);
    const recommendationSet = buildRecommendationSet({ query: promptText, profile, grounding: mergedGrounding });

    const finalPrompt = groundingContext
        ? `${promptText}\n\nGROUNDING_CONTEXT:\n${groundingContext}\n\nGROUNDING_SIGNALS:\n${groundingSignals.join(', ')}\n\nTOOL_PLAN:\n${toolPlan.join(', ')}\n\nRECOMMENDATION_CONTEXT:\n${JSON.stringify(recommendationSet, null, 2)}`
        : `${promptText}\n\nTOOL_PLAN:\n${toolPlan.join(', ')}\n\nRECOMMENDATION_CONTEXT:\n${JSON.stringify(recommendationSet, null, 2)}`;

    const llmResult = await callLlm({
        prompt: `${finalPrompt}\n\nRETRIEVAL_STATUS:\n${JSON.stringify(retrievedGrounding.status || {})}\n${retrievalNotice}`,
        allowTools: !hasRetrieval,
        signal,
        messages: normalizedMessages.length > 0 ? normalizedMessages : undefined,
        systemInstruction: `${SAKHI_SYSTEM_PROMPT}${profileContext ? `\n\nUSER_PROFILE_CONTEXT:\n${profileContext}` : ''}`
    });

    const replyText = typeof llmResult === 'string'
        ? llmResult
        : (llmResult.text || '');

    const qualitySignal = evaluateResponseQuality({
        answer: replyText,
        query: promptText,
        recommendationCount: (llmResult && Array.isArray(llmResult.cards) ? llmResult.cards.length : 0) ||
            ((mergedGrounding.jobs?.length || 0) + (mergedGrounding.courses?.length || 0) + (mergedGrounding.schemes?.length || 0))
    });

    if (!replyText) {
        return createFallbackAiResponse(promptText || 'your request');
    }

    const actions = [
        ...(!hasRetrieval && typeof llmResult === 'object' && Array.isArray(llmResult.actions) ? llmResult.actions : []),
        ...retrievedGrounding.actions
    ].filter((action, index, all) => all.findIndex((item) => item.route === action.route) === index).slice(0, 5);
    const generatedCards = !hasRetrieval && typeof llmResult === 'object' && llmResult.cards ? llmResult.cards : {};
    const cards = {
        jobs: generatedCards.jobs?.length ? rankRecommendations(generatedCards.jobs, profile, promptText) : mergedGrounding.jobs.slice(0, 4),
        courses: generatedCards.courses?.length ? rankRecommendations(generatedCards.courses, profile, promptText) : mergedGrounding.courses.slice(0, 4),
        schemes: generatedCards.schemes?.length ? rankRecommendations(generatedCards.schemes, profile, promptText) : mergedGrounding.schemes.slice(0, 4)
    };

    return {
        message: [replyText, retrievalNotice].filter(Boolean).join('\n\n'),
        actions,
        cards,
        quality: qualitySignal,
        timestamp: new Date().toISOString()
    };
};

