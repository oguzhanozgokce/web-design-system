import { useState } from 'react';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { CircularProgress, LinearProgress } from '@/registry/ds/ui/progress';

function slot(root: Element, name: string) {
  return root.querySelector<HTMLElement>(`[data-slot="${name}"]`);
}

function StepProgress() {
  const [step, setStep] = useState(1);
  return (
    <div style={{ width: 200 }}>
      <LinearProgress label="Setup" value={step} maxValue={4} />
      <button type="button" onClick={() => setStep(step + 1)}>
        Next
      </button>
    </div>
  );
}

describe('LinearProgress', () => {
  it('renders a labelled progress bar with a formatted value', async () => {
    const screen = await renderWithDS(
      <LinearProgress label="Uploading statements.csv" value={40} showValueLabel />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Uploading statements.csv' });
    await expect.element(bar).toHaveAttribute('aria-valuenow', '40');
    await expect.element(bar).toHaveAttribute('aria-valuetext', '40%');
    await expect.element(bar).toHaveAttribute('data-tone', 'primary');
    await expect.element(bar).toHaveAttribute('data-thickness', '4');
    await expect.element(screen.getByText('40%')).toBeVisible();
  });

  it('formats the value with formatOptions and the locale', async () => {
    const screen = await renderWithDS(
      <LinearProgress
        label="Fundraising"
        value={3200}
        maxValue={5000}
        formatOptions={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
        showValueLabel
      />,
      { locale: 'de' },
    );
    const bar = screen.getByRole('progressbar', { name: 'Fundraising' });
    await expect.element(bar).toHaveAttribute('aria-valuetext', '3.200\u00a0€');
    await expect.element(screen.getByText('3.200\u00a0€')).toBeVisible();
  });

  it('uses a custom valueLabel for screen readers and the header', async () => {
    const screen = await renderWithDS(
      <LinearProgress
        label="Importing comments"
        value={128}
        maxValue={300}
        valueLabel="128 of 300 files"
        showValueLabel
      />,
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Importing comments' }))
      .toHaveAttribute('aria-valuetext', '128 of 300 files');
    await expect.element(screen.getByText('128 of 300 files')).toBeVisible();
  });

  it('sizes the indicator and leaves a gap before the track', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 200 }}>
        <LinearProgress aria-label="Storage" value={40} />
      </div>,
      { provider: { motion: 'disabled' } },
    );
    const root = screen.container;
    const bar = slot(root, 'bar')!.getBoundingClientRect();
    const fill = slot(root, 'fill')!.getBoundingClientRect();
    const track = slot(root, 'track')!.getBoundingClientRect();
    expect(bar.height).toBe(4);
    expect(fill.width).toBeCloseTo(80, 0);
    expect(track.left - fill.right).toBeCloseTo(4, 0);
    expect(track.right).toBeCloseTo(bar.right, 0);
    expect(slot(root, 'stop')).not.toBeNull();
  });

  it('fills from the inline start in Arabic', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 200 }}>
        <LinearProgress aria-label="Storage" value={25} />
      </div>,
      { locale: 'ar', provider: { motion: 'disabled' } },
    );
    const root = screen.container;
    const bar = slot(root, 'bar')!.getBoundingClientRect();
    const fill = slot(root, 'fill')!.getBoundingClientRect();
    expect(fill.right).toBeCloseTo(bar.right, 0);
    expect(fill.width).toBeCloseTo(50, 0);
  });

  it('puts the track and the stop dot on the inline end in Arabic', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 200 }}>
        <LinearProgress aria-label="Storage" value={25} thickness={8} />
      </div>,
      { locale: 'ar', provider: { motion: 'disabled' } },
    );
    const root = screen.container;
    const bar = slot(root, 'bar')!.getBoundingClientRect();
    const fill = slot(root, 'fill')!.getBoundingClientRect();
    const track = slot(root, 'track')!.getBoundingClientRect();
    const stop = slot(root, 'stop')!.getBoundingClientRect();
    expect(fill.left - track.right).toBeCloseTo(4, 0);
    expect(track.left).toBeCloseTo(bar.left, 0);
    expect(stop.width).toBe(4);
    expect(stop.left - bar.left).toBeCloseTo(2, 0);
    expect(stop.top - bar.top).toBeCloseTo(2, 0);
  });

  it('centres the stop dot in the end cap of the track', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 200 }}>
        <LinearProgress aria-label="Storage" value={10} />
      </div>,
      { provider: { motion: 'disabled' } },
    );
    const bar = slot(screen.container, 'bar')!.getBoundingClientRect();
    const stop = slot(screen.container, 'stop')!.getBoundingClientRect();
    expect(stop.right).toBeCloseTo(bar.right, 0);
    expect(stop.height).toBe(4);
  });

  it('does not override aria-labelledby with the fallback name', async () => {
    const screen = await renderWithDS(
      <>
        <h2 id="backup-title">Workspace backup</h2>
        <LinearProgress aria-labelledby="backup-title" value={58} />
      </>,
    );
    const bar = screen.getByRole('progressbar', { name: 'Workspace backup' });
    await expect.element(bar).not.toHaveAttribute('aria-label');
  });

  it('updates the indicator when the value changes', async () => {
    const screen = await renderWithDS(<StepProgress />, { provider: { motion: 'disabled' } });
    const bar = screen.getByRole('progressbar', { name: 'Setup' });
    await expect.element(bar).toHaveAttribute('aria-valuetext', '25%');
    await screen.getByRole('button', { name: 'Next' }).click();
    await expect.element(bar).toHaveAttribute('aria-valuetext', '50%');
    expect(slot(screen.container, 'fill')!.getBoundingClientRect().width).toBeCloseTo(100, 0);
  });

  it('renders the thicker track', async () => {
    const screen = await renderWithDS(
      <LinearProgress aria-label="Sales target" value={72} thickness={8} />,
    );
    expect(slot(screen.container, 'bar')!.getBoundingClientRect().height).toBe(8);
  });

  it('leaves out the value and the stop dot when indeterminate', async () => {
    const screen = await renderWithDS(<LinearProgress label="Syncing team feed" isIndeterminate />);
    const bar = screen.getByRole('progressbar', { name: 'Syncing team feed' });
    await expect.element(bar).not.toHaveAttribute('aria-valuenow');
    await expect.element(bar).toHaveAttribute('data-indeterminate', 'true');
    expect(slot(screen.container, 'stop')).toBeNull();
    expect(screen.container.querySelectorAll('[data-slot="indicator"]')).toHaveLength(2);
    expect(getComputedStyle(slot(screen.container, 'bar')!).animationName).toContain(
      'ds-progress-head-1',
    );
  });

  it('becomes a pulse when motion is reduced and stops when it is disabled', async () => {
    const reduced = await renderWithDS(<LinearProgress aria-label="Syncing" isIndeterminate />, {
      provider: { motion: 'reduced' },
    });
    expect(slot(reduced.container, 'lane')).toBeNull();
    expect(getComputedStyle(slot(reduced.container, 'pulse')!).animationName).toBe('ds-pulse');
    await reduced.unmount();

    const disabled = await renderWithDS(<LinearProgress aria-label="Syncing" isIndeterminate />, {
      provider: { motion: 'disabled' },
    });
    expect(getComputedStyle(slot(disabled.container, 'pulse')!).animationName).toBe('none');
  });

  it('draws a travelling wave in the wavy variant', async () => {
    const screen = await renderWithDS(
      <LinearProgress aria-label="Exporting orders" value={50} variant="wavy" />,
    );
    const wave = slot(screen.container, 'wave')!;
    expect(getComputedStyle(wave).maskImage).toContain('data:image/svg+xml');
    expect(getComputedStyle(wave).opacity).toBe('1');
    expect(slot(screen.container, 'bar')!.getBoundingClientRect().height).toBe(10);
    expect(getComputedStyle(slot(screen.container, 'bar')!).animationName).toBe('ds-progress-wave');
  });

  it('flattens the wave near the start', async () => {
    const screen = await renderWithDS(
      <LinearProgress aria-label="Exporting orders" value={5} variant="wavy" />,
      { provider: { motion: 'disabled' } },
    );
    expect(getComputedStyle(slot(screen.container, 'wave')!).opacity).toBe('0');
    expect(getComputedStyle(slot(screen.container, 'indicator')!).opacity).toBe('1');
  });

  it('falls back to Loading or Progress without a label', async () => {
    const screen = await renderWithDS(
      <>
        <LinearProgress isIndeterminate />
        <LinearProgress value={30} />
      </>,
    );
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
    await expect.element(screen.getByRole('progressbar', { name: 'Progress' })).toBeVisible();
  });

  it('takes its fallback names from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div className="flex w-80 flex-col gap-4">
        <LinearProgress isIndeterminate />
        <LinearProgress value={30} labels={{ progress: 'Depolama' }} />
        <CircularProgress isIndeterminate labels={{ loading: 'Mesajlar yükleniyor' }} />
        <CircularProgress value={30} />
      </div>,
      { provider: { labels: { progress: { loading: 'Yükleniyor', progress: 'İlerleme' } } } },
    );
    await expect.element(screen.getByRole('progressbar', { name: 'Yükleniyor' })).toBeVisible();
    await expect.element(screen.getByRole('progressbar', { name: 'Depolama' })).toBeVisible();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Mesajlar yükleniyor' }))
      .toBeVisible();
    await expect.element(screen.getByRole('progressbar', { name: 'İlerleme' })).toBeVisible();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex w-80 flex-col gap-4 p-4">
          {(['primary', 'success', 'warning', 'error'] as const).map((tone) => (
            <LinearProgress key={tone} label={tone} value={60} tone={tone} showValueLabel />
          ))}
          <LinearProgress label="Syncing" isIndeterminate />
          <LinearProgress label="Exporting" value={45} variant="wavy" thickness={8} />
          <LinearProgress label="Generating" variant="wavy" isIndeterminate />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});

