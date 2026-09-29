import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { healthCheck } from './config/db.js';
import { uploadRoot } from './config/runtime.js';
import { corsOptions, createLimiter, requestContext, validateQuery, validateBody, errorHandler, writeLimiter } from './middleware/security.js';
import { validateFields } from './middleware/validation.js';
import accountRoutes from './routes/accountRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import aiSessionRoutes from './routes/aiSessionRoutes.js';

export function createApp({ env = process.env, apiLimit = 300, uploadsDirectory = uploadRoot } = {}) {
    const app = express();
    app.disable('x-powered-by');
    const proxy = env.TRUST_PROXY || '0';
    app.set('trust proxy', /^\d+$/.test(proxy) ? Number(proxy) : proxy);
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use(requestContext);
    app.use(cors(corsOptions(env)));
    app.get('/api/health', healthCheck);
    app.use('/api', createLimiter(apiLimit));
    app.use(express.json({ limit: '256kb', strict: true }));
    app.use(express.urlencoded({ extended: false, limit: '64kb', parameterLimit: 100 }));
    app.use('/api', validateQuery, (req, res, next) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            if ((req.headers['content-length'] > 0 || req.headers['transfer-encoding']) && !req.is(['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'])) return res.status(415).json({ success: false, message: 'Unsupported content type.' });
            return writeLimiter(req, res, () => req.is('multipart/form-data') ? next() : validateBody(req, res, () => validateFields(req, res, next)));
        }
        next();
    });
    // Only validated image files are public. Never expose the uploads root or resumes.
    app.use('/uploads/community', (req, res, next) => {
        let pathname;
        try { pathname = decodeURIComponent(req.path); } catch { return res.status(400).json({ success: false, message: 'Invalid image path.' }); }
        if (!/^\/community-[a-zA-Z0-9-]+\.(png|jpe?g|gif|webp)$/i.test(pathname)) return res.status(404).json({ success: false, message: 'Image not found.' });
        next();
    }, express.static(path.join(uploadsDirectory, 'community'), { dotfiles: 'deny', index: false, fallthrough: false }));
    app.use('/uploads', (req, res) => res.status(404).json({ success: false, message: 'Upload not found.' }));
    app.get(['/', '/index.html'], (req, res) => res.json({ status: 'ok', service: 'Sakhi Platform Backend API', healthCheck: '/api/health' }));
    app.use('/api/me', accountRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/community', communityRoutes);
    app.use('/api/schemes', schemeRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/ai', aiSessionRoutes);
    app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint not found.' }));
    app.use(errorHandler);
    return app;
}
export default createApp();
