import { test, expect } from '@playwright/test';

test.describe('Localization', () => {
  test.describe('Language Attributes', () => {
    test('English pages have lang="en" attribute', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');

      await page.goto('/news/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');

      await page.goto('/events/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });

    test('French pages have lang="fr" attribute', async ({ page }) => {
      await page.goto('/fr/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

      await page.goto('/fr/nouvelles/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

      await page.goto('/fr/evenements/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    });
  });

  test.describe('French Routes', () => {
    test('French homepage loads correctly', async ({ page }) => {
      await page.goto('/fr/');

      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
      await expect(page).toHaveTitle(/Site officiel/);
    });

    test('French news page uses correct route', async ({ page }) => {
      await page.goto('/fr/nouvelles/');

      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
      // French news page should have French title
      const h1Text = await page.locator('main h1').textContent();
      expect(h1Text?.toLowerCase()).toContain('nouvelle');
    });

    test('French events page uses correct route', async ({ page }) => {
      await page.goto('/fr/evenements/');

      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    });

    test('French teams page uses correct route', async ({ page }) => {
      await page.goto('/fr/equipes/');

      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    });

    test('French about page uses correct route', async ({ page }) => {
      await page.goto('/fr/a-propos/');

      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    });
  });

  test.describe('Localized Content', () => {
    test('English homepage shows English title', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveTitle(/Quadball Canada/);
    });

    test('French homepage shows French title', async ({ page }) => {
      await page.goto('/fr/');

      await expect(page).toHaveTitle(/Site officiel/);
    });
  });

  test.describe('Language Switcher', () => {
    test('page has link to French version', async ({ page }) => {
      await page.goto('/');

      // Check that a link to French version exists somewhere on the page
      const frLink = page.locator('a[href="/fr/"]').first();
      await expect(frLink).toBeAttached();
    });

    test('French page has link to English version', async ({ page }) => {
      await page.goto('/fr/');

      // Check that a link to English version exists somewhere on the page
      const enLink = page.locator('a[href="/"]').first();
      await expect(enLink).toBeAttached();
    });
  });

  test.describe('URL Structure', () => {
    test('English URLs do not have locale prefix', async ({ page }) => {
      await page.goto('/news/');

      const url = page.url();
      expect(url).not.toContain('/en/');
    });

    test('French URLs have /fr/ prefix', async ({ page }) => {
      await page.goto('/fr/nouvelles/');

      const url = page.url();
      expect(url).toContain('/fr/');
    });
  });

  test.describe('Alternate Links', () => {
    test('pages have hreflang link tags', async ({ page }) => {
      await page.goto('/');

      // Check for hreflang alternate links in head
      const alternateLinks = page.locator('link[rel="alternate"][hreflang]');
      const count = await alternateLinks.count();

      // Should have at least EN and FR alternates
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });
});
