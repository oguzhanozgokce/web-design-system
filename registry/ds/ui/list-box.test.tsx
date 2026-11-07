import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { FolderIcon, InboxIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { ListBox, ListBoxItem, ListBoxSection, ListBoxStatus } from '@/registry/ds/ui/list-box';

const folders = [
  { id: 'photos', name: 'Photos', description: '248 items' },
  { id: 'projects', name: 'Projects', description: '12 items' },
  { id: 'team', name: 'Team space', description: '6 members' },
];

function Initials({ children }: { children: string }) {
  return (
    <span className="flex items-center justify-center rounded-full bg-neutral-soft text-xs font-medium text-on-surface">
      {children}
    </span>
  );
}

function Members(props: { density?: 'sm' | 'md' }) {
  return (
    <ListBox aria-label="Assign to" selectionMode="single" variant="outline" {...props}>
      <ListBoxSection title="Team">
        <ListBoxItem
          id="ayse"
          textValue="Ayşe Demir"
          avatar={<Initials>AD</Initials>}
          description="Owner"
        >
          Ayşe Demir
        </ListBoxItem>
        <ListBoxItem id="mehmet" avatar={<Initials>MK</Initials>} description="Editor">
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
    await expect.element(screen.getByRole('group', { name: 'Team' })).toBeInTheDocument();
    await expect.element(screen.getByRole('group', { name: 'Guests' })).toBeInTheDocument();
    expect(option.element().querySelector('[data-slot="avatar"]')).not.toBeNull();
    expect(
      screen
        .getByRole('option', { name: /^Elif Şahin/ })
        .element()
        .querySelector('[data-slot="start-icon"]'),
    ).not.toBeNull();
  });

  it('selects with the pointer and moves the primary check mark', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <>
        <span data-testid="primary" className="text-primary" />
        <ListBox aria-label="Folder" selectionMode="single" onSelectionChange={onSelectionChange}>
          {folders.map((folder) => (
            <ListBoxItem key={folder.id} id={folder.id} description={folder.description}>
              {folder.name}
            </ListBoxItem>
          ))}
        </ListBox>
      </>,
    );
    const photos = screen.getByRole('option', { name: /^Photos/ });
    await photos.click();
    await expect.element(photos).toHaveAttribute('aria-selected', 'true');
    const check = photos.element().querySelector('[data-slot="check"]')!;
    expect(check.querySelector('svg')).not.toBeNull();
    expect(getComputedStyle(check).color).toBe(
      getComputedStyle(screen.getByTestId('primary').element()).color,
    );
    expect([...(onSelectionChange.mock.lastCall?.[0] as Set<string>)]).toEqual(['photos']);

    const projects = screen.getByRole('option', { name: /^Projects/ });
    await projects.click();
    await expect.element(projects).toHaveAttribute('aria-selected', 'true');
    await expect.element(photos).toHaveAttribute('aria-selected', 'false');
    expect(photos.element().querySelector('[data-slot="check"] svg')).toBeNull();
  });

  it('tints the selected row only in the outline variant', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <span data-testid="soft" className="bg-primary-soft" />
        <ListBox aria-label="Plain" selectionMode="single" defaultSelectedKeys={['photos']}>
          <ListBoxItem id="photos">Photos</ListBoxItem>
        </ListBox>
        <ListBox
          aria-label="Outline"
          selectionMode="single"
          defaultSelectedKeys={['projects']}
          variant="outline"
        >
          <ListBoxItem id="projects">Projects</ListBoxItem>
        </ListBox>
      </div>,
    );
    await expect
      .element(screen.getByRole('listbox', { name: 'Outline' }))
      .toHaveAttribute('data-variant', 'outline');
    await expect
      .element(screen.getByRole('listbox', { name: 'Plain' }))
      .toHaveAttribute('data-variant', 'plain');
    const soft = getComputedStyle(screen.getByTestId('soft').element()).backgroundColor;
    const plainRow = screen.getByRole('option', { name: 'Photos' }).element();
    const outlineRow = screen.getByRole('option', { name: 'Projects' }).element();
    expect(getComputedStyle(plainRow).backgroundColor).not.toBe(soft);
    expect(getComputedStyle(outlineRow).backgroundColor).toBe(soft);
  });

  it('renders a default empty state, a custom one, a loading state and a load-more row', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <ListBox aria-label="Default" items={[] as typeof folders}>
          {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
        </ListBox>
        <ListBox
          aria-label="Custom"
          items={[] as typeof folders}
          renderEmptyState={() => (
            <ListBoxStatus icon={<InboxIcon />}>No archived folders yet</ListBoxStatus>
          )}
        >
          {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
        </ListBox>
        <ListBox aria-label="Loading" items={[] as typeof folders} isLoading>
          {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
        </ListBox>
        <ListBox aria-label="More" items={folders} isLoading onLoadMore={() => {}}>
          {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
        </ListBox>
      </div>,
    );
    await expect
      .element(screen.getByRole('listbox', { name: 'Default' }))
      .toHaveAttribute('data-empty', 'true');
    await expect.element(screen.getByText('No items')).toBeVisible();
    await expect.element(screen.getByText('No archived folders yet')).toBeVisible();
    const loading = screen.getByRole('listbox', { name: 'Loading' }).element();
    expect(loading.textContent).toBe('Loading…');
    expect(loading.querySelectorAll('[data-slot="spinner"]')).toHaveLength(1);
    const more = screen.getByRole('listbox', { name: 'More' }).element();
    await expect.element(screen.getByRole('option', { name: 'Photos' })).toBeVisible();
    expect(more.lastElementChild).toHaveAttribute('data-slot', 'list-box-loader');
    expect(more.lastElementChild?.textContent).toBe('Loading…');
  });

  it('asks for more items once the end of the list is visible', async () => {
    const onLoadMore = vi.fn();
    const screen = await renderWithDS(
      <ListBox aria-label="Folders" items={folders} onLoadMore={onLoadMore}>
        {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
      </ListBox>,
    );
    await expect.element(screen.getByRole('option', { name: /^Photos/ })).toBeVisible();
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

  it('keeps two-line rows at full height in a list that scrolls', async () => {
    const screen = await renderWithDS(
      <ListBox
        aria-label="Folders"
        className="h-32"
        items={[...folders, ...folders.map((folder) => ({ ...folder, id: `${folder.id}-copy` }))]}
      >
        {(folder) => <ListBoxItem description={folder.description}>{folder.name}</ListBoxItem>}
      </ListBox>,
    );
    const list = screen.getByRole('listbox').element();
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
    for (const option of list.querySelectorAll<HTMLElement>('[role="option"]')) {
      const label = option.querySelector('[data-slot="label"]')!.getBoundingClientRect();
      const description = option
        .querySelector('[data-slot="description"]')!
        .getBoundingClientRect();
      expect(option.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        label.height + description.height,
      );
    }
  });

  it('sets rows at 32 or 36 pixels with density', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        {(['sm', 'md'] as const).map((density) => (
          <ListBox key={density} aria-label={`Status ${density}`} density={density}>
            <ListBoxItem id="draft">Draft</ListBoxItem>
          </ListBox>
        ))}
      </div>,
    );
    await expect
      .element(screen.getByRole('listbox', { name: 'Status sm' }))
      .toHaveAttribute('data-density', 'sm');
    const heights = [...screen.container.querySelectorAll('[role="option"]')].map(
      (option) => option.getBoundingClientRect().height,
    );
    expect(heights).toEqual([32, 36]);
  });

  it('takes the empty and loading text from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <ListBox aria-label="Folders" items={[] as typeof folders}>
          {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
        </ListBox>
        <ListBox
          aria-label="Archived folders"
          items={[] as typeof folders}
          labels={{ empty: 'Nothing archived yet' }}
        >
          {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
        </ListBox>
        <ListBox aria-label="Shared folders" items={folders} isLoading onLoadMore={() => {}}>
          {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
        </ListBox>
        <ListBox
          aria-label="Team folders"
          items={folders}
          isLoading
          onLoadMore={() => {}}
          labels={{ loading: 'Fetching folders…' }}
        >
          {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
        </ListBox>
      </div>,
      { provider: { labels: { listBox: { empty: 'No folders', loading: 'Loading folders…' } } } },
    );
    await expect.element(screen.getByText('No folders')).toBeVisible();
    await expect.element(screen.getByText('Nothing archived yet')).toBeVisible();
    const [shared, team] = screen.container.querySelectorAll('[data-slot="list-box-loader"]');
    expect(shared?.textContent).toBe('Loading folders…');
    expect(team?.textContent).toBe('Fetching folders…');
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
            <ListBoxItem id="comments" startIcon={<FolderIcon />} description="128 files">
              Comments
            </ListBoxItem>
            <ListBoxItem id="archive" startIcon={<FolderIcon />} isDisabled>
              Archive
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
