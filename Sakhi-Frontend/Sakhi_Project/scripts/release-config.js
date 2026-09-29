export function releaseConfigErrors(env) {
  const errors = [];
  const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'];
  const placeholder = value => !value?.trim() || /your[_-]|<[^>]+>|placeholder/i.test(value);
  for (const key of required) if (placeholder(env[key])) errors.push(`${key} must be explicitly configured.`);
  const raw = env.VITE_API_BASE_URL || env.VITE_API_URL;
  try {
    const url = new URL(raw);
    if (placeholder(raw) || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !['/api', '/api/'].includes(url.pathname)) throw new Error();
  } catch { errors.push('VITE_API_BASE_URL (or VITE_API_URL) must be an HTTPS API URL ending in /api.'); }
  if (env.VITE_API_BASE_URL && env.VITE_API_URL && env.VITE_API_BASE_URL.replace(/\/+$/, '') !== env.VITE_API_URL.replace(/\/+$/, '')) errors.push('The two API URL settings conflict; configure only VITE_API_BASE_URL.');
  if (env.VITE_FIREBASE_AUTH_DOMAIN && !/^[a-z\d.-]+$/i.test(env.VITE_FIREBASE_AUTH_DOMAIN)) errors.push('VITE_FIREBASE_AUTH_DOMAIN must be a hostname without a scheme or path.');
  return errors;
}
