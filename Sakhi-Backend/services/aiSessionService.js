export const buildSessionContext = (history = [], limit = 12) => {
    if (!Array.isArray(history)) return [];

    const filtered = history
        .filter((entry) => entry && typeof entry === 'object')
        .filter((entry) => ['user', 'assistant'].includes(entry.role))
        .filter((entry) => typeof entry.content === 'string' && entry.content.trim().length > 0)
        .map((entry) => ({
            role: entry.role,
            content: entry.content.trim()
        }));

    if (filtered.length <= limit) return filtered;

    return filtered.slice(filtered.length - limit);
};

export const generateSessionTitle = (firstUserMessage = '') => {
    const cleaned = String(firstUserMessage || '').trim();

    if (!cleaned) return 'New conversation';

    const title = cleaned.replace(/\s+/g, ' ');

    if (title.length <= 32) return title;

    return `${title.slice(0, 29).trim()}...`;
};
