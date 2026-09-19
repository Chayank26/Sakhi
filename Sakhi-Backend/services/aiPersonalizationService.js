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
    if (email) fields.push(`Email: ${email}`);

    return fields.length > 0 ? `User profile context:\n- ${fields.join('\n- ')}` : '';
};
