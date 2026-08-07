import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: [true, 'Job ID is required'],
            index: true,
        },
        applicantUserId: {
            type: String,
            default: 'guest',
        },
        applicantName: {
            type: String,
            required: [true, 'Applicant name is required'],
            trim: true,
        },
        applicantEmail: {
            type: String,
            required: [true, 'Applicant email is required'],
            trim: true,
            lowercase: true,
        },
        applicantPhone: {
            type: String,
            required: [true, 'Applicant phone number is required'],
            trim: true,
        },
        resumeUrl: {
            type: String,
            required: [true, 'Resume file path/URL is required'],
        },
        coverLetter: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'],
            default: 'Applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const JobApplication = mongoose.models.JobApplication || mongoose.model('JobApplication', jobApplicationSchema);
