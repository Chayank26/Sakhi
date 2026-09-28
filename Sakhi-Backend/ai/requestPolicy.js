const boundedNumber = (value, fallback, min, max) => {
    const parsed = value === undefined || value === '' ? fallback : Number(value);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.floor(parsed))) : fallback;
};
export const getAiRequestPolicy = (env = process.env) => ({
    timeoutMs: boundedNumber(env.GEMINI_TIMEOUT_MS || env.AI_TIMEOUT_MS, 45000, 1000, 45000),
    maxRetries: boundedNumber(env.GEMINI_MAX_RETRIES ?? env.AI_MAX_RETRIES, 1, 0, 2)
});
export const errorStatus = (error) => Number(error.status || error.statusCode || error.response?.status) || 0;
export const isTransientError = (error) => [408, 500, 502, 503, 504].includes(errorStatus(error)) ||
    (!errorStatus(error) && (['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'].includes(error.code || error.cause?.code) ||
        error.name === 'TimeoutError' || (error instanceof TypeError && /fetch failed/i.test(error.message))));
const timeoutError = () => Object.assign(new Error('Sakhi AI took too long to respond. Please try again.'), { statusCode: 504 });

export const withRequestDeadline = async (operation, timeoutMs, parentSignal) => {
    const controller = new AbortController();
    let timer;
    const deadline = Date.now() + timeoutMs;
    let rejectCancellation;
    const cancelled = new Promise((_, reject) => { rejectCancellation = reject; });
    const onAbort = () => { controller.abort(); rejectCancellation(Object.assign(new Error('Request cancelled'), { name: 'AbortError' })); };
    parentSignal?.addEventListener('abort', onAbort, { once: true });
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(timeoutError()); }, timeoutMs);
    });
    try {
        if (parentSignal?.aborted) onAbort();
        return await Promise.race([cancelled, operation({ signal: controller.signal, remaining: () => Math.max(0, deadline - Date.now()) }), timeout]);
    } finally {
        parentSignal?.removeEventListener('abort', onAbort);
        clearTimeout(timer);
        controller.abort();
    }
};

export const createWithRetry = async (create, payload, budget, { maxRetries, delayMs = 500 }) => {
    for (let attempt = 0; ; attempt++) {
        if (budget.signal.aborted || budget.remaining() <= 0) throw timeoutError();
        try {
            return await create(payload, {
                timeout: budget.remaining(), maxRetries: 0,
                fetch_options: { signal: budget.signal }
            });
        } catch (error) {
            if (budget.signal.aborted) throw timeoutError();
            if (attempt >= maxRetries || !isTransientError(error)) throw error;
            const delay = delayMs * (2 ** attempt);
            if (budget.remaining() <= delay) throw timeoutError();
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
};

export const formatAiError = (error) => {
    const status = errorStatus(error);
    if (status === 429) {
        const header = error.headers?.get?.('retry-after') || error.headers?.['retry-after'];
        const seconds = Number(header) || Math.ceil((Date.parse(header) - Date.now()) / 1000) ||
            Number(error.message?.match(/retry in\s+([\d.]+)s/i)?.[1]) || 30;
        const retryAfter = Math.min(3600, Math.max(1, Math.ceil(seconds)));
        return Object.assign(new Error(`AI service is busy or its quota has been reached. Please try again in about ${retryAfter} seconds.`), { statusCode: 429, retryAfter });
    }
    if (status === 504 || error.name === 'AbortError' || error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') return timeoutError();
    if ([401, 403, 404].includes(status)) return Object.assign(new Error('Sakhi AI is temporarily unavailable due to a service configuration issue. Please try again later.'), { statusCode: 503 });
    return Object.assign(new Error('Sakhi AI is temporarily unavailable. Please try again shortly.'), { statusCode: status === 400 ? 502 : 503 });
};
