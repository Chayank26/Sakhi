import { searchJobsToolHandler } from '../ai/tools/jobTool.js';
import { searchCoursesToolHandler } from '../ai/tools/courseTool.js';
import { searchGovernmentSchemesToolHandler } from '../ai/tools/schemeTool.js';
import { buildSearchIntent } from './aiSearchIntent.js';

const handlers = { jobs: searchJobsToolHandler, courses: searchCoursesToolHandler, schemes: searchGovernmentSchemesToolHandler };

export const retrieveGroundingData = async (input = {}, tools = handlers) => {
    const intent = buildSearchIntent(input);
    const profile = input.profile || {};
    for (const domain of intent.domains) {
        const filters = intent.filters[domain];
        const topicKey = domain === 'jobs' ? 'keyword' : 'query';
        // Explicit query filters always take precedence over profile defaults.
        if (!filters[topicKey] && domain !== 'schemes') {
            const topic = domain === 'jobs' ? profile.skills?.[0] : (profile.interests?.[0] || profile.skills?.[0]);
            if (topic) filters[topicKey] = topic;
            if (domain === 'jobs') {
                if (filters.location === undefined && profile.city && filters.jobType !== 'Remote' && profile.jobType !== 'Remote') filters.location = profile.city;
                if (!filters.jobType && profile.jobType) filters.jobType = profile.jobType;
            }
            if (domain === 'courses' && !filters.difficulty && profile.level) filters.difficulty = profile.level;
        }
    }
    const grounding = { ...intent, jobs: [], courses: [], schemes: [], actions: [], status: {} };
    const results = await Promise.allSettled(intent.domains.map((domain) => tools[domain](intent.filters[domain])));
    results.forEach((result, index) => {
        const domain = intent.domains[index];
        if (result.status !== 'fulfilled' || !result.value?.success) {
            grounding.status[domain] = 'unavailable';
            return;
        }
        const records = Array.isArray(result.value[domain]) ? result.value[domain] : [];
        grounding[domain] = records.slice(0, 6);
        grounding.status[domain] = records.length ? 'matched' : 'empty';
        if (result.value.action) grounding.actions.push(result.value.action);
    });
    return grounding;
};

export const describeRetrievalStatus = (status = {}) => Object.entries(status).flatMap(([domain, value]) => {
    if (value === 'unavailable') return [`Sakhi ${domain} data is temporarily unavailable. Please try again shortly.`];
    if (value === 'empty') return [`No matching ${domain} were found in Sakhi. Try a broader topic or different filters.`];
    return [];
}).join('\n\n');
