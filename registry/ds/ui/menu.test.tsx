import { useState } from 'react';
import { Button as AriaButton, type Key, type Selection } from 'react-aria-components';
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
import { Card } from '@/registry/ds/ui/card';
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
  menuPopoverStyles,
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

async function shortcutTexts() {
  await expect.element(page.getByRole('menu')).toBeVisible();
  return [...document.querySelectorAll('[data-slot="shortcut"]')].map((node) => node.textContent);
}

function firstKey(handler: ReturnType<typeof vi.fn>) {
  expect(handler).toHaveBeenCalledOnce();
  return handler.mock.calls[0][0];
}

function InvoiceMenu({
  menu,
  onEdit,
}: {
  menu?: Omit<MenuProps, 'children'>;
  onEdit?: () => void;
}) {
  return (
    <MenuTrigger>
      <Button>Invoice actions</Button>
      <Menu {...menu}>
        <MenuItem id="edit" startIcon={<EditIcon />} shortcut={['mod', 'E']} onAction={onEdit}>
          Edit invoice
        </MenuItem>
        <MenuItem
          id="duplicate"
          startIcon={<CopyIcon />}
          description="Copies the line items and the client"
        >
          Duplicate
        </MenuItem>
        <MenuItem id="archive" startIcon={<ArchiveIcon />} isDisabled>
          Archive
        </MenuItem>
        <MenuSeparator />
        <MenuItem id="delete" startIcon={<DeleteIcon />} tone="destructive">
          Delete invoice
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

function ViewMenu({
  onSortChange,
  onColumnsChange,
}: {
  onSortChange?: (keys: Selection) => void;
  onColumnsChange?: (keys: Selection) => void;
}) {
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
          <MenuItem id="date">Issue date</MenuItem>
          <MenuItem id="amount">Amount</MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuSection
          selectionMode="multiple"
          defaultSelectedKeys={['client', 'status']}
          onSelectionChange={onColumnsChange}
        >
          <MenuHeader>Columns</MenuHeader>
          <MenuItem id="client">Client</MenuItem>
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
            <MenuItem id="payroll">Payroll</MenuItem>
            <MenuItem id="taxes">Taxes 2026</MenuItem>
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
  it('opens a menu named by its trigger with the M3 surface', async () => {
    const screen = await renderWithDS(<InvoiceMenu />);
    const trigger = screen.getByRole('button', { name: 'Invoice actions' });
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'true');

    await trigger.click();
    const menu = page.getByRole('menu', { name: 'Invoice actions' });
    await expect.element(menu).toBeVisible();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.element(menu).toHaveAttribute('data-size', 'md');
    expect(page.getByRole('menuitem').all()).toHaveLength(4);
    await expect
      .element(page.getByRole('menuitem', { name: 'Delete invoice' }))
      .toHaveAttribute('data-tone', 'destructive');
    await expect.element(page.getByRole('separator')).toBeInTheDocument();

    const popover = document.querySelector('[data-slot="menu-popover"]');
    expect(popover).toHaveClass(
      'bg-surface-container',
      'rounded-sm',
      'shadow-elevation-2',
      'min-w-28',
    );
    expect(popover).not.toHaveClass('bg-surface-container-high');
  });

  it('calls onAction with the item key, closes and returns focus to the trigger', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(<InvoiceMenu menu={{ onAction }} />);
    const trigger = screen.getByRole('button', { name: 'Invoice actions' });

    await trigger.click();
    await page.getByRole('menuitem', { name: /^Duplicate/ }).click();
    expect(firstKey(onAction)).toBe('duplicate');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('calls the onAction of a single item', async () => {
    const onEdit = vi.fn();
    const onAction = vi.fn();
    const screen = await renderWithDS(<InvoiceMenu menu={{ onAction }} onEdit={onEdit} />);

    await screen.getByRole('button', { name: 'Invoice actions' }).click();
    await page.getByRole('menuitem', { name: /^Edit invoice/ }).click();
    expect(onEdit).toHaveBeenCalledOnce();
    expect(firstKey(onAction)).toBe('edit');
  });

  it('is operable from the keyboard and skips disabled items', async () => {
    const onAction = vi.fn();
    await renderWithDS(<InvoiceMenu menu={{ onAction }} />);

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    const edit = page.getByRole('menuitem', { name: /^Edit invoice/ });
    await expect.element(edit).toHaveFocus();
    await expect.element(edit).toHaveAttribute('data-focus-visible', 'true');
    expect(getComputedStyle(edit.element()).outlineWidth).toBe('3px');
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('menuitem', { name: /^Duplicate/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('menuitem', { name: 'Delete invoice' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(firstKey(onAction)).toBe('delete');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const screen = await renderWithDS(<InvoiceMenu />);
    const trigger = screen.getByRole('button', { name: 'Invoice actions' });

    await trigger.click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('does not fire disabled items', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(<InvoiceMenu menu={{ onAction }} />);

    await screen.getByRole('button', { name: 'Invoice actions' }).click();
    const archive = page.getByRole('menuitem', { name: 'Archive' });
    await expect.element(archive).toHaveAttribute('aria-disabled', 'true');
    await archive.click({ force: true });
    expect(onAction).not.toHaveBeenCalled();
    await expect.element(page.getByRole('menu')).toBeVisible();
  });

  it('names items by all of their visible text, shortcut included', async () => {
    const screen = await renderWithDS(<InvoiceMenu />);
    await screen.getByRole('button', { name: 'Invoice actions' }).click();

    const duplicate = page.getByRole('menuitem', { name: /^Duplicate/ });
    await expect
      .element(duplicate)
      .toHaveAccessibleName(/^Duplicate\s*Copies the line items and the client$/);
    await expect.element(duplicate).not.toHaveAttribute('aria-labelledby');
    await expect.element(duplicate).not.toHaveAttribute('aria-describedby');

    const edit = page.getByRole('menuitem', { name: /^Edit invoice/ });
    await expect.element(edit).toHaveAccessibleName(/^Edit invoice\s*(⌘E|Ctrl\+E)$/);
    expect(edit.element().querySelector('[data-slot="start-icon"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    const shortcut = edit.element().querySelector('[data-slot="shortcut"]');
    expect(shortcut?.tagName).toBe('KBD');
    expect(shortcut).toHaveAttribute('dir', 'ltr');
    expect(shortcut).toHaveTextContent(
      shortcut?.getAttribute('data-platform') === 'apple' ? '⌘E' : 'Ctrl+E',
    );
  });

  it('shows Apple symbols in Apple modifier order on Apple platforms', async () => {
    stubPlatform('macOS');
    try {
      const screen = await renderWithDS(<ShortcutMenu label="Ledger" item="Export statement" />);
      await screen.getByRole('button', { name: 'Ledger' }).click();
      expect(await shortcutTexts()).toEqual(['⇧⌘S', '⌃⌥⌦', 'F2', 'Space']);
      await expect
        .element(page.getByRole('menuitem', { name: /^Export statement/ }))
        .toHaveAccessibleName(/^Export statement\s*⇧⌘S$/);
    } finally {
      restorePlatform();
    }
  });

  it('joins English key names with + elsewhere, whatever the locale', async () => {
    stubPlatform('Windows');
    try {
      const screen = await renderWithDS(
        <ShortcutMenu label="Rechnung" item="Kontoauszug exportieren" />,
        { locale: 'de' },
      );
      await screen.getByRole('button', { name: 'Rechnung' }).click();
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
      labels: { menu: { ctrl: 'Strg', shift: 'Umschalt', delete: 'Entf', space: 'Leertaste' } },
    };
    try {
      const screen = await renderWithDS(
        <ShortcutMenu label="Rechnung" item="Kontoauszug exportieren" />,
        { provider },
      );
      await screen.getByRole('button', { name: 'Rechnung' }).click();
      expect(await shortcutTexts()).toEqual([
        'Strg+Umschalt+S',
        'Alt+Strg+Entf',
        'F2',
        'Leertaste',
      ]);
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
      await screen.unmount();

      const own = await renderWithDS(
        <ShortcutMenu
          label="Rechnung"
          item="Kontoauszug exportieren"
          labels={{ alt: 'Wahl', space: 'Leer' }}
        />,
        { provider },
      );
      await own.getByRole('button', { name: 'Rechnung' }).click();
      expect(await shortcutTexts()).toEqual(['Strg+Umschalt+S', 'Wahl+Strg+Entf', 'F2', 'Leer']);
    } finally {
      restorePlatform();
    }
  });

  it('passes its labels down to submenus', async () => {
    stubPlatform('Windows');
    try {
      const screen = await renderWithDS(
        <MenuTrigger>
          <Button>Datei</Button>
          <Menu labels={{ ctrl: 'Strg', empty: 'Keine Einträge' }}>
            <SubmenuTrigger>
              <MenuItem>Verschieben nach</MenuItem>
              <Menu>
                <MenuItem shortcut={['ctrl', 'M']}>Lohnabrechnung</MenuItem>
              </Menu>
            </SubmenuTrigger>
            <SubmenuTrigger>
              <MenuItem>Zuletzt geöffnet</MenuItem>
              <Menu items={[] as { id: string; name: string }[]}>
                {(file) => <MenuItem id={file.id}>{file.name}</MenuItem>}
              </Menu>
            </SubmenuTrigger>
          </Menu>
        </MenuTrigger>,
      );
      await screen.getByRole('button', { name: 'Datei' }).click();
      await page.getByRole('menuitem', { name: 'Verschieben nach' }).click();
      await expect
        .element(page.getByRole('menuitem', { name: /^Lohnabrechnung/ }))
        .toHaveAccessibleName(/^Lohnabrechnung\s*Strg\+M$/);
      await userEvent.keyboard('{Escape}');
      await page.getByRole('menuitem', { name: 'Zuletzt geöffnet' }).click();
      await expect.element(page.getByText('Keine Einträge')).toBeVisible();
    } finally {
      restorePlatform();
    }
  });

  it('shows check marks for single selection inside a section', async () => {
    const onSortChange = vi.fn();
    const screen = await renderWithDS(<ViewMenu onSortChange={onSortChange} />);
    await screen.getByRole('button', { name: 'View' }).click();

    await expect.element(page.getByRole('group', { name: 'Sort by' })).toBeVisible();
    const date = page.getByRole('menuitemradio', { name: 'Issue date' });
    await expect.element(date).toHaveAttribute('aria-checked', 'true');
    await expect.element(date).toHaveAttribute('data-selected', 'true');
    expect(date.element().querySelector('[data-slot="check"] svg')).not.toBeNull();

    const amount = page.getByRole('menuitemradio', { name: 'Amount' });
    expect(amount.element().querySelector('[data-slot="check"]')).not.toBeNull();
    expect(amount.element().querySelector('[data-slot="check"] svg')).toBeNull();

    await amount.click();
    expect(onSortChange).toHaveBeenCalledOnce();
    expect([...(onSortChange.mock.calls[0][0] as Set<Key>)]).toEqual(['amount']);
  });

  it('toggles multiple selection and stays open', async () => {
    const onColumnsChange = vi.fn();
    const screen = await renderWithDS(<ViewMenu onColumnsChange={onColumnsChange} />);
    await screen.getByRole('button', { name: 'View' }).click();

    await expect.element(page.getByRole('group', { name: 'Columns' })).toBeVisible();
    const due = page.getByRole('menuitemcheckbox', { name: 'Due date' });
    await expect.element(due).toHaveAttribute('aria-checked', 'false');
    await due.click();
    await expect.element(due).toHaveAttribute('aria-checked', 'true');
    expect([...(onColumnsChange.mock.calls[0][0] as Set<Key>)].sort()).toEqual([
      'client',
      'due',
      'status',
    ]);
    await expect.element(page.getByRole('menu')).toBeVisible();
  });

  it('supports controlled selection', async () => {
    function Controlled() {
      const [density, setDensity] = useState<Selection>(new Set(['comfortable']));
      return (
        <>
          <p>Density: {[...density].join()}</p>
          <MenuTrigger>
            <Button>Density</Button>
            <Menu selectionMode="single" selectedKeys={density} onSelectionChange={setDensity}>
              <MenuItem id="comfortable">Comfortable</MenuItem>
              <MenuItem id="compact">Compact</MenuItem>
            </Menu>
          </MenuTrigger>
        </>
      );
    }

    const screen = await renderWithDS(<Controlled />);
    await screen.getByRole('button', { name: 'Density' }).click();
    await page.getByRole('menuitemradio', { name: 'Compact' }).click();
    await expect.element(screen.getByText('Density: compact')).toBeInTheDocument();
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps the destructive tone when selected and the disabled colour above both', async () => {
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>Retention</Button>
        <Menu
          selectionMode="multiple"
          defaultSelectedKeys={['keep', 'purge', 'locked']}
          disabledKeys={['locked']}
        >
          <MenuItem id="keep">Keep drafts</MenuItem>
          <MenuItem id="purge" tone="destructive">
            Purge after 30 days
          </MenuItem>
          <MenuItem id="locked" tone="destructive">
            Purge immediately
          </MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await screen.getByRole('button', { name: 'Retention' }).click();

    const keep = page.getByRole('menuitemcheckbox', { name: 'Keep drafts' });
    await expect.element(keep).toHaveClass('text-primary');
    const purge = page.getByRole('menuitemcheckbox', { name: 'Purge after 30 days' });
    await expect.element(purge).toHaveAttribute('aria-checked', 'true');
    await expect.element(purge).toHaveClass('text-error');
    await expect.element(purge).not.toHaveClass('text-primary');
    expect(purge.element().querySelector('[data-slot="check"]')).toHaveClass('text-error');
    const locked = page.getByRole('menuitemcheckbox', { name: 'Purge immediately' });
    await expect.element(locked).toHaveAttribute('aria-disabled', 'true');
    await expect.element(locked).toHaveClass('text-on-surface/38');
    await expect.element(locked).not.toHaveClass('text-error');
  });

  it('names a section without a header by its aria-label', async () => {
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>Export</Button>
        <Menu>
          <MenuSection aria-label="Spreadsheet formats">
            <MenuItem>CSV</MenuItem>
            <MenuItem>Excel workbook</MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>,
    );
    await screen.getByRole('button', { name: 'Export' }).click();
    const group = page.getByRole('group', { name: 'Spreadsheet formats' });
    await expect.element(group).toHaveAttribute('data-slot', 'menu-section');
    expect(group.getByRole('menuitem').all()).toHaveLength(2);
  });

  it('supports a controlled open state', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [isOpen, setOpen] = useState(false);
      return (
        <>
          <Button onPress={() => setOpen(true)}>Show invoice actions</Button>
          <MenuTrigger
            isOpen={isOpen}
            onOpenChange={(open) => {
              onOpenChange(open);
              setOpen(open);
            }}
          >
            <Button>Invoice actions</Button>
            <Menu>
              <MenuItem id="edit">Edit invoice</MenuItem>
            </Menu>
          </MenuTrigger>
        </>
      );
    }

    const screen = await renderWithDS(<Controlled />);
    await screen.getByRole('button', { name: 'Show invoice actions' }).click();
    await expect.element(page.getByRole('menu', { name: 'Invoice actions' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    await screen.getByRole('button', { name: 'Invoice actions' }).click();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await expect.element(page.getByRole('menu')).toBeVisible();
  });

  it('opens a submenu from the keyboard and runs its actions', async () => {
    const onAction = vi.fn();
    await renderWithDS(<FileMenu onAction={onAction} />);

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    const move = page.getByRole('menuitem', { name: 'Move to' });
    await expect.element(move).toHaveFocus();
    await expect.element(move).toHaveAttribute('aria-haspopup', 'menu');
    expect(move.element().querySelector('[data-slot="submenu-indicator"]')).not.toBeNull();

    await userEvent.keyboard('{ArrowRight}');
    await expect.element(page.getByRole('menuitem', { name: 'Payroll' })).toHaveFocus();
    await expect.element(move).toHaveAttribute('data-open', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(firstKey(onAction)).toBe('taxes');
    await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
  });

  it('opens a submenu with ArrowLeft in right-to-left locales', async () => {
    await renderWithDS(<FileMenu />, { locale: 'ar' });

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(page.getByRole('menuitem', { name: 'Payroll' })).toHaveFocus();
    const popovers = document.querySelectorAll('[data-slot="menu-popover"]');
    expect(popovers).toHaveLength(2);
    expect(popovers[1]).toHaveAttribute('data-trigger', 'SubmenuTrigger');
    expect(popovers[1]).toHaveAttribute('dir', 'rtl');
    expect(popovers[1]).toHaveAttribute('lang', 'ar');
  });

  it('passes the dense size down to submenus', async () => {
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>File</Button>
        <Menu size="sm">
          <SubmenuTrigger>
            <MenuItem>Move to</MenuItem>
            <Menu>
              <MenuItem>Payroll</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>,
    );

    await screen.getByRole('button', { name: 'File' }).click();
    await page.getByRole('menuitem', { name: 'Move to' }).click();
    const payroll = page.getByRole('menuitem', { name: 'Payroll' });
    await expect.element(payroll).toHaveAttribute('data-size', 'sm');
    expect(getComputedStyle(payroll.element()).minHeight).toBe('40px');
  });

  it('wraps long labels to two lines inside the 280px maximum width', async () => {
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>Rechnung</Button>
        <Menu>
          <MenuItem>Zahlungserinnerung an alle säumigen Kunden dieses Quartals senden</MenuItem>
        </Menu>
      </MenuTrigger>,
      { locale: 'de' },
    );

    await screen.getByRole('button', { name: 'Rechnung' }).click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    const popover = document.querySelector('[data-slot="menu-popover"]') as HTMLElement;
    const label = popover.querySelector('[data-slot="label"]') as HTMLElement;
    const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
    await expect.poll(() => label.offsetHeight).toBe(lineHeight * 2);
    expect(popover.offsetWidth).toBeLessThanOrEqual(280);
    expect(popover).toHaveAttribute('lang', 'de');
  });

  it('renders link items that navigate through the DSProvider router', async () => {
    const navigate = vi.fn();
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>Help</Button>
        <Menu>
          <MenuItem href="/docs/invoices">Invoicing guide</MenuItem>
          <MenuItem href="https://status.example.com" target="_blank" rel="noreferrer">
            Service status
          </MenuItem>
        </Menu>
      </MenuTrigger>,
      { provider: { navigate } },
    );

    await screen.getByRole('button', { name: 'Help' }).click();
    const guide = page.getByRole('menuitem', { name: 'Invoicing guide' });
    expect(guide.element().tagName).toBe('A');
    await expect.element(guide).toHaveAttribute('href', '/docs/invoices');
    await expect
      .element(page.getByRole('menuitem', { name: 'Service status' }))
      .toHaveAttribute('target', '_blank');

    await guide.click();
    expect(navigate).toHaveBeenCalledWith('/docs/invoices', undefined);
  });

  it('opens as a context menu on right click without announcing a popup button', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(
      <MenuTrigger trigger="contextMenu">
        <AriaButton className="p-6">Q3 payroll.xlsx</AriaButton>
        <Menu onAction={onAction}>
          <MenuItem id="rename">Rename</MenuItem>
          <MenuItem id="download">Download</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    const file = screen.getByRole('button', { name: 'Q3 payroll.xlsx' });
    await expect.element(file).not.toHaveAttribute('aria-haspopup');

    await file.click();
    expect(document.querySelector('[role="menu"]')).toBeNull();

    await file.click({ button: 'right' });
    await expect.element(page.getByRole('menu')).toBeVisible();
    await page.getByRole('menuitem', { name: 'Download' }).click();
    expect(firstKey(onAction)).toBe('download');
  });

  it('composes a custom popover with content above the list', async () => {
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>Ayşe Demir</Button>
        <MenuPopover placement="bottom end">
          <div data-testid="account" className="px-4 py-3">
            ayse@northwind.example
          </div>
          <MenuSeparator />
          <MenuList size="sm">
            <MenuItem>Profile</MenuItem>
            <MenuItem>Sign out</MenuItem>
          </MenuList>
        </MenuPopover>
      </MenuTrigger>,
    );

    await screen.getByRole('button', { name: 'Ayşe Demir' }).click();
    await expect.element(page.getByTestId('account')).toBeVisible();
    const menu = page.getByRole('menu', { name: 'Ayşe Demir' });
    await expect.element(menu).toHaveAttribute('data-size', 'sm');
    await expect
      .element(page.getByRole('menuitem', { name: 'Profile' }))
      .toHaveAttribute('data-size', 'sm');
  });

  it('renders the dense size', async () => {
    const screen = await renderWithDS(<InvoiceMenu menu={{ size: 'sm' }} />);
    await screen.getByRole('button', { name: 'Invoice actions' }).click();

    await expect.element(page.getByRole('menu')).toHaveAttribute('data-size', 'sm');
    const item = page.getByRole('menuitem', { name: /^Duplicate/ });
    await expect.element(item).toHaveAttribute('data-size', 'sm');
    expect(getComputedStyle(item.element()).minHeight).toBe('40px');
  });

  it('renders md items at least 48px tall', async () => {
    const screen = await renderWithDS(<InvoiceMenu />);
    await screen.getByRole('button', { name: 'Invoice actions' }).click();
    const item = page.getByRole('menuitem', { name: /^Edit invoice/ });
    await expect.element(item).toBeVisible();
    expect(getComputedStyle(item.element()).minHeight).toBe('48px');
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

    const provider = { labels: { menu: { empty: 'Öğe yok' } } };
    const shared = await renderWithDS(<RecentFiles />, { provider });
    await shared.getByRole('button', { name: 'Son dosyalar' }).click();
    await expect.element(page.getByText('Öğe yok')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await shared.unmount();

    const own = await renderWithDS(<RecentFiles labels={{ empty: 'Henüz dosya yok' }} />, {
      provider,
    });
    await own.getByRole('button', { name: 'Son dosyalar' }).click();
    await expect.element(page.getByText('Henüz dosya yok')).toBeVisible();
  });

  it('raises cards inside the popover above the menu surface', async () => {
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>Ayşe Demir</Button>
        <MenuPopover>
          <Card variant="outlined">Finance workspace</Card>
          <MenuList aria-label="Account">
            <MenuItem>Sign out</MenuItem>
          </MenuList>
        </MenuPopover>
      </MenuTrigger>,
    );
    await screen.getByRole('button', { name: 'Ayşe Demir' }).click();
    await expect.element(page.getByRole('menu', { name: 'Account' })).toBeVisible();
    expect(document.querySelector('[data-slot="menu-popover"] [data-slot="card"]')).toHaveAttribute(
      'data-surface',
      'surface-container-high',
    );
  });

  it('renders dynamic items', async () => {
    const members = [
      { id: 'ayse', name: 'Ayşe Demir' },
      { id: 'mert', name: 'Mert Kaya' },
    ];
    const onAction = vi.fn();
    const screen = await renderWithDS(
      <MenuTrigger>
        <Button>Assign</Button>
        <Menu items={members} onAction={onAction}>
          {(member) => <MenuItem id={member.id}>{member.name}</MenuItem>}
        </Menu>
      </MenuTrigger>,
    );

    await screen.getByRole('button', { name: 'Assign' }).click();
    await userEvent.keyboard('m');
    await expect.element(page.getByRole('menuitem', { name: 'Mert Kaya' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(firstKey(onAction)).toBe('mert');
  });

  it('skips the scale animation when motion is disabled', async () => {
    const screen = await renderWithDS(<InvoiceMenu />, { provider: { motion: 'disabled' } });
    await screen.getByRole('button', { name: 'Invoice actions' }).click();
    await expect.element(page.getByRole('menu')).toBeVisible();
    expect(document.querySelector('[data-slot="menu-popover"]')?.className).not.toContain(
      'animate-ds-popover-in',
    );
  });

  it('exports the menu surface styles', () => {
    expect(menuPopoverStyles()).toContain('bg-surface-container');
    expect(menuPopoverStyles()).not.toContain('bg-surface-container-high');
    expect(menuPopoverStyles()).toContain('max-w-[min(17.5rem,calc(100vw-1.5rem))]');
    expect(menuPopoverStyles({ motion: 'none' })).not.toContain('animate-ds-popover-in');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(
        <MenuTrigger>
          <Button>Invoice actions</Button>
          <Menu>
            <MenuSection>
              <MenuHeader>Invoice</MenuHeader>
              <MenuItem startIcon={<EditIcon />} shortcut={['mod', 'E']}>
                Edit invoice
              </MenuItem>
              <MenuItem description="Copies the line items and the client">Duplicate</MenuItem>
              <MenuItem isDisabled description="Paid invoices cannot be archived">
                Archive
              </MenuItem>
              <SubmenuTrigger>
                <MenuItem startIcon={<FolderIcon />}>Move to</MenuItem>
                <Menu>
                  <MenuItem>Payroll</MenuItem>
                </Menu>
              </SubmenuTrigger>
            </MenuSection>
            <MenuSeparator />
            <MenuSection selectionMode="single" defaultSelectedKeys={['eur']}>
              <MenuHeader>Currency</MenuHeader>
              <MenuItem id="eur">Euro</MenuItem>
              <MenuItem id="try">Turkish lira</MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuItem startIcon={<DeleteIcon />} tone="destructive">
              Delete invoice
            </MenuItem>
          </Menu>
        </MenuTrigger>,
        options,
      );
      await screen.getByRole('button', { name: 'Invoice actions' }).click();
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
