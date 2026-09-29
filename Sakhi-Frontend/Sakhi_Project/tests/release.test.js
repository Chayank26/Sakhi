import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseConfigErrors } from '../scripts/release-config.js';
const valid = { VITE_API_BASE_URL: 'https://api.example.test/api', VITE_FIREBASE_API_KEY: 'fixture', VITE_FIREBASE_AUTH_DOMAIN: 'staging.firebaseapp.com', VITE_FIREBASE_PROJECT_ID: 'staging', VITE_FIREBASE_APP_ID: 'fixture-app' };
test('release builds require explicit backend and Firebase settings', () => {
  assert.deepEqual(releaseConfigErrors(valid), []);
  assert.ok(releaseConfigErrors({}).length >= 5);
  for (const url of ['http://api.example.test/api', 'https://user:secret@api.example.test/api', 'https://api.example.test', 'https://your-backend-domain.onrender.com/api']) assert.ok(releaseConfigErrors({ ...valid, VITE_API_BASE_URL: url }).length);
});
test('conflicting API settings and Firebase URL instead of hostname block release', () => {
  assert.equal(releaseConfigErrors({ ...valid, VITE_API_URL: 'https://other.example.test/api' }).length, 1);
  assert.equal(releaseConfigErrors({ ...valid, VITE_FIREBASE_AUTH_DOMAIN: 'https://staging.firebaseapp.com' }).length, 1);
});
