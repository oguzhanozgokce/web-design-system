import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { NumberField } from '@/registry/ds/ui/number-field';

function digitsOf(element: Element) {
  return [...element.querySelectorAll('[data-slot="rolling-number-digit"]')].map(
    (column) => column.firstElementChild!.textContent,
  );
}

function widthOf(element: Element | null) {
  return element!.getBoundingClientRect().width;
}

describe('NumberField', () => {
  it('steps with the buttons and reports each committed number', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <NumberField label="Seats" defaultValue={5} onChange={onChange} />,
    );
    const input = screen.getByRole('textbox', { name: 'Seats' });
    await screen.getByRole('button', { name: 'Increase Seats' }).click();
    await screen.getByRole('button', { name: 'Increase Seats' }).click();
    await expect.element(input).toHaveValue('7');
    await screen.getByRole('button', { name: 'Decrease Seats' }).click();
    await expect.element(input).toHaveValue('6');
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([6, 7, 6]);
  });

  it('names the steppers from English defaults, DSProvider labels, then the labels prop', async () => {
    const english = await renderWithDS(
      <div>
        <NumberField
          label="Seats"
          necessityIndicator="label"
          defaultValue={5}
          labels={{ optional: '(leave empty for unlimited)' }}
        />
        <NumberField
          aria-label="Nights"
          defaultValue={3}
          labels={{ increase: ({ label }) => `Add one to ${label.toLowerCase()}` }}
        />
      </div>,
    );
    await expect
      .element(english.getByRole('textbox', { name: 'Seats (leave empty for unlimited)' }))
      .toBeInTheDocument();
    await expect
      .element(english.getByRole('button', { name: 'Increase Seats' }))
      .toBeInTheDocument();
    await expect
      .element(english.getByRole('button', { name: 'Add one to nights' }))
      .toBeInTheDocument();
    await expect
      .element(english.getByRole('button', { name: 'Decrease Nights' }))
      .toBeInTheDocument();
    await english.unmount();

    const provided = await renderWithDS(
      <div>
        <NumberField label="Plätze" defaultValue={3} />
        <NumberField
          label="Ticketpreis"
          defaultValue={1250.5}
          formatOptions={{ style: 'currency', currency: 'EUR' }}
          labels={{ increase: '{label} erhöhen' }}
        />
      </div>,
      {
        locale: 'de',
        provider: {
          labels: {
            numberField: { increase: '{label} plus eins', decrease: '{label} minus eins' },
          },
        },
      },
    );
    await expect
      .element(provided.getByRole('button', { name: 'Plätze plus eins' }))
      .toBeInTheDocument();
    await expect
      .element(provided.getByRole('button', { name: 'Plätze minus eins' }))
      .toBeInTheDocument();
    await expect
      .element(provided.getByRole('button', { name: 'Ticketpreis erhöhen' }))
      .toBeInTheDocument();
    await expect
      .element(provided.getByRole('button', { name: 'Ticketpreis minus eins' }))
      .toBeInTheDocument();
    await expect
      .element(provided.getByRole('textbox', { name: 'Ticketpreis' }))
      .toHaveValue('1.250,50 €');
  });
  it('names the steppers from a label that is not plain text, aria-label or explicit stepper labels', async () => {
    const english = await renderWithDS(
      <div>
        <NumberField
          label={
            <>
              Seats <span className="text-on-surface-variant">(team plan)</span>
            </>
          }
          defaultValue={3}
        />
        <NumberField aria-label="Copies, poster" defaultValue={1} />
        <NumberField label="Guests" isLabelHidden defaultValue={2} />
        <NumberField
          label="Nights"
          defaultValue={2}
          incrementAriaLabel="Add a night"
          decrementAriaLabel="Remove a night"
        />
      </div>,
    );
    await expect
      .element(english.getByRole('button', { name: 'Increase Seats (team plan)' }))
      .toBeInTheDocument();
    await expect
      .element(english.getByRole('button', { name: 'Increase Copies, poster' }))
      .toBeInTheDocument();
    await expect.element(english.getByRole('textbox', { name: 'Guests' })).toBeInTheDocument();
    await expect
      .element(english.getByRole('button', { name: 'Decrease Guests' }))
      .toBeInTheDocument();
    await expect.element(english.getByRole('button', { name: 'Add a night' })).toBeInTheDocument();
    await expect
      .element(english.getByRole('button', { name: 'Remove a night' }))
      .toBeInTheDocument();
    await english.unmount();

    const labelFirst = await renderWithDS(
      <NumberField
        label={<strong>Koltuk</strong>}
        defaultValue={3}
        labels={{ increase: ({ label }) => `${label} değerini artır` }}
      />,
    );
    await expect
      .element(labelFirst.getByRole('button', { name: 'Koltuk değerini artır' }))
      .toBeInTheDocument();
    await labelFirst.unmount();

    const labelled = await renderWithDS(
      <div>
        <span id="nights-heading">Nights</span>
        <NumberField aria-labelledby="nights-heading" defaultValue={2} />
      </div>,
      { provider: { labels: { numberField: { increase: '{label} erhöhen' } } } },
    );
    await expect.element(labelled.getByRole('textbox', { name: 'Nights' })).toBeInTheDocument();
    await expect
      .element(labelled.getByRole('button', { name: 'Nights erhöhen' }))
      .toBeInTheDocument();
  });

  it('follows a controlled value', async () => {
    function Example() {
      const [nights, setNights] = useState(2);
      return (
        <>
          <NumberField label="Nights" value={nights} onChange={setNights} minValue={1} />
          <output>{nights * 24} hours</output>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    await screen.getByRole('button', { name: 'Increase Nights' }).click();
    await expect.element(screen.getByText('72 hours')).toBeInTheDocument();
    await expect.element(screen.getByRole('textbox', { name: 'Nights' })).toHaveValue('3');
  });

  it('stacks chevrons at the end in the inline layout', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <NumberField label="Retry limit" layout="inline" defaultValue={3} onChange={onChange} />,
    );
    const steppers = screen.container.querySelector('[data-slot="steppers"]')!;
    expect([...steppers.children].map((child) => child.getAttribute('data-slot'))).toEqual([
      'increment',
      'decrement',
    ]);
    const container = screen.container.querySelector('[data-slot="container"]')!;
    expect(container.lastElementChild).toBe(steppers);
    await screen.getByRole('button', { name: 'Increase Retry limit' }).click();
    expect(onChange).toHaveBeenLastCalledWith(4);
  });

  it('sizes the field at 32, 40 and 48 pixels with full-height steppers inside it', async () => {
    const screen = await renderWithDS(
      <div className="w-96">
        <NumberField label="Small" size="sm" defaultValue={9} />
        <NumberField label="Medium" defaultValue={9} />
        <NumberField label="Large" size="lg" defaultValue={9} />
      </div>,
    );
    const roots = [...screen.container.querySelectorAll('[data-slot="number-field"]')];
    expect(roots.map((root) => root.getAttribute('data-size'))).toEqual(['sm', 'md', 'lg']);
    const containers = [...screen.container.querySelectorAll('[data-slot="container"]')];
    expect(containers.map((element) => element.getBoundingClientRect().height)).toEqual([
      32, 40, 48,
    ]);
    containers.forEach((container) => {
      const frame = container.getBoundingClientRect();
      for (const slot of ['decrement', 'increment']) {
        const stepper = container.querySelector(`[data-slot="${slot}"]`)!.getBoundingClientRect();
        expect(stepper.height).toBe(frame.height - 2);
        expect(stepper.width).toBe(frame.height);
        expect(stepper.left).toBeGreaterThanOrEqual(frame.left);
        expect(stepper.right).toBeLessThanOrEqual(frame.right);
      }
    });
  });

  it('dims a stepper at its bound, and a disabled field only once', async () => {
    const screen = await renderWithDS(
      <div>
        <NumberField label="Copies" defaultValue={1} minValue={1} />
        <NumberField label="Licences" defaultValue={8} isDisabled />
      </div>,
    );
    const atBound = screen.getByRole('button', { name: 'Decrease Copies' }).element();
    expect(atBound).toHaveAttribute('data-disabled', 'true');
    expect(getComputedStyle(atBound).opacity).toBe('0.5');
    expect(getComputedStyle(atBound).cursor).toBe('not-allowed');
    const free = screen.getByRole('button', { name: 'Increase Copies' }).element();
    expect(getComputedStyle(free).opacity).toBe('1');
    expect(getComputedStyle(free).cursor).toBe('pointer');

    const disabled = screen.getByRole('button', { name: 'Increase Licences' }).element();
    expect(disabled).toHaveAttribute('data-disabled', 'true');
    expect(getComputedStyle(disabled).opacity).toBe('1');
    const frame = disabled.closest('[data-slot="container"]')!;
    expect(getComputedStyle(frame).opacity).toBe('0.5');
  });

  it('rolls the value while idle and shows the plain input while typing', async () => {
    const screen = await renderWithDS(
      <NumberField label="Seats" defaultValue={5} maxValue={40} isAnimated />,
    );
    const input = screen.getByRole('textbox', { name: 'Seats' });
    const roller = () => screen.container.querySelector<HTMLElement>('[data-slot="roller"]')!;
    expect(roller().getAttribute('aria-hidden')).toBe('true');
    expect(roller().querySelector('[data-slot="rolling-number"]')).not.toBeNull();
    await expect.element(input).toHaveAttribute('data-rolling', 'true');
    await expect.element(roller()).toBeVisible();
    expect(getComputedStyle(input.element()).color).toBe('rgba(0, 0, 0, 0)');

    await input.click();
    await expect.element(input).not.toHaveAttribute('data-rolling');
    await expect.element(roller()).not.toBeVisible();
    expect(getComputedStyle(input.element()).color).not.toBe('rgba(0, 0, 0, 0)');
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(input).toHaveAttribute('data-rolling', 'true');
    await expect.element(input).toHaveValue('6');

    await input.fill('9');
    await expect.element(input).not.toHaveAttribute('data-rolling');
    await userEvent.keyboard('{End}');
    await expect.element(input).toHaveValue('40');
    await expect.element(input).toHaveAttribute('data-rolling', 'true');

    await input.fill('9');
    await expect.element(input).not.toHaveAttribute('data-rolling');
    await screen.getByRole('button', { name: 'Increase Seats' }).click();
    await expect.element(input).toHaveValue('10');
    await expect.element(input).toHaveAttribute('data-rolling', 'true');
    await expect.element(roller()).toBeVisible();
  });

  it('rolls in right-to-left locales, with symbols and Arabic-Indic digits', async () => {
    const arabic = await renderWithDS(
      <div>
        <NumberField label="المقاعد" defaultValue={5} isAnimated />
        <NumberField
          label="سعر التذكرة"
          defaultValue={120}
          isAnimated
          formatOptions={{ style: 'currency', currency: 'SAR' }}
        />
      </div>,
      { locale: 'ar' },
    );
    const fields = arabic.container.querySelectorAll('[data-slot="number-field"]');
    expect(fields[0].querySelector('[data-slot="roller"]')).not.toBeNull();
    expect(fields[1].querySelector('[data-slot="roller"]')).not.toBeNull();
    await expect
      .element(arabic.getByRole('textbox', { name: 'سعر التذكرة' }))
      .toHaveAttribute('data-rolling', 'true');
    await arabic.unmount();

    const egyptian = await renderWithDS(
      <NumberField label="المقاعد" defaultValue={25} isAnimated />,
      { locale: 'ar-EG' },
    );
    const input = egyptian.getByRole('textbox', { name: 'المقاعد' });
    await expect.element(input).toHaveValue('٢٥');
    await expect.element(input).toHaveAttribute('data-rolling', 'true');
    expect(digitsOf(egyptian.container.querySelector('[data-slot="roller"]')!)).toEqual(['٢', '٥']);
  });

  it('falls back to plain text when someone types other digits', async () => {
    const screen = await renderWithDS(<NumberField label="Seats" defaultValue={5} isAnimated />);
    const input = screen.getByRole('textbox', { name: 'Seats' });
    await input.fill('٧');
    await userEvent.tab();
    await expect.element(input).toHaveValue('٧');
    expect(screen.container.querySelector('[data-slot="roller"]')).toBeNull();
    await expect.element(input).not.toHaveAttribute('data-rolling');
  });

  it('sizes the compact slab at 32, 40 and 48 pixels with keys inset inside it', async () => {
    const screen = await renderWithDS(
      <div className="w-96">
        <NumberField label="Small" layout="compact" size="sm" defaultValue={3} />
        <NumberField label="Medium" layout="compact" defaultValue={3} />
        <NumberField label="Large" layout="compact" size="lg" defaultValue={3} />
      </div>,
    );
    const roots = [...screen.container.querySelectorAll('[data-slot="number-field"]')];
    expect(roots.map((root) => root.getAttribute('data-animated'))).toEqual([
      'true',
      'true',
      'true',
    ]);
    const containers = [...screen.container.querySelectorAll('[data-slot="container"]')];
    expect(containers.map((element) => element.getBoundingClientRect().height)).toEqual([
      32, 40, 48,
    ]);
    expect(
      containers.map((element) => element.querySelector('[data-slot="increment"]')!.clientWidth),
    ).toEqual([24, 30, 38]);
    for (const container of containers) {
      const frame = container.getBoundingClientRect();
      expect(frame.width).toBeLessThan(frame.height * 3);
      for (const slot of ['decrement', 'increment']) {
        const key = container.querySelector(`[data-slot="${slot}"]`)!.getBoundingClientRect();
        expect(key.height).toBe(key.width);
        expect(key.top - frame.top).toBe((frame.height - key.height) / 2);
      }
    }
  });
  it('widens the slab as digits arrive', async () => {
    const screen = await renderWithDS(
      <NumberField label="Copies" layout="compact" defaultValue={9} />,
    );
    const container = screen.container.querySelector('[data-slot="container"]')!;
    const before = widthOf(container);
    await screen.getByRole('button', { name: 'Increase Copies' }).click();
    await expect.poll(() => digitsOf(container)).toEqual(['1', '0']);
    await expect.poll(() => widthOf(container) - before).toBeGreaterThan(6);
    await expect.element(screen.getByRole('textbox', { name: 'Copies' })).toHaveValue('10');
  });

  it('stays typeable, and the slab fits what is typed', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <NumberField label="Copies" layout="compact" defaultValue={2} onChange={onChange} />,
    );
    const input = screen.getByRole('textbox', { name: 'Copies' });
    const container = screen.container.querySelector('[data-slot="container"]')!;
    const before = widthOf(container);
    await input.fill('12500');
    await expect.element(input).not.toHaveAttribute('data-rolling');
    expect(screen.container.querySelector('[data-slot="sizer"]')!.textContent).toBe('12500');
    expect(widthOf(container)).toBeGreaterThan(before + 20);
    const text = input.element() as HTMLInputElement;
    expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(12500);
    await expect.element(input).toHaveValue('12,500');
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(input).toHaveValue('12,501');
    await expect.element(input).toHaveAttribute('data-rolling', 'true');
  });

  it('names the compact keys from labels and mirrors them in RTL', async () => {
    const screen = await renderWithDS(
      <NumberField
        label="الضيوف"
        layout="compact"
        defaultValue={2}
        labels={{ increase: 'زيادة {label}', decrease: 'إنقاص {label}' }}
      />,
      { locale: 'ar' },
    );
    const increase = screen.getByRole('button', { name: 'زيادة الضيوف' }).element();
    const decrease = screen.getByRole('button', { name: 'إنقاص الضيوف' }).element();
    expect(decrease.getBoundingClientRect().left).toBeGreaterThan(
      increase.getBoundingClientRect().left,
    );
    await screen.getByRole('button', { name: 'زيادة الضيوف' }).click();
    await expect.element(screen.getByRole('textbox', { name: 'الضيوف' })).toHaveValue('3');
  });

  it('sizes the compact slab from plain text when motion is reduced or rolling is off', async () => {
    for (const [props, provider] of [
      [{}, { motion: 'reduced' as const }],
      [{ isAnimated: false }, {}],
    ] as const) {
      const screen = await renderWithDS(
        <div>
          <NumberField label="Copies" layout="compact" defaultValue={1284} {...props} />
          <NumberField label="Seats" defaultValue={5} isAnimated {...props} />
        </div>,
        { provider },
      );
      expect(screen.container.querySelector('[data-slot="roller"]')).toBeNull();
      await expect.element(screen.getByRole('textbox', { name: 'Seats' })).toHaveValue('5');
      await expect
        .element(screen.getByRole('textbox', { name: 'Seats' }))
        .not.toHaveAttribute('data-rolling');
      const input = screen.getByRole('textbox', { name: 'Copies' });
      await expect.element(input).not.toHaveAttribute('data-rolling');
      const sizer = screen.container.querySelector<HTMLElement>('[data-slot="sizer"]')!;
      expect(sizer.textContent).toBe('1,284');
      expect(getComputedStyle(sizer).display).not.toBe('none');
      expect(getComputedStyle(input.element()).color).not.toBe('rgba(0, 0, 0, 0)');
      const text = input.element() as HTMLInputElement;
      expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
      const key = screen.getByRole('button', { name: 'Increase Copies' }).element();
      expect(key.hasAttribute('data-reduced-motion')).toBe('motion' in provider);
      await screen.unmount();
    }
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid gap-4 p-4">
          <NumberField label="Seats" defaultValue={5} minValue={1} description="Up to 50 people." />
          <NumberField label="Seats" defaultValue={5} variant="soft" isAnimated />
          <NumberField
            label="Ticket price"
            layout="inline"
            defaultValue={1250.5}
            formatOptions={{ style: 'currency', currency: 'EUR' }}
          />
          <NumberField label="Quantity" size="lg" defaultValue={1} minValue={1} />
          <NumberField label="Quantity" size="lg" variant="soft" defaultValue={2} />
          <NumberField label="Licences" size="sm" defaultValue={8} isDisabled />
          <NumberField
            label={
              <>
                Retry limit <span className="text-on-surface-variant">(per job)</span>
              </>
            }
            layout="inline"
            size="lg"
            defaultValue={3}
            isReadOnly
          />
          <NumberField
            label="Guests"
            size="lg"
            isInvalid
            errorMessage="Enter at least one guest."
          />
          <NumberField label="Quantity" variant="soft" size="sm" defaultValue={1} minValue={1} />
          <NumberField label="Copies" variant="soft" defaultValue={12} isAnimated />
          <NumberField label="Tickets" variant="soft" size="lg" defaultValue={2} isReadOnly />
          <NumberField label="Retries" variant="soft" layout="inline" size="sm" defaultValue={2} />
          <NumberField label="Guests" layout="compact" defaultValue={2} minValue={1} />
          <NumberField label="Copies" layout="compact" variant="soft" size="lg" defaultValue={98} />
          <NumberField
            aria-label="Prints"
            layout="compact"
            size="sm"
            defaultValue={0}
            minValue={0}
          />
          <NumberField
            label="Ticket price"
            layout="compact"
            defaultValue={12.5}
            formatOptions={{ style: 'currency', currency: 'EUR' }}
          />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
