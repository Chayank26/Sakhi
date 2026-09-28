import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { endpoint, fail, textField } from '../utils/http.js';

export const courseLessons = (course) => (course.curriculum || []).flatMap((module, m) => (module.lessons || []).map((title, l) => ({ key: `${m}:${l}`, title, moduleTitle: module.moduleTitle })));
export const learningProgress = (course, completed) => {
    const keys = new Set(courseLessons(course).map(lesson => lesson.key));
    const completedLessons = [...new Set(completed)].filter(key => keys.has(key));
    const progress = keys.size ? Math.floor(completedLessons.length / keys.size * 100) : 0;
    return { completedLessons, progress, status: progress === 100 ? 'Completed' : progress ? 'In Progress' : 'Enrolled' };
};
export function createLearningController({ Courses = Course, Enrollments = Enrollment } = {}) {
    const owned = async (req) => {
        const enrollment = await Enrollments.findOne({ userId: req.user.uid, courseId: req.params.id });
        if (!enrollment) fail(404, 'Enroll in this course to start learning.');
        const course = await Courses.findById(req.params.id);
        if (!course) fail(404, 'Course no longer available.');
        return { enrollment, course };
    };
    return {
        enroll: endpoint(async (req, res) => {
            const course = await Courses.findOne({ _id: req.params.id, visibility: 'Public' });
            if (!course) fail(404, 'Course not available.');
            if (course.price > 0) fail(409, 'Paid enrollment is not available in Sakhi yet. Contact the instructor for access.');
            const studentName = textField(req.body.studentName, 'Name');
            const studentEmail = req.user.email;
            if (!studentEmail) fail(400, 'Your account must have an email address.');
            const phone = textField(req.body.phone, 'Phone', 40);
            // Deterministic unique key protects retries and simultaneous enrollment requests.
            const enrollmentKey = `${req.user.uid}:${course._id}`;
            const existing = await Enrollments.findOne({ userId: req.user.uid, courseId: course._id });
            if (existing) return res.json({ success: true, enrollment: existing, message: 'You are already enrolled.' });
            let enrollment;
            try {
                enrollment = await Enrollments.findOneAndUpdate({ enrollmentKey }, { $setOnInsert: {
                    enrollmentKey, userId: req.user.uid, courseId: course._id, studentName, studentEmail, phone, progress: 0, status: 'Enrolled',
                } }, { upsert: true, new: true, runValidators: true });
            } catch (error) {
                if (error.code !== 11000) throw error;
                enrollment = await Enrollments.findOne({ enrollmentKey });
            }
            res.status(201).json({ success: true, enrollment, message: 'Enrollment saved. You can start learning.' });
        }),
        mine: endpoint(async (req, res) => {
            const enrollments = await Enrollments.find({ userId: req.user.uid }).populate('courseId').sort({ createdAt: -1 });
            res.json({ success: true, enrollments: enrollments.map(e => ({ ...e.toObject(), ...learningProgress(e.courseId || {}, e.completedLessons || []) })) });
        }),
        get: endpoint(async (req, res) => {
            const { course, enrollment } = await owned(req);
            res.json({ success: true, course, enrollment: { ...enrollment.toObject(), ...learningProgress(course, enrollment.completedLessons || []) } });
        }),
        progress: endpoint(async (req, res) => {
            const { course } = await owned(req);
            const { lessonKey, completed } = req.body;
            if (typeof completed !== 'boolean' || !courseLessons(course).some(lesson => lesson.key === lessonKey)) fail(400, 'Select a valid lesson.');
            // Atomic set operation preserves updates from other tabs. Progress is always derived on read.
            const enrollment = await Enrollments.findOneAndUpdate({ userId: req.user.uid, courseId: course._id }, {
                [completed ? '$addToSet' : '$pull']: { completedLessons: lessonKey },
            }, { new: true });
            res.json({ success: true, enrollment: { ...enrollment.toObject(), ...learningProgress(course, enrollment.completedLessons || []) } });
        }),
        certificate: endpoint(async (req, res) => {
            const { course, enrollment } = await owned(req);
            if (!course.certificateAvailable || learningProgress(course, enrollment.completedLessons || []).progress !== 100) fail(409, 'Complete every lesson before downloading your completion record.');
            res.json({ success: true, certificate: {
                reference: String(enrollment._id), student: enrollment.studentName, course: course.title,
                statement: 'The learner marked all curriculum lessons complete. This is a self-reported completion record, not an accredited qualification.',
            } });
        }),
    };
}
export const learningController = createLearningController();
