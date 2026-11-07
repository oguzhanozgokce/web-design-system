import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { LocationOnIcon } from '@/registry/ds/lib/icons';
import { ComboBox, type ComboBoxProps } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const cities = [
  { id: 'ist', name: 'İstanbul', country: 'Türkiye', keywords: ['TR', 'Constantinople'] },
  { id: 'lis', name: 'Lisbon', country: 'Portugal', keywords: ['PT', 'Lisboa'] },
  { id: 'sao', name: 'São Paulo', country: 'Brazil', keywords: ['BR'] },
  { id: 'zur', name: 'Zürich', country: 'Switzerland', keywords: ['CH'] },
];

function CityComboBox(
  props: Partial<ComboBoxProps<(typeof cities)[number], 'single' | 'multiple'>>,
) {
  return (
    <ComboBox label="Office" defaultItems={cities} {...props}>
      {(city) => (
        <ListBoxItem description={city.country} keywords={city.keywords}>
          {city.name}
        </ListBoxItem>
      )}
    </ComboBox>
  );
}

function input() {
  return page.getByRole('combobox', { name: 'Office' });
}

async function optionNames() {
  await expect.element(page.getByRole('listbox')).toBeVisible();
  return page
    .getByRole('option')
    .elements()
    .map((option) => option.querySelector('[data-slot="label"]')?.textContent);
}

