import { type Key, type Selection } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import {
  ArchiveIcon,
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  FolderIcon,
} from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import {
  Menu,
  MenuHeader,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  SubmenuTrigger,
  type MenuLabels,
  type MenuProps,
} from '@/registry/ds/ui/menu';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stubPlatform(platform: string) {
  Object.defineProperty(navigator, 'userAgentData', {
    value: { platform },
    configurable: true,
  });
}

function restorePlatform() {
  Reflect.deleteProperty(navigator, 'userAgentData');
}

function ShortcutMenu({
  label,
  item,
  labels,
}: {
  label: string;
  item: string;
  labels?: Partial<MenuLabels>;
}) {
  return (
    <MenuTrigger>
      <Button>{label}</Button>
      <Menu labels={labels}>
        <MenuItem shortcut={['mod', 'shift', 's']}>{item}</MenuItem>
        <MenuItem shortcut={['alt', 'ctrl', 'Del']}>Delete row</MenuItem>
        <MenuItem shortcut={['F2']}>Rename</MenuItem>
        <MenuItem shortcut={['space']}>Preview</MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

function visibleText(node: Element) {
  const clone = node.cloneNode(true) as Element;
  clone.querySelectorAll('.sr-only').forEach((hidden) => hidden.remove());
  return clone.textContent;
}

async function shortcutTexts() {
  await expect.element(page.getByRole('menu').first()).toBeVisible();
  return [...document.querySelectorAll('[data-slot="shortcut"]')].map(visibleText);
}

function probe(className: string, property: 'backgroundColor' | 'color' = 'backgroundColor') {
  const element = document.createElement('span');
  element.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(element);
  const value = getComputedStyle(element)[property];
  element.remove();
  return value;
}

function firstKey(handler: ReturnType<typeof vi.fn>) {
  expect(handler).toHaveBeenCalledOnce();
  return handler.mock.calls[0][0];
}

function ProjectMenu({
  menu,
  onEdit,
}: {
  menu?: Omit<MenuProps, 'children'>;
  onEdit?: () => void;
}) {
  return (
    <MenuTrigger>
      <Button>Project actions</Button>
      <Menu {...menu}>
        <MenuItem id="edit" startIcon={<EditIcon />} shortcut={['mod', 'E']} onAction={onEdit}>
          Edit project
        </MenuItem>
        <MenuItem
          id="duplicate"
          startIcon={<CopyIcon />}
          description="Copies the files and the members"
        >
          Duplicate
        </MenuItem>
        <MenuItem id="archive" startIcon={<ArchiveIcon />} isDisabled>
          Archive
        </MenuItem>
        <MenuSeparator />
        <MenuItem id="delete" startIcon={<DeleteIcon />} tone="error">
          Delete project
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

function ViewMenu({ onSortChange }: { onSortChange?: (keys: Selection) => void }) {
  return (
    <MenuTrigger>
      <Button>View</Button>
      <Menu>
        <MenuSection
          selectionMode="single"
          defaultSelectedKeys={['date']}
          onSelectionChange={onSortChange}
        >
          <MenuHeader>Sort by</MenuHeader>
          <MenuItem id="date">Date created</MenuItem>
          <MenuItem id="name">Name</MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuSection selectionMode="multiple" defaultSelectedKeys={['owner', 'status']}>
          <MenuHeader>Columns</MenuHeader>
          <MenuItem id="owner">Owner</MenuItem>
          <MenuItem id="status">Status</MenuItem>
          <MenuItem id="due">Due date</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
}

function FileMenu({ onAction }: { onAction?: (key: Key) => void }) {
  return (
    <MenuTrigger>
      <Button>File</Button>
      <Menu onAction={onAction}>
        <MenuItem id="rename">Rename</MenuItem>
        <SubmenuTrigger>
          <MenuItem id="move" startIcon={<FolderIcon />}>
            Move to
          </MenuItem>
          <Menu onAction={onAction}>
            <MenuItem id="backups">Backups</MenuItem>
            <MenuItem id="archive">Archive 2026</MenuItem>
          </Menu>
        </SubmenuTrigger>
        <MenuItem id="download" startIcon={<DownloadIcon />}>
          Download
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

describe('Menu', () => {
  it('opens a menu named by its trigger on the overlay surface', async () => {
    const screen = await renderWithDS(<ProjectMenu />);
    const trigger = screen.getByRole('button', { name: 'Project actions' });
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'true');

    await trigger.click();
    const menu = page.getByRole('menu', { name: 'Project actions' });
    await expect.element(menu).toBeVisible();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(menu).toHaveAttribute('data-size', 'md');
    expect(page.getByRole('menuitem').all()).toHaveLength(4);
    await expect
      .element(page.getByRole('menuitem', { name: 'Delete project' }))
      .toHaveAttribute('data-tone', 'error');
    await expect.element(page.getByRole('separator')).toBeInTheDocument();

    const popover = document.querySelector<HTMLElement>('[data-slot="menu-popover"]')!;
    expect(getComputedStyle(popover).backgroundColor).toBe(probe('bg-surface-overlay'));
    const item = page.getByRole('menuitem', { name: /^Duplicate/ }).element();
    expect(getComputedStyle(item).minHeight).toBe('36px');
  });

  it('fills the focused row with the neutral or error soft role', async () => {
    await renderWithDS(<ProjectMenu />);
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    const edit = page.getByRole('menuitem', { name: /^Edit project/ });
    await expect.element(edit).toHaveFocus();
    await expect.element(edit).toHaveAttribute('data-focus-visible', 'true');
    expect(getComputedStyle(edit.element()).outlineWidth).toBe('2px');
    expect(getComputedStyle(edit.element()).outlineOffset).toBe('-2px');
    await expect
      .poll(() => getComputedStyle(edit.element()).backgroundColor)
      .toBe(probe('bg-neutral-soft'));
    await userEvent.keyboard('{End}');
    const remove = page.getByRole('menuitem', { name: 'Delete project' });
    await expect.element(remove).toHaveFocus();
    await expect
      .poll(() => getComputedStyle(remove.element()).backgroundColor)
      .toBe(probe('bg-error-soft'));
    expect(getComputedStyle(remove.element()).color).toBe(probe('text-error', 'color'));
  });

  it('calls onAction with the item key, closes and returns focus to the trigger', async () => {
    const onEdit = vi.fn();
    const onAction = vi.fn();
    const screen = await renderWithDS(<ProjectMenu menu={{ onAction }} onEdit={onEdit} />);
    const trigger = screen.getByRole('button', { name: 'Project actions' });

    await trigger.click();
    await page.getByRole('menuitem', { name: /^Edit project/ }).click();
    expect(onEdit).toHaveBeenCalledOnce();
    expect(firstKey(onAction)).toBe('edit');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('names items by all of their visible text, shortcut included', async () => {
    const screen = await renderWithDS(<ProjectMenu />);
    await screen.getByRole('button', { name: 'Project actions' }).click();

    const duplicate = page.getByRole('menuitem', { name: /^Duplicate/ });
    await expect
      .element(duplicate)
      .toHaveAccessibleName(/^Duplicate\s*Copies the files and the members$/);
    await expect.element(duplicate).not.toHaveAttribute('aria-labelledby');
    await expect.element(duplicate).not.toHaveAttribute('aria-describedby');

    const edit = page.getByRole('menuitem', { name: /^Edit project/ });
    await expect
      .element(edit)
      .toHaveAccessibleName(/^Edit project\s*(Command\s*\+\s*E|Control\s*\+\s*E)$/);
    expect(edit.element().querySelector('[data-slot="start-icon"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    const shortcut = edit.element().querySelector('[data-slot="shortcut"]')!;
    const combo = shortcut.querySelector('[data-slot="kbd-combo"]');
    expect(combo?.tagName).toBe('KBD');
    expect(combo).toHaveAttribute('dir', 'ltr');
    expect(combo).toHaveAttribute('data-variant', 'ghost');
    expect(visibleText(shortcut)).toBe(
      shortcut.getAttribute('data-platform') === 'apple' ? '⌘E' : 'Ctrl+E',
    );
  });

  it('shows Apple symbols in Apple modifier order on Apple platforms', async () => {
    stubPlatform('macOS');
    try {
      const screen = await renderWithDS(<ShortcutMenu label="Folder" item="Export file" />);
      await screen.getByRole('button', { name: 'Folder' }).click();
      expect(await shortcutTexts()).toEqual(['⇧⌘S', '⌃⌥⌦', 'F2', 'Space']);
      await expect
        .element(page.getByRole('menuitem', { name: /^Export file/ }))
        .toHaveAccessibleName(/^Export file\s*Shift\s*\+\s*Command\s*\+\s*S$/);
    } finally {
      restorePlatform();
    }
  });

  it('joins English key names with + elsewhere, whatever the locale', async () => {
    stubPlatform('Windows');
    try {
      const screen = await renderWithDS(<ShortcutMenu label="File" item="Export file" />, {
        locale: 'de',
      });
      await screen.getByRole('button', { name: 'File' }).click();
      expect(await shortcutTexts()).toEqual(['Ctrl+Shift+S', 'Alt+Ctrl+Del', 'F2', 'Space']);
      expect(document.querySelector('[data-slot="shortcut"]')).toHaveAttribute(
        'data-platform',
        'other',
      );
    } finally {
      restorePlatform();
    }
  });

  it('takes key names from DSProvider labels, and from its labels prop first', async () => {
    stubPlatform('Windows');
    const provider = {
      labels: { menu: { ctrl: 'Ctl', shift: 'Shft', delete: 'Del key', space: 'Space key' } },
    };
    try {
      const screen = await renderWithDS(<ShortcutMenu label="File" item="Export file" />, {
        provider,
      });
      await screen.getByRole('button', { name: 'File' }).click();
      expect(await shortcutTexts()).toEqual(['Ctl+Shft+S', 'Alt+Ctl+Del key', 'F2', 'Space key']);
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
      await screen.unmount();

      const own = await renderWithDS(
        <ShortcutMenu
          label="File"
          item="Export file"
          labels={{ alt: 'Option', space: 'Spacebar' }}
        />,
        { provider },
      );
      await own.getByRole('button', { name: 'File' }).click();
      expect(await shortcutTexts()).toEqual(['Ctl+Shft+S', 'Option+Ctl+Del key', 'F2', 'Spacebar']);
    } finally {
      restorePlatform();
    }
  });

  it('passes its labels down to submenus', async () => {
    stubPlatform('Windows');
    try {
      const screen = await renderWithDS(
        <MenuTrigger>
          <Button>File</Button>
          <Menu labels={{ ctrl: 'Ctl' }}>
            <SubmenuTrigger>
              <MenuItem>Move to</MenuItem>
              <Menu>
                <MenuItem shortcut={['ctrl', 'M']}>Project plan</MenuItem>
              </Menu>
            </SubmenuTrigger>
          </Menu>
        </MenuTrigger>,
      );
      await screen.getByRole('button', { name: 'File' }).click();
      await page.getByRole('menuitem', { name: 'Move to' }).click();
      await expect.element(page.getByRole('menuitem', { name: /^Project plan/ })).toBeVisible();
      expect(await shortcutTexts()).toEqual(['Ctl+M']);
    } finally {
      restorePlatform();
    }
  });

  it('shows check marks for single selection inside a section', async () => {
    const onSortChange = vi.fn();
    const screen = await renderWithDS(<ViewMenu onSortChange={onSortChange} />);
    await screen.getByRole('button', { name: 'View' }).click();

    await expect.element(page.getByRole('group', { name: 'Sort by' })).toBeVisible();
    const date = page.getByRole('menuitemradio', { name: 'Date created' });
    await expect.element(date).toHaveAttribute('aria-checked', 'true');
    await expect.element(date).toHaveAttribute('data-selected', 'true');
    const check = date.element().querySelector<HTMLElement>('[data-slot="check"]')!;
    expect(check.querySelector('svg')).not.toBeNull();
    expect(getComputedStyle(check).color).toBe(probe('text-primary', 'color'));
    const label = date.element().querySelector('[data-slot="label"]')!;
    expect(check.getBoundingClientRect().right).toBeLessThan(label.getBoundingClientRect().left);
    expect(getComputedStyle(date.element()).paddingInlineStart).toBe('32px');
    expect(getComputedStyle(date.element()).color).toBe(probe('text-on-surface', 'color'));

    const name = page.getByRole('menuitemradio', { name: 'Name' });
    expect(name.element().querySelector('[data-slot="check"]')).not.toBeNull();
    expect(name.element().querySelector('[data-slot="check"] svg')).toBeNull();

    await name.click();
    expect(onSortChange).toHaveBeenCalledOnce();
    expect([...(onSortChange.mock.calls[0][0] as Set<Key>)]).toEqual(['name']);
  });

  it('keeps the error tone when selected and dims disabled items', async () => {
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>Retention</Button>
        <Menu
          selectionMode="multiple"
          defaultSelectedKeys={['keep', 'purge', 'locked']}
          disabledKeys={['locked']}
        >
          <MenuItem id="keep">Keep drafts</MenuItem>
          <MenuItem id="purge" tone="error">
            Empty trash after 30 days
          </MenuItem>
          <MenuItem id="locked" tone="error">
            Empty trash now
          </MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await screen.getByRole('button', { name: 'Retention' }).click();

    const color = (element: Element) => getComputedStyle(element).color;
    const keep = page.getByRole('menuitemcheckbox', { name: 'Keep drafts' });
    await expect.element(keep).toBeVisible();
    expect(color(keep.element())).toBe(probe('text-on-surface', 'color'));
    const purge = page.getByRole('menuitemcheckbox', { name: 'Empty trash after 30 days' });
    await expect.element(purge).toHaveAttribute('aria-checked', 'true');
    expect(color(purge.element())).toBe(probe('text-error', 'color'));
    expect(color(purge.element().querySelector('[data-slot="check"]')!)).toBe(
      probe('text-error', 'color'),
    );
    const locked = page.getByRole('menuitemcheckbox', { name: 'Empty trash now' });
    await expect.element(locked).toHaveAttribute('aria-disabled', 'true');
    expect(getComputedStyle(locked.element()).opacity).toBe('0.5');
    expect(getComputedStyle(locked.element()).cursor).toBe('not-allowed');
  });

  it('opens a submenu with ArrowLeft in right-to-left locales', async () => {
    const onAction = vi.fn();
    await renderWithDS(<FileMenu onAction={onAction} />, { locale: 'ar' });

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    const move = page.getByRole('menuitem', { name: 'Move to' });
    await expect.element(move).toHaveAttribute('aria-haspopup', 'menu');
    expect(move.element().querySelector('[data-slot="submenu-indicator"]')).not.toBeNull();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(page.getByRole('menuitem', { name: 'Backups' })).toHaveFocus();
    const popovers = document.querySelectorAll('[data-slot="menu-popover"]');
    expect(popovers).toHaveLength(2);
    expect(popovers[1]).toHaveAttribute('data-trigger', 'SubmenuTrigger');
    expect(popovers[1]).toHaveAttribute('dir', 'rtl');
    expect(popovers[1]).toHaveAttribute('lang', 'ar');

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(firstKey(onAction)).toBe('archive');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('passes the dense size down to submenus', async () => {
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>File</Button>
        <Menu size="sm">
          <SubmenuTrigger>
            <MenuItem>Move to</MenuItem>
            <Menu>
              <MenuItem>Backups</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>,
    );

    await screen.getByRole('button', { name: 'File' }).click();
    await page.getByRole('menuitem', { name: 'Move to' }).click();
    const backups = page.getByRole('menuitem', { name: 'Backups' });
    await expect.element(backups).toHaveAttribute('data-size', 'sm');
    expect(getComputedStyle(backups.element()).minHeight).toBe('32px');
  });

  it('opens a submenu beside its item when wide and stacks it inside the screen at 375px', async () => {
    try {
      await page.viewport(1024, 768);
      const wide = await renderWithDS(<FileMenu />);
      await wide.getByRole('button', { name: 'File' }).click();
      await page.getByRole('menuitem', { name: 'Move to' }).click();
      await expect.element(page.getByRole('menuitem', { name: 'Backups' })).toBeVisible();
      const [parent, beside] = document.querySelectorAll<HTMLElement>('[data-slot="menu-popover"]');
      expect(beside).not.toHaveAttribute('data-stacked');
      await expect
        .poll(() => beside.getBoundingClientRect().left)
        .toBeGreaterThan(parent.getBoundingClientRect().right - 16);
      await userEvent.keyboard('{Escape}');
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
      await wide.unmount();

      await page.viewport(375, 812);
      const screen = await renderWithDS(
        <div className="flex justify-end">
          <FileMenu />
        </div>,
      );
      await screen.getByRole('button', { name: 'File' }).click();
      const move = page.getByRole('menuitem', { name: 'Move to' });
      await move.click();
      const backups = page.getByRole('menuitem', { name: 'Backups' });
      await expect.element(backups).toBeVisible();
      const submenu = document.querySelectorAll<HTMLElement>('[data-slot="menu-popover"]')[1];
      await expect.element(submenu).toHaveAttribute('data-stacked', 'true');
      await expect
        .poll(() => submenu.getBoundingClientRect().top)
        .toBeGreaterThanOrEqual(move.element().getBoundingClientRect().bottom);
      const box = submenu.getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(375);
      expect(move.element().getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
      await backups.click();
      await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    } finally {
      await page.viewport(414, 896);
    }
  });

  it('wraps long labels to two lines inside the 320px maximum width and a 375px screen', async () => {
    try {
      for (const [width, height, maxWidth] of [
        [1024, 768, 320],
        [375, 812, 375 - 32],
      ]) {
        await page.viewport(width, height);
        const screen = await renderWithDS(
          <MenuTrigger>
            <Button>Project</Button>
            <Menu>
              <MenuItem>
                Send a reminder to every member of this project and their shared teams
              </MenuItem>
            </Menu>
          </MenuTrigger>,
          { locale: 'de' },
        );

        await screen.getByRole('button', { name: 'Project' }).click();
        await expect.element(page.getByRole('menu')).toBeVisible();
        const popover = document.querySelector('[data-slot="menu-popover"]') as HTMLElement;
        const label = popover.querySelector('[data-slot="label"]') as HTMLElement;
        const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
        await expect.poll(() => label.offsetHeight).toBe(lineHeight * 2);
        expect(popover.offsetWidth).toBeLessThanOrEqual(maxWidth);
        expect(popover).toHaveAttribute('lang', 'de');
        await userEvent.keyboard('{Escape}');
        await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
        await screen.unmount();
      }
    } finally {
      await page.viewport(414, 896);
    }
  });

  it('composes a custom popover with content above the list, outside the group of its trigger', async () => {
    const screen = await renderWithDS(
      <ButtonGroup size="sm" buttonVariant="outline">
        <Button>Inbox</Button>
        <MenuTrigger>
          <Button>Alex Morgan</Button>
          <MenuPopover placement="bottom end">
            <div data-testid="account" className="px-4 py-3">
              alex@example.com
              <Button>Switch account</Button>
            </div>
            <MenuSeparator />
            <MenuList size="sm">
              <MenuItem>Profile</MenuItem>
              <MenuItem>Sign out</MenuItem>
            </MenuList>
          </MenuPopover>
        </MenuTrigger>
      </ButtonGroup>,
    );

    await screen.getByRole('button', { name: 'Alex Morgan' }).click();
    await expect.element(page.getByTestId('account')).toBeVisible();
    const menu = page.getByRole('menu', { name: 'Alex Morgan' });
    await expect.element(menu).toHaveAttribute('data-size', 'sm');
    await expect
      .element(page.getByRole('menuitem', { name: 'Profile' }))
      .toHaveAttribute('data-size', 'sm');
    const inner = page.getByRole('button', { name: 'Switch account' });
    await expect.element(inner).toHaveAttribute('data-size', 'md');
    await expect.element(inner).toHaveAttribute('data-variant', 'solid');
  });

  it('shows an empty state from labels, DSProvider or the English default', async () => {
    function RecentFiles({ labels }: { labels?: Partial<MenuLabels> }) {
      return (
        <MenuTrigger>
          <Button>Son dosyalar</Button>
          <Menu items={[] as { id: string; name: string }[]} labels={labels}>
            {(file) => <MenuItem id={file.id}>{file.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
      );
    }

    const english = await renderWithDS(<RecentFiles />, { locale: 'tr' });
    await english.getByRole('button', { name: 'Son dosyalar' }).click();
    await expect.element(page.getByText('No items')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await english.unmount();

    const provider = { labels: { menu: { empty: 'No entries' } } };
    const shared = await renderWithDS(<RecentFiles />, { provider });
    await shared.getByRole('button', { name: 'Son dosyalar' }).click();
    await expect.element(page.getByText('No entries')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await shared.unmount();

    const own = await renderWithDS(<RecentFiles labels={{ empty: 'No files have been added' }} />, {
      provider,
    });
    await own.getByRole('button', { name: 'Son dosyalar' }).click();
    await expect.element(page.getByText('No files have been added')).toBeVisible();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(
        <MenuTrigger>
          <Button>Project actions</Button>
          <Menu>
            <MenuSection>
              <MenuHeader>Project</MenuHeader>
              <MenuItem startIcon={<EditIcon />} shortcut={['mod', 'E']}>
                Edit project
              </MenuItem>
              <MenuItem description="Copies the files and the members">Duplicate</MenuItem>
              <MenuItem isDisabled description="Shared projects cannot be archived">
                Archive
              </MenuItem>
              <SubmenuTrigger>
                <MenuItem startIcon={<FolderIcon />}>Move to</MenuItem>
                <Menu>
                  <MenuItem>Backups</MenuItem>
                </Menu>
              </SubmenuTrigger>
            </MenuSection>
            <MenuSeparator />
            <MenuSection selectionMode="single" defaultSelectedKeys={['comfortable']}>
              <MenuHeader>Density</MenuHeader>
              <MenuItem id="comfortable">Comfortable</MenuItem>
              <MenuItem id="compact" shortcut={['mod', 'shift', 'D']}>
                Compact
              </MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuItem startIcon={<DeleteIcon />} tone="error">
              Delete project
            </MenuItem>
          </Menu>
        </MenuTrigger>,
        options,
      );
      await screen.getByRole('button', { name: 'Project actions' }).click();
      await expect.element(page.getByRole('menu')).toBeVisible();
      await wait(250);
      await expectNoA11yViolations(document.body);
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
      await screen.unmount();
    }
    document.documentElement.classList.remove('dark');
  });
});
