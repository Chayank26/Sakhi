import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import GovernmentScheme from '../models/GovernmentScheme.js';
import { schemesData } from './schemes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sakhi';

const seedDatabase = async () => {
    try {
        console.log(`[Seed Script] Connecting to MongoDB: ${MONGODB_URI.split('@').pop() || 'localhost'}`);
        await mongoose.connect(MONGODB_URI);
        console.log('[Seed Script] Connected successfully.');

        console.log('[Seed Script] Clearing existing GovernmentScheme collection...');
        await GovernmentScheme.deleteMany({});
        console.log('[Seed Script] Existing schemes cleared.');

        console.log(`[Seed Script] Inserting ${schemesData.length} verified government schemes...`);
        const insertedSchemes = await GovernmentScheme.insertMany(schemesData);
        console.log(`[Seed Script] Success! Inserted ${insertedSchemes.length} schemes into MongoDB.`);

        await mongoose.connection.close();
        console.log('[Seed Script] Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('[Seed Script Error]: Failed to seed government schemes database:', error);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

seedDatabase();
