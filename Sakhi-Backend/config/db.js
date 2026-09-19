import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        const conn = await mongoose.connect(mongoUri);
        console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[MongoDB Error]: ${error.message}`);
    }
};
