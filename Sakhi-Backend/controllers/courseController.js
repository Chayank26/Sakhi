import { literalRegex } from '../ai/tools/searchQuery.js';
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';

// GET /api/courses - Search, filter, sort & paginate courses
export const getCourses = async (req, res) => {
    try {
        const {
            q,
            category,
            difficulty,
            language,
            type, // free vs paid
            sortBy = 'popular',
            page = 1,
            limit = 8,
        } = req.query;

        const queryConditions = { visibility: 'Public' };

        // Keyword Search
        if (typeof q === 'string' && q.trim()) {
            const regex = literalRegex(q);
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

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 8));
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
            courses: await Promise.all(courses.map(async course => ({ ...course.toObject(), studentsEnrolled: await Enrollment.countDocuments({ courseId: course._id }) }))),
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
        if (!course || (course.visibility !== 'Public' && course.createdBy !== req.user?.uid)) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, course: { ...course.toObject(), studentsEnrolled: await Enrollment.countDocuments({ courseId: course._id }) } });
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
            lessonMaterials,
            duration,
            difficulty,
            language,
            price,
            thumbnail,
            banner,
            certificateAvailable,
            visibility,
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
            lessonMaterials: Array.isArray(lessonMaterials) ? lessonMaterials : [],
            duration: duration || '4 Hours',
            difficulty: difficulty || 'Beginner',
            language: language || 'English',
            price: price ? Number(price) : 0,
            thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
            banner: banner || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
            certificateAvailable: certificateAvailable !== undefined ? Boolean(certificateAvailable) : true,
            visibility: visibility || 'Public',
            rating: 0,
            studentsEnrolled: 0,
            createdBy: req.user.uid,
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
