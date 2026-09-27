import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIntent } from '../services/aiSearchIntent.js';
import { retrieveGroundingData } from '../services/aiRetrievalService.js';
import { generateAiResponseService } from '../services/aiService.js';
import { callCloudLlm } from '../ai/llm.js';
import { createWithRetry, getAiRequestPolicy, withRequestDeadline } from '../ai/requestPolicy.js';
import { literalRegex } from '../ai/tools/searchQuery.js';

const user = (content) => ({ role: 'user', content });
const empty = { jobs: [], courses: [], schemes: [], actions: [] };

test('extracts job topic/city, course requirements and scheme state', () => {
    assert.deepEqual(buildSearchIntent({ message: 'Find software jobs in Chennai' }).filters.jobs, { keyword: 'software', location: 'chennai' });
    assert.deepEqual(buildSearchIntent({ message: 'Recommend free beginner Python courses with certificates' }).filters.courses,
        { query: 'python', difficulty: 'Beginner', freeOnly: true, certificateAvailable: true });
    assert.deepEqual(buildSearchIntent({ message: 'Find maternity schemes in Tamil Nadu' }).filters.schemes, { query: 'maternity', state: 'tamil nadu' });
});

test('follow-ups retain topic, replace filters, and stop at unrelated conversation', () => {
    const messages = [user('Find software jobs in Chennai'), user('Only remote ones'), user('Only internships instead')];
    const remote = buildSearchIntent({ messages: messages.slice(0, 2) });
    assert.equal(remote.filters.jobs.keyword, 'software');
    assert.equal(remote.filters.jobs.location, '');
    assert.equal(remote.filters.jobs.jobType, 'Remote');
    const moved = buildSearchIntent({ messages: messages.slice(0, 1), message: 'In Mumbai instead' });
    assert.equal(moved.filters.jobs.location, 'mumbai');
    assert.equal(moved.filters.jobs.keyword, 'software');
    assert.deepEqual(buildSearchIntent({ messages, message: 'Tell me a joke' }).domains, []);
    assert.deepEqual(buildSearchIntent({ messages, message: 'Find Python courses' }).domains, ['courses']);
});

test('multi-domain query gives each tool its own topic', async () => {
    const result = await retrieveGroundingData({ message: 'Find software jobs and Python courses plus maternity schemes' }, {
        jobs: async (filters) => { assert.equal(filters.keyword, 'software'); return { success: true, jobs: [{ jobId: '1' }] }; },
        courses: async (filters) => { assert.equal(filters.query, 'python'); return { success: true, courses: [] }; },
        schemes: async (filters) => { assert.equal(filters.query, 'maternity'); throw new Error('offline'); }
    });
    assert.deepEqual(result.status, { jobs: 'matched', courses: 'empty', schemes: 'unavailable' });
});

test('empty and unavailable searches explain the difference without calling Gemini', async () => {
    for (const [status, pattern] of [['empty', /No matching jobs/], ['unavailable', /temporarily unavailable/]]) {
        const result = await generateAiResponseService({ message: 'Find jobs' }, {
            retrieve: async () => ({ ...empty, domains: ['jobs'], status: { jobs: status } }),
            callLlm: async () => assert.fail('no records must not generate recommendations')
        });
        assert.match(result.message, pattern);
        assert.deepEqual(result.cards.jobs, []);
    }
});

test('partial retrieval keeps matched cards, explains unavailable data and disables duplicate tool search', async () => {
    const result = await generateAiResponseService({ message: 'Find jobs and courses' }, {
        retrieve: async () => ({ ...empty, jobs: [{ jobId: 'real', title: 'Developer' }], domains: ['jobs', 'courses'], status: { jobs: 'matched', courses: 'unavailable' } }),
        callLlm: async (options) => {
            assert.equal(options.allowTools, false);
            assert.match(options.prompt, /unavailable/);
            return { text: 'Here is a job', cards: { jobs: [{ jobId: 'invented' }] } };
        }
    });
    assert.equal(result.cards.jobs[0].jobId, 'real');
    assert.match(result.message, /courses data is temporarily unavailable/);
});

