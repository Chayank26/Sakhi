/**
 * Sakhi AI Tool Declarations Module
 * Defines JSON schema tool definitions for Google Gemini API function calling.
 */

export const SAKHI_TOOL_DECLARATIONS = [
    {
        type: 'function',
        name: 'searchJobs',
        description: 'Search available job openings in Sakhi career database by keyword, location, experience, or job type.',
        parameters: {
            type: 'object',
            properties: {
                keyword: {
                    type: 'string',
                    description: 'Job title or tech stack keyword, e.g., software engineering, frontend, React, Node.js, data scientist'
                },
                location: {
                    type: 'string',
                    description: 'City, state, or location preference, e.g., Chennai, Bengaluru, Mumbai, Remote'
                },
                salary: {
                    type: 'string',
                    description: 'Salary expectation or range'
                },
                jobType: {
                    type: 'string',
                    description: 'Job type, e.g., Full-time, Part-time, Internship, Remote'
                },
                experience: {
                    type: 'string',
                    description: 'Required experience level, e.g., Entry-level, 1-3 years, Senior'
                }
            }
        }
    },
    {
        type: 'function',
        name: 'searchCourses',
        description: 'Search Sakhi Academy learning hub courses by topic query, category, difficulty, or duration.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Course search term or subject, e.g., data analytics, Python, web development, UI/UX design'
                },
                category: {
                    type: 'string',
                    description: 'Course category, e.g., Technology, Business, Design, Career Skills'
                },
                difficulty: {
                    type: 'string',
                    description: 'Course difficulty level, e.g., Beginner, Intermediate, Advanced'
                },
                freeOnly: { type: 'boolean', description: 'Only free courses when true; paid courses when false.' },
                certificateAvailable: { type: 'boolean', description: 'Require a completion certificate.' },
                duration: {
                    type: 'string',
                    description: 'Estimated course completion time, e.g., 4 weeks, short course'
                }
            }
        }
    },
    {
        type: 'function',
        name: 'searchGovernmentSchemes',
        description: 'Search Sakhi Government Schemes database for welfare initiatives, financial grants, state schemes, or maternity benefits for women.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Scheme keyword or topic, e.g., startup loan, maternity benefit, scholarship, skill development'
                },
                category: {
                    type: 'string',
                    description: 'Scheme category, e.g., Entrepreneurship, Healthcare, Education, Financial Support'
                },
                state: {
                    type: 'string',
                    description: 'State name, e.g., Tamil Nadu, Maharashtra, All India'
                },
                governmentLevel: {
                    type: 'string',
                    description: 'Level of government, e.g., Central, State'
                },
                targetAudience: {
                    type: 'string',
                    description: 'Target demographic group, e.g., Women Entrepreneurs, Students, Single Mothers'
                }
            }
        }
    }
];
