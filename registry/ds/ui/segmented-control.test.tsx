import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { GridViewIcon, ListIcon } from '@/registry/ds/lib/icons';
import {
  SegmentedControl,
  SegmentedControlItem,
  type SegmentedControlProps,
} from '@/registry/ds/ui/segmented-control';

const still = { provider: { motion: 'reduced' as const } };

function Period(props: Omit<SegmentedControlProps, 'children'>) {
  return (
    <SegmentedControl aria-label="Period" defaultSelectedKeys={['week']} {...props}>
      <SegmentedControlItem id="day">Day</SegmentedControlItem>
      <SegmentedControlItem id="week">Week</SegmentedControlItem>
      <SegmentedControlItem id="quarter">Quarter</SegmentedControlItem>
    </SegmentedControl>
  );
}

function thumbOf(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-slot="thumb"]');
}

function expectAligned(a: DOMRect, b: DOMRect) {
  expect(a.left).toBeCloseTo(b.left, 0);
  expect(a.right).toBeCloseTo(b.right, 0);
}

describe('SegmentedControl', () => {
  it('selects on press and keeps one segment selected', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(<Period onSelectionChange={onSelectionChange} />);
    const quarter = screen.getByRole('radio', { name: 'Quarter' });
    await quarter.click();
    await expect.element(quarter).toHaveAttribute('aria-checked', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['quarter']));

    await quarter.click();
    await expect.element(quarter).toHaveAttribute('aria-checked', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['quarter']));
    await expect
      .element(screen.getByRole('radio', { name: 'Week' }))
      .toHaveAttribute('aria-checked', 'false');
  });

  it('allows several segments in multiple mode and shows a check on each', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <SegmentedControl
        aria-label="Remind by"
        selectionMode="multiple"
        defaultSelectedKeys={['email']}
        onSelectionChange={onSelectionChange}
      >
        <SegmentedControlItem id="email">Email</SegmentedControlItem>
        <SegmentedControlItem id="sms">SMS</SegmentedControlItem>
        <SegmentedControlItem id="push">Push</SegmentedControlItem>
      </SegmentedControl>,
      still,
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Remind by' });
    await expect.element(toolbar).toBeVisible();
    await expect.element(toolbar).toHaveAttribute('data-selection-mode', 'multiple');
    const email = screen.getByRole('button', { name: 'Email' });
    const sms = screen.getByRole('button', { name: 'SMS' });
    await expect.element(email).toHaveAttribute('aria-pressed', 'true');
    await sms.click();
    await expect.element(sms).toHaveAttribute('aria-pressed', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['email', 'sms']));

    const check = (button: HTMLElement) =>
      button.querySelector<HTMLElement>('[data-slot="check"]')!.getBoundingClientRect().width;
    expect(check(sms.element() as HTMLElement)).toBeGreaterThan(0);
    const push = screen.getByRole('button', { name: 'Push' }).element() as HTMLElement;
    expect(check(push)).toBe(0);
    expect(thumbOf(screen.container)).toBeNull();
    const fill = (element: Element) => getComputedStyle(element).backgroundColor;
    expect(fill(email.element())).not.toBe(fill(push));

    await email.click();
    await expect.element(email).toHaveAttribute('aria-pressed', 'false');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['sms']));
  });

  it('swaps an icon for the check when a segment with an icon is selected', async () => {
    const screen = await renderWithDS(
      <SegmentedControl aria-label="Layout" defaultSelectedKeys={['list']} showCheckmark>
        <SegmentedControlItem id="list" icon={<ListIcon data-testid="list-icon" />}>
          List
        </SegmentedControlItem>
        <SegmentedControlItem id="grid" icon={<GridViewIcon data-testid="grid-icon" />}>
          Grid
        </SegmentedControlItem>
      </SegmentedControl>,
    );
    await expect.element(screen.getByTestId('list-icon')).not.toBeInTheDocument();
    await expect.element(screen.getByTestId('grid-icon')).toBeInTheDocument();
    await screen.getByRole('radio', { name: 'Grid' }).click();
    await expect.element(screen.getByTestId('list-icon')).toBeInTheDocument();
    await expect.element(screen.getByTestId('grid-icon')).not.toBeInTheDocument();
  });

  it('measures the thumb onto the selected segment and follows the selection', async () => {
    const screen = await renderWithDS(<Period />, still);
    const group = screen.getByRole('radiogroup', { name: 'Period' });
    await expect.element(group).toHaveAttribute('data-thumb-ready', 'true');
    const thumb = thumbOf(screen.container)!;
    await expect.element(thumb).toHaveAttribute('data-visible');
    expectAligned(
      thumb.getBoundingClientRect(),
      screen.getByRole('radio', { name: 'Week' }).element().getBoundingClientRect(),
    );

    const quarter = screen.getByRole('radio', { name: 'Quarter' });
    await quarter.click();
    await expect.element(quarter).toHaveAttribute('aria-checked', 'true');
    expectAligned(thumb.getBoundingClientRect(), quarter.element().getBoundingClientRect());
  });

  it('places the thumb from the start edge in RTL layouts', async () => {
    const screen = await renderWithDS(<Period />, { locale: 'ar', ...still });
    await expect
      .element(screen.getByRole('radiogroup', { name: 'Period' }))
      .toHaveAttribute('data-thumb-ready', 'true');
    const thumb = thumbOf(screen.container)!;
    const day = screen.getByRole('radio', { name: 'Day' });
    await day.click();
    const dayRect = day.element().getBoundingClientRect();
    const weekRect = screen.getByRole('radio', { name: 'Week' }).element().getBoundingClientRect();
    expect(dayRect.left).toBeGreaterThan(weekRect.left);
    expectAligned(thumb.getBoundingClientRect(), dayRect);
  });

  it('re-measures the thumb when an ancestor changes direction', async () => {
    const screen = await renderWithDS(<Period defaultSelectedKeys={['day']} />);
    const group = screen.getByRole('radiogroup', { name: 'Period' });
    await expect.element(group).toHaveAttribute('data-thumb-ready', 'true');
    const thumb = thumbOf(screen.container)!;
    const day = screen.getByRole('radio', { name: 'Day' }).element();
    expectAligned(thumb.getBoundingClientRect(), day.getBoundingClientRect());

    screen.getByTestId('ds-root').element().setAttribute('dir', 'rtl');
    await expect
      .poll(() => thumb.getBoundingClientRect().right)
      .toBeCloseTo(day.getBoundingClientRect().right, 0);
    expectAligned(thumb.getBoundingClientRect(), day.getBoundingClientRect());
  });

  it('places the thumb without a slide when it first appears', async () => {
    function Switching() {
      const [mode, setMode] = useState<'single' | 'multiple'>('single');
      return (
        <>
          <Period selectionMode={mode} />
          <button
            type="button"
            onClick={() => setMode((current) => (current === 'single' ? 'multiple' : 'single'))}
          >
            Switch mode
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Switching />);
    const group = screen.container.querySelector<HTMLElement>('[data-slot="segmented-control"]')!;
    await expect.element(group).toHaveAttribute('data-thumb-ready', 'true');
    const toggle = screen.getByRole('button', { name: 'Switch mode' });
    await toggle.click();
    await expect.element(group).toHaveAttribute('data-selection-mode', 'multiple');
    expect(thumbOf(screen.container)).toBeNull();
    await toggle.click();
    await expect.element(group).toHaveAttribute('data-selection-mode', 'single');
    const thumb = thumbOf(screen.container)!;
    expect(thumb.getAnimations()).toHaveLength(0);
    expectAligned(
      thumb.getBoundingClientRect(),
      screen.getByRole('radio', { name: 'Week' }).element().getBoundingClientRect(),
    );
  });

  it('turns the thumb transition off when motion is reduced', async () => {
    const screen = await renderWithDS(<Period />, still);
    await expect
      .element(screen.getByRole('radiogroup', { name: 'Period' }))
      .toHaveAttribute('data-thumb-ready', 'true');
    expect(getComputedStyle(thumbOf(screen.container)!).transitionProperty).toBe('none');
  });

  it('re-measures the thumb when a segment resizes', async () => {
    function Growing() {
      const [label, setLabel] = useState('Week');
      return (
        <>
          <SegmentedControl aria-label="Period" defaultSelectedKeys={['week']}>
            <SegmentedControlItem id="day">Day</SegmentedControlItem>
            <SegmentedControlItem id="week">{label}</SegmentedControlItem>
          </SegmentedControl>
          <button type="button" onClick={() => setLabel('Calendar week')}>
            Rename
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Growing />, still);
    await screen.getByRole('button', { name: 'Rename' }).click();
    const week = screen.getByRole('radio', { name: 'Calendar week' });
    await expect.element(week).toBeVisible();
    await expect
      .poll(() => thumbOf(screen.container)!.getBoundingClientRect().width)
      .toBeCloseTo(week.element().getBoundingClientRect().width, 0);
  });

  it('follows controlled selectedKeys', async () => {
    function Controlled() {
      const [selected, setSelected] = useState<Set<Key>>(new Set(['day']));
      return (
        <>
          <Period selectedKeys={selected} onSelectionChange={setSelected} />
          <p>Showing {[...selected].join(', ')}</p>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    await screen.getByRole('radio', { name: 'Quarter' }).click();
    await expect.element(screen.getByText('Showing quarter')).toBeVisible();
  });

  it('stretches segments equally with fullWidth', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 360 }}>
        <Period fullWidth />
      </div>,
      still,
    );
    await expect
      .element(screen.getByRole('radiogroup', { name: 'Period' }))
      .toHaveAttribute('data-full-width', 'true');
    const widths = ['Day', 'Week', 'Quarter'].map(
      (name) => screen.getByRole('radio', { name }).element().getBoundingClientRect().width,
    );
    expect(widths[0]).toBeCloseTo(widths[2], 0);
    expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(348, 0);
  });

  it('sizes the track at 32, 40 and 48 pixels with segments 8 pixels shorter', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col items-start gap-2">
        <Period size="sm" />
        <Period />
        <Period size="lg" />
      </div>,
      still,
    );
    const groups = screen.getByRole('radiogroup').elements();
    expect(groups.map((group) => group.getBoundingClientRect().height)).toEqual([32, 40, 48]);
    expect(
      groups.map(
        (group) => group.querySelector('[data-slot="segment"]')!.getBoundingClientRect().height,
      ),
    ).toEqual([24, 32, 40]);
    expect(groups.map((group) => group.getAttribute('data-size'))).toEqual(['sm', 'md', 'lg']);
  });

  it('puts the selection on a raised pill over a neutral track', async () => {
    const screen = await renderWithDS(
      <>
        <span data-testid="track" className="bg-neutral-soft" />
        <span data-testid="pill" className="bg-surface-segment" />
        <Period />
      </>,
      still,
    );
    const group = screen.getByRole('radiogroup', { name: 'Period' });
    await expect.element(group).toHaveAttribute('data-thumb-ready', 'true');
    const fill = (testId: string) =>
      getComputedStyle(screen.getByTestId(testId).element()).backgroundColor;
    expect(getComputedStyle(group.element()).backgroundColor).toBe(fill('track'));
    const thumb = thumbOf(screen.container)!;
    expect(getComputedStyle(thumb).backgroundColor).toBe(fill('pill'));
    expect(getComputedStyle(thumb).boxShadow).not.toBe('none');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col items-start gap-4 p-4">
          <Period />
          <Period size="sm" />
          <Period size="lg" />
          <SegmentedControl
            aria-label="Remind by"
            selectionMode="multiple"
            defaultSelectedKeys={['email']}
          >
            <SegmentedControlItem id="email">Email</SegmentedControlItem>
            <SegmentedControlItem id="sms" isDisabled>
              SMS
            </SegmentedControlItem>
            <SegmentedControlItem id="layout" icon={<GridViewIcon />} aria-label="Grid" />
          </SegmentedControl>
          <Period isDisabled />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
