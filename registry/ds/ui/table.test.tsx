import { useState } from 'react';
import type { Selection, SortDescriptor } from 'react-aria-components';
import { page, userEvent, type Locator } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { EmptyState } from '@/registry/ds/ui/empty-state';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableLoadMore,
  type TableProps,
} from '@/registry/ds/ui/table';

const folders = [
  { id: 'photos', name: 'Photos', items: 2481 },
  { id: 'documents', name: 'Documents', items: 312 },
  { id: 'music', name: 'Music', items: 1045 },
];

function Folders({ sortable = false, ...props }: Partial<TableProps> & { sortable?: boolean }) {
  const [sort, setSort] = useState<SortDescriptor>({ column: 'name', direction: 'ascending' });
  const rows = [...folders].sort((a, b) => {
    const key = sort.column as 'name' | 'items';
    const order = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
    return sort.direction === 'descending' ? -order : order;
  });
  return (
    <Table
      aria-label="Folders"
      sortDescriptor={sortable ? sort : undefined}
      onSortChange={sortable ? setSort : undefined}
      {...props}
    >
      <TableHeader>
        <Column id="name" isRowHeader allowsSorting={sortable}>
          Folder
        </Column>
        <Column id="items" allowsSorting={sortable} align="end">
          Items
        </Column>
      </TableHeader>
      <TableBody items={rows}>
        {(folder) => (
          <Row id={folder.id}>
            <Cell>{folder.name}</Cell>
            <Cell align="end">{folder.items}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}

async function toggle(checkbox: Locator) {
  const target = checkbox
    .element()
    .closest('[data-slot="checkbox"]')!
    .querySelector('[data-slot="target"]')!;
  await userEvent.click(target);
}

function bodyRows(container: Element) {
  return [...container.querySelectorAll('tbody [role="row"]')];
}

function names(container: Element) {
  return bodyRows(container).map((row) => row.querySelector('[role="rowheader"]')?.textContent);
}

describe('Table', () => {
  beforeEach(async () => {
    await page.viewport(1024, 768);
  });

  it('renders a grid with column and row headers', async () => {
    const screen = await renderWithDS(<Folders />);
    await expect.element(screen.getByRole('grid', { name: 'Folders' })).toBeVisible();
    expect(screen.getByRole('columnheader').all()).toHaveLength(2);
    expect(
      screen
        .getByRole('rowheader')
        .all()
        .map((cell) => cell.element().textContent),
    ).toEqual(['Documents', 'Music', 'Photos']);
    const table = screen.getByRole('grid').element();
    expect(table.getAttribute('data-density')).toBe('md');
  });

  it('sorts from a header with the pointer and the keyboard and reports aria-sort', async () => {
    const screen = await renderWithDS(<Folders sortable />);
    const name = screen.getByRole('columnheader', { name: /Folder/ });
    const items = screen.getByRole('columnheader', { name: /Items/ });
    await expect.element(name).toHaveAttribute('aria-sort', 'ascending');
    await expect.element(items).toHaveAttribute('aria-sort', 'none');
    await items.click();
    await expect.element(items).toHaveAttribute('aria-sort', 'ascending');
    expect(names(screen.container)).toEqual(['Documents', 'Music', 'Photos']);
    await items.click();
    await expect.element(items).toHaveAttribute('aria-sort', 'descending');
    expect(names(screen.container)).toEqual(['Photos', 'Music', 'Documents']);

    name.element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(name).toHaveAttribute('aria-sort', 'ascending');
    expect(names(screen.container)).toEqual(['Documents', 'Music', 'Photos']);
  });

  it('turns the sort chevron and keeps it out of the accessible name', async () => {
    const screen = await renderWithDS(<Folders sortable />);
    const name = screen.getByRole('columnheader', { name: /Folder/ });
    await expect.element(name).toHaveAccessibleName('Folder');
    const indicator = name.element().querySelector('[data-slot="table-sort-indicator"]')!;
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
    expect(indicator.getAttribute('data-direction')).toBe('ascending');
    await expect.poll(() => getComputedStyle(indicator).rotate).toBe('180deg');
    await name.click();
    expect(indicator.getAttribute('data-direction')).toBe('descending');
    await expect.poll(() => getComputedStyle(indicator).rotate).toBe('none');
    const items = screen.getByRole('columnheader', { name: /Items/ }).element();
    const itemsIndicator = items.querySelector('[data-slot="table-sort-indicator"]')!;
    expect(itemsIndicator.hasAttribute('data-direction')).toBe(false);
    expect(Number(getComputedStyle(itemsIndicator).opacity)).toBeLessThan(1);
  });

  it('selects rows with checkboxes, select-all and the keyboard', async () => {
    function Selectable() {
      const [selected, setSelected] = useState<Selection>(new Set(['music']));
      return (
        <div>
          <Folders
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={setSelected}
          />
          <output data-testid="selected">
            {selected === 'all' ? 'all' : [...selected].join(',')}
          </output>
        </div>
      );
    }
    const screen = await renderWithDS(<Selectable />);
    const rows = screen.getByRole('row').all().slice(1);
    await expect.element(rows[1]).toHaveAttribute('aria-selected', 'true');
    await expect.element(rows[0]).toHaveAttribute('aria-selected', 'false');
    const selectAll = screen.getByRole('checkbox', { name: 'Select All' });
    await expect.element(selectAll).toBePartiallyChecked();

    await toggle(screen.getByRole('checkbox', { name: 'Select Documents' }));
    await expect.element(rows[0]).toHaveAttribute('aria-selected', 'true');

    await toggle(selectAll);
    await expect.element(screen.getByTestId('selected')).toHaveTextContent('all');
    await expect.element(selectAll).toBeChecked();

    await toggle(selectAll);
    await expect.element(selectAll).not.toBeChecked();
    await expect.element(screen.getByTestId('selected')).toBeEmptyDOMElement();

    rows[2].element().focus();
    await userEvent.keyboard(' ');
    await expect.element(rows[2]).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(rows[1]).toHaveFocus();
  });

  it('tints selected rows with the pale primary fill', async () => {
    const screen = await renderWithDS(
      <div>
        <span data-testid="tint" className="bg-primary-soft" />
        <Folders selectionMode="multiple" defaultSelectedKeys={['photos']} />
      </div>,
    );
    const selected = screen.getByRole('row', { selected: true }).element();
    expect(getComputedStyle(selected).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('tint').element()).backgroundColor,
    );
  });

  it('shows a radio-free single selection column with a hidden header', async () => {
    const screen = await renderWithDS(<Folders selectionMode="single" />);
    const header = screen.getByRole('columnheader').first();
    await expect.element(header).toHaveTextContent('Selection');
    const label = header.element().querySelector('span')!;
    expect(getComputedStyle(label).position).toBe('absolute');
    expect(screen.getByRole('checkbox').all()).toHaveLength(3);
  });

  it('sizes rows by density', async () => {
    const screen = await renderWithDS(
      <div>
        <Folders aria-label="Normal" />
        <Folders aria-label="Compact" density="sm" selectionMode="multiple" />
      </div>,
    );
    const normal = screen.getByRole('grid', { name: 'Normal' }).element();
    const compact = screen.getByRole('grid', { name: 'Compact' }).element();
    expect(normal.querySelector('tbody tr')!.getBoundingClientRect().height).toBe(52);
    expect(normal.querySelector('thead th')!.getBoundingClientRect().height).toBe(40);
    expect(compact.querySelector('tbody tr')!.getBoundingClientRect().height).toBe(40);
    expect(compact.querySelector('thead th')!.getBoundingClientRect().height).toBe(32);
    expect(compact.getAttribute('data-density')).toBe('sm');
    const box = compact.querySelector('[data-slot="checkbox"]')!;
    expect(box.getAttribute('data-size')).toBe('sm');
  });

  it('tints the header and rounds its ends', async () => {
    const screen = await renderWithDS(
      <div>
        <span data-testid="neutral" className="bg-neutral-soft" />
        <Folders />
      </div>,
    );
    const first = screen.getByRole('columnheader').first().element();
    const tint = getComputedStyle(first, '::before');
    expect(tint.backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('neutral').element()).backgroundColor,
    );
    expect(tint.borderTopLeftRadius).toBe('12px');
    expect(tint.borderTopRightRadius).toBe('0px');
  });

  it('aligns end columns to the end, mirrored in right-to-left layouts', async () => {
    for (const locale of ['en', 'ar']) {
      const screen = await renderWithDS(<Folders />, { locale });
      const cell = screen.getByRole('gridcell').first().element();
      expect(getComputedStyle(cell).textAlign).toBe('end');
      const header = screen.getByRole('columnheader').first().element();
      const cellBox = cell.getBoundingClientRect();
      const headerBox = header.getBoundingClientRect();
      if (locale === 'ar') expect(cellBox.right).toBeLessThan(headerBox.left + 1);
      else expect(cellBox.left).toBeGreaterThan(headerBox.right - 1);
      await screen.unmount();
    }
  });

  it('keeps the row header column in view while scrolling sideways', async () => {
    for (const locale of ['en', 'ar']) {
      const screen = await renderWithDS(
        <div className="w-72">
          <Table aria-label="Wide" selectionMode="multiple" stickyRowHeader>
            <TableHeader>
              <Column isRowHeader>Folder</Column>
              <Column>Owner</Column>
              <Column>Shared with</Column>
              <Column>Location</Column>
            </TableHeader>
            <TableBody>
              {folders.map((folder) => (
                <Row key={folder.id} id={folder.id}>
                  <Cell>{folder.name}</Cell>
                  <Cell className="whitespace-nowrap">Amara Okafor</Cell>
                  <Cell className="whitespace-nowrap">Kenji, Sofia and Mateo</Cell>
                  <Cell className="whitespace-nowrap">Shared drive / Team</Cell>
                </Row>
              ))}
            </TableBody>
          </Table>
        </div>,
        { locale },
      );
      const container = screen.container.querySelector<HTMLElement>(
        '[data-slot="table-container"]',
      )!;
      expect(container.scrollWidth).toBeGreaterThan(container.clientWidth);
      const header = screen.getByRole('rowheader').first().element();
      const selection = header.previousElementSibling!;
      expect(getComputedStyle(header).position).toBe('sticky');
      expect(getComputedStyle(selection).position).toBe('sticky');
      const before = header.getBoundingClientRect().left;
      container.scrollLeft = locale === 'ar' ? -120 : 120;
      await expect.poll(() => header.getBoundingClientRect().left).toBe(before);
      const side = locale === 'ar' ? 'right' : 'left';
      expect(getComputedStyle(header)[side]).toBe(`${selection.getBoundingClientRect().width}px`);
      expect(getComputedStyle(header).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      await screen.unmount();
    }
  });

  it('draws the row focus ring across sticky cells', async () => {
    const screen = await renderWithDS(
      <div>
        <button type="button">Before</button>
        <Folders selectionMode="multiple" stickyRowHeader />
      </div>,
    );
    const row = screen.getByRole('row').nth(1).element();
    const header = screen.getByRole('rowheader').first().element();
    expect(getComputedStyle(header, '::after').borderTopWidth).toBe('2px');
    const idle = getComputedStyle(header, '::after').borderTopColor;
    screen.getByRole('button', { name: 'Before' }).element().focus();
    await userEvent.keyboard('{Tab}');
    await expect.element(row).toHaveFocus();
    expect(row.getAttribute('data-focus-visible')).toBe('true');
    await expect.poll(() => getComputedStyle(header, '::after').borderTopColor).not.toBe(idle);
    expect(getComputedStyle(row).outlineStyle).toBe('solid');
  });

  it('keeps the header in view in a scrolling container when asked', async () => {
    const screen = await renderWithDS(<Folders stickyHeader containerClassName="max-h-24" />);
    const header = screen.getByRole('columnheader').first().element();
    expect(getComputedStyle(header).position).toBe('sticky');
    expect(getComputedStyle(header).top).toBe('0px');
  });

  it('renders an empty state', async () => {
    const screen = await renderWithDS(
      <Table aria-label="Shared">
        <TableHeader>
          <Column isRowHeader>Project</Column>
        </TableHeader>
        <TableBody
          renderEmptyState={() => <EmptyState size="sm" headingLevel={3} title="No projects" />}
        >
          {[]}
        </TableBody>
      </Table>,
    );
    await expect.element(screen.getByRole('heading', { name: 'No projects' })).toBeVisible();
  });

  it('loads more rows and labels the loader', async () => {
    const onLoadMore = vi.fn();
    const screen = await renderWithDS(
      <div className="flex flex-col gap-2">
        <Table aria-label="Cities">
          <TableHeader>
            <Column isRowHeader>City</Column>
          </TableHeader>
          <TableBody>
            <Row id="lisbon">
              <Cell>Lisbon</Cell>
            </Row>
            <TableLoadMore isLoading onLoadMore={onLoadMore} />
          </TableBody>
        </Table>
        <Table aria-label="Städte" labels={{ loadingMore: 'Lädt weitere…' }}>
          <TableHeader>
            <Column isRowHeader>Stadt</Column>
          </TableHeader>
          <TableBody>
            <Row id="oslo">
              <Cell>Oslo</Cell>
            </Row>
            <TableLoadMore isLoading />
          </TableBody>
        </Table>
      </div>,
    );
    await expect.element(screen.getByText('Loading more…')).toBeVisible();
    await expect.element(screen.getByText('Lädt weitere…')).toBeVisible();
    expect(screen.container.querySelectorAll('[data-slot="table-load-more"]')).toHaveLength(2);
  });

  it('fades new rows in one after another unless motion is reduced', async () => {
    function Paged() {
      return (
        <Table aria-label="Indexed">
          <TableHeader>
            <Column isRowHeader>Folder</Column>
          </TableHeader>
          <TableBody items={folders}>
            {(folder) => (
              <Row id={folder.id} index={folders.indexOf(folder)}>
                <Cell>{folder.name}</Cell>
              </Row>
            )}
          </TableBody>
        </Table>
      );
    }
    const moving = await renderWithDS(<Paged />);
    const rows = bodyRows(moving.container) as HTMLElement[];
    expect(rows[0].className).toContain('starting:opacity-0');
    expect(rows[2].style.getPropertyValue('--table-row-index')).toBe('2');
    expect(getComputedStyle(rows[2]).transitionDelay).toBe('0s, 0.048s');
    await moving.unmount();

    const still = await renderWithDS(<Paged />, { provider: { motion: 'reduced' } });
    for (const row of bodyRows(still.container)) {
      expect(row.className).not.toContain('starting:opacity-0');
    }
  });

  it('turns the sort chevron without a transition when motion is reduced', async () => {
    const moving = await renderWithDS(<Folders sortable />);
    const indicator = moving.container.querySelector('[data-slot="table-sort-indicator"]')!;
    expect(getComputedStyle(indicator).transitionDuration).not.toBe('0s');
    await moving.unmount();
    const still = await renderWithDS(<Folders sortable />, { provider: { motion: 'reduced' } });
    const instant = still.container.querySelector('[data-slot="table-sort-indicator"]')!;
    expect(getComputedStyle(instant).transitionProperty).toBe('none');
  });
});

describe('Table accessibility', () => {
  beforeEach(async () => {
    await page.viewport(1024, 768);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 bg-surface-raised p-4">
          <Folders
            sortable
            selectionMode="multiple"
            defaultSelectedKeys={['photos']}
            stickyRowHeader
          />
          <Folders aria-label="Compact folders" density="sm" />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
