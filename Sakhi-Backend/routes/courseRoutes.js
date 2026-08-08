import express from 'express';
import {
    getCourses,
    getCourseById,
    createCourse,
    enrollCourse,
    getMyLearning,
} from '../controllers/courseController.js';

const router = express.Router();

// GET /api/courses
router.get('/', getCourses);

// GET /api/courses/my-learning
router.get('/my-learning', getMyLearning);

// GET /api/courses/:id
router.get('/:id', getCourseById);

// POST /api/courses
router.post('/', createCourse);

// POST /api/courses/:id/enroll
router.post('/:id/enroll', enrollCourse);

export default router;
