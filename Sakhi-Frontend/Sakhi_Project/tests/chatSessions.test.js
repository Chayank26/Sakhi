import test from 'node:test';
import assert from 'node:assert/strict';
import { chatSessionReducer as reduce, createChatState, mapSessionToSidebar } from '../src/components/pages/ai/chatSessionUtils.js';

const saved = (id) => mapSessionToSidebar({ _id: id, messages: [{ _id: 'turn', role: 'user', content: id }] });

test('sending messages updates one stable session instead of creating sidebar entries', () => {
  let state = createChatState('draft');
  for (let index = 0; index < 5; index++) state = reduce(state, { type: 'append', id: 'draft', message: { sender: 'user', text: `hello ${index}` } });
  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].messages.length, 5);
  assert.equal(state.sessions[0].title, 'hello 0');
});

test('delayed session creation and reply do not change the newly selected conversation', () => {
  let state = createChatState('draft');
  state = reduce(state, { type: 'start', id: 'draft' });
  state = reduce(state, { type: 'new', id: 'another-draft' });
  state = reduce(state, { type: 'saved', previousId: 'draft', session: saved('database-id') });
  state = reduce(state, { type: 'append', id: 'database-id', message: { sender: 'ai', text: 'Late answer' } });
  assert.equal(state.activeId, 'another-draft');
  assert.equal(state.sessions.find((session) => session.id === 'another-draft').messages.length, 0);
  assert.equal(state.sessions.find((session) => session.id === 'database-id').messages.at(-1).text, 'Late answer');
  state = reduce(state, { type: 'select', id: 'database-id' });
  assert.equal(state.activeId, 'database-id');
});

test('reload preserves rich responses and legacy text-only messages', () => {
  const session = mapSessionToSidebar({ _id: 'saved', messages: [
    { role: 'user', content: 'Jobs' },
    { role: 'assistant', content: 'Found one', cards: { jobs: [{ jobId: '1' }] }, actions: [{ route: '/jobs' }] }
  ] });
  const state = reduce(createChatState('draft'), { type: 'loaded', sessions: [session], selectFirst: true });
  assert.equal(state.activeId, 'saved');
  assert.deepEqual(session.messages[1].cards.jobs, [{ jobId: '1' }]);
  assert.deepEqual(session.messages[1].actions, [{ route: '/jobs' }]);
  assert.deepEqual(session.messages[0].actions, []);
  assert.notEqual(session.messages[0].id, session.messages[1].id);
});

test('logout clears private messages, pending state and selected saved conversation', () => {
  let state = reduce(createChatState('draft'), { type: 'loaded', sessions: [saved('private')], selectFirst: true });
  state = reduce(state, { type: 'start', id: 'private' });
  state = reduce(state, { type: 'reset', id: 'guest' });
  assert.equal(state.activeId, 'guest');
  assert.equal(state.pendingId, null);
  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].messages.length, 0);
});

test('initial load respects a new chat opened while saved sessions were loading', () => {
  let state = reduce(createChatState('draft'), { type: 'new', id: 'chosen-draft' });
  state = reduce(state, { type: 'loaded', sessions: [saved('older-chat')], selectFirst: false });
  assert.equal(state.activeId, 'chosen-draft');
  assert.equal(state.ready, true);
});

test('replacing a saved response does not duplicate a session or overwrite another selection', () => {
  let state = reduce(createChatState('draft'), { type: 'loaded', sessions: [saved('a'), saved('b')], selectFirst: true });
  state = reduce(state, { type: 'select', id: 'b' });
  state = reduce(state, { type: 'saved', previousId: 'a', session: saved('a') });
  assert.equal(state.activeId, 'b');
  assert.equal(state.sessions.filter((session) => session.id === 'a').length, 1);
});
