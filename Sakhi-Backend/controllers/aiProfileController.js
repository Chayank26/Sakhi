import { AiUserProfile } from '../models/AiUserProfile.js';
import { normalizeAiProfile } from '../services/aiPersonalizationService.js';

export const createProfileHandlers = (Profile = AiUserProfile) => ({
    get: async (req, res) => {
        try {
            const profile = await Profile.findOne({ userId: req.user.uid }).lean();
            return res.json({ success: true, profile: normalizeAiProfile(profile) });
        } catch {
            return res.status(503).json({ success: false, message: 'Unable to load your AI preferences. Please try again.' });
        }
    },
    put: async (req, res) => {
        try {
            const profile = normalizeAiProfile(req.body);
            await Profile.findOneAndUpdate({ userId: req.user.uid }, { $set: profile }, { upsert: true, new: true, runValidators: true });
            return res.json({ success: true, profile });
        } catch {
            return res.status(503).json({ success: false, message: 'Unable to save your AI preferences. Please try again.' });
        }
    }
});
export const aiProfileHandlers = createProfileHandlers();
export const loadAiProfile = async (userId) => userId
    ? normalizeAiProfile(await AiUserProfile.findOne({ userId }).lean()) : {};
