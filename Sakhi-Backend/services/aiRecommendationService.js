const includes = (text, value) => {
    if (typeof value !== 'string' || !value.trim()) return false;
    const literal = value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[^a-z0-9])${literal}(?:$|[^a-z0-9])`, 'i').test(text);
};

export const rankRecommendations = (records = [], profile = {}, query = '') => records.map((record, index) => {
    const text = [record.title, record.name, record.category, record.description, record.shortDescription, ...(record.skills || [])].filter(Boolean).join(' ').toLowerCase();
    const reasons = [];
    const skills = (profile.skills || []).filter((skill) => includes(text, skill));
    const interests = (profile.interests || []).filter((interest) => includes(text, interest));
    if (skills.length) reasons.push(`Matches your skills: ${skills.join(', ')}.`);
    if (interests.length) reasons.push(`Matches your interests: ${interests.join(', ')}.`);
    const goalTerms = (profile.goal || '').toLowerCase().split(/\W+/).filter((term) => term.length > 3);
    if (goalTerms.some((term) => text.includes(term))) reasons.push(`Related to your goal: ${profile.goal}.`);
    const location = String(record.location || record.state || '').toLowerCase();
    if (includes(location, profile.city)) reasons.push(`Located in your preferred area: ${profile.city}.`);
    if (profile.level && record.difficulty?.toLowerCase() === profile.level.toLowerCase()) reasons.push(`Matches your ${profile.level.toLowerCase()} learning level.`);
    const score = skills.length * 3 + interests.length * 2 + reasons.length;
    return { ...record, recommendationReason: reasons.join(' ') || (query ? 'Matches the current search filters.' : 'Available in Sakhi.'), _rank: score, _position: index };
}).sort((a, b) => b._rank - a._rank || a._position - b._position).map(({ _rank, _position, ...record }) => record);

export const buildRecommendationSet = ({ query = '', profile = {}, grounding = {} }) => {
    const recommendations = ['jobs', 'courses', 'schemes'].flatMap((domain) => rankRecommendations(grounding[domain] || [], profile, query).slice(0, 4).map((record) => ({
        type: ({ jobs: 'job', courses: 'course', schemes: 'scheme' })[domain],
        title: record.title || record.name,
        detail: record.company || record.category || '',
        location: record.location || record.state || '',
        reason: record.recommendationReason
    })));
    return { query, recommendations: recommendations.length ? recommendations : [{ type: 'general', title: 'Ask a more specific question', reason: 'Tell me your goal, city, or area of interest.' }] };
};
