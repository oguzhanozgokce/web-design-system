import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { GridViewIcon, ListIcon } from '@/registry/ds/lib/icons';
import {
  SegmentedControl,
  SegmentedControlItem,
  type SegmentedControlProps,
  type SegmentedControlVariant,
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
  it('renders a labelled radio group with the default segment checked', async () => {
    const screen = await renderWithDS(<Period />);
    const group = screen.getByRole('radiogroup', { name: 'Period' });
    await expect.element(group).toHaveAttribute('data-variant', 'outlined');
    await expect.element(group).toHaveAttribute('data-size', 'md');
    await expect.element(group).toHaveAttribute('data-selection-mode', 'single');
    await expect.element(group).not.toHaveAttribute('data-full-width');
    await expect
      .element(screen.getByRole('radio', { name: 'Week' }))
      .toHaveAttribute('aria-checked', 'true');
    await expect
      .element(screen.getByRole('radio', { name: 'Day' }))
      .toHaveAttribute('aria-checked', 'false');
  });

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

  it('moves focus with arrow keys and selects with Space', async () => {
    const screen = await renderWithDS(<Period />);
    screen.getByRole('radio', { name: 'Week' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(screen.getByRole('radio', { name: 'Quarter' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect
      .element(screen.getByRole('radio', { name: 'Quarter' }))
      .toHaveAttribute('aria-checked', 'true');
  });

  it('mirrors the arrow keys in RTL layouts', async () => {
    const screen = await renderWithDS(<Period />, { locale: 'ar' });
    screen.getByRole('radio', { name: 'Week' }).element().focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(screen.getByRole('radio', { name: 'Quarter' })).toHaveFocus();
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
    expect(check(screen.getByRole('button', { name: 'Push' }).element() as HTMLElement)).toBe(0);

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
    const screen = await renderWithDS(<Period variant="thumb" />, still);
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
    const screen = await renderWithDS(<Period variant="thumb" />, { locale: 'ar', ...still });
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
    const screen = await renderWithDS(<Period variant="thumb" defaultSelectedKeys={['day']} />);
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

  it('slides the thumb with the spatial spring unless motion is reduced', async () => {
    const moving = await renderWithDS(<Period variant="thumb" />);
    await expect
      .element(moving.getByRole('radiogroup', { name: 'Period' }))
      .toHaveAttribute('data-thumb-ready', 'true');
    const thumb = thumbOf(moving.container)!;
    expect(getComputedStyle(thumb).transitionProperty).toBe('translate, width');
    expect(getComputedStyle(thumb).transitionTimingFunction).toMatch(/^linear\(/);
  });

  it('places the thumb without a slide when it first appears', async () => {
    function Switching() {
      const [variant, setVariant] = useState<SegmentedControlVariant>('thumb');
      return (
        <>
          <Period variant={variant} />
          <button
            type="button"
            onClick={() => setVariant((current) => (current === 'thumb' ? 'outlined' : 'thumb'))}
          >
            Switch style
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Switching />);
    const group = screen.getByRole('radiogroup', { name: 'Period' });
    await expect.element(group).toHaveAttribute('data-thumb-ready', 'true');
    const toggle = screen.getByRole('button', { name: 'Switch style' });
    await toggle.click();
    await expect.element(group).toHaveAttribute('data-variant', 'outlined');
    await toggle.click();
    await expect.element(group).toHaveAttribute('data-variant', 'thumb');
    const thumb = thumbOf(screen.container)!;
    expect(thumb.getAnimations()).toHaveLength(0);
    expectAligned(
      thumb.getBoundingClientRect(),
      screen.getByRole('radio', { name: 'Week' }).element().getBoundingClientRect(),
    );
  });

  it('turns the thumb transition off when motion is reduced', async () => {
    const screen = await renderWithDS(<Period variant="thumb" />, still);
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
          <SegmentedControl aria-label="Period" variant="thumb" defaultSelectedKeys={['week']}>
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

  it('gives each selected segment its own fill when the thumb style allows several', async () => {
    const screen = await renderWithDS(
      <SegmentedControl
        aria-label="Weekdays"
        variant="thumb"
        selectionMode="multiple"
        defaultSelectedKeys={['mon', 'wed']}
      >
        <SegmentedControlItem id="mon">Mon</SegmentedControlItem>
        <SegmentedControlItem id="tue">Tue</SegmentedControlItem>
        <SegmentedControlItem id="wed">Wed</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(thumbOf(screen.container)).toBeNull();
    const mon = screen.getByRole('button', { name: 'Mon' }).element();
    const tue = screen.getByRole('button', { name: 'Tue' }).element();
    expect(getComputedStyle(mon).backgroundColor).not.toBe(getComputedStyle(tue).backgroundColor);
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

  it('does not change when disabled', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(<Period isDisabled onSelectionChange={onSelectionChange} />);
    await screen.getByRole('radio', { name: 'Day' }).click({ force: true });
    expect(onSelectionChange).not.toHaveBeenCalled();
    await expect
      .element(screen.getByRole('radio', { name: 'Week' }))
      .toHaveAttribute('aria-checked', 'true');
  });

  it('stretches segments equally with fullWidth', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 360 }}>
        <Period fullWidth variant="thumb" />
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
    expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(352, 0);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col items-start gap-4 p-4">
          <Period />
          <Period variant="thumb" size="sm" />
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
