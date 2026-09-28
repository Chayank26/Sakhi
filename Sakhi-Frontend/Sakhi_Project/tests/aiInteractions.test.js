import test from 'node:test';
import assert from 'node:assert/strict';
import { readLocalProfile, saveLocalProfile } from '../src/services/profileStorage.js';
import { chatSessionReducer as reduce, createChatState, mapSessionToSidebar } from '../src/components/pages/ai/chatSessionUtils.js';
import { buildChatTranscript } from '../src/components/pages/ai/chatExport.js';

test('local profile storage cannot migrate another account or malformed data', () => {
    const values = new Map();
    const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
    saveLocalProfile({ uid: 'a', email: 'a@example.com' }, { name: 'A', email: 'a@example.com' }, storage);
    assert.equal(readLocalProfile({ uid: 'a' }, storage).name, 'A');
    assert.deepEqual(readLocalProfile({ uid: 'b', email: 'b@example.com' }, storage), {});
    storage.setItem('sakhi_profile_b', '{broken');
    assert.deepEqual(readLocalProfile({ uid: 'b' }, storage), {});
});

test('retry replaces the failed turn rather than duplicating its user message', () => {
    let state = createChatState('draft');
    state = reduce(state, { type: 'append', id: 'draft', message: { id: 'user', sender: 'user', text: 'Hello', turnId: 'request-1' } });
    state = reduce(state, { type: 'patch', id: 'draft', messageId: 'user', patch: { failed: true } });
    state = reduce(state, { type: 'append', id: 'draft', message: { id: 'error', sender: 'ai', text: 'Stopped', isError: true, turnId: 'request-1' } });
    state = reduce(state, { type: 'retry', id: 'draft', turnId: 'request-1' });
    state = reduce(state, { type: 'append', id: 'draft', message: { id: 'retry', sender: 'user', text: 'Hello', turnId: 'request-1' } });
    assert.equal(state.sessions[0].messages.length, 1);
    assert.equal(state.sessions[0].messages[0].text, 'Hello');
});

test('feedback restores after reload and updates only its originating session', () => {
    const saved = mapSessionToSidebar({ _id: 'a', messages: [{ _id: 'reply', role: 'assistant', content: 'Hello', feedback: { rating: 'up' } }] });
    let state = reduce(createChatState('draft'), { type: 'loaded', sessions: [saved], selectFirst: true });
    state = reduce(state, { type: 'new', id: 'b' });
    state = reduce(state, { type: 'patch', id: 'a', messageId: 'a-reply', patch: { feedback: 'down' } });
    assert.equal(saved.messages[0].feedback, 'up');
    assert.equal(state.sessions.find((session) => session.id === 'a').messages[0].feedback, 'down');
    assert.equal(state.activeId, 'b');
    assert.equal(state.sessions.find((session) => session.id === 'b').messages.length, 0);
});

test('transcript includes card reasons and routes while excluding failed turns', () => {
    const transcript = buildChatTranscript([
        { sender: 'user', text: 'Failed prompt', failed: true },
        { sender: 'ai', text: 'Network error', isError: true },
        { sender: 'ai', timestamp: '12:00', text: 'Try this role', cards: { jobs: [{ title: 'React developer', recommendationReason: 'Matches React skills.' }] }, actions: [{ label: 'Jobs', route: '/jobs' }] }
    ], new Date('2026-09-27T00:00:00Z'));
    assert.match(transcript, /Matches React skills/);
    assert.match(transcript, /Jobs: \/jobs/);
    assert.doesNotMatch(transcript, /Failed prompt|Network error/);
});

test('reloading recent chats preserves a selected older conversation', () => {
    const saved = mapSessionToSidebar({ _id: 'older-chat', messages: [{ role: 'assistant', content: 'Older reply' }] });
    let state = reduce(createChatState('draft'), { type: 'loaded', sessions: [saved], selectFirst: true });
    state = reduce(state, { type: 'loaded', sessions: [], selectFirst: false });
    assert.equal(state.activeId, 'older-chat');
    assert.equal(state.sessions.find((session) => session.id === 'older-chat').messages[0].text, 'Older reply');
});
