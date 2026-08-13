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

    const {
        age,
        gender = 'Female',
        state = 'All India',
        occupation,
        isPregnant = false,
        hasGirlChild = false,
        annualIncome
    } = userProfile;

    const matchedCriteria = [];
    const missingCriteria = [];
    let matchScore = 70; // Base score for Sakhi platform users

    // Category & Target Audience Checks
    if (scheme.category === 'Maternity' && !isPregnant) {
        missingCriteria.push('Scheme is designed for pregnant women and lactating mothers.');
        matchScore -= 30;
    } else if (scheme.category === 'Maternity' && isPregnant) {
        matchedCriteria.push('User meets maternity status criteria.');
        matchScore += 20;
    }

    if (scheme.category === 'Entrepreneurship' && occupation === 'Entrepreneur') {
        matchedCriteria.push('User matches entrepreneurship focus.');
        matchScore += 20;
    }

    // State check
    if (scheme.state !== 'All India' && state !== 'All India' && scheme.state !== state) {
        missingCriteria.push(`Scheme is restricted to residents of ${scheme.state}.`);
        matchScore -= 40;
    } else {
        matchedCriteria.push(`State eligibility confirmed (${scheme.state}).`);
    }

    // Age check
    if (age && age >= 18) {
        matchedCriteria.push('Adult age requirement satisfied.');
    }

    const isEligible = matchScore >= 60;

    return {
        scheme: formatSchemeForAiPayload(scheme),
        userProfile,
        isEligible,
        matchScore: Math.min(100, Math.max(10, matchScore)),
        matchedCriteria,
        missingCriteria,
        aiRecommendation: isEligible
            ? `Based on your profile, you appear highly eligible for ${scheme.name}. We recommend applying via the official portal.`
            : `You may have missing requirements for ${scheme.name}. Please review the document checklist.`
    };
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
