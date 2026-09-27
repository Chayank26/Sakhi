import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { searchJobsToolHandler } from '../ai/tools/jobTool.js';
import { searchCoursesToolHandler } from '../ai/tools/courseTool.js';
import { searchGovernmentSchemesToolHandler } from '../ai/tools/schemeTool.js';
import { retrieveGroundingData } from '../services/aiRetrievalService.js';
import { getDatabaseHealth, createHealthCheck, createDatabaseMiddleware, connectDB } from '../config/db.js';

const matches = (record, query) => Object.entries(query).every(([key, value]) => {
    if (key === '$and') return value.every((part) => matches(record, part));
    if (key === '$or') return value.some((part) => matches(record, part));
    if (value instanceof RegExp) return [record[key]].flat().some((item) => typeof item === 'string' && value.test(item));
    if (value && typeof value === 'object' && '$gt' in value) return record[key] > value.$gt;
    return record[key] === value;
});
const mockCollection = (records) => {
    const calls = [];
    const model = { find(query) {
        calls.push(query);
        return { sort() { return this; }, limit() { return this; },
            maxTimeMS(ms) { assert.equal(ms, 3000); return this; },
            async lean() { return records.filter((record) => matches(record, query)); } };
    } };
    return { model, calls, isConnected: () => true };
};
const response = () => ({ status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });

test('real retrieval and query builders select job fixtures by keyword, city and remote flag', async () => {
    const collection = mockCollection([
        { _id: 'chennai', title: 'Software Developer', location: 'Chennai', remote: false },
        { _id: 'remote', title: 'Software Developer', location: 'India', employmentType: 'Full Time', remote: true },
        { _id: 'wrong', title: 'Accountant', location: 'Chennai', remote: false }
    ]);
    const initial = await retrieveGroundingData({ message: 'Find software jobs in Chennai' }, { jobs: (args) => searchJobsToolHandler(args, collection) });
    assert.deepEqual(initial.jobs.map((job) => job.jobId), ['chennai']);
    const followup = await retrieveGroundingData({ messages: [{ role: 'user', content: 'Find software jobs in Chennai' }], message: 'Only remote ones' }, { jobs: (args) => searchJobsToolHandler(args, collection) });
    assert.deepEqual(followup.jobs.map((job) => job.jobId), ['remote']);
});

test('course retrieval respects public visibility, free price, difficulty and certificate filters', async () => {
    const base = { title: 'Python', visibility: 'Public', difficulty: 'Beginner', certificateAvailable: true, price: 0 };
    const collection = mockCollection([
        { ...base, _id: 'matching' }, { ...base, _id: 'private', visibility: 'Private' },
        { ...base, _id: 'paid', price: 200 }, { ...base, _id: 'advanced', difficulty: 'Advanced' }
    ]);
    const result = await retrieveGroundingData({ message: 'Free beginner Python courses with certificates' }, { courses: (args) => searchCoursesToolHandler(args, collection) });
    assert.deepEqual(result.courses.map((course) => course.courseId), ['matching']);
    const missing = await retrieveGroundingData({ message: 'Find quantum courses' }, { courses: (args) => searchCoursesToolHandler(args, collection) });
    assert.equal(missing.status.courses, 'empty');
    assert.equal(collection.calls.length, 2, 'no unrelated fallback query');
});

test('scheme searches respect state and include national schemes without unrelated fallback', async () => {
    const collection = mockCollection([
        { _id: 'local', name: 'Maternity support', state: 'Tamil Nadu' },
        { _id: 'national', name: 'Maternity support', state: 'All India' },
        { _id: 'other-state', name: 'Maternity support', state: 'Kerala' },
        { _id: 'unrelated', name: 'Housing support', state: 'Tamil Nadu' }
    ]);
    const result = await retrieveGroundingData({ message: 'Maternity schemes in Tamil Nadu' }, { schemes: (args) => searchGovernmentSchemesToolHandler(args, collection) });
    assert.deepEqual(result.schemes.map((scheme) => scheme.schemeId), ['local', 'national']);
    const missing = await retrieveGroundingData({ message: 'Agriculture schemes in Tamil Nadu' }, { schemes: (args) => searchGovernmentSchemesToolHandler(args, collection) });
    assert.equal(missing.status.schemes, 'empty');
    assert.equal(collection.calls.length, 2);
});

test('health and persisted-session middleware reflect connection transitions', () => {
    let state = 0;
    const connection = { get readyState() { return state; } };
    const healthCheck = createHealthCheck(connection);
    const requireDatabase = createDatabaseMiddleware(connection);
    for (const nextState of [0, 2, 1, 3, 0]) {
        state = nextState;
        const res = response();
        healthCheck({}, res);
        assert.equal(res.code, state === 1 ? 200 : 503);
        assert.equal(getDatabaseHealth(connection).ready, state === 1);
        let continued = false;
        requireDatabase({}, res, () => { continued = true; });
        assert.equal(continued, state === 1);
    }
});

test('connection failures return false without printing connection credentials', async (t) => {
    t.mock.method(mongoose, 'connect', async () => { throw new Error('secret-uri'); });
    const logged = t.mock.method(console, 'error', () => {});
    assert.equal(await connectDB(), false);
    assert.doesNotMatch(JSON.stringify(logged.mock.calls.map((call) => call.arguments)), /secret-uri/);
});
