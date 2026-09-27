import test from 'node:test';
import assert from 'node:assert/strict';
import { createChatHandler } from '../controllers/aiController.js';
import { generateAiResponseService } from '../services/aiService.js';
import { buildInputPrompt } from '../ai/conversationPrompt.js';
import { AiChatSession } from '../models/AiChatSession.js';

const cards = { jobs: [{ jobId: 'job-1', title: 'Frontend Developer' }], courses: [], schemes: [] };
const actions = [{ label: 'View jobs', route: '/jobs', type: 'navigation' }];
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('conversation request reaches the LLM with history, grounding and recommendations', async () => {
  let input;
  await generateAiResponseService({ messages: [
    { role: 'user', content: 'I know React' },
    { role: 'assistant', content: 'What would you like to do?' },
    { role: 'user', content: 'Find frontend jobs' }
  ] }, {
    retrieve: async ({ message }) => {
      assert.equal(message, 'Find frontend jobs');
      return { ...cards, actions };
    },
    callLlm: async (options) => { input = buildInputPrompt(options); return { text: 'Try this job', cards, actions }; }
  });
  assert.match(input, /User: I know React/);
  assert.match(input, /GROUNDING_CONTEXT:/);
  assert.match(input, /Frontend Developer/);
  assert.match(input, /RECOMMENDATION_CONTEXT:/);
});

test('chat persists both turns, title and rich response and returns the saved session', async () => {
  const session = new AiChatSession({ userId: 'owner' });
  let saved = false;
  session.save = async () => { saved = true; };
  const handler = createChatHandler({
    Session: { findOne: async (query) => { assert.equal(query.userId, 'owner'); return session; } },
    generateResponse: async () => ({ message: 'Here is a job', cards, actions })
  });
  const res = response();
  await handler({ user: { uid: 'owner' }, body: { sessionId: String(session._id), message: 'Find frontend jobs' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(saved, true);
  assert.equal(session.title, 'Find frontend jobs');
  assert.equal(session.messages.length, 2);
  // Serialize through the actual schema, as MongoDB/API responses do.
  const restored = new AiChatSession(JSON.parse(JSON.stringify(res.body.session)));
  assert.deepEqual(restored.messages[1].cards.jobs, cards.jobs);
  assert.deepEqual(restored.messages[1].actions, actions);
});

test('saved history is bounded for generation without removing stored turns', async () => {
  const session = new AiChatSession({ userId: 'owner', title: 'Existing title', messages:
    Array.from({ length: 30 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', content: `turn ${index}` })) });
  session.save = async () => {};
  const handler = createChatHandler({ Session: { findOne: async () => session }, generateResponse: async ({ messages }) => {
    assert.equal(messages.length, 12);
    assert.equal(messages.at(-1).content, 'Next question');
    assert.equal(messages.some((entry) => entry.content === 'turn 0'), false);
    return { message: 'Next answer' };
  } });
  await handler({ user: { uid: 'owner' }, body: { sessionId: String(session._id), message: 'Next question' } }, response());
  assert.equal(session.messages.length, 32);
  assert.equal(session.title, 'Existing title');
});

test('missing ownership and invalid sessions cannot generate or persist a response', async () => {
  const handler = createChatHandler({ Session: { findOne: async () => null }, generateResponse: async () => assert.fail('must not generate') });
  for (const [user, sessionId, status] of [[undefined, '507f1f77bcf86cd799439011', 401], [{ uid: 'other' }, '507f1f77bcf86cd799439011', 404], [{ uid: 'owner' }, 'local-123', 400]]) {
    const res = response();
    await handler({ user, body: { sessionId, message: 'Hello' } }, res);
    assert.equal(res.statusCode, status);
  }
});

test('generation failure leaves persisted conversation unchanged', async () => {
  const session = new AiChatSession({ userId: 'owner' });
  session.save = async () => assert.fail('failed generation must not save a partial turn');
  const handler = createChatHandler({ Session: { findOne: async () => session }, generateResponse: async () => {
    throw Object.assign(new Error('Provider unavailable'), { statusCode: 503 });
  } });
  const res = response();
  await handler({ user: { uid: 'owner' }, body: { sessionId: String(session._id), message: 'Hello' } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(session.messages.length, 0);
});

test('guest history is also bounded and keeps the latest user query', async () => {
  const messages = Array.from({ length: 40 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', content: `turn ${index}` }));
  messages.push({ role: 'user', content: 'My latest question' });
  await generateAiResponseService({ messages }, {
    retrieve: async ({ message }) => {
      assert.equal(message, 'My latest question');
      return { jobs: [], courses: [], schemes: [], actions: [] };
    },
    callLlm: async (options) => {
      assert.equal(options.messages.length, 12);
      const input = buildInputPrompt(options);
      assert.doesNotMatch(input, /User: turn 0\n/);
      assert.match(input, /My latest question/);
      return { text: 'An answer' };
    }
  });
});
