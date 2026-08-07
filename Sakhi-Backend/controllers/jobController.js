import { Job } from '../models/Job.js';
import { JobApplication } from '../models/JobApplication.js';
import { sendApplicationNotificationEmail } from '../services/emailService.js';
import mongoose from 'mongoose';

// Fallback sample data in memory if MongoDB is offline or empty
const fallbackJobs = [
    {
        _id: '64f8a1b2c3d4e5f6a7b8c901',
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
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
        website: 'https://innovateher.io',
        industry: 'Software',
        benefits: ['Flexible Work Hours', 'Health Insurance', 'Learning Stipend', 'Mental Health Support'],
        remote: true,
        hybrid: true,
        createdBy: 'system',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: '64f8a1b2c3d4e5f6a7b8c902',
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
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
        website: 'https://sakhifinance.com',
        industry: 'Finance',
        benefits: ['Annual Bonus', 'Medical Insurance', 'Paid Maternity Leave', 'Childcare Allowance'],
        remote: false,
        hybrid: true,
        createdBy: 'system',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: '64f8a1b2c3d4e5f6a7b8c903',
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
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        companyLogo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=120&auto=format&fit=crop&q=80',
        website: 'https://empowerdigital.in',
        industry: 'Software',
        benefits: ['100% Remote', 'Equipment Allowance', 'Mentorship Program'],
        remote: true,
        hybrid: false,
        createdBy: 'system',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: '64f8a1b2c3d4e5f6a7b8c904',
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
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        companyLogo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80',
        website: 'https://aurawellness.org',
        industry: 'Healthcare',
        benefits: ['Comprehensive Health Cover', 'Wellness Allowance', 'Flexible Leave'],
        remote: false,
        hybrid: true,
        createdBy: 'system',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: '64f8a1b2c3d4e5f6a7b8c905',
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
        salary: '₹2 - ₹3 LPA',
        salaryMinLpa: 2,
        salaryMaxLpa: 3,
        location: 'Mumbai',
        experience: 'Fresher',
        education: "High School",
        employmentType: 'Internship',
        workingHours: '10:00 AM - 4:00 PM IST',
        vacancies: 5,
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
        website: 'https://brightfutures.edu',
        industry: 'Education',
        benefits: ['Certificate of Internship', 'Pre-placement Offer (PPO)', 'Mentorship'],
        remote: true,
        hybrid: false,
        createdBy: 'system',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    }
];

