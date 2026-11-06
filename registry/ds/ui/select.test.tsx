import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { FilterIcon, LanguageIcon } from '@/registry/ds/lib/icons';
import { ListBoxItem, ListBoxSection } from '@/registry/ds/ui/list-box';
import { Select, type SelectProps } from '@/registry/ds/ui/select';

const currencies = [
  { id: 'try', name: 'Turkish lira', code: 'TRY' },
  { id: 'eur', name: 'Euro', code: 'EUR' },
  { id: 'usd', name: 'US dollar', code: 'USD' },
  { id: 'gbp', name: 'Pound sterling', code: 'GBP' },
];

function CurrencySelect(
  props: Partial<SelectProps<(typeof currencies)[number], 'single' | 'multiple'>>,
) {
  return (
    <Select label="Currency" items={currencies} {...props}>
      {(currency) => <ListBoxItem description={currency.code}>{currency.name}</ListBoxItem>}
    </Select>
  );
}

function trigger() {
  return page.getByRole('button', { name: /Currency/ });
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
    await renderWithDS(<CurrencySelect defaultValue="eur" />);
    await userEvent.keyboard('{Tab}');
    await expect.element(trigger()).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('option', { name: /^Euro/ })).toHaveFocus();
    await expect
      .element(page.getByRole('option', { name: /^Euro/ }))
      .toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    await expect.element(trigger()).toHaveFocus();
    await expect.element(trigger()).toHaveTextContent('US dollar');
  });

  it('rings the focused option only when the list is driven from the keyboard', async () => {
    await renderWithDS(<CurrencySelect defaultValue="eur" />);
    await trigger().click();
    const euro = page.getByRole('option', { name: /^Euro/ });
    await expect.element(euro).toHaveFocus();
    expect(getComputedStyle(euro.element()).outlineStyle).toBe('none');

    await userEvent.keyboard('{ArrowDown}');
    const dollar = page.getByRole('option', { name: /^US dollar/ });
    await expect.element(dollar).toHaveFocus();
    expect(getComputedStyle(dollar.element()).outlineStyle).toBe('solid');
    expect(getComputedStyle(dollar.element()).outlineWidth).toBe('3px');
  });

  it('follows a controlled value', async () => {
    function Example() {
      const [value, setValue] = useState<Key | null>('try');
      return (
        <>
          <CurrencySelect value={value} onChange={(key) => setValue(key as Key | null)} />
          <output>{String(value)}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    await expect.element(trigger()).toHaveTextContent('Turkish lira');
    await trigger().click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    const popover = document.querySelector<HTMLElement>('[data-slot="popover"]');
    expect(popover?.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    await page.getByRole('option', { name: /^Pound sterling/ }).click();
    await expect.element(screen.getByText('gbp')).toBeInTheDocument();
    await expect.element(trigger()).toHaveTextContent('Pound sterling');
  });

  it('selects several values and shows a count or chips', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <CurrencySelect
          label="Payout currencies"
          selectionMode="multiple"
          valueDisplay="count"
          onChange={onChange}
        />
        <CurrencySelect
          label="Wallets"
          selectionMode="multiple"
          valueDisplay="chips"
          defaultValue={['try', 'eur', 'usd']}
        />
      </div>,
    );
    const payout = screen.getByRole('button', { name: /Payout currencies/ });
    await payout.click();
    const listbox = page.getByRole('listbox');
    await expect.element(listbox).toHaveAttribute('aria-multiselectable', 'true');
    await page.getByRole('option', { name: /^Euro/ }).click();
    await page.getByRole('option', { name: /^US dollar/ }).click();
    await expect.element(listbox).toBeVisible();
    expect(onChange).toHaveBeenLastCalledWith(['eur', 'usd']);
    await userEvent.keyboard('{Escape}');
    await expect.element(payout).toMatchTextContent(/^2 selected /);

    const wallets = screen.getByRole('button', { name: /Wallets/ });
    const chips = wallets.element().querySelectorAll('[data-slot="chip"]');
    expect([...chips].map((chip) => chip.textContent)).toEqual(['Turkish lira', 'Euro']);
    expect(wallets.element().querySelector('[data-slot="more"]')?.textContent).toBe('+1');
    await expect.element(wallets).toHaveAccessibleName('Turkish lira, Euro, and US dollar Wallets');
  });

  it('names the trigger with every selected label when it shows a count', async () => {
    const screen = await renderWithDS(
      <CurrencySelect
        label="Payout currencies"
        selectionMode="multiple"
        valueDisplay="count"
        defaultValue={['eur', 'gbp']}
      />,
    );
    const button = screen.getByRole('button', { name: /Payout currencies/ });
    await expect.element(button).toMatchTextContent(/^2 selected /);
    await expect
      .element(button)
      .toHaveAccessibleName('2 selected Euro and Pound sterling Payout currencies');
  });

  it('keeps disabled options out of reach', async () => {
    const onChange = vi.fn();
    await renderWithDS(<CurrencySelect disabledKeys={['usd']} onChange={onChange} />);
    await trigger().click();
    const usd = page.getByRole('option', { name: /^US dollar/ });
    await expect.element(usd).toHaveAttribute('aria-disabled', 'true');
    await usd.click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{End}');
    await expect.element(page.getByRole('option', { name: /^Pound sterling/ })).toHaveFocus();
  });

  it('dims the selected icon with the rest of a disabled trigger', async () => {
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
    expect(getComputedStyle(icon!).color).toBe(getComputedStyle(button).color);
  });

  it('turns the arrow without a transition when motion is reduced', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <CurrencySelect label="Animated" />
        <CurrencySelect label="Still" />
      </div>,
    );
    const animated = screen.container.querySelector('[data-slot="indicator"] svg');
    expect(animated?.getAttribute('class')).toContain('transition-[rotate]');
    await screen.unmount();

    const reduced = await renderWithDS(<CurrencySelect />, { provider: { motion: 'reduced' } });
    const still = reduced.container.querySelector('[data-slot="indicator"] svg');
    expect(still?.getAttribute('class')).toContain('rotate-180');
    expect(still?.getAttribute('class')).not.toContain('transition');
  });

  it('asks for more options when the end of the list is visible', async () => {
    const onLoadMore = vi.fn();
    await renderWithDS(<CurrencySelect onLoadMore={onLoadMore} />);
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
        <CurrencySelect
          name="currency"
          isRequired
          description="Invoices are issued in this currency."
          errorMessage="Choose a currency to issue invoices."
        />
        <CurrencySelect label="Locked" isDisabled defaultValue="eur" />
        <button type="submit">Save</button>
      </form>,
    );
    await expect
      .element(trigger())
      .toHaveAccessibleDescription('Invoices are issued in this currency.');
    await expect.element(screen.getByText('*')).toBeInTheDocument();

    await screen.getByRole('button', { name: 'Save' }).click();
    expect(onSubmit).not.toHaveBeenCalled();
    await expect.element(screen.getByText('Choose a currency to issue invoices.')).toBeVisible();
    await expect.element(trigger()).toHaveAttribute('data-invalid', 'true');
    await expect
      .element(trigger())
      .toHaveAccessibleDescription('Choose a currency to issue invoices.');

    await trigger().click();
    await page.getByRole('option', { name: /^Euro/ }).click();
    await expect.element(trigger()).not.toHaveAttribute('data-invalid');

    const locked = screen.getByRole('button', { name: /Locked/ });
    await expect.element(locked).toBeDisabled();
  });

  it('shows a spinner and a loading row while options load', async () => {
    await renderWithDS(<CurrencySelect items={[]} isLoading startAdornment={<FilterIcon />} />);
    const button = trigger();
    expect(button.element().querySelector('[data-slot="spinner"]')).not.toBeNull();
    await button.click();
    await expect.element(page.getByRole('option', { name: 'Loading…' })).toBeVisible();
  });

  it('opens a popover at least as wide as the trigger, with sections', async () => {
    await renderWithDS(
      <div className="w-96">
        <Select label="Category" size="sm">
          <ListBoxSection title="Income">
            <ListBoxItem id="salary">Salary</ListBoxItem>
          </ListBoxSection>
          <ListBoxSection title="Expenses">
            <ListBoxItem id="rent">Rent</ListBoxItem>
            <ListBoxItem id="travel" isDisabled>
              Travel
            </ListBoxItem>
          </ListBoxSection>
        </Select>
      </div>,
    );
    const button = page.getByRole('button', { name: /Category/ });
    await button.click();
    await expect.element(page.getByRole('group', { name: 'Expenses' })).toBeVisible();
    const popover = document.querySelector<HTMLElement>('[data-slot="popover"]');
    const width = button.element().getBoundingClientRect().width;
    await expect
      .poll(() => popover?.getBoundingClientRect().width ?? 0)
      .toBeGreaterThanOrEqual(width - 1);
    expect(document.querySelector('[data-slot="list-box"]')).toHaveAttribute('data-density', 'sm');
    await expect
      .element(page.getByRole('option', { name: 'Travel' }))
      .toHaveAttribute('aria-disabled', 'true');
  });

  it('shows an English placeholder and empty state by default', async () => {
    const screen = await renderWithDS(
      <Select label="Currency" items={[] as typeof currencies}>
        {(currency) => <ListBoxItem>{currency.name}</ListBoxItem>}
      </Select>,
    );
    const button = screen.getByRole('button', { name: /Currency/ });
    await expect.element(button).toHaveTextContent('Select an option');
    await button.click();
    await expect.element(page.getByText('No options')).toBeVisible();
  });

  it('takes its text from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <CurrencySelect label="Payout currency" items={[]} />
        <CurrencySelect
          label="Invoice currency"
          items={[]}
          labels={{ placeholder: 'Pick a currency', empty: 'No currencies yet' }}
        />
        <CurrencySelect
          label="Wallets"
          selectionMode="multiple"
          valueDisplay="chips"
          defaultValue={['try', 'eur', 'usd']}
          labels={{ moreCount: (values) => `and ${values.count} more` }}
        />
        <CurrencySelect
          label="Payout currencies"
          selectionMode="multiple"
          valueDisplay="count"
          defaultValue={['eur', 'gbp']}
        />
        <CurrencySelect label="Settlement currency" items={[]} isLoading />
        <CurrencySelect
          label="Reporting currency"
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
              loading: 'Fetching currencies…',
              selectedCount: '{count} chosen',
            },
          },
        },
      },
    );
    const payout = screen.getByRole('button', { name: /Payout currency/ });
    await expect.element(payout).toHaveTextContent('Choose');
    await expect
      .element(screen.getByRole('button', { name: /Invoice currency/ }))
      .toHaveTextContent('Pick a currency');
    const wallets = screen.getByRole('button', { name: /Wallets/ }).element();
    expect(wallets.querySelector('[data-slot="more"]')?.textContent).toBe('and 1 more');
    await expect
      .element(screen.getByRole('button', { name: /Payout currencies/ }))
      .toMatchTextContent(/^2 chosen /);
    await expect.element(screen.getByText('(if any)')).toBeVisible();

    await payout.click();
    await expect.element(page.getByText('Nothing to choose')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

    await screen.getByRole('button', { name: /Invoice currency/ }).click();
    await expect.element(page.getByText('No currencies yet')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();

    await screen.getByRole('button', { name: /Settlement currency/ }).click();
    await expect.element(page.getByRole('option', { name: 'Fetching currencies…' })).toBeVisible();
  });

  it('mirrors the popover in a right-to-left locale', async () => {
    await renderWithDS(<CurrencySelect label="العملة" defaultValue="eur" />, { locale: 'ar' });
    await page.getByRole('button', { name: /العملة/ }).click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    expect(document.querySelector('[data-slot="popover"]')).toHaveAttribute('dir', 'rtl');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <CurrencySelect defaultValue="eur" description="Used on new invoices." />
          <CurrencySelect label="Filled" variant="filled" isInvalid errorMessage="Required" />
          <CurrencySelect
            label="Wallets"
            selectionMode="multiple"
            valueDisplay="chips"
            defaultValue={['try', 'eur', 'usd']}
          />
        </div>,
        options,
      );
      await screen.getByRole('button', { name: /^Euro Currency/ }).click();
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
