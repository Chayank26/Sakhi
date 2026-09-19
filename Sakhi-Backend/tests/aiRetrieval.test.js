import test from 'node:test';
import assert from 'node:assert/strict';

import { retrieveGroundingData } from '../services/aiRetrievalService.js';

test('retrieveGroundingData skips retrieval for general conversation', async () => {
    const result = await retrieveGroundingData({ message: 'Hello, how are you?' });

    assert.deepEqual(result.domains, []);
    assert.deepEqual(result.jobs, []);
    assert.deepEqual(result.courses, []);
    assert.deepEqual(result.schemes, []);
});

test('retrieveGroundingData selects relevant domains and degrades safely without MongoDB', async () => {
    const result = await retrieveGroundingData({
        message: 'Find software jobs and courses for data skills, plus government scholarships.'
    });

    assert.deepEqual(result.domains, ['jobs', 'courses', 'schemes']);
    assert.ok(Array.isArray(result.jobs));
    assert.ok(Array.isArray(result.courses));
    assert.ok(Array.isArray(result.schemes));
});