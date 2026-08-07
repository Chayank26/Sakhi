import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
            index: true,
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            index: true,
        },
        recruiterName: {
            type: String,
            required: [true, 'Recruiter name is required'],
            trim: true,
        },
        recruiterEmail: {
            type: String,
            required: [true, 'Recruiter email is required'],
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
        },
        responsibilities: {
            type: [String],
            default: [],
        },
        requirements: {
            type: [String],
            default: [],
        },
        skills: {
            type: [String],
            default: [],
            index: true,
        },
        salary: {
            type: String,
            required: [true, 'Salary information is required'],
        },
        salaryMinLpa: {
            type: Number,
            default: 0,
        },
        salaryMaxLpa: {
            type: Number,
            default: 0,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
            index: true,
        },
        experience: {
            type: String,
            required: [true, 'Experience requirement is required'],
            enum: ['Fresher', '1+', '2+', '3+', '5+', '8+'],
            default: 'Fresher',
        },
        education: {
            type: String,
            required: [true, 'Education requirement is required'],
            enum: ["High School", "Diploma", "Bachelor's", "Master's", "PhD"],
            default: "Bachelor's",
        },
        employmentType: {
            type: String,
            required: [true, 'Employment type is required'],
            enum: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote', 'Hybrid'],
            default: 'Full Time',
        },
        workingHours: {
            type: String,
            default: '9:00 AM - 6:00 PM',
        },
        vacancies: {
            type: Number,
            default: 1,
        },
        applicationDeadline: {
            type: Date,
        },
        companyLogo: {
            type: String,
            default: '',
        },
        website: {
            type: String,
            default: '',
        },
        industry: {
            type: String,
            required: true,
            default: 'Software',
            index: true,
        },
        benefits: {
            type: [String],
            default: [],
        },
        remote: {
            type: Boolean,
            default: false,
        },
        hybrid: {
            type: Boolean,
            default: false,
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

// Compound text index for fast keyword search across title, company, skills, industry, description
jobSchema.index({
    title: 'text',
    company: 'text',
    skills: 'text',
    industry: 'text',
    description: 'text',
    location: 'text',
});

export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
