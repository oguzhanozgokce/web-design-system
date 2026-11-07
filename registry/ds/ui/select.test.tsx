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
          Türkçe
        </ListBoxItem>
      </Select>,
    );
    const button = screen.getByRole('button', { name: /Language/ });
    await expect.element(button).toHaveTextContent('Choose a language');
    await button.click();
    const listbox = page.getByRole('listbox');
    await expect.element(listbox).toBeVisible();
    await page.getByRole('option', { name: 'Türkçe' }).click();
    await expect.element(listbox).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith('tr');
    await expect.element(button).toHaveAccessibleName('Türkçe Language');
    const value = button.element().querySelector('[data-slot="value"]');
    expect(value?.querySelector('[data-slot="start-icon"]')).not.toBeNull();
    expect(value?.querySelector('[data-slot="check"]')).toBeNull();
  });

  it('works from the keyboard and returns focus to the trigger', async () => {
    await renderWithDS(<FolderSelect defaultValue="documents" />);
    await userEvent.keyboard('{Tab}');
    await expect.element(trigger()).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('option', { name: /^Documents/ })).toHaveFocus();
    await expect
      .element(page.getByRole('option', { name: /^Documents/ }))
      .toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    await expect.element(trigger()).toHaveFocus();
    await expect.element(trigger()).toHaveTextContent('Music');
  });

  it('rings the focused option only when the list is driven from the keyboard', async () => {
    await renderWithDS(<FolderSelect defaultValue="documents" />);
    await trigger().click();
    const documents = page.getByRole('option', { name: /^Documents/ });
    await expect.element(documents).toHaveFocus();
    expect(getComputedStyle(documents.element()).outlineStyle).toBe('none');

    await userEvent.keyboard('{ArrowDown}');
    const music = page.getByRole('option', { name: /^Music/ });
    await expect.element(music).toHaveFocus();
    expect(getComputedStyle(music.element()).outlineStyle).toBe('solid');
    expect(getComputedStyle(music.element()).outlineWidth).toBe('2px');
    expect(getComputedStyle(music.element()).outlineOffset).toBe('-2px');
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

  it('lists options on a raised overlay panel', async () => {
    const screen = await renderWithDS(
      <>
        <span data-testid="overlay" className="bg-surface-overlay" />
        <FolderSelect />
      </>,
    );
    await trigger().click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    const popover = document.querySelector<HTMLElement>('[data-slot="popover"]')!;
    const panel = getComputedStyle(popover);
    expect(panel.borderTopLeftRadius).toBe('16px');
    expect(panel.borderTopWidth).toBe('1px');
    expect(panel.boxShadow).not.toBe('none');
    expect(panel.backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('overlay').element()).backgroundColor,
    );
    const option = page.getByRole('option', { name: /^Photos/ }).element();
    expect(getComputedStyle(option).borderTopLeftRadius).toBe('12px');
  });

  it('reports the variant and fills the soft trigger', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <span data-testid="neutral" className="bg-neutral-soft" />
        <FolderSelect label="Outline" />
        <FolderSelect label="Soft" variant="soft" />
      </div>,
    );
    const variants = [...screen.container.querySelectorAll('[data-slot="select"]')].map((element) =>
      element.getAttribute('data-variant'),
    );
    expect(variants).toEqual(['outline', 'soft']);
    const neutral = getComputedStyle(screen.getByTestId('neutral').element()).backgroundColor;
    const soft = screen.getByRole('button', { name: /Soft/ }).element();
    expect(getComputedStyle(soft).backgroundColor).toBe(neutral);
    const heights = [...screen.container.querySelectorAll('[data-slot="trigger"]')].map(
      (element) => element.getBoundingClientRect().height,
    );
    expect(heights).toEqual([40, 40]);
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
    await expect.element(page.getByRole('listbox')).toBeVisible();
    const popover = document.querySelector<HTMLElement>('[data-slot="popover"]');
    expect(popover?.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
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

    const sharedFolders = screen.getByRole('button', { name: /Shared folders/ });
    const chips = sharedFolders.element().querySelectorAll('[data-slot="chip"]');
    expect([...chips].map((chip) => chip.textContent)).toEqual(['Photos', 'Documents']);
    expect(sharedFolders.element().querySelector('[data-slot="more"]')?.textContent).toBe('+1');
    await expect
      .element(sharedFolders)
      .toHaveAccessibleName('Photos, Documents, and Music Shared folders');
  });

  it('names the trigger with every selected label when it shows a count', async () => {
    const screen = await renderWithDS(
      <FolderSelect
        label="Sync folders"
        selectionMode="multiple"
        valueDisplay="count"
        defaultValue={['documents', 'videos']}
      />,
    );
    const button = screen.getByRole('button', { name: /Sync folders/ });
    await expect.element(button).toMatchTextContent(/^2 selected /);
    await expect
      .element(button)
      .toHaveAccessibleName('2 selected Documents and Videos Sync folders');
  });

  it('keeps disabled options out of reach', async () => {
    const onChange = vi.fn();
    await renderWithDS(<FolderSelect disabledKeys={['music']} onChange={onChange} />);
    await trigger().click();
    const music = page.getByRole('option', { name: /^Music/ });
    await expect.element(music).toHaveAttribute('aria-disabled', 'true');
    await music.click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{End}');
    await expect.element(page.getByRole('option', { name: /^Videos/ })).toHaveFocus();
  });

  it('dims the whole trigger when disabled', async () => {
    const screen = await renderWithDS(
      <Select label="Language" defaultValue="tr" isDisabled>
        <ListBoxItem id="en" startIcon={<LanguageIcon />}>
          English
        </ListBoxItem>
        <ListBoxItem id="tr" startIcon={<LanguageIcon />}>
          Türkçe
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

  it('turns the arrow without a transition when motion is reduced', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <FolderSelect label="Animated" />
        <FolderSelect label="Still" />
      </div>,
    );
    const animated = screen.container.querySelector('[data-slot="indicator"] svg')!;
    expect(getComputedStyle(animated).transitionProperty).toBe('rotate');
    expect(getComputedStyle(animated).transitionDuration).toBe('0.15s');
    await screen.unmount();

    const reduced = await renderWithDS(<FolderSelect />, { provider: { motion: 'reduced' } });
    const still = reduced.container.querySelector('[data-slot="indicator"] svg')!;
    expect(getComputedStyle(still).transitionDuration).toBe('0s');
  });

  it('asks for more options when the end of the list is visible', async () => {
    const onLoadMore = vi.fn();
    await renderWithDS(<FolderSelect onLoadMore={onLoadMore} />);
    await trigger().click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await expect.poll(() => onLoadMore.mock.calls.length).toBeGreaterThan(0);
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
        <FolderSelect label="Locked" isDisabled defaultValue="documents" />
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

    const locked = screen.getByRole('button', { name: /Locked/ });
    await expect.element(locked).toBeDisabled();
  });

  it('shows a spinner and a loading row while options load', async () => {
    await renderWithDS(<FolderSelect items={[]} isLoading startAdornment={<FilterIcon />} />);
    const button = trigger();
    expect(button.element().querySelector('[data-slot="spinner"]')).not.toBeNull();
    await button.click();
    await expect.element(page.getByRole('option', { name: 'Loading…' })).toBeVisible();
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
            <ListBoxItem id="archive" isDisabled>
              Archive
            </ListBoxItem>
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
    await expect
      .element(page.getByRole('option', { name: 'Archive' }))
      .toHaveAttribute('aria-disabled', 'true');
  });

  it('shows an English placeholder and empty state by default', async () => {
    const screen = await renderWithDS(
      <Select label="Folder" items={[] as typeof folders}>
        {(folder) => <ListBoxItem>{folder.name}</ListBoxItem>}
      </Select>,
    );
    const button = screen.getByRole('button', { name: /Folder/ });
    await expect.element(button).toHaveTextContent('Select an option');
    await button.click();
    await expect.element(page.getByText('No options')).toBeVisible();
  });

  it('takes its text from labels, then DSProvider', async () => {
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
