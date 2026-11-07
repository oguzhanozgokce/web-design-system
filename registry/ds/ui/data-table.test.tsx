import { useState } from 'react';
import type { Key, Selection, SortDescriptor } from 'react-aria-components';
import { page, userEvent, type Locator } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import {
  compareValues,
  getPageCount,
  matchesFilterValue,
  mergePageSelection,
  paginateRows,
  scopeSelection,
  searchRows,
  sortRows,
  textOf,
} from '@/registry/ds/lib/data-table';
import { ArchiveIcon, CopyIcon, DeleteIcon, EditIcon } from '@/registry/ds/lib/icons';
import {
  DataTable,
  StatusSelect,
  type DataTableColumn,
  type DataTableProps,
} from '@/registry/ds/ui/data-table';
import { StatusTagProvider } from '@/registry/ds/ui/status-tag';

interface App {
  id: string;
  name: string;
  platforms: string[];
  version: string;
  status: string;
  downloads: number;
  updated: string;
}

const names = [
  'Photos',
  'Notes',
  'Weather',
  'Music',
  'Calendar',
  'Maps',
  'Mail',
  'Clock',
  'Files',
  'Books',
  'Fitness',
  'Translate',
];
const statuses = ['live', 'inReview', 'rejected', 'draft', 'paused', 'scheduled', 'beta'];
const platformSets = [['iOS', 'Android', 'Web', 'macOS'], ['iOS'], ['Android', 'Web']];

const apps: App[] = names.map((name, index) => ({
  id: name.toLowerCase(),
  name,
  platforms: platformSets[index % platformSets.length],
  version: `${1 + (index % 3)}.${index}.0`,
  status: statuses[index % statuses.length],
  downloads: (index + 1) * 1250 + (index % 4) * 333,
  updated: `2026-${String(1 + (index % 9)).padStart(2, '0')}-${String(10 + index).padStart(2, '0')}`,
}));

const columns: DataTableColumn<App>[] = [
  { id: 'name', header: 'App', isRowHeader: true, allowsSorting: true },
  { id: 'platforms', header: 'Platforms', type: 'tags', maxVisibleTags: 2 },
  { id: 'version', header: 'Version', chip: true },
  {
    id: 'status',
    header: 'Status',
    type: 'status',
    allowsSorting: true,
    statuses: { beta: { tone: 'primary', dot: true, label: 'Beta' } },
  },
  { id: 'downloads', header: 'Downloads', type: 'number', allowsSorting: true },
  {
    id: 'updated',
    header: 'Updated',
    type: 'date',
    allowsSorting: true,
    formatOptions: { dateStyle: 'medium', timeZone: 'UTC' },
  },
];

function Apps(props: Partial<DataTableProps<App>>) {
  return (
    <DataTable
      aria-label="Apps"
      data={apps}
      columns={columns}
      getRowId={(app) => app.id}
      pageSize={5}
      labels={{ resultCount: '{count} apps' }}
      {...props}
    />
  );
}

function rowNames(container: Element) {
  const grid = container.querySelector('[role="grid"]')!;
  return [...grid.querySelectorAll('tbody [role="rowheader"]')].map((cell) => cell.textContent);
}

function spoken(element: Element | null) {
  const copy = element!.cloneNode(true) as Element;
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  return copy.textContent;
}

async function toggle(checkbox: Locator) {
  const target = checkbox
    .element()
    .closest('[data-slot="checkbox"]')!
    .querySelector('[data-slot="target"]')!;
  await userEvent.click(target);
}

async function choose(trigger: Locator, option: string) {
  await trigger.click();
  await page.getByRole('option', { name: option }).click();
}

