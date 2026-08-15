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
export const searchJobsToolHandler = async (args = {}) => {
    try {
        const { keyword, location, jobType, experience } = args;

        const isDbConnected = mongoose.connection.readyState === 1;

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

        // 1. Keyword search across title, company, skills, industry, description
        if (keyword && typeof keyword === 'string' && keyword.trim()) {
            const kwRegex = new RegExp(keyword.trim(), 'i');
            andConditions.push({
                $or: [
                    { title: kwRegex },
                    { company: kwRegex },
                    { skills: kwRegex },
                    { industry: kwRegex },
                    { description: kwRegex }
                ]
            });
        }

        // 2. Location search
        if (location && typeof location === 'string' && location.trim()) {
            const locRegex = new RegExp(location.trim(), 'i');
            andConditions.push({
                $or: [
                    { location: locRegex },
                    ...(location.toLowerCase().includes('remote') ? [{ remote: true }, { employmentType: 'Remote' }] : [])
                ]
            });
        }

        // 3. Employment Type search
        if (jobType && typeof jobType === 'string' && jobType.trim()) {
            const typeRegex = new RegExp(jobType.trim(), 'i');
            andConditions.push({ employmentType: typeRegex });
        }

        // 4. Experience requirement search
        if (experience && typeof experience === 'string' && experience.trim()) {
            const expRegex = new RegExp(experience.trim(), 'i');
            andConditions.push({ experience: expRegex });
        }

        if (andConditions.length > 0) {
            queryConditions.$and = andConditions;
        }

        // Query MongoDB Job collection
        const dbJobs = await Job.find(queryConditions)
            .sort({ createdAt: -1 })
            .limit(6)
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

        console.log(`[Job Tool]: Query executed successfully. Found ${formattedJobs.length} matching jobs.`);

        return {
            success: true,
            totalFound: formattedJobs.length,
            searchCriteria: args,
            jobs: formattedJobs
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
