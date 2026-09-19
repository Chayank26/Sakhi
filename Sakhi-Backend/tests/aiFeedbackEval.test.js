import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateResponseQuality, summarizeFeedback } from '../services/aiFeedbackEvalService.js';

test('evaluateResponseQuality rewards clear, relevant, actionable answers', () => {
  const result = evaluateResponseQuality({
    answer: 'Here are 3 job recommendations in Chennai for frontend roles, with reasons and next steps.',
    query: 'Find frontend jobs in Chennai',
    recommendationCount: 3
  });

  assert.equal(result.score >= 80, true);
  assert.equal(result.quality, 'good');
});

test('summarizeFeedback groups thumbs-up and thumbs-down counts cleanly', () => {
  const summary = summarizeFeedback([
    { rating: 'up' },
    { rating: 'up' },
    { rating: 'down' }
  ]);

  assert.equal(summary.up, 2);
  assert.equal(summary.down, 1);
});
