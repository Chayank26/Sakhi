import GovernmentScheme from '../models/GovernmentScheme.js';

/**
 * Sakhi AI Integration Service Abstraction Layer
 * Prepares standardized data structures, context payloads, eligibility evaluation logic,
 * and scheme recommendation scoring for the Sakhi AI Assistant.
 */

/**
 * Formats a scheme document into a standardized context payload optimized for Sakhi AI / Gemini LLM
 */
export const formatSchemeForAiPayload = (scheme) => {
    if (!scheme) return null;
    return {
        schemeId: scheme._id || scheme.id,
        name: scheme.name,
        category: scheme.category,
        governmentLevel: scheme.governmentLevel,
        ministry: scheme.ministry || 'N/A',
        state: scheme.state || 'All India',
        summary: scheme.shortDescription,
        description: scheme.fullDescription,
        benefits: scheme.benefits || [],
        eligibilityRules: scheme.eligibility || [],
        requiredDocuments: scheme.documentsRequired || [],
        applicationSteps: scheme.applicationProcess || [],
        officialPortalUrl: scheme.applicationUrl || scheme.officialWebsite || '',
        targetAudience: scheme.targetAudience || [],
        tags: scheme.tags || [],
        lastVerifiedAt: scheme.lastVerifiedAt
    };
};

/**
 * Generates full schemes context payload for Sakhi AI assistant context window
 */
export const buildAllSchemesAiContextService = async (category = null) => {
    const query = category ? { category } : {};
    const schemes = await GovernmentScheme.find(query).lean();
    return schemes.map(formatSchemeForAiPayload);
};

/**
 * Service function to evaluate user profile eligibility against a specific scheme
 */
export const checkSchemeEligibilityService = async (schemeId, userProfile = {}) => {
    const scheme = await GovernmentScheme.findById(schemeId).lean();
    if (!scheme) {
        throw new Error(`Government scheme with ID ${schemeId} not found.`);
    }

    return evaluateSchemeGuidance(scheme, userProfile);

};

/**
 * Service function to recommend top schemes based on user profile
 */
export const recommendSchemesService = async (userProfile = {}, limit = 5) => {
    const allSchemes = await GovernmentScheme.find({}).lean();
    const evaluated = await Promise.all(
        allSchemes.map(async (s) => {
            try {
                return await checkSchemeEligibilityService(s._id, userProfile);
            } catch {
                return null;
            }
        })
    );

    const validEvaluations = evaluated.filter((e) => e !== null);
    validEvaluations.sort((a, b) => b.matchScore - a.matchScore);

    return {
        userProfile,
        totalEvaluated: allSchemes.length,
        recommendedSchemes: validEvaluations.slice(0, limit)
    };
};

// Directory matching is not an eligibility determination.
export function evaluateSchemeGuidance(scheme, userProfile = {}) {
    const state = typeof userProfile.state === 'string' ? userProfile.state.trim() : '';
    const stateMismatch = state && scheme.state && scheme.state !== 'All India' && state.toLowerCase() !== scheme.state.toLowerCase();
    return {
        scheme: formatSchemeForAiPayload(scheme), userProfile,
        isEligible: null, status: 'review_required',
        matchScore: stateMismatch ? 0 : 1, scoreMeaning: 'Directory relevance only; not an eligibility score.',
        matchedCriteria: [],
        missingCriteria: [
            ...(!state ? ['Your state has not been provided.'] : []),
            ...(stateMismatch ? [`This listing is for ${scheme.state}; confirm residence requirements with the issuing authority.`] : []),
            ...(scheme.eligibility || []),
        ],
        aiRecommendation: 'Eligibility has not been determined. Review every listed requirement and verify current rules with the issuing authority.',
    };
}
