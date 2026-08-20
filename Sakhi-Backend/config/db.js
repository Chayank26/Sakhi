import mongoose from 'mongoose';

const ATLAS_URI = 'mongodb+srv://sakhi_user:Sakhi%40123@sakhi-jobs.2suoxyr.mongodb.net/sakhi?retryWrites=true&w=majority&appName=Sakhi-jobs';

export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || ATLAS_URI;
        const conn = await mongoose.connect(mongoUri);
        console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[MongoDB Error]: ${error.message}`);
    }
};
