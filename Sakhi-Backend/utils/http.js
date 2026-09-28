export const endpoint = (handler) => async (req, res, next) => {
    try { await handler(req, res, next); }
    catch (error) {
        const status = error.status || (['ValidationError', 'CastError'].includes(error.name) ? 400 : 500);
        res.status(status).json({ success: false, message: status === 500 ? 'Unable to complete this request. Please retry.' : error.message });
    }
};
export const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
export const validId = (id) => /^[a-f\d]{24}$/i.test(String(id));
export const textField = (value, label, max = 200, required = true) => {
    if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) fail(400, `${label} is required and must be at most ${max} characters.`);
    return value.trim();
};
