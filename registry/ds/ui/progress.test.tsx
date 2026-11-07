import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { CircularProgress, LinearProgress } from '@/registry/ds/ui/progress';

function slot(root: Element, name: string) {
  return root.querySelector<HTMLElement>(`[data-slot="${name}"]`);
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

  it('slides when indeterminate, becomes a pulse when motion is reduced and stops when it is disabled', async () => {
    const full = await renderWithDS(
      <div style={{ width: 200 }}>
        <LinearProgress label="Syncing team feed" isIndeterminate />
      </div>,
    );
    const bar = full.getByRole('progressbar', { name: 'Syncing team feed' });
    await expect.element(bar).not.toHaveAttribute('aria-valuenow');
    await expect.element(bar).toHaveAttribute('data-indeterminate', 'true');
    expect(full.container.querySelectorAll('[data-slot="indicator"]')).toHaveLength(1);
    const indicator = slot(full.container, 'indicator')!;
    expect(getComputedStyle(indicator).animationName).toBe('ds-progress-slide');
    expect(indicator.getBoundingClientRect().width).toBeCloseTo(80, 0);
    await full.unmount();

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

  it('takes its fallback names from labels, then DSProvider', async () => {
    const english = await renderWithDS(
      <>
        <LinearProgress isIndeterminate />
        <CircularProgress value={30} />
        <h2 id="backup-title">Workspace backup</h2>
        <LinearProgress aria-labelledby="backup-title" value={58} />
      </>,
    );
    await expect.element(english.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
    await expect.element(english.getByRole('progressbar', { name: 'Progress' })).toBeVisible();
    await expect
      .element(english.getByRole('progressbar', { name: 'Workspace backup' }))
      .not.toHaveAttribute('aria-label');
    await english.unmount();

    const screen = await renderWithDS(
      <div className="flex w-80 flex-col gap-4">
        <LinearProgress isIndeterminate />
        <LinearProgress value={30} labels={{ progress: 'Storage usage' }} />
        <CircularProgress isIndeterminate labels={{ loading: 'Loading messages' }} />
        <CircularProgress value={30} />
      </div>,
      { provider: { labels: { progress: { loading: 'Working', progress: 'Task progress' } } } },
    );
    await expect.element(screen.getByRole('progressbar', { name: 'Working' })).toBeVisible();
    await expect.element(screen.getByRole('progressbar', { name: 'Storage usage' })).toBeVisible();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Loading messages' }))
      .toBeVisible();
    await expect.element(screen.getByRole('progressbar', { name: 'Task progress' })).toBeVisible();
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
          <div className="flex gap-4">
            {(['primary', 'neutral', 'success', 'warning', 'error', 'info'] as const).map(
              (tone) => (
                <CircularProgress
                  key={tone}
                  aria-label={`${tone} ring`}
                  value={60}
                  tone={tone}
                  size="xl"
                  showValueLabel
                />
              ),
            )}
            <CircularProgress isIndeterminate />
          </div>
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

  it('spins an arc over the track, and pulses instead with reduced motion', async () => {
    const full = await renderWithDS(<CircularProgress isIndeterminate />);
    await expect
      .element(full.getByRole('progressbar', { name: 'Loading' }))
      .not.toHaveAttribute('aria-valuenow');
    expect(slot(full.container, 'track')).not.toBeNull();
    expect(getComputedStyle(slot(full.container, 'indicator')!).animationName).toBe(
      'ds-progress-arc',
    );
    await full.unmount();

    const screen = await renderWithDS(<CircularProgress isIndeterminate />, {
      provider: { motion: 'reduced' },
    });
    expect(getComputedStyle(slot(screen.container, 'indicator')!).animationName).toBe('ds-pulse');
    expect(getComputedStyle(screen.container.querySelector('svg')!).animationName).toBe('none');
  });
});
