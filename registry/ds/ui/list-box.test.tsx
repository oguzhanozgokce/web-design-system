import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { FolderIcon, InboxIcon, PersonIcon } from '@/registry/ds/lib/icons';
import {
  ListBox,
  ListBoxItem,
  ListBoxSection,
  ListBoxStatus,
  listBoxStyles,
} from '@/registry/ds/ui/list-box';

const ledgers = [
  { id: 'household', name: 'Household', description: '4 members · TRY' },
  { id: 'trip', name: 'Trip to Lisbon', description: '6 members · EUR' },
  { id: 'office', name: 'Office lunches', description: '12 members · TRY' },
];

function Initials({ children }: { children: string }) {
  return (
    <span className="flex items-center justify-center rounded-full bg-tertiary-container text-label-md text-on-tertiary-container">
      {children}
    </span>
  );
}

function Members(props: { density?: 'sm' | 'md' }) {
  return (
    <ListBox aria-label="Assign to" selectionMode="single" variant="outlined" {...props}>
      <ListBoxSection title="Finance">
        <ListBoxItem
          id="ayse"
          textValue="Ayşe Demir"
          avatar={<Initials>AD</Initials>}
          description="Owner"
        >
          Ayşe Demir
        </ListBoxItem>
        <ListBoxItem id="mehmet" avatar={<Initials>MK</Initials>} description="Accountant">
          Mehmet Kaya
        </ListBoxItem>
      </ListBoxSection>
      <ListBoxSection title="Guests">
        <ListBoxItem id="elif" startIcon={<PersonIcon />} description="Invite pending" isDisabled>
          Elif Şahin
        </ListBoxItem>
      </ListBoxSection>
    </ListBox>
  );
}

