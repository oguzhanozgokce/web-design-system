import { useState } from 'react';
import { cdp, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Slider } from '@/registry/ds/ui/slider';

function parts(slot: string, root: ParentNode = document) {
  return [...root.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`)];
}

const gigabytes = { style: 'unit', unit: 'gigabyte', maximumFractionDigits: 0 } as const;

describe('Slider', () => {
  it('renders a labelled slider with a formatted value', async () => {
    const screen = await renderWithDS(
      <Slider
        label="Storage limit"
        description="Uploads above this are paused."
        defaultValue={1500}
        maxValue={5000}
        step={100}
        formatOptions={gigabytes}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Storage limit' });
    await expect.element(slider).toHaveAttribute('aria-valuetext', '1,500 GB');
    await expect.element(slider).toHaveAccessibleDescription('Uploads above this are paused.');
    await expect.element(screen.getByRole('status')).toHaveTextContent('1,500 GB');
    await expect.element(screen.getByRole('group')).toHaveAttribute('data-size', 'md');
    await expect
      .element(screen.getByRole('group'))
      .toHaveAttribute('data-orientation', 'horizontal');
  });

  it('supports a controlled value', async () => {
    function Controlled() {
      const [value, setValue] = useState(20);
      return (
        <>
          <Slider label="Opacity" value={value} onChange={setValue} step={5} />
          <p data-testid="echo">{value}</p>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(screen.getByTestId('echo')).toHaveTextContent('25');
  });

  it('renders a range with named thumbs and a formatted range', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <Slider
        label="File size"
        defaultValue={[120, 480]}
        maxValue={1000}
        step={10}
        formatOptions={gigabytes}
        onChange={onChange}
      />,
    );
    const minimum = screen.getByRole('slider', { name: 'Minimum File size' });
    const maximum = screen.getByRole('slider', { name: 'Maximum File size' });
    await expect.element(minimum).toHaveAttribute('aria-valuetext', '120 GB');
    await expect.element(maximum).toHaveAttribute('aria-valuetext', '480 GB');
    expect(parts('output')[0].textContent).toMatch(/^120\s*(GB)?\s*–\s*480\s*GB$/);
    await expect.element(minimum).toHaveAttribute('max', '480');

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith([130, 480]);
    expect(parts('segment').map((segment) => segment.dataset.tone)).toEqual([
      'inactive',
      'active',
      'inactive',
    ]);
  });

  it('takes the thumb names from thumbLabels, then labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <>
        <Slider label="Size" defaultValue={[10, 90]} />
        <Slider
          label="File size"
          defaultValue={[120, 480]}
          maxValue={1000}
          labels={{ minimum: 'From' }}
        />
        <Slider
          label="Support hours"
          defaultValue={[8, 18]}
          maxValue={24}
          thumbLabels={['Opens', 'Closes']}
          labels={{ minimum: 'From' }}
        />
      </>,
      { provider: { labels: { slider: { minimum: 'Lowest', maximum: 'Highest' } } } },
    );
    await expect.element(screen.getByRole('slider', { name: 'Lowest Size' })).toBeInTheDocument();
    await expect.element(screen.getByRole('slider', { name: 'Highest Size' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('slider', { name: 'From File size' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('slider', { name: 'Highest File size' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('slider', { name: 'Opens Support hours' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('slider', { name: 'Closes Support hours' }))
      .toBeInTheDocument();
  });

  it('keeps a consumer description next to its own', async () => {
    const screen = await renderWithDS(
      <>
        <p id="plan-note">Your plan allows up to 5,000.</p>
        <Slider
          label="Storage limit"
          description="Uploads above this are paused."
          aria-describedby="plan-note"
          defaultValue={1500}
          maxValue={5000}
        />
      </>,
    );
    await expect
      .element(screen.getByRole('slider'))
      .toHaveAccessibleDescription('Uploads above this are paused. Your plan allows up to 5,000.');
  });

  it('moves the closest thumb of a range when the track is clicked', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <div className="w-80">
        <Slider label="File size" defaultValue={[20, 60]} onChange={onChange} />
      </div>,
    );
    const track = screen.getByRole('group').element().querySelector('[data-slot="track"]')!;
    const { width, height } = track.getBoundingClientRect();
    await userEvent.click(track, { position: { x: width * 0.9, y: height / 2 } });
    expect(onChange).toHaveBeenLastCalledWith([20, 90]);
    await userEvent.click(track, { position: { x: width * 0.1, y: height / 2 } });
    expect(onChange).toHaveBeenLastCalledWith([10, 90]);
  });

  it('shows stops automatically when the step leaves few positions, unless showStops says otherwise', async () => {
    const screen = await renderWithDS(
      <>
        <Slider label="Message retries" defaultValue={3} maxValue={8} />
        <Slider label="Volume" defaultValue={30} />
        <Slider label="Retry limit" defaultValue={3} maxValue={8} showStops={false} />
        <Slider label="Balance" defaultValue={30} step={10} marks={[0, 50, 100]} showStops />
      </>,
    );
    const counts = screen
      .getByRole('group')
      .elements()
      .map((group) => [
        parts('stop', group).length,
        parts('stop', group).filter((stop) => stop.dataset.tone === 'active').length,
      ]);
    expect(counts).toEqual([
      [9, 4],
      [0, 0],
      [0, 0],
      [11, 4],
    ]);
  });

  it('renders mark labels formatted like the value and custom labels', async () => {
    const screen = await renderWithDS(
      <>
        <Slider
          label="Log retention"
          defaultValue={30}
          minValue={7}
          maxValue={90}
          marks={[7, 30, 90]}
          formatOptions={{ style: 'unit', unit: 'day', unitDisplay: 'long' }}
        />
        <Slider
          label="Support priority"
          defaultValue={1}
          maxValue={2}
          marks={[
            { value: 0, label: 'Standard' },
            { value: 2, label: 'Dedicated' },
          ]}
        />
      </>,
    );
    await expect.element(screen.getByText('30 days', { exact: true }).first()).toBeVisible();
    await expect.element(screen.getByText('Dedicated')).toBeVisible();
    const [retention] = screen.getByRole('group').elements();
    expect(parts('mark', retention)).toHaveLength(3);
  });

  it('shows one value, without a tilde, when both range thumbs meet, and keeps the first thumb reachable at the maximum', async () => {
    await renderWithDS(
      <div className="w-80">
        <Slider
          label="Size"
          defaultValue={[1000, 1000]}
          maxValue={1000}
          formatOptions={gigabytes}
        />
      </div>,
    );
    expect(parts('output')[0].textContent).toBe('1,000 GB');
    const [first] = parts('thumb');
    const box = first.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    expect(first.contains(hit)).toBe(true);
  });

  it('fills from the offset for a centred slider and marks the offset with a stop', async () => {
    await renderWithDS(
      <div className="w-80">
        <Slider
          label="Exposure"
          defaultValue={-0.1}
          minValue={-0.2}
          maxValue={0.2}
          step={0.01}
          fillOffset={0}
          showValueIndicator={false}
          formatOptions={{ style: 'percent', signDisplay: 'exceptZero' }}
        />
      </div>,
    );
    const segments = parts('segment');
    expect(segments.map((segment) => segment.dataset.tone)).toEqual([
      'inactive',
      'active',
      'inactive',
    ]);
    const rail = parts('rail')[0].getBoundingClientRect();
    const active = segments[1].getBoundingClientRect();
    expect(Math.round(active.right)).toBe(Math.round(rail.left + rail.width / 2));
    expect(active.width).toBeGreaterThan(0);
    const stops = parts('stop');
    expect(stops).toHaveLength(1);
    const stop = stops[0].getBoundingClientRect();
    expect(stop.left + stop.width / 2).toBeCloseTo(rail.left + rail.width / 2, 0);
    expect(stops[0].dataset.tone).toBe('active');
  });

  it('draws a thin rail whose fill meets the centre of a round thumb', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col gap-6">
        <Slider label="Small" size="sm" defaultValue={25} />
        <Slider label="Medium" defaultValue={25} />
        <Slider label="Large" size="lg" defaultValue={25} />
      </div>,
      { provider: { motion: 'disabled' } },
    );
    const sliders = screen.getByRole('group').elements();
    const geometry = sliders.map((slider) => {
      const rail = parts('rail', slider)[0].getBoundingClientRect();
      const thumb = parts('thumb', slider)[0].getBoundingClientRect();
      return { rail: rail.height, thumb: [thumb.width, thumb.height] };
    });
    expect(geometry).toEqual([
      { rail: 4, thumb: [16, 16] },
      { rail: 4, thumb: [20, 20] },
      { rail: 6, thumb: [24, 24] },
    ]);
    const medium = sliders[1];
    const [active] = parts('segment', medium);
    const thumb = parts('thumb', medium)[0].getBoundingClientRect();
    expect(active.dataset.tone).toBe('active');
    expect(active.getBoundingClientRect().right).toBeCloseTo(thumb.left + thumb.width / 2, 0);
    const rail = parts('rail', medium)[0].getBoundingClientRect();
    expect(
      parseFloat(getComputedStyle(parts('thumb', medium)[0]).borderRadius),
    ).toBeGreaterThanOrEqual(thumb.width / 2);
    expect(thumb.top + thumb.height / 2).toBeCloseTo(rail.top + rail.height / 2, 0);
  });

  it('fills the range with the solid primary on a grey rail', async () => {
    const screen = await renderWithDS(
      <>
        <span data-testid="primary" className="bg-primary-solid" />
        <span data-testid="grey" className="bg-outline-variant" />
        <span data-testid="thumb" className="bg-surface-thumb" />
        <Slider label="Opacity" defaultValue={40} />
      </>,
    );
    const fill = (testId: string) =>
      getComputedStyle(screen.getByTestId(testId).element()).backgroundColor;
    const [active, inactive] = parts('segment');
    expect(getComputedStyle(active).backgroundColor).toBe(fill('primary'));
    expect(getComputedStyle(inactive).backgroundColor).toBe(fill('grey'));
    expect(getComputedStyle(parts('thumb')[0]).backgroundColor).toBe(fill('thumb'));
  });

  it.each([
    ['en', {}],
    ['ar', { locale: 'ar' }],
  ])(
    'shows the value bubble on keyboard focus and keeps it inside the slider at both ends in %s',
    async (_, options) => {
      const screen = await renderWithDS(
        <div style={{ width: 240 }}>
          <Slider
            aria-label="Upload size"
            defaultValue={1024}
            maxValue={2048}
            formatOptions={{ style: 'unit', unit: 'kilobyte', unitDisplay: 'long' }}
          />
        </div>,
        { ...options, provider: { motion: 'disabled' } },
      );
      const slider = screen.getByRole('slider');
      const root = parts('slider')[0].getBoundingClientRect();
      const bubble = parts('bubble')[0];
      expect(getComputedStyle(bubble).opacity).toBe('0');
      await userEvent.tab();
      await expect.element(slider).toHaveFocus();
      expect(getComputedStyle(bubble).opacity).toBe('1');
      expect(bubble.textContent).toBe(slider.element().getAttribute('aria-valuetext'));
      const middle = bubble.getBoundingClientRect();
      const centre = parts('thumb')[0].getBoundingClientRect();
      expect(middle.left + middle.width / 2).toBeCloseTo(centre.left + centre.width / 2, 0);
      for (const key of ['{Home}', '{End}']) {
        await userEvent.keyboard(key);
        const box = bubble.getBoundingClientRect();
        expect(box.width).toBeGreaterThan(parts('thumb')[0].getBoundingClientRect().width * 2);
        expect(box.left).toBeGreaterThanOrEqual(root.left - 0.5);
        expect(box.right).toBeLessThanOrEqual(root.right + 0.5);
      }
      await userEvent.keyboard('{PageDown}');
      const thumb = parts('thumb')[0].getBoundingClientRect();
      const box = bubble.getBoundingClientRect();
      expect(box.bottom).toBeLessThanOrEqual(thumb.top);
    },
  );

  it('fills from the inline start in RTL', async () => {
    await renderWithDS(
      <div className="w-80">
        <Slider label="الميزانية" defaultValue={25} />
      </div>,
      { locale: 'ar' },
    );
    const [active, inactive] = parts('segment');
    const rail = parts('rail')[0].getBoundingClientRect();
    const thumb = parts('thumb')[0].getBoundingClientRect();
    expect(active.dataset.tone).toBe('active');
    expect(Math.round(active.getBoundingClientRect().right)).toBe(Math.round(rail.right));
    expect(inactive.getBoundingClientRect().left).toBe(rail.left);
    expect(thumb.left).toBeGreaterThan(rail.left + rail.width / 2);
    expect(parts('slider')[0].getAttribute('dir')).toBe('rtl');
  });

  it('follows the DSProvider motion preference and the OS reduced motion setting', async () => {
    const cases = [
      { motion: 'system', scale: '0.9', bubble: 'opacity, scale', thumb: 'scale, box-shadow' },
      { motion: 'reduced', scale: '1', bubble: 'opacity, scale', thumb: 'none' },
      { motion: 'disabled', scale: '0.9', bubble: 'none', thumb: 'none' },
      { motion: 'system', reduce: true, scale: '1', thumb: 'none' },
    ] as const;
    for (const { motion, scale, thumb, ...expected } of cases) {
      const reduce = 'reduce' in expected;
      if (reduce) {
        await cdp().send('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
        });
      }
      try {
        const screen = await renderWithDS(<Slider label="Opacity" defaultValue={40} />, {
          provider: { motion },
        });
        await expect.element(screen.getByRole('slider')).toBeInTheDocument();
        const bubble = getComputedStyle(parts('bubble', screen.container)[0]);
        expect(bubble.scale).toBe(scale);
        if ('bubble' in expected) expect(bubble.transitionProperty).toBe(expected.bubble);
        expect(getComputedStyle(parts('thumb', screen.container)[0]).transitionProperty).toBe(
          thumb,
        );
        await screen.unmount();
      } finally {
        if (reduce) await cdp().send('Emulation.setEmulatedMedia', { features: [] });
      }
    }
  });

  it('opens the vertical value indicator toward the inline start in both directions', async () => {
    for (const locale of ['en', 'ar']) {
      const screen = await renderWithDS(
        <Slider orientation="vertical" label="Email" defaultValue={60} />,
        { locale, provider: { motion: 'disabled' } },
      );
      await userEvent.tab();
      await expect.element(screen.getByRole('slider')).toHaveFocus();
      const bubbleElement = parts('bubble', screen.container)[0];
      const bubble = bubbleElement.getBoundingClientRect();
      const thumb = parts('thumb', screen.container)[0].getBoundingClientRect();
      const origin = parseFloat(getComputedStyle(bubbleElement).transformOrigin.split(' ')[0]);
      if (locale === 'ar') {
        expect(bubble.left).toBeGreaterThanOrEqual(thumb.right);
        expect(origin).toBeCloseTo(0, 1);
      } else {
        expect(bubble.right).toBeLessThanOrEqual(thumb.left);
        expect(origin).toBeCloseTo(bubble.width, 1);
      }
      await screen.unmount();
    }
  });

  it('submits to a form outside its own tree through form', async () => {
    await renderWithDS(
      <>
        <form id="filters" aria-label="Filters" />
        <Slider
          label="File size"
          name="size"
          form="filters"
          defaultValue={[120, 480]}
          maxValue={1000}
        />
      </>,
    );
    const form = document.querySelector<HTMLFormElement>('#filters')!;
    expect(new FormData(form).getAll('size')).toEqual(['120', '480']);
  });

  it('can hide the value label and indicator', async () => {
    await renderWithDS(
      <Slider
        aria-label="Volume"
        defaultValue={40}
        showValueLabel={false}
        showValueIndicator={false}
      />,
    );
    expect(parts('output')).toHaveLength(0);
    expect(parts('bubble')).toHaveLength(0);
  });

  it('lays out vertically', async () => {
    await renderWithDS(
      <Slider orientation="vertical" label="Notifications per day" defaultValue={60} />,
    );
    const track = parts('track')[0].getBoundingClientRect();
    expect(track.height).toBeGreaterThan(track.width);
    const label = parts('label')[0].getBoundingClientRect();
    const output = parts('output')[0].getBoundingClientRect();
    expect(Math.abs(output.left + output.width / 2 - (label.left + label.width / 2))).toBeLessThan(
      1,
    );
  });

  it('stays visible in forced colours mode', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });
    try {
      await renderWithDS(
        <div className="flex flex-col gap-6">
          <Slider label="File size" defaultValue={[20, 60]} />
          <Slider isDisabled label="Quiet hours" defaultValue={40} />
        </div>,
      );
      const canvas = getComputedStyle(document.body).backgroundColor;
      const [enabled, disabled] = parts('slider');
      const [, active] = parts('segment', enabled);
      const [inactive] = parts('segment', enabled);
      expect(getComputedStyle(active).backgroundColor).not.toBe(canvas);
      expect(getComputedStyle(inactive).borderTopWidth).toBe('1px');
      expect(getComputedStyle(inactive).borderTopColor).not.toBe(canvas);
      expect(getComputedStyle(parts('thumb', enabled)[0]).backgroundColor).not.toBe(canvas);
      const enabledThumb = getComputedStyle(parts('thumb', enabled)[0]).backgroundColor;
      const disabledThumb = getComputedStyle(parts('thumb', disabled)[0]).backgroundColor;
      expect(disabledThumb).not.toBe(canvas);
      expect(disabledThumb).not.toBe(enabledThumb);
      await userEvent.tab();
      const focused = getComputedStyle(parts('thumb', enabled)[0]);
      expect(focused.outlineStyle).toBe('solid');
      expect(focused.outlineColor).not.toBe(canvas);
      const bubble = getComputedStyle(parts('bubble', enabled)[0]);
      expect(bubble.borderTopWidth).toBe('1px');
      expect(bubble.color).not.toBe(bubble.backgroundColor);
    } finally {
      await cdp().send('Emulation.setEmulatedMedia', { features: [] });
    }
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex w-96 flex-col gap-6 p-4">
          <Slider
            label="Storage limit"
            description="Uploads above this are paused."
            defaultValue={1500}
            maxValue={5000}
            step={100}
            formatOptions={gigabytes}
          />
          <Slider label="File size" defaultValue={[120, 480]} maxValue={1000} size="sm" />
          <Slider
            label="Log retention"
            defaultValue={30}
            minValue={7}
            maxValue={90}
            marks={[7, 30, 60, 90]}
            size="lg"
            formatOptions={{ style: 'unit', unit: 'day', unitDisplay: 'long' }}
          />
          <Slider
            isDisabled
            label="Quiet hours"
            defaultValue={[20, 60]}
            description="Set by your administrator."
          />
          <Slider orientation="vertical" label="Email" defaultValue={60} marks={[0, 50, 100]} />
          <Slider
            label="Exposure"
            defaultValue={0}
            minValue={-0.2}
            maxValue={0.2}
            step={0.01}
            fillOffset={0}
            marks={[-0.2, 0, 0.2]}
            formatOptions={{ style: 'percent', signDisplay: 'exceptZero' }}
          />
        </div>,
        options,
      );
      await expect.element(screen.getByRole('slider').first()).toBeInTheDocument();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
