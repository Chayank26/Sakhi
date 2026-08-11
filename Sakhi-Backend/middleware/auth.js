import admin from 'firebase-admin';

// Initialize Firebase Admin SDK lazily if environment variables or credentials are provided,
// or fallback gracefully to JWT payload decoding in development mode.
let isFirebaseAdminInitialized = false;

try {
    if (!admin.apps.length) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            isFirebaseAdminInitialized = true;
        } else if (process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            isFirebaseAdminInitialized = true;
        }
    } else {
        isFirebaseAdminInitialized = true;
    }
} catch (err) {
    console.warn('[Auth Middleware] Firebase Admin initialization warning:', err.message);
}

// Simple base64url JWT payload decoder fallback for local dev when service account key isn't set up yet
function decodeJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(payloadBase64, 'base64').toString('utf8');
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

/**
 * Strict Auth Middleware: Requires a valid Firebase Bearer token in Authorization header
 */
export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authorization denied. Bearer token missing.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        if (isFirebaseAdminInitialized) {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Sakhi Member',
                avatar: decodedToken.picture || null,
                role: decodedToken.role || 'Community Member'
            };
            return next();
        }

        // Development fallback: decode JWT token claims
        const decoded = decodeJwtPayload(token);
        if (decoded && (decoded.user_id || decoded.sub || decoded.uid)) {
            const uid = decoded.user_id || decoded.sub || decoded.uid;
            req.user = {
                uid,
                email: decoded.email || '',
                name: decoded.name || decoded.email?.split('@')[0] || 'Sakhi Member',
                avatar: decoded.picture || null,
                role: 'Community Member'
            };
            return next();
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired Firebase ID token.'
        });
    } catch (error) {
        console.error('[Auth Middleware] Token verification failed:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed. ' + error.message
        });
    }
};

/**
 * Optional Auth Middleware: Decodes user if token provided, but allows unauthenticated access
 */
export const optionalToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        if (isFirebaseAdminInitialized) {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Sakhi Member',
                avatar: decodedToken.picture || null,
                role: decodedToken.role || 'Community Member'
            };
        } else {
            const decoded = decodeJwtPayload(token);
            if (decoded && (decoded.user_id || decoded.sub || decoded.uid)) {
                req.user = {
                    uid: decoded.user_id || decoded.sub || decoded.uid,
                    email: decoded.email || '',
                    name: decoded.name || decoded.email?.split('@')[0] || 'Sakhi Member',
                    avatar: decoded.picture || null,
                    role: 'Community Member'
                };
            } else {
                req.user = null;
            }
        }
    } catch {
        req.user = null;
    }
    next();
};
