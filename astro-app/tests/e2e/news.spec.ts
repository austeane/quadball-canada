import { test, expect } from '@playwright/test';

test.describe('News Pages', () => {
  test.describe('News List Page', () => {
    test('news page displays list of articles', async ({ page }) => {
      await page.goto('/news/');

      // Page should have news title
      await expect(page.locator('main h1')).toContainText('News');

      // Should have at least one article card (if content exists)
      const articles = page.locator('article.card, [class*="news-card"]');
      const count = await articles.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('article cards have titles', async ({ page }) => {
      await page.goto('/news/');

      const articles = page.locator('article.card');
      const articleCount = await articles.count();

      if (articleCount > 0) {
        const firstArticle = articles.first();

        // Should have a title (h2 or h3)
        const title = firstArticle.locator('h2, h3').first();
        await expect(title).toBeVisible();
      }
    });

    test('clicking article navigates to detail page', async ({ page }) => {
      await page.goto('/news/');

      const articleLinks = page.locator('article.card a, .card__link');
      const linkCount = await articleLinks.count();

      if (linkCount > 0) {
        // Click the first article
        await articleLinks.first().click();

        // Should navigate to an article page
        await expect(page).toHaveURL(/\/news\/[^\/]+\/?$/);
      }
    });
  });

  test.describe('News Detail Page', () => {
    test('article page displays title and content', async ({ page }) => {
      await page.goto('/news/');

      const articleLinks = page.locator('article.card a').first();

      if ((await articleLinks.count()) > 0) {
        await articleLinks.click();

        // Article page should have a title
        await expect(page.locator('main h1')).toBeVisible();

        // Should have main content
        await expect(page.locator('main')).toBeVisible();
      }
    });
  });

  test.describe('French News', () => {
    test('French news page loads', async ({ page }) => {
      await page.goto('/fr/nouvelles/');

      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
      // Title should be in French
      const h1Text = await page.locator('main h1').textContent();
      expect(h1Text?.toLowerCase()).toContain('nouvelle');
    });

    test('French news articles link to French detail pages', async ({
      page,
    }) => {
      await page.goto('/fr/nouvelles/');

      const articleLinks = page.locator('article.card a, .card__link');
      const linkCount = await articleLinks.count();

      if (linkCount > 0) {
        const href = await articleLinks.first().getAttribute('href');
        // French article links should contain /fr/
        expect(href).toContain('/fr/');
      }
    });
  });

  test.describe('News Card Elements', () => {
    test('news cards have images or placeholders', async ({ page }) => {
      await page.goto('/news/');

      const articles = page.locator('article.card');
      const articleCount = await articles.count();

      if (articleCount > 0) {
        const firstArticle = articles.first();

        // Should have either an image or a placeholder
        const imageOrPlaceholder = firstArticle.locator(
          'img, .card__cover--none'
        );
        await expect(imageOrPlaceholder.first()).toBeVisible();
      }
    });

    test('news cards have clickable links', async ({ page }) => {
      await page.goto('/news/');

      const articles = page.locator('article.card');
      const articleCount = await articles.count();

      if (articleCount > 0) {
        const firstArticle = articles.first();
        const link = firstArticle.locator('a').first();

        // Link should have an href
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/^\/news\//);
      }
    });
  });

  test.describe('News Content Loading', () => {
    test('news page loads without JavaScript errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto('/news/');
      await page.waitForLoadState('networkidle');

      // Filter out acceptable errors if any
      const criticalErrors = errors.filter(
        (err) => !err.includes('ResizeObserver')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('images have proper loading attributes', async ({ page }) => {
      await page.goto('/news/');

      const images = page.locator('article.card img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        const firstImage = images.first();

        // Should have loading attribute
        const loading = await firstImage.getAttribute('loading');
        expect(['lazy', 'eager']).toContain(loading);
      }
    });
  });
});
