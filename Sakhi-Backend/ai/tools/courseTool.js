import mongoose from 'mongoose';
import { Course } from '../../models/Course.js';

/**
 * Sakhi AI Course Search Tool Handler
 * Executes database query against MongoDB Course collection (Sakhi Academy) for searchCourses tool calls.
 *
 * @param {Object} args - Filter parameters passed by Gemini agent
 * @param {string} [args.query] - Search term or topic keyword (e.g., React, Python, Data, AI, Design)
 * @param {string} [args.category] - Course category (e.g., Web Development, AI & Machine Learning, Finance)
 * @param {string} [args.difficulty] - Course difficulty level (e.g., Beginner, Intermediate, Advanced)
 * @param {string} [args.duration] - Estimated completion time
 * @returns {Promise<Object>} Structured MongoDB course search results
 */
export const searchCoursesToolHandler = async (args = {}) => {
    try {
        const { query, category, difficulty } = args;

        const isDbConnected = mongoose.connection.readyState === 1;

        if (!isDbConnected) {
            console.warn('[Course Tool]: Mongoose is not connected. Returning empty dataset.');
            return {
                success: false,
                totalFound: 0,
                courses: [],
                message: 'Database connection currently unavailable.'
            };
        }

        const queryConditions = {};
        const andConditions = [];

        // 1. Topic / search query search across title, description, category, instructor
        if (query && typeof query === 'string' && query.trim()) {
            const qRegex = new RegExp(query.trim(), 'i');
            andConditions.push({
                $or: [
                    { title: qRegex },
                    { description: qRegex },
                    { category: qRegex },
                    { instructor: qRegex },
                    { learningOutcomes: qRegex }
                ]
            });
        }

        // 2. Category filter
        if (category && typeof category === 'string' && category.trim()) {
            const catRegex = new RegExp(category.trim(), 'i');
            andConditions.push({ category: catRegex });
        }

        // 3. Difficulty level filter
        if (difficulty && typeof difficulty === 'string' && difficulty.trim()) {
            const diffRegex = new RegExp(difficulty.trim(), 'i');
            andConditions.push({ difficulty: diffRegex });
        }

        if (andConditions.length > 0) {
            queryConditions.$and = andConditions;
        }

        // Query MongoDB Course collection
        let dbCourses = await Course.find(queryConditions)
            .sort({ rating: -1, createdAt: -1 })
            .limit(6)
            .lean();

        // Fallback: If strict query returns 0 results, return top rated Sakhi Academy courses
        if (dbCourses.length === 0 && (query || category || difficulty)) {
            console.log('[Course Tool]: Specific query yielded 0 results. Returning recommended top courses.');
            dbCourses = await Course.find({})
                .sort({ rating: -1 })
                .limit(4)
                .lean();
        }

        // Format clean, structured data for LLM consumption
        const formattedCourses = dbCourses.map((c) => ({
            courseId: c._id.toString(),
            title: c.title,
            instructor: c.instructor,
            category: c.category,
            difficulty: c.difficulty,
            duration: c.duration,
            price: c.price === 0 ? 'Free' : `₹${c.price}`,
            rating: c.rating,
            studentsEnrolled: c.studentsEnrolled || 0,
            description: c.description ? c.description.slice(0, 150) + '...' : ''
        }));

        console.log(`[Course Tool]: Query executed successfully. Found ${formattedCourses.length} matching courses.`);

        return {
            success: true,
            totalFound: formattedCourses.length,
            searchCriteria: args,
            courses: formattedCourses
        };
    } catch (error) {
        console.error('[Course Tool Error]: Failed to query MongoDB Courses:', error);
        return {
            success: false,
            totalFound: 0,
            courses: [],
            error: error.message
        };
    }
};
