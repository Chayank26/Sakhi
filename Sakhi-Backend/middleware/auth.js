import 'dotenv/config';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let configured = false;
try {
    if (!getApps().length) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
        } else if (process.env.FIREBASE_PROJECT_ID) {
            initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
        }
    }
    configured = getApps().length > 0;
} catch {
    console.warn('[Auth] Firebase Admin configuration is invalid. Protected routes are unavailable.');
}

export function createTokenMiddleware({ verify = configured ? token => getAuth().verifyIdToken(token) : null, optional = false } = {}) {
    return async (req, res, next) => {
        req.user = null;
        const match = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
        if (!match) return optional ? next() : res.status(401).json({ success: false, message: 'Sign in to continue.' });
        if (!verify) return optional ? next() : res.status(503).json({ success: false, message: 'Authentication service is not configured.' });
        try {
            const token = await verify(match[1]);
            if (!token.uid) throw new Error('Missing identity');
            req.user = {
                uid: token.uid, email: token.email,
                name: token.name || token.email?.split('@')[0] || 'Sakhi Member',
                avatar: token.picture || null, role: token.role || 'Community Member',
            };
            return next();
        } catch {
            return optional ? next() : res.status(401).json({ success: false, message: 'Authentication failed. Please sign in again.' });
        }
    };
}
export const verifyToken = createTokenMiddleware();
export const optionalToken = createTokenMiddleware({ optional: true });
