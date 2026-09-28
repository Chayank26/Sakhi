export const buildProfileContext = (profile = {}) => {
    if (!profile || typeof profile !== 'object') return '';

    const fields = [];

    const name = typeof profile.name === 'string' ? profile.name.trim() : '';
    const age = profile.age || profile.ageRange || '';
    const city = typeof profile.city === 'string' ? profile.city.trim() : '';
    const goal = typeof profile.goal === 'string' ? profile.goal.trim() : '';
    const interests = Array.isArray(profile.interests)
        ? profile.interests.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
        : [];
    const email = typeof profile.email === 'string' ? profile.email.trim() : '';
    const skills = Array.isArray(profile.skills)
        ? profile.skills.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
        : [];

    if (name) fields.push(`User name: ${name}`);
    if (age) fields.push(`Age: ${age}`);
    if (city) fields.push(`City: ${city}`);
    if (goal) fields.push(`Career goal: ${goal}`);
    if (interests.length > 0) fields.push(`Interests: ${interests.join(', ')}`);
    if (skills.length > 0) fields.push(`Skills: ${skills.join(', ')}`);
    if (profile.jobType) fields.push(`Work preference: ${profile.jobType}`);
    if (profile.level) fields.push(`Learning level: ${profile.level}`);
    if (email) fields.push(`Email: ${email}`);

    return fields.length > 0 ? `User profile context:\n- ${fields.join('\n- ')}` : '';
};

// Only recommendation preferences reach the model; contact details and client-supplied IDs do not.
export const normalizeAiProfile = (value = {}) => {
    const profile = value && typeof value === 'object' ? value : {};
    const text = (value) => typeof value === 'string' ? value.trim().slice(0, 160) : '';
    const list = (value) => Array.isArray(value) ? [...new Set(value.map(text).filter(Boolean))].slice(0, 20) : [];
    return { city: text(profile.city), goal: text(profile.goal), skills: list(profile.skills),
        interests: list(profile.interests), jobType: text(profile.jobType), level: text(profile.level) };
};
