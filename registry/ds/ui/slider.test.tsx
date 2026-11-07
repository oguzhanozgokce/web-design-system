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

  it('moves with the keyboard and reports changes', async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const screen = await renderWithDS(
      <Slider
        label="Seats"
        defaultValue={8}
        maxValue={50}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Seats' });
    await userEvent.tab();
    await expect.element(slider).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(9);
    expect(onChangeEnd).toHaveBeenLastCalledWith(9);

    await userEvent.keyboard('{End}');
    await expect.element(slider).toHaveValue('50');
    await userEvent.keyboard('{Home}');
    await expect.element(slider).toHaveValue('0');
  });

  it('moves the closest thumb when the track is clicked', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <div className="w-80">
        <Slider aria-label="Volume" defaultValue={10} onChange={onChange} />
      </div>,
    );
    const track = screen.getByRole('group').element().querySelector('[data-slot="track"]')!;
    const { width, height } = track.getBoundingClientRect();
    await userEvent.click(track, { position: { x: width * 0.75, y: height / 2 } });
    expect(onChange).toHaveBeenLastCalledWith(75);
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

  it('names range thumbs Minimum and Maximum by default', async () => {
    const screen = await renderWithDS(<Slider label="Size" defaultValue={[10, 90]} />);
    await expect.element(screen.getByRole('slider', { name: 'Minimum Size' })).toBeInTheDocument();
    await expect.element(screen.getByRole('slider', { name: 'Maximum Size' })).toBeInTheDocument();
  });

  it('takes the thumb names from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <>
        <Slider label="Size" defaultValue={[10, 90]} />
        <Slider
          label="File size"
          defaultValue={[120, 480]}
          maxValue={1000}
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
  });

  it('accepts custom thumb names', async () => {
    const screen = await renderWithDS(
      <Slider
        label="Support hours"
        defaultValue={[8, 18]}
        maxValue={24}
        thumbLabels={['Opens', 'Closes']}
      />,
    );
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

  it('lets showStops override the automatic stops', async () => {
    const screen = await renderWithDS(
      <>
        <Slider label="Message retries" defaultValue={3} maxValue={8} showStops={false} />
        <Slider label="Volume" defaultValue={30} step={10} marks={[0, 50, 100]} showStops />
      </>,
    );
    const [hidden, forced] = screen.getByRole('group').elements();
    expect(parts('stop', hidden)).toHaveLength(0);
    expect(parts('stop', forced)).toHaveLength(11);
  });

  it('shows stops automatically when the step leaves few positions', async () => {
    const screen = await renderWithDS(
      <>
        <Slider label="Message retries" defaultValue={3} maxValue={8} />
        <Slider label="Volume" defaultValue={30} />
      </>,
    );
    const [discrete, continuous] = screen.getByRole('group').elements();
    expect(parts('stop', discrete)).toHaveLength(9);
    expect(parts('stop', discrete).filter((stop) => stop.dataset.tone === 'active')).toHaveLength(
      4,
    );
    expect(parts('stop', continuous)).toHaveLength(0);
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

  it('shows one value, without a tilde, when both range thumbs meet', async () => {
    await renderWithDS(
      <Slider label="Size" defaultValue={[480, 480]} maxValue={1000} formatOptions={gigabytes} />,
    );
    expect(parts('output')[0].textContent).toBe('480 GB');
  });

  it('marks the fill offset of a centred slider with a stop', async () => {
    await renderWithDS(
      <div className="w-80">
        <Slider
          label="Balance"
          defaultValue={0.08}
          minValue={-0.2}
          maxValue={0.2}
          step={0.01}
          fillOffset={0}
          showValueIndicator={false}
          formatOptions={{ style: 'percent', signDisplay: 'exceptZero' }}
        />
      </div>,
    );
    const rail = parts('rail')[0].getBoundingClientRect();
    const stops = parts('stop');
    expect(stops).toHaveLength(1);
    const stop = stops[0].getBoundingClientRect();
    expect(stop.left + stop.width / 2).toBeCloseTo(rail.left + rail.width / 2, 0);
    expect(stops[0].dataset.tone).toBe('active');
  });

  it('fills from the offset for a centred slider', async () => {
    await renderWithDS(
      <Slider
        label="Exposure"
        defaultValue={-0.1}
        minValue={-0.2}
        maxValue={0.2}
        step={0.01}
        fillOffset={0}
        formatOptions={{ style: 'percent', signDisplay: 'exceptZero' }}
      />,
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

  it.each([
    ['system', '0.9'],
    ['reduced', '1'],
  ] as const)('shrinks the thumb while it is dragged with motion %s', async (motion, scale) => {
    await renderWithDS(
      <div className="w-80">
        <Slider label="Opacity" defaultValue={40} />
      </div>,
      { provider: { motion } },
    );
    const thumb = parts('thumb')[0];
    const box = thumb.getBoundingClientRect();
    const point = {
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
      button: 'left' as const,
    };
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', clickCount: 1, ...point });
    try {
      await expect.poll(() => thumb.hasAttribute('data-dragging')).toBe(true);
      await expect.poll(() => getComputedStyle(thumb).scale).toBe(scale);
    } finally {
      await cdp().send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        clickCount: 1,
        ...point,
      });
    }
    await expect.poll(() => thumb.hasAttribute('data-dragging')).toBe(false);
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
  ])('keeps the value bubble inside the slider at both ends in %s', async (_, options) => {
    const screen = await renderWithDS(
      <div style={{ width: 240 }}>
        <Slider
          aria-label="Upload size"
          defaultValue={0}
          maxValue={2048}
          formatOptions={{ style: 'unit', unit: 'kilobyte', unitDisplay: 'long' }}
        />
      </div>,
      { ...options, provider: { motion: 'disabled' } },
    );
    const slider = screen.getByRole('slider');
    const root = parts('slider')[0].getBoundingClientRect();
    const bubble = parts('bubble')[0];
    await userEvent.tab();
    await expect.element(slider).toHaveFocus();
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
  });

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

  it('shows the value indicator while focused from the keyboard', async () => {
    const screen = await renderWithDS(
      <div className="w-80">
        <Slider
          label="Opacity"
          defaultValue={50}
          formatOptions={{ style: 'unit', unit: 'percent' }}
        />
      </div>,
      { provider: { motion: 'disabled' } },
    );
    const bubble = parts('bubble')[0];
    expect(getComputedStyle(bubble).opacity).toBe('0');
    await userEvent.tab();
    await expect.element(screen.getByRole('slider')).toHaveFocus();
    expect(getComputedStyle(bubble).opacity).toBe('1');
    expect(bubble.textContent).toBe('50%');
    const box = bubble.getBoundingClientRect();
    const thumb = parts('thumb')[0].getBoundingClientRect();
    expect(box.left + box.width / 2).toBeCloseTo(thumb.left + thumb.width / 2, 0);
    expect(box.bottom).toBeLessThanOrEqual(thumb.top);
  });

  it('follows the DSProvider motion preference', async () => {
    for (const motion of ['system', 'reduced', 'disabled'] as const) {
      const screen = await renderWithDS(<Slider label="Opacity" defaultValue={40} />, {
        provider: { motion },
      });
      await expect.element(screen.getByRole('slider')).toBeInTheDocument();
      const bubble = parts('bubble', screen.container)[0];
      const thumb = parts('thumb', screen.container)[0];
      const style = getComputedStyle(bubble);
      expect(style.scale).toBe(motion === 'reduced' ? '1' : '0.9');
      expect(style.transitionProperty).toBe(motion === 'disabled' ? 'none' : 'opacity, scale');
      expect(getComputedStyle(thumb).transitionProperty).toBe(
        motion === 'system' ? 'scale, box-shadow' : 'none',
      );
      await screen.unmount();
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

  it('submits every thumb under the given name', async () => {
    await renderWithDS(
      <form aria-label="Filters">
        <Slider label="File size" name="size" defaultValue={[120, 480]} maxValue={1000} />
      </form>,
    );
    const form = document.querySelector('form')!;
    expect(new FormData(form).getAll('size')).toEqual(['120', '480']);
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
    const screen = await renderWithDS(
      <Slider orientation="vertical" label="Notifications per day" defaultValue={60} />,
    );
    const slider = screen.getByRole('slider', { name: 'Notifications per day' });
    await expect.element(slider).toHaveAttribute('aria-orientation', 'vertical');
    const track = parts('track')[0].getBoundingClientRect();
    expect(track.height).toBeGreaterThan(track.width);
    const label = parts('label')[0].getBoundingClientRect();
    const output = parts('output')[0].getBoundingClientRect();
    expect(Math.abs(output.left + output.width / 2 - (label.left + label.width / 2))).toBeLessThan(
      1,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(slider).toHaveValue('61');
  });

  it('turns the handle animation and bubble scale off under the OS reduced motion setting', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    try {
      await renderWithDS(<Slider label="Opacity" defaultValue={40} />);
      expect(getComputedStyle(parts('thumb')[0]).transitionProperty).toBe('none');
      expect(getComputedStyle(parts('bubble')[0]).scale).toBe('1');
    } finally {
      await cdp().send('Emulation.setEmulatedMedia', { features: [] });
    }
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

  it('does not move when disabled', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <Slider
        isDisabled
        label="API requests per minute"
        defaultValue={600}
        maxValue={1000}
        onChange={onChange}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'API requests per minute' });
    await expect.element(slider).toBeDisabled();
    await expect.element(screen.getByRole('group')).toHaveAttribute('data-disabled', 'true');
    expect(getComputedStyle(parts('slider')[0]).opacity).toBe('0.5');
    expect(getComputedStyle(parts('track')[0]).cursor).toBe('not-allowed');
    const track = parts('track')[0];
    await userEvent.click(track, { force: true });
    expect(onChange).not.toHaveBeenCalled();
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
      expect(screen.container.querySelectorAll('input[type="range"]')).toHaveLength(8);
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
