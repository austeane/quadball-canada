import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { ContainerRenderOptions } from 'astro/container';

type AstroComponentFactory = Parameters<AstroContainer['renderToString']>[0];

/**
 * Renders an Astro component and returns the result as a DocumentFragment
 * for easy querying with DOM methods or Testing Library.
 */
export async function renderComponent(
  Component: AstroComponentFactory,
  options?: ContainerRenderOptions
): Promise<DocumentFragment> {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Component, options);

  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

/**
 * Renders an Astro component and returns the raw HTML string.
 * Useful for snapshot testing or checking raw output.
 */
export async function renderToString(
  Component: AstroComponentFactory,
  options?: ContainerRenderOptions
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Component, options);
}

/**
 * Query helper for data-testid attributes
 */
export function queryByTestId(
  container: DocumentFragment | Element,
  testId: string
): Element | null {
  return container.querySelector(`[data-testid="${testId}"]`);
}

/**
 * Query helper for all elements matching data-testid
 */
export function queryAllByTestId(
  container: DocumentFragment | Element,
  testId: string
): NodeListOf<Element> {
  return container.querySelectorAll(`[data-testid="${testId}"]`);
}
