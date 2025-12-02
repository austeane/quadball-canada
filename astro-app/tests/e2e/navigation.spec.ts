import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.describe('Header', () => {
    test('header is visible', async ({ page }) => {
      await page.goto('/');

      // Use site-header class to avoid Astro dev toolbar headers
      const header = page.locator('header.site-header');
      await expect(header).toBeVisible();
    });

    test('logo links to homepage', async ({ page }) => {
      await page.goto('/news/');

      // Find the logo/home link
      const homeLink = page.locator('header a[href="/"]').first();
      await homeLink.click();

      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Page Navigation via URLs', () => {
    test('news page is accessible', async ({ page }) => {
      await page.goto('/news/');

      await expect(page).toHaveURL(/\/news\/?$/);
      await expect(page.locator('main h1')).toContainText('News');
    });

    test('events page is accessible', async ({ page }) => {
      await page.goto('/events/');

      await expect(page).toHaveURL(/\/events\/?$/);
      await expect(page.locator('main h1')).toContainText('Events');
    });

    test('teams page is accessible', async ({ page }) => {
      await page.goto('/teams/');

      await expect(page).toHaveURL(/\/teams\/?$/);
      await expect(page.locator('main h1')).toContainText('Teams');
    });

    test('about page is accessible', async ({ page }) => {
      await page.goto('/about/');

      await expect(page).toHaveURL(/\/about\/?$/);
      await expect(page.locator('main h1')).toContainText('About');
    });
  });

  test.describe('Footer Navigation', () => {
    test('footer is visible on all pages', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('footer')).toBeVisible();

      await page.goto('/news/');
      await expect(page.locator('footer')).toBeVisible();

      await page.goto('/fr/');
      await expect(page.locator('footer')).toBeVisible();
    });

    test('footer contains social media links', async ({ page }) => {
      await page.goto('/');

      const footer = page.locator('footer');
      // Check for social media icons/links (common ones)
      const socialLinks = footer.locator(
        'a[href*="instagram"], a[href*="facebook"], a[href*="twitter"], a[href*="tiktok"]'
      );

      // At least one social link should exist
      const count = await socialLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Page Structure', () => {
    test('pages have proper semantic structure', async ({ page }) => {
      await page.goto('/');

      // Check for main content area
      await expect(page.locator('main')).toBeVisible();

      // Check for header
      await expect(page.locator('header')).toBeVisible();

      // Check for footer
      await expect(page.locator('footer')).toBeVisible();
    });

    test('pages have exactly one h1 in main content', async ({ page }) => {
      await page.goto('/news/');

      const h1Count = await page.locator('main h1').count();
      expect(h1Count).toBe(1);
    });
  });

  test.describe('Responsive Layout', () => {
    test('page renders correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Main content should still be visible
      await expect(page.locator('main')).toBeVisible();
      // Use site-header class to avoid Astro dev toolbar headers
      await expect(page.locator('header.site-header')).toBeVisible();
    });

    test('page renders correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');

      await expect(page.locator('main')).toBeVisible();
      // Use site-header class to avoid Astro dev toolbar headers
      await expect(page.locator('header.site-header')).toBeVisible();
    });
  });
});
