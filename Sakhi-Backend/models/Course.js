import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Course title is required'],
            trim: true,
            index: true,
        },
        instructor: {
            type: String,
            required: [true, 'Instructor name is required'],
            trim: true,
        },
        organization: {
            type: String,
            default: 'Sakhi Academy',
            trim: true,
        },
        instructorEmail: {
            type: String,
            required: [true, 'Instructor email is required'],
            trim: true,
            lowercase: true,
        },
        category: {
            type: String,
            required: [true, 'Course category is required'],
            enum: [
                'Programming',
                'Web Development',
                'AI & Machine Learning',
                'Data Science',
                'Cybersecurity',
                'UI/UX',
                'Finance',
                'Marketing',
                'Entrepreneurship',
                'Communication',
                'Healthcare',
                'Government Exam Preparation',
                'Personal Development',
            ],
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Course description is required'],
        },
        learningOutcomes: {
            type: [String],
            default: [],
        },
        prerequisites: {
            type: [String],
            default: [],
        },
        curriculum: [
            {
                moduleTitle: { type: String, required: true },
                lessons: { type: [String], default: [] },
            },
        ],
        resources: {
            type: [String],
            default: [],
        },
        duration: {
            type: String,
            required: [true, 'Duration is required'],
            default: '4 Hours',
        },
        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
            index: true,
        },
        language: {
            type: String,
            enum: ['English', 'Hindi'],
            default: 'English',
        },
        price: {
            type: Number,
            default: 0, // 0 means Free
        },
        thumbnail: {
            type: String,
            default: '',
        },
        banner: {
            type: String,
            default: '',
        },
        certificateAvailable: {
            type: Boolean,
            default: true,
        },
        visibility: {
            type: String,
            enum: ['Public', 'Private'],
            default: 'Public',
        },
        rating: {
            type: Number,
            default: 4.8,
        },
        studentsEnrolled: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: String,
            default: 'system',
        },
    },
    {
        timestamps: true,
    }
);

// Compound text index for fast course search
courseSchema.index(
    {
        title: 'text',
        instructor: 'text',
        category: 'text',
        description: 'text',
    },
    {
        language_override: 'none',
    }
);

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
