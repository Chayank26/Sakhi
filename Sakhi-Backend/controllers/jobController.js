import { literalRegex } from '../ai/tools/searchQuery.js';
import { Job } from '../models/Job.js';

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

        {
            const queryConditions = {};

            // Keyword Search
            if (typeof q === 'string' && q.trim()) {
                const regex = literalRegex(q);
                queryConditions.$or = [
                    { title: regex },
                    { company: regex },
                    { skills: regex },
                    { industry: regex },
                    { description: regex },
                ];
            }

            // Location Search
            if (typeof location === 'string' && location.trim()) {
                queryConditions.location = literalRegex(location);
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

            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
            const skip = (pageNum - 1) * limitNum;

            const totalJobs = await Job.countDocuments(queryConditions);
            const dbJobs = await Job.find(queryConditions).sort(sortOption).skip(skip).limit(limitNum);

            {
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

    } catch (error) {
        console.error('[JobController Error]:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving jobs', error: error.message });
    }
};

// GET /api/jobs/:id - Get single job details
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);
        if (!job) return res.status(404).json({ success: false, message: 'Job posting not found' });
        res.json({ success: true, job });
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
            createdBy: req.user.uid,
        };

        const job = await Job.create(jobData);
        res.status(201).json({ success: true, job, message: 'Job published.' });
    } catch (error) {
        console.error('[JobController Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to create job posting', error: error.message });
    }
};
