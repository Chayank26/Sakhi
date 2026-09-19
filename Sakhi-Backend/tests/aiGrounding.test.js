import test from 'node:test';
import assert from 'node:assert/strict';

import { buildGroundingContext, extractGroundingSignals } from '../services/aiGroundingService.js';

test('extractGroundingSignals prioritizes the user profile and query terms', () => {
  const signals = extractGroundingSignals('Find frontend jobs in Chennai for me', {
    goal: 'Frontend Developer',
    city: 'Chennai',
    skills: ['React', 'JavaScript'],
    interests: ['UI Design']
  });

  assert.match(signals.join(' '), /frontend/i);
  assert.match(signals.join(' '), /chennai/i);
  assert.match(signals.join(' '), /react/i);
});

test('buildGroundingContext summarizes structured job, course, and scheme results', () => {
  const context = buildGroundingContext({
    jobs: [{ title: 'Frontend Developer', company: 'Sakhi Labs', location: 'Chennai' }],
    courses: [{ title: 'React for Beginners', category: 'Web Development' }],
    schemes: [{ name: 'PM-Vidya', category: 'Education' }]
  });

  assert.match(context, /Frontend Developer/i);
  assert.match(context, /React for Beginners/i);
  assert.match(context, /PM-Vidya/i);
});
