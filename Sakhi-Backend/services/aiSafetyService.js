export const evaluateSafety = (query = '') => {
    const normalized = String(query || '').toLowerCase();

    const unsafePatterns = [
        'harmful',
        'attack',
        'weapon',
        'bomb',
        'self-harm',
        'suicide',
        'illegal activity',
        'fraud',
        'malware',
        'exploit',
        'assault',
        'violent',
        'create harmful'
    ];

    const hasUnsafeContent = unsafePatterns.some((pattern) => normalized.includes(pattern));

    if (hasUnsafeContent) {
        return {
            safe: false,
            reason: 'Request includes unsafe or harmful content and cannot be processed safely.'
        };
    }

    if (!normalized.trim()) {
        return {
            safe: false,
            reason: 'Request is empty and needs a clear question.'
        };
    }

    return {
        safe: true,
        reason: 'Request is within the intended Sakhi assistant use case.'
    };
};
