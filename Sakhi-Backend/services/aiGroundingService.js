export const extractGroundingSignals = (query = '', profile = {}) => {
    const normalizedQuery = typeof query === 'string' ? query.trim() : '';
    const keywords = new Set();

    if (normalizedQuery) {
        normalizedQuery
            .split(/[^a-zA-Z0-9]+/)
            .filter(Boolean)
            .forEach((token) => keywords.add(token.toLowerCase()));
    }

    const profileFields = [
        profile.goal,
        profile.city,
        profile.interests,
        profile.skills,
        profile.level,
        profile.jobType,
        profile.category
    ];

    profileFields.flat().forEach((field) => {
        if (typeof field === 'string' && field.trim()) {
            field.split(/[^a-zA-Z0-9]+/)
                .filter(Boolean)
                .forEach((token) => keywords.add(token.toLowerCase()));
        }
    });

    return Array.from(keywords).slice(0, 25);
};

export const buildGroundingContext = (data = {}) => {
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    const courses = Array.isArray(data.courses) ? data.courses : [];
    const schemes = Array.isArray(data.schemes) ? data.schemes : [];

    const jobSummary = jobs.slice(0, 4).map((job) => {
        const title = job.title || 'Untitled job';
        const company = job.company || 'Unknown company';
        const location = job.location || 'Location not specified';
        return `Job: ${title} | Company: ${company} | Location: ${location}`;
    }).join('\n');

    const courseSummary = courses.slice(0, 4).map((course) => {
        const title = course.title || 'Untitled course';
        const category = course.category || 'General';
        return `Course: ${title} | Category: ${category}`;
    }).join('\n');

    const schemeSummary = schemes.slice(0, 4).map((scheme) => {
        const name = scheme.name || 'Untitled scheme';
        const category = scheme.category || 'General';
        return `Scheme: ${name} | Category: ${category}`;
    }).join('\n');

    const parts = [];
    if (jobSummary) parts.push(`Relevant jobs:\n${jobSummary}`);
    if (courseSummary) parts.push(`Relevant courses:\n${courseSummary}`);
    if (schemeSummary) parts.push(`Relevant schemes:\n${schemeSummary}`);

    return parts.join('\n\n');
};
