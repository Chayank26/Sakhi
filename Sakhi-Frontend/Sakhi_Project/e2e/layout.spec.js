import { test, expect } from '@playwright/test';

const id = '507f1f77bcf86cd799439011';
const post = { id, title: 'Building confidence for a new career', content: 'A supportive community makes learning easier. Share your experience and encourage someone taking their first step.', category: 'Career', author: { uid: 'member', name: 'Community Member' }, likesCount: 3, commentsCount: 1 };

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:5186' ? route.continue() : route.abort());
  await page.route('**/api/**', route => route.fulfill({ json: { success: true, jobs: [], courses: [], schemes: [], posts: [], totalPages: 1 } }));
  await page.route(`**/api/community/posts/${id}`, route => route.fulfill({ json: { success: true, post } }));
  await page.route(`**/api/community/posts/${id}/comments`, route => route.fulfill({ json: { success: true, comments: [{ id: 'comment-1', author: { name: 'Another Member' }, content: 'Thank you for sharing these practical ideas. I am looking forward to trying them this week.' }] } }));
});

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

async function signIn(page) {
  const user = { localId: 'browser-test-user', email: 'browser@example.test', displayName: 'Browser Test', emailVerified: true };
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'none' })}.${encode({ sub: user.localId, user_id: user.localId, email: user.email, iat: now, exp: now + 3600, auth_time: now })}.test`;
  await page.route('https://identitytoolkit.googleapis.com/**', route => route.fulfill({ json: route.request().url().includes('accounts:lookup') ? { users: [user] } : { ...user, idToken: token, refreshToken: 'fixture-only', expiresIn: '3600', registered: true } }));
  await page.route('**/api/me', route => route.fulfill({ json: { saved: { jobs: [], courses: [], schemes: [] }, applications: [], enrollments: [], profile: { name: 'Browser Test', bio: 'Learning new skills and exploring opportunities.', phone: '1234567890', age: 28 } } }));
  await page.route('**/api/ai/profile', route => route.fulfill({ json: { profile: { city: 'New Delhi', goal: 'Find a new role', skills: ['Communication', 'Digital literacy'], interests: [], jobType: 'Remote', level: 'Beginner' } } }));
  await page.goto('/profile');
  await page.getByPlaceholder('you@example.com').fill(user.email);
  await page.getByPlaceholder('Enter your password').fill('fixture-password');
  await page.locator('form').getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
}

test('direct discussion links load cards, aligned comments and a contained report dialog', async ({ page }, testInfo) => {
  await page.goto(`/community/post/${id}`);
  await expect(page.getByText(post.title, { exact: true })).toBeVisible();
  await expect(page.locator('.comment-text-body')).toBeVisible();
  const form = await page.locator('.add-comment-form').boundingBox();
  const input = await page.locator('.add-comment-textarea').boundingBox();
  expect(Math.abs(form.width - input.width)).toBeLessThan(2);
  await expect(page.locator('.community-post-card')).toHaveCSS('background-color', 'rgb(250, 240, 230)');
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('discussion.png'), fullPage: true });
  await page.getByTitle('Report Comment').click();
  const dialog = page.locator('.community-modal-card');
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
  await page.screenshot({ path: testInfo.outputPath('report-dialog.png'), fullPage: true });
  await page.getByRole('button', { name: 'Close modal' }).click();
  await expect(dialog).toHaveCount(0);
});

test('directory styles remain stable after navigating through other lazy pages', async ({ page }, testInfo) => {
  await page.goto('/jobs');
  await expect(page.locator('.jobs-search-bar')).toBeVisible();
  const sample = () => page.locator('.jobs-search-bar').evaluate(node => {
    const style = getComputedStyle(node);
    return { height: node.getBoundingClientRect().height, padding: style.padding, gap: style.gap, background: style.backgroundColor };
  });
  const before = await sample();
  for (const path of ['/academy', '/schemes', '/community', '/jobs']) {
    await page.locator(`.home-header-shell a[href="${path}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await noOverflow(page);
  }
  await expect(page.locator('.jobs-search-bar')).toBeVisible();
  expect(await sample()).toEqual(before);
  await page.screenshot({ path: testInfo.outputPath('jobs.png'), fullPage: true });
});

test('profile and authoring forms align fields and wrap actions on small screens', async ({ page }, testInfo) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await expect(page.locator('.profile-edit-form')).toBeVisible();
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: testInfo.outputPath('profile-edit.png'), fullPage: true });
  await page.goto('/academy/create');
  await expect(page.locator('.lesson-material-card').first()).toBeVisible();
  const text = await page.locator('#lesson-content-0-0').boundingBox();
  const resource = await page.locator('#lesson-resource-0-0').boundingBox();
  expect(resource.y).toBeGreaterThan(text.y + text.height);
  expect(Math.abs(resource.x - text.x)).toBeLessThan(2);
  expect(Math.abs(resource.width - text.width)).toBeLessThan(2);
  await noOverflow(page);
  const publish = await page.getByRole('button', { name: 'Publish Course', exact: true }).boundingBox();
  expect(publish.height).toBeLessThan(80);
  await page.screenshot({ path: testInfo.outputPath('course-create.png'), fullPage: true });
  await page.goto('/community/create');
  await expect(page.locator('.dropzone-box')).toBeVisible();
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('post-create.png'), fullPage: true });
});
