import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseConfigErrors } from '../config/release.js';
import { deploymentOrigin, runSmoke } from '../../scripts/release-smoke.mjs';
const valid = { NODE_ENV: 'production', MONGODB_URI: 'mongodb://localhost/staging', FRONTEND_URL: 'https://web.example.test', PUBLIC_API_ORIGIN: 'https://api.example.test', FIREBASE_PROJECT_ID: 'staging-project', UPLOAD_DIR: '/var/data/uploads', TRUST_PROXY: '1', GEMINI_API_KEY: 'fixture-key', GEMINI_MODEL: 'configured-model', SMTP_HOST: 'smtp.example.test', SMTP_USER: 'sender', SMTP_PASS: 'fixture-pass', SMTP_PORT: '587', FROM_EMAIL: 'Sakhi <sender@example.test>' };
test('release config rejects absent services without exposing credentials', () => {
  assert.deepEqual(releaseConfigErrors(valid), []);
  const errors = releaseConfigErrors({ ...valid, GEMINI_API_KEY: '', SMTP_PORT: 'invalid', TRUST_PROXY: '' });
  assert.equal(errors.length, 3);
  assert.ok(errors.every(error => !error.includes('fixture-pass')));
  assert.ok(releaseConfigErrors({ ...valid, UPLOAD_DIR: 'relative' }).length);
});
test('smoke origins reject credentials, paths, insecure remote hosts and unexpected protocols', () => {
  assert.equal(deploymentOrigin('https://web.example.test/'), 'https://web.example.test');
  assert.equal(deploymentOrigin('http://127.0.0.1:1234', true), 'http://127.0.0.1:1234');
  for (const origin of ['http://web.example.test', 'https://user:pass@web.example.test', 'https://web.example.test/api', 'file:///tmp/a']) assert.throws(() => deploymentOrigin(origin));
});
function mockFetch({ healthy = true, cors = 'https://web.example.test', assetType = 'application/javascript', authenticated = true } = {}) {
  return async (url, options) => {
    assert.equal(options.redirect, 'error');
    const path = new URL(url).pathname;
    if (options.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': cors, 'access-control-allow-headers': 'Authorization,Content-Type' } });
    if (options.headers?.Origin) return new Response('{}', { status: 403 });
    if (path === '/api/health') return Response.json({ status: healthy ? 'ok' : 'degraded', database: { ready: healthy } }, { status: healthy ? 200 : 503, headers: { 'x-request-id': 'fixture', 'cache-control': 'no-store' } });
    if (path === '/api/me') return options.headers?.Authorization && authenticated ? Response.json({ saved: {}, applications: [] }) : new Response('{}', { status: 401 });
    if (path.startsWith('/assets/')) return new Response('code', { headers: { 'content-type': assetType, 'cache-control': 'public,max-age=31536000,immutable' } });
    return new Response('<div id="root"></div><script type="module" src="/assets/index-fixture.js"></script>', { headers: { 'content-type': 'text/html', 'cache-control': 'public,max-age=0,must-revalidate', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY' } });
  };
}
const origins = { apiOrigin: 'https://api.example.test', webOrigin: 'https://web.example.test' };
test('smoke verifies ready API, CORS, protected account, deep links and hashed assets', async () => {
  const checks = await runSmoke({ ...origins, token: 'fixture', fetchImpl: mockFetch() });
  assert.ok(checks.every(check => check.ok));
  assert.ok(checks.some(check => check.name === 'Supplied test account is accepted'));
});
test('smoke fails unhealthy DB, permissive CORS, rejected token and HTML masquerading as JS', async () => {
  const checks = await runSmoke({ ...origins, token: 'fixture', fetchImpl: mockFetch({ healthy: false, cors: '*', authenticated: false, assetType: 'text/html' }) });
  assert.equal(checks.filter(check => !check.ok).length, 4);
});
