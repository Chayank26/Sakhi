import mongoose from 'mongoose';

const aiChatSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        title: {
            type: String,
            default: 'New conversation',
            trim: true
        },
        messages: [
            {
                role: {
                    type: String,
                    enum: ['user', 'assistant'],
                    required: true
                },
                content: {
                    type: String,
                    required: true,
                    trim: true
                },
                actions: { type: [mongoose.Schema.Types.Mixed], default: [] },
                cards: {
                    jobs: { type: [mongoose.Schema.Types.Mixed], default: [] },
                    courses: { type: [mongoose.Schema.Types.Mixed], default: [] },
                    schemes: { type: [mongoose.Schema.Types.Mixed], default: [] }
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        lastActiveAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

export const AiChatSession = mongoose.models.AiChatSession || mongoose.model('AiChatSession', aiChatSessionSchema);
