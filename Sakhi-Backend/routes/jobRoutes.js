import express from 'express';
import { validId } from '../utils/http.js';
import {
    getJobs,
    getJobById,
    createJob,
} from '../controllers/jobController.js';
import { uploadResume } from '../middleware/upload.js';

import { recruiterController } from '../controllers/recruiterController.js';
import { applyJob } from '../controllers/applicationController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireDatabase } from '../config/db.js';
const router = express.Router();
router.use(requireDatabase);
router.param('id', (req, res, next, id) => validId(id) ? next() : res.status(400).json({ success: false, message: 'Invalid record ID.' }));

// GET /api/jobs (Supports ?q= &location= &salaryRange= &experience= &jobType= &education= &industry= &posted= &sortBy= &page= &limit=)
router.get('/', getJobs);

router.get('/mine', verifyToken, recruiterController.mine);
router.get('/:id/applications', verifyToken, recruiterController.list);
router.get('/:id/applications/:applicationId/resume', verifyToken, recruiterController.resume);
router.put('/:id/applications/:applicationId', verifyToken, recruiterController.update);

// GET /api/jobs/:id
router.get('/:id', getJobById);

// POST /api/jobs
router.post('/', verifyToken, createJob);

// POST /api/jobs/:id/apply
router.post('/:id/apply', verifyToken, (req, res, next) => {
    uploadResume.single('resume')(req, res, error => {
        if (error) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'Resume must be under 5 MB.' : 'Upload one PDF, DOC, or DOCX resume.' });
        next();
    });
}, applyJob);

export default router;