test('literal keyword regex cannot become a wildcard or catastrophic pattern', () => {
    assert.equal(literalRegex('.*').test('anything'), false);
    assert.equal(literalRegex('C++').test('C++ developer'), true);
    assert.equal(literalRegex('(a+)+$').test('aaaaaaaa'), false);
});

test('retry policy clamps configuration and retries only transient failures', async () => {
    assert.deepEqual(getAiRequestPolicy({ GEMINI_TIMEOUT_MS: 'invalid', GEMINI_MAX_RETRIES: '100' }), { timeoutMs: 45000, maxRetries: 2 });
    assert.equal(getAiRequestPolicy({ GEMINI_MAX_RETRIES: '0' }).maxRetries, 0);
    for (const status of [400, 401, 403, 404, 429, 422]) {
        let attempts = 0;
        await assert.rejects(withRequestDeadline((budget) => createWithRetry(async () => {
            attempts++; throw { status: String(status) };
        }, {}, budget, { maxRetries: 2, delayMs: 1 }), 100));
        assert.equal(attempts, 1);
    }
    let attempts = 0;
    const value = await withRequestDeadline((budget) => createWithRetry(async (_, options) => {
        assert.equal(options.maxRetries, 0);
        assert.ok(options.fetch_options.signal);
        if (++attempts === 1) throw { status: 503 };
        return 'recovered';
    }, {}, budget, { maxRetries: 1, delayMs: 1 }), 100);
    assert.equal(value, 'recovered');
    assert.equal(attempts, 2);
});

test('hung provider aborts within a shared deadline', async () => {
    let signal;
    await assert.rejects(callCloudLlm({ prompt: 'hello' }, {
        apiKey: 'test', policy: { timeoutMs: 15, maxRetries: 0 },
        client: { interactions: { create: async (_, options) => { signal = options.fetch_options.signal; return new Promise(() => {}); } } }
    }), (error) => error.statusCode === 504);
    assert.equal(signal.aborted, true);
});

test('provider function calls are returned as structured results and multipart text is retained', async () => {
    let calls = 0;
    const result = await callCloudLlm({ prompt: 'Find jobs' }, {
        apiKey: 'test', policy: { timeoutMs: 100, maxRetries: 0 },
        dispatch: async (name, args) => { assert.equal(name, 'searchJobs'); assert.equal(args.keyword, 'React'); return { success: true, jobs: [{ jobId: 'real' }] }; },
        client: { interactions: { create: async (payload) => {
            if (++calls === 1) {
                assert.equal(payload.tools[0].parameters.type, 'object');
                return { id: 'interaction-1', status: 'completed', steps: [{ type: 'function_call', id: 'call-1', name: 'searchJobs', arguments: { keyword: 'React' } }] };
            }
            assert.equal(payload.previous_interaction_id, 'interaction-1');
            assert.equal(payload.input[0].call_id, 'call-1');
            assert.equal(payload.input[0].type, 'function_result');
            return { steps: [{ type: 'model_output', content: [{ type: 'text', text: 'First part' }, { type: 'text', text: 'Second part' }] }] };
        } } }
    });
    assert.equal(result.text, 'First part\nSecond part');
    assert.equal(result.cards.jobs[0].jobId, 'real');
});

test('quota error returns provider retry delay and hides configuration details', async () => {
    for (const status of [429, 401, 404]) {
        await assert.rejects(callCloudLlm({ prompt: 'hello' }, {
            apiKey: 'test', policy: { timeoutMs: 100, maxRetries: 1 },
            client: { interactions: { create: async () => { throw { status, headers: { 'retry-after': '12' }, message: 'secret-key' }; } } }
        }), (error) => {
            assert.equal(error.statusCode, status === 429 ? 429 : 503);
            assert.doesNotMatch(error.message, /secret-key/);
            if (status === 429) assert.equal(error.retryAfter, 12);
            return true;
        });
    }
});
