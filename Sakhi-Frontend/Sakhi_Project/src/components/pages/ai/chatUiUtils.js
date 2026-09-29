export const MAX_CHAT_LENGTH = 6000;
export const shouldSendOnEnter = event => event.key === 'Enter' && !event.shiftKey && !event.nativeEvent?.isComposing && !event.isComposing && event.keyCode !== 229;
export const safeChatRoute = route => typeof route === 'string' && /^\/(?:jobs|academy|schemes|community|profile|support|home)(?:[/?#]|$)/.test(route) && !/[\\\r\n]/.test(route) ? route : null;
export function recommendationRoute(kind, item) {
    const paths = { job: ['/jobs', 'jobId'], course: ['/academy/course', 'courseId'], scheme: ['/schemes', 'schemeId'] };
    const [base, field] = paths[kind];
    const id = item[field] || item._id;
    if (typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)) return `${base}/${id}`;
    const directory = kind === 'course' ? '/academy' : base;
    const query = item.title || item.name || '';
    return query ? `${directory}?q=${encodeURIComponent(query)}` : directory;
}
export const formatCoursePrice = price => price === 0 || String(price).toLowerCase() === 'free' ? 'Free' : typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price || 'See course for pricing';
export const retryDelayMs = (error, now = Date.now()) => {
    const raw = error.response?.data?.retryAfter ?? error.response?.headers?.['retry-after'];
    const seconds = Number(raw);
    if (raw !== undefined && Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
    const date = Date.parse(raw);
    return Number.isFinite(date) ? Math.max(0, date - now) : 0;
};
