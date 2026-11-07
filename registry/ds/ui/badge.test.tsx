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
    await expect.element(screen.getByText('3 new')).toBeInTheDocument();
    const visible = screen
      .getByTestId('badge')
      .element()
      .querySelector('[data-slot="badge-label"]');
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

  it('renders a dot without a count, at the size scale of a count', async () => {
    const screen = await renderWithDS(
      <div className="flex items-start gap-2">
        <Badge data-testid="dot" />
        <Badge size="sm" data-testid="small-dot" />
        <Badge count={4} data-testid="md" />
        <Badge count={4} size="sm" data-testid="sm" />
      </div>,
      still,
    );
    await expect.element(screen.getByTestId('dot')).toHaveAttribute('data-dot', 'true');
    await expect.element(screen.getByText('New').first()).toBeInTheDocument();
    const box = (testId: string) => screen.getByTestId(testId).element().getBoundingClientRect();
    expect([box('dot').width, box('dot').height]).toEqual([8, 8]);
    expect([box('small-dot').width, box('small-dot').height]).toEqual([6, 6]);
    expect([box('md').width, box('md').height]).toEqual([20, 20]);
    expect([box('sm').width, box('sm').height]).toEqual([16, 16]);
  });

  it('fills solid badges with the solid roles and soft badges with the soft roles', async () => {
    const screen = await renderWithDS(
      <div>
        <Badge count={4} tone="success" data-testid="solid" />
        <Badge count={4} tone="success" variant="soft" data-testid="soft" />
        <span data-testid="solid-ref" className="bg-success-solid text-on-success-solid" />
        <span data-testid="soft-ref" className="bg-success-soft text-on-success-soft" />
      </div>,
    );
    const style = (testId: string) => getComputedStyle(screen.getByTestId(testId).element());
    expect(style('solid').backgroundColor).toBe(style('solid-ref').backgroundColor);
    expect(style('solid').color).toBe(style('solid-ref').color);
    expect(style('soft').backgroundColor).toBe(style('soft-ref').backgroundColor);
    expect(style('soft').color).toBe(style('soft-ref').color);
  });

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

  it('reads a custom label instead of its short text', async () => {
    const screen = await renderWithDS(
      <div>
        <Badge tone="primary" data-testid="short">
          Beta
        </Badge>
        <Badge tone="primary" label="New feature" data-testid="labelled">
          New
        </Badge>
        <Badge count={4} label="{count} open tasks" tone="warning" />
        <Badge count={4} data-testid="counted">
          New
        </Badge>
      </div>,
    );
    const short = screen.getByTestId('short').element();
    expect(shown(short)).toBe('Beta');
    expect(short.querySelector('[aria-hidden]')).toBeNull();
    await expect.element(screen.getByText('New feature')).toBeInTheDocument();
    const labelled = screen
      .getByTestId('labelled')
      .element()
      .querySelector('[data-slot="badge-label"]');
    expect(labelled?.textContent).toBe('New');
    expect(labelled?.getAttribute('aria-hidden')).toBe('true');
    await expect.element(screen.getByText('4 open tasks')).toBeInTheDocument();
    await expect.element(screen.getByText('4 new')).toBeInTheDocument();
    expect(shown(screen.getByTestId('counted').element())).toBe('4');
  });

  it('takes its text from labels, then DSProvider, then the English default', async () => {
    const replies: BadgeLabels['count'] = ({ count }) =>
      `${count} new ${count === '1' ? 'reply' : 'replies'}`;
    const screen = await renderWithDS(
      <div>
        <Badge count={5} />
        <Badge count={7} labels={{ count: '{count} okunmamış' }} />
        <Badge count={120} labels={{ overflow: '{max} üstü' }} data-testid="overflow" />
        <Badge tone="primary" />
        <Badge count={1} labels={{ count: replies }} />
        <Badge count={4} labels={{ count: replies }} />
      </div>,
      { provider: { labels: { badge: { count: '{count} yeni', dot: 'Yeni' } } } },
    );
    await expect.element(screen.getByText('5 yeni')).toBeInTheDocument();
    await expect.element(screen.getByText('7 okunmamış')).toBeInTheDocument();
    await expect.element(screen.getByText('99 üstü yeni')).toBeInTheDocument();
    expect(shown(screen.getByTestId('overflow').element())).toBe('99 üstü');
    await expect.element(screen.getByText('Yeni', { exact: true })).toBeInTheDocument();
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
    'pins a dot over the top-end corner of its anchor and a count a quarter outside it in %s',
    async (locale) => {
      const screen = await renderWithDS(
        <div className="flex gap-8 p-8">
          <BadgeAnchor data-testid="dot-anchor" badge={<Badge data-testid="dot" />}>
            <NotificationsIcon className="size-6" />
          </BadgeAnchor>
          <BadgeAnchor data-testid="count-anchor" badge={<Badge count={8} data-testid="count" />}>
            <NotificationsIcon className="size-6" />
          </BadgeAnchor>
        </div>,
        { locale, ...still },
      );
      await expect.element(screen.getByTestId('dot')).toHaveAttribute('data-size', 'sm');
      const rect = (testId: string) => screen.getByTestId(testId).element().getBoundingClientRect();
      const dotAnchor = rect('dot-anchor');
      const dot = rect('dot');
      expect(dot.width).toBe(6);
      expect(dot.top).toBeCloseTo(dotAnchor.top - 1.5, 1);
      if (locale === 'ar') expect(dot.left).toBeCloseTo(dotAnchor.left - 1.5, 1);
      else expect(dot.right).toBeCloseTo(dotAnchor.right + 1.5, 1);

      const countAnchor = rect('count-anchor');
      const count = rect('count');
      expect(count.height).toBe(16);
      if (locale === 'ar') {
        expect(count.right).toBe(countAnchor.left + 12);
        expect(count.left).toBe(countAnchor.left - 4);
      } else {
        expect(count.left).toBe(countAnchor.right - 12);
        expect(count.right).toBe(countAnchor.right + 4);
      }
      expect(count.top).toBe(countAnchor.top - 4);
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
    const anchored = (
      <div>
        <Badge count={2} data-testid="inline" />
        <BadgeAnchor badge={<Badge count={2} data-testid="anchored" />}>
          <NotificationsIcon className="size-6" />
        </BadgeAnchor>
      </div>
    );
    const moving = await renderWithDS(anchored);
    await expect.element(moving.getByTestId('anchored')).toBeInTheDocument();
    const duration = (testId: string) =>
      parseFloat(
        getComputedStyle(document.querySelector(`[data-testid="${testId}"]`)!).transitionDuration,
      );
    expect(duration('inline')).toBe(0);
    expect(duration('anchored')).toBeGreaterThan(0);
    await moving.unmount();

    const stillScreen = await renderWithDS(anchored, still);
    await expect.element(stillScreen.getByTestId('anchored')).toBeInTheDocument();
    expect(duration('anchored')).toBe(0);
  });

  it.each(['en', 'ar'])('centres on the rim of a circular anchor in %s', async (locale) => {
    const screen = await renderWithDS(
      <BadgeAnchor
        data-testid="anchor"
        overlap="circular"
        badge={<Badge tone="success" label="Online" data-testid="dot" />}
      >
        <span className="block size-10 rounded-full bg-neutral-soft" />
      </BadgeAnchor>,
      { locale, ...still },
    );
    await expect.element(screen.getByText('Online')).toBeInTheDocument();
    const anchor = screen.getByTestId('anchor').element().getBoundingClientRect();
    const dot = screen.getByTestId('dot').element().getBoundingClientRect();
    const inlineFraction = locale === 'ar' ? 0.146 : 0.854;
    expect(dot.left + dot.width / 2).toBeCloseTo(anchor.left + anchor.width * inlineFraction, 0);
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
