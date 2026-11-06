import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { NotificationsIcon } from '@/registry/ds/lib/icons';
import { Badge, BadgeAnchor, type BadgeLabels } from '@/registry/ds/ui/badge';
import { Button } from '@/registry/ds/ui/button';

const tones = ['error', 'primary', 'success', 'warning', 'neutral'] as const;

const still = { provider: { motion: 'disabled' as const } };

function shown(element: Element) {
  return element.querySelector('[data-slot="badge-label"]')?.textContent;
}

describe('Badge', () => {
  it('shows a count and reads it with the English default label', async () => {
    const screen = await renderWithDS(<Badge count={3} data-testid="badge" />);
    const badge = screen.getByTestId('badge');
    await expect.element(badge).toHaveAttribute('data-size', 'large');
    await expect.element(badge).toHaveAttribute('data-tone', 'error');
    await expect.element(screen.getByText('3 new')).toBeInTheDocument();
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

  it('renders a small dot without a count', async () => {
    const screen = await renderWithDS(<Badge data-testid="dot" />, still);
    const dot = screen.getByTestId('dot');
    await expect.element(dot).toHaveAttribute('data-size', 'small');
    const box = dot.element().getBoundingClientRect();
    expect(box.width).toBe(6);
    expect(box.height).toBe(6);
    await expect.element(screen.getByText('New')).toBeInTheDocument();
  });

  it('uses a custom label with a count placeholder', async () => {
    const screen = await renderWithDS(
      <Badge count={4} label="{count} unpaid projects" tone="warning" />,
    );
    await expect.element(screen.getByText('4 unpaid projects')).toBeInTheDocument();
  });

  it('shows a short text label as is', async () => {
    const screen = await renderWithDS(
      <Badge tone="primary" data-testid="badge">
        Beta
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    await expect.element(badge).toHaveAttribute('data-size', 'large');
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
      <Button variant="text" endIcon={<Badge count={12} />}>
        Projects
      </Button>,
    );
    await expect
      .element(screen.getByRole('button', { name: 'Projects 12 new' }))
      .toBeInTheDocument();
  });

  it.each(['en', 'ar'])('pins a dot to the top-end corner of its anchor in %s', async (locale) => {
    const screen = await renderWithDS(
      <BadgeAnchor data-testid="anchor" badge={<Badge data-testid="dot" />}>
        <NotificationsIcon className="size-6" />
      </BadgeAnchor>,
      { locale, ...still },
    );
    await expect.element(screen.getByTestId('dot')).toBeInTheDocument();
    const anchor = screen.getByTestId('anchor').element().getBoundingClientRect();
    const dot = screen.getByTestId('dot').element().getBoundingClientRect();
    expect(dot.top).toBe(anchor.top);
    if (locale === 'ar') expect(dot.left).toBe(anchor.left);
    else expect(dot.right).toBe(anchor.right);
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

  it.each(['en', 'ar'])('places a large badge 12px in from the end edge in %s', async (locale) => {
    const screen = await renderWithDS(
      <BadgeAnchor data-testid="anchor" badge={<Badge count={8} data-testid="badge" />}>
        <NotificationsIcon className="size-6" />
      </BadgeAnchor>,
      { locale, ...still },
    );
    await expect.element(screen.getByTestId('anchor')).toBeInTheDocument();
    const anchor = screen.getByTestId('anchor').element().getBoundingClientRect();
    const badge = screen.getByTestId('badge').element().getBoundingClientRect();
    if (locale === 'ar') {
      expect(badge.right).toBe(anchor.left + 12);
      expect(badge.left).toBeLessThan(anchor.left);
    } else {
      expect(badge.left).toBe(anchor.right - 12);
      expect(badge.right).toBeGreaterThan(anchor.right);
    }
    expect(badge.bottom).toBe(anchor.top + 14);
  });

  it('mirrors a circular anchor in RTL', async () => {
    const screen = await renderWithDS(
      <BadgeAnchor
        data-testid="anchor"
        overlap="circular"
        badge={<Badge tone="success" label="Online" data-testid="dot" />}
      >
        <span className="block size-10 rounded-full bg-primary-container" />
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
        <span className="block size-10 rounded-full bg-primary-container" />
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
            <Badge key={`dot-${tone}`} tone={tone} />
          ))}
          <Badge tone="primary">Beta</Badge>
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
