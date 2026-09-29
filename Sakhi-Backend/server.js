import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { isAuthConfigured } from './middleware/auth.js';
import { connectDB } from './config/db.js';
import { validateRuntime } from './config/runtime.js';

try {
    validateRuntime();
    if (process.env.NODE_ENV === 'production' && !isAuthConfigured()) throw new Error('Firebase Admin configuration is invalid.');
    if (!await connectDB()) throw new Error('Database connection is required to start Sakhi.');
    const port = Number(process.env.PORT || 5000);
    const server = app.listen(port, () => console.log(`[Sakhi Backend] Listening on port ${port}`));
    server.requestTimeout = 60_000;
    server.headersTimeout = 65_000;
    let stopping = false;
    const shutdown = () => {
        if (stopping) return;
        stopping = true;
        const deadline = setTimeout(() => process.exit(1), 10_000);
        deadline.unref();
        server.close(async () => { await mongoose.disconnect(); clearTimeout(deadline); process.exit(0); });
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
    server.on('error', () => { console.error('[Sakhi Backend] HTTP server failed.'); shutdown(); });
} catch (error) {
    console.error(`[Sakhi Backend] Startup failed: ${error.message}`);
    await mongoose.disconnect();
    process.exitCode = 1;
}
export default app;
