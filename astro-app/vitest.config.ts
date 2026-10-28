import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    // Astro components only render server-side; tests that need a DOM parse the HTML with happy-dom
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**', 'src/i18n/**'],
      exclude: ['src/test/**'],
    },
  },
});
