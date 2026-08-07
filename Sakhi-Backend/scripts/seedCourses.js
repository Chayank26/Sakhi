import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from '../models/Course.js';

dotenv.config();

const sampleCourses = [
    {
        title: 'React Fundamentals for Modern Web Apps',
        instructor: 'Priya Sharma',
        organization: 'Sakhi Tech Institute',
        instructorEmail: 'priya.sharma@sakhitech.org',
        category: 'Web Development',
        description: 'Master component-driven frontend architecture using modern React 19, JSX, state management, hooks, and responsive design patterns.',
        learningOutcomes: [
            'Build real-world interactive React applications from scratch',
            'Master React Hooks (useState, useEffect, useMemo, useCallback)',
            'Implement client-side routing with React Router 7',
            'Connect React interfaces to Node.js/Express REST APIs'
        ],
        prerequisites: ['Basic HTML5, CSS3, and JavaScript (ES6+) knowledge'],
        curriculum: [
            {
                moduleTitle: 'Module 1: Getting Started with React & Vite',
                lessons: ['Introduction to JSX & Virtual DOM', 'Component Architecture & Props', 'State vs Props in React']
            },
            {
                moduleTitle: 'Module 2: Hooks & Lifecycle Management',
                lessons: ['Deep Dive into useState & useEffect', 'Custom Hooks Creation', 'Handling Async API Requests']
            },
            {
                moduleTitle: 'Module 3: Router & State Persistence',
                lessons: ['Multi-page Apps with React Router', 'Context API & LocalStorage', 'Deploying React Apps to Vercel']
            }
        ],
        resources: ['React 19 Official Documentation Cheat Sheet', 'Starter Starter Kit (GitHub)', 'Practice Exercise PDF'],
        duration: '6 Hours',
        difficulty: 'Beginner',
        language: 'English',
        price: 0,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        certificateAvailable: true,
        visibility: 'Public',
        rating: 4.9,
        studentsEnrolled: 1420,
        createdBy: 'system'
    },
    {
        title: 'Practical AI & Prompt Engineering Masterclass',
        instructor: 'Dr. Meera Iyer',
        organization: 'AI Empowers',
        instructorEmail: 'meera@aiempowers.in',
        category: 'AI & Machine Learning',
        description: 'Learn how to leverage generative AI models, ChatGPT, Gemini, and LLM APIs to automate workflows, create content, and boost daily productivity.',
        learningOutcomes: [
            'Understand foundational Large Language Models (LLMs)',
            'Master advanced prompt structures (Zero-shot, Few-shot, Chain-of-thought)',
            'Build custom AI assistants for customer support and content creation',
            'Ethical considerations and AI safety practices'
        ],
        prerequisites: ['No coding background required! Designed for beginners.'],
        curriculum: [
            {
                moduleTitle: 'Module 1: Introduction to Generative AI',
                lessons: ['Understanding LLMs & Generative Models', 'Prompt Engineering Basics', 'System Prompts & Persona Setting']
            },
            {
                moduleTitle: 'Module 2: Advanced Techniques',
                lessons: ['Chain-of-Thought & Reasoning Prompts', 'Automating Documentation & Code Review', 'Structured JSON Outputs']
            }
        ],
        resources: ['Prompt Design Cookbook', 'AI Tool Directory 2026', '50+ Ready-to-use Prompt Templates'],
        duration: '4 Hours',
        difficulty: 'Beginner',
        language: 'English',
        price: 0,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        certificateAvailable: true,
        visibility: 'Public',
        rating: 4.8,
        studentsEnrolled: 980,
        createdBy: 'system'
    },
    {
        title: 'UI/UX Design Essentials in Figma',
        instructor: 'Ananya Roy',
        organization: 'DesignHer Academy',
        instructorEmail: 'ananya@designher.org',
        category: 'UI/UX',
        description: 'Step-by-step guide to user research, wireframing, component design systems, interactive prototyping, and WCAG accessibility standards in Figma.',
        learningOutcomes: [
            'Create high-fidelity mobile and desktop app UI designs',
            'Master Figma Auto Layout, Variables, and Design Tokens',
            'Conduct user testing and wireframing iterations',
            'Prepare developer handoffs and design system libraries'
        ],
        prerequisites: ['Free Figma account'],
        curriculum: [
            {
                moduleTitle: 'Module 1: Foundations of User Experience',
                lessons: ['User Persona & User Journey Mapping', 'Information Architecture & Wireframes', 'Grid Systems & Typography']
            },
            {
                moduleTitle: 'Module 2: High-Fidelity Design in Figma',
                lessons: ['Auto Layout 5.0 Mastery', 'Design Components & Variants', 'Interactive Micro-animations']
            }
        ],
        resources: ['Figma UI Kit Template', 'Accessibility Checklist PDF', 'Color Palette Generator Guide'],
        duration: '8 Hours',
        difficulty: 'Intermediate',
        language: 'English',
        price: 0,
        thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        certificateAvailable: true,
        visibility: 'Public',
        rating: 4.9,
        studentsEnrolled: 2100,
        createdBy: 'system'
    },
    {
        title: 'Financial Freedom & Micro-Investing for Women',
        instructor: 'Sunita Narang',
        organization: 'Sakhi Finance',
        instructorEmail: 'sunita@sakhifinance.com',
        category: 'Finance',
        description: 'Empower yourself with financial literacy! Learn budgeting, mutual fund investments, government micro-savings schemes, and debt management.',
        learningOutcomes: [
            'Build a monthly household & personal savings budget',
            'Understand Mutual Funds, SIPs, and Sukanya Samriddhi Yojana',
            'Manage emergency funds and health insurance plans',
            'Avoid financial scams and plan for long-term independence'
        ],
        prerequisites: ['Open to all learners'],
        curriculum: [
            {
                moduleTitle: 'Module 1: Budgeting & Debt Control',
                lessons: ['The 50/30/20 Budgeting Rule', 'Building your 6-month Emergency Fund', 'Clearing high-interest debt']
            },
            {
                moduleTitle: 'Module 2: Smart Investments & Schemes',
                lessons: ['SIPs vs Fixed Deposits', 'Government Women Financial Initiatives', 'Filing Basic Income Tax Returns']
            }
        ],
        resources: ['Monthly Budget Excel Sheet', 'Investment Calculator', 'Government Schemes Summary Booklet'],
        duration: '3 Hours',
        difficulty: 'Beginner',
        language: 'Hindi',
        price: 0,
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
        certificateAvailable: true,
        visibility: 'Public',
        rating: 4.95,
        studentsEnrolled: 3400,
        createdBy: 'system'
    },
    {
        title: 'Government Exam Preparation: SSC & Banking',
        instructor: 'Rajeshwari K.',
        organization: 'Sakhi Prep Center',
        instructorEmail: 'rajeshwari@sakhiprep.in',
        category: 'Government Exam Preparation',
        description: 'Comprehensive crash course covering Quantitative Aptitude, Logical Reasoning, General Awareness, and English for SSC CGL & IBPS Bank Exams.',
        learningOutcomes: [
            'Master short-cut speed math tricks for Quantitative Aptitude',
            'Solve complex logical reasoning puzzles under exam time pressure',
            'Stay updated on current affairs and banking awareness static questions'
        ],
        prerequisites: ['Basic high school arithmetic and reading comprehension'],
        curriculum: [
            {
                moduleTitle: 'Module 1: Quantitative Aptitude Tricks',
                lessons: ['Percentage, Profit & Loss Shortcuts', 'Time, Speed & Distance Formulae', 'Data Interpretation Strategies']
            },
            {
                moduleTitle: 'Module 2: Reasoning & Current Affairs',
                lessons: ['Seating Arrangement & Syllogism', 'Monthly Current Affairs Digest', 'Mock Test Practice & Speed Tricks']
            }
        ],
        resources: ['Formula Sheet PDF', 'Previous 5-Year Question Bank', 'Daily Current Affairs Quiz App'],
        duration: '15 Hours',
        difficulty: 'Intermediate',
        language: 'Hindi',
        price: 0,
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
        certificateAvailable: true,
        visibility: 'Public',
        rating: 4.85,
        studentsEnrolled: 1850,
        createdBy: 'system'
    }
];

const seedCoursesDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sakhi';
        await mongoose.connect(mongoUri);
        console.log('[Seed Courses Script] Connected to MongoDB Atlas');

        await Course.deleteMany({});
        await Course.collection.dropIndexes().catch(() => {});
        console.log('[Seed Courses Script] Cleared existing courses and old indexes');

        const createdCourses = await Course.insertMany(sampleCourses);
        console.log(`[Seed Courses Script] Successfully seeded ${createdCourses.length} courses!`);

        process.exit(0);
    } catch (error) {
        console.error('[Seed Courses Script Error]:', error.message);
        process.exit(1);
    }
};

seedCoursesDB();
