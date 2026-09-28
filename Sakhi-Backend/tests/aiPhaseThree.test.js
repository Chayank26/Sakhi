import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { AiChatSession } from '../models/AiChatSession.js';
import { createChatHandler } from '../controllers/aiController.js';
import { createFeedbackHandler } from '../controllers/aiFeedbackController.js';
import { createProfileHandlers } from '../controllers/aiProfileController.js';
import { normalizeAiProfile } from '../services/aiPersonalizationService.js';
import { generateAiResponseService } from '../services/aiService.js';
import { retrieveGroundingData } from '../services/aiRetrievalService.js';
import { summarizeResponseSignals } from '../services/aiFeedbackEvalService.js';
import { withRequestDeadline } from '../ai/requestPolicy.js';

const response = () => Object.assign(new EventEmitter(), { statusCode: 200, writableEnded: false,
    status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; this.writableEnded = true; return this; } });
const empty = { jobs: [], courses: [], schemes: [], actions: [] };

test('profile writes are bound to authenticated user and exclude contacts or injected identities', async () => {
    let saved;
    const handlers = createProfileHandlers({ findOneAndUpdate: async (filter, update) => {
        assert.deepEqual(filter, { userId: 'owner' }); saved = update.$set;
    } });
    const res = response();
    await handlers.put({ user: { uid: 'owner' }, body: { userId: 'victim', email: 'private@example.com', phone: 'secret', skills: ['React', 'React', 7], city: ' Chennai ', goal: 'Developer' } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(saved.skills, ['React']);
    assert.equal(saved.city, 'Chennai');
    assert.equal('userId' in saved, false);
    assert.equal('email' in saved, false);
    assert.equal('phone' in saved, false);
    assert.equal(normalizeAiProfile({ goal: 'a'.repeat(500) }).goal.length, 160);
});

test('changing saved profile changes card order and reasons without false location claims', async () => {
    const run = (skills) => generateAiResponseService({ message: 'Recommend jobs', profile: { skills, city: 'Chennai' } }, {
        retrieve: async () => ({ ...empty, domains: ['jobs'], status: { jobs: 'matched' }, jobs: [
            { jobId: 'python', title: 'Python Developer', skills: ['Python'], location: 'Delhi' },
            { jobId: 'react', title: 'React Developer', skills: ['React'], location: 'Delhi' }
        ] }),
        callLlm: async ({ systemInstruction }) => { assert.match(systemInstruction, /Skills:/); return { text: 'Choose a matching role.' }; }
    });
    const react = await run(['React']);
    const python = await run(['Python']);
    assert.equal(react.cards.jobs[0].jobId, 'react');
    assert.equal(python.cards.jobs[0].jobId, 'python');
    assert.match(react.cards.jobs[0].recommendationReason, /React/);
    assert.doesNotMatch(react.cards.jobs[0].recommendationReason, /Chennai/);
});

test('generic retrieval uses preferences but explicit filters win', async () => {
    const profile = { skills: ['React'], city: 'Chennai', jobType: 'Remote' };
    await retrieveGroundingData({ message: 'Find jobs for me', profile }, { jobs: async (filters) => {
        assert.equal(filters.keyword, 'React'); assert.equal(filters.jobType, 'Remote'); assert.equal(filters.location, undefined);
        return { success: true, jobs: [] };
    } });
    await retrieveGroundingData({ message: 'Find Python jobs in Delhi', profile }, { jobs: async (filters) => {
        assert.equal(filters.keyword, 'python'); assert.equal(filters.location, 'delhi'); assert.equal(filters.jobType, undefined);
        return { success: true, jobs: [] };
    } });
});

test('retrying a saved turn returns the original response and keeps quality internal', async () => {
    const session = new AiChatSession({ userId: 'owner' });
    let generations = 0;
    const handler = createChatHandler({ loadProfile: async (uid) => { assert.equal(uid, 'owner'); return { skills: ['React'] }; },
        Session: {
            findOne: async () => session,
            findOneAndUpdate: async (filter, update) => {
                assert.equal(filter.userId, 'owner');
                assert.equal(filter['messages.turnId'].$ne, 'request-123');
                session.messages.push(...update.$push.messages.$each);
                return session;
            }
        }, generateResponse: async ({ profile }) => { generations++; assert.deepEqual(profile.skills, ['React']); return { message: 'Original reply', quality: { score: 60 } }; }
    });
    const req = { user: { uid: 'owner' }, body: { message: 'Find jobs', sessionId: String(session._id), clientTurnId: 'request-123' } };
    const first = response();
    await handler(req, first);
    const retry = response();
    await handler(req, retry);
    assert.equal(generations, 1);
    assert.equal(session.messages.length, 2);
    assert.equal(retry.body.message, 'Original reply');
    assert.equal(session.messages[1].quality.score, 60);
    assert.equal('quality' in first.body.session.messages[1], false);
    assert.equal('quality' in retry.body.session.messages[1], false);
    const conflict = response();
    await handler({ ...req, body: { ...req.body, message: 'A different question' } }, conflict);
    assert.equal(conflict.statusCode, 409);
});

test('feedback is stored only against an owned assistant reply and can be cleared', async () => {
    const session = new AiChatSession({ userId: 'owner', messages: [{ role: 'assistant', content: 'Reply' }] });
    const messageId = String(session.messages[0]._id);
    const handler = createFeedbackHandler({ updateOne: async (filter, update) => {
        assert.equal(filter.messages.$elemMatch.role, 'assistant');
        assert.equal(filter.messages.$elemMatch._id, messageId);
        if (filter.userId !== 'owner') return { matchedCount: 0 };
        session.messages[0].feedback = update.$set['messages.$.feedback'];
        return { matchedCount: 1 };
    } });
    const req = { user: { uid: 'owner' }, params: { sessionId: String(session._id), messageId }, body: { rating: 'down' } };
    const res = response(); await handler(req, res);
    const reloaded = new AiChatSession(JSON.parse(JSON.stringify(session)));
    assert.equal(reloaded.messages[0].feedback.rating, 'down');
    const other = response(); await handler({ ...req, user: { uid: 'other' } }, other);
    assert.equal(other.statusCode, 404);
    const invalid = response(); await handler({ ...req, body: { rating: 'invalid' } }, invalid);
    assert.equal(invalid.statusCode, 400);
    await handler({ ...req, body: { rating: null } }, response());
    assert.equal(session.messages[0].feedback.rating, null);
});

test('closing the request cancels generation and does not save a partial turn', async () => {
    const session = new AiChatSession({ userId: 'owner' });
    session.save = async () => assert.fail('cancelled turn must not be saved');
    const res = response();
    let signal;
    const handler = createChatHandler({ Session: { findOne: async () => session }, loadProfile: async () => ({}),
        generateResponse: async (options) => {
            signal = options.signal;
            res.emit('close');
            return { message: 'A late response' };
        }
    });
    await handler({ user: { uid: 'owner' }, body: { message: 'Hello', sessionId: String(session._id) } }, res);
    assert.equal(signal.aborted, true);
    assert.equal(session.messages.length, 0);
    assert.equal(res.body, undefined);
    assert.equal(res.listenerCount('close'), 0);
});

test('caller cancellation aborts the provider budget immediately', async () => {
    const controller = new AbortController();
    let providerSignal;
    const pending = withRequestDeadline(async ({ signal }) => {
        providerSignal = signal;
        return new Promise(() => {});
    }, 1000, controller.signal);
    controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(providerSignal.aborted, true);
});

test('internal review signals count negative feedback and low heuristic scores', () => {
    assert.deepEqual(summarizeResponseSignals([
        { role: 'assistant', quality: { score: 100 }, feedback: { rating: 'down' } },
        { role: 'assistant', quality: { score: 60 }, feedback: { rating: 'up' } },
        { role: 'user', content: 'Question' }
    ]), { replies: 2, averageScore: 80, feedback: { up: 1, down: 1, total: 2 }, needsReview: 2 });
});

test('overlapping retries atomically persist one turn and return the same canonical answer', async () => {
    const session = new AiChatSession({ userId: 'owner' });
    let arrivals = 0;
    let release;
    const bothGenerating = new Promise((resolve) => { release = resolve; });
    const handler = createChatHandler({
        loadProfile: async () => ({}),
        Session: {
            findOne: async () => session,
            findOneAndUpdate: async (filter, update) => {
                if (session.messages.some((entry) => entry.turnId === filter['messages.turnId'].$ne)) return null;
                session.messages.push(...update.$push.messages.$each);
                return session;
            }
        },
        generateResponse: async () => {
            const attempt = ++arrivals;
            if (arrivals === 2) release();
            await bothGenerating;
            return { message: `Answer from attempt ${attempt}` };
        }
    });
    const req = { user: { uid: 'owner' }, body: { sessionId: String(session._id), message: 'Hello', clientTurnId: 'same-request-123' } };
    const first = response();
    const second = response();
    await Promise.all([handler(req, first), handler(req, second)]);
    assert.equal(arrivals, 2);
    assert.equal(session.messages.length, 2);
    assert.equal(first.body.message, second.body.message);
    assert.equal(first.body.message, session.messages[1].content);
});
