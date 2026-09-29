import { randomUUID } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';

export const requestContext = (req, res, next) => {
    req.requestId = randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    res.setHeader('Cache-Control', 'no-store');
    next();
};

export function corsOptions(env = process.env) {
    const configured = [env.FRONTEND_URL, env.CLIENT_URL].filter(Boolean).map(value => new URL(value).origin);
    const origins = new Set([...configured, ...(env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'])]);
    return {
        origin(origin, callback) {
            if (!origin || origins.has(origin)) return callback(null, true);
            callback(Object.assign(new Error('Origin is not allowed.'), { status: 403 }));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type'],
        exposedHeaders: ['Retry-After', 'RateLimit', 'X-Request-Id'],
        maxAge: 600,
    };
}

export const createLimiter = (limit, windowMs = 60_000) => rateLimit({
    windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please wait and try again.' },
});
export const aiLimiter = createLimiter(12);
export const uploadLimiter = createLimiter(20, 15 * 60_000);
export const writeLimiter = createLimiter(60);

// Extended query parsing is needed for Axios filter arrays, but nested operators are never accepted.
export function validateQuery(req, res, next) {
    const arrayFields = new Set(['category', 'difficulty', 'language', 'salaryRange', 'experience', 'jobType', 'education', 'industry', 'duration']);
    for (const [key, value] of Object.entries(req.query)) {
        const values = Array.isArray(value) && arrayFields.has(key) ? value : [value];
        if (key.startsWith('$') || key.includes('.') || ['__proto__', 'constructor', 'prototype'].includes(key) || values.length > 20 || values.some(item => typeof item !== 'string' || item.length > 500)) {
            return res.status(400).json({ success: false, message: 'Invalid query parameters.' });
        }
        if (['page', 'limit'].includes(key) && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > (key === 'page' ? 10000 : 100))) {
            return res.status(400).json({ success: false, message: 'Invalid pagination parameters.' });
        }
    }
    next();
}

export function validPayload(value, depth = 0) {
    if (depth > 8) return false;
    if (typeof value === 'string') return value.length <= 30000;
    if (typeof value === 'number') return Number.isFinite(value);
    if (value === null || typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length <= 100 && value.every(item => validPayload(item, depth + 1));
    if (!value || typeof value !== 'object') return false;
    return Object.entries(value).every(([key, item]) => key.length <= 100 && !key.startsWith('$') && !key.includes('.') && !['__proto__', 'constructor', 'prototype'].includes(key) && validPayload(item, depth + 1));
}
export function validateBody(req, res, next) {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || !validPayload(req.body)) {
        return res.status(400).json({ success: false, message: 'Invalid request body.' });
    }
    next();
}

export function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);
    const status = error.type === 'entity.too.large' || error.code === 'LIMIT_FILE_SIZE' ? 413
        : error.type === 'entity.parse.failed' || error.name === 'MulterError' ? 400
            : [400, 401, 403, 404, 409, 415, 429, 503].includes(error.status) ? error.status : 500;
    const messages = { 401: 'Authentication required.', 403: 'Access denied.', 404: 'Resource not found.', 409: 'Request conflicts with the current state.', 429: 'Too many requests.', 503: 'Service temporarily unavailable.', 400: 'Invalid request.', 413: 'Request or file is too large.', 415: 'Unsupported content type.', 500: 'Unable to complete this request. Please retry.' };
    res.status(status).json({ success: false, message: messages[status] || error.message, requestId: req.requestId });
}
