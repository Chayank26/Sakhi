import { literalRegex, keywordConditions } from './searchQuery.js';
import mongoose from 'mongoose';
import { Job } from '../../models/Job.js';

/**
 * Sakhi AI Job Search Tool Handler
 * Executes database query against MongoDB Job collection for searchJobs tool calls.
 *
 * @param {Object} args - Filter parameters passed by Gemini agent
 * @param {string} [args.keyword] - Job title, skills, or industry keyword
 * @param {string} [args.location] - Target location or city
 * @param {string} [args.salary] - Preferred salary range
 * @param {string} [args.jobType] - Employment type, e.g., Full Time, Part Time, Remote
 * @param {string} [args.experience] - Required experience, e.g., Fresher, 1+, 2+
 * @returns {Promise<Object>} Structured MongoDB job search results
 */
export const searchJobsToolHandler = async (args = {}, { model = Job, isConnected = () => mongoose.connection.readyState === 1 } = {}) => {
    try {
        const { keyword, location, jobType, experience } = args;

        const isDbConnected = isConnected();

        if (!isDbConnected) {
            console.warn('[Job Tool]: Mongoose is not connected. Returning empty dataset.');
            return {
                success: false,
                totalFound: 0,
                jobs: [],
                message: 'Database connection currently unavailable.'
            };
        }

        const queryConditions = {};
        const andConditions = [];

        andConditions.push(...keywordConditions(keyword, ['title', 'company', 'skills', 'industry', 'description']));

        // 2. Location search
        if (location && typeof location === 'string' && location.trim()) {
            const locRegex = literalRegex(location);
            andConditions.push({
                $or: [
                    { location: locRegex },
                    ...(location.toLowerCase().includes('remote') ? [{ remote: true }, { employmentType: 'Remote' }] : [])
                ]
            });
        }

        // 3. Employment Type search
        if (jobType && typeof jobType === 'string' && jobType.trim()) {
            const typeRegex = literalRegex(jobType);
            andConditions.push(jobType.toLowerCase() === 'remote'
                ? { $or: [{ remote: true }, { employmentType: typeRegex }, { location: typeRegex }] }
                : { employmentType: typeRegex });
        }

        // 4. Experience requirement search
        if (experience && typeof experience === 'string' && experience.trim()) {
            const expRegex = literalRegex(experience);
            andConditions.push({ experience: expRegex });
        }

        if (andConditions.length > 0) {
            queryConditions.$and = andConditions;
        }

        // Query MongoDB Job collection
        const dbJobs = await model.find(queryConditions)
            .sort({ createdAt: -1 })
            .limit(6)
            .maxTimeMS(3000)
            .lean();

        // Format clean, structured data for LLM consumption
        const formattedJobs = dbJobs.map((j) => ({
            jobId: j._id.toString(),
            title: j.title,
            company: j.company,
            location: j.location,
            employmentType: j.employmentType,
            salary: j.salary,
            experience: j.experience,
            education: j.education,
            skills: j.skills || [],
            description: j.description ? j.description.slice(0, 150) + '...' : ''
        }));

        // Construct structured navigation action
        const navParams = new URLSearchParams();
        if (keyword) navParams.set('q', keyword);
        if (location) navParams.set('location', location);
        const routeQuery = navParams.toString() ? `?${navParams.toString()}` : '';

        const action = {
            label: `View Jobs ${location ? 'in ' + location : ''}`.trim(),
            type: 'navigation',
            route: `/jobs${routeQuery}`
        };

        console.log(`[Job Tool]: Query executed successfully. Found ${formattedJobs.length} matching jobs.`);

        return {
            success: true,
            totalFound: formattedJobs.length,
            searchCriteria: args,
            jobs: formattedJobs,
            action
        };
    } catch (error) {
        console.error('[Job Tool Error]: Failed to query MongoDB Jobs:', error);
        return {
            success: false,
            totalFound: 0,
            jobs: [],
            error: error.message
        };
    }
};
