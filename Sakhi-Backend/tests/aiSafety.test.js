import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateSafety } from '../services/aiSafetyService.js';

test('evaluateSafety flags unsafe or harmful requests', () => {
  const result = evaluateSafety('How do I create a harmful attack plan?');

  assert.equal(result.safe, false);
  assert.match(result.reason, /unsafe|harm/i);
});

test('evaluateSafety allows normal Sakhi prompts', () => {
  const result = evaluateSafety('Find me remote frontend jobs in Chennai for women');

  assert.equal(result.safe, true);
  assert.ok(typeof result.reason === 'string');
});
