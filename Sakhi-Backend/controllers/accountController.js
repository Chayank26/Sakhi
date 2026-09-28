import { learningProgress } from './learningController.js';
import { UserActivity } from '../models/UserActivity.js';
import { JobApplication } from '../models/JobApplication.js';
import { Enrollment } from '../models/Enrollment.js';
import { Job } from '../models/Job.js';
import { Course } from '../models/Course.js';
import Scheme from '../models/GovernmentScheme.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { endpoint, fail, validId, textField } from '../utils/http.js';

export function createAccountController({ Activity = UserActivity, Application = JobApplication, Learning = Enrollment, Ticket = SupportTicket, targets = { jobs: Job, courses: Course, schemes: Scheme } } = {}) {
    return {
        get: endpoint(async (req, res) => {
            const [activity, applications, enrollments] = await Promise.all([
                Activity.findOne({ userId: req.user.uid }).populate('jobs courses schemes'),
                Application.find({ applicantUserId: req.user.uid }).populate('jobId').sort({ createdAt: -1 }),
                Learning.find({ userId: req.user.uid }).populate('courseId').sort({ createdAt: -1 }),
            ]);
            res.json({ success: true, profile: activity?.profile || {}, saved: {
                jobs: (activity?.jobs || []).filter(Boolean), courses: (activity?.courses || []).filter(Boolean), schemes: (activity?.schemes || []).filter(Boolean),
            }, applications, enrollments: enrollments.map(e => ({ ...e.toObject(), ...learningProgress(e.courseId || {}, e.completedLessons || []) })) });
        }),
        save: endpoint(async (req, res) => {
            const { kind, id } = req.params;
            if (!Object.hasOwn(targets, kind) || !validId(id) || typeof req.body.saved !== 'boolean') fail(400, 'Invalid saved item.');
            if (req.body.saved && !await targets[kind].exists({ _id: id, ...(kind === 'courses' ? { visibility: 'Public' } : {}) })) fail(404, 'Item no longer available.');
            const operator = req.body.saved ? '$addToSet' : '$pull';
            await Activity.updateOne({ userId: req.user.uid }, { [operator]: { [kind]: id } }, { upsert: true });
            res.json({ success: true });
        }),
        profile: endpoint(async (req, res) => {
            const profile = Object.fromEntries(['name', 'phone', 'age', 'bio'].map(key => [key, textField(req.body[key] ?? '', key, key === 'bio' ? 2000 : 120, false)]));
            await Activity.updateOne({ userId: req.user.uid }, { $set: { profile } }, { upsert: true, runValidators: true });
            res.json({ success: true, profile });
        }),
        tickets: endpoint(async (req, res) => {
            const tickets = await Ticket.find({ userId: req.user.uid }).sort({ createdAt: -1 }).limit(100);
            res.json({ success: true, tickets });
        }),
        support: endpoint(async (req, res) => {
            const subject = textField(req.body.subject, 'Subject', 160);
            const message = textField(req.body.message, 'Message', 5000);
            const ticket = await Ticket.create({ userId: req.user.uid, subject, message });
            res.status(201).json({ success: true, ticket });
        }),
    };
}
export const accountController = createAccountController();
