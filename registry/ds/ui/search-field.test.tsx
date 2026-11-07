import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { SearchField } from '@/registry/ds/ui/search-field';

const isApple = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

async function settleAnimations() {
  const finite = document
    .getAnimations()
    .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity);
  await Promise.all(finite.map((animation) => animation.finished));
}

describe('SearchField', () => {
  it('renders a searchbox named Search when it has no visible label', async () => {
    const screen = await renderWithDS(
      <div>
        <SearchField />
        <SearchField label="Find a member" description="Search by name or email." />
      </div>,
    );
    const input = screen.getByRole('searchbox', { name: 'Search' });
    await expect.element(input).toHaveAttribute('type', 'search');
    await expect.element(input).toHaveAttribute('placeholder', 'Search');
    await expect.element(input).toHaveAttribute('enterkeyhint', 'search');
    const labelled = screen.getByRole('searchbox', { name: 'Find a member' });
    await expect.element(labelled).not.toHaveAttribute('placeholder');
    await expect.element(labelled).toHaveAccessibleDescription('Search by name or email.');
  });

  it('reports typed text and follows a controlled value', async () => {
    function Example() {
      const [query, setQuery] = useState('doc');
      return (
        <>
          <SearchField label="Projects" value={query} onChange={setQuery} />
          <output>{query.toUpperCase()}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    const input = screen.getByRole('searchbox', { name: 'Projects' });
    await expect.element(input).toHaveValue('doc');
    await input.fill('DOC-2041');
    await expect.element(screen.getByText('DOC-2041', { exact: true })).toBeInTheDocument();
  });

  it('clears from the clear button, keeps focus in the input and calls onClear', async () => {
    const onClear = vi.fn();
    const screen = await renderWithDS(
      <SearchField label="People" defaultValue="Lisbon" onClear={onClear} />,
    );
    const input = screen.getByRole('searchbox', { name: 'People' });
    const clear = screen.getByRole('button', { name: 'Clear search' });
    await clear.click();
    await expect.element(input).toHaveValue('');
    await expect.element(input).toHaveFocus();
    expect(onClear).toHaveBeenCalledOnce();
    await expect
      .element(screen.getByRole('button', { name: 'Clear search' }))
      .not.toBeInTheDocument();
  });

  it('submits on Enter without submitting the surrounding form', async () => {
    const onSubmit = vi.fn();
    const onFormSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const onPlainSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const screen = await renderWithDS(
      <div>
        <form onSubmit={(event) => onFormSubmit(event.nativeEvent as SubmitEvent)}>
          <SearchField label="Files" onSubmit={onSubmit} />
        </form>
        <form onSubmit={(event) => onPlainSubmit(event.nativeEvent as SubmitEvent)}>
          <SearchField label="Archive" name="q" />
        </form>
      </div>,
    );
    const input = screen.getByRole('searchbox', { name: 'Files' });
    await input.fill('DOC-7731');
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('DOC-7731');
    expect(onFormSubmit).not.toHaveBeenCalled();

    await screen.getByRole('searchbox', { name: 'Archive' }).fill('DOC-7731');
    await userEvent.keyboard('{Enter}');
    expect(onPlainSubmit).toHaveBeenCalledOnce();
  });

  it('shows a spinner while an async onSubmit runs and ignores repeat submits', async () => {
    const controlled = await renderWithDS(
      <SearchField label="Members" isPending defaultValue="Da" />,
    );
    await expect
      .element(controlled.getByRole('progressbar', { name: 'Searching' }))
      .toBeInTheDocument();
    const start = controlled.container.querySelector('[data-slot="start-adornment"]')!;
    expect(start.querySelector('[data-slot="search-icon"]')).not.toBeNull();
    expect(start.querySelector('[data-slot="pending"] [data-slot="spinner"]')).not.toBeNull();
    await expect
      .element(controlled.getByRole('button', { name: 'Clear search' }))
      .toBeInTheDocument();
    await controlled.unmount();

    let finish: (failed: boolean) => void = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<void>(
          (resolve, reject) =>
            (finish = (failed) => (failed ? reject(new Error('offline')) : resolve())),
        ),
    );
    const screen = await renderWithDS(<SearchField label="Files" onSubmit={onSubmit} />);
    const input = screen.getByRole('searchbox', { name: 'Files' });
    const root = screen.container.querySelector('[data-slot="search-field"]')!;
    await input.fill('DOC-7731');
    await userEvent.keyboard('{Enter}');
    await expect
      .element(screen.getByRole('progressbar', { name: 'Searching' }))
      .toBeInTheDocument();
    expect(root.hasAttribute('data-pending')).toBe(true);
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
    finish(true);
    await expect.element(screen.getByRole('progressbar')).not.toBeInTheDocument();
    expect(root.hasAttribute('data-pending')).toBe(false);
    await expect.element(input).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(2);
    await expect.element(screen.getByRole('progressbar')).toBeInTheDocument();
    finish(false);
    await expect.element(screen.getByRole('progressbar')).not.toBeInTheDocument();
  });

  it('focuses from a plain-key shortcut and shows its hint', async () => {
    const screen = await renderWithDS(
      <div>
        <input aria-label="Notes" />
        <SearchField shortcut="/" />
      </div>,
    );
    const input = screen.getByRole('searchbox', { name: 'Search' });
    await expect.element(input).toHaveAttribute('aria-keyshortcuts', '/');
    const hint = screen.container.querySelector('[data-slot="shortcut"]')!;
    expect(hint.textContent).toBe('/');
    expect(hint.getAttribute('aria-hidden')).toBe('true');

    await screen.getByRole('textbox', { name: 'Notes' }).click();
    await userEvent.keyboard('/');
    await expect.element(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('/');
    await expect.element(input).not.toHaveFocus();

    (document.activeElement as HTMLElement).blur();
    await userEvent.keyboard('/');
    await expect.element(input).toHaveFocus();
    await expect.element(input).toHaveValue('');
  });

  it('focuses from a Mod shortcut with the platform modifier', async () => {
    const screen = await renderWithDS(<SearchField shortcut="Mod+K" defaultValue="beta" />);
    const input = screen.getByRole('searchbox', { name: 'Search' });
    await expect
      .element(input)
      .toHaveAttribute('aria-keyshortcuts', isApple ? 'Meta+K' : 'Control+K');
    expect(screen.container.querySelector('[data-slot="shortcut"]')).toBeNull();
    await userEvent.keyboard(isApple ? '{Meta>}k{/Meta}' : '{Control>}k{/Control}');
    await expect.element(input).toHaveFocus();
    expect(input.element() as HTMLInputElement).toMatchObject({
      selectionStart: 0,
      selectionEnd: 4,
    });
  });

  it('names the modifiers in the hint for the platform, from labels outside Apple', async () => {
    const screen = await renderWithDS(
      <div>
        <SearchField shortcut="Mod+Shift+F" />
        <SearchField shortcut="Mod+Shift+F" labels={{ keyControl: 'Strg', keyShift: 'Umschalt' }} />
      </div>,
    );
    const [english, custom] = screen.container.querySelectorAll('[data-slot="shortcut"]');
    expect(english.textContent).toBe(isApple ? '⇧⌘F' : 'Ctrl+Shift+F');
    expect(custom.textContent).toBe(isApple ? '⇧⌘F' : 'Strg+Umschalt+F');
    expect(custom.getAttribute('dir')).toBe('ltr');
  });

  it('leaves plain keys to list typeahead but not to checkboxes', async () => {
    const screen = await renderWithDS(
      <div>
        <div role="listbox" tabIndex={0} aria-label="Accounts">
          <div role="option" aria-selected="false">
            Backups
          </div>
        </div>
        <input type="checkbox" aria-label="Show archived" />
        <SearchField shortcut="p" />
      </div>,
    );
    const input = screen.getByRole('searchbox', { name: 'Search' });
    await screen.getByRole('listbox', { name: 'Accounts' }).click();
    await userEvent.keyboard('p');
    await expect.element(input).not.toHaveFocus();
    await screen.getByRole('checkbox', { name: 'Show archived' }).click();
    await userEvent.keyboard('p');
    await expect.element(input).toHaveFocus();
    await expect.element(input).toHaveValue('');
  });

  it('lets a visible field take a shortcut that a hidden one also binds', async () => {
    const screen = await renderWithDS(
      <div>
        <SearchField aria-label="Search on mobile" shortcut="/" className="hidden" />
        <SearchField aria-label="Search on desktop" shortcut="/" />
      </div>,
    );
    await userEvent.keyboard('/');
    await expect
      .element(screen.getByRole('searchbox', { name: 'Search on desktop' }))
      .toHaveFocus();
  });

  it('does not bind or show the shortcut while disabled', async () => {
    const screen = await renderWithDS(<SearchField shortcut="/" isDisabled />);
    const input = screen.getByRole('searchbox', { name: 'Search' });
    await expect.element(input).toBeDisabled();
    expect(screen.container.querySelector('[data-slot="shortcut"]')).toBeNull();
    await userEvent.keyboard('/');
    await expect.element(input).not.toHaveFocus();
  });

  it('keeps end adornment buttons separate from the clear action', async () => {
    const onFilters = vi.fn();
    const onBack = vi.fn();
    const screen = await renderWithDS(
      <SearchField
        label="Photos"
        defaultValue="Beach"
        icon={
          <Button variant="ghost" size="sm" onPress={onBack}>
            Back
          </Button>
        }
        endAdornment={
          <Button variant="ghost" size="sm" onPress={onFilters}>
            Filters
          </Button>
        }
      />,
    );
    await screen.getByRole('button', { name: 'Filters' }).click();
    await screen.getByRole('button', { name: 'Back' }).click();
    expect(onFilters).toHaveBeenCalledOnce();
    expect(onBack).toHaveBeenCalledOnce();
    await expect.element(screen.getByRole('searchbox', { name: 'Photos' })).toHaveValue('Beach');
    const container = screen.container.querySelector('[data-slot="container"]')!;
    expect([...container.children].map((child) => child.getAttribute('data-slot'))).toEqual([
      'start-adornment',
      'input',
      'clear-button',
      'end-adornment',
    ]);
  });

  it('hides the clear button when disabled or read only', async () => {
    const screen = await renderWithDS(
      <div>
        <SearchField label="Region" defaultValue="eu-west-1" isDisabled />
        <SearchField label="Workspace" defaultValue="ws_48213" isReadOnly />
      </div>,
    );
    expect(screen.container.querySelector('[data-slot="clear-button"]')).toBeNull();
    const containers = screen.container.querySelectorAll('[data-slot="container"]');
    expect(containers[0].hasAttribute('data-disabled')).toBe(true);
    expect(containers[1].hasAttribute('data-readonly')).toBe(true);
  });

  it('takes its text and the Field text from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div>
        <SearchField defaultValue="notes" />
        <SearchField
          defaultValue="Lisbon"
          isPending
          labels={{
            search: 'Search people',
            clear: 'Clear person search',
            searching: 'Looking up people',
          }}
        />
        <SearchField label="Region" necessityIndicator="label" labels={{ optional: '(any)' }} />
      </div>,
      { provider: { labels: { searchField: { search: 'Find', clear: 'Clear the query' } } } },
    );
    const find = screen.getByRole('searchbox', { name: 'Find' });
    await expect.element(find).toHaveAttribute('placeholder', 'Find');
    await expect.element(screen.getByRole('button', { name: 'Clear the query' })).toBeVisible();
    await expect
      .element(screen.getByRole('searchbox', { name: 'Search people' }))
      .toHaveAttribute('placeholder', 'Search people');
    await expect.element(screen.getByRole('button', { name: 'Clear person search' })).toBeVisible();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Looking up people' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('searchbox', { name: 'Region (any)' }))
      .toBeInTheDocument();
  });

  it('keeps the glyph at the start in RTL layouts', async () => {
    const screen = await renderWithDS(
      <div className="w-80">
        <SearchField defaultValue="صور" />
      </div>,
      { locale: 'ar' },
    );
    const glyph = screen.container.querySelector('[data-slot="start-adornment"]')!;
    const input = screen.getByRole('searchbox').element();
    expect(glyph.getBoundingClientRect().left).toBeGreaterThan(input.getBoundingClientRect().left);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid w-96 gap-4 p-4">
          <SearchField label="Find a member" description="Search by name or email." />
          <SearchField label="People" variant="soft" size="sm" defaultValue="Lisbon" />
          <SearchField variant="soft" shortcut="/" />
          <SearchField variant="soft" size="lg" isPending defaultValue="Projects" />
          <SearchField label="Files" size="lg" shortcut="Mod+K" />
          <SearchField label="File code" isInvalid errorMessage="Use the DOC- prefix." />
          <SearchField label="Region" isDisabled defaultValue="eu-west-1" />
        </div>,
        options,
      );
      await settleAnimations();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
