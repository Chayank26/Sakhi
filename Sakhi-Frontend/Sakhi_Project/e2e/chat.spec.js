import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const id = '507f1f77bcf86cd799439011';
const response = {
  message: 'Here are some **starting points** for your next step.',
  cards: {
    jobs: [{ jobId: id, title: 'Remote support associate', company: 'Example Co', location: 'Remote', recommendationReason: 'Matches your interest in remote work.' }],
    courses: [{ courseId: id, title: 'Python foundations', price: 0, difficulty: 'Beginner' }],
    schemes: [{ schemeId: id, name: 'Enterprise support', governmentLevel: 'Central' }],
  },
  actions: [{ label: 'Browse opportunities', route: '/jobs?q=remote' }, { label: 'Unsafe action', route: 'https://example.invalid' }],
};

// Every external request is blocked; no production API, Firebase or AI calls.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === 'http://127.0.0.1:5186' ? route.continue() : route.abort();
  });
  await page.route('**/api/**', route => route.fulfill({ json: {} }));
  await page.route('**/api/ai/chat', route => route.fulfill({ json: response }));
});

async function openChat(page) {
  await page.goto('/ai');
  await expect(page.getByRole('textbox', { name: 'Message Sakhi AI' })).toBeEnabled();
}
async function send(page, text = 'Find remote work') {
  await page.getByRole('textbox', { name: 'Message Sakhi AI' }).fill(text);
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
}

test('welcome and recommendations are accessible, responsive and link to records', async ({ page }, testInfo) => {
  await openChat(page);
  await expect(page.getByRole('heading', { name: /What’s your next/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeDisabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('welcome.png'), fullPage: true });
  await page.getByRole('button', { name: /Find your next opportunity/ }).click();
  await expect(page.getByRole('article', { name: 'Sakhi response', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Details' })).toHaveAttribute('href', `/jobs/${id}`);
  await expect(page.getByRole('link', { name: 'Explore Course' })).toHaveAttribute('href', `/academy/course/${id}`);
  await expect(page.getByRole('link', { name: 'View Scheme' })).toHaveAttribute('href', `/schemes/${id}`);
  await expect(page.getByText('Free', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unsafe action' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Helpful response', exact: true })).toBeDisabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('conversation.png'), fullPage: true });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export conversation' }).click();
  expect((await download).suggestedFilename()).toMatch(/^Sakhi_Chat_.*\.txt$/);
});

test('multiline and IME input do not submit; Enter submits only once', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/ai/chat', route => { requests++; return route.fulfill({ json: { message: 'Understood.' } }); });
  await openChat(page);
  const input = page.getByRole('textbox', { name: 'Message Sakhi AI' });
  await input.fill('First line');
  await input.press('Shift+Enter');
  await input.press('End');
  await input.type('Second line');
  await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
  expect(requests).toBe(0);
  await expect(input).toHaveValue('First line\nSecond line');
  await input.press('Enter');
  await expect(page.getByText('Understood.', { exact: true })).toBeVisible();
  expect(requests).toBe(1);
  await expect(input).toHaveValue('');
  await expect(input).toHaveAttribute('maxlength', '6000');
});

