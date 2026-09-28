import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    city: { type: String, default: '' },
    goal: { type: String, default: '' },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    jobType: { type: String, default: '' },
    level: { type: String, default: '' }
}, { timestamps: true });
export const AiUserProfile = mongoose.models.AiUserProfile || mongoose.model('AiUserProfile', schema);
