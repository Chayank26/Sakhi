import express from 'express';
import { validId } from '../utils/http.js';
import {
    getCourses,
    getCourseById,
    createCourse,
} from '../controllers/courseController.js';

import { verifyToken, optionalToken } from '../middleware/auth.js';
import { requireDatabase } from '../config/db.js';
import { learningController } from '../controllers/learningController.js';
const router = express.Router();
router.use(requireDatabase);
router.param('id', (req, res, next, id) => validId(id) ? next() : res.status(400).json({ success: false, message: 'Invalid record ID.' }));
router.get('/:id/learn', verifyToken, learningController.get);
router.put('/:id/progress', verifyToken, learningController.progress);
router.get('/:id/certificate', verifyToken, learningController.certificate);

// GET /api/courses
router.get('/', getCourses);

// GET /api/courses/my-learning
router.get('/my-learning', verifyToken, learningController.mine);

// GET /api/courses/:id
router.get('/:id', optionalToken, getCourseById);

// POST /api/courses
router.post('/', verifyToken, createCourse);

// POST /api/courses/:id/enroll
router.post('/:id/enroll', verifyToken, learningController.enroll);

export default router;
