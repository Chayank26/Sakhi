import { searchJobsToolHandler } from '../ai/tools/jobTool.js';
import { searchCoursesToolHandler } from '../ai/tools/courseTool.js';
import { searchGovernmentSchemesToolHandler } from '../ai/tools/schemeTool.js';

const DOMAIN_PATTERNS = {
    jobs: /\b(job|jobs|career|careers|hiring|hire|employment|vacanc|work|role|salary|resume)\b/i,
    courses: /\b(course|courses|learn|learning|class|classes|certif|skill|skills|academy|training)\b/i,
    schemes: /\b(scheme|schemes|grant|grants|loan|loans|scholarship|scholarships|benefit|benefits|subsid|maternity|welfare)\b/i
};

const getLatestUserQuery = (message, messages) => {
    if (typeof message === 'string' && message.trim()) return message.trim();
    if (!Array.isArray(messages)) return '';

    return [...messages]
        .reverse()
        .find((entry) => entry?.role === 'user' && typeof entry.content === 'string' && entry.content.trim())
        ?.content.trim() || '';
};

const retrieveDomain = async (domain, query) => {
    if (domain === 'jobs') return searchJobsToolHandler({ keyword: query });
    if (domain === 'courses') return searchCoursesToolHandler({ query });
    return searchGovernmentSchemesToolHandler({ query });
};

export const retrieveGroundingData = async ({ message, messages } = {}) => {
    const query = getLatestUserQuery(message, messages);
    const domains = Object.entries(DOMAIN_PATTERNS)
        .filter(([, pattern]) => pattern.test(query))
        .map(([domain]) => domain);

    if (!query || domains.length === 0) {
        return { query, domains: [], jobs: [], courses: [], schemes: [], actions: [] };
    }

    const results = await Promise.allSettled(domains.map((domain) => retrieveDomain(domain, query)));
    const grounding = { query, domains, jobs: [], courses: [], schemes: [], actions: [] };

    results.forEach((result) => {
        if (result.status !== 'fulfilled' || !result.value?.success) return;

        const data = result.value;
        if (Array.isArray(data.jobs)) grounding.jobs.push(...data.jobs);
        if (Array.isArray(data.courses)) grounding.courses.push(...data.courses);
        if (Array.isArray(data.schemes)) grounding.schemes.push(...data.schemes);
        if (data.action) grounding.actions.push(data.action);
    });

    return {
        ...grounding,
        jobs: grounding.jobs.slice(0, 6),
        courses: grounding.courses.slice(0, 6),
        schemes: grounding.schemes.slice(0, 6),
        actions: grounding.actions.slice(0, 3)
    };
};