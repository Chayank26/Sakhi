import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProfileContext } from '../services/aiPersonalizationService.js';

test('buildProfileContext includes the user profile details that are present', () => {
  const profile = {
    name: 'Aisha',
    city: 'Chennai',
    goal: 'Frontend Developer',
    interests: ['React', 'UI Design'],
    email: 'aisha@example.com'
  };

  const context = buildProfileContext(profile);

  assert.match(context, /Aisha/);
  assert.match(context, /Chennai/);
  assert.match(context, /Frontend Developer/);
  assert.match(context, /React/);
  assert.match(context, /UI Design/);
});

test('buildProfileContext ignores missing and empty values', () => {
  const profile = {
    name: '',
    city: null,
    goal: 'Data Analyst',
    interests: []
  };

  const context = buildProfileContext(profile);

  assert.match(context, /Data Analyst/);
  assert.doesNotMatch(context, /name/i);
});
