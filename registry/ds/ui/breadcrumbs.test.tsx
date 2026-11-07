import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { HomeIcon } from '@/registry/ds/lib/icons';
import { Breadcrumb, Breadcrumbs } from '@/registry/ds/ui/breadcrumbs';

describe('Breadcrumbs', () => {
  it('keeps ancestors as links and makes the last item a non-interactive current page', async () => {
    const screen = await renderWithDS(
      <Breadcrumbs>
        <Breadcrumb href="/">Home</Breadcrumb>
        <Breadcrumb href="/settings">Settings</Breadcrumb>
        <Breadcrumb href="/settings/profile">Profile</Breadcrumb>
      </Breadcrumbs>,
    );
    await expect
      .element(screen.getByRole('link', { name: 'Settings' }))
      .toHaveAttribute('href', '/settings');
    expect(screen.container.querySelector('[aria-current="page"]')).toHaveTextContent('Profile');
    expect(screen.container.querySelector('[aria-current="page"]')?.closest('a')).toBeNull();
    expect(screen.container.querySelectorAll('[data-slot="breadcrumb"] svg')).toHaveLength(2);
  });

  it('resolves the navigation name from English, provider and local labels', async () => {
    const screen = await renderWithDS(
      <>
        <Breadcrumbs>
          <Breadcrumb>Home</Breadcrumb>
        </Breadcrumbs>
        <Breadcrumbs labels={{ navigation: 'Project path' }}>
          <Breadcrumb>Projects</Breadcrumb>
        </Breadcrumbs>
      </>,
      { provider: { labels: { breadcrumbs: { navigation: 'Page path' } } } },
    );
    await expect.element(screen.getByRole('navigation', { name: 'Page path' })).toBeVisible();
    await expect.element(screen.getByRole('navigation', { name: 'Project path' })).toBeVisible();
  });

  it('wraps long paths without overflowing and is accessible in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div style={{ width: 240 }}>
          <Breadcrumbs>
            <Breadcrumb href="/">
              <HomeIcon />
              Workspace
            </Breadcrumb>
            <Breadcrumb href="/projects">A project with a longer name</Breadcrumb>
            <Breadcrumb>averylongunbrokencurrentpagename</Breadcrumb>
          </Breadcrumbs>
        </div>,
        options,
      );
      const root = screen.container.querySelector('[data-slot="breadcrumbs"]')!;
      expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
