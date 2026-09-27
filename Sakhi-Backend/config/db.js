import mongoose from 'mongoose';

export const getDatabaseHealth = (connection = mongoose.connection) => {
    const state = connection.readyState;
    return { ready: state === 1, state: ({ 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' })[state] || 'unknown' };
};

export const createDatabaseMiddleware = (connection = mongoose.connection) => (req, res, next) => {
    if (getDatabaseHealth(connection).ready) return next();
    return res.status(503).json({ success: false, message: 'Sakhi data is temporarily unavailable. Please try again shortly.' });
};

export const createHealthCheck = (connection = mongoose.connection) => (req, res) => {
    const database = getDatabaseHealth(connection);
    return res.status(database.ready ? 200 : 503).json({
        status: database.ready ? 'ok' : 'degraded',
        service: 'Sakhi Platform Backend API', database, timestamp: new Date().toISOString()
    });
};

export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 10000,
            bufferCommands: false
        });
        console.log('[MongoDB] Connected');
        return true;
    } catch {
        console.error('[MongoDB] Connection failed. Check MONGODB_URI and database access.');
        return false;
    }
};

export const requireDatabase = createDatabaseMiddleware();
export const healthCheck = createHealthCheck();
