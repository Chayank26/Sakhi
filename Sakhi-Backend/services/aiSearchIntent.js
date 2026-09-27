export const DOMAIN_PATTERNS = {
    jobs: /\b(jobs?|careers?|hiring|employment|vacanc\w*|work|roles?|salary|resume)\b/i,
    courses: /\b(courses?|learn\w*|classes|class|certif\w*|skills?|academy|training)\b/i,
    schemes: /\b(schemes?|grants?|loans?|scholarships?|benefits?|subsid\w*|maternity|welfare)\b/i
};
const STOP_WORDS = new Set(('a an the i me my we us you please find show recommend search looking look want need available ' +
    'tell about what which are is can could would for to of with and or plus also some any only ones those these them instead just same ' +
    'jobs job careers career hiring openings opening opportunities opportunity roles role work employment courses course ' +
    'learn learning training academy classes class skills skill schemes scheme government women woman female currently ' +
    'remote hybrid full time part internship internships fresher freshers entry level beginner intermediate advanced free paid ' +
    'certificates certificate certifications certification central state in near around how more than under below').split(' '));
const domainsFor = (text) => Object.keys(DOMAIN_PATTERNS).filter((domain) => DOMAIN_PATTERNS[domain].test(text));
const FOLLOW_UP = /^(only|those|these|just|same|what about|how about|in\b|near\b|remote\b|free\b|beginner\b)|\b(instead|ones|them)\b/i;

const extractFilters = (text, domain) => {
    let topic = text.toLowerCase();
    const filters = {};
    if (domain === 'jobs' || domain === 'schemes') {
        const location = topic.match(/\b(?:in|near|around)\s+([a-z]+(?:\s+[a-z]+){0,3})/);
        if (location) {
            const value = location[1].split(/\s+(?:for|with|and|only|instead|jobs?|schemes?|please)\b/)[0].trim();
            if (value) {
                filters[domain === 'jobs' ? 'location' : 'state'] = value;
                topic = topic.replace(value, '');
            }
        }
    }
    if (domain === 'jobs') {
        if (/\bremote\b|work from home/.test(topic)) {
            filters.jobType = 'Remote';
            // A remote refinement replaces the city unless the user supplies a city in this turn.
            if (!filters.location) filters.location = '';
            topic = topic.replace(/work from home/g, '');
        } else if (/\bhybrid\b/.test(topic)) filters.jobType = 'Hybrid';
        else if (/\bpart[- ]time\b/.test(topic)) filters.jobType = 'Part Time';
        else if (/\bfull[- ]time\b/.test(topic)) filters.jobType = 'Full Time';
        else if (/\binternships?\b/.test(topic)) filters.jobType = 'Internship';
        if (/\bfreshers?\b|entry[- ]level/.test(topic)) filters.experience = 'Fresher';
    }
    if (domain === 'courses') {
        const difficulty = topic.match(/\b(beginner|intermediate|advanced)\b/)?.[1];
        if (difficulty) filters.difficulty = difficulty[0].toUpperCase() + difficulty.slice(1);
        if (/\bfree\b/.test(topic)) filters.freeOnly = true;
        if (/\bpaid\b/.test(topic)) filters.freeOnly = false;
        if (/\bcertificat\w*\b/.test(topic)) filters.certificateAvailable = true;
    }
    if (domain === 'schemes') {
        if (/\bcentral\b/.test(topic)) filters.governmentLevel = 'Central';
        if (/\bstate government\b/.test(topic)) filters.governmentLevel = 'State';
    }
    const keywords = [...new Set((topic.match(/[a-z0-9+#.]+/g) || [])
        .map((word) => word.replace(/\.$/, '').replace(/^(scholarship|grant|loan|benefit)s$/, '$1').replace(/^engineering$/, 'engineer'))
        .filter((word) => word && !STOP_WORDS.has(word)))].slice(0, 8);
    if (keywords.length) filters[domain === 'jobs' ? 'keyword' : 'query'] = keywords.join(' ');
    return filters;
};

export const buildSearchIntent = ({ message, messages = [] } = {}) => {
    const turns = messages.filter((entry) => entry?.role === 'user' && typeof entry.content === 'string')
        .map((entry) => entry.content.trim()).filter(Boolean);
    const query = (typeof message === 'string' && message.trim()) || turns.at(-1) || '';
    if (turns.at(-1) !== query && query) turns.push(query);
    let intent = { query, domains: [], filters: {} };
    for (const text of turns) {
        const explicit = domainsFor(text);
        const followUp = FOLLOW_UP.test(text);
        const domains = explicit.length ? explicit : (followUp ? intent.domains : []);
        const clauses = text.split(/\b(?:and|plus|also)\b/i);
        const filters = {};
        for (const domain of domains) {
            const relevant = clauses.filter((clause) => domainsFor(clause).includes(domain));
            const topic = relevant.length && domains.length > 1 ? relevant.join(' ') : text;
            filters[domain] = { ...(followUp ? intent.filters[domain] : {}), ...extractFilters(topic, domain) };
        }
        intent = { query: text, domains, filters };
    }
    return intent;
};
