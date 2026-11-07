import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import { Button } from '@/registry/ds/ui/button';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
  defaultDynamicIslandLabels,
  type DynamicIslandProps,
} from '@/registry/ds/ui/dynamic-island';
import { IconButton } from '@/registry/ds/ui/icon-button';

function part(root: Element, name: string) {
  return root.querySelector<HTMLElement>(`[data-slot="${name}"]`);
}

function rect(element: Element | null) {
  return element!.getBoundingClientRect();
}

async function settle(ms = 700) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function frame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function scaleOf(element: Element) {
  const transform = getComputedStyle(element).transform;
  return transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a;
}

const hours = [
  { hour: '08:00', direct: 42, search: 31 },
  { hour: '09:00', direct: 58, search: 40 },
  { hour: '10:00', direct: 77, search: 52 },
];

function StatsIsland({
  onActiveIndexChange,
}: {
  onActiveIndexChange?: (index: number | null) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const shown =
    active == null
      ? 'Today 250'
      : `${hours[active].hour} ${hours[active].direct + hours[active].search}`;
  return (
    <DynamicIsland title="Visits today" defaultExpanded>
      <DynamicIslandCompact trailing="250" />
      <DynamicIslandExpanded>
        <span data-testid="readout">{shown}</span>
        <BarChart
          aria-label="Visits per hour"
          data={hours}
          category="hour"
          series={[
            { id: 'direct', label: 'Direct', value: 'direct' },
            { id: 'search', label: 'Search', value: 'search' },
          ]}
          layout="stacked"
          height={72}
          valueAxis={{ isVisible: false }}
          legend="none"
          tooltip="none"
          activeIndex={active}
          onActiveIndexChange={(index) => {
            setActive(index);
            onActiveIndexChange?.(index);
          }}
          className="[--chart-surface:var(--surface-container-lowest)]"
        />
      </DynamicIslandExpanded>
    </DynamicIsland>
  );
}

type TimerIslandProps = Partial<DynamicIslandProps> & { onPause?: () => void };

function TimerIsland({ onPause, ...props }: TimerIslandProps) {
  return (
    <DynamicIsland title="Timer" {...props}>
      <DynamicIslandCompact leading={<span data-testid="lead">T</span>} trailing="4:59" />
      <DynamicIslandExpanded>
        <div className="flex items-center gap-3">
          <Button onPress={onPause}>Pause</Button>
          <span className="ms-auto text-3xl">4:59</span>
        </div>
      </DynamicIslandExpanded>
    </DynamicIsland>
  );
}

function CallIsland() {
  const [hasEnded, setEnded] = useState(false);
  const [isExpanded, setExpanded] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  return (
    <DynamicIsland
      title={hasEnded ? 'Call ended' : 'Call'}
      activityKey={hasEnded ? 'ended' : 'call'}
      isExpanded={isExpanded}
      onExpandedChange={setExpanded}
      announcement={announcement}
    >
      <DynamicIslandCompact leading="C" trailing={hasEnded ? 'Ended' : '0:42'} />
      <DynamicIslandExpanded>
        <div className="flex items-center gap-3">
          <span className="flex-1">Mara Lind</span>
          <IconButton
            aria-label="End call"
            icon={<span>X</span>}
            onPress={() => {
              setEnded(true);
              setExpanded(false);
              setAnnouncement('Call ended');
            }}
          />
        </div>
      </DynamicIslandExpanded>
    </DynamicIsland>
  );
}

function Switcher() {
  const [activity, setActivity] = useState('timer');
  return (
    <div>
      <DynamicIsland title={activity} activityKey={activity}>
        <DynamicIslandCompact leading="A" trailing={activity} />
      </DynamicIsland>
      <button type="button" onClick={() => setActivity('music')}>
        Switch
      </button>
    </div>
  );
}

describe('DynamicIsland', () => {
  it('shows the compact face behind a named toggle', async () => {
    const screen = await renderWithDS(<TimerIsland />);
    const toggle = screen.getByRole('button', { name: 'Timer' });
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
    const faces = part(screen.container, 'dynamic-island-faces')!;
    await expect.element(toggle).toHaveAttribute('aria-controls', faces.id);
    await expect.element(toggle).toHaveAttribute('aria-describedby', faces.id);
    await expect.element(screen.getByText('4:59')).toBeVisible();
    expect(part(screen.container, 'dynamic-island-expanded')).toBeNull();
  });

  it('sizes the pill to the compact face and centres it', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 400 }}>
        <TimerIsland />
      </div>,
    );
    await settle(100);
    const pill = part(screen.container, 'dynamic-island-pill')!;
    const compact = part(screen.container, 'dynamic-island-compact')!;
    expect(rect(pill).height).toBe(36);
    expect(rect(pill).width).toBeCloseTo(rect(compact).width, 0);
    expect(rect(pill).left + rect(pill).width / 2).toBeCloseTo(
      200 + rect(screen.container.firstElementChild!.firstElementChild).left,
      0,
    );
    expect(getComputedStyle(pill).borderTopLeftRadius).toBe('40px');
  });

  it('expands on press and morphs to the expanded face', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 400 }}>
        <TimerIsland />
      </div>,
    );
    await screen.getByText('4:59').click({ force: true });
    const toggle = screen.getByRole('button', { name: 'Timer' });
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    await settle();
    const pill = part(screen.container, 'dynamic-island-pill')!;
    const expanded = part(screen.container, 'dynamic-island-expanded')!;
    expect(rect(pill).width).toBeCloseTo(rect(expanded).width, 0);
    expect(rect(pill).height).toBeCloseTo(rect(expanded).height, 0);
    expect(rect(expanded).width).toBe(320);
    expect(part(screen.container, 'dynamic-island-compact')).toBeNull();
    expect(rect(expanded).left).toBeCloseTo(rect(pill).left, 0);
    expect(screen.container.querySelector('[data-slot="dynamic-island"]')).toHaveAttribute(
      'data-expanded',
    );
  });

  it('grows on one spring and swaps the faces through a blur', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 400 }}>
        <TimerIsland />
      </div>,
    );
    await settle(100);
    const pill = part(screen.container, 'dynamic-island-pill')!;
    const start = rect(pill);
    await screen.getByRole('button', { name: 'Timer' }).click();
    await frame();
    await frame();
    const expanded = part(screen.container, 'dynamic-island-expanded')!;
    expect(getComputedStyle(expanded).filter).toMatch(/blur/);
    expect(part(screen.container, 'dynamic-island-compact')).not.toBeNull();
    await settle(90);
    const middle = rect(pill);
    expect(middle.width).toBeGreaterThan(start.width);
    expect(middle.width).toBeLessThan(320);
    expect(middle.left + middle.width / 2).toBeCloseTo(start.left + start.width / 2, 0);
    expect(middle.height / middle.width).toBeGreaterThan(36 / 320);
    await settle();
    expect(rect(pill).width).toBeCloseTo(320, 0);
    expect(getComputedStyle(expanded).filter).toBe('none');
    await screen.getByRole('button', { name: 'Timer' }).click();
    await settle(60);
    expect(expanded).toHaveAttribute('data-exiting');
    expect(expanded).toHaveAttribute('aria-hidden', 'true');
    expect(getComputedStyle(expanded).filter).toMatch(/blur\(\d*\.?\d*[1-9]/);
    await settle();
    expect(expanded.isConnected).toBe(false);
  });

  it('toggles from the keyboard and collapses with Escape', async () => {
    const onPause = vi.fn();
    const screen = await renderWithDS(<TimerIsland onPause={onPause} />);
    const toggle = screen.getByRole('button', { name: 'Timer' });
    await userEvent.keyboard('{Tab}');
    await expect.element(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Tab}');
    const pause = screen.getByRole('button', { name: 'Pause' });
    await expect.element(pause).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onPause).toHaveBeenCalledTimes(1);
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.element(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps inner controls as sibling buttons that do not toggle the island', async () => {
    const onPause = vi.fn();
    const screen = await renderWithDS(<TimerIsland defaultExpanded onPause={onPause} />);
    const toggle = screen.getByRole('button', { name: 'Timer' }).element();
    const pause = screen.getByRole('button', { name: 'Pause' }).element();
    expect(toggle.contains(pause)).toBe(false);
    expect(toggle.querySelector('button, a, [tabindex]')).toBeNull();
    expect(toggle.childElementCount).toBe(0);
    await screen.getByRole('button', { name: 'Pause' }).click();
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves focus to the toggle when the focused control leaves with its face', async () => {
    const screen = await renderWithDS(<CallIsland />);
    await settle(100);
    const end = screen.getByRole('button', { name: 'End call' });
    await end.click();
    const toggle = screen.getByRole('button', { name: 'Call ended' });
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.element(toggle).toHaveFocus();
  });

  it('announces discrete events in a polite status region', async () => {
    const screen = await renderWithDS(<CallIsland />);
    const status = screen.getByRole('status');
    await expect.element(status).toBeEmptyDOMElement();
    expect(status.element().closest('[data-slot="dynamic-island-pill"]')).toBeNull();
    await screen.getByRole('button', { name: 'End call' }).click();
    await expect.element(status).toHaveTextContent('Call ended');
    expect(status.element().textContent).not.toContain('0:42');
  });

  it('is a plain status pill without an expanded face', async () => {
    const screen = await renderWithDS(
      <DynamicIsland title="Syncing" announcement="">
        <DynamicIslandCompact leading="S" trailing="3 of 8" />
      </DynamicIsland>,
    );
    await settle(50);
    expect(screen.container.querySelector('button')).toBeNull();
    await expect.element(screen.getByText('3 of 8')).toBeVisible();
    expect(rect(part(screen.container, 'dynamic-island-pill')).height).toBe(36);
  });

  it('can be disabled', async () => {
    const screen = await renderWithDS(<TimerIsland isDisabled />);
    const toggle = screen.getByRole('button', { name: 'Timer' });
    await expect.element(toggle).toBeDisabled();
    await screen.getByText('4:59').click({ force: true });
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('follows isExpanded when controlled', async () => {
    const onExpandedChange = vi.fn();
    const screen = await renderWithDS(
      <TimerIsland isExpanded={false} onExpandedChange={onExpandedChange} />,
    );
    const toggle = screen.getByRole('button', { name: 'Timer' });
    await toggle.click();
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
    await screen.rerender(<TimerIsland isExpanded onExpandedChange={onExpandedChange} />);
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect.element(screen.getByRole('button', { name: 'Pause' })).toBeVisible();
  });

  it('nudges when the activity changes', async () => {
    const screen = await renderWithDS(<Switcher />);
    await settle(100);
    const nudge = part(screen.container, 'dynamic-island-nudge')!;
    expect(scaleOf(nudge)).toBe(1);
    await screen.getByRole('button', { name: 'Switch' }).click();
    let peak = 1;
    for (let index = 0; index < 6; index += 1) {
      await frame();
      peak = Math.max(peak, scaleOf(nudge));
    }
    expect(peak).toBeGreaterThan(1.01);
    expect(peak).toBeLessThanOrEqual(1.08);
    await settle();
    expect(scaleOf(nudge)).toBeCloseTo(1, 3);
  });

  it('scales the pill down while the toggle is pressed', async () => {
    const screen = await renderWithDS(<TimerIsland />);
    const pill = part(screen.container, 'dynamic-island-pill')!;
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter>}');
    await settle(320);
    expect(getComputedStyle(pill).scale).toBe('0.97');
    await userEvent.keyboard('{/Enter}');
    await settle(320);
    expect(getComputedStyle(pill).scale).toBe('none');
  });

  it('snaps the size, fades the faces and skips the nudge with reduced motion', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 400 }}>
        <TimerIsland />
        <Switcher />
      </div>,
      { provider: { motion: 'reduced' } },
    );
    await settle(100);
    await screen.getByRole('button', { name: 'Timer' }).click();
    await frame();
    await frame();
    const pill = part(screen.container, 'dynamic-island-pill')!;
    const expanded = part(screen.container, 'dynamic-island-expanded')!;
    expect(rect(pill).width).toBeCloseTo(rect(expanded).width, 0);
    expect(rect(pill).height).toBeCloseTo(rect(expanded).height, 0);
    expect(getComputedStyle(expanded).filter).toBe('none');
    expect(getComputedStyle(expanded).transform).toBe('none');
    const nudges = screen.container.querySelectorAll('[data-slot="dynamic-island-nudge"]');
    await screen.getByRole('button', { name: 'Switch' }).click();
    for (let index = 0; index < 4; index += 1) {
      await frame();
      expect(scaleOf(nudges[1])).toBe(1);
    }
    screen.getByRole('button', { name: 'Timer' }).element().focus();
    await userEvent.keyboard('{Enter>}');
    await settle(320);
    expect(getComputedStyle(pill).scale).toBe('none');
    await userEvent.keyboard('{/Enter}');
  });

  it('swaps faces at once when motion is disabled', async () => {
    const screen = await renderWithDS(<TimerIsland />, { provider: { motion: 'disabled' } });
    await settle(50);
    await screen.getByRole('button', { name: 'Timer' }).click();
    await frame();
    await frame();
    expect(part(screen.container, 'dynamic-island-compact')).toBeNull();
    expect(getComputedStyle(part(screen.container, 'dynamic-island-expanded')!).opacity).toBe('1');
  });

  it('formats the toggle name from labels', async () => {
    expect(defaultDynamicIslandLabels.toggle).toBe('{title}');
    const screen = await renderWithDS(
      <>
        <TimerIsland labels={{ toggle: 'Show {title}' }} />
        <TimerIsland title="Upload" />
      </>,
      { provider: { labels: { dynamicIsland: { toggle: '{title}, live activity' } } } },
    );
    await expect.element(screen.getByRole('button', { name: 'Show Timer' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'Upload, live activity' }))
      .toBeInTheDocument();
  });

  it('is dark in both themes with the dark tone and light with the light tone', async () => {
    for (const dark of [false, true]) {
      const screen = await renderWithDS(
        <>
          <TimerIsland />
          <TimerIsland tone="light" title="Light" />
          <span data-testid="dark" data-theme="dark" className="bg-surface-container-lowest" />
          <span data-testid="light" data-theme="light" className="bg-surface-raised" />
        </>,
        { dark },
      );
      const [darkPill, lightPill] = screen.container.querySelectorAll(
        '[data-slot="dynamic-island-pill"]',
      );
      expect(darkPill).toHaveAttribute('data-theme', 'dark');
      expect(lightPill).toHaveAttribute('data-theme', 'light');
      expect(getComputedStyle(darkPill).backgroundColor).toBe(
        getComputedStyle(screen.getByTestId('dark').element()).backgroundColor,
      );
      expect(getComputedStyle(lightPill).backgroundColor).toBe(
        getComputedStyle(screen.getByTestId('light').element()).backgroundColor,
      );
      expect(getComputedStyle(darkPill).colorScheme).toBe('dark');
      await screen.unmount();
    }
  });

  it('mirrors the compact face in right-to-left text and stays centred', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 400 }}>
        <TimerIsland />
      </div>,
      { locale: 'ar' },
    );
    await settle(100);
    const lead = rect(screen.getByTestId('lead').element());
    const trail = rect(screen.getByText('4:59').element());
    expect(lead.left).toBeGreaterThan(trail.left);
    const pill = rect(part(screen.container, 'dynamic-island-pill'));
    const root = rect(part(screen.container, 'dynamic-island'));
    expect(pill.left + pill.width / 2).toBeCloseTo(root.left + root.width / 2, 0);
  });

  it('keeps within a narrow screen', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 280 }}>
        <TimerIsland defaultExpanded />
      </div>,
    );
    await settle(100);
    expect(rect(part(screen.container, 'dynamic-island-expanded')).width).toBe(280);
    expect(rect(part(screen.container, 'dynamic-island-pill')).width).toBeCloseTo(280, 0);
  });

  it('holds a stacked bar chart whose keys move the readout without closing the island', async () => {
    const onActiveIndexChange = vi.fn();
    const screen = await renderWithDS(<StatsIsland onActiveIndexChange={onActiveIndexChange} />);
    const toggle = screen.getByRole('button', { name: 'Visits today' });
    const plot = screen.getByRole('group', { name: 'Visits per hour' });
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');

    await plot.click();
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    (plot.element() as HTMLElement).focus();
    await userEvent.keyboard('{Home}');
    await expect.element(screen.getByTestId('readout')).toHaveTextContent('08:00 73');
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(screen.getByTestId('readout')).toHaveTextContent('09:00 98');
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(1);
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');

    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const themed = await renderWithDS(<StatsIsland />, options);
      await settle();
      await expectNoA11yViolations(themed.container);
      await themed.unmount();
    }
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <TimerIsland />
          <TimerIsland defaultExpanded title="Open timer" />
          <TimerIsland tone="light" title="Light timer" />
          <TimerIsland tone="light" defaultExpanded title="Open light timer" />
          <CallIsland />
        </div>,
        options,
      );
      await settle();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
