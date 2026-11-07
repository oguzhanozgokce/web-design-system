import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import {
  AddIcon,
  DescriptionIcon,
  EditIcon,
  GroupIcon,
  SyncIcon,
  UploadIcon,
} from '@/registry/ds/lib/icons';
import { ExtendedFab, Fab, FabMenu, FabMenuItem } from '@/registry/ds/ui/fab';

function roleStyle(className: string) {
  const probe = document.createElement('span');
  probe.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(probe);
  const style = getComputedStyle(probe);
  const result = {
    backgroundColor: style.backgroundColor,
    color: style.color,
    boxShadow: style.boxShadow,
  };
  probe.remove();
  return result;
}

function box(element: Element) {
  const html = element as HTMLElement;
  return { width: html.offsetWidth, height: html.offsetHeight };
}

function ProjectMenu(props: Partial<Parameters<typeof FabMenu>[0]>) {
  return (
    <FabMenu aria-label="Create" {...props}>
      <FabMenuItem id="project" icon={<DescriptionIcon />}>
        Project
      </FabMenuItem>
      <FabMenuItem id="session" icon={<UploadIcon />}>
        Session
      </FabMenuItem>
      <FabMenuItem id="client" icon={<GroupIcon />}>
        Client
      </FabMenuItem>
    </FabMenu>
  );
}

describe('Fab', () => {
  it('sizes and paints each tone at 48 and 56 pixels, primary and md by default', async () => {
    const cases = [
      { name: 'Default', pixels: 48, fill: 'bg-primary-solid', text: 'text-on-primary-solid' },
      { name: 'Primary large', size: 'lg', pixels: 56, fill: 'bg-primary-solid' },
      {
        name: 'Neutral',
        tone: 'neutral',
        pixels: 48,
        fill: 'bg-surface-overlay',
        text: 'text-on-surface',
      },
      {
        name: 'Neutral large',
        tone: 'neutral',
        size: 'lg',
        pixels: 56,
        fill: 'bg-surface-overlay',
      },
    ] as const;
    const screen = await renderWithDS(
      <div className="flex gap-4">
        {cases.map((entry) => (
          <Fab
            key={entry.name}
            aria-label={entry.name}
            tone={'tone' in entry ? entry.tone : undefined}
            size={'size' in entry ? entry.size : undefined}
            icon={<AddIcon />}
          />
        ))}
      </div>,
    );
    for (const entry of cases) {
      const fab = screen.getByRole('button', { name: entry.name });
      await expect.element(fab).toBeVisible();
      const style = getComputedStyle(fab.element());
      expect(box(fab.element())).toEqual({ width: entry.pixels, height: entry.pixels });
      expect(style.backgroundColor).toBe(roleStyle(entry.fill).backgroundColor);
      if ('text' in entry) expect(style.color).toBe(roleStyle(entry.text).color);
    }
    const fallback = screen.getByRole('button', { name: 'Default' });
    await expect.element(fallback).toHaveAttribute('data-tone', 'primary');
    await expect.element(fallback).toHaveAttribute('data-size', 'md');
    const style = getComputedStyle(fallback.element());
    expect(style.borderTopLeftRadius).toBe('9999px');
    expect(style.boxShadow).toBe(roleStyle('shadow-sm').boxShadow);
  });
  it('lifts on hover and scales down while pressed', async () => {
    const screen = await renderWithDS(<Fab aria-label="New project" icon={<AddIcon />} />);
    const fab = screen.getByRole('button', { name: 'New project' });
    await fab.hover();
    await expect.element(fab).toHaveAttribute('data-hovered', 'true');
    await expect
      .poll(() => getComputedStyle(fab.element()).boxShadow)
      .toBe(roleStyle('shadow-lg').boxShadow);
    await expect
      .poll(() => getComputedStyle(fab.element()).backgroundColor)
      .toBe(roleStyle('bg-primary-solid-hover').backgroundColor);

    fab.element().focus();
    await userEvent.keyboard('[Space>]');
    await expect.element(fab).toHaveAttribute('data-pressed', 'true');
    await expect.poll(() => getComputedStyle(fab.element()).scale).toBe('0.96');
    await userEvent.keyboard('[/Space]');
  });

  it('calls onPress and shows its own pending state for async work', async () => {
    let finish: () => void = () => {};
    const onPress = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(
      <Fab aria-label="Sync folder" icon={<SyncIcon />} onPress={onPress} />,
    );
    const fab = screen.getByRole('button', { name: 'Sync folder' });

    await fab.click();
    await expect.element(fab).toHaveAttribute('data-pending', 'true');
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();

    await fab.click({ force: true });
    expect(onPress).toHaveBeenCalledOnce();

    finish();
    await expect.element(fab).not.toHaveAttribute('data-pending');
  });

  it('takes its pending label from labels, then DSProvider, then the English default', async () => {
    const english = await renderWithDS(
      <>
        <Fab aria-label="Sync" icon={<SyncIcon />} isPending />
        <ExtendedFab icon={<SyncIcon />} isPending>
          Sync now
        </ExtendedFab>
        <ProjectMenu isPending />
      </>,
    );
    await expect
      .poll(() => english.getByRole('progressbar', { name: 'Loading' }).elements().length)
      .toBe(3);
    await english.unmount();

    const screen = await renderWithDS(
      <>
        <Fab aria-label="Sync" icon={<SyncIcon />} isPending />
        <ExtendedFab icon={<SyncIcon />} isPending labels={{ pending: 'Syncing' }}>
          Sync now
        </ExtendedFab>
        <FabMenu aria-label="Create" isPending labels={{ pending: 'Creating' }}>
          <FabMenuItem id="document">Belge</FabMenuItem>
        </FabMenu>
      </>,
      { provider: { labels: { fab: { pending: 'Working' } } } },
    );
    await expect.element(screen.getByRole('progressbar', { name: 'Working' })).toBeInTheDocument();
    await expect.element(screen.getByRole('progressbar', { name: 'Syncing' })).toBeInTheDocument();
    await expect.element(screen.getByRole('progressbar', { name: 'Creating' })).toBeInTheDocument();
  });
});