test('HTTP retry delay is respected and retry keeps one user turn', async ({ page }) => {
  const requests = [];
  await page.route('**/api/ai/chat', route => {
    requests.push(route.request().postDataJSON());
    return requests.length === 1
      ? route.fulfill({ status: 429, headers: { 'Retry-After': '60', 'Access-Control-Expose-Headers': 'Retry-After' }, json: { message: 'Please try again shortly.' } })
      : route.fulfill({ json: { message: 'Recovered response.' } });
  });
  await page.clock.install();
  await openChat(page);
  await send(page);
  await expect(page.getByRole('article', { name: 'Response issue' })).toContainText('Please try again shortly.');
  await page.getByRole('button', { name: 'Retry message' }).click();
  await expect(page.getByRole('status')).toContainText('Please wait for the service retry delay');
  expect(requests).toHaveLength(1);
  await page.clock.fastForward(61000);
  await page.getByRole('button', { name: 'Retry message' }).click();
  await expect(page.getByText('Recovered response.', { exact: true })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Your message' })).toHaveCount(1);
  expect(requests[0].clientTurnId).toBe(requests[1].clientTurnId);
});

test('stopping and switching conversations do not mix replies', async ({ page, isMobile }) => {
  let release;
  let started;
  const requestStarted = new Promise(resolve => { started = resolve; });
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/api/ai/chat', async route => { started(); await pending; await route.fulfill({ json: { message: 'Late response' } }).catch(() => {}); });
  await openChat(page);
  await send(page, 'My first conversation');
  await requestStarted;
  await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeVisible();
  await page.locator('.ai-header-actions').getByRole('button', { name: 'New conversation' }).click();
  await expect(page.getByText('A response is running in another conversation.')).toBeVisible();
  await page.locator('.ai-composer').getByRole('button', { name: 'Stop response' }).click();
  release();
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
  if (isMobile) await page.getByRole('button', { name: 'Open chat history' }).click();
  await page.getByRole('navigation', { name: 'Conversations' }).getByRole('button', { name: /My first conversation/ }).click();
  await expect(page.getByRole('article', { name: 'Response issue' })).toContainText('Response stopped');
  await expect(page.getByText('Late response', { exact: true })).toHaveCount(0);
});

test('history is searchable and the mobile drawer restores keyboard focus', async ({ page, isMobile }) => {
  await openChat(page);
  await send(page, 'A memorable question');
  await expect(page.getByRole('article', { name: 'Sakhi response', exact: true })).toBeVisible();
  await page.locator('.ai-header-actions').getByRole('button', { name: 'New conversation' }).click();
  if (isMobile) {
    await page.getByRole('button', { name: 'Open chat history' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => Boolean(document.activeElement.closest('dialog')))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Open chat history' })).toBeFocused();
    await page.getByRole('button', { name: 'Open chat history' }).click();
  }
  await page.getByRole('textbox', { name: 'Search conversations' }).fill('missing');
  await expect(page.getByText('No matching conversations.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Search conversations' }).fill('memorable');
  await page.getByRole('navigation', { name: 'Conversations' }).getByRole('button', { name: /A memorable question/ }).click();
  await expect(page.getByRole('article', { name: 'Your message' })).toContainText('A memorable question');
});

test('prompt deep links send once and guest history clears on reload', async ({ page }) => {
  let requests = 0;
  await page.route('**/api/ai/chat', route => { requests++; return route.fulfill({ json: { message: 'Welcome from your link.' } }); });
  await page.goto('/ai?prompt=Help%20me%20learn');
  await expect(page.getByText('Welcome from your link.', { exact: true })).toBeVisible();
  await page.locator('.ai-header-actions').getByRole('button', { name: 'New conversation' }).click();
  await expect(page.getByRole('heading', { name: /What’s your next/ })).toBeVisible();
  expect(requests).toBe(1);
  await page.goto('/ai');
  await expect(page.getByRole('heading', { name: /What’s your next/ })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('signed-in conversations and feedback survive reload', async ({ page, isMobile }) => {
  const user = { localId: 'browser-test-user', email: 'browser@example.test', displayName: 'Browser Test', emailVerified: true };
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'none' })}.${encode({ sub: user.localId, user_id: user.localId, email: user.email, iat: now, exp: now + 3600, auth_time: now })}.test`;
  await page.route('https://identitytoolkit.googleapis.com/**', route => {
    const lookup = route.request().url().includes('accounts:lookup');
    return route.fulfill({ json: lookup ? { users: [user] } : { ...user, idToken: token, refreshToken: 'fixture-only', expiresIn: '3600', registered: true } });
  });
  await page.route('**/api/me', route => route.fulfill({ json: { saved: { jobs: [], courses: [], schemes: [] }, applications: [], enrollments: [], profile: {} } }));
  let saved = { _id: id, title: 'Saved conversation', messages: [] };
  await page.route('**/api/ai/sessions', route => route.fulfill({ json: route.request().method() === 'POST' ? { session: saved } : { sessions: saved.messages.length ? [saved] : [] } }));
  await page.route('**/api/ai/chat', route => {
    const body = route.request().postDataJSON();
    expect(route.request().headers().authorization).toBe(`Bearer ${token}`);
    expect(body.sessionId).toBe(id);
    saved = { ...saved, messages: [{ _id: 'u1', role: 'user', content: body.message }, { _id: 'a1', role: 'assistant', content: 'Your saved recommendation.', feedback: {} }] };
    return route.fulfill({ json: { session: saved } });
  });
  await page.route('**/api/ai/sessions/*/messages/*/feedback', route => {
    const { rating } = route.request().postDataJSON();
    saved.messages[1].feedback = { rating };
    return route.fulfill({ json: { rating } });
  });
  await openChat(page);
  if (isMobile) await page.getByRole('button', { name: 'Open chat history' }).click();
  await page.getByRole('link', { name: 'Sign in to save chats' }).click();
  await page.getByPlaceholder('you@example.com').fill(user.email);
  await page.getByPlaceholder('Enter your password').fill('fixture-password');
  await page.locator('form').getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/ai$/);
  await send(page, 'Save this question');
  await expect(page.getByText('Your saved recommendation.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Helpful response', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Helpful response', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByText('Your saved recommendation.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Helpful response', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('a failed route import offers a recoverable page error', async ({ page }) => {
  await page.route('**/src/components/pages/ai/AiChatPage.jsx', route => route.abort());
  await page.goto('/ai');
  await expect(page.getByRole('alert')).toContainText('This page couldn’t load.');
  await expect(page.getByRole('button', { name: 'Reload page' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to Sakhi' })).toHaveAttribute('href', '/home');
});

test('reading older messages is preserved until Latest message is selected', async ({ page }) => {
  let release;
  await page.route('**/api/ai/chat', route => route.fulfill({ json: { message: Array.from({ length: 35 }, (_, index) => `Paragraph ${index + 1}: helpful information to review.`).join('\n\n') } }));
  await openChat(page);
  await send(page);
  await expect(page.getByRole('article', { name: 'Sakhi response', exact: true })).toBeVisible();
  let started;
  const requestStarted = new Promise(resolve => { started = resolve; });
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/api/ai/chat', async route => { started(); await pending; await route.fulfill({ json: { message: 'Second reply.' } }); });
  await send(page, 'Tell me more');
  await requestStarted;
  await page.getByRole('region', { name: 'Messages', exact: true }).evaluate(node => { node.scrollTop = 0; node.dispatchEvent(new Event('scroll')); });
  await expect(page.getByRole('button', { name: 'Latest message' })).toBeVisible();
  release();
  await expect(page.getByText('Second reply.', { exact: true })).toBeAttached();
  expect(await page.getByRole('region', { name: 'Messages', exact: true }).evaluate(node => node.scrollTop)).toBe(0);
  await page.getByRole('button', { name: 'Latest message' }).click();
  await expect(page.getByText('Second reply.', { exact: true })).toBeInViewport();
});

test('public directories still render when opened directly after route splitting', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/**', route => route.fulfill({ json: { success: true, jobs: [], courses: [], schemes: [], posts: [], totalPages: 1 } }));
  for (const [path, heading] of [
    ['/jobs', 'Find Meaningful Career Opportunities'],
    ['/academy', 'Learn. Grow. Transform Your Career.'],
    ['/schemes', 'Find government support and opportunities you may be eligible for.'],
    ['/community', 'A safe space to connect, share and learn together.'],
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.locator('.home-header-pill')).toHaveCSS('display', 'flex');
  }
  expect(errors).toEqual([]);
});
