import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Create a chainable image builder mock
const createImageBuilder = () => {
  const builder: Record<string, unknown> = {
    url: () => 'https://cdn.sanity.io/images/mock-url',
  };
  // Make all common methods chainable
  ['width', 'height', 'auto', 'format', 'fit', 'crop', 'quality'].forEach(
    (method) => {
      builder[method] = () => builder;
    }
  );
  return builder;
};

// Mock the sanity:client module
vi.mock('sanity:client', () => ({
  sanityClient: {
    fetch: vi.fn(),
  },
}));

// Mock the @sanity/image-url module
vi.mock('@sanity/image-url', () => ({
  default: () => ({
    image: () => createImageBuilder(),
  }),
}));

// Mock the image utility module
vi.mock('../../src/utils/image', () => ({
  urlFor: () => createImageBuilder(),
}));
