/**
 * Smoke tests aligned with USER_MANUAL.md (public flows + login UI).
 * Does NOT require seed_hierarchy.py — only a running frontend (and backend for optional API checks).
 */
const { test, expect } = require('@playwright/test');

const baseURL = process.env.PW_BASE_URL || 'http://localhost:3000';

function apiOrigin() {
  const u = process.env.PW_API_BASE || 'http://localhost:8000/api/v1';
  return new URL(u.replace(/\/$/, '')).origin;
}

test.describe('User manual – public & auth shell', () => {
  test('Manual 3: Homepage loads (marketing / pricing)', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText('404');
    const body = await page.locator('body').textContent();
    expect(/Login|Pricing|Sign|eRepairing|Customer/i.test(body || '')).toBeTruthy();
  });

  test('Manual 4: Organization signup page /signup loads', async ({ page }) => {
    await page.goto(`${baseURL}/signup`);
    await expect(page.locator('body')).toContainText(/Organization|Sign up|Admin|Step/i);
  });

  test('Manual 5: Customer signup page loads', async ({ page }) => {
    await page.goto(`${baseURL}/customer-signup`);
    await expect(page.locator('body')).toContainText(/customer|organization|sign up|email/i);
  });

  test('Manual 6: Verify email page loads', async ({ page }) => {
    await page.goto(`${baseURL}/verify-email?email=test%40example.com`);
    await expect(page.locator('body')).toContainText(/Verify|email|code/i);
  });

  test('Manual 7: Set password page shows invalid link without token', async ({ page }) => {
    await page.goto(`${baseURL}/set-password`);
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Invalid|missing|link|login/i);
  });

  test('Manual 8: Login page has email, password, submit', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await expect(page.getByPlaceholder(/admin@erepairing|email/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('Manual 8b: Invalid login stays on login or shows error', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.getByPlaceholder(/admin@erepairing|email/i).first().fill('not-a-real-user@example.com');
    await page.getByPlaceholder(/Enter your password|password/i).first().fill('wrongpassword');
    await page.getByRole('button', { name: /Sign In/i }).click();
    await page.waitForTimeout(2500);
    const onLogin = page.url().includes('/login');
    const err = await page.locator('body').textContent().then((t) => /incorrect|invalid|failed|unauthorized/i.test(t || ''));
    expect(onLogin || err).toBeTruthy();
  });
});

test.describe('User manual – backend health (optional)', () => {
  test('API docs respond when backend is up', async ({ request }) => {
    const res = await request.get(`${apiOrigin()}/api/docs`);
    expect(res.status()).toBe(200);
    expect((await res.text()).length).toBeGreaterThan(100);
  });
});
