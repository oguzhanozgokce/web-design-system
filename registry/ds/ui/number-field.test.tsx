import { useState } from 'react';
import { Form } from 'react-aria-components';
import { cdp, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { NumberField } from '@/registry/ds/ui/number-field';

describe('NumberField', () => {
  it('renders a labelled number input between named stepper buttons', async () => {
    const screen = await renderWithDS(<NumberField label="Seats" defaultValue={5} />);
    const input = screen.getByRole('textbox', { name: 'Seats' });
    await expect.element(input).toHaveValue('5');
    await expect.element(input).toHaveAttribute('aria-roledescription');
    const decrease = screen.getByRole('button', { name: 'Decrease Seats' });
    const increase = screen.getByRole('button', { name: 'Increase Seats' });
    await expect.element(decrease).toHaveAttribute('tabindex', '-1');
    await expect.element(increase).toHaveAttribute('tabindex', '-1');
    const root = screen.container.querySelector('[data-slot="number-field"]')!;
    expect(root.getAttribute('data-layout')).toBe('stepper');
    expect(root.getAttribute('data-size')).toBe('md');
    const container = root.querySelector('[data-slot="container"]')!;
    expect([...container.children].map((child) => child.getAttribute('data-slot'))).toEqual([
      'decrement',
      'value',
      'increment',
    ]);
  });

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

  it('steps with the arrow keys and jumps to the bounds with Home and End', async () => {
    const screen = await renderWithDS(
      <NumberField
        label="Session timeout"
        defaultValue={30}
        minValue={5}
        maxValue={120}
        step={5}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Session timeout' });
    await input.click();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(input).toHaveValue('35');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect.element(input).toHaveValue('25');
    await userEvent.keyboard('{End}');
    await expect.element(input).toHaveValue('120');
    await userEvent.keyboard('{Home}');
    await expect.element(input).toHaveValue('5');
  });

  it('disables the button at each bound', async () => {
    const screen = await renderWithDS(
      <NumberField label="Guests" defaultValue={1} minValue={1} maxValue={2} />,
    );
    const decrease = screen.getByRole('button', { name: 'Decrease Guests' });
    const increase = screen.getByRole('button', { name: 'Increase Guests' });
    await expect.element(decrease).toHaveAttribute('data-disabled', 'true');
    await expect.element(increase).not.toHaveAttribute('data-disabled');
    await increase.click();
    await expect.element(increase).toHaveAttribute('data-disabled', 'true');
    await expect.element(decrease).not.toHaveAttribute('data-disabled');
  });

  it('commits typed text on blur and on Enter, clamped to the range', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <NumberField label="Seats" defaultValue={5} maxValue={50} onChange={onChange} />,
    );
    const input = screen.getByRole('textbox', { name: 'Seats' });
    await input.fill('12');
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(12);
    await input.fill('80');
    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(50);
    await expect.element(input).toHaveValue('50');
  });

  it('formats currency, percentages and units for the locale', async () => {
    const screen = await renderWithDS(
      <div>
        <NumberField
          label="Ticket price"
          defaultValue={1250.5}
          formatOptions={{ style: 'currency', currency: 'EUR' }}
        />
        <NumberField label="Discount" defaultValue={0.15} formatOptions={{ style: 'percent' }} />
        <NumberField
          label="Parcel weight"
          defaultValue={2.5}
          formatOptions={{ style: 'unit', unit: 'kilogram' }}
        />
      </div>,
    );
    await expect
      .element(screen.getByRole('textbox', { name: 'Ticket price' }))
      .toHaveValue('€1,250.50');
    await expect.element(screen.getByRole('textbox', { name: 'Discount' })).toHaveValue('15%');
    await expect
      .element(screen.getByRole('textbox', { name: 'Parcel weight' }))
      .toHaveValue('2.5 kg');
  });

  it('formats the number for the locale and names the steppers from labels', async () => {
    const screen = await renderWithDS(
      <NumberField
        label="Ticketpreis"
        defaultValue={1250.5}
        formatOptions={{ style: 'currency', currency: 'EUR' }}
        labels={{ increase: '{label} erhöhen', decrease: '{label} verringern' }}
      />,
      { locale: 'de' },
    );
    await expect
      .element(screen.getByRole('textbox', { name: 'Ticketpreis' }))
      .toHaveValue('1.250,50 €');
    await expect
      .element(screen.getByRole('button', { name: 'Ticketpreis erhöhen' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Ticketpreis verringern' }))
      .toBeInTheDocument();
  });

  it('puts the label where the template puts it, from DSProvider or a function', async () => {
    const provided = await renderWithDS(<NumberField label="Koltuk" defaultValue={3} />, {
      provider: {
        labels: {
          numberField: { increase: '{label} değerini artır', decrease: '{label} değerini azalt' },
        },
      },
    });
    await expect
      .element(provided.getByRole('button', { name: 'Koltuk değerini azalt' }))
      .toBeInTheDocument();
    await expect
      .element(provided.getByRole('button', { name: 'Koltuk değerini artır' }))
      .toBeInTheDocument();
    await provided.unmount();

    const computed = await renderWithDS(
      <NumberField
        aria-label="Nights"
        defaultValue={3}
        labels={{ increase: ({ label }) => `Add one to ${label.toLowerCase()}` }}
      />,
    );
    await expect
      .element(computed.getByRole('button', { name: 'Add one to nights' }))
      .toBeInTheDocument();
    await expect
      .element(computed.getByRole('button', { name: 'Decrease Nights' }))
      .toBeInTheDocument();
  });

  it('names the steppers from a label that is not plain text', async () => {
    const english = await renderWithDS(
      <NumberField
        label={
          <>
            Seats <span className="text-on-surface-variant">(team plan)</span>
          </>
        }
        defaultValue={3}
      />,
    );
    await expect
      .element(english.getByRole('button', { name: 'Increase Seats (team plan)' }))
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

  it('passes the Field labels through to the label', async () => {
    const screen = await renderWithDS(
      <NumberField
        label="Seats"
        necessityIndicator="label"
        defaultValue={5}
        labels={{ optional: '(leave empty for unlimited)' }}
      />,
    );
    await expect
      .element(screen.getByRole('textbox', { name: 'Seats (leave empty for unlimited)' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Increase Seats' }))
      .toBeInTheDocument();
  });

  it('names the steppers from aria-label and keeps explicit stepper labels', async () => {
    const screen = await renderWithDS(
      <div>
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
      .element(screen.getByRole('button', { name: 'Increase Copies, poster' }))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('textbox', { name: 'Guests' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Decrease Guests' }))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Add a night' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Remove a night' }))
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

  it('separates the steppers with hairlines and fills them on hover', async () => {
    const screen = await renderWithDS(
      <>
        <span data-testid="neutral" className="bg-neutral-soft" />
        <NumberField label="Copies" defaultValue={2} />
        <NumberField label="Retries" layout="inline" defaultValue={2} />
      </>,
    );
    const decrease = screen.getByRole('button', { name: 'Decrease Copies' });
    const increase = screen.getByRole('button', { name: 'Increase Copies' });
    expect(getComputedStyle(decrease.element()).borderInlineEndWidth).toBe('1px');
    expect(getComputedStyle(increase.element()).borderInlineStartWidth).toBe('1px');
    const steppers = screen.container.querySelector('[data-slot="steppers"]')!;
    expect(getComputedStyle(steppers).borderInlineStartWidth).toBe('1px');
    expect(
      getComputedStyle(screen.getByRole('button', { name: 'Increase Retries' }).element())
        .borderBottomWidth,
    ).toBe('1px');

    await userEvent.hover(increase);
    await expect.element(increase).toHaveAttribute('data-hovered', 'true');
    await expect
      .poll(() => getComputedStyle(increase.element()).backgroundColor)
      .toBe(getComputedStyle(screen.getByTestId('neutral').element()).backgroundColor);
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

  it('rolls the digits in the soft variant', async () => {
    const screen = await renderWithDS(
      <NumberField label="Quantity" variant="soft" defaultValue={3} isAnimated />,
    );
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    await expect.element(input).toHaveAttribute('data-rolling', 'true');
    expect(screen.container.querySelector('[data-slot="roller"] number-flow-react')).not.toBeNull();
    await screen.getByRole('button', { name: 'Increase Quantity' }).click();
    await expect.element(input).toHaveValue('4');
  });

  it('keeps the soft field outlined in forced colours mode', async () => {
    const screen = await renderWithDS(
      <NumberField label="Quantity" variant="soft" defaultValue={1} />,
    );
    const soft = screen.container.querySelector('[data-slot="container"]')!;
    expect(getComputedStyle(soft).borderTopColor).toBe('rgba(0, 0, 0, 0)');
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });
    try {
      const canvas = getComputedStyle(document.body).backgroundColor;
      const style = getComputedStyle(soft);
      expect(style.borderTopStyle).toBe('solid');
      expect(style.borderTopWidth).toBe('1px');
      expect(style.borderTopColor).not.toBe(canvas);
    } finally {
      await cdp().send('Emulation.setEmulatedMedia', { features: [] });
    }
  });

  it('blocks stepping when disabled or read only', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <div>
        <NumberField label="Seats" defaultValue={5} isDisabled onChange={onChange} />
        <NumberField label="Licences" defaultValue={8} isReadOnly onChange={onChange} />
      </div>,
    );
    await expect.element(screen.getByRole('textbox', { name: 'Seats' })).toBeDisabled();
    await screen.getByRole('button', { name: 'Increase Seats' }).click({ force: true });
    await screen.getByRole('button', { name: 'Increase Licences' }).click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
    await expect
      .element(screen.getByRole('button', { name: 'Increase Licences' }))
      .toHaveAttribute('data-disabled', 'true');
  });

  it('submits its number and shows validation errors', async () => {
    const onSubmit = vi.fn();
    const screen = await renderWithDS(
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget).get('guests'));
        }}
      >
        <NumberField
          name="guests"
          label="Guests"
          isRequired
          errorMessage="Enter how many guests are staying."
        />
        <Button type="submit">Book</Button>
      </Form>,
    );
    await screen.getByRole('button', { name: 'Book' }).click();
    await expect
      .element(screen.getByText('Enter how many guests are staying.'))
      .toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await screen.getByRole('textbox', { name: 'Guests' }).fill('4');
    await userEvent.tab();
    await screen.getByRole('button', { name: 'Book' }).click();
    expect(onSubmit).toHaveBeenCalledWith('4');
  });

  it('rolls the value while idle and shows the plain input while typing', async () => {
    const screen = await renderWithDS(<NumberField label="Seats" defaultValue={5} isAnimated />);
    const input = screen.getByRole('textbox', { name: 'Seats' });
    const roller = () => screen.container.querySelector<HTMLElement>('[data-slot="roller"]')!;
    expect(roller().getAttribute('aria-hidden')).toBe('true');
    expect(roller().querySelector('number-flow-react')).not.toBeNull();
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
    await screen.getByRole('button', { name: 'Increase Seats' }).click();
    await expect.element(input).toHaveValue('10');
    await expect.element(input).toHaveAttribute('data-rolling', 'true');
    await expect.element(roller()).toBeVisible();
  });

  it('rolls on the library spatial spring', async () => {
    const screen = await renderWithDS(<NumberField label="Seats" defaultValue={5} isAnimated />);
    const flow = screen.container.querySelector('number-flow-react') as
      (Element & { transformTiming: EffectTiming }) | null;
    expect(flow).not.toBeNull();
    expect(String(flow!.transformTiming.easing)).toMatch(/^linear\(/);
    expect(Number(flow!.transformTiming.duration)).toBeGreaterThan(200);
    expect(Number(flow!.transformTiming.duration)).toBeLessThan(700);
  });

  it('falls back to plain text when motion is reduced', async () => {
    const screen = await renderWithDS(<NumberField label="Seats" defaultValue={5} isAnimated />, {
      provider: { motion: 'reduced' },
    });
    await expect.element(screen.getByRole('textbox', { name: 'Seats' })).toHaveValue('5');
    expect(screen.container.querySelector('[data-slot="roller"]')).toBeNull();
    await expect
      .element(screen.getByRole('textbox', { name: 'Seats' }))
      .not.toHaveAttribute('data-rolling');
  });

  it('falls back to plain text in RTL when symbols would change order', async () => {
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
    const rollers = arabic.container.querySelectorAll('[data-slot="number-field"]');
    expect(rollers[0].querySelector('[data-slot="roller"]')).not.toBeNull();
    expect(rollers[1].querySelector('[data-slot="roller"]')).toBeNull();
  });

  it('falls back to plain text in locales that use other digits', async () => {
    const screen = await renderWithDS(
      <NumberField label="المقاعد" defaultValue={25} isAnimated />,
      { locale: 'ar-EG' },
    );
    const input = screen.getByRole('textbox', { name: 'المقاعد' });
    await expect.element(input).toHaveValue('٢٥');
    expect(screen.container.querySelector('[data-slot="roller"]')).toBeNull();
    await expect.element(input).not.toHaveAttribute('data-rolling');
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

  it('rolls when Home and End jump to the bounds', async () => {
    const screen = await renderWithDS(
      <NumberField label="Seats" defaultValue={5} minValue={1} maxValue={40} isAnimated />,
    );
    const input = screen.getByRole('textbox', { name: 'Seats' });
    await input.click();
    await expect.element(input).not.toHaveAttribute('data-rolling');
    await userEvent.keyboard('{End}');
    await expect.element(input).toHaveValue('40');
    await expect.element(input).toHaveAttribute('data-rolling', 'true');
    await userEvent.keyboard('{Home}');
    await expect.element(input).toHaveValue('1');
    await expect.element(input).toHaveAttribute('data-rolling', 'true');
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
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