describe('ListBox', () => {
  it('names options from their label and description and groups sections', async () => {
    const screen = await renderWithDS(<Members />);
    const listbox = screen.getByRole('listbox', { name: 'Assign to' });
    await expect.element(listbox).toHaveAttribute('data-density', 'md');
    const option = screen.getByRole('option', { name: /^Ayşe Demir/ });
    await expect.element(option).toHaveAccessibleName('Ayşe Demir Owner');
    await expect.element(screen.getByRole('group', { name: 'Finance' })).toBeInTheDocument();
    await expect.element(screen.getByRole('group', { name: 'Guests' })).toBeInTheDocument();
    expect(option.element().querySelector('[data-slot="avatar"]')).not.toBeNull();
    expect(
      screen
        .getByRole('option', { name: /^Elif Şahin/ })
        .element()
        .querySelector('[data-slot="start-icon"]'),
    ).not.toBeNull();
  });

  it('selects with the pointer and keyboard and shows a check mark', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <ListBox aria-label="Ledger" selectionMode="single" onSelectionChange={onSelectionChange}>
        {ledgers.map((ledger) => (
          <ListBoxItem key={ledger.id} id={ledger.id} description={ledger.description}>
            {ledger.name}
          </ListBoxItem>
        ))}
      </ListBox>,
    );
    const household = screen.getByRole('option', { name: /^Household/ });
    await household.click();
    await expect.element(household).toHaveAttribute('aria-selected', 'true');
    expect(household.element().querySelector('[data-slot="check"] svg')).not.toBeNull();
    expect([...(onSelectionChange.mock.lastCall?.[0] as Set<string>)]).toEqual(['household']);

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    const trip = screen.getByRole('option', { name: /^Trip to Lisbon/ });
    await expect.element(trip).toHaveAttribute('aria-selected', 'true');
    await expect.element(household).toHaveAttribute('aria-selected', 'false');
    expect(household.element().querySelector('[data-slot="check"] svg')).toBeNull();
  });

  it('rings the focused row for keyboard focus but not after a click', async () => {
    const screen = await renderWithDS(
      <ListBox aria-label="Ledger" selectionMode="single">
        {ledgers.map((ledger) => (
          <ListBoxItem key={ledger.id} id={ledger.id}>
            {ledger.name}
          </ListBoxItem>
        ))}
      </ListBox>,
    );
    const household = screen.getByRole('option', { name: 'Household' });
    await household.click();
    await expect.element(household).toHaveFocus();
    expect(getComputedStyle(household.element()).outlineStyle).toBe('none');

    await userEvent.keyboard('{ArrowDown}');
    const trip = screen.getByRole('option', { name: 'Trip to Lisbon' });
    await expect.element(trip).toHaveFocus();
    await expect.element(trip).toHaveAttribute('data-focus-visible', 'true');
    const ring = getComputedStyle(trip.element());
    expect(ring.outlineStyle).toBe('solid');
    expect(ring.outlineWidth).toBe('3px');
    expect(ring.outlineOffset).toBe('-3px');
  });

  it('supports controlled multiple selection from dynamic items', async () => {
    function Example() {
      const [selected, setSelected] = useState<Selection>(new Set(['trip']));
      return (
        <>
          <ListBox
            aria-label="Ledgers"
            items={ledgers}
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={setSelected}
          >
            {(ledger) => <ListBoxItem description={ledger.description}>{ledger.name}</ListBoxItem>}
          </ListBox>
          <output>{selected === 'all' ? 'all' : [...selected].join(',')}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    await expect
      .element(screen.getByRole('listbox'))
      .toHaveAttribute('aria-multiselectable', 'true');
    await screen.getByRole('option', { name: /^Office lunches/ }).click();
    await expect.element(screen.getByText('trip,office')).toBeInTheDocument();
    await screen.getByRole('option', { name: /^Trip to Lisbon/ }).click();
    await expect.element(screen.getByText(/^office$/)).toBeInTheDocument();
  });

  it('skips disabled items', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(
      <ListBox aria-label="Ledger" onAction={onAction}>
        <ListBoxItem id="household">Household</ListBoxItem>
        <ListBoxItem id="archived" isDisabled>
          Archived 2023
        </ListBoxItem>
        <ListBoxItem id="trip">Trip to Lisbon</ListBoxItem>
      </ListBox>,
    );
    const archived = screen.getByRole('option', { name: 'Archived 2023' });
    await expect.element(archived).toHaveAttribute('aria-disabled', 'true');
    await archived.click({ force: true });
    expect(onAction).not.toHaveBeenCalled();

    await screen.getByRole('option', { name: /^Household/ }).click();
    expect(onAction).toHaveBeenLastCalledWith('household');
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('option', { name: /^Trip to Lisbon/ })).toHaveFocus();
  });

  it('renders a default empty state, a custom one and a loading state', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <ListBox aria-label="Default" items={[] as typeof ledgers}>
          {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
        </ListBox>
        <ListBox
          aria-label="Custom"
          items={[] as typeof ledgers}
          renderEmptyState={() => (
            <ListBoxStatus icon={<InboxIcon />}>No archived ledgers yet</ListBoxStatus>
          )}
        >
          {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
        </ListBox>
        <ListBox aria-label="Loading" items={[] as typeof ledgers} isLoading>
          {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
        </ListBox>
      </div>,
    );
    await expect
      .element(screen.getByRole('listbox', { name: 'Default' }))
      .toHaveAttribute('data-empty', 'true');
    await expect.element(screen.getByText('No items')).toBeVisible();
    await expect.element(screen.getByText('No archived ledgers yet')).toBeVisible();
    await expect.element(screen.getByText('Loading…')).toBeVisible();
    expect(screen.container.querySelectorAll('[data-slot="spinner"]')).toHaveLength(1);
  });

  it('shows a load-more row after the items while loading', async () => {
    const onLoadMore = vi.fn();
    const screen = await renderWithDS(
      <ListBox aria-label="Ledgers" items={ledgers} isLoading onLoadMore={onLoadMore}>
        {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
      </ListBox>,
    );
    await expect.element(screen.getByRole('option', { name: /^Household/ })).toBeVisible();
    const loader = screen.container.querySelector('[data-slot="list-box-loader"]');
    expect(loader).not.toBeNull();
    expect(loader?.textContent).toContain('Loading…');
  });

  it('asks for more items once the end of the list is visible', async () => {
    const onLoadMore = vi.fn();
    const screen = await renderWithDS(
      <ListBox aria-label="Ledgers" items={ledgers} onLoadMore={onLoadMore}>
        {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
      </ListBox>,
    );
    await expect.element(screen.getByRole('option', { name: /^Household/ })).toBeVisible();
    await expect.poll(() => onLoadMore.mock.calls.length).toBeGreaterThan(0);
    expect(screen.container.textContent).not.toContain('Loading…');
  });

  it('reads the text value from text children so typeahead finds the row', async () => {
    const pageNumber = 2;
    const screen = await renderWithDS(
      <ListBox aria-label="Report pages" selectionMode="single">
        <ListBoxItem id="summary">Summary</ListBoxItem>
        <ListBoxItem id="page-2">Page {pageNumber}</ListBoxItem>
      </ListBox>,
    );
    await screen.getByRole('option', { name: 'Summary' }).click();
    await userEvent.keyboard('p');
    await expect.element(screen.getByRole('option', { name: 'Page 2' })).toHaveFocus();
  });

  it('greys out a row that is both selected and disabled', async () => {
    const screen = await renderWithDS(
      <ListBox aria-label="Plan" selectionMode="multiple" defaultSelectedKeys={['team', 'legacy']}>
        <ListBoxItem id="team">Team</ListBoxItem>
        <ListBoxItem id="legacy" isDisabled>
          Legacy
        </ListBoxItem>
      </ListBox>,
    );
    const legacy = screen.getByRole('option', { name: 'Legacy' }).element();
    const team = screen.getByRole('option', { name: 'Team' }).element();
    expect(legacy).toHaveAttribute('data-selected', 'true');
    expect(team).toHaveAttribute('data-selected', 'true');
    expect(getComputedStyle(legacy).backgroundColor).not.toBe(
      getComputedStyle(team).backgroundColor,
    );
    expect(getComputedStyle(legacy).color).not.toBe(getComputedStyle(team).color);
  });

  it('applies density', async () => {
    const screen = await renderWithDS(<Members density="sm" />);
    await expect
      .element(screen.getByRole('listbox', { name: 'Assign to' }))
      .toHaveAttribute('data-density', 'sm');
    expect(listBoxStyles({ density: 'sm' }).root()).toContain('[--list-box-item-height:2rem]');
  });

  it('takes the empty and loading text from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <ListBox aria-label="Ledgers" items={[] as typeof ledgers}>
          {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
        </ListBox>
        <ListBox
          aria-label="Archived ledgers"
          items={[] as typeof ledgers}
          labels={{ empty: 'Nothing archived yet' }}
        >
          {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
        </ListBox>
        <ListBox aria-label="Shared ledgers" items={ledgers} isLoading onLoadMore={() => {}}>
          {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
        </ListBox>
        <ListBox
          aria-label="Team ledgers"
          items={ledgers}
          isLoading
          onLoadMore={() => {}}
          labels={{ loading: 'Fetching ledgers…' }}
        >
          {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
        </ListBox>
      </div>,
      { provider: { labels: { listBox: { empty: 'No ledgers', loading: 'Loading ledgers…' } } } },
    );
    await expect.element(screen.getByText('No ledgers')).toBeVisible();
    await expect.element(screen.getByText('Nothing archived yet')).toBeVisible();
    const [shared, team] = screen.container.querySelectorAll('[data-slot="list-box-loader"]');
    expect(shared?.textContent).toBe('Loading ledgers…');
    expect(team?.textContent).toBe('Fetching ledgers…');
    expect(screen.container.textContent).not.toContain('No items');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <Members />
          <ListBox aria-label="Folders" selectionMode="multiple" defaultSelectedKeys={['inbox']}>
            <ListBoxItem id="inbox" startIcon={<InboxIcon />}>
              Inbox
            </ListBoxItem>
            <ListBoxItem id="receipts" startIcon={<FolderIcon />} description="128 files">
              Receipts
            </ListBoxItem>
          </ListBox>
        </div>,
        options,
      );
      await screen.getByRole('option', { name: /^Mehmet Kaya/ }).click();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
