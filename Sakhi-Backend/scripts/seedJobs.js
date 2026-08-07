import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Job } from '../models/Job.js';

dotenv.config();

const sampleJobs = [
    {
        title: 'Senior Frontend Developer (React)',
        company: 'InnovateHer Tech',
        recruiterName: 'Ananya Sharma',
        recruiterEmail: 'careers@innovateher.io',
        description: 'We are seeking a passionate Senior Frontend Developer to lead our Web UI initiatives. You will architect intuitive interfaces, mentor junior developers, and drive frontend excellence.',
        responsibilities: [
            'Architect scalable React applications using modern frontend patterns',
            'Collaborate closely with UX designers to craft delighting user journeys',
            'Optimize application performance and accessibility (WCAG 2.1 AAA)',
            'Conduct code reviews and champion UI design system consistency'
        ],
        requirements: [
            '5+ years experience building production React applications',
            'Deep expertise in JavaScript (ES6+), TypeScript, CSS3, and HTML5',
            'Experience with state management (Redux/Zustand) and RESTful API integration',
            'Strong understanding of Web Vitals and responsive layout design'
        ],
        skills: ['React', 'TypeScript', 'CSS3', 'Vite', 'REST API', 'UI/UX'],
        salary: '₹12 - ₹18 LPA',
        salaryMinLpa: 12,
        salaryMaxLpa: 18,
        location: 'Bengaluru',
        experience: '5+',
        education: "Bachelor's",
        employmentType: 'Full Time',
        workingHours: '9:30 AM - 6:30 PM IST',
        vacancies: 3,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
        website: 'https://innovateher.io',
        industry: 'Software',
        benefits: ['Flexible Work Hours', 'Health Insurance', 'Learning Stipend', 'Mental Health Support'],
        remote: true,
        hybrid: true,
        createdBy: 'system'
    },
    {
        title: 'Data Analyst - Business Intelligence',
        company: 'Sakhi Finance Solutions',
        recruiterName: 'Priya Narayanan',
        recruiterEmail: 'hr@sakhifinance.com',
        description: 'Join our Analytics team to help drive data-backed decisions for women empowerment micro-finance initiatives across South India.',
        responsibilities: [
            'Create interactive PowerBI/Tableau dashboards for executive leadership',
            'Query complex SQL databases to extract key actionable financial insights',
            'Collaborate with product teams to track user funnel retention metrics'
        ],
        requirements: [
            '2+ years in Data Analytics or Business Intelligence role',
            'Proficiency in SQL, Python/R, and Excel/Tableau',
            'Strong analytical thinking and statistical problem-solving skills'
        ],
        skills: ['SQL', 'Python', 'PowerBI', 'Tableau', 'Excel', 'Statistics'],
        salary: '₹5 - ₹8 LPA',
        salaryMinLpa: 5,
        salaryMaxLpa: 8,
        location: 'Chennai',
        experience: '2+',
        education: "Bachelor's",
        employmentType: 'Full Time',
        workingHours: '9:00 AM - 6:00 PM IST',
        vacancies: 2,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
        website: 'https://sakhifinance.com',
        industry: 'Finance',
        benefits: ['Annual Bonus', 'Medical Insurance', 'Paid Maternity Leave', 'Childcare Allowance'],
        remote: false,
        hybrid: true,
        createdBy: 'system'
    },
    {
        title: 'Junior UX/UI Designer',
        company: 'Empower Digital Agency',
        recruiterName: 'Sneha Patel',
        recruiterEmail: 'talent@empowerdigital.in',
        description: 'An exciting opportunity for entry-level designers to build accessible web & mobile apps tailored for diverse audiences.',
        responsibilities: [
            'Design low & high-fidelity wireframes and interactive Figma prototypes',
            'Conduct user interviews and usability tests with community members',
            'Maintain and expand our core component design library'
        ],
        requirements: [
            '0 - 2 years design experience (Fresher portfolios highly encouraged!)',
            'Mastery of Figma, Adobe XD, and web design fundamentals',
            'Empathy-driven approach to accessible and inclusive UI'
        ],
        skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping', 'User Research'],
        salary: '₹3.5 - ₹5 LPA',
        salaryMinLpa: 3.5,
        salaryMaxLpa: 5,
        location: 'Remote',
        experience: 'Fresher',
        education: "Diploma",
        employmentType: 'Full Time',
        workingHours: '10:00 AM - 6:00 PM IST',
        vacancies: 4,
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        companyLogo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=120&auto=format&fit=crop&q=80',
        website: 'https://empowerdigital.in',
        industry: 'Software',
        benefits: ['100% Remote', 'Equipment Allowance', 'Mentorship Program'],
        remote: true,
        hybrid: false,
        createdBy: 'system'
    },
    {
        title: 'Healthcare Content Specialist & Educator',
        company: 'Aura Women Wellness',
        recruiterName: 'Dr. Kavita Rao',
        recruiterEmail: 'careers@aurawellness.org',
        description: 'Lead educational outreach and create medically accurate, engaging content for women health awareness initiatives.',
        responsibilities: [
            'Draft articles, infographics, and course modules on maternal and preventive health',
            'Review medical scripts with certified gynecologists and health experts',
            'Host weekly Q&A webinars for Sakhi community members'
        ],
        requirements: [
            'Degree in Healthcare, Life Sciences, or Health Communication',
            '1+ years experience in health copywriting or medical communication',
            'Fluency in English and regional Indian languages is a plus'
        ],
        skills: ['Medical Content', 'Health Education', 'Copywriting', 'Public Health'],
        salary: '₹4 - ₹7 LPA',
        salaryMinLpa: 4,
        salaryMaxLpa: 7,
        location: 'Hyderabad',
        experience: '1+',
        education: "Bachelor's",
        employmentType: 'Full Time',
        workingHours: '9:00 AM - 5:00 PM IST',
        vacancies: 1,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        companyLogo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80',
        website: 'https://aurawellness.org',
        industry: 'Healthcare',
        benefits: ['Comprehensive Health Cover', 'Wellness Allowance', 'Flexible Leave'],
        remote: false,
        hybrid: true,
        createdBy: 'system'
    },
    {
        title: 'Digital Marketing Intern',
        company: 'BrightFutures EdTech',
        recruiterName: 'Rohan Verma',
        recruiterEmail: 'internships@brightfutures.edu',
        description: 'Kickstart your marketing career with hands-on exposure to social media management, SEO, and community engagement.',
        responsibilities: [
            'Assist in social media content scheduling and campaign analytics',
            'Draft engaging newsletters and blog posts for students and jobseekers',
            'Monitor SEO performance and research trending industry keywords'
        ],
        requirements: [
            'Current student or recent graduate in Marketing, Communications, or related field',
            'Basic knowledge of Instagram/LinkedIn branding and Canva',
            'Strong written communication skills'
        ],
        skills: ['Social Media', 'SEO', 'Canva', 'Content Marketing', 'Copywriting'],
        salary: '₹15,000 - ₹25,000 / month',
        salaryMinLpa: 1.8,
        salaryMaxLpa: 3,
        location: 'Mumbai',
        experience: 'Fresher',
        education: "High School",
        employmentType: 'Internship',
        workingHours: '10:00 AM - 4:00 PM IST',
        vacancies: 5,
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
        website: 'https://brightfutures.edu',
        industry: 'Education',
        benefits: ['Certificate of Internship', 'Pre-placement Offer (PPO)', 'Mentorship'],
        remote: true,
        hybrid: false,
        createdBy: 'system'
    }
];

const seedDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sakhi';
        await mongoose.connect(mongoUri);
        console.log('[Seed Script] Connected to MongoDB');

        await Job.deleteMany({});
        console.log('[Seed Script] Existing jobs cleared');

        const createdJobs = await Job.insertMany(sampleJobs);
        console.log(`[Seed Script] Successfully seeded ${createdJobs.length} jobs!`);

        process.exit(0);
    } catch (error) {
        console.error('[Seed Script Error]:', error.message);
        process.exit(1);
    }
};

seedDB();
