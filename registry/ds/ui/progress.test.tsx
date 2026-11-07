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
      <LinearProgress label="Uploading photos.zip" value={40} showValueLabel />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Uploading photos.zip' });
    await expect.element(bar).toHaveAttribute('aria-valuenow', '40');
    await expect.element(bar).toHaveAttribute('aria-valuetext', '40%');
    await expect.element(bar).toHaveAttribute('data-tone', 'primary');
    await expect.element(bar).toHaveAttribute('data-size', 'md');
    await expect.element(screen.getByText('40%')).toBeVisible();
  });

  it('formats the value with formatOptions and the locale', async () => {
    const screen = await renderWithDS(
      <LinearProgress
        label="Storage"
        value={3200}
        maxValue={5000}
        formatOptions={{ style: 'unit', unit: 'megabyte', maximumFractionDigits: 0 }}
        showValueLabel
      />,
      { locale: 'de' },
    );
    const expected = new Intl.NumberFormat('de', {
      style: 'unit',
      unit: 'megabyte',
      maximumFractionDigits: 0,
    }).format(3200);
    expect(expected).toMatch(/^3\.200\sMB$/);
    const bar = screen.getByRole('progressbar', { name: 'Storage' });
    await expect.element(bar).toHaveAttribute('aria-valuetext', expected);
    await expect.element(screen.getByText(expected)).toBeVisible();
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

  it('fills a share of a rounded neutral track', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 200 }}>
        <LinearProgress aria-label="Storage" value={40} />
        <span data-testid="track-ref" className="bg-neutral-soft" />
        <span data-testid="fill-ref" className="bg-primary-solid" />
      </div>,
      { provider: { motion: 'disabled' } },
    );
    const root = screen.container;
    const track = slot(root, 'track')!;
    const indicator = slot(root, 'indicator')!;
    expect(track.getBoundingClientRect().height).toBe(8);
    expect(indicator.getBoundingClientRect().width).toBeCloseTo(80, 0);
    expect(indicator.getBoundingClientRect().left).toBeCloseTo(
      track.getBoundingClientRect().left,
      0,
    );
    expect(getComputedStyle(track).borderRadius).not.toBe('0px');
    const color = (testId: string) =>
      getComputedStyle(screen.getByTestId(testId).element()).backgroundColor;
    expect(getComputedStyle(track).backgroundColor).toBe(color('track-ref'));
    expect(getComputedStyle(indicator).backgroundColor).toBe(color('fill-ref'));
  });

  it.each([
    ['sm', 4],
    ['md', 8],
    ['lg', 12],
  ] as const)('draws the %s track %ipx tall', async (size, height) => {
    const screen = await renderWithDS(
      <LinearProgress aria-label="Storage" value={72} size={size} />,
    );
    expect(slot(screen.container, 'track')!.getBoundingClientRect().height).toBe(height);
  });

  it.each([
    ['dark', { dark: true }],
    ['light', {}],
  ])('keeps the solid fill saturated in %s mode', async (_, options) => {
    const screen = await renderWithDS(
      <div style={{ width: 200 }}>
        <LinearProgress aria-label="Storage" value={50} tone="success" />
        <span data-testid="reference" className="bg-success-solid" />
      </div>,
      options,
    );
    expect(getComputedStyle(slot(screen.container, 'indicator')!).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('reference').element()).backgroundColor,
    );
  });

  it('fills from the inline start in Arabic', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 200 }}>
        <LinearProgress aria-label="Storage" value={25} />
      </div>,
      { locale: 'ar', provider: { motion: 'disabled' } },
    );
    const root = screen.container;
    const track = slot(root, 'track')!.getBoundingClientRect();
    const indicator = slot(root, 'indicator')!.getBoundingClientRect();
    expect(indicator.right).toBeCloseTo(track.right, 0);
    expect(indicator.width).toBeCloseTo(50, 0);
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
    expect(slot(screen.container, 'indicator')!.getBoundingClientRect().width).toBeCloseTo(100, 0);
  });

  it('animates width changes over 300ms', async () => {
    const screen = await renderWithDS(<LinearProgress aria-label="Storage" value={30} />);
    const indicator = getComputedStyle(slot(screen.container, 'indicator')!);
    expect(indicator.transitionProperty).toBe('width');
    expect(indicator.transitionDuration).toBe('0.3s');
  });

  it('slides a short bar across the track when indeterminate', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 200 }}>
        <LinearProgress label="Syncing team feed" isIndeterminate />
      </div>,
    );
    const bar = screen.getByRole('progressbar', { name: 'Syncing team feed' });
    await expect.element(bar).not.toHaveAttribute('aria-valuenow');
    await expect.element(bar).toHaveAttribute('data-indeterminate', 'true');
    const indicator = slot(screen.container, 'indicator')!;
    expect(screen.container.querySelectorAll('[data-slot="indicator"]')).toHaveLength(1);
    expect(getComputedStyle(indicator).animationName).toBe('ds-progress-slide');
    expect(getComputedStyle(indicator).animationDuration).toBe('1.5s');
    expect(indicator.getBoundingClientRect().width).toBeCloseTo(80, 0);
  });

  it.each([
    ['en', '-100%'],
    ['ar', '100%'],
  ])('starts the slide off the start edge in %s', async (locale, start) => {
    const screen = await renderWithDS(<LinearProgress aria-label="Syncing" isIndeterminate />, {
      locale,
    });
    const indicator = slot(screen.container, 'indicator')!;
    const [slide] = indicator.getAnimations();
    slide.pause();
    slide.currentTime = 0;
    expect(getComputedStyle(indicator).translate).toBe(start);
  });

  it('becomes a pulse when motion is reduced and stops when it is disabled', async () => {
    const reduced = await renderWithDS(<LinearProgress aria-label="Syncing" isIndeterminate />, {
      provider: { motion: 'reduced' },
    });
    expect(getComputedStyle(slot(reduced.container, 'indicator')!).animationName).toBe('ds-pulse');
    await reduced.unmount();

    const disabled = await renderWithDS(<LinearProgress aria-label="Syncing" isIndeterminate />, {
      provider: { motion: 'disabled' },
    });
    expect(getComputedStyle(slot(disabled.container, 'indicator')!).animationName).toBe('none');
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
          {(['primary', 'neutral', 'success', 'warning', 'error', 'info'] as const).map((tone) => (
            <LinearProgress key={tone} label={tone} value={60} tone={tone} showValueLabel />
          ))}
          <LinearProgress label="Syncing" isIndeterminate />
          <LinearProgress label="Exporting" value={45} size="lg" />
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
    expect(ring.element().getBoundingClientRect().width).toBe(48);
    const indicator = slot(screen.container, 'indicator')!;
    expect(getComputedStyle(indicator).strokeDasharray).toBe('75px, 100px');
  });

  it.each([
    ['sm', 20],
    ['md', 28],
    ['lg', 36],
    ['xl', 48],
  ] as const)('draws the %s ring at %ipx', async (size, box) => {
    const screen = await renderWithDS(
      <CircularProgress aria-label="Upload" value={40} size={size} />,
    );
    const ring = screen.getByRole('progressbar', { name: 'Upload' });
    expect(ring.element().getBoundingClientRect().width).toBe(box);
  });

  it('lays the arc over a full neutral track', async () => {
    const screen = await renderWithDS(
      <div>
        <CircularProgress aria-label="Upload" value={50} tone="warning" />
        <svg>
          <circle data-testid="track-ref" className="stroke-neutral-soft" />
          <circle data-testid="arc-ref" className="stroke-warning-solid" />
        </svg>
      </div>,
    );
    const track = getComputedStyle(slot(screen.container, 'track')!);
    const indicator = getComputedStyle(slot(screen.container, 'indicator')!);
    expect(track.strokeDasharray).toBe('none');
    expect(track.stroke).toBe(getComputedStyle(screen.getByTestId('track-ref').element()).stroke);
    expect(indicator.stroke).toBe(getComputedStyle(screen.getByTestId('arc-ref').element()).stroke);
  });

  it('hides the indicator at zero', async () => {
    const screen = await renderWithDS(<CircularProgress aria-label="Upload" value={0} />);
    expect(getComputedStyle(slot(screen.container, 'indicator')!).opacity).toBe('0');
  });

  it('spins an arc over the track when indeterminate', async () => {
    const screen = await renderWithDS(<CircularProgress isIndeterminate />);
    const ring = screen.getByRole('progressbar', { name: 'Loading' });
    await expect.element(ring).not.toHaveAttribute('aria-valuenow');
    expect(slot(screen.container, 'track')).not.toBeNull();
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
          {(['primary', 'neutral', 'success', 'warning', 'error', 'info'] as const).map((tone) => (
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
