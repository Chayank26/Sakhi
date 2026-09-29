import { pathToFileURL } from 'node:url';

export function deploymentOrigin(value, allowLocal = false) {
  const url = new URL(value);
  const local = allowLocal && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Use HTTPS origins without paths or credentials. --allow-local permits local HTTP.');
  return url.origin;
}

// Read-only checks: no model calls, account creation, uploads or emails.
export async function runSmoke({ apiOrigin, webOrigin, token, fetchImpl = fetch }) {
  const checks = [];
  const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); };
  const request = async (url, options = {}) => fetchImpl(url, { redirect: 'error', signal: AbortSignal.timeout(15000), ...options });
  const health = await request(`${apiOrigin}/api/health`);
  const healthBody = await health.json();
  check('Database readiness', health.status === 200 && healthBody.status === 'ok' && healthBody.database?.ready === true);
  check('API request IDs and no-store caching', Boolean(health.headers.get('x-request-id')) && health.headers.get('cache-control')?.includes('no-store'));
  const denied = await request(`${apiOrigin}/api/me`);
  check('Account requires authentication', denied.status === 401);
  const preflight = await request(`${apiOrigin}/api/ai/chat`, { method: 'OPTIONS', headers: { Origin: webOrigin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' } });
  const allowed = preflight.headers.get('access-control-allow-headers')?.toLowerCase() || '';
  check('Frontend CORS and authorization preflight', preflight.ok && preflight.headers.get('access-control-allow-origin') === webOrigin && allowed.includes('authorization') && allowed.includes('content-type'));
  const rejected = await request(`${apiOrigin}/api/health`, { headers: { Origin: 'https://untrusted-origin.invalid' } });
  check('Untrusted browser origin is rejected', rejected.status === 403 && !rejected.headers.get('access-control-allow-origin'));
  if (token) {
    const account = await request(`${apiOrigin}/api/me`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await account.json();
    check('Supplied test account is accepted', account.ok && body.saved && Array.isArray(body.applications));
  }
  let asset;
  for (const path of ['/', '/ai', '/jobs', '/academy', '/schemes', '/support']) {
    const page = await request(`${webOrigin}${path}`);
    const html = await page.text();
    check(`SPA route ${path}`, page.ok && page.headers.get('content-type')?.includes('text/html') && /id=["']root["']/.test(html));
    check(`HTML revalidation ${path}`, /(?:no-cache|no-store|must-revalidate)/i.test(page.headers.get('cache-control') || ''));
    check(`Frontend security headers ${path}`, page.headers.get('x-content-type-options') === 'nosniff' && page.headers.get('x-frame-options') === 'DENY');
    asset ||= html.match(/<script[^>]+src=["']([^"']+\.js)["']/)?.[1];
  }
  const assetUrl = asset && new URL(asset, webOrigin);
  if (assetUrl?.origin === webOrigin && assetUrl.pathname.startsWith('/assets/')) {
    const js = await request(assetUrl.href);
    check('Versioned JavaScript asset', js.ok && /javascript/.test(js.headers.get('content-type') || '') && /immutable/.test(js.headers.get('cache-control') || ''));
  } else check('Versioned JavaScript asset', false);
  return checks;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const value = name => args[args.indexOf(name) + 1];
  try {
    if (!args.includes('--api') || !args.includes('--web')) throw new Error('Usage: node scripts/release-smoke.mjs --api https://API_HOST --web https://WEB_HOST [--allow-local]');
    const allowLocal = args.includes('--allow-local');
    const checks = await runSmoke({ apiOrigin: deploymentOrigin(value('--api'), allowLocal), webOrigin: deploymentOrigin(value('--web'), allowLocal), token: process.env.SAKHI_SMOKE_TOKEN });
    for (const check of checks) console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name}`);
    if (!process.env.SAKHI_SMOKE_TOKEN) console.log('SKIP authenticated-account check (SAKHI_SMOKE_TOKEN is unset).');
    if (checks.some(check => !check.ok)) process.exitCode = 1;
  } catch {
    console.error('Smoke checks could not complete. Verify --api/--web HTTPS origins, connectivity and host access; response bodies and credentials are not logged.');
    process.exitCode = 1;
  }
}