describe('ComboBox', () => {
  it('filters by contains, ignoring case and diacritics', async () => {
    await renderWithDS(<CityComboBox />);
    await input().click();
    await userEvent.keyboard('istanbul');
    expect(await optionNames()).toEqual(['İstanbul']);

    await userEvent.clear(input());
    await userEvent.type(input(), 'sao');
    expect(await optionNames()).toEqual(['São Paulo']);

    await userEvent.clear(input());
    await userEvent.type(input(), 'RIC');
    expect(await optionNames()).toEqual(['Zürich']);

    await userEvent.clear(input());
    await userEvent.type(input(), 'lisboa');
    expect(await optionNames()).toEqual(['Lisbon']);

    await userEvent.clear(input());
    await userEvent.type(input(), 'tr');
    expect(await optionNames()).toEqual(['İstanbul']);
  });

  it('opens from the trigger button and marks the selected option', async () => {
    const screen = await renderWithDS(
      <div>
        <span data-testid="overlay" className="bg-surface-overlay" />
        <CityComboBox defaultValue="zur" />
      </div>,
    );
    expect(
      screen.container.querySelector('[data-slot="combo-box"]')?.getAttribute('data-variant'),
    ).toBe('outline');
    await expect.element(input()).toHaveValue('Zürich');
    const show = screen.getByRole('button', { name: /^Show suggestions/ });
    await expect.element(show).toHaveAttribute('tabindex', '-1');
    await show.click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    const selected = page.getByRole('option', { name: /^Zürich/ });
    await expect.element(selected).toHaveAttribute('aria-selected', 'true');
    expect(selected.element().querySelector('[data-slot="check"] svg')).not.toBeNull();
    const popover = document.querySelector<HTMLElement>('[data-slot="popover"]')!;
    expect(popover.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    expect(getComputedStyle(popover).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('overlay').element()).backgroundColor,
    );

    await page.getByRole('option', { name: /^Lisbon/ }).click();
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    await expect.element(input()).toHaveValue('Lisbon');
  });

  it('lines the popover up with the field, adornment included', async () => {
    const screen = await renderWithDS(
      <div className="w-80 p-4">
        <CityComboBox startAdornment={<LocationOnIcon />} />
      </div>,
    );
    await screen.getByRole('button', { name: /^Show suggestions/ }).click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    const field = screen.container.querySelector('[data-slot="container"]')!;
    const popover = document.querySelector<HTMLElement>('[data-slot="popover"]')!;
    await expect
      .poll(() => popover.getBoundingClientRect().width)
      .toBeGreaterThanOrEqual(field.getBoundingClientRect().width - 1);
    expect(
      Math.abs(popover.getBoundingClientRect().left - field.getBoundingClientRect().left),
    ).toBeLessThan(1);
  });

  it('matches items whose text is built from several text nodes', async () => {
    const project = 2041;
    await renderWithDS(
      <ComboBox label="Office">
        <ListBoxItem id="draft">Draft</ListBoxItem>
        <ListBoxItem id="inv">Project {project}</ListBoxItem>
      </ComboBox>,
    );
    await input().click();
    await userEvent.keyboard('2041');
    expect(await optionNames()).toEqual(['Project 2041']);
  });

  it('turns the chevron while open, without a transition when motion is reduced', async () => {
    const screen = await renderWithDS(<CityComboBox />);
    const arrow = screen.container.querySelector<SVGElement>('[data-slot="trigger"] svg')!;
    expect(getComputedStyle(arrow).rotate).toBe('none');
    await screen.getByRole('button', { name: /^Show suggestions/ }).click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await expect.poll(() => getComputedStyle(arrow).rotate).toBe('180deg');
    await userEvent.keyboard('{Escape}');
    await screen.unmount();

    const still = await renderWithDS(<CityComboBox />, { provider: { motion: 'disabled' } });
    const stillArrow = still.container.querySelector('[data-slot="trigger"] svg')!;
    expect(getComputedStyle(stillArrow).transitionDuration).toBe('0s');
  });

  it('clears the input and the selection from the clear button', async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const screen = await renderWithDS(
      <CityComboBox defaultValue="ist" onChange={onChange} onClear={onClear} />,
    );
    const clear = screen.getByRole('button', { name: 'Clear' });
    await expect.element(clear).toHaveAttribute('tabindex', '-1');
    await clear.click();
    await expect.element(input()).toHaveValue('');
    await expect.element(input()).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(onClear).toHaveBeenCalledOnce();
    await expect.element(screen.getByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('hides the clear button when disabled or opted out', async () => {
    const screen = await renderWithDS(
      <div>
        <CityComboBox label="Office" defaultValue="ist" isClearable={false} />
        <CityComboBox label="Branch" defaultValue="lis" isDisabled />
        <CityComboBox label="Region" defaultValue="sao" isReadOnly />
      </div>,
    );
    await expect.element(screen.getByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('combobox', { name: 'Branch' })).toBeDisabled();
    await expect.element(screen.getByRole('combobox', { name: 'Region' })).toHaveValue('São Paulo');
  });

  it('selects several options, counts them and clears them all', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <CityComboBox selectionMode="multiple" defaultValue={['ist']} onChange={onChange} />,
    );
    const count = () => screen.container.querySelector('[data-slot="selected-count"]');
    expect(count()?.textContent).toBe('1 selected');
    expect(count()).toHaveAttribute('aria-hidden', 'true');
    expect(getComputedStyle(count()!).borderTopLeftRadius).toBe('9999px');
    await expect.element(input()).toHaveAccessibleDescription('İstanbul');

    await input().click();
    await userEvent.keyboard('li');
    await page.getByRole('option', { name: /^Lisbon/ }).click();
    expect(onChange).toHaveBeenLastCalledWith(['ist', 'lis']);
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await expect.element(input()).toHaveValue('');
    await expect
      .element(page.getByRole('option', { name: /^İstanbul/ }))
      .toHaveAttribute('aria-selected', 'true');
    await expect.poll(() => count()?.textContent).toBe('2 selected');
    await expect.element(input()).toHaveAccessibleDescription('İstanbul and Lisbon');

    await userEvent.keyboard('{Escape}');
    await screen.getByRole('button', { name: 'Clear' }).click();
    expect(onChange).toHaveBeenLastCalledWith([]);
    await expect.element(input()).toHaveFocus();
    expect(count()).toBeNull();
    await expect.element(input()).not.toHaveAccessibleDescription();
    await expect.element(screen.getByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('takes its text from labels, then DSProvider', async () => {
    const english = await renderWithDS(
      <CityComboBox selectionMode="multiple" defaultValue={['ist', 'zur']} isLoading />,
    );
    expect(english.container.querySelector('[data-slot="selected-count"]')?.textContent).toBe(
      '2 selected',
    );
    await expect.element(english.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    await expect
      .element(english.getByRole('button', { name: /^Show suggestions/ }))
      .toBeInTheDocument();
    await expect
      .element(english.getByRole('progressbar', { name: 'Loading…' }))
      .toBeInTheDocument();
    await english.unmount();

    const noMatch = await renderWithDS(<CityComboBox />);
    await input().click();
    await userEvent.keyboard('Ankara');
    await expect.element(page.getByText('No results')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await noMatch.unmount();

    const screen = await renderWithDS(
      <div className="flex flex-col gap-4">
        <CityComboBox
          label="Regions"
          selectionMode="multiple"
          defaultValue={['ist', 'zur']}
          isLoading
        />
        <CityComboBox
          label="Branches"
          selectionMode="multiple"
          defaultValue={['lis']}
          labels={{
            clear: 'Remove every branch',
            selectedCount: (values) => `${values.count} branch`,
          }}
        />
        <CityComboBox
          label="Warehouse"
          necessityIndicator="label"
          labels={{ optional: '(if any)' }}
        />
      </div>,
      {
        provider: {
          labels: {
            comboBox: {
              noResults: 'No offices match',
              loading: 'Searching offices…',
              clear: 'Clear offices',
              showSuggestions: 'Show offices',
              selectedCount: '{count} picked',
            },
          },
        },
      },
    );
    const counts = [...screen.container.querySelectorAll('[data-slot="selected-count"]')];
    expect(counts.map((count) => count.textContent)).toEqual(['2 picked', '1 branch']);
    await expect.element(screen.getByRole('button', { name: 'Clear offices' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Remove every branch' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Searching offices…' }))
      .toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Show offices/ }).elements()).toHaveLength(3);
    await expect.element(screen.getByText('(if any)')).toBeVisible();

    await page.getByRole('combobox', { name: 'Branches' }).click();
    await userEvent.keyboard('Ankara');
    await expect.element(page.getByText('No offices match')).toBeVisible();
  });

  it('loads items as the user types', async () => {
    const pending: (() => void)[] = [];
    const search = vi.fn(
      (query: string) =>
        new Promise<typeof cities>((resolve) => {
          pending.push(() =>
            resolve(cities.filter((city) => city.name.toLowerCase().includes(query))),
          );
        }),
    );

    function AsyncCities() {
      const [items, setItems] = useState<typeof cities>([]);
      const [isLoading, setLoading] = useState(false);
      return (
        <ComboBox
          label="Office"
          items={items}
          isLoading={isLoading}
          renderEmptyState={() => 'Type a city'}
          startAdornment={<LocationOnIcon />}
          onInputChange={(value) => {
            setLoading(true);
            search(value).then((results) => {
              setItems(results);
              setLoading(false);
            });
          }}
        >
          {(city) => <ListBoxItem>{city.name}</ListBoxItem>}
        </ComboBox>
      );
    }

    const screen = await renderWithDS(<AsyncCities />);
    await input().click();
    await userEvent.keyboard('z');
    expect(search).toHaveBeenLastCalledWith('z');
    await expect.element(page.getByRole('option', { name: 'Loading…' })).toBeVisible();
    expect(page.getByText('Type a city').elements()).toHaveLength(0);
    const spinner = screen.container.querySelector('[data-slot="loading"]');
    expect(spinner).toHaveAttribute('role', 'progressbar');
    expect(spinner).toHaveAttribute('aria-label', 'Loading…');

    pending.at(-1)?.();
    await expect.element(page.getByRole('option', { name: 'Zürich' })).toBeVisible();
    expect(await optionNames()).toEqual(['Zürich']);
    await expect.poll(() => screen.container.querySelector('[data-slot="loading"]')).toBeNull();
  });

  it('mirrors the popover in a right-to-left locale', async () => {
    await renderWithDS(<CityComboBox label="المكتب" />, { locale: 'ar' });
    await page.getByRole('combobox', { name: 'المكتب' }).click();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('listbox')).toBeVisible();
    expect(document.querySelector('[data-slot="popover"]')).toHaveAttribute('dir', 'rtl');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const variants = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <CityComboBox defaultValue="lis" description="Where the team meets." />
          <CityComboBox label="Branch" variant="soft" isInvalid errorMessage="Pick a branch" />
          <CityComboBox label="Warehouse" isLoading size="sm" />
          <CityComboBox label="Archive" isDisabled />
          <CityComboBox label="Regions" selectionMode="multiple" defaultValue={['ist', 'lis']} />
        </div>,
        options,
      );
      await expectNoA11yViolations(variants.container);
      await variants.unmount();

      const screen = await renderWithDS(
        <div className="p-4">
          <CityComboBox defaultValue="lis" />
        </div>,
        options,
      );
      await screen.getByRole('combobox').click();
      await userEvent.keyboard('{ArrowDown}');
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