describe('ExtendedFab', () => {
  it('is named by its label and collapses to a square FAB', async () => {
    const screen = await renderWithDS(
      <ExtendedFab icon={<EditIcon />} isExtended={false}>
        Write
      </ExtendedFab>,
      { provider: { motion: 'reduced' } },
    );
    const fab = screen.getByRole('button', { name: 'Write' });
    await expect.element(fab).toHaveAttribute('data-extended', 'false');
    await expect.element(fab).toHaveAttribute('data-reduced-motion', 'true');
    await expect.poll(() => box(fab.element()).width).toBe(48);
    expect(box(fab.element()).height).toBe(48);
    expect(getComputedStyle(fab.element()).borderTopLeftRadius).toBe('9999px');

    await screen.rerender(
      <ExtendedFab icon={<EditIcon />} isExtended>
        Write
      </ExtendedFab>,
    );
    const extended = page.getByRole('button', { name: 'Write' });
    await expect.element(extended).toHaveAttribute('data-extended', 'true');
    await expect.poll(() => box(extended.element()).width).toBeGreaterThan(72);
    expect(box(extended.element()).height).toBe(48);
  });

  it('keeps the label visible next to the spinner while pending', async () => {
    const screen = await renderWithDS(
      <ExtendedFab icon={<SyncIcon />} isPending>
        Sync folder
      </ExtendedFab>,
    );
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    await expect.element(screen.getByText('Sync folder')).toBeVisible();
  });
});

