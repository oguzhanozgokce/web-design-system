import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { ScheduleIcon } from '@/registry/ds/lib/icons';
import {
  StatusDot,
  StatusTag,
  StatusTagProvider,
  defaultStatusDefinitions,
  defaultStatusTagLabels,
  resolveStatus,
  type StatusKey,
} from '@/registry/ds/ui/status-tag';

const keys = Object.keys(defaultStatusDefinitions) as StatusKey[];

function tagOf(element: Element | null) {
  return element?.closest('[data-slot="tag"]') ?? null;
}

describe('StatusTag', () => {
  it('names every built-in status and gives it a tone', async () => {
    const screen = await renderWithDS(
      <div>
        {keys.map((key) => (
          <StatusTag key={key} status={key} />
        ))}
      </div>,
    );
    const tags = [...screen.container.querySelectorAll('[data-slot="tag"]')];
    expect(tags.map((tag) => tag.textContent)).toEqual(
      keys.map((key) => defaultStatusTagLabels[key]),
    );
    for (const [index, key] of keys.entries()) {
      expect(tags[index].getAttribute('data-tone')).toBe(defaultStatusDefinitions[key].tone);
      expect(tags[index].getAttribute('data-status')).toBe(key);
      expect(tags[index].getAttribute('data-status-known')).toBe('true');
    }
  });

  it('falls back to Unknown for a key it does not know', async () => {
    const screen = await renderWithDS(<StatusTag status="nightly" />);
    const tag = tagOf(screen.getByText('Unknown').element())!;
    expect(tag.getAttribute('data-tone')).toBe('neutral');
    expect(tag.getAttribute('data-status')).toBe('nightly');
    expect(tag.hasAttribute('data-status-known')).toBe(false);
  });

  it('takes app statuses and overrides from props and a provider', async () => {
    const screen = await renderWithDS(
      <StatusTagProvider
        statuses={{
          beta: { tone: 'primary', dot: true, label: 'Beta' },
          live: { tone: 'info' },
        }}
      >
        <StatusTagProvider statuses={{ sunset: { tone: 'warning', label: 'Sunsetting' } }}>
          <StatusTag status="beta" />
          <StatusTag status="sunset" icon={<ScheduleIcon data-testid="clock" />} />
          <StatusTag status="live" />
          <StatusTag status="live" statuses={{ live: { tone: 'error', label: 'Down' } }} />
        </StatusTagProvider>
      </StatusTagProvider>,
    );
    expect(tagOf(screen.getByText('Beta').element())!.getAttribute('data-tone')).toBe('primary');
    const sunset = tagOf(screen.getByText('Sunsetting').element())!;
    expect(sunset.getAttribute('data-tone')).toBe('warning');
    expect(sunset.querySelector('[data-slot="icon"]')).not.toBeNull();
    expect(tagOf(screen.getByText('Live').element())!.getAttribute('data-tone')).toBe('info');
    expect(tagOf(screen.getByText('Down').element())!.getAttribute('data-tone')).toBe('error');
  });

  it('overrides labels from props, the provider and children', async () => {
    const screen = await renderWithDS(
      <div>
        <StatusTag status="live" labels={{ live: 'Published' }} />
        <StatusTag status="inReview" />
        <StatusTag status="draft">Unsaved</StatusTag>
      </div>,
      { provider: { labels: { statusTag: { inReview: 'Review in progress' } } } },
    );
    await expect.element(screen.getByText('Published')).toBeVisible();
    await expect.element(screen.getByText('Review in progress')).toBeVisible();
    await expect.element(screen.getByText('Unsaved')).toBeVisible();
  });

  it('resolves statuses without rendering', () => {
    const resolved = resolveStatus('processing', null, defaultStatusTagLabels);
    expect(resolved).toMatchObject({ tone: 'primary', dot: 'pulse', label: 'Processing' });
    expect(resolveStatus('beta', { beta: { tone: 'info' } }, defaultStatusTagLabels).label).toBe(
      'beta',
    );
  });

  it('draws a status dot in the tone colour, hidden from screen readers', async () => {
    const screen = await renderWithDS(
      <div>
        <span data-testid="success" className="bg-success" />
        <StatusDot status="live" data-testid="dot" />
      </div>,
    );
    const dot = screen.getByTestId('dot').element();
    expect(dot.getAttribute('aria-hidden')).toBe('true');
    expect(dot.getAttribute('data-tone')).toBe('success');
    expect(getComputedStyle(dot).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('success').element()).backgroundColor,
    );
    expect(dot.getBoundingClientRect().width).toBe(8);
  });

  it('pulses the processing dot only while motion is allowed', async () => {
    for (const motion of ['system', 'reduced', 'disabled'] as const) {
      const screen = await renderWithDS(
        <div>
          <StatusTag status="processing" />
          <StatusDot status="processing" />
        </div>,
        { provider: { motion } },
      );
      const dots = screen.container.querySelectorAll('[data-slot="dot"], [data-slot="status-dot"]');
      expect(dots).toHaveLength(2);
      for (const dot of dots) {
        expect(getComputedStyle(dot).animationName).toBe(motion === 'system' ? 'ds-pulse' : 'none');
      }
      await screen.unmount();
    }
  });
});

describe('StatusTag accessibility', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-3 bg-surface-raised p-4">
          {(['soft', 'outline', 'solid'] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap gap-2">
              {keys.map((key) => (
                <StatusTag key={key} status={key} variant={variant} />
              ))}
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <StatusTag status="beta" statuses={{ beta: { tone: 'primary', label: 'Beta' } }} />
            <StatusDot status="failed" />
          </div>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
