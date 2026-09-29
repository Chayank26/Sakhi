import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const uploadRoot = path.resolve(process.env.UPLOAD_DIR || fileURLToPath(new URL('../uploads/', import.meta.url)));
export function validateRuntime(env = process.env) {
    if (env.TRUST_PROXY && !['loopback', 'linklocal', 'uniquelocal'].includes(env.TRUST_PROXY) && !/^\d+$/.test(env.TRUST_PROXY)) throw new Error('TRUST_PROXY must be an explicit hop count or trusted network name.');
    if (env.NODE_ENV !== 'production') return;
    for (const key of ['MONGODB_URI', 'FRONTEND_URL', 'PUBLIC_API_ORIGIN', 'UPLOAD_DIR']) if (!env[key]) throw new Error(`${key} is required in production.`);
    if (!env.FIREBASE_PROJECT_ID && !env.FIREBASE_SERVICE_ACCOUNT_KEY) throw new Error('Firebase Admin configuration is required in production.');
    for (const key of ['FRONTEND_URL', 'CLIENT_URL', 'PUBLIC_API_ORIGIN']) {
        if (!env[key]) continue;
        const url = new URL(env[key]);
        if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error(`${key} must be an HTTPS origin.`);
    }
    if (!path.isAbsolute(env.UPLOAD_DIR)) throw new Error('UPLOAD_DIR must be an absolute path to persistent storage.');
}
