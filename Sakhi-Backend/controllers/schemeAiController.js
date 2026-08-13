import mongoose from 'mongoose';
import {
    buildAllSchemesAiContextService,
    checkSchemeEligibilityService,
    recommendSchemesService
} from '../services/schemeAiService.js';

/**
 * GET /api/schemes/ai/context
 * Returns standardized schemes JSON payload for Sakhi AI assistant prompts
 */
export const getAiContextData = async (req, res) => {
    try {
        const { category } = req.query;
        const contextPayload = await buildAllSchemesAiContextService(category);

        res.json({
            success: true,
            purpose: 'Sakhi AI Assistant Context Payload',
            count: contextPayload.length,
            schemes: contextPayload
        });
    } catch (error) {
        console.error('[Scheme AI Controller] Error generating AI context payload:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate AI context payload.',
            error: error.message
        });
    }
};

/**
 * POST /api/schemes/ai/check-eligibility
 * Evaluates applicant user profile against scheme criteria
 */
export const checkEligibility = async (req, res) => {
    try {
        const { schemeId, userProfile } = req.body;

        if (!schemeId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: schemeId'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(schemeId)) {
            return res.status(400).json({
                success: false,
                message: `Invalid schemeId format: "${schemeId}"`
            });
        }

        const evaluation = await checkSchemeEligibilityService(schemeId, userProfile || {});

        res.json({
            success: true,
            evaluation
        });
    } catch (error) {
        console.error('[Scheme AI Controller] Error evaluating scheme eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking scheme eligibility.',
            error: error.message
        });
    }
};

/**
 * POST /api/schemes/ai/recommend
 * Recommends top matching schemes for a user profile
 */
export const recommendSchemes = async (req, res) => {
    try {
        const { userProfile, limit = 5 } = req.body;

        const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10) || 5));
        const result = await recommendSchemesService(userProfile || {}, limitNum);

        res.json({
            success: true,
            recommendations: result
        });
    } catch (error) {
        console.error('[Scheme AI Controller] Error generating scheme recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating scheme recommendations.',
            error: error.message
        });
    }
};