describe('data table helpers', () => {
  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

  it('compares numbers, dates, text and empty values', () => {
    expect(compareValues(2, 10, collator)).toBeLessThan(0);
    expect(compareValues('Item 2', 'Item 10', collator)).toBeLessThan(0);
    expect(compareValues(new Date(2026, 0, 2), new Date(2026, 0, 1), collator)).toBeGreaterThan(0);
    expect(compareValues(null, 'a', collator)).toBeGreaterThan(0);
    expect(compareValues('a', '', collator)).toBeLessThan(0);
    expect(compareValues('Écran', 'ecran', collator)).toBe(0);
  });

  it('sorts stably in both directions', () => {
    const rows = [
      { id: 'a', group: 1 },
      { id: 'b', group: 2 },
      { id: 'c', group: 1 },
    ];
    const byGroup = (left: (typeof rows)[number], right: (typeof rows)[number]) =>
      left.group - right.group;
    expect(sortRows(rows, byGroup, 'ascending').map((row) => row.id)).toEqual(['a', 'c', 'b']);
    expect(sortRows(rows, byGroup, 'descending').map((row) => row.id)).toEqual(['b', 'a', 'c']);
  });

  it('searches every term, ignoring case and accents', () => {
    const rows = ['Café Menu', 'Weather Lite', 'Music Pro'];
    expect(searchRows(rows, 'cafe', (row) => row)).toEqual(['Café Menu']);
    expect(searchRows(rows, 'lite weather', (row) => row)).toEqual(['Weather Lite']);
    expect(searchRows(rows, '  ', (row) => row)).toEqual(rows);
  });

  it('matches filter values in lists and objects', () => {
    expect(matchesFilterValue(['iOS', 'Web'], 'Web')).toBe(true);
    expect(matchesFilterValue([{ id: 'ios', label: 'iOS' }], 'ios')).toBe(true);
    expect(matchesFilterValue('live', 'draft')).toBe(false);
    expect(textOf({ label: 'Beta' })).toBe('Beta');
  });

  it('pages and keeps selection from other pages', () => {
    expect(getPageCount(12, 5)).toBe(3);
    expect(getPageCount(0, 5)).toBe(1);
    expect(paginateRows([1, 2, 3, 4, 5, 6], 2, 4)).toEqual([5, 6]);
    expect([...mergePageSelection(new Set(['a', 'd']), new Set(['b']), ['a', 'b', 'c'])]).toEqual([
      'd',
      'b',
    ]);
    expect([...mergePageSelection(new Set(['d']), 'all', ['a', 'b'])]).toEqual(['d', 'a', 'b']);
    expect([...(scopeSelection(new Set(['a', 'z']), ['a', 'b']) as Set<Key>)]).toEqual(['a']);
  });
});

