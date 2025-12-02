import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('English homepage loads', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Quadball Canada/);
    // Use main h1 to avoid Astro dev toolbar elements
    await expect(page.locator('main h1')).toContainText('Quadball Canada');
  });

  test('French homepage loads', async ({ page }) => {
    await page.goto('/fr/');

    await expect(page).toHaveTitle(/Site officiel/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('news page loads', async ({ page }) => {
    await page.goto('/news/');

    // Use main h1 to avoid Astro dev toolbar elements
    await expect(page.locator('main h1')).toContainText('News');
  });

  test('teams page loads', async ({ page }) => {
    await page.goto('/teams/');

    // Use main h1 to avoid Astro dev toolbar elements
    await expect(page.locator('main h1')).toContainText('Teams');
  });

  test('events page loads', async ({ page }) => {
    await page.goto('/events/');

    // Use main h1 to avoid Astro dev toolbar elements
    await expect(page.locator('main h1')).toContainText('Events');
  });
});
