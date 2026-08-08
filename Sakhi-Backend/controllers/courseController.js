import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { sendCourseEnrollmentEmail } from '../services/courseEmailService.js';
import mongoose from 'mongoose';

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /api/courses - Search, filter, sort & paginate courses
export const getCourses = async (req, res) => {
    try {
        const {
            q,
            category,
            difficulty,
            duration,
            language,
            type, // free vs paid
            sortBy = 'popular',
            page = 1,
            limit = 8,
        } = req.query;

        const queryConditions = {};

        // Keyword Search
        if (q && q.trim()) {
            const regex = new RegExp(q.trim(), 'i');
            queryConditions.$or = [
                { title: regex },
                { instructor: regex },
                { category: regex },
                { description: regex },
            ];
        }

        // Category Filter
        if (category) {
            const catArray = Array.isArray(category) ? category : [category];
            queryConditions.category = { $in: catArray };
        }

        // Difficulty Filter
        if (difficulty) {
            const diffArray = Array.isArray(difficulty) ? difficulty : [difficulty];
            queryConditions.difficulty = { $in: diffArray };
        }

        // Language Filter
        if (language) {
            const langArray = Array.isArray(language) ? language : [language];
            queryConditions.language = { $in: langArray };
        }

        // Course Type Filter (Free vs Paid)
        if (type) {
            if (type === 'free') {
                queryConditions.price = 0;
            } else if (type === 'paid') {
                queryConditions.price = { $gt: 0 };
            }
        }

        // Sorting Option
        let sortOption = { studentsEnrolled: -1, rating: -1 }; // default popular
        if (sortBy === 'rating') {
            sortOption = { rating: -1, studentsEnrolled: -1 };
        } else if (sortBy === 'newest') {
            sortOption = { createdAt: -1 };
        }

        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        const skip = (pageNum - 1) * limitNum;

        const totalCourses = await Course.countDocuments(queryConditions);
        const courses = await Course.find(queryConditions)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            count: courses.length,
            totalCourses,
            totalPages: Math.ceil(totalCourses / limitNum),
            currentPage: pageNum,
            courses,
        });
    } catch (error) {
        console.error('[CourseController Error]:', error);
        res.status(500).json({ success: false, message: 'Server error fetching courses', error: error.message });
    }
};

// GET /api/courses/:id - Fetch single course details
export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, course });
    } catch (error) {
        console.error('[CourseController Error]:', error);
        res.status(500).json({ success: false, message: 'Error retrieving course details', error: error.message });
    }
};

// POST /api/courses - Publish a new course
export const createCourse = async (req, res) => {
    try {
        const {
            title,
            instructor,
            organization,
            instructorEmail,
            category,
            description,
            learningOutcomes,
            prerequisites,
            curriculum,
            resources,
            duration,
            difficulty,
            language,
            price,
            thumbnail,
            banner,
            certificateAvailable,
            visibility,
            createdBy,
        } = req.body;

        if (!title || !instructor || !instructorEmail || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all mandatory fields (Title, Instructor, Email, Category, Description)',
            });
        }

        const parseArray = (input) => {
            if (Array.isArray(input)) return input;
            if (typeof input === 'string') return input.split(',').map((s) => s.trim()).filter(Boolean);
            return [];
        };

        const newCourse = await Course.create({
            title,
            instructor,
            organization: organization || 'Sakhi Academy',
            instructorEmail,
            category,
            description,
            learningOutcomes: parseArray(learningOutcomes),
            prerequisites: parseArray(prerequisites),
            curriculum: Array.isArray(curriculum) ? curriculum : [],
            resources: parseArray(resources),
            duration: duration || '4 Hours',
            difficulty: difficulty || 'Beginner',
            language: language || 'English',
            price: price ? Number(price) : 0,
            thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
            banner: banner || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
            certificateAvailable: certificateAvailable !== undefined ? Boolean(certificateAvailable) : true,
            visibility: visibility || 'Public',
            rating: 4.9,
            studentsEnrolled: 1,
            createdBy: createdBy || 'guest',
        });

        res.status(201).json({
            success: true,
            message: 'Course published successfully!',
            course: newCourse,
        });
    } catch (error) {
        console.error('[CourseController Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to publish course', error: error.message });
    }
};

// POST /api/courses/:id/enroll - Enroll student in course
export const enrollCourse = async (req, res) => {
    try {
        const { id: courseId } = req.params;
        const { studentName, studentEmail, phone, userId } = req.body;

        if (!studentName || !studentEmail || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Student Name, Email, and Phone number are required to enroll!',
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Target course not found' });
        }

        // Create enrollment document in MongoDB
        const enrollment = await Enrollment.create({
            userId: userId || 'guest',
            courseId: course._id,
            studentName,
            studentEmail,
            phone,
            enrolledAt: new Date(),
            progress: 10, // Initial 10% progress
            status: 'Enrolled',
        });

        // Increment enrolled student count on Course
        course.studentsEnrolled = (course.studentsEnrolled || 0) + 1;
        await course.save();

        // Dispatch welcome confirmation email
        sendCourseEnrollmentEmail({
            studentEmail,
            studentName,
            courseTitle: course.title,
            instructorName: course.instructor,
            courseId: course._id,
        }).catch((err) => console.error('[Background Email Error]:', err));

        res.status(201).json({
            success: true,
            message: `Successfully enrolled in ${course.title}! Check your email for confirmation.`,
            enrollment,
        });
    } catch (error) {
        console.error('[CourseController Error]:', error);
        res.status(500).json({ success: false, message: 'Course enrollment failed', error: error.message });
    }
};

// GET /api/courses/user/my-learning - Fetch enrolled courses for student
export const getMyLearning = async (req, res) => {
    try {
        const { email } = req.query;
        let enrollments = [];

        if (email) {
            enrollments = await Enrollment.find({ studentEmail: email.toLowerCase() })
                .populate('courseId')
                .sort({ createdAt: -1 });
        } else {
            enrollments = await Enrollment.find()
                .populate('courseId')
                .sort({ createdAt: -1 })
                .limit(10);
        }

        res.json({
            success: true,
            count: enrollments.length,
            enrollments,
        });
    } catch (error) {
        console.error('[CourseController Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch My Learning dashboard', error: error.message });
    }
};
