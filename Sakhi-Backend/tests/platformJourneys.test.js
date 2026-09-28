import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccountController } from '../controllers/accountController.js';
import { createLearningController, learningProgress } from '../controllers/learningController.js';
import { createApplicationController } from '../controllers/applicationController.js';
import { evaluateSchemeGuidance } from '../services/schemeAiService.js';
import { createDatabaseMiddleware } from '../config/db.js';
const id = '507f1f77bcf86cd799439011';
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const request = (body = {}) => ({ user: { uid: 'owner', email: 'owner@example.test' }, params: { id }, body, query: { email: 'someone-else@example.test' } });
const course = { _id: id, price: 0, visibility: 'Public', title: 'Test course', certificateAvailable: true, curriculum: [{ moduleTitle: 'Basics', lessons: ['One', 'Two'] }] };
const document = data => ({ ...data, toObject() { return { ...data }; } });

test('bookmarks use verified owner, reject unknown kinds and propagate failed writes', async () => {
    const writes = [];
    const controller = createAccountController({ Activity: { updateOne: async (...args) => writes.push(args) }, targets: { jobs: { exists: async () => true } } });
    const req = request({ saved: true, userId: 'victim' }); req.params = { kind: 'jobs', id };
    await controller.save(req, response());
    assert.deepEqual(writes[0][0], { userId: 'owner' }); assert.deepEqual(writes[0][1], { $addToSet: { jobs: id } });
    for (const kind of ['__proto__', 'profile', 'constructor']) {
        const denied = response(); await controller.save({ ...req, params: { kind, id } }, denied); assert.equal(denied.code, 400);
    }
    const failed = response(); await createAccountController({ Activity: { updateOne: async () => { throw new Error('offline'); } }, targets: { jobs: { exists: async () => true } } }).save(req, failed);
    assert.equal(failed.code, 500); assert.equal(failed.body.success, false);
});
test('account activity is token-scoped and saved items are independent of directory pagination', async () => {
    const calls = [];
    const query = value => ({ populate() { return this; }, sort() { return Promise.resolve(value); }, then(resolve) { return Promise.resolve(value).then(resolve); } });
    const jobs = Array.from({ length: 65 }, (_, i) => ({ _id: String(i) }));
    const controller = createAccountController({
        Activity: { findOne: q => { calls.push(q); return query({ jobs }); } },
        Application: { find: q => { calls.push(q); return query([]); } },
        Learning: { find: q => { calls.push(q); return query([document({ courseId: course, completedLessons: ['0:0'] })]); } },
    });
    const res = response(); await controller.get(request(), res);
    assert.equal(res.body.saved.jobs.length, 65); assert.equal(res.body.enrollments[0].progress, 50);
    assert.deepEqual(calls, [{ userId: 'owner' }, { applicantUserId: 'owner' }, { userId: 'owner' }]);
});
test('support requires valid input, persists an owned reference and rejects storage failures', async () => {
    let stored;
    const controller = createAccountController({ Ticket: { create: async data => { stored = data; return { _id: id, ...data, status: 'Received' }; } } });
    const res = response(); await controller.support(request({ subject: ' Help ', message: 'Cannot enroll', userId: 'other' }), res);
    assert.equal(res.code, 201); assert.equal(stored.userId, 'owner'); assert.equal(stored.subject, 'Help'); assert.equal(res.body.ticket._id, id);
    const invalid = response(); await controller.support(request({ subject: ' ', message: 'text' }), invalid); assert.equal(invalid.code, 400);
    const failed = response(); await createAccountController({ Ticket: { create: async () => { throw new Error('offline'); } } }).support(request({ subject: 'Help', message: 'Problem' }), failed); assert.equal(failed.code, 500);
});
test('completion ignores fabricated/duplicate lesson keys and empty curricula never complete', () => {
    assert.deepEqual(learningProgress(course, ['0:0', '0:0', '99:99']), { completedLessons: ['0:0'], progress: 50, status: 'In Progress' });
    assert.equal(learningProgress(course, ['0:0', '0:1']).status, 'Completed');
    assert.equal(learningProgress({ curriculum: [] }, ['0:0']).progress, 0);
});
test('enrollment uses token identity, starts at zero and reuses existing records', async () => {
    let stored; let writes = 0;
    const controller = createLearningController({ Courses: { findOne: async () => course }, Enrollments: {
        findOne: async () => stored,
        findOneAndUpdate: async (filter, update) => { writes++; stored = update.$setOnInsert; assert.equal(filter.enrollmentKey, `owner:${id}`); return stored; },
    } });
    const req = request({ studentName: 'Learner', studentEmail: 'victim@example.test', phone: '12345678', userId: 'victim', progress: 100 });
    const res = response(); await controller.enroll(req, res); assert.equal(res.code, 201); assert.equal(stored.progress, 0); assert.equal(stored.userId, 'owner'); assert.equal(stored.studentEmail, 'owner@example.test');
    await controller.enroll(req, response()); assert.equal(writes, 1);
});
test('paid courses cannot create a successful enrollment', async () => {
    const controller = createLearningController({ Courses: { findOne: async () => ({ ...course, price: 200 }) }, Enrollments: { findOneAndUpdate: () => assert.fail('must not enroll') } });
    const res = response(); await controller.enroll(request(), res); assert.equal(res.code, 409);
});
test('learning and completion downloads enforce ownership and full completion', async () => {
    let completedLessons = ['0:0']; const queries = [];
    const controller = createLearningController({ Courses: { findById: async () => course }, Enrollments: { findOne: async q => { queries.push(q); return document({ _id: id, studentName: 'Learner', completedLessons }); } } });
    const res = response(); await controller.certificate(request(), res); assert.equal(res.code, 409);
    completedLessons = ['0:0', '0:1']; const passed = response(); await controller.certificate(request(), passed); assert.equal(passed.code, 200); assert.match(passed.body.certificate.statement, /self-reported/);
    assert.ok(queries.every(q => q.userId === 'owner'));
    const denied = response(); await createLearningController({ Enrollments: { findOne: async () => null } }).get(request(), denied); assert.equal(denied.code, 404);
});
test('progress validates keys and atomically updates only the selected lesson', async () => {
    let write;
    const controller = createLearningController({ Courses: { findById: async () => course }, Enrollments: {
        findOne: async () => document({ completedLessons: [] }),
        findOneAndUpdate: async (filter, update) => { write = { filter, update }; return document({ completedLessons: ['0:0'] }); },
    } });
    const invalid = response(); await controller.progress(request({ lessonKey: '99:0', completed: true }), invalid); assert.equal(invalid.code, 400); assert.equal(write, undefined);
    const valid = response(); await controller.progress(request({ lessonKey: '0:0', completed: true, progress: 100 }), valid);
    assert.deepEqual(write, { filter: { userId: 'owner', courseId: id }, update: { $addToSet: { completedLessons: '0:0' } } }); assert.equal(valid.body.enrollment.progress, 50);
});
test('applications use verified identity and remain saved when mail delivery fails', async () => {
    let stored; let removed = false;
    const controller = createApplicationController({ Jobs: { findById: async () => ({ _id: id }) }, Applications: { findOne: async () => null, create: async data => { stored = data; return data; } }, notify: async () => { throw new Error('mail offline'); }, removeUpload: async () => { removed = true; } });
    const req = request({ applicantName: 'Applicant', applicantPhone: '12345678', applicantUserId: 'victim', applicantEmail: 'victim@example.test' }); req.file = { filename: 'resume.pdf', path: '/test/resume.pdf' };
    const res = response(); await controller(req, res); assert.equal(res.code, 201); assert.equal(stored.applicantUserId, 'owner'); assert.equal(stored.applicantEmail, 'owner@example.test'); assert.equal(removed, false); assert.doesNotMatch(res.body.message, /notified/);
});
test('closed jobs reject uploads; duplicate applications reuse the prior record and clean unused uploads', async () => {
    let removed = 0;
    const dependencies = { Jobs: { findById: async () => ({ _id: id, applicationDeadline: new Date(0) }) }, Applications: { findOne: async () => null }, removeUpload: async () => { removed++; } };
    const req = request(); req.file = { path: '/test/resume.pdf' };
    const closed = response(); await createApplicationController(dependencies)(req, closed); assert.equal(closed.code, 409); assert.equal(removed, 1);
    dependencies.Applications.findOne = async () => ({ _id: 'existing' }); const duplicate = response(); await createApplicationController(dependencies)(req, duplicate); assert.equal(duplicate.body.application._id, 'existing'); assert.equal(removed, 2);
});
test('scheme guidance does not invent eligibility or satisfied criteria', () => {
    const guidance = evaluateSchemeGuidance({ name: 'A scheme', state: 'Tamil Nadu', eligibility: ['Age 21–40'] });
    assert.equal(guidance.isEligible, null); assert.deepEqual(guidance.matchedCriteria, []); assert.ok(guidance.missingCriteria.includes('Age 21–40'));
    assert.equal(evaluateSchemeGuidance({ state: 'Tamil Nadu' }, { state: 'Kerala' }).matchScore, 0);
});
test('offline storage fails before job or course writes execute', () => {
    const res = response(); createDatabaseMiddleware({ readyState: 0 })({}, res, () => assert.fail('must not proceed')); assert.equal(res.code, 503);
});

