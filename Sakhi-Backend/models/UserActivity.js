import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    profile: { name: String, phone: String, age: String, bio: String },
    jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    schemes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GovernmentScheme' }],
}, { timestamps: true });
export const UserActivity = mongoose.models.UserActivity || mongoose.model('UserActivity', schema);