let inMemoryCustomJobs = [];
let inMemoryApplications = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /api/jobs - Search, filter, sort & paginate jobs
export const getJobs = async (req, res) => {
    try {
        const {
            q,
            location,
            salaryRange,
            experience,
            jobType,
            education,
            industry,
            posted,
            sortBy = 'latest',
            page = 1,
            limit = 10,
        } = req.query;

        if (isDbConnected()) {
            const queryConditions = {};

            // Keyword Search
            if (q && q.trim()) {
                const regex = new RegExp(q.trim(), 'i');
                queryConditions.$or = [
                    { title: regex },
                    { company: regex },
                    { skills: regex },
                    { industry: regex },
                    { description: regex },
                ];
            }

            // Location Search
            if (location && location.trim()) {
                queryConditions.location = new RegExp(location.trim(), 'i');
            }

            // Experience filter
            if (experience) {
                const expArray = Array.isArray(experience) ? experience : [experience];
                queryConditions.experience = { $in: expArray };
            }

            // Job Type filter
            if (jobType) {
                const types = Array.isArray(jobType) ? jobType : [jobType];
                queryConditions.employmentType = { $in: types };
            }

            // Education filter
            if (education) {
                const eduArray = Array.isArray(education) ? education : [education];
                queryConditions.education = { $in: eduArray };
            }

            // Industry filter
            if (industry) {
                const indArray = Array.isArray(industry) ? industry : [industry];
                queryConditions.industry = { $in: indArray };
            }

            // Salary Range filter
            if (salaryRange) {
                const ranges = Array.isArray(salaryRange) ? salaryRange : [salaryRange];
                const salaryOr = [];

                ranges.forEach((range) => {
                    if (range === 'under_3') {
                        salaryOr.push({ salaryMaxLpa: { $gt: 0, $lte: 3 } });
                    } else if (range === '3_6') {
                        salaryOr.push({ salaryMinLpa: { $gte: 3 }, salaryMaxLpa: { $lte: 6 } });
                    } else if (range === '6_10') {
                        salaryOr.push({ salaryMinLpa: { $gte: 6 }, salaryMaxLpa: { $lte: 10 } });
                    } else if (range === '10_15') {
                        salaryOr.push({ salaryMinLpa: { $gte: 10 }, salaryMaxLpa: { $lte: 15 } });
                    } else if (range === '15_plus') {
                        salaryOr.push({ salaryMinLpa: { $gte: 15 } });
                    }
                });

                if (salaryOr.length > 0) {
                    queryConditions.$and = queryConditions.$and || [];
                    queryConditions.$and.push({ $or: salaryOr });
                }
            }

            // Posted timeframe
            if (posted) {
                const now = new Date();
                let startDate;
                if (posted === '24h') startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                else if (posted === 'week') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                else if (posted === 'month') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

                if (startDate) queryConditions.createdAt = { $gte: startDate };
            }

            // Sorting
            let sortOption = { createdAt: -1 };
            if (sortBy === 'highest_salary') sortOption = { salaryMaxLpa: -1, createdAt: -1 };
            else if (sortBy === 'oldest') sortOption = { createdAt: 1 };

            const pageNum = Math.max(1, parseInt(page, 10));
            const limitNum = Math.max(1, parseInt(limit, 10));
            const skip = (pageNum - 1) * limitNum;

            const totalJobs = await Job.countDocuments(queryConditions);
            const dbJobs = await Job.find(queryConditions).sort(sortOption).skip(skip).limit(limitNum);

            if (totalJobs > 0) {
                return res.json({
                    success: true,
                    count: dbJobs.length,
                    totalJobs,
                    totalPages: Math.ceil(totalJobs / limitNum),
                    currentPage: pageNum,
                    jobs: dbJobs,
                });
            }
        }

        // Fallback filtering over in-memory jobs dataset
        let results = [...inMemoryCustomJobs, ...fallbackJobs];

        if (q && q.trim()) {
            const queryStr = q.trim().toLowerCase();
            results = results.filter(
                (j) =>
                    j.title.toLowerCase().includes(queryStr) ||
                    j.company.toLowerCase().includes(queryStr) ||
                    j.industry.toLowerCase().includes(queryStr) ||
                    j.skills.some((s) => s.toLowerCase().includes(queryStr)) ||
                    j.description.toLowerCase().includes(queryStr)
            );
        }

        if (location && location.trim()) {
            const locStr = location.trim().toLowerCase();
            results = results.filter((j) => j.location.toLowerCase().includes(locStr));
        }

        if (experience) {
            const expArray = Array.isArray(experience) ? experience : [experience];
            results = results.filter((j) => expArray.includes(j.experience));
        }

        if (jobType) {
            const types = Array.isArray(jobType) ? jobType : [jobType];
            results = results.filter((j) => types.includes(j.employmentType));
        }

        if (education) {
            const eduArray = Array.isArray(education) ? education : [education];
            results = results.filter((j) => eduArray.includes(j.education));
        }

        if (industry) {
            const indArray = Array.isArray(industry) ? industry : [industry];
            results = results.filter((j) => indArray.includes(j.industry));
        }

        if (salaryRange) {
            const ranges = Array.isArray(salaryRange) ? salaryRange : [salaryRange];
            results = results.filter((j) => {
                return ranges.some((range) => {
                    if (range === 'under_3') return j.salaryMaxLpa <= 3;
                    if (range === '3_6') return j.salaryMinLpa >= 3 && j.salaryMaxLpa <= 6;
                    if (range === '6_10') return j.salaryMinLpa >= 6 && j.salaryMaxLpa <= 10;
                    if (range === '10_15') return j.salaryMinLpa >= 10 && j.salaryMaxLpa <= 15;
                    if (range === '15_plus') return j.salaryMinLpa >= 15;
                    return true;
                });
            });
        }

        // Sorting
        if (sortBy === 'highest_salary') {
            results.sort((a, b) => b.salaryMaxLpa - a.salaryMaxLpa);
        } else if (sortBy === 'oldest') {
            results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            // latest
            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedJobs = results.slice(startIndex, startIndex + limitNum);

        res.json({
            success: true,
            count: paginatedJobs.length,
            totalJobs: results.length,
            totalPages: Math.ceil(results.length / limitNum),
            currentPage: pageNum,
            jobs: paginatedJobs,
        });
    } catch (error) {
        console.error('[JobController Error]:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving jobs', error: error.message });
    }
};

// GET /api/jobs/:id - Get single job details
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isDbConnected()) {
            try {
                const dbJob = await Job.findById(id);
                if (dbJob) {
                    return res.json({ success: true, job: dbJob });
                }
            } catch (e) {
                // Invalid ObjectId format, try fallback array
            }
        }

        const allInMemory = [...inMemoryCustomJobs, ...fallbackJobs];
        const found = allInMemory.find((j) => String(j._id) === String(id));

        if (!found) {
            return res.status(404).json({ success: false, message: 'Job posting not found' });
        }

        res.json({ success: true, job: found });
    } catch (error) {
        console.error('[JobController Error]:', error);
        res.status(500).json({ success: false, message: 'Error retrieving job details', error: error.message });
    }
};

