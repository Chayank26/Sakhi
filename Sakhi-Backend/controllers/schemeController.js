import mongoose from 'mongoose';
import {
    getSchemesService,
    getSchemeByIdService,
    searchSchemesService,
    getSchemesByCategoryService
} from '../services/schemeService.js';

/**
 * GET /api/schemes
 * Fetch list of government schemes with pagination & optional filtering
 */
export const getSchemes = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            governmentLevel,
            state,
            targetAudience,
            featured,
            sortBy = 'createdAt'
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

        const filters = {};

        if (category && category !== 'All') {
            filters.category = category;
        }

        if (governmentLevel && ['Central', 'State'].includes(governmentLevel)) {
            filters.governmentLevel = governmentLevel;
        }

        if (state && state !== 'All') {
            filters.state = state;
        }

        if (targetAudience) {
            filters.targetAudience = targetAudience;
        }

        if (featured === 'true' || featured === true) {
            filters.featured = true;
        }

        const result = await getSchemesService(filters, {
            page: pageNum,
            limit: limitNum,
            sortBy
        });

        res.json({
            success: true,
            count: result.schemes.length,
            totalSchemes: result.totalSchemes,
            page: result.page,
            totalPages: result.totalPages,
            schemes: result.schemes
        });
    } catch (error) {
        console.error('[Scheme Controller] Error fetching schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching government schemes.',
            error: error.message
        });
    }
};

/**
 * GET /api/schemes/:id
 * Fetch single scheme details by MongoDB ObjectId
 */
export const getSchemeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Input validation for MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid scheme ID format: "${id}". Must be a valid 24-character hexadecimal ID.`
            });
        }

        const scheme = await getSchemeByIdService(id);

        if (!scheme) {
            return res.status(404).json({
                success: false,
                message: `Government scheme with ID "${id}" was not found.`
            });
        }

        res.json({
            success: true,
            scheme
        });
    } catch (error) {
        console.error('[Scheme Controller] Error fetching scheme details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching scheme details.',
            error: error.message
        });
    }
};

/**
 * GET /api/schemes/search?q=query
 * Search schemes across title, descriptions, category, ministry, and tags
 */
export const searchSchemes = async (req, res) => {
    try {
        const { q = '', page = 1, limit = 12 } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

        const result = await searchSchemesService(q, {
            page: pageNum,
            limit: limitNum
        });

        res.json({
            success: true,
            query: q,
            count: result.schemes.length,
            totalResults: result.totalSchemes,
            page: result.page,
            totalPages: result.totalPages,
            schemes: result.schemes
        });
    } catch (error) {
        console.error('[Scheme Controller] Error searching schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching government schemes.',
            error: error.message
        });
    }
};

/**
 * GET /api/schemes/category/:category
 * Fetch schemes belonging to a specific category
 */
export const getSchemesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const decodedCategory = decodeURIComponent(category);
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

        const result = await getSchemesByCategoryService(decodedCategory, {
            page: pageNum,
            limit: limitNum
        });

        res.json({
            success: true,
            category: decodedCategory,
            count: result.schemes.length,
            totalSchemes: result.totalSchemes,
            page: result.page,
            totalPages: result.totalPages,
            schemes: result.schemes
        });
    } catch (error) {
        console.error('[Scheme Controller] Error fetching category schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching schemes by category.',
            error: error.message
        });
    }
};
