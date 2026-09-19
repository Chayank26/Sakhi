import test from 'node:test';
import assert from 'node:assert/strict';

import { buildToolExecutionPlan } from '../services/aiToolOrchestrationService.js';

test('buildToolExecutionPlan includes relevant tools for job and course queries', () => {
  const plan = buildToolExecutionPlan('Find frontend jobs and courses in Chennai for me', {
    goal: 'Frontend Developer',
    city: 'Chennai'
  });

  assert.deepEqual(plan, ['searchJobs', 'searchCourses']);
});

test('buildToolExecutionPlan includes schemes when the request is about grants or welfare support', () => {
  const plan = buildToolExecutionPlan('What government grants are available for women entrepreneurs?', {});

  assert.ok(plan.includes('searchGovernmentSchemes'));
});
