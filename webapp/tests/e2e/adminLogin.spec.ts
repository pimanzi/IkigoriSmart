import { test, expect } from '@playwright/test';

test.describe('Admin Login → Dashboard', () => {
  test('redirects to dashboard and shows KPI cards after valid login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 10000 });

    await expect(page.getByTestId('kpi-total-predictions')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('kpi-total-users')).toBeVisible();
    await expect(page.getByTestId('kpi-total-feedbacks')).toBeVisible();

    const predictionsText = await page.getByTestId('kpi-total-predictions').textContent();
    expect(Number(predictionsText?.match(/\d+/)?.[0])).toBeGreaterThanOrEqual(0);
  });

  test('shows an error message and stays on login page with wrong credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'badpassword1');
    await page.click('button[type="submit"]');

    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 8000 });
    await expect(page).toHaveURL(/login/);
  });
});
