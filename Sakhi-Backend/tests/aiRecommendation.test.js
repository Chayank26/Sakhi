import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRecommendationSet } from '../services/aiRecommendationService.js';

test('buildRecommendationSet ranks jobs, courses, and schemes with clear rationale', () => {
  const result = buildRecommendationSet({
    query: 'Find frontend jobs and web development courses in Chennai',
    profile: { goal: 'Frontend Developer', city: 'Chennai', skills: ['React', 'JavaScript'] },
    grounding: {
      jobs: [
        { title: 'Frontend Developer', company: 'Sakhi Labs', location: 'Chennai' },
        { title: 'React Engineer', company: 'NovaWorks', location: 'Remote' }
      ],
      courses: [
        { title: 'React for Beginners', category: 'Web Development' },
        { title: 'UI Design Essentials', category: 'Design' }
      ],
      schemes: [
        { name: 'Skill Development Grant', category: 'Education' }
      ]
    }
  });

  assert.equal(Array.isArray(result.recommendations), true);
  assert.ok(result.recommendations.some((item) => item.type === 'job' && item.title === 'Frontend Developer'));
  assert.ok(result.recommendations.some((item) => item.type === 'course' && item.title === 'React for Beginners'));
  assert.ok(result.recommendations.some((item) => item.type === 'scheme' && item.title === 'Skill Development Grant'));
  assert.ok(result.recommendations.every((item) => typeof item.reason === 'string' && item.reason.length > 0));
});

test('buildRecommendationSet returns a fallback when no data exists', () => {
  const result = buildRecommendationSet({
    query: 'Need guidance',
    profile: {},
    grounding: { jobs: [], courses: [], schemes: [] }
  });

  assert.equal(result.recommendations.length > 0, true);
  assert.equal(result.recommendations[0].type, 'general');
});
