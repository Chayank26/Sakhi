import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            default: 'guest',
            index: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course ID is required'],
            index: true,
        },
        studentName: {
            type: String,
            required: [true, 'Student name is required'],
            trim: true,
        },
        studentEmail: {
            type: String,
            required: [true, 'Student email is required'],
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        enrolledAt: {
            type: Date,
            default: Date.now,
        },
        progress: {
            type: Number,
            default: 0, // percentage 0-100
        },
        status: {
            type: String,
            enum: ['Enrolled', 'In Progress', 'Completed'],
            default: 'Enrolled',
        },
    },
    {
        timestamps: true,
    }
);

export const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
