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
            type: 'OBJECT',
            properties: {
                keyword: {
                    type: 'STRING',
                    description: 'Job title or tech stack keyword, e.g., software engineering, frontend, React, Node.js, data scientist'
                },
                location: {
                    type: 'STRING',
                    description: 'City, state, or location preference, e.g., Chennai, Bengaluru, Mumbai, Remote'
                },
                salary: {
                    type: 'STRING',
                    description: 'Salary expectation or range'
                },
                jobType: {
                    type: 'STRING',
                    description: 'Job type, e.g., Full-time, Part-time, Internship, Remote'
                },
                experience: {
                    type: 'STRING',
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
            type: 'OBJECT',
            properties: {
                query: {
                    type: 'STRING',
                    description: 'Course search term or subject, e.g., data analytics, Python, web development, UI/UX design'
                },
                category: {
                    type: 'STRING',
                    description: 'Course category, e.g., Technology, Business, Design, Career Skills'
                },
                difficulty: {
                    type: 'STRING',
                    description: 'Course difficulty level, e.g., Beginner, Intermediate, Advanced'
                },
                duration: {
                    type: 'STRING',
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
            type: 'OBJECT',
            properties: {
                query: {
                    type: 'STRING',
                    description: 'Scheme keyword or topic, e.g., startup loan, maternity benefit, scholarship, skill development'
                },
                category: {
                    type: 'STRING',
                    description: 'Scheme category, e.g., Entrepreneurship, Healthcare, Education, Financial Support'
                },
                state: {
                    type: 'STRING',
                    description: 'State name, e.g., Tamil Nadu, Maharashtra, All India'
                },
                governmentLevel: {
                    type: 'STRING',
                    description: 'Level of government, e.g., Central, State'
                },
                targetAudience: {
                    type: 'STRING',
                    description: 'Target demographic group, e.g., Women Entrepreneurs, Students, Single Mothers'
                }
            }
        }
    }
];
