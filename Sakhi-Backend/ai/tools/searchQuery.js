// Treat all user/model search text as literal text, never executable regex syntax.
export const literalRegex = (value) => new RegExp(String(value).trim().slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

export const keywordConditions = (value, fields) => {
    if (typeof value !== 'string') return [];
    return value.trim().split(/\s+/).filter(Boolean).slice(0, 8).map((word) => ({
        $or: fields.map((field) => ({ [field]: literalRegex(word) }))
    }));
};