describe('CircularProgress', () => {
  it('renders a determinate ring with a centred value', async () => {
    const screen = await renderWithDS(
      <CircularProgress aria-label="Setup checklist" value={75} size="xl" showValueLabel />,
    );
    const ring = screen.getByRole('progressbar', { name: 'Setup checklist' });
    await expect.element(ring).toHaveAttribute('aria-valuenow', '75');
    await expect.element(ring).toHaveAttribute('data-size', 'xl');
    await expect.element(screen.getByText('75%')).toBeVisible();
    expect(ring.element().getBoundingClientRect().width).toBe(64);
    const indicator = slot(screen.container, 'indicator')!;
    expect(getComputedStyle(indicator).strokeDasharray).toBe('75px, 100px');
  });

  it('opens a gap between the indicator and the track', async () => {
    const screen = await renderWithDS(<CircularProgress aria-label="Upload" value={50} />);
    const track = slot(screen.container, 'track')!;
    const offset = Math.abs(parseFloat(getComputedStyle(track).strokeDashoffset));
    const length = parseFloat(getComputedStyle(track).strokeDasharray);
    expect(offset).toBeGreaterThan(50);
    expect(length).toBeLessThan(50);
    expect(length + (offset - 50) * 2).toBeCloseTo(50, 2);
  });

  it('hides the indicator at zero and the track when complete', async () => {
    const empty = await renderWithDS(<CircularProgress aria-label="Upload" value={0} />);
    expect(getComputedStyle(slot(empty.container, 'indicator')!).opacity).toBe('0');
    await empty.unmount();
    const full = await renderWithDS(<CircularProgress aria-label="Upload" value={100} />);
    expect(getComputedStyle(slot(full.container, 'track')!).opacity).toBe('0');
  });

  it('spins an arc when indeterminate', async () => {
    const screen = await renderWithDS(<CircularProgress isIndeterminate />);
    const ring = screen.getByRole('progressbar', { name: 'Loading' });
    await expect.element(ring).not.toHaveAttribute('aria-valuenow');
    expect(slot(screen.container, 'track')).toBeNull();
    expect(getComputedStyle(slot(screen.container, 'indicator')!).animationName).toBe(
      'ds-progress-arc',
    );
  });

  it('pulses instead of spinning with reduced motion', async () => {
    const screen = await renderWithDS(<CircularProgress isIndeterminate />, {
      provider: { motion: 'reduced' },
    });
    expect(getComputedStyle(slot(screen.container, 'indicator')!).animationName).toBe('ds-pulse');
    expect(getComputedStyle(screen.container.querySelector('svg')!).animationName).toBe('none');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex gap-4 p-4">
          {(['primary', 'success', 'warning', 'error'] as const).map((tone) => (
            <CircularProgress
              key={tone}
              aria-label={tone}
              value={60}
              tone={tone}
              size="xl"
              showValueLabel
            />
          ))}
          <CircularProgress isIndeterminate />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
