import { test, expect } from '@playwright/test';

test.describe('IPM Recommendations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/ipm');
  });

  test('loads and displays IPM recommendation cards', async ({ page }) => {
    await expect(page.getByTestId('ipm-card').first()).toBeVisible({ timeout: 15000 });

    const count = await page.getByTestId('ipm-card').count();
    expect(count).toBeGreaterThan(0);
  });

  test('severity filter reduces visible cards to only matching entries', async ({ page }) => {
    await expect(page.getByTestId('ipm-card').first()).toBeVisible({ timeout: 15000 });

    const totalBefore = await page.getByTestId('ipm-card').count();

    // Open the Radix Select and pick Severe
    await page.getByTestId('filter-severity').click();
    await page.getByRole('option', { name: 'Severe' }).click();

    await page.waitForTimeout(600);

    const totalAfter = await page.getByTestId('ipm-card').count();
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);

    // Every visible card must contain the Severe badge
    const cards = page.getByTestId('ipm-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText('Severe');
    }
  });
});
