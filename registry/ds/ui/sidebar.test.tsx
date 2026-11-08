import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { HomeIcon, SettingsIcon } from '@/registry/ds/lib/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarLink,
  SidebarProvider,
  SidebarTrigger,
  type SidebarProviderProps,
} from '@/registry/ds/ui/sidebar';

function Navigation(props: Omit<SidebarProviderProps, 'children'>) {
  return (
    <SidebarProvider {...props}>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup label="Workspace">
            <SidebarLink href="#overview" icon={<HomeIcon />} isCurrent>
              Overview
            </SidebarLink>
            <SidebarLink href="#settings" icon={<SettingsIcon />}>
              Settings
            </SidebarLink>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger />
    </SidebarProvider>
  );
}

beforeEach(async () => {
  await page.viewport(1280, 720);
});

afterEach(async () => {
  await page.viewport(1280, 720);
});

describe('Sidebar', () => {
  it('collapses to a rail while keeping link names, the current page and keyboard tooltips', async () => {
    const screen = await renderWithDS(<Navigation />, { provider: { motion: 'reduced' } });
    const nav = screen.getByRole('navigation');
    await screen.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect.element(nav).toHaveAttribute('data-collapsed');
    expect(nav.element().getBoundingClientRect().width).toBe(72);
    expect(getComputedStyle(nav.element()).transitionDuration).toBe('0s');
    const link = screen.getByRole('link', { name: 'Overview' });
    await expect.element(link).toHaveAttribute('aria-current', 'page');
    await userEvent.tab({ shift: true });
    await expect.element(page.getByRole('tooltip', { name: 'Settings' })).toBeVisible();
    await screen.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect.element(nav).not.toHaveAttribute('data-collapsed');
    expect(nav.element().getBoundingClientRect().width).toBe(256);
  });

  it('keeps a rejected controlled collapse request in sync with the trigger', async () => {
    const onCollapsedChange = vi.fn();
    const screen = await renderWithDS(
      <Navigation isCollapsed={false} onCollapsedChange={onCollapsedChange} />,
    );
    const trigger = screen.getByRole('button', { name: 'Collapse sidebar' });
    await trigger.click();
    await trigger.click();
    expect(onCollapsedChange.mock.calls).toEqual([[true], [true]]);
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens a named mobile sheet, closes on navigation and preserves the desktop rail preference', async () => {
    await page.viewport(375, 812);
    const navigate = vi.fn();
    const screen = await renderWithDS(<Navigation defaultCollapsed />, {
      provider: { motion: 'disabled', navigate },
    });
    const trigger = screen.getByRole('button', { name: 'Open navigation' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Main navigation' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog.getByRole('navigation')).not.toHaveAttribute('data-collapsed');
    await dialog.getByRole('link', { name: 'Settings' }).click();
    await expect.element(dialog).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith('#settings', undefined);
    await expect.element(trigger).toHaveFocus();
    await trigger.click();
    await page.viewport(1024, 768);
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('navigation')).toHaveAttribute('data-collapsed');
    await page.viewport(375, 812);
    await expect
      .element(screen.getByRole('button', { name: 'Open navigation' }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('takes labels from the provider and lets the local sidebar override them', async () => {
    const screen = await renderWithDS(<Navigation labels={{ collapse: 'Hide labels' }} />, {
      provider: { labels: { sidebar: { navigation: 'Primary pages', collapse: 'Shrink' } } },
    });
    await expect.element(screen.getByRole('navigation', { name: 'Primary pages' })).toBeVisible();
    await screen.getByRole('button', { name: 'Hide labels' }).click();
    await expect.element(screen.getByRole('button', { name: 'Expand sidebar' })).toBeVisible();
  });

  it('has no accessibility violations in light, dark and RTL, expanded and collapsed', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(<Navigation />, {
        ...options,
        provider: { motion: 'disabled' },
      });
      await expectNoA11yViolations(screen.container);
      await screen.getByRole('button', { name: 'Collapse sidebar' }).click();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
