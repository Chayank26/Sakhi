import mongoose from 'mongoose';

const VALID_CATEGORIES = [
    'Women Empowerment',
    'Education',
    'Employment',
    'Entrepreneurship',
    'Financial Assistance',
    'Skill Development',
    'Maternity',
    'Health & Nutrition',
    'Safety',
    'Housing',
    'Agriculture',
    'Other'
];

const VALID_GOVERNMENT_LEVELS = ['Central', 'State'];

const governmentSchemeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Scheme name is required'],
            trim: true,
            index: true
        },
        shortDescription: {
            type: String,
            required: [true, 'Short description is required'],
            trim: true,
            maxlength: [500, 'Short description cannot exceed 500 characters']
        },
        fullDescription: {
            type: String,
            required: [true, 'Full description is required'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: {
                values: VALID_CATEGORIES,
                message: '{VALUE} is not a valid scheme category'
            },
            index: true
        },
        governmentLevel: {
            type: String,
            required: [true, 'Government level (Central or State) is required'],
            enum: {
                values: VALID_GOVERNMENT_LEVELS,
                message: '{VALUE} is not a valid government level'
            },
            default: 'Central',
            index: true
        },
        ministry: {
            type: String,
            trim: true,
            default: ''
        },
        state: {
            type: String,
            trim: true,
            default: 'All India',
            index: true
        },
        benefits: {
            type: [String],
            default: []
        },
        eligibility: {
            type: [String],
            default: []
        },
        documentsRequired: {
            type: [String],
            default: []
        },
        applicationProcess: {
            type: [String],
            default: []
        },
        applicationUrl: {
            type: String,
            trim: true,
            default: ''
        },
        officialWebsite: {
            type: String,
            trim: true,
            default: ''
        },
        targetAudience: {
            type: [String],
            default: [],
            index: true
        },
        tags: {
            type: [String],
            default: [],
            index: true
        },
        featured: {
            type: Boolean,
            default: false,
            index: true
        },
        lastVerifiedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Text Index for full-text search across scheme fields
governmentSchemeSchema.index(
    {
        name: 'text',
        shortDescription: 'text',
        fullDescription: 'text',
        category: 'text',
        ministry: 'text',
        tags: 'text'
    },
    {
        weights: {
            name: 10,
            tags: 8,
            category: 6,
            shortDescription: 4,
            ministry: 3,
            fullDescription: 1
        },
        name: 'GovernmentSchemeTextIndex'
    }
);

// Compound indexes for frequent filtering & sorting queries
governmentSchemeSchema.index({ category: 1, governmentLevel: 1, state: 1 });
governmentSchemeSchema.index({ featured: -1, createdAt: -1 });

const GovernmentScheme = mongoose.model('GovernmentScheme', governmentSchemeSchema);

export default GovernmentScheme;
