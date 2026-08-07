import express from 'express';
import {
    getJobs,
    getJobById,
    createJob,
    applyJob,
} from '../controllers/jobController.js';
import { uploadResume } from '../middleware/upload.js';

const router = express.Router();

// GET /api/jobs (Supports ?q= &location= &salaryRange= &experience= &jobType= &education= &industry= &posted= &sortBy= &page= &limit=)
router.get('/', getJobs);

// GET /api/jobs/:id
router.get('/:id', getJobById);

// POST /api/jobs
router.post('/', createJob);

// POST /api/jobs/:id/apply
router.post('/:id/apply', uploadResume.single('resume'), applyJob);

export default router;
