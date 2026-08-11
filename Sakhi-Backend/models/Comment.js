import mongoose from 'mongoose';

const commentAuthorSchema = new mongoose.Schema(
    {
        uid: { type: String, required: true },
        name: { type: String, required: true, default: 'Sakhi Member' },
        email: { type: String },
        avatar: { type: String, default: null },
        role: { type: String, default: 'Community Member' }
    },
    { _id: false }
);

const commentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
            index: true
        },
        author: {
            type: commentAuthorSchema,
            required: true
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            maxlength: [2000, 'Comment cannot exceed 2000 characters']
        },
        likes: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

commentSchema.virtual('likesCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

// Index for retrieving post comments in chronological order
commentSchema.index({ post: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
