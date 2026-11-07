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
  it('renders a primary pill named by aria-label', async () => {
    const screen = await renderWithDS(<Fab aria-label="New project" icon={<AddIcon />} />);
    const fab = screen.getByRole('button', { name: 'New project' });
    await expect.element(fab).toBeVisible();
    await expect.element(fab).toHaveAttribute('data-tone', 'primary');
    await expect.element(fab).toHaveAttribute('data-size', 'md');
    const style = getComputedStyle(fab.element());
    expect(style.backgroundColor).toBe(roleStyle('bg-primary-solid').backgroundColor);
    expect(style.color).toBe(roleStyle('text-on-primary-solid').color);
    expect(style.borderTopLeftRadius).toBe('9999px');
    expect(style.boxShadow).toBe(roleStyle('shadow-sm').boxShadow);
    expect(box(fab.element())).toEqual({ width: 48, height: 48 });
    expect(getComputedStyle(fab.element().querySelector('svg')!).width).toBe('20px');
  });

  it('sizes the FAB at 48 and 56 pixels', async () => {
    const sizes = { md: 48, lg: 56 } as const;
    const screen = await renderWithDS(
      <div className="flex gap-4">
        {(Object.keys(sizes) as (keyof typeof sizes)[]).map((size) => (
          <Fab key={size} size={size} aria-label={size} icon={<AddIcon />} />
        ))}
      </div>,
    );
    for (const [size, pixels] of Object.entries(sizes)) {
      const fab = screen.getByRole('button', { name: size });
      expect(box(fab.element())).toEqual({ width: pixels, height: pixels });
    }
  });

  it('paints the neutral tone on the overlay surface', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-4">
        <Fab tone="neutral" aria-label="Neutral" icon={<EditIcon />} />
        <Fab aria-label="Primary" icon={<EditIcon />} />
      </div>,
    );
    const neutral = screen.getByRole('button', { name: 'Neutral' });
    await expect.element(neutral).toBeVisible();
    expect(getComputedStyle(neutral.element()).backgroundColor).toBe(
      roleStyle('bg-surface-overlay').backgroundColor,
    );
    expect(getComputedStyle(neutral.element()).color).toBe(roleStyle('text-on-surface').color);
    await expect.element(neutral).toHaveAttribute('data-tone', 'neutral');
    await expect
      .element(screen.getByRole('button', { name: 'Primary' }))
      .toHaveAttribute('data-tone', 'primary');
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

  it('scales in when it mounts, unless motion is reduced', async () => {
    const isScaling = (element: Element) =>
      element
        .getAnimations()
        .some((animation) => (animation as CSSTransition).transitionProperty === 'scale');

    const screen = await renderWithDS(<Fab aria-label="New project" icon={<AddIcon />} />);
    expect(isScaling(screen.getByRole('button', { name: 'New project' }).element())).toBe(true);
    await screen.unmount();

    const reduced = await renderWithDS(<Fab aria-label="New project" icon={<AddIcon />} />, {
      provider: { motion: 'reduced' },
    });
    const still = reduced.getByRole('button', { name: 'New project' });
    await expect.element(still).toHaveAttribute('data-reduced-motion', 'true');
    expect(isScaling(still.element())).toBe(false);
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

  it('says Loading by default on every form', async () => {
    const screen = await renderWithDS(
      <>
        <Fab aria-label="Sync" icon={<SyncIcon />} isPending />
        <ExtendedFab icon={<SyncIcon />} isPending>
          Sync now
        </ExtendedFab>
        <ProjectMenu isPending />
      </>,
    );
    await expect
      .poll(() => screen.getByRole('progressbar', { name: 'Loading' }).elements().length)
      .toBe(3);
  });

  it('takes its pending label from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <>
        <Fab aria-label="Eşitle" icon={<SyncIcon />} isPending />
        <ExtendedFab icon={<SyncIcon />} isPending labels={{ pending: 'Eşitleniyor' }}>
          Şimdi eşitle
        </ExtendedFab>
        <FabMenu aria-label="Oluştur" isPending labels={{ pending: 'Oluşturuluyor' }}>
          <FabMenuItem id="document">Belge</FabMenuItem>
        </FabMenu>
      </>,
      { provider: { labels: { fab: { pending: 'Yükleniyor' } } } },
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Yükleniyor' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Eşitleniyor' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Oluşturuluyor' }))
      .toBeInTheDocument();
  });

  it('fires from the keyboard', async () => {
    const onPress = vi.fn();
    await renderWithDS(<Fab aria-label="New project" icon={<AddIcon />} onPress={onPress} />);
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('does not fire when disabled', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <Fab aria-label="New project" icon={<AddIcon />} isDisabled onPress={onPress} />,
    );
    await screen.getByRole('button', { name: 'New project' }).click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
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
  });

  it('extends again when isExtended turns true', async () => {
    const screen = await renderWithDS(
      <ExtendedFab icon={<EditIcon />} isExtended={false}>
        Write
      </ExtendedFab>,
      { provider: { motion: 'reduced' } },
    );
    await screen.rerender(
      <ExtendedFab icon={<EditIcon />} isExtended>
        Write
      </ExtendedFab>,
    );
    const fab = page.getByRole('button', { name: 'Write' });
    await expect.element(fab).toHaveAttribute('data-extended', 'true');
    await expect.poll(() => box(fab.element()).width).toBeGreaterThan(72);
    expect(box(fab.element()).height).toBe(48);
  });

  it('owns its pending state for an async onPress and ignores repeat presses', async () => {
    let finish: () => void = () => {};
    const onPress = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(
      <ExtendedFab icon={<SyncIcon />} onPress={onPress}>
        Sync folder
      </ExtendedFab>,
    );
    const fab = screen.getByRole('button', { name: 'Sync folder' });

    await fab.click();
    await expect.element(fab).toHaveAttribute('data-pending', 'true');
    await expect.element(fab).toHaveAttribute('aria-disabled', 'true');
    await fab.click({ force: true });
    expect(onPress).toHaveBeenCalledOnce();

    finish();
    await expect.element(fab).not.toHaveAttribute('data-pending');
  });

  it('collapses the label over 250ms on the fluid curve and drops it for reduced motion', async () => {
    const screen = await renderWithDS(<ExtendedFab icon={<EditIcon />}>Write</ExtendedFab>);
    const label = screen.getByRole('button', { name: 'Write' }).element().children[1];
    expect(label).toHaveAttribute('data-slot', 'label');
    const style = getComputedStyle(label);
    expect(style.transitionProperty.split(', ')[0]).toBe('grid-template-columns');
    expect(style.transitionDuration.split(', ')[0]).toBe('0.25s');
    expect(style.transitionTimingFunction).toContain('cubic-bezier(0.32, 0.72, 0, 1)');
    await screen.unmount();

    const reduced = await renderWithDS(<ExtendedFab icon={<EditIcon />}>Write</ExtendedFab>, {
      provider: { motion: 'reduced' },
    });
    const still = reduced.getByRole('button', { name: 'Write' }).element().children[1];
    expect(getComputedStyle(still).transitionProperty).toBe('none');
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
    const item = page.getByRole('menuitem', { name: 'Project' }).element();
    expect(getComputedStyle(item).backgroundColor).toBe(
      roleStyle('bg-surface-overlay').backgroundColor,
    );
    expect(getComputedStyle(item).borderTopLeftRadius).toBe('9999px');

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

  it('closes when the open FAB is pressed again', async () => {
    const screen = await renderWithDS(<ProjectMenu />);
    const trigger = screen.getByRole('button', { name: 'Create' });
    await trigger.click();
    await expect.element(page.getByRole('menu', { name: 'Create' })).toBeVisible();

    await trigger.click({ force: true });
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect.element(trigger).not.toHaveAttribute('data-open');
  });

  it('calls the item onAction as well as the menu onAction', async () => {
    const onMenuAction = vi.fn();
    const onProject = vi.fn();
    const screen = await renderWithDS(
      <FabMenu aria-label="Create" onAction={onMenuAction}>
        <FabMenuItem id="project" onAction={onProject}>
          Project
        </FabMenuItem>
        <FabMenuItem id="session">Session</FabMenuItem>
      </FabMenu>,
    );
    await screen.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('menuitem', { name: 'Project' }).click();
    expect(onProject).toHaveBeenCalledOnce();
    expect(onMenuAction).toHaveBeenCalledWith('project');
  });

  it('jumps to an action by typing its first letters', async () => {
    const screen = await renderWithDS(<ProjectMenu />);
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('menuitem', { name: 'Project' })).toHaveFocus();
    await userEvent.keyboard('cl');
    await expect.element(page.getByRole('menuitem', { name: 'Client' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(screen.getByRole('button', { name: 'Create' })).toHaveFocus();
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

  it('tracks a promise returned by an item onAction', async () => {
    let finish: () => void = () => {};
    const screen = await renderWithDS(
      <FabMenu aria-label="Create">
        <FabMenuItem
          id="import"
          onAction={() => new Promise<void>((resolve) => (finish = resolve))}
        >
          Import photos
        </FabMenuItem>
      </FabMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Create' });
    await trigger.click();
    await page.getByRole('menuitem', { name: 'Import photos' }).click();
    await expect.element(trigger).toHaveAttribute('data-pending', 'true');
    finish();
    await expect.element(trigger).not.toHaveAttribute('data-pending');
  });

  it('stays pending until both the menu and the item promises settle', async () => {
    let finishItem: () => void = () => {};
    let finishMenu: () => void = () => {};
    const screen = await renderWithDS(
      <FabMenu
        aria-label="Create"
        onAction={() => new Promise<void>((resolve) => (finishMenu = resolve))}
      >
        <FabMenuItem
          id="import"
          onAction={() => new Promise<void>((resolve) => (finishItem = resolve))}
        >
          Import photos
        </FabMenuItem>
      </FabMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Create' });
    await trigger.click();
    await page.getByRole('menuitem', { name: 'Import photos' }).click();
    await expect.element(trigger).toHaveAttribute('data-pending', 'true');

    finishItem();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect.element(trigger).toHaveAttribute('data-pending', 'true');

    finishMenu();
    await expect.element(trigger).not.toHaveAttribute('data-pending');
  });

  it('skips a disabled action', async () => {
    const onAction = vi.fn();
    await renderWithDS(
      <FabMenu aria-label="Create" onAction={onAction}>
        <FabMenuItem id="project">Project</FabMenuItem>
        <FabMenuItem id="session" isDisabled>
          Session
        </FabMenuItem>
        <FabMenuItem id="client">Client</FabMenuItem>
      </FabMenu>,
    );
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('menuitem', { name: 'Project' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('menuitem', { name: 'Client' })).toHaveFocus();

    const session = page.getByRole('menuitem', { name: 'Session' });
    await expect.element(session).toHaveAttribute('aria-disabled', 'true');
    await session.click({ force: true });
    expect(onAction).not.toHaveBeenCalled();
    await expect.element(page.getByRole('menu', { name: 'Create' })).toBeVisible();
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

  it('staggers the actions outward from the FAB on either side', async () => {
    const delays = () =>
      page
        .getByRole('menuitem')
        .elements()
        .map((item) => getComputedStyle(item).transitionDelay.split(', ')[0]);

    const above = await renderWithDS(
      <div className="flex min-h-96 items-end justify-end p-4">
        <ProjectMenu defaultOpen />
      </div>,
    );
    await expect.element(page.getByRole('dialog')).toHaveAttribute('data-placement', 'top');
    expect(delays()).toEqual(['0.06s', '0.03s', '0s']);
    await above.unmount();

    await renderWithDS(
      <div className="flex min-h-96 items-start justify-end p-4">
        <ProjectMenu placement="bottom end" defaultOpen />
      </div>,
    );
    await expect.element(page.getByRole('dialog')).toHaveAttribute('data-placement', 'bottom');
    expect(delays()).toEqual(['0s', '0.03s', '0.06s']);
  });

  it('does not open when disabled', async () => {
    const screen = await renderWithDS(<ProjectMenu isDisabled />);
    await screen.getByRole('button', { name: 'Create' }).click({ force: true });
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });
});

describe('FAB accessibility', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    const tones = ['primary', 'neutral'] as const;
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 bg-canvas p-4">
          <div className="flex gap-4">
            {tones.map((tone) => (
              <Fab key={tone} tone={tone} aria-label={`New ${tone}`} icon={<AddIcon />} />
            ))}
            <Fab size="lg" aria-label="Large" icon={<AddIcon />} />
            <Fab aria-label="Disabled" icon={<AddIcon />} isDisabled />
          </div>
          <div className="flex flex-wrap gap-4">
            {tones.map((tone) => (
              <ExtendedFab key={tone} tone={tone} icon={<EditIcon />}>
                Write {tone}
              </ExtendedFab>
            ))}
            <ExtendedFab size="lg" icon={<EditIcon />}>
              Write large
            </ExtendedFab>
            <ExtendedFab icon={<EditIcon />} isDisabled>
              Disabled
            </ExtendedFab>
          </div>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });

  it('has no accessibility violations with the menu open in both tones', async () => {
    const tones = ['primary', 'neutral'] as const;
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      for (const tone of tones) {
        const screen = await renderWithDS(
          <div className="flex min-h-96 items-end justify-end p-4">
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