// POST /api/jobs - Create a new job listing
export const createJob = async (req, res) => {
    try {
        const {
            title,
            company,
            recruiterName,
            recruiterEmail,
            description,
            responsibilities,
            requirements,
            skills,
            salary,
            salaryMinLpa,
            salaryMaxLpa,
            location,
            experience,
            education,
            employmentType,
            workingHours,
            vacancies,
            applicationDeadline,
            companyLogo,
            website,
            industry,
            benefits,
            remote,
            hybrid,
            createdBy,
        } = req.body;

        if (!title || !company || !recruiterName || !recruiterEmail || !description || !location || !salary) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all mandatory fields (Title, Company, Recruiter Name & Email, Description, Location, Salary)',
            });
        }

        const parseArray = (input) => {
            if (Array.isArray(input)) return input;
            if (typeof input === 'string') return input.split(',').map((s) => s.trim()).filter(Boolean);
            return [];
        };

        const jobData = {
            title,
            company,
            recruiterName,
            recruiterEmail,
            description,
            responsibilities: parseArray(responsibilities),
            requirements: parseArray(requirements),
            skills: parseArray(skills),
            salary,
            salaryMinLpa: salaryMinLpa ? Number(salaryMinLpa) : 3,
            salaryMaxLpa: salaryMaxLpa ? Number(salaryMaxLpa) : 10,
            location,
            experience: experience || 'Fresher',
            education: education || "Bachelor's",
            employmentType: employmentType || 'Full Time',
            workingHours: workingHours || '9:00 AM - 6:00 PM IST',
            vacancies: vacancies ? Number(vacancies) : 1,
            applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            companyLogo: companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80',
            website: website || '',
            industry: industry || 'Software',
            benefits: parseArray(benefits),
            remote: Boolean(remote),
            hybrid: Boolean(hybrid),
            createdBy: createdBy || 'guest',
        };

        if (isDbConnected()) {
            const dbJob = await Job.create(jobData);
            return res.status(201).json({ success: true, message: 'Job created successfully!', job: dbJob });
        }

        const newInMemoryJob = {
            _id: 'custom-' + Date.now(),
            ...jobData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        inMemoryCustomJobs.unshift(newInMemoryJob);

        res.status(201).json({
            success: true,
            message: 'Job created successfully!',
            job: newInMemoryJob,
        });
    } catch (error) {
        console.error('[JobController Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to create job posting', error: error.message });
    }
};

// POST /api/jobs/:id/apply - Apply to job
export const applyJob = async (req, res) => {
    try {
        const { id: jobId } = req.params;
        const { applicantName, applicantEmail, applicantPhone, coverLetter, applicantUserId } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Resume file (PDF, DOC, DOCX) is required' });
        }

        if (!applicantName || !applicantEmail || !applicantPhone) {
            return res.status(400).json({ success: false, message: 'Applicant Name, Email, and Phone number are required.' });
        }

        let targetJob = null;
        if (isDbConnected()) {
            try {
                targetJob = await Job.findById(jobId);
            } catch (e) {}
        }

        if (!targetJob) {
            const allInMemory = [...inMemoryCustomJobs, ...fallbackJobs];
            targetJob = allInMemory.find((j) => String(j._id) === String(jobId));
        }

        if (!targetJob) {
            return res.status(404).json({ success: false, message: 'Target job listing not found' });
        }

        const resumeFileName = req.file.filename;
        const relativeResumeUrl = `/uploads/resumes/${resumeFileName}`;
        const fullResumeUrl = `${req.protocol}://${req.get('host')}${relativeResumeUrl}`;

        let applicationRecord = {
            jobId: targetJob._id,
            applicantUserId: applicantUserId || 'guest',
            applicantName,
            applicantEmail,
            applicantPhone,
            resumeUrl: fullResumeUrl,
            coverLetter: coverLetter || '',
            status: 'Applied',
            appliedAt: new Date(),
        };

        if (isDbConnected()) {
            applicationRecord = await JobApplication.create(applicationRecord);
        } else {
            applicationRecord._id = 'app-' + Date.now();
            inMemoryApplications.push(applicationRecord);
        }

        // Email notification using Nodemailer
        sendApplicationNotificationEmail({
            recruiterEmail: targetJob.recruiterEmail,
            recruiterName: targetJob.recruiterName,
            jobTitle: targetJob.title,
            applicantName,
            applicantEmail,
            applicantPhone,
            coverLetter,
            resumeUrl: fullResumeUrl,
            resumeFilePath: req.file.path,
        }).catch((err) => console.error('[Background Email Dispatch Error]:', err));

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully! The recruiter has been notified.',
            application: applicationRecord,
        });
    } catch (error) {
        console.error('[JobController Error]:', error);
        res.status(500).json({ success: false, message: 'Application processing failed', error: error.message });
    }
};
