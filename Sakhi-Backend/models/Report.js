import mongoose from 'mongoose';

const reporterSchema = new mongoose.Schema(
    {
        uid: { type: String, required: true },
        name: { type: String, default: 'Sakhi Member' },
        email: { type: String }
    },
    { _id: false }
);

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: reporterSchema,
            required: true
        },
        targetType: {
            type: String,
            required: true,
            enum: ['post', 'comment']
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'targetModel'
        },
        targetModel: {
            type: String,
            required: true,
            enum: ['Post', 'Comment'],
            default: function () {
                return this.targetType === 'post' ? 'Post' : 'Comment';
            }
        },
        reason: {
            type: String,
            required: [true, 'Report reason is required'],
            enum: [
                'Spam',
                'Harassment',
                'Hate/abusive content',
                'Inappropriate content',
                'Misinformation',
                'Other'
            ]
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters']
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'dismissed', 'resolved'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

reportSchema.index({ targetId: 1, 'reporter.uid': 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

export default Report;
