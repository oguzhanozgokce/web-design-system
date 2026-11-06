import { useState } from 'react';
import { cdp, userEvent } from 'vitest/browser';
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
    const screen = await renderWithDS(<SearchField />);
    const input = screen.getByRole('searchbox', { name: 'Search' });
    await expect.element(input).toHaveAttribute('type', 'search');
    await expect.element(input).toHaveAttribute('placeholder', 'Search');
    await expect.element(input).toHaveAttribute('enterkeyhint', 'search');
    const root = screen.container.querySelector('[data-slot="search-field"]')!;
    expect(root.getAttribute('data-shape')).toBe('field');
    expect(root.getAttribute('data-variant')).toBe('outlined');
    expect(root.getAttribute('data-size')).toBe('md');
  });

  it('uses a visible label and leaves the placeholder to the caller', async () => {
    const screen = await renderWithDS(
      <SearchField label="Find a member" description="Search by name or email." />,
    );
    const input = screen.getByRole('searchbox', { name: 'Find a member' });
    await expect.element(input).not.toHaveAttribute('placeholder');
    await expect.element(input).toHaveAccessibleDescription('Search by name or email.');
  });

  it('reports typed text and follows a controlled value', async () => {
    function Example() {
      const [query, setQuery] = useState('inv');
      return (
        <>
          <SearchField label="Projects" value={query} onChange={setQuery} />
          <output>{query.toUpperCase()}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    const input = screen.getByRole('searchbox', { name: 'Projects' });
    await expect.element(input).toHaveValue('inv');
    await input.fill('DOC-2041');
    await expect.element(screen.getByText('DOC-2041', { exact: true })).toBeInTheDocument();
  });

  it('clears from the clear button, keeps focus in the input and calls onClear', async () => {
    const onClear = vi.fn();
    const screen = await renderWithDS(
      <SearchField label="Payees" defaultValue="Lisbon" onClear={onClear} />,
    );
    const input = screen.getByRole('searchbox', { name: 'Payees' });
    const clear = screen.getByRole('button', { name: 'Clear search' });
    await expect.element(clear).toHaveAttribute('tabindex', '-1');
    await clear.click();
    await expect.element(input).toHaveValue('');
    await expect.element(input).toHaveFocus();
    expect(onClear).toHaveBeenCalledOnce();
    await expect
      .element(screen.getByRole('button', { name: 'Clear search' }))
      .not.toBeInTheDocument();
  });

  it('clears with Escape and lets Escape through once empty', async () => {
    const onParentKeyDown = vi.fn();
    const screen = await renderWithDS(
      <div onKeyDown={(event) => onParentKeyDown(event.key)}>
        <SearchField label="Payees" defaultValue="Lisbon" />
      </div>,
    );
    const input = screen.getByRole('searchbox', { name: 'Payees' });
    await input.click();
    await userEvent.keyboard('{Escape}');
    await expect.element(input).toHaveValue('');
    expect(onParentKeyDown).not.toHaveBeenCalledWith('Escape');
    await userEvent.keyboard('{Escape}');
    expect(onParentKeyDown).toHaveBeenCalledWith('Escape');
  });

  it('submits on Enter without submitting the surrounding form', async () => {
    const onSubmit = vi.fn();
    const onFormSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const screen = await renderWithDS(
      <form onSubmit={(event) => onFormSubmit(event.nativeEvent as SubmitEvent)}>
        <SearchField label="Orders" onSubmit={onSubmit} />
      </form>,
    );
    const input = screen.getByRole('searchbox', { name: 'Orders' });
    await input.fill('ORD-7731');
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('ORD-7731');
    expect(onFormSubmit).not.toHaveBeenCalled();
  });

  it('lets Enter submit the form when there is no onSubmit', async () => {
    const onFormSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const screen = await renderWithDS(
      <form onSubmit={(event) => onFormSubmit(event.nativeEvent as SubmitEvent)}>
        <SearchField label="Orders" name="q" />
      </form>,
    );
    await screen.getByRole('searchbox', { name: 'Orders' }).fill('ORD-7731');
    await userEvent.keyboard('{Enter}');
    expect(onFormSubmit).toHaveBeenCalledOnce();
  });

  it('shows a spinner while an async onSubmit runs and ignores repeat submits', async () => {
    let finish: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(<SearchField label="Orders" onSubmit={onSubmit} />);
    const input = screen.getByRole('searchbox', { name: 'Orders' });
    const root = screen.container.querySelector('[data-slot="search-field"]')!;
    await input.fill('ORD-7731');
    await userEvent.keyboard('{Enter}');
    await expect
      .element(screen.getByRole('progressbar', { name: 'Searching' }))
      .toBeInTheDocument();
    expect(root.hasAttribute('data-pending')).toBe(true);
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
    finish();
    await expect.element(screen.getByRole('progressbar')).not.toBeInTheDocument();
    expect(root.hasAttribute('data-pending')).toBe(false);
    await expect.element(input).toHaveFocus();
  });

  it('ends the pending state when an async onSubmit rejects', async () => {
    let fail: () => void = () => {};
    const onSubmit = vi.fn(
      () => new Promise<void>((_, reject) => (fail = () => reject(new Error('offline')))),
    );
    const screen = await renderWithDS(<SearchField label="Orders" onSubmit={onSubmit} />);
    const input = screen.getByRole('searchbox', { name: 'Orders' });
    await input.fill('ORD-7731');
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('progressbar')).toBeInTheDocument();
    fail();
    await expect.element(screen.getByRole('progressbar')).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('shows the spinner in place of the glyph while isPending is set', async () => {
    const screen = await renderWithDS(<SearchField label="Members" isPending defaultValue="Da" />);
    await expect
      .element(screen.getByRole('progressbar', { name: 'Searching' }))
      .toBeInTheDocument();
    const start = screen.container.querySelector('[data-slot="start-adornment"]')!;
    expect(start.querySelector('[data-slot="search-icon"]')).not.toBeNull();
    expect(start.querySelector('[data-slot="pending"] [data-slot="spinner"]')).not.toBeNull();
    await expect.element(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
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
    const screen = await renderWithDS(<SearchField shortcut="Mod+K" defaultValue="rent" />);
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
    const screen = await renderWithDS(
      <SearchField
        label="Transactions"
        defaultValue="Coffee"
        endAdornment={
          <Button variant="text" size="xs" onPress={onFilters}>
            Filters
          </Button>
        }
      />,
    );
    await screen.getByRole('button', { name: 'Filters' }).click();
    expect(onFilters).toHaveBeenCalledOnce();
    await expect
      .element(screen.getByRole('searchbox', { name: 'Transactions' }))
      .toHaveValue('Coffee');
    const container = screen.container.querySelector('[data-slot="container"]')!;
    expect([...container.children].map((child) => child.getAttribute('data-slot'))).toEqual([
      'start-adornment',
      'input',
      'clear-button',
      'end-adornment',
    ]);
  });

  it('keeps a button passed as the icon separate from the clear action', async () => {
    const onBack = vi.fn();
    const screen = await renderWithDS(
      <SearchField
        label="Transactions"
        defaultValue="Coffee"
        icon={
          <Button variant="text" size="xs" onPress={onBack}>
            Back
          </Button>
        }
      />,
    );
    await screen.getByRole('button', { name: 'Back' }).click();
    expect(onBack).toHaveBeenCalledOnce();
    await expect
      .element(screen.getByRole('searchbox', { name: 'Transactions' }))
      .toHaveValue('Coffee');
  });

  it('renders the pill shape as an M3 search bar', async () => {
    const screen = await renderWithDS(<SearchField shape="pill" variant="filled" />);
    const root = screen.container.querySelector('[data-slot="search-field"]')!;
    expect(root.getAttribute('data-shape')).toBe('pill');
    expect(root.hasAttribute('data-variant')).toBe(false);
    const container = root.querySelector<HTMLElement>('[data-slot="container"]')!;
    const style = getComputedStyle(container);
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThanOrEqual(20);
    expect(parseFloat(style.borderBottomRightRadius)).toBeGreaterThanOrEqual(20);
    expect(style.borderTopWidth).toBe('0px');
    expect(style.paddingInlineStart).toBe('16px');
    expect(getComputedStyle(container, '::after').content).toBe('none');
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

  it('marks an invalid search', async () => {
    const screen = await renderWithDS(
      <SearchField label="Order number" isInvalid errorMessage="Use the ORD- prefix." />,
    );
    const input = screen.getByRole('searchbox', { name: 'Order number' });
    await expect.element(input).toHaveAttribute('aria-invalid', 'true');
    await expect.element(input).toHaveAccessibleDescription('Use the ORD- prefix.');
  });

  it('takes its text and the Field text from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div>
        <SearchField defaultValue="rent" />
        <SearchField
          defaultValue="Lisbon"
          isPending
          labels={{
            search: 'Search payees',
            clear: 'Clear payee search',
            searching: 'Looking up payees',
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
      .element(screen.getByRole('searchbox', { name: 'Search payees' }))
      .toHaveAttribute('placeholder', 'Search payees');
    await expect.element(screen.getByRole('button', { name: 'Clear payee search' })).toBeVisible();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Looking up payees' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('searchbox', { name: 'Region (any)' }))
      .toBeInTheDocument();
  });

  it('keeps the glyph at the start in RTL layouts', async () => {
    const screen = await renderWithDS(
      <div className="w-80">
        <SearchField defaultValue="فاتورة" />
      </div>,
      { locale: 'ar' },
    );
    const glyph = screen.container.querySelector('[data-slot="start-adornment"]')!;
    const input = screen.getByRole('searchbox').element();
    expect(glyph.getBoundingClientRect().left).toBeGreaterThan(input.getBoundingClientRect().left);
  });

  it('keeps the pill outlined in forced colours mode', async () => {
    const screen = await renderWithDS(<SearchField shape="pill" />);
    const pill = screen.container.querySelector('[data-slot="container"]')!;
    expect(getComputedStyle(pill).borderTopWidth).toBe('0px');
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });
    try {
      const canvas = getComputedStyle(document.body).backgroundColor;
      const style = getComputedStyle(pill);
      expect(style.borderTopStyle).toBe('solid');
      expect(style.borderTopWidth).toBe('1px');
      expect(style.borderTopColor).not.toBe(canvas);
    } finally {
      await cdp().send('Emulation.setEmulatedMedia', { features: [] });
    }
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid w-96 gap-4 p-4">
          <SearchField label="Find a member" description="Search by name or email." />
          <SearchField label="Payees" variant="filled" size="sm" defaultValue="Lisbon" />
          <SearchField shape="pill" shortcut="/" />
          <SearchField shape="pill" size="lg" isPending defaultValue="Q3 projects" />
          <SearchField label="Order number" isInvalid errorMessage="Use the ORD- prefix." />
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
