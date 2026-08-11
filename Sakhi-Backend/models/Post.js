import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema(
    {
        uid: { type: String, required: true },
        name: { type: String, required: true, default: 'Sakhi Member' },
        email: { type: String },
        avatar: { type: String, default: null },
        role: { type: String, default: 'Community Member' }
    },
    { _id: false }
);

const postSchema = new mongoose.Schema(
    {
        author: {
            type: authorSchema,
            required: true
        },
        title: {
            type: String,
            required: [true, 'Post title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
            trim: true,
            maxlength: [5000, 'Content cannot exceed 5000 characters']
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: [
                'Career',
                'Education',
                'Sakhi Academy',
                'Job Search',
                'Entrepreneurship',
                'General Discussion',
                'Success Stories',
                'Advice',
                'Technology',
                'Finance',
                'Other'
            ],
            default: 'General Discussion'
        },
        imageUrl: {
            type: String,
            default: null
        },
        likes: {
            type: [String],
            default: []
        },
        bookmarks: {
            type: [String],
            default: []
        },
        commentsCount: {
            type: Number,
            default: 0
        },
        reportsCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual field for likes count
postSchema.virtual('likesCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

// Indexes for search and fast queries
postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

const Post = mongoose.model('Post', postSchema);

export default Post;
