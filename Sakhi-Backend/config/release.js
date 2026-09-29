import { validateRuntime } from './runtime.js';

export function releaseConfigErrors(env) {
    const errors = [];
    try { validateRuntime({ ...env, NODE_ENV: 'production' }); }
    catch (error) { errors.push(error.message.startsWith('Invalid URL') ? 'Production origins must be valid HTTPS origins.' : error.message); }
    for (const key of ['MONGODB_URI', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL', 'TRUST_PROXY']) {
        if (!env[key]?.trim() || /your[_-]|<(?:username|password|cluster)>|placeholder/i.test(env[key])) errors.push(`${key} must be explicitly configured for release.`);
    }
    if (env.SMTP_PORT && (!/^\d+$/.test(env.SMTP_PORT) || Number(env.SMTP_PORT) < 1 || Number(env.SMTP_PORT) > 65535)) errors.push('SMTP_PORT must be a valid port number.');
    if (env.MONGODB_URI && !/^mongodb(?:\+srv)?:\/\//.test(env.MONGODB_URI)) errors.push('MONGODB_URI must be a MongoDB connection URI.');
    return errors;
}
