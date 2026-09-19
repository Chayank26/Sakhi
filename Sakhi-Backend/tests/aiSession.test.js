import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSessionContext } from '../services/aiSessionService.js';

test('buildSessionContext keeps recent conversation turns and trims older ones', () => {
  const history = [
    { role: 'user', content: 'first message' },
    { role: 'assistant', content: 'reply one' },
    { role: 'user', content: 'second message' },
    { role: 'assistant', content: 'reply two' },
    { role: 'user', content: 'third message' },
    { role: 'assistant', content: 'reply three' }
  ];

  const context = buildSessionContext(history, 4);

  assert.equal(context.length, 4);
  assert.equal(context[0].content, 'second message');
  assert.equal(context[3].content, 'reply three');
});

test('buildSessionContext ignores invalid roles and empty content', () => {
  const history = [
    { role: 'user', content: 'hello' },
    { role: 'system', content: 'ignored' },
    { role: 'assistant', content: '   ' },
    { role: 'user', content: 'world' }
  ];

  const context = buildSessionContext(history, 10);

  assert.deepEqual(context, [
    { role: 'user', content: 'hello' },
    { role: 'user', content: 'world' }
  ]);
});
