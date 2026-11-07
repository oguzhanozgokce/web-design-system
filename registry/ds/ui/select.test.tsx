import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { FilterIcon, LanguageIcon } from '@/registry/ds/lib/icons';
import { ListBoxItem, ListBoxSection } from '@/registry/ds/ui/list-box';
import { Select, type SelectProps } from '@/registry/ds/ui/select';

const folders = [
  { id: 'photos', name: 'Photos', files: '248 files' },
  { id: 'documents', name: 'Documents', files: '92 files' },
  { id: 'music', name: 'Music', files: '1,204 files' },
  { id: 'videos', name: 'Videos', files: '36 files' },
];

function FolderSelect(
  props: Partial<SelectProps<(typeof folders)[number], 'single' | 'multiple'>>,
) {
  return (
    <Select label="Folder" items={folders} {...props}>
      {(folder) => <ListBoxItem description={folder.files}>{folder.name}</ListBoxItem>}
    </Select>
  );
}

function trigger() {
  return page.getByRole('button', { name: /Folder/ });
}

describe('Select', () => {
  it('opens from the trigger and shows the chosen value', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <Select label="Language" placeholder="Choose a language" onChange={onChange}>
        <ListBoxItem id="en" startIcon={<LanguageIcon />}>
          English
        </ListBoxItem>
        <ListBoxItem id="tr" startIcon={<LanguageIcon />}>
          Turkish
        </ListBoxItem>
      </Select>,
    );
    const button = screen.getByRole('button', { name: /Language/ });
    await expect.element(button).toHaveTextContent('Choose a language');
    await button.click();
    const listbox = page.getByRole('listbox');
    await expect.element(listbox).toBeVisible();
    await page.getByRole('option', { name: 'Turkish' }).click();
    await expect.element(listbox).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith('tr');
    await expect.element(button).toHaveAccessibleName('Turkish Language');
    const value = button.element().querySelector('[data-slot="value"]');
    expect(value?.querySelector('[data-slot="start-icon"]')).not.toBeNull();
    expect(value?.querySelector('[data-slot="check"]')).toBeNull();
  });

  it('draws the focused frame while open and turns the chevron', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <span data-testid="primary" className="border border-primary" />
        <FolderSelect defaultValue="photos" />
      </div>,
    );
    const button = trigger().element();
    const chevron = button.querySelector<SVGElement>('[data-slot="indicator"] svg')!;
    expect(getComputedStyle(chevron).rotate).toBe('none');
    await trigger().click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await expect.element(trigger()).toHaveAttribute('data-pressed', 'true');
    await expect
      .poll(() => getComputedStyle(button).borderTopColor)
      .toBe(getComputedStyle(screen.getByTestId('primary').element()).borderTopColor);
    await expect.poll(() => getComputedStyle(chevron).rotate).toBe('180deg');
  });

  it('follows a controlled value', async () => {
    function Example() {
      const [value, setValue] = useState<Key | null>('photos');
      return (
        <>
          <FolderSelect value={value} onChange={(key) => setValue(key as Key | null)} />
          <output>{String(value)}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    await expect.element(trigger()).toHaveTextContent('Photos');
    await trigger().click();
    await page.getByRole('option', { name: /^Videos/ }).click();
    await expect.element(screen.getByText('videos')).toBeInTheDocument();
    await expect.element(trigger()).toHaveTextContent('Videos');
  });

  it('selects several values and shows a count or chips', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <FolderSelect
          label="Sync folders"
          selectionMode="multiple"
          valueDisplay="count"
          onChange={onChange}
        />
        <FolderSelect
          label="Shared folders"
          selectionMode="multiple"
          valueDisplay="chips"
          defaultValue={['photos', 'documents', 'music']}
        />
      </div>,
    );
    const upload = screen.getByRole('button', { name: /Sync folders/ });
    await upload.click();
    const listbox = page.getByRole('listbox');
    await expect.element(listbox).toHaveAttribute('aria-multiselectable', 'true');
    await page.getByRole('option', { name: /^Documents/ }).click();
    await page.getByRole('option', { name: /^Music/ }).click();
    await expect.element(listbox).toBeVisible();
    expect(onChange).toHaveBeenLastCalledWith(['documents', 'music']);
    await userEvent.keyboard('{Escape}');
    await expect.element(upload).toMatchTextContent(/^2 selected /);
    await expect
      .element(upload)
      .toHaveAccessibleName('2 selected Documents and Music Sync folders');

    const sharedFolders = screen.getByRole('button', { name: /Shared folders/ });
    const chips = sharedFolders.element().querySelectorAll('[data-slot="chip"]');
    expect([...chips].map((chip) => chip.textContent)).toEqual(['Photos', 'Documents']);
    expect(sharedFolders.element().querySelector('[data-slot="more"]')?.textContent).toBe('+1');
    await expect
      .element(sharedFolders)
      .toHaveAccessibleName('Photos, Documents, and Music Shared folders');
  });

  it('dims the whole trigger when disabled', async () => {
    const screen = await renderWithDS(
      <Select label="Language" defaultValue="tr" isDisabled>
        <ListBoxItem id="en" startIcon={<LanguageIcon />}>
          English
        </ListBoxItem>
        <ListBoxItem id="tr" startIcon={<LanguageIcon />}>
          Turkish
        </ListBoxItem>
      </Select>,
    );
    const button = screen.getByRole('button', { name: /Language/ }).element();
    const icon = button.querySelector<HTMLElement>('[data-slot="value"] [data-slot="start-icon"]');
    expect(icon).not.toBeNull();
    expect(getComputedStyle(button).opacity).toBe('0.5');
    expect(getComputedStyle(button).cursor).toBe('not-allowed');
    expect(getComputedStyle(icon!).opacity).toBe('1');
  });

  it('shows the description, then the error after a failed submit', async () => {
    const onSubmit = vi.fn();
    const screen = await renderWithDS(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <FolderSelect
          name="folder"
          isRequired
          description="New uploads are saved here."
          errorMessage="Choose a folder for uploads."
        />
        <button type="submit">Save</button>
      </form>,
    );
    await expect.element(trigger()).toHaveAccessibleDescription('New uploads are saved here.');
    await expect.element(screen.getByText('*')).toBeInTheDocument();

    await screen.getByRole('button', { name: 'Save' }).click();
    expect(onSubmit).not.toHaveBeenCalled();
    await expect.element(screen.getByText('Choose a folder for uploads.')).toBeVisible();
    await expect.element(trigger()).toHaveAttribute('data-invalid', 'true');
    await expect.element(trigger()).toHaveAccessibleDescription('Choose a folder for uploads.');

    await trigger().click();
    await page.getByRole('option', { name: /^Documents/ }).click();
    await expect.element(trigger()).not.toHaveAttribute('data-invalid');
  });

  it('shows a spinner and a loading row while options load', async () => {
    const onLoadMore = vi.fn();
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <FolderSelect items={[]} isLoading startAdornment={<FilterIcon />} />
        <FolderSelect label="Archive" onLoadMore={onLoadMore} />
      </div>,
    );
    const button = trigger();
    expect(button.element().querySelector('[data-slot="spinner"]')).not.toBeNull();
    await button.click();
    await expect.element(page.getByRole('option', { name: 'Loading…' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

    await screen.getByRole('button', { name: /Archive/ }).click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await expect.poll(() => onLoadMore.mock.calls.length).toBeGreaterThan(0);
  });

  it('opens a popover at least as wide as the trigger, with sections', async () => {
    await renderWithDS(
      <div className="w-96">
        <Select label="Location" size="sm">
          <ListBoxSection title="Recent">
            <ListBoxItem id="photos">Photos</ListBoxItem>
          </ListBoxSection>
          <ListBoxSection title="Shared">
            <ListBoxItem id="team">Team</ListBoxItem>
          </ListBoxSection>
        </Select>
      </div>,
    );
    const button = page.getByRole('button', { name: /Location/ });
    await button.click();
    await expect.element(page.getByRole('group', { name: 'Shared' })).toBeVisible();
    const popover = document.querySelector<HTMLElement>('[data-slot="popover"]');
    const width = button.element().getBoundingClientRect().width;
    await expect
      .poll(() => popover?.getBoundingClientRect().width ?? 0)
      .toBeGreaterThanOrEqual(width - 1);
    expect(document.querySelector('[data-slot="list-box"]')).toHaveAttribute('data-density', 'sm');
  });

  it('takes its text from labels, then DSProvider', async () => {
    const english = await renderWithDS(
      <Select label="Folder" items={[] as typeof folders}>
        {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
      </Select>,
    );
    await expect.element(trigger()).toHaveTextContent('Select an option');
    await trigger().click();
    await expect.element(page.getByText('No options')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await english.unmount();

    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <FolderSelect label="Upload folder" items={[]} />
        <FolderSelect
          label="Project folder"
          items={[]}
          labels={{ placeholder: 'Pick a folder', empty: 'No folders yet' }}
        />
        <FolderSelect
          label="Shared folders"
          selectionMode="multiple"
          valueDisplay="chips"
          defaultValue={['photos', 'documents', 'music']}
          labels={{ moreCount: (values) => `and ${values.count} more` }}
        />
        <FolderSelect
          label="Sync folders"
          selectionMode="multiple"
          valueDisplay="count"
          defaultValue={['documents', 'videos']}
        />
        <FolderSelect label="Archive folder" items={[]} isLoading />
        <FolderSelect
          label="Export folder"
          necessityIndicator="label"
          labels={{ optional: '(if any)' }}
        />
      </div>,
      {
        provider: {
          labels: {
            select: {
              placeholder: 'Choose',
              empty: 'Nothing to choose',
              loading: 'Fetching folders…',
              selectedCount: '{count} chosen',
            },
          },
        },
      },
    );
    const upload = screen.getByRole('button', { name: /Upload folder/ });
    await expect.element(upload).toHaveTextContent('Choose');
    await expect
      .element(screen.getByRole('button', { name: /Project folder/ }))
      .toHaveTextContent('Pick a folder');
    const sharedFolders = screen.getByRole('button', { name: /Shared folders/ }).element();
    expect(sharedFolders.querySelector('[data-slot="more"]')?.textContent).toBe('and 1 more');
    await expect
      .element(screen.getByRole('button', { name: /Sync folders/ }))
      .toMatchTextContent(/^2 chosen /);
    await expect.element(screen.getByText('(if any)')).toBeVisible();

    await upload.click();
    await expect.element(page.getByText('Nothing to choose')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

    await screen.getByRole('button', { name: /Project folder/ }).click();
    await expect.element(page.getByText('No folders yet')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

    await screen.getByRole('button', { name: /Archive folder/ }).click();
    await expect.element(page.getByRole('option', { name: 'Fetching folders…' })).toBeVisible();
  });

  it('mirrors the popover in a right-to-left locale', async () => {
    await renderWithDS(<FolderSelect label="المجلد" defaultValue="documents" />, { locale: 'ar' });
    await page.getByRole('button', { name: /المجلد/ }).click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    expect(document.querySelector('[data-slot="popover"]')).toHaveAttribute('dir', 'rtl');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <FolderSelect defaultValue="documents" description="Holds new uploads." />
          <FolderSelect label="Soft" variant="soft" isInvalid errorMessage="Required" />
          <FolderSelect label="Archive" isDisabled defaultValue="videos" />
          <FolderSelect
            label="Shared folders"
            selectionMode="multiple"
            valueDisplay="chips"
            defaultValue={['photos', 'documents', 'music']}
          />
        </div>,
        options,
      );
      await screen.getByRole('button', { name: /^Documents Folder/ }).click();
      await expect.element(page.getByRole('listbox')).toBeVisible();
      await new Promise((resolve) => setTimeout(resolve, 250));
      await expectNoA11yViolations(document.body);
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
      await screen.unmount();
    }
    document.documentElement.classList.remove('dark');
  });
});
