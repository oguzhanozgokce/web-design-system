import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { NotFound } from '@/registry/ds/ui/not-found';

describe('NotFound', () => {
  it('provides a real recovery link and lets the page choose its heading level', async () => {
    const screen = await renderWithDS(
      <NotFound homeHref="/projects" headingLevel={1} labels={{ home: 'View projects' }} />,
      { provider: { labels: { notFound: { title: 'Page unavailable' } } } },
    );
    await expect
      .element(screen.getByRole('heading', { level: 1, name: 'Page unavailable' }))
      .toBeVisible();
    await expect
      .element(screen.getByRole('link', { name: 'View projects' }))
      .toHaveAttribute('href', '/projects');
    expect(
      screen.container
        .querySelector('[data-slot="not-found-illustration"]')
        ?.closest('[aria-hidden="true"]'),
    ).not.toBeNull();
  });

  it('keeps its heading and actions accessible in light, dark and RTL with disabled motion', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(<NotFound homeHref="/" />, {
        ...options,
        provider: { motion: 'disabled' },
      });
      await expect
        .element(screen.getByRole('heading', { name: 'This page took a different path' }))
        .toBeVisible();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
