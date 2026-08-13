import GovernmentScheme from '../models/GovernmentScheme.js';

/**
 * Service Layer Abstraction for Government Schemes Data Access
 * Decouples database queries from Express controllers so future official government API sync services
 * can be integrated cleanly without touching controllers or frontend logic.
 */

/**
 * Get schemes with filtering, sorting, and pagination
 */
export const getSchemesService = async (filters = {}, pagination = {}) => {
    const { page = 1, limit = 12, sortBy = 'createdAt' } = pagination;
    const skip = (page - 1) * limit;

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'featured') {
        sortOptions = { featured: -1, createdAt: -1 };
    } else if (sortBy === 'name') {
        sortOptions = { name: 1 };
    } else if (sortBy === 'updatedAt') {
        sortOptions = { updatedAt: -1 };
    }

    const schemes = await GovernmentScheme.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

    const totalSchemes = await GovernmentScheme.countDocuments(filters);

    return {
        schemes,
        totalSchemes,
        page,
        limit,
        totalPages: Math.ceil(totalSchemes / limit) || 1
    };
};

/**
 * Find single scheme by MongoDB ID
 */
export const getSchemeByIdService = async (id) => {
    return await GovernmentScheme.findById(id).lean();
};

/**
 * Search schemes using full-text index or regex matching
 */
export const searchSchemesService = async (searchQuery = '', filters = {}, options = {}) => {
    const { page = 1, limit = 12, sortBy = 'createdAt' } = options;
    const skip = (page - 1) * limit;

    if (!searchQuery.trim()) {
        return getSchemesService(filters, options);
    }

    const trimmedQuery = searchQuery.trim();
    const regexPattern = new RegExp(trimmedQuery, 'i');

    const searchConditions = {
        $or: [
            { name: regexPattern },
            { shortDescription: regexPattern },
            { fullDescription: regexPattern },
            { category: regexPattern },
            { ministry: regexPattern },
            { tags: regexPattern }
        ]
    };

    const finalQuery = Object.keys(filters).length > 0
        ? { $and: [searchConditions, filters] }
        : searchConditions;

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'featured') {
        sortOptions = { featured: -1, createdAt: -1 };
    } else if (sortBy === 'name') {
        sortOptions = { name: 1 };
    } else if (sortBy === 'updatedAt') {
        sortOptions = { updatedAt: -1 };
    }

    const schemes = await GovernmentScheme.find(finalQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

    const totalSchemes = await GovernmentScheme.countDocuments(finalQuery);

    return {
        schemes,
        totalSchemes,
        page,
        limit,
        totalPages: Math.ceil(totalSchemes / limit) || 1
    };
};

/**
 * Get schemes by category
 */
export const getSchemesByCategoryService = async (categoryName, options = {}) => {
    const filters = { category: categoryName };
    return getSchemesService(filters, options);
};
