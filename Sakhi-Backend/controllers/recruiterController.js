import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Job } from '../models/Job.js';
import { JobApplication } from '../models/JobApplication.js';
import { endpoint, fail, validId } from '../utils/http.js';
export function createRecruiterController({ Jobs = Job, Applications = JobApplication } = {}) {
    const requireOwner = async req => {
        const job = await Jobs.findOne({ _id: req.params.id, createdBy: req.user.uid });
        if (!job) fail(404, 'Job not found or not owned by your account.');
        return job;
    };
    return {
        resume: endpoint(async (req, res) => {
            await requireOwner(req);
            if (!validId(req.params.applicationId)) fail(400, 'Invalid application ID.');
            const application = await Applications.findOne({ _id: req.params.applicationId, jobId: req.params.id });
            if (!application) fail(404, 'Application not found.');
            const filename = path.basename(new URL(application.resumeUrl, 'https://sakhi.invalid').pathname);
            if (!/^resume-[a-zA-Z0-9-]+\.(pdf|doc|docx)$/i.test(filename)) fail(404, 'Resume unavailable.');
            const directory = fileURLToPath(new URL('../uploads/resumes/', import.meta.url));
            res.download(path.join(directory, filename), filename, error => {
                if (error && !res.headersSent) res.status(404).json({ success: false, message: 'Resume file is unavailable.' });
            });
        }),
        mine: endpoint(async (req, res) => res.json({ success: true, jobs: await Jobs.find({ createdBy: req.user.uid }).sort({ createdAt: -1 }) })),
        list: endpoint(async (req, res) => {
            const job = await requireOwner(req);
            const applications = await Applications.find({ jobId: job._id }).sort({ createdAt: -1 });
            res.json({ success: true, job, applications });
        }),
        update: endpoint(async (req, res) => {
            await requireOwner(req);
            if (!validId(req.params.applicationId) || !['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'].includes(req.body.status)) fail(400, 'Invalid application or status.');
            const application = await Applications.findOneAndUpdate({ _id: req.params.applicationId, jobId: req.params.id }, { $set: { status: req.body.status } }, { new: true, runValidators: true });
            if (!application) fail(404, 'Application not found.');
            res.json({ success: true, application });
        }),
    };
}
export const recruiterController = createRecruiterController();