describe('FabMenu', () => {
  it('opens a menu of labelled actions and closes after one is chosen', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(<ProjectMenu onAction={onAction} />);
    const trigger = screen.getByRole('button', { name: 'Create' });
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'true');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    const menu = page.getByRole('menu', { name: 'Create' });
    await expect.element(menu).toBeVisible();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(trigger).toHaveAttribute('data-open', 'true');
    expect(page.getByRole('menuitem').elements()).toHaveLength(3);

    await page.getByRole('menuitem', { name: 'Session' }).click();
    expect(onAction.mock.calls[0][0]).toBe('session');
    await expect.element(menu).not.toBeInTheDocument();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('works from the keyboard and returns focus to the FAB', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(<ProjectMenu onAction={onAction} />);
    const trigger = screen.getByRole('button', { name: 'Create' });

    await userEvent.keyboard('{Tab}');
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('menuitem', { name: 'Project' })).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('menuitem', { name: 'Session' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect.element(page.getByRole('menuitem', { name: 'Client' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onAction.mock.calls[0][0]).toBe('client');
    await expect.element(trigger).toHaveFocus();
  });

  it('supports a controlled open state', async () => {
    const onOpenChange = vi.fn();
    const screen = await renderWithDS(<ProjectMenu isOpen onOpenChange={onOpenChange} />);
    await expect.element(page.getByRole('menu', { name: 'Create' })).toBeVisible();

    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.element(page.getByRole('menu', { name: 'Create' })).toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'Create', includeHidden: true }))
      .toHaveAttribute('data-open', 'true');
  });

  it('shows its own pending state while an async action runs', async () => {
    let finish: () => void = () => {};
    const onAction = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(<ProjectMenu onAction={onAction} />);
    const trigger = screen.getByRole('button', { name: 'Create' });

    await trigger.click();
    await page.getByRole('menuitem', { name: 'Session' }).click();
    expect(onAction).toHaveBeenCalledWith('session');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveAttribute('data-pending', 'true');
    await expect.element(trigger).toHaveAttribute('aria-disabled', 'true');
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();

    await trigger.click({ force: true });
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();

    finish();
    await expect.element(trigger).not.toHaveAttribute('data-pending');
    await trigger.click();
    await expect.element(page.getByRole('menu', { name: 'Create' })).toBeVisible();
  });

  it('stays pending until both the menu and the item promises settle', async () => {
    let finishItem: () => void = () => {};
    let finishMenu: () => void = () => {};
    const onMenuAction = vi.fn(() => new Promise<void>((resolve) => (finishMenu = resolve)));
    const onItemAction = vi.fn(() => new Promise<void>((resolve) => (finishItem = resolve)));
    const screen = await renderWithDS(
      <FabMenu aria-label="Create" onAction={onMenuAction}>
        <FabMenuItem id="import" onAction={onItemAction}>
          Import photos
        </FabMenuItem>
      </FabMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Create' });
    await trigger.click();
    await page.getByRole('menuitem', { name: 'Import photos' }).click();
    expect(onItemAction).toHaveBeenCalledOnce();
    expect(onMenuAction).toHaveBeenCalledWith('import');
    await expect.element(trigger).toHaveAttribute('data-pending', 'true');

    finishItem();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect.element(trigger).toHaveAttribute('data-pending', 'true');

    finishMenu();
    await expect.element(trigger).not.toHaveAttribute('data-pending');
  });

  it('aligns the actions with the FAB edge named by the placement', async () => {
    const leftEdges = () =>
      page
        .getByRole('menuitem')
        .elements()
        .map((item) => Math.round(item.getBoundingClientRect().left));

    const start = await renderWithDS(
      <div className="flex min-h-96 items-end p-4">
        <ProjectMenu placement="top start" defaultOpen />
      </div>,
    );
    await expect.element(page.getByRole('menu', { name: 'Create' })).toBeVisible();
    const startLeft = Math.round(
      start
        .getByRole('button', { name: 'Create', includeHidden: true })
        .element()
        .getBoundingClientRect().left,
    );
    expect(leftEdges()).toEqual([startLeft, startLeft, startLeft]);
    await start.unmount();

    const rtl = await renderWithDS(
      <div className="flex min-h-96 items-end justify-end p-4">
        <ProjectMenu defaultOpen />
      </div>,
      { locale: 'ar' },
    );
    await expect.element(page.getByRole('menu', { name: 'Create' })).toBeVisible();
    await expect.element(page.getByRole('dialog')).toHaveAttribute('dir', 'rtl');
    const rtlLeft = Math.round(
      rtl
        .getByRole('button', { name: 'Create', includeHidden: true })
        .element()
        .getBoundingClientRect().left,
    );
    expect(leftEdges()).toEqual([rtlLeft, rtlLeft, rtlLeft]);
  });
});

describe('FAB accessibility', () => {
  it('has no accessibility violations in light, dark and RTL with the menu open in both tones', async () => {
    const tones = ['primary', 'neutral'] as const;
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      for (const tone of tones) {
        const screen = await renderWithDS(
          <div className="flex min-h-96 flex-col items-end justify-between gap-4 bg-canvas p-4">
            <div className="flex flex-wrap gap-4">
              <Fab tone={tone} aria-label={`New ${tone}`} icon={<AddIcon />} />
              <Fab tone={tone} size="lg" aria-label="Large" icon={<AddIcon />} />
              <Fab tone={tone} aria-label="Disabled" icon={<AddIcon />} isDisabled />
              <ExtendedFab tone={tone} icon={<EditIcon />}>
                Write {tone}
              </ExtendedFab>
              <ExtendedFab tone={tone} size="lg" icon={<EditIcon />}>
                Write large
              </ExtendedFab>
              <ExtendedFab tone={tone} icon={<EditIcon />} isDisabled>
                Disabled write
              </ExtendedFab>
            </div>
            <ProjectMenu tone={tone} defaultOpen />
          </div>,
          options,
        );
        await expect.element(page.getByRole('menu', { name: 'Create' })).toBeVisible();
        await expect
          .poll(() =>
            page
              .getByRole('menuitem')
              .elements()
              .every((item) => getComputedStyle(item).opacity === '1'),
          )
          .toBe(true);
        document
          .querySelectorAll('[data-live-announcer] [role="log"] > *')
          .forEach((announcement) => announcement.remove());
        await expectNoA11yViolations(document.body);
        await screen.unmount();
      }
    }
    document.documentElement.classList.remove('dark');
  });
});
