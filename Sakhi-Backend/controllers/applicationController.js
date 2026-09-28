import { unlink } from 'node:fs/promises';
import { Job } from '../models/Job.js';
import { JobApplication } from '../models/JobApplication.js';
import { sendApplicationNotificationEmail } from '../services/emailService.js';
import { endpoint, fail, textField } from '../utils/http.js';
export function createApplicationController({ Jobs = Job, Applications = JobApplication, notify = sendApplicationNotificationEmail, removeUpload = path => unlink(path) } = {}) {
    return endpoint(async (req, res) => {
        let retained = false;
        try {
            const job = await Jobs.findById(req.params.id);
            if (!job) fail(404, 'Job no longer available.');
            const existing = await Applications.findOne({ jobId: job._id, applicantUserId: req.user.uid });
            if (existing) return res.json({ success: true, application: existing, message: 'Your application is already saved.' });
            if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) fail(409, 'The application deadline has passed.');
            if (!req.file) fail(400, 'A resume is required.');
            const applicantName = textField(req.body.applicantName, 'Name');
            const applicantPhone = textField(req.body.applicantPhone, 'Phone', 40);
            const applicantEmail = req.user.email;
            if (!applicantEmail) fail(400, 'Your account must have an email address.');
            const coverLetter = textField(req.body.coverLetter ?? '', 'Cover letter', 10000, false);
            const resumeUrl = `/uploads/resumes/${req.file.filename}`;
            const applicationKey = `${req.user.uid}:${job._id}`;
            let application;
            try {
                application = await Applications.create({ applicationKey, jobId: job._id, applicantUserId: req.user.uid, applicantName, applicantEmail, applicantPhone, coverLetter, resumeUrl });
                retained = true;
            } catch (error) {
                if (error.code !== 11000) throw error;
                application = await Applications.findOne({ applicationKey });
                return res.json({ success: true, application, message: 'Your application is already saved.' });
            }
            notify({ recruiterEmail: job.recruiterEmail, recruiterName: job.recruiterName, jobTitle: job.title, applicantName, applicantEmail, applicantPhone, coverLetter, resumeUrl: null, resumeFilePath: req.file.path }).catch(() => console.warn('[Applications] Notification delivery failed. Application remains saved.'));
            res.status(201).json({ success: true, application, message: 'Application saved. You can track it in My job activity.' });
        } finally {
            if (req.file?.path && !retained) await removeUpload(req.file.path).catch(() => {});
        }
    });
}
export const applyJob = createApplicationController();
