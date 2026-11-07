import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { NotificationsIcon } from '@/registry/ds/lib/icons';
import { Badge, BadgeAnchor, type BadgeLabels } from '@/registry/ds/ui/badge';
import { Button } from '@/registry/ds/ui/button';

const tones = ['error', 'primary', 'neutral', 'success', 'warning', 'info'] as const;

const still = { provider: { motion: 'disabled' as const } };

function shown(element: Element) {
  return element.querySelector('[data-slot="badge-label"]')?.textContent;
}

describe('Badge', () => {
  it('shows a count and reads it with the English default label', async () => {
    const screen = await renderWithDS(<Badge count={3} data-testid="badge" />);
    const badge = screen.getByTestId('badge');
    await expect.element(badge).toHaveAttribute('data-variant', 'solid');
    await expect.element(badge).toHaveAttribute('data-tone', 'error');
    await expect.element(badge).toHaveAttribute('data-size', 'md');
    await expect.element(badge).not.toHaveAttribute('data-dot');
    await expect.element(screen.getByText('3 new')).toBeInTheDocument();
    expect(badge.element().getBoundingClientRect().height).toBe(20);
    const visible = badge.element().querySelector('[data-slot="badge-label"]');
    expect(visible?.textContent).toBe('3');
    expect(visible?.getAttribute('aria-hidden')).toBe('true');
  });

  it('caps the count at max', async () => {
    const screen = await renderWithDS(
      <div>
        <Badge count={120} data-testid="default" />
        <Badge count={12} max={9} data-testid="custom" />
      </div>,
    );
    await expect.element(screen.getByText('99+ new')).toBeInTheDocument();
    expect(shown(screen.getByTestId('default').element())).toBe('99+');
    expect(shown(screen.getByTestId('custom').element())).toBe('9+');
  });

  it('renders nothing at zero unless showZero is set', async () => {
    const screen = await renderWithDS(
      <div>
        <Badge count={0} data-testid="hidden" />
        <Badge count={0} showZero data-testid="shown" />
      </div>,
    );
    await expect.element(screen.getByTestId('shown')).toBeInTheDocument();
    await expect.element(screen.getByTestId('hidden')).not.toBeInTheDocument();
    expect(shown(screen.getByTestId('shown').element())).toBe('0');
  });

  it('renders a dot without a count', async () => {
    const screen = await renderWithDS(
      <div>
        <Badge data-testid="dot" />
        <Badge size="sm" data-testid="small" />
      </div>,
      still,
    );
    const dot = screen.getByTestId('dot');
    await expect.element(dot).toHaveAttribute('data-dot', 'true');
    expect(dot.element().getBoundingClientRect().width).toBe(8);
    expect(dot.element().getBoundingClientRect().height).toBe(8);
    expect(screen.getByTestId('small').element().getBoundingClientRect().width).toBe(6);
    await expect.element(screen.getByText('New').first()).toBeInTheDocument();
  });

  it('is 20px tall at md and 16px at sm', async () => {
    const screen = await renderWithDS(
      <div className="flex items-start gap-2">
        <Badge count={4} data-testid="md" />
        <Badge count={4} size="sm" data-testid="sm" />
      </div>,
    );
    const md = screen.getByTestId('md').element().getBoundingClientRect();
    const sm = screen.getByTestId('sm').element().getBoundingClientRect();
    expect(md.height).toBe(20);
    expect(md.width).toBe(20);
    expect(sm.height).toBe(16);
    expect(sm.width).toBe(16);
    await expect.element(screen.getByTestId('sm')).toHaveAttribute('data-size', 'sm');
  });

  it.each([{}, { dark: true }])(
    'fills solid badges with the solid roles and soft badges with the soft roles %o',
    async (options) => {
      const screen = await renderWithDS(
        <div>
          <Badge count={4} tone="success" data-testid="solid" />
          <Badge count={4} tone="success" variant="soft" data-testid="soft" />
          <span data-testid="solid-ref" className="bg-success-solid text-on-success-solid" />
          <span data-testid="soft-ref" className="bg-success-soft text-on-success-soft" />
        </div>,
        options,
      );
      const style = (testId: string) => getComputedStyle(screen.getByTestId(testId).element());
      expect(style('solid').backgroundColor).toBe(style('solid-ref').backgroundColor);
      expect(style('solid').color).toBe(style('solid-ref').color);
      expect(style('soft').backgroundColor).toBe(style('soft-ref').backgroundColor);
      expect(style('soft').color).toBe(style('soft-ref').color);
      await expect.element(screen.getByTestId('soft')).toHaveAttribute('data-variant', 'soft');
    },
  );

  it('keeps a soft dot visible with the solid fill', async () => {
    const screen = await renderWithDS(
      <div>
        <Badge variant="soft" tone="warning" data-testid="dot" />
        <span data-testid="reference" className="bg-warning-solid" />
      </div>,
    );
    expect(getComputedStyle(screen.getByTestId('dot').element()).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('reference').element()).backgroundColor,
    );
  });

  it('uses a custom label with a count placeholder', async () => {
    const screen = await renderWithDS(
      <Badge count={4} label="{count} open tasks" tone="warning" />,
    );
    await expect.element(screen.getByText('4 open tasks')).toBeInTheDocument();
  });

  it('shows a short text label as is', async () => {
    const screen = await renderWithDS(
      <Badge tone="primary" data-testid="badge">
        Beta
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    await expect.element(badge).not.toHaveAttribute('data-dot');
    expect(shown(badge.element())).toBe('Beta');
    expect(badge.element().querySelector('[aria-hidden]')).toBeNull();
  });

  it('reads a custom label instead of its short text', async () => {
    const screen = await renderWithDS(
      <Badge tone="primary" label="New feature" data-testid="badge">
        New
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    await expect.element(screen.getByText('New feature')).toBeInTheDocument();
    const visible = badge.element().querySelector('[data-slot="badge-label"]');
    expect(visible?.textContent).toBe('New');
    expect(visible?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the count rather than children when both are given', async () => {
    const screen = await renderWithDS(
      <Badge count={4} data-testid="badge">
        New
      </Badge>,
    );
    await expect.element(screen.getByText('4 new')).toBeInTheDocument();
    expect(shown(screen.getByTestId('badge').element())).toBe('4');
  });

  it('takes its text from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <div>
        <Badge count={5} />
        <Badge count={7} labels={{ count: '{count} okunmamış' }} />
        <Badge count={120} labels={{ overflow: '{max} üstü' }} data-testid="overflow" />
        <Badge tone="primary" />
      </div>,
      { provider: { labels: { badge: { count: '{count} yeni', dot: 'Yeni' } } } },
    );
    await expect.element(screen.getByText('5 yeni')).toBeInTheDocument();
    await expect.element(screen.getByText('7 okunmamış')).toBeInTheDocument();
    await expect.element(screen.getByText('99 üstü yeni')).toBeInTheDocument();
    expect(shown(screen.getByTestId('overflow').element())).toBe('99 üstü');
    await expect.element(screen.getByText('Yeni', { exact: true })).toBeInTheDocument();
  });

  it('accepts a function as a label template for plural rules', async () => {
    const replies: BadgeLabels['count'] = ({ count }) =>
      `${count} new ${count === '1' ? 'reply' : 'replies'}`;
    const screen = await renderWithDS(
      <div>
        <Badge count={1} labels={{ count: replies }} />
        <Badge count={4} labels={{ count: replies }} />
      </div>,
    );
    await expect.element(screen.getByText('1 new reply')).toBeInTheDocument();
    await expect.element(screen.getByText('4 new replies')).toBeInTheDocument();
  });

  it('formats the digits for the locale', async () => {
    const screen = await renderWithDS(<Badge count={5} data-testid="badge" />, { locale: 'ar' });
    await expect.element(screen.getByTestId('badge')).toBeInTheDocument();
    expect(shown(screen.getByTestId('badge').element())).toBe(
      new Intl.NumberFormat('ar').format(5),
    );
  });

  it('adds its label to the accessible name of a control', async () => {
    const screen = await renderWithDS(
      <Button variant="ghost" endIcon={<Badge count={12} />}>
        Projects
      </Button>,
    );
    await expect
      .element(screen.getByRole('button', { name: 'Projects 12 new' }))
      .toBeInTheDocument();
  });

  it.each(['en', 'ar'])(
    'pins a dot over the top-end corner of its anchor in %s',
    async (locale) => {
      const screen = await renderWithDS(
        <BadgeAnchor data-testid="anchor" badge={<Badge data-testid="dot" />}>
          <NotificationsIcon className="size-6" />
        </BadgeAnchor>,
        { locale, ...still },
      );
      await expect.element(screen.getByTestId('dot')).toHaveAttribute('data-size', 'sm');
      const anchor = screen.getByTestId('anchor').element().getBoundingClientRect();
      const dot = screen.getByTestId('dot').element().getBoundingClientRect();
      expect(dot.width).toBe(6);
      expect(dot.top).toBeCloseTo(anchor.top - 1.5, 1);
      if (locale === 'ar') expect(dot.left).toBeCloseTo(anchor.left - 1.5, 1);
      else expect(dot.right).toBeCloseTo(anchor.right + 1.5, 1);
    },
  );

  it('draws a seam in the canvas colour around an anchored badge', async () => {
    const screen = await renderWithDS(
      <div>
        <BadgeAnchor badge={<Badge count={2} data-testid="anchored" />}>
          <NotificationsIcon className="size-6" />
        </BadgeAnchor>
        <Badge count={2} data-testid="inline" />
        <span data-testid="canvas" className="bg-canvas" />
      </div>,
      still,
    );
    const shadow = (testId: string) =>
      getComputedStyle(screen.getByTestId(testId).element()).boxShadow;
    const canvas = getComputedStyle(screen.getByTestId('canvas').element()).backgroundColor;
    expect(shadow('anchored')).toContain(`${canvas} 0px 0px 0px 2px`);
    expect(shadow('inline')).toBe('none');
  });

  it('animates only when anchored and motion is allowed', async () => {
    const screen = await renderWithDS(
      <div>
        <Badge count={2} data-testid="inline" />
        <BadgeAnchor badge={<Badge count={2} data-testid="anchored" />}>
          <NotificationsIcon className="size-6" />
        </BadgeAnchor>
      </div>,
    );
    await expect.element(screen.getByTestId('anchored')).toBeInTheDocument();
    const duration = (testId: string) =>
      parseFloat(getComputedStyle(screen.getByTestId(testId).element()).transitionDuration);
    expect(duration('inline')).toBe(0);
    expect(duration('anchored')).toBeGreaterThan(0);
  });

  it('does not animate when motion is disabled', async () => {
    const screen = await renderWithDS(
      <BadgeAnchor badge={<Badge count={2} data-testid="anchored" />}>
        <NotificationsIcon className="size-6" />
      </BadgeAnchor>,
      still,
    );
    await expect.element(screen.getByTestId('anchored')).toBeInTheDocument();
    expect(
      parseFloat(getComputedStyle(screen.getByTestId('anchored').element()).transitionDuration),
    ).toBe(0);
  });

  it.each(['en', 'ar'])('moves a count a quarter outside the corner in %s', async (locale) => {
    const screen = await renderWithDS(
      <BadgeAnchor data-testid="anchor" badge={<Badge count={8} data-testid="badge" />}>
        <NotificationsIcon className="size-6" />
      </BadgeAnchor>,
      { locale, ...still },
    );
    await expect.element(screen.getByTestId('anchor')).toBeInTheDocument();
    const anchor = screen.getByTestId('anchor').element().getBoundingClientRect();
    const badge = screen.getByTestId('badge').element().getBoundingClientRect();
    expect(badge.height).toBe(16);
    if (locale === 'ar') {
      expect(badge.right).toBe(anchor.left + 12);
      expect(badge.left).toBe(anchor.left - 4);
    } else {
      expect(badge.left).toBe(anchor.right - 12);
      expect(badge.right).toBe(anchor.right + 4);
    }
    expect(badge.top).toBe(anchor.top - 4);
  });

  it('mirrors a circular anchor in RTL', async () => {
    const screen = await renderWithDS(
      <BadgeAnchor
        data-testid="anchor"
        overlap="circular"
        badge={<Badge tone="success" label="Online" data-testid="dot" />}
      >
        <span className="block size-10 rounded-full bg-neutral-soft" />
      </BadgeAnchor>,
      { locale: 'ar', ...still },
    );
    await expect.element(screen.getByText('Online')).toBeInTheDocument();
    const anchor = screen.getByTestId('anchor').element().getBoundingClientRect();
    const dot = screen.getByTestId('dot').element().getBoundingClientRect();
    expect(dot.left + dot.width / 2).toBeCloseTo(anchor.left + anchor.width * 0.146, 0);
    expect(dot.top + dot.height / 2).toBeCloseTo(anchor.top + anchor.height * 0.146, 0);
  });

  it('centres on the rim of a circular anchor', async () => {
    const screen = await renderWithDS(
      <BadgeAnchor
        data-testid="anchor"
        overlap="circular"
        badge={<Badge tone="success" data-testid="dot" />}
      >
        <span className="block size-10 rounded-full bg-neutral-soft" />
      </BadgeAnchor>,
      still,
    );
    await expect.element(screen.getByTestId('anchor')).toBeInTheDocument();
    const anchor = screen.getByTestId('anchor').element().getBoundingClientRect();
    const dot = screen.getByTestId('dot').element().getBoundingClientRect();
    expect(dot.left + dot.width / 2).toBeCloseTo(anchor.left + anchor.width * 0.854, 0);
    expect(dot.top + dot.height / 2).toBeCloseTo(anchor.top + anchor.height * 0.146, 0);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-wrap items-center gap-4 p-4">
          {tones.map((tone) => (
            <Badge key={tone} tone={tone} count={128} />
          ))}
          {tones.map((tone) => (
            <Badge key={`soft-${tone}`} tone={tone} variant="soft" count={7} />
          ))}
          {tones.map((tone) => (
            <Badge key={`dot-${tone}`} tone={tone} />
          ))}
          <Badge tone="primary">Beta</Badge>
          <Badge size="sm" count={5} />
          <BadgeAnchor badge={<Badge count={3} />}>
            <NotificationsIcon className="size-6 text-on-surface-variant" />
          </BadgeAnchor>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
