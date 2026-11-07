import { useState } from 'react';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { ActivityBars } from '@/registry/ds/ui/activity-bars';

function bars(root: Element) {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-slot="bar"]'));
}

function Player() {
  const [isActive, setActive] = useState(true);
  return (
    <div>
      <ActivityBars isActive={isActive} />
      <button type="button" onClick={() => setActive(!isActive)}>
        Toggle
      </button>
    </div>
  );
}

describe('ActivityBars', () => {
  it('is decorative by default', async () => {
    const screen = await renderWithDS(<ActivityBars />);
    const root = screen.container.querySelector('[data-slot="activity-bars"]')!;
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.getAttribute('role')).toBeNull();
    expect(bars(root)).toHaveLength(4);
  });

  it('becomes a named image when labelled', async () => {
    const screen = await renderWithDS(
      <>
        <ActivityBars aria-label="Speaking" />
        <span id="playing">Playing</span>
        <ActivityBars aria-labelledby="playing" />
      </>,
    );
    await expect.element(screen.getByRole('img', { name: 'Speaking' })).toBeInTheDocument();
    await expect.element(screen.getByRole('img', { name: 'Playing' })).toBeInTheDocument();
    expect(
      screen.container.querySelector('[aria-hidden="true"][data-slot="activity-bars"]'),
    ).toBeNull();
  });

  it.each([3, 4, 5] as const)('draws %i bars', async (count) => {
    const screen = await renderWithDS(<ActivityBars count={count} />);
    const root = screen.container.querySelector<HTMLElement>('[data-slot="activity-bars"]')!;
    expect(bars(root)).toHaveLength(count);
    const width = root.getBoundingClientRect().width;
    expect(width).toBeCloseTo(count * 3 + (count - 1) * 2, 0);
  });

  it.each([
    ['sm', 12, 2],
    ['md', 16, 3],
    ['lg', 24, 4],
  ] as const)('sizes %s bars %ipx tall and %ipx wide', async (size, height, width) => {
    const screen = await renderWithDS(<ActivityBars size={size} isActive={false} />);
    const root = screen.container.querySelector<HTMLElement>('[data-slot="activity-bars"]')!;
    expect(root.getBoundingClientRect().height).toBe(height);
    const [bar] = bars(root);
    expect(bar.getBoundingClientRect().width).toBe(width);
    expect(bar.getBoundingClientRect().height).toBeCloseTo(height / 4, 0);
    expect(getComputedStyle(bar).borderRadius).not.toBe('0px');
  });

  it('paints the bars in the current text colour', async () => {
    const screen = await renderWithDS(
      <div className="text-tertiary">
        <ActivityBars />
        <span data-testid="reference" className="bg-tertiary" />
      </div>,
    );
    const [bar] = bars(screen.container);
    expect(getComputedStyle(bar).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId('reference').element()).backgroundColor,
    );
  });

  it('runs each bar at its own speed', async () => {
    const screen = await renderWithDS(<ActivityBars count={5} />);
    const styles = bars(screen.container).map((bar) => getComputedStyle(bar));
    for (const style of styles) {
      expect(style.animationName).toBe('ds-activity-bar');
      expect(style.animationIterationCount).toBe('infinite');
      expect(style.animationDirection).toBe('alternate');
    }
    expect(new Set(styles.map((style) => style.animationDuration)).size).toBe(5);
  });

  it('lies down when inactive', async () => {
    const screen = await renderWithDS(<ActivityBars isActive={false} />);
    const root = screen.container.querySelector('[data-slot="activity-bars"]')!;
    expect(root.hasAttribute('data-active')).toBe(false);
    for (const bar of bars(root)) {
      expect(getComputedStyle(bar).animationName).toBe('none');
      expect(bar.getBoundingClientRect().height).toBe(4);
    }
  });

  it('eases down to rest when paused and starts again when resumed', async () => {
    const screen = await renderWithDS(<Player />);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const button = screen.getByRole('button', { name: 'Toggle' });
    await button.click();
    const paused = bars(screen.container);
    expect(paused.every((bar) => getComputedStyle(bar).animationName === 'none')).toBe(true);
    expect(paused.every((bar) => bar.getAnimations().length === 1)).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(paused.every((bar) => bar.getBoundingClientRect().height === 4)).toBe(true);
    await button.click();
    expect(
      bars(screen.container).every(
        (bar) => getComputedStyle(bar).animationName === 'ds-activity-bar',
      ),
    ).toBe(true);
  });

  it('holds a still silhouette with reduced motion', async () => {
    for (const motion of ['reduced', 'disabled'] as const) {
      const screen = await renderWithDS(<ActivityBars />, { provider: { motion } });
      const heights = bars(screen.container).map((bar) => {
        expect(getComputedStyle(bar).animationName).toBe('none');
        return bar.getBoundingClientRect().height;
      });
      expect(heights).toEqual([8.8, 16, 11.2, 13.6].map((value) => expect.closeTo(value, 0)));
      expect(new Set(heights).size).toBe(4);
      await screen.unmount();
    }
  });

  it('keeps its order in right-to-left text', async () => {
    const screen = await renderWithDS(<ActivityBars isActive={false} />, { locale: 'ar' });
    const root = screen.container.querySelector<HTMLElement>('[data-slot="activity-bars"]')!;
    const [first, second] = bars(root).map((bar) => bar.getBoundingClientRect().left);
    expect(first).toBeGreaterThan(second);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex items-center gap-4 p-4 text-primary">
          <ActivityBars />
          <ActivityBars aria-label="Speaking" size="sm" />
          <ActivityBars isActive={false} size="lg" count={5} />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
