import mongoose from 'mongoose';
import GovernmentScheme from '../../models/GovernmentScheme.js';

/**
 * Sakhi AI Government Schemes Search Tool Handler
 * Executes database query against MongoDB GovernmentScheme collection for searchGovernmentSchemes tool calls.
 *
 * @param {Object} args - Filter parameters passed by Gemini agent
 * @param {string} [args.query] - Search keyword or topic (e.g., entrepreneurship, maternity, loan, education)
 * @param {string} [args.category] - Category (e.g., Entrepreneurship, Maternity, Financial Assistance, Education, Safety)
 * @param {string} [args.state] - Target state (e.g., All India, Tamil Nadu, Uttar Pradesh)
 * @param {string} [args.governmentLevel] - Level of government (Central or State)
 * @param {string} [args.targetAudience] - Target demographic group
 * @returns {Promise<Object>} Structured MongoDB Government Scheme search results
 */
export const searchGovernmentSchemesToolHandler = async (args = {}) => {
    try {
        const { query, category, state, governmentLevel } = args;

        const isDbConnected = mongoose.connection.readyState === 1;

        if (!isDbConnected) {
            console.warn('[Scheme Tool]: Mongoose is not connected. Returning empty dataset.');
            return {
                success: false,
                totalFound: 0,
                schemes: [],
                message: 'Database connection currently unavailable.'
            };
        }

        const queryConditions = {};
        const andConditions = [];

        // 1. Keyword search across name, shortDescription, fullDescription, category, ministry, tags, benefits, eligibility
        if (query && typeof query === 'string' && query.trim()) {
            const qRegex = new RegExp(query.trim(), 'i');
            andConditions.push({
                $or: [
                    { name: qRegex },
                    { shortDescription: qRegex },
                    { fullDescription: qRegex },
                    { category: qRegex },
                    { ministry: qRegex },
                    { tags: qRegex },
                    { benefits: qRegex },
                    { eligibility: qRegex }
                ]
            });
        }

        // 2. Category filter
        if (category && typeof category === 'string' && category.trim()) {
            const catRegex = new RegExp(category.trim(), 'i');
            andConditions.push({ category: catRegex });
        }

        // 3. Government Level filter (Central vs State)
        if (governmentLevel && typeof governmentLevel === 'string' && governmentLevel.trim()) {
            const levelRegex = new RegExp(governmentLevel.trim(), 'i');
            andConditions.push({ governmentLevel: levelRegex });
        }

        // 4. State filter
        if (state && typeof state === 'string' && state.trim()) {
            const stateRegex = new RegExp(state.trim(), 'i');
            andConditions.push({
                $or: [
                    { state: stateRegex },
                    { state: 'All India' }
                ]
            });
        }

        if (andConditions.length > 0) {
            queryConditions.$and = andConditions;
        }

        // Query MongoDB GovernmentScheme collection
        let dbSchemes = await GovernmentScheme.find(queryConditions)
            .sort({ featured: -1, createdAt: -1 })
            .limit(6)
            .lean();

        // Fallback: If query returned 0 results, query top featured central schemes
        if (dbSchemes.length === 0 && (query || category || state || governmentLevel)) {
            console.log('[Scheme Tool]: Specific query yielded 0 results. Returning recommended central schemes.');
            dbSchemes = await GovernmentScheme.find({})
                .sort({ featured: -1 })
                .limit(4)
                .lean();
        }

        // Format clean, structured data for LLM consumption
        const formattedSchemes = dbSchemes.map((s) => ({
            schemeId: s._id.toString(),
            name: s.name,
            category: s.category,
            governmentLevel: s.governmentLevel,
            state: s.state,
            ministry: s.ministry || '',
            shortDescription: s.shortDescription,
            benefits: s.benefits || [],
            eligibility: s.eligibility || [],
            applicationUrl: s.applicationUrl || s.officialWebsite || '',
            officialWebsite: s.officialWebsite || s.applicationUrl || ''
        }));

        console.log(`[Scheme Tool]: Query executed successfully. Found ${formattedSchemes.length} matching schemes.`);

        return {
            success: true,
            totalFound: formattedSchemes.length,
            searchCriteria: args,
            schemes: formattedSchemes
        };
    } catch (error) {
        console.error('[Scheme Tool Error]: Failed to query MongoDB GovernmentSchemes:', error);
        return {
            success: false,
            totalFound: 0,
            schemes: [],
            error: error.message
        };
    }
};
