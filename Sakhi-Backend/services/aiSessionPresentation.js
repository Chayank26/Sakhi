export const publicAiSession = (session) => {
    if (!session) return undefined;
    const value = typeof session.toObject === 'function' ? session.toObject() : session;
    return { ...value, messages: (value.messages || []).map(({ quality, ...message }) => message) };
};