describe('DataTable', () => {
  beforeEach(async () => {
    await page.viewport(1280, 900);
  });

  it('shows the result count, a tinted header and formatted cells', async () => {
    const screen = await renderWithDS(<Apps />);
    await expect.element(screen.getByRole('grid', { name: 'Apps' })).toBeVisible();
    await expect.element(screen.getByText('Total results')).toBeVisible();
    const total = screen.container.querySelector('[data-slot="data-table-total"]')!;
    expect(spoken(total)).toBe('12 apps');
    expect(total.querySelector('[data-slot="rolling-number"]')).not.toBeNull();
    expect(rowNames(screen.container)).toEqual(['Photos', 'Notes', 'Weather', 'Music', 'Calendar']);
    const row = screen.getByRole('row', { name: /Photos/ });
    await expect.element(row.getByText('1,250')).toBeVisible();
    await expect.element(row.getByText('Jan 10, 2026')).toBeVisible();
    expect(row.element().querySelector('time')!.getAttribute('dateTime')).toBe(
      '2026-01-10T00:00:00.000Z',
    );
    await expect.element(row.getByText('Live')).toBeVisible();
    expect(row.element().querySelector('[data-slot="data-table-chip"]')!.textContent).toBe('1.0.0');
    const downloads = screen.getByRole('columnheader', { name: 'Downloads' }).element();
    expect(downloads.getAttribute('data-align')).toBe('end');
  });

  it('sorts in the client and reports aria-sort', async () => {
    const onSortChange = vi.fn();
    const screen = await renderWithDS(<Apps onSortChange={onSortChange} />);
    const header = screen.getByRole('columnheader', { name: 'Downloads' });
    await header.click();
    await expect.element(header).toHaveAttribute('aria-sort', 'ascending');
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'downloads', direction: 'ascending' });
    expect(rowNames(screen.container)).toEqual(['Photos', 'Notes', 'Weather', 'Music', 'Calendar']);
    await header.click();
    await expect.element(header).toHaveAttribute('aria-sort', 'descending');
    expect(rowNames(screen.container)).toEqual(['Translate', 'Fitness', 'Books', 'Files', 'Clock']);

    const name = screen.getByRole('columnheader', { name: 'App' });
    name.element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(name).toHaveAttribute('aria-sort', 'ascending');
    expect(rowNames(screen.container)).toEqual(['Books', 'Calendar', 'Clock', 'Files', 'Fitness']);
  });

  it('sorts statuses by their label', async () => {
    const screen = await renderWithDS(<Apps paging={false} />);
    await screen.getByRole('columnheader', { name: 'Status' }).click();
    const labels = [
      ...screen.container.querySelectorAll('tbody [data-slot="tag"][data-status]'),
    ].map((tag) => tag.textContent);
    expect(labels).toEqual([...labels].sort((a, b) => a!.localeCompare(b!)));
    expect(labels[0]).toBe('Beta');
  });

  it('searches every column, resets to the first page and announces the count', async () => {
    const screen = await renderWithDS(<Apps defaultPage={2} />);
    const status = screen.container.querySelector('[role="status"]')!;
    expect(status.textContent).toBe('');
    await screen.getByRole('searchbox', { name: 'Search' }).fill('in review');
    await expect.poll(() => rowNames(screen.container)).toEqual(['Notes', 'Files']);
    expect(screen.container.querySelector('[data-slot="data-table-footer"]')).toBeNull();
    await expect.poll(() => status.textContent, { timeout: 2000 }).toBe('2 apps');
    await screen.getByRole('searchbox', { name: 'Search' }).fill('macos');
    await expect
      .poll(() => rowNames(screen.container))
      .toEqual(['Photos', 'Music', 'Mail', 'Books']);
  });

  it('filters with selects and clears back to everything', async () => {
    const onFilterChange = vi.fn();
    const screen = await renderWithDS(
      <Apps
        onFilterChange={onFilterChange}
        filters={[
          {
            id: 'platforms',
            label: 'Platform',
            allLabel: 'All platforms',
            options: ['iOS', 'Android', 'Web'].map((id) => ({ id, label: id })),
          },
          {
            id: 'status',
            label: 'Status',
            options: [
              { id: 'live', label: 'Live' },
              { id: 'beta', label: 'Beta' },
            ],
          },
        ]}
      />,
    );
    const platform = screen.getByRole('button', { name: /Platform/ });
    await expect.element(platform).toHaveTextContent('All platforms');
    await choose(platform, 'Android');
    expect(onFilterChange).toHaveBeenLastCalledWith({ platforms: 'Android' });
    expect(spoken(screen.container.querySelector('[data-slot="data-table-total"]'))).toBe('8 apps');
    await choose(screen.getByRole('button', { name: /Status/ }), 'Beta');
    expect(rowNames(screen.container)).toEqual(['Mail']);
    await choose(platform, 'All platforms');
    expect(onFilterChange).toHaveBeenLastCalledWith({ platforms: null, status: 'beta' });
    expect(rowNames(screen.container)).toEqual(['Mail']);
  });

  it('tells apart no results from no data, and clears the query', async () => {
    const screen = await renderWithDS(
      <div>
        <Apps />
        <Apps aria-label="Nothing" data={[]} labels={{ emptyTitle: 'No apps yet' }} />
      </div>,
    );
    await expect.element(screen.getByRole('heading', { name: 'No apps yet' })).toBeVisible();
    const search = screen.getByRole('searchbox', { name: 'Search' }).first();
    await search.fill('zzz');
    await expect.element(screen.getByRole('heading', { name: 'No results' })).toBeVisible();
    await screen.getByRole('button', { name: 'Clear filters' }).click();
    await expect.poll(() => rowNames(screen.container).length).toBe(5);
    await expect.element(search).toHaveValue('');
    await expect.element(search).toHaveFocus();
  });

  it('accepts custom empty and no-results states', async () => {
    const screen = await renderWithDS(
      <div>
        <Apps aria-label="Empty" data={[]} emptyState={<p>Add your first app</p>} />
        <Apps
          aria-label="Searched"
          defaultSearchValue="zzz"
          noResultsState={<p>Nothing matches zzz</p>}
        />
      </div>,
    );
    await expect.element(screen.getByText('Add your first app')).toBeVisible();
    await expect.element(screen.getByText('Nothing matches zzz')).toBeVisible();
  });

  it('pages through rows', async () => {
    const onPageChange = vi.fn();
    const screen = await renderWithDS(<Apps onPageChange={onPageChange} />);
    const nav = screen.getByRole('navigation', { name: 'Pages of Apps' });
    await nav.getByRole('button', { name: 'Page 3' }).click();
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    expect(rowNames(screen.container)).toEqual(['Fitness', 'Translate']);
    await nav.getByRole('button', { name: 'Previous page' }).click();
    expect(rowNames(screen.container)).toEqual(['Maps', 'Mail', 'Clock', 'Files', 'Books']);
  });

  it('shows skeleton rows while loading', async () => {
    const screen = await renderWithDS(
      <Apps isLoading rowActions={[{ id: 'edit', label: 'Edit', onAction: () => {} }]} />,
    );
    const grid = screen.getByRole('grid', { name: 'Apps' });
    await expect.element(grid).toHaveAttribute('aria-busy', 'true');
    const rows = screen.container.querySelectorAll('tbody [role="row"]');
    expect(rows).toHaveLength(5);
    expect(rows[0].querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(5);
    expect(screen.container.querySelector('[role="status"]')!.textContent).toBe('Loading');
    expect(screen.getByRole('button', { name: 'Page 2' }).element()).toBeDisabled();
  });

  it('shapes skeletons after the columns and holds the count until data arrives', async () => {
    const screen = await renderWithDS(
      <DataTable
        aria-label="Apps"
        data={[]}
        isLoading
        getRowId={(app: App) => app.id}
        pageSize={2}
        columns={[
          { id: 'name', header: 'App', isRowHeader: true, cell: (app) => app.name },
          { id: 'version', header: 'Version' },
          { id: 'status', header: 'Status', type: 'status' },
          { id: 'downloads', header: 'Downloads', type: 'number', skeleton: 'pill' },
        ]}
      />,
    );
    const cells = [
      ...screen.container.querySelectorAll('tbody tr:first-child td, tbody tr:first-child th'),
    ];
    const shapes = cells.map((cell) =>
      [...cell.querySelectorAll('[data-slot="skeleton"]')]
        .map((item) => item.getAttribute('data-shape'))
        .join(','),
    );
    expect(shapes).toEqual(['circle,block', 'block', 'block', 'block']);
    expect(cells[2].querySelector('[data-slot="skeleton"]')!.className).toContain(
      'rounded-control',
    );
    expect(cells[3].querySelector('[data-slot="skeleton"]')!.className).toContain(
      'rounded-control',
    );
    expect(cells[0].textContent).toBe('Loading');
    expect(screen.container.querySelector('[data-slot="data-table-total"]')).toBeNull();
    expect(
      screen.container.querySelector('[data-slot="data-table-summary"] [data-slot="skeleton"]'),
    ).not.toBeNull();
  });

  it('shows an error with a retry button', async () => {
    const onRetry = vi.fn();
    const screen = await renderWithDS(
      <Apps error={new Error('Offline')} onRetry={onRetry} labels={{ retry: 'Reload' }} />,
    );
    await expect
      .element(screen.getByRole('heading', { name: 'Something went wrong' }))
      .toBeVisible();
    await screen.getByRole('button', { name: 'Reload' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.container.querySelector('[data-slot="data-table-footer"]')).toBeNull();
  });

  it('selects across pages, shows a selection bar and runs bulk actions', async () => {
    const onArchive = vi.fn();
    function Selectable() {
      const [selected, setSelected] = useState<Selection>(new Set(['photos']));
      return (
        <div>
          <Apps
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={setSelected}
            selectionActions={[
              { id: 'archive', label: 'Archive', icon: <ArchiveIcon />, onAction: onArchive },
            ]}
          />
          <output data-testid="keys">
            {selected === 'all' ? 'all' : [...selected].sort().join(',')}
          </output>
        </div>
      );
    }
    const screen = await renderWithDS(<Selectable />);
    const bar = () => screen.container.querySelector('[data-slot="data-table-selection-bar"]');
    expect(spoken(bar())).toContain('1 selected');
    await expect
      .element(screen.getByRole('row', { name: /Photos/ }))
      .toHaveAttribute('aria-selected', 'true');
    const selectAll = screen.getByRole('checkbox', { name: 'Select All' });
    await expect.element(selectAll).toBePartiallyChecked();
    await screen.getByRole('button', { name: 'Page 2' }).click();
    await toggle(screen.getByRole('checkbox', { name: 'Select Maps' }));
    await expect.element(screen.getByTestId('keys')).toHaveTextContent('maps,photos');
    await toggle(screen.getByRole('checkbox', { name: 'Select All' }));
    await expect
      .element(screen.getByTestId('keys'))
      .toHaveTextContent('books,clock,files,mail,maps,photos');
    expect(spoken(bar())).toContain('6 selected');
    await screen.getByRole('button', { name: 'Archive' }).click();
    expect([...onArchive.mock.calls[0][0]].sort()).toEqual([
      'books',
      'clock',
      'files',
      'mail',
      'maps',
      'photos',
    ]);
    await expect.element(screen.getByTestId('keys')).toBeEmptyDOMElement();
    expect(bar()).toBeNull();
    await expect.element(screen.getByText('Total results')).toBeVisible();
  });

  it('clears the selection and returns focus to the table', async () => {
    const screen = await renderWithDS(
      <Apps selectionMode="multiple" defaultSelectedKeys={new Set(['notes'])} />,
    );
    const clear = screen.getByRole('button', { name: 'Clear selection' });
    await clear.click();
    expect(screen.container.querySelector('[data-slot="data-table-selection-bar"]')).toBeNull();
    await expect
      .poll(() => screen.getByRole('grid').element().contains(document.activeElement))
      .toBe(true);
  });

  it('runs inline and menu row actions named after the row', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    let finish = () => {};
    const onDuplicate = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(
      <Apps
        rowActions={(app) => [
          { id: 'edit', label: 'Edit', icon: <EditIcon />, onAction: onEdit },
          { id: 'copy', label: 'Duplicate', icon: <CopyIcon />, onAction: onDuplicate },
          {
            id: 'delete',
            label: 'Delete',
            icon: <DeleteIcon />,
            tone: 'error',
            isDisabled: app.id === 'notes',
            onAction: onDelete,
          },
        ]}
        inlineActionCount={1}
      />,
    );
    await screen.getByRole('button', { name: 'Edit Photos' }).click();
    expect(onEdit).toHaveBeenCalledWith(apps[0]);
    const more = screen.getByRole('button', { name: 'More actions for Photos' });
    await expect.element(more).toBeVisible();
    await more.click();
    const menu = page.getByRole('menu');
    await expect
      .element(menu.getByRole('menuitem', { name: 'Delete' }))
      .toHaveAttribute('data-tone', 'error');
    await menu.getByRole('menuitem', { name: 'Duplicate' }).click();
    expect(onDuplicate).toHaveBeenCalledWith(apps[0]);
    await expect.element(more).toHaveAttribute('aria-disabled', 'true');
    finish();
    await expect.element(more).not.toHaveAttribute('aria-disabled');

    await screen.getByRole('button', { name: 'More actions for Notes' }).click();
    await expect
      .element(page.getByRole('menuitem', { name: 'Delete' }))
      .toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{Escape}');
    const header = screen.getByRole('columnheader', { name: 'Actions' }).element();
    expect(getComputedStyle(header.querySelector('.sr-only')!).position).toBe('absolute');
  });

  it('shows tooltips on the icon actions', async () => {
    const screen = await renderWithDS(
      <Apps rowActions={[{ id: 'edit', label: 'Edit', icon: <EditIcon />, onAction: () => {} }]} />,
    );
    screen.getByRole('button', { name: 'Edit Photos' }).element().focus();
    await userEvent.keyboard('{Shift}');
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Edit');
  });

  it('lists extra tags behind a counted button', async () => {
    const screen = await renderWithDS(<Apps />);
    const row = screen.getByRole('row', { name: /Photos/ });
    await expect.element(row.getByText('iOS')).toBeVisible();
    await expect.element(row.getByText('Android')).toBeVisible();
    const more = row.getByRole('button', { name: '2 more: Web, macOS' });
    await expect.element(more).toHaveTextContent('+2');
    more.element().focus();
    await userEvent.keyboard('{Shift}');
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Web, macOS');
  });

  it('edits a status in place with a select that shows the dot', async () => {
    function Editable() {
      const [rows, setRows] = useState(apps.slice(0, 3));
      return (
        <DataTable
          aria-label="Releases"
          data={rows}
          getRowId={(app) => app.id}
          showSearch={false}
          paging={false}
          columns={[
            { id: 'name', header: 'App' },
            {
              id: 'status',
              header: 'Status',
              type: 'status',
              statusOptions: ['live', 'paused', 'draft'],
              onStatusChange: (app, status) =>
                setRows((current) =>
                  current.map((item) => (item.id === app.id ? { ...item, status } : item)),
                ),
            },
          ]}
        />
      );
    }
    const screen = await renderWithDS(<Editable />);
    const select = screen.getByRole('button', { name: /Status for Photos/ });
    await expect.element(select).toHaveTextContent('Live');
    await choose(select, 'Paused');
    await expect.element(select).toHaveTextContent('Paused');
    const dot = select.element().querySelector('[data-slot="status-dot"]')!;
    expect(dot.getAttribute('data-tone')).toBe('warning');
  });

  it('uses statuses from the provider and the column', async () => {
    const screen = await renderWithDS(
      <StatusTagProvider statuses={{ live: { tone: 'info', label: 'Published' } }}>
        <Apps />
      </StatusTagProvider>,
    );
    const row = screen.getByRole('row', { name: /Photos/ });
    await expect.element(row.getByText('Published')).toBeVisible();
    const clock = await renderWithDS(<Apps defaultPage={2} />);
    await expect.element(clock.getByRole('row', { name: /Mail/ }).getByText('Beta')).toBeVisible();
  });

  it('hands every change to the caller in server mode', async () => {
    const onSortChange = vi.fn();
    const onPageChange = vi.fn();
    const onSearchChange = vi.fn();
    function Server() {
      const [sort, setSort] = useState<SortDescriptor | null>(null);
      const [current, setCurrent] = useState(1);
      return (
        <Apps
          processing="server"
          data={apps.slice(0, 5)}
          totalCount={42}
          sortDescriptor={sort}
          onSortChange={(next) => {
            onSortChange(next);
            setSort(next);
          }}
          page={current}
          onPageChange={(next) => {
            onPageChange(next);
            setCurrent(next);
          }}
          onSearchChange={onSearchChange}
        />
      );
    }
    const screen = await renderWithDS(<Server />);
    expect(spoken(screen.container.querySelector('[data-slot="data-table-total"]'))).toBe(
      '42 apps',
    );
    await screen.getByRole('columnheader', { name: 'Downloads' }).click();
    await screen.getByRole('columnheader', { name: 'Downloads' }).click();
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'downloads', direction: 'descending' });
    expect(rowNames(screen.container)).toEqual(['Photos', 'Notes', 'Weather', 'Music', 'Calendar']);
    await screen.getByRole('button', { name: 'Page 9' }).click();
    expect(onPageChange).toHaveBeenLastCalledWith(9);
    await screen.getByRole('searchbox', { name: 'Search' }).fill('zzz');
    expect(onSearchChange).toHaveBeenLastCalledWith('zzz');
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    expect(rowNames(screen.container)).toHaveLength(5);
  });

  it('takes its labels from props and the provider', async () => {
    const screen = await renderWithDS(
      <Apps
        selectionMode="multiple"
        defaultSelectedKeys={new Set(['photos'])}
        rowActions={[{ id: 'edit', label: 'Bearbeiten', onAction: () => {} }]}
        labels={{ rowAction: '{row}: {action}', selectedCount: '{count} ausgewählt' }}
      />,
      {
        provider: {
          labels: { dataTable: { search: 'Suchen', clearSelection: 'Auswahl aufheben' } },
        },
      },
    );
    await expect.element(screen.getByRole('searchbox', { name: 'Suchen' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Auswahl aufheben' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Photos: Bearbeiten' })).toBeVisible();
    expect(spoken(screen.container.querySelector('[data-slot="data-table-selected-count"]'))).toBe(
      '1 ausgewählt',
    );
  });

  it('formats numbers and dates for the locale', async () => {
    const screen = await renderWithDS(<Apps />, { locale: 'de-DE' });
    const row = screen.getByRole('row', { name: /Notes/ });
    await expect.element(row.getByText('2.833')).toBeVisible();
    await expect.element(row.getByText('11.02.2026')).toBeVisible();
  });

  it('shrinks rows and controls in the compact density', async () => {
    const screen = await renderWithDS(
      <div>
        <Apps
          aria-label="Normal"
          selectionMode="multiple"
          rowActions={[{ id: 'edit', label: 'Edit', onAction: () => {} }]}
        />
        <Apps
          aria-label="Compact"
          density="sm"
          selectionMode="multiple"
          rowActions={[{ id: 'edit', label: 'Edit', onAction: () => {} }]}
        />
      </div>,
    );
    const normal = screen.getByRole('grid', { name: 'Normal' }).element();
    const compact = screen.getByRole('grid', { name: 'Compact' }).element();
    expect(normal.querySelector('tbody tr')!.getBoundingClientRect().height).toBe(52);
    expect(compact.querySelector('tbody tr')!.getBoundingClientRect().height).toBe(40);
    const button = (grid: Element) =>
      grid.querySelector('[data-slot="data-table-actions"] button')!.getBoundingClientRect().width;
    expect(button(normal)).toBe(32);
    expect(button(compact)).toBe(28);
    const tag = (grid: Element) =>
      grid.querySelector('[data-slot="tag"]')!.getAttribute('data-size');
    expect(tag(normal)).toBe('md');
    expect(tag(compact)).toBe('sm');
  });

  it('stacks the toolbar and scrolls the table in a narrow container', async () => {
    await page.viewport(375, 800);
    const screen = await renderWithDS(
      <Apps
        selectionMode="multiple"
        defaultSelectedKeys={new Set(['photos'])}
        selectionActions={[
          { id: 'archive', label: 'Archive', icon: <ArchiveIcon />, onAction: () => {} },
        ]}
        filters={[
          {
            id: 'status',
            label: 'Status',
            options: [{ id: 'live', label: 'Live' }],
          },
        ]}
      />,
    );
    const root = screen.container.querySelector<HTMLElement>('[data-slot="data-table"]')!;
    expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 2);
    const container = root.querySelector<HTMLElement>('[data-slot="table-container"]')!;
    expect(container.scrollWidth).toBeGreaterThan(container.clientWidth);
    const search = screen.getByRole('searchbox').element().closest('[data-slot="search-field"]')!;
    expect(search.getBoundingClientRect().width).toBeGreaterThan(250);
    const archive = screen.getByRole('button', { name: 'Archive' }).element();
    expect(archive.getBoundingClientRect().width).toBe(32);
    const rowHeader = screen.getByRole('rowheader').first().element();
    expect(getComputedStyle(rowHeader).position).toBe('sticky');
    expect(
      screen.getByRole('button', { name: 'Previous page' }).element().getBoundingClientRect().width,
    ).toBe(32);
  });

  it('fades rows in on a new page unless motion is reduced', async () => {
    const moving = await renderWithDS(<Apps />);
    const first = moving.container.querySelector('tbody [role="row"]')!;
    expect(first.className).toContain('starting:opacity-0');
    await moving.unmount();
    const still = await renderWithDS(<Apps />, { provider: { motion: 'reduced' } });
    expect(still.container.querySelector('tbody [role="row"]')!.className).not.toContain(
      'starting:opacity-0',
    );
    const rolling = still.container.querySelector('[data-slot="rolling-number"]')!;
    expect(rolling.hasAttribute('data-animated')).toBe(false);
  });

  it('mirrors in right-to-left layouts', async () => {
    const screen = await renderWithDS(
      <Apps selectionMode="multiple" labels={{ resultCount: '{count} تطبيقات' }} />,
      { locale: 'ar' },
    );
    const grid = screen.getByRole('grid').element();
    const selection = grid.querySelector('thead th')!.getBoundingClientRect();
    const app = screen.getByRole('columnheader', { name: 'App' }).element().getBoundingClientRect();
    expect(selection.left).toBeGreaterThan(app.left);
    const rowHeader = screen.getByRole('rowheader').first().element();
    expect(getComputedStyle(rowHeader).right).not.toBe('auto');
    const total = screen.container.querySelector('[data-slot="data-table-total"]')!;
    expect(spoken(total)).toBe('12 تطبيقات');
  });

  it('keeps a standalone status select usable', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <StatusSelect
        label="Visibility"
        options={['public', 'unlisted']}
        statuses={{
          public: { tone: 'success', label: 'Public' },
          unlisted: { tone: 'warning', label: 'Unlisted' },
        }}
        defaultValue="public"
        onChange={onChange}
      />,
    );
    await choose(screen.getByRole('button', { name: /Visibility/ }), 'Unlisted');
    expect(onChange).toHaveBeenLastCalledWith('unlisted');
  });
});

describe('DataTable accessibility', () => {
  beforeEach(async () => {
    await page.viewport(1280, 900);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 bg-canvas p-4">
          <Apps
            selectionMode="multiple"
            defaultSelectedKeys={new Set(['photos'])}
            defaultSortDescriptor={{ column: 'downloads', direction: 'descending' }}
            filters={[
              {
                id: 'status',
                label: 'Status',
                options: [{ id: 'live', label: 'Live' }],
              },
            ]}
            selectionActions={[
              { id: 'archive', label: 'Archive', icon: <ArchiveIcon />, onAction: () => {} },
            ]}
            rowActions={[
              { id: 'edit', label: 'Edit', icon: <EditIcon />, onAction: () => {} },
              { id: 'copy', label: 'Duplicate', icon: <CopyIcon />, onAction: () => {} },
              { id: 'delete', label: 'Delete', tone: 'error', onAction: () => {} },
            ]}
          />
          <Apps aria-label="Loading apps" isLoading density="sm" variant="elevated" />
          <Apps aria-label="Broken apps" error="Offline" onRetry={() => {}} variant="transparent" />
          <Apps aria-label="No apps" data={[]} />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
