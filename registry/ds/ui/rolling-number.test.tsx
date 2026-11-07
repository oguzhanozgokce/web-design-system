import { spring } from 'motion/react';
import { StrictMode, useState } from 'react';
import { odometerSpring } from '@/registry/ds/lib/odometer';
import { spatialSpring } from '@/registry/ds/lib/motion';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { RollingNumber, type RollingNumberProps } from '@/registry/ds/ui/rolling-number';

function columnsOf(container: Element) {
  return [...container.querySelectorAll<HTMLElement>('[data-slot="rolling-number-digit"]')];
}

function stripOf(column: HTMLElement) {
  return column.lastElementChild as HTMLElement;
}

function offsetOf(column: HTMLElement) {
  const strip = stripOf(column);
  const cell = strip.getBoundingClientRect().height / 11;
  return -new DOMMatrix(getComputedStyle(strip).transform).m42 / cell;
}

function settledOffsets(container: Element) {
  return columnsOf(container).map((column) => (Math.round(offsetOf(column) * 100) / 100) % 10 || 0);
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

interface CounterProps extends Omit<RollingNumberProps, 'value'> {
  initial: number;
  step: number;
}

function Counter({ initial, step, ...props }: CounterProps) {
  const [value, setValue] = useState(initial);
  return (
    <div className="text-4xl">
      <button type="button" onClick={() => setValue((current) => current + step)}>
        Next
      </button>
      <button type="button" onClick={() => setValue((current) => current - step)}>
        Back
      </button>
      <RollingNumber {...props} value={value} />
    </div>
  );
}

function press(container: Element, name: string) {
  const button = [...container.querySelectorAll('button')].find(
    (item) => item.textContent === name,
  );
  button!.click();
}

describe('RollingNumber', () => {
  it('reads the formatted value to screen readers and hides the strips', async () => {
    const screen = await renderWithDS(
      <RollingNumber
        value={1234.5}
        formatOptions={{ style: 'currency', currency: 'USD' }}
        id="storage"
        className="text-2xl"
      />,
    );
    const root = screen.container.querySelector<HTMLElement>('[data-slot="rolling-number"]')!;
    expect(root.id).toBe('storage');
    expect(root.className).toContain('text-2xl');
    await expect.element(screen.getByText('$1,234.50')).toBeInTheDocument();
    expect(root.querySelector('.sr-only')!.textContent).toBe('$1,234.50');
    const visual = root.querySelector('[data-slot="rolling-number-value"]')!;
    expect(visual.getAttribute('aria-hidden')).toBe('true');
    expect(root.textContent!.startsWith('$1,234.50')).toBe(true);

    const columns = columnsOf(root);
    expect(columns.map((column) => column.firstElementChild!.textContent)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '0',
    ]);
    columns.forEach((column) => expect(stripOf(column).children).toHaveLength(11));
  });

  it('shows every digit in its window on the first render, without rolling', async () => {
    const screen = await renderWithDS(<RollingNumber value={9024} />);
    expect(settledOffsets(screen.container)).toEqual([9, 0, 2, 4]);
    await nextFrame();
    expect(settledOffsets(screen.container)).toEqual([9, 0, 2, 4]);
  });

  it('rolls each column forward through its carry, never back through 8 to 0', async () => {
    const screen = await renderWithDS(<Counter initial={9} step={1} />);
    press(screen.container, 'Next');
    const ones: number[] = [];
    for (let frame = 0; frame < 45; frame++) {
      await nextFrame();
      const columns = columnsOf(screen.container);
      ones.push(offsetOf(columns[columns.length - 1]));
    }
    expect(ones.some((offset) => offset > 9.2 && offset < 10)).toBe(true);
    expect(ones.filter((offset) => offset > 0.5 && offset < 8.5)).toEqual([]);
    await expect.poll(() => settledOffsets(screen.container)).toEqual([1, 0]);
    await expect
      .poll(() =>
        columnsOf(screen.container).map((column) => getComputedStyle(stripOf(column)).filter),
      )
      .toEqual(['none', 'none']);
  });

  it('lands on the last value when it changes again before a roll starts', async () => {
    const screen = await renderWithDS(<Counter initial={99} step={1} />);
    const root = screen.container.querySelector('[data-slot="rolling-number"]')!;
    for (const name of ['Next', 'Back', 'Next', 'Back', 'Next', 'Next']) {
      press(screen.container, name);
      await nextFrame();
    }
    await expect.poll(() => columnsOf(root)).toHaveLength(3);
    await expect.poll(() => settledOffsets(root)).toEqual([1, 0, 1]);
  });

  it('lands a long roll without overshooting into the next digit', () => {
    const base = spatialSpring('fast');
    expect(odometerSpring(base, 1)).toBe(base);
    for (const travel of [1, 3, 8, 24, -24]) {
      const generator = spring({ keyframes: [0, travel], ...odometerSpring(base, travel) });
      let furthest = 0;
      for (let time = 0; time < 2000; time += 4) {
        furthest = Math.max(furthest, generator.next(time).value * Math.sign(travel));
      }
      expect(furthest - Math.abs(travel)).toBeLessThanOrEqual(0.31);
      expect(furthest - Math.abs(travel)).toBeGreaterThan(0);
    }
  });

  it('widens as a digit arrives and narrows as one leaves', async () => {
    const screen = await renderWithDS(<Counter initial={999} step={1} />);
    const root = screen.container.querySelector<HTMLElement>('[data-slot="rolling-number"]')!;
    const before = root.getBoundingClientRect().width;
    press(screen.container, 'Next');
    await nextFrame();
    await nextFrame();
    const arriving = columnsOf(root)[0];
    expect(columnsOf(root)).toHaveLength(4);
    expect(arriving.getBoundingClientRect().width).toBeLessThan(4);
    await expect.poll(() => settledOffsets(root)).toEqual([1, 0, 0, 0]);
    await expect
      .poll(() => arriving.getBoundingClientRect().width)
      .toBeCloseTo(columnsOf(root)[1].getBoundingClientRect().width, 0);
    expect(root.getBoundingClientRect().width).toBeGreaterThan(before);
    expect(root.querySelectorAll('[data-slot="rolling-number-separator"]')).toHaveLength(1);

    press(screen.container, 'Back');
    await nextFrame();
    await nextFrame();
    expect(columnsOf(root)).toHaveLength(4);
    await expect.poll(() => columnsOf(root)).toHaveLength(3);
    await expect
      .poll(() => root.querySelectorAll('[data-slot="rolling-number-separator"]'))
      .toHaveLength(0);
    await expect.poll(() => settledOffsets(root)).toEqual([9, 9, 9]);
    await expect.poll(() => root.getBoundingClientRect().width).toBeCloseTo(before, 0);
  });

  it('keeps group separators, decimals, signs and symbols for the locale', async () => {
    const screen = await renderWithDS(
      <div>
        <RollingNumber data-testid="de" value={1234.5} />
        <RollingNumber
          data-testid="percent"
          value={-0.125}
          formatOptions={{ style: 'percent', maximumFractionDigits: 1 }}
        />
        <RollingNumber
          data-testid="unit"
          value={2.5}
          formatOptions={{ style: 'unit', unit: 'kilogram', unitDisplay: 'long' }}
        />
      </div>,
      { locale: 'de' },
    );
    const text = (id: string) =>
      screen.getByTestId(id).element().querySelector('.sr-only')!.textContent;
    expect(text('de')).toBe(new Intl.NumberFormat('de').format(1234.5));
    expect(text('percent')).toBe(
      new Intl.NumberFormat('de', { style: 'percent', maximumFractionDigits: 1 }).format(-0.125),
    );
    expect(text('unit')).toBe(
      new Intl.NumberFormat('de', { style: 'unit', unit: 'kilogram', unitDisplay: 'long' }).format(
        2.5,
      ),
    );
    const percent = screen.getByTestId('percent').element();
    expect(percent.querySelector('[data-slot="rolling-number-sign"]')!.textContent).toBe('-');
    expect(
      [
        ...screen
          .getByTestId('de')
          .element()
          .querySelectorAll('[data-slot="rolling-number-separator"]'),
      ].map((separator) => separator.textContent),
    ).toEqual(['.', ',']);
  });

  it('rolls the digits of the locale numbering system', async () => {
    const screen = await renderWithDS(<RollingNumber value={1250} />, { locale: 'ar-EG' });
    const root = screen.container.querySelector('[data-slot="rolling-number"]')!;
    expect(root.querySelector('.sr-only')!.textContent).toBe('١٬٢٥٠');
    const columns = columnsOf(root);
    expect(columns.map((column) => column.firstElementChild!.textContent)).toEqual([
      '١',
      '٢',
      '٥',
      '٠',
    ]);
    expect([...stripOf(columns[0]).children].map((cell) => cell.textContent).join('')).toBe(
      '٠١٢٣٤٥٦٧٨٩٠',
    );
    expect(settledOffsets(root)).toEqual([1, 2, 5, 0]);
  });

  it('places symbols and signs where the plain text puts them in right-to-left locales', async () => {
    const cases: [number, Intl.NumberFormatOptions, string][] = [
      [120, { style: 'currency', currency: 'SAR' }, 'currency'],
      [0.15, { style: 'percent' }, 'percentSign'],
      [-5, {}, 'minusSign'],
      [-1234.5, { style: 'currency', currency: 'EGP' }, 'currency'],
    ];
    for (const locale of ['ar', 'ar-EG']) {
      const screen = await renderWithDS(
        <div className="grid text-2xl">
          {cases.map(([value, options], index) => (
            <div key={index} data-case={index} className="flex justify-between gap-4">
              <RollingNumber value={value} formatOptions={options} />
              <span data-plain="">{new Intl.NumberFormat(locale, options).format(value)}</span>
            </div>
          ))}
        </div>,
        { locale },
      );
      cases.forEach(([value, options, symbolType], index) => {
        const row = screen.container.querySelector(`[data-case="${index}"]`)!;
        const parts = new Intl.NumberFormat(locale, options).formatToParts(value);
        const symbol = parts.find((part) => part.type === symbolType)!.value;
        const firstDigit = parts.find((part) => part.type === 'integer')!.value;
        const plain = row.querySelector('[data-plain]')!.firstChild as Text;
        const rangeOf = (text: string) => {
          const range = document.createRange();
          const start = plain.data.indexOf(text);
          range.setStart(plain, start);
          range.setEnd(plain, start + text.length);
          return range.getBoundingClientRect();
        };
        const plainSymbolFirst = rangeOf(symbol).left < rangeOf(firstDigit).left;
        const digits = row
          .querySelector('[data-slot="rolling-number-digits"]')!
          .getBoundingClientRect();
        const symbolElement = [
          ...row.querySelectorAll('[data-slot="rolling-number-value"] > span'),
        ].find((element) => element.textContent === symbol)!;
        const rolledSymbolFirst = symbolElement.getBoundingClientRect().left < digits.left;
        expect(`${locale} ${symbolType} ${rolledSymbolFirst}`).toBe(
          `${locale} ${symbolType} ${plainSymbolFirst}`,
        );
      });
      await screen.unmount();
    }
  });

  it('snaps to the new value when motion is reduced or animation is off', async () => {
    for (const [props, provider] of [
      [{}, { motion: 'reduced' as const }],
      [{ isAnimated: false }, {}],
    ] as const) {
      const screen = await renderWithDS(<Counter initial={9} step={1} {...props} />, { provider });
      const root = screen.container.querySelector('[data-slot="rolling-number"]')!;
      expect(root.hasAttribute('data-animated')).toBe(false);
      press(screen.container, 'Next');
      await nextFrame();
      await nextFrame();
      expect(settledOffsets(root)).toEqual([1, 0]);
      const [tens, ones] = columnsOf(root);
      expect(tens.getBoundingClientRect().width).toBeCloseTo(ones.getBoundingClientRect().width, 0);
      expect(stripOf(ones).style.filter).not.toContain('blur');
      await screen.unmount();
    }
  });

  it('marks itself animated and still rolls an arriving digit under StrictMode', async () => {
    const screen = await renderWithDS(
      <StrictMode>
        <Counter initial={9} step={1} />
      </StrictMode>,
    );
    const root = screen.container.querySelector('[data-slot="rolling-number"]')!;
    expect(root.getAttribute('data-animated')).toBe('true');
    press(screen.container, 'Next');
    const tens: number[] = [];
    for (let frame = 0; frame < 30; frame++) {
      await nextFrame();
      const columns = columnsOf(root);
      if (columns.length === 2) tens.push(offsetOf(columns[0]));
    }
    expect(tens.some((offset) => offset > 0.1 && offset < 0.9)).toBe(true);
    await expect.poll(() => settledOffsets(root)).toEqual([1, 0]);
  });

  it('renders text it cannot roll as it is', async () => {
    const screen = await renderWithDS(
      <div>
        <RollingNumber data-testid="nan" value={Number.NaN} />
        <RollingNumber data-testid="compact" value={1250} formatOptions={{ notation: 'compact' }} />
      </div>,
    );
    const nan = screen.getByTestId('nan').element();
    expect(columnsOf(nan)).toHaveLength(0);
    expect(nan.querySelector('.sr-only')!.textContent).toBe('NaN');
    const compact = screen.getByTestId('compact').element();
    expect(compact.querySelector('.sr-only')!.textContent).toBe('1.3K');
    expect(columnsOf(compact)).toHaveLength(2);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid gap-2 p-4">
          <p className="text-sm text-on-surface">
            Downloads <RollingNumber value={12840} /> this week
          </p>
          <p className="text-4xl font-semibold text-on-surface">
            <RollingNumber value={0.42} formatOptions={{ style: 'percent' }} />
          </p>
          <p className="text-sm text-on-surface-variant">
            <RollingNumber value={-3.5} formatOptions={{ style: 'unit', unit: 'gigabyte' }} />
          </p>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