test('authentication rejects forged claims and fails closed when no verifier is configured', async () => {
    const { createTokenMiddleware } = await import('../middleware/auth.js');
    const req = { headers: { authorization: 'Bearer unsigned.claims.token' } };
    const unavailable = response(); await createTokenMiddleware({ verify: null })(req, unavailable, () => assert.fail('unverified claims must not pass')); assert.equal(unavailable.code, 503);
    const invalid = response(); await createTokenMiddleware({ verify: async () => { throw new Error('bad signature'); } })(req, invalid, () => assert.fail('bad signature')); assert.equal(invalid.code, 401);
    let passed = false; await createTokenMiddleware({ verify: async () => ({ uid: 'verified', email: 'a@example.test' }) })(req, response(), () => { passed = true; }); assert.equal(passed, true); assert.equal(req.user.uid, 'verified');
});

test('only the posting owner can review applications or update statuses', async () => {
    const { createRecruiterController } = await import('../controllers/recruiterController.js');
    let ownerQuery; let updateQuery;
    const dependencies = { Jobs: { findOne: async query => { ownerQuery = query; return null; } }, Applications: { findOneAndUpdate: async query => { updateQuery = query; return { status: 'Shortlisted' }; } } };
    const req = request({ status: 'Shortlisted', userId: 'victim' }); req.params.applicationId = id;
    const denied = response(); await createRecruiterController(dependencies).update(req, denied); assert.equal(denied.code, 404); assert.equal(updateQuery, undefined);
    assert.deepEqual(ownerQuery, { _id: id, createdBy: 'owner' });
    dependencies.Jobs.findOne = async () => course;
    const accepted = response(); await createRecruiterController(dependencies).update(req, accepted); assert.equal(accepted.code, 200); assert.deepEqual(updateQuery, { _id: id, jobId: id });
    const invalid = response(); await createRecruiterController(dependencies).update({ ...req, body: { status: 'Anything' } }, invalid); assert.equal(invalid.code, 400);
});
