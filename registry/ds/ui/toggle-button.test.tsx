import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { StarFilledIcon, StarIcon } from '@/registry/ds/lib/icons';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

const still = { provider: { motion: 'disabled' as const } };

function radius(element: Element, corner: 'TopLeft' | 'TopRight' = 'TopLeft') {
  return parseFloat(getComputedStyle(element)[`border${corner}Radius`]);
}

describe('ToggleButton', () => {
  it('renders a pressed-state button that toggles on press', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <ToggleButton onChange={onChange}>Watch folder</ToggleButton>,
    );
    const toggle = screen.getByRole('button', { name: 'Watch folder' });
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect.element(toggle).toHaveAttribute('data-variant', 'filled');
    await expect.element(toggle).toHaveAttribute('data-shape', 'round');

    await toggle.click();
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.element(toggle).toHaveAttribute('data-selected', 'true');
    expect(onChange).toHaveBeenLastCalledWith(true);

    toggle.element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('follows a controlled isSelected value', async () => {
    function Controlled() {
      const [pinned, setPinned] = useState(true);
      return (
        <>
          <ToggleButton isSelected={pinned} onChange={setPinned}>
            Pin to dashboard
          </ToggleButton>
          <p>{pinned ? 'Pinned' : 'Not pinned'}</p>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    const toggle = screen.getByRole('button', { name: 'Pin to dashboard' });
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    await toggle.click();
    await expect.element(screen.getByText('Not pinned')).toBeVisible();
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('swaps to the selected icon while selected', async () => {
    const screen = await renderWithDS(
      <ToggleButton
        startIcon={<StarIcon data-testid="outline" />}
        selectedIcon={<StarFilledIcon data-testid="filled" />}
      >
        Favourite
      </ToggleButton>,
    );
    await expect.element(screen.getByTestId('outline')).toBeInTheDocument();
    await screen.getByRole('button', { name: 'Favourite' }).click();
    await expect.element(screen.getByTestId('filled')).toBeInTheDocument();
    await expect.element(screen.getByTestId('outline')).not.toBeInTheDocument();
  });

  it('morphs from a capsule to a rounded square when selected, and back for square shape', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <ToggleButton>Round</ToggleButton>
        <ToggleButton shape="square">Square</ToggleButton>
      </div>,
      still,
    );
    const round = screen.getByRole('button', { name: 'Round' });
    const square = screen.getByRole('button', { name: 'Square' });
    await expect.element(round).toBeVisible();

    expect(radius(round.element())).toBe(20);
    expect(radius(square.element())).toBe(12);

    await round.click();
    await square.click();
    await expect.element(round).toHaveAttribute('data-selected', 'true');
    await expect.element(square).toHaveAttribute('data-selected', 'true');
    expect(radius(round.element())).toBe(12);
    expect(radius(square.element())).toBe(20);

    round.element().focus();
    await userEvent.keyboard('[Space>]');
    await expect.element(round).toHaveAttribute('data-pressed', 'true');
    expect(radius(round.element())).toBe(8);
    await userEvent.keyboard('[/Space]');
    await expect.element(round).not.toHaveAttribute('data-pressed');
    await expect.element(round).not.toHaveAttribute('data-selected');
    expect(radius(round.element())).toBe(20);
  });

  it('animates the shape with the spatial spring unless motion is reduced', async () => {
    const animated = await renderWithDS(<ToggleButton>Bold</ToggleButton>);
    await expect.element(animated.getByRole('button')).toBeVisible();
    const animatedStyle = getComputedStyle(animated.getByRole('button').element());
    const radiusIndex = animatedStyle.transitionProperty.split(', ').indexOf('border-radius');
    expect(radiusIndex).toBeGreaterThan(-1);
    expect(animatedStyle.transitionDuration.split(', ')[radiusIndex]).not.toBe('0s');
    expect(animatedStyle.transitionTimingFunction).toContain('linear(');
    await animated.unmount();

    const reduced = await renderWithDS(<ToggleButton>Bold</ToggleButton>, {
      provider: { motion: 'reduced' },
    });
    await expect.element(reduced.getByRole('button')).toBeVisible();
    const reducedStyle = getComputedStyle(reduced.getByRole('button').element());
    expect(reducedStyle.transitionDuration.split(', ')[radiusIndex]).toBe('0s');
  });

  it('uses the selected container colour and keeps disabled colours when disabled', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <ToggleButton defaultSelected>Enabled</ToggleButton>
        <ToggleButton defaultSelected isDisabled>
          Disabled
        </ToggleButton>
        <ToggleButton>Idle</ToggleButton>
      </div>,
    );
    const enabled = screen.getByRole('button', { name: 'Enabled' });
    await expect.element(enabled).toBeVisible();
    const primary = getComputedStyle(screen.getByTestId('ds-root').element())
      .getPropertyValue('--primary')
      .trim();
    const probe = document.createElement('div');
    probe.style.backgroundColor = primary;
    document.body.append(probe);
    const primaryRgb = getComputedStyle(probe).backgroundColor;
    probe.remove();

    expect(getComputedStyle(enabled.element()).backgroundColor).toBe(primaryRgb);
    expect(
      getComputedStyle(screen.getByRole('button', { name: 'Disabled' }).element()).backgroundColor,
    ).not.toBe(primaryRgb);
    expect(
      getComputedStyle(screen.getByRole('button', { name: 'Idle' }).element()).backgroundColor,
    ).not.toBe(primaryRgb);
  });

  it('does not toggle when disabled', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <ToggleButton isDisabled onChange={onChange}>
        Archive
      </ToggleButton>,
    );
    await screen.getByRole('button', { name: 'Archive' }).click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('takes size and variant from a ButtonGroup but ignores the text variant', async () => {
    const screen = await renderWithDS(
      <>
        <ButtonGroup aria-label="Format" size="sm" buttonVariant="tonal">
          <ToggleButton>Bold</ToggleButton>
          <ToggleButton variant="outlined">Italic</ToggleButton>
        </ButtonGroup>
        <ButtonGroup aria-label="Text" buttonVariant="text" isDisabled>
          <ToggleButton>Underline</ToggleButton>
        </ButtonGroup>
      </>,
    );
    const bold = screen.getByRole('button', { name: 'Bold' });
    await expect.element(bold).toHaveAttribute('data-variant', 'tonal');
    await expect.element(bold).toHaveAttribute('data-size', 'sm');
    await expect
      .element(screen.getByRole('button', { name: 'Italic' }))
      .toHaveAttribute('data-variant', 'outlined');
    const underline = screen.getByRole('button', { name: 'Underline' });
    await expect.element(underline).toHaveAttribute('data-variant', 'filled');
    await expect.element(underline).toBeDisabled();
  });
});

describe('ToggleButtonGroup', () => {
  it('works as a radio group in single selection mode', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <ToggleButtonGroup
        aria-label="Traffic period"
        defaultSelectedKeys={['week']}
        disallowEmptySelection
        onSelectionChange={onSelectionChange}
      >
        <ToggleButton id="day">Day</ToggleButton>
        <ToggleButton id="week">Week</ToggleButton>
        <ToggleButton id="month">Month</ToggleButton>
      </ToggleButtonGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Traffic period' });
    await expect.element(group).toHaveAttribute('data-variant', 'connected');
    await expect
      .element(screen.getByRole('radio', { name: 'Week' }))
      .toHaveAttribute('aria-checked', 'true');

    await screen.getByRole('radio', { name: 'Month' }).click();
    await expect
      .element(screen.getByRole('radio', { name: 'Month' }))
      .toHaveAttribute('aria-checked', 'true');
    await expect
      .element(screen.getByRole('radio', { name: 'Week' }))
      .toHaveAttribute('aria-checked', 'false');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set<Key>(['month']));

    await screen.getByRole('radio', { name: 'Month' }).click();
    await expect
      .element(screen.getByRole('radio', { name: 'Month' }))
      .toHaveAttribute('aria-checked', 'true');
  });

  it('allows several toggles in multiple selection mode', async () => {
    function Filters() {
      const [selected, setSelected] = useState<Set<Key>>(new Set(['paid']));
      return (
        <>
          <ToggleButtonGroup
            aria-label="Order status"
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={setSelected}
          >
            <ToggleButton id="paid">Paid</ToggleButton>
            <ToggleButton id="pending">Pending</ToggleButton>
            <ToggleButton id="refunded">Refunded</ToggleButton>
          </ToggleButtonGroup>
          <output>{[...selected].sort().join(',')}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Filters />);
    await expect.element(screen.getByRole('toolbar', { name: 'Order status' })).toBeVisible();
    await screen.getByRole('button', { name: 'Refunded' }).click();
    await expect.element(screen.getByText('paid,refunded')).toBeVisible();
    await screen.getByRole('button', { name: 'Paid' }).click();
    await expect.element(screen.getByText('refunded', { exact: true })).toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'Refunded' }))
      .toHaveAttribute('aria-pressed', 'true');
  });

  it('moves focus with the arrow keys and mirrors them in RTL', async () => {
    const markup = (labels: string[]) => (
      <>
        <ToggleButtonGroup aria-label="View" defaultSelectedKeys={['list']}>
          <ToggleButton id="list">{labels[0]}</ToggleButton>
          <ToggleButton id="grid">{labels[1]}</ToggleButton>
        </ToggleButtonGroup>
        <button type="button">{labels[2]}</button>
      </>
    );

    const ltr = await renderWithDS(markup(['List', 'Grid', 'Export']));
    await expect.element(ltr.getByRole('radio', { name: 'List' })).toBeVisible();
    await userEvent.keyboard('{Tab}');
    await expect.element(ltr.getByRole('radio', { name: 'List' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(ltr.getByRole('radio', { name: 'Grid' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect
      .element(ltr.getByRole('radio', { name: 'Grid' }))
      .toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Tab}');
    await expect.element(ltr.getByRole('button', { name: 'Export' })).toHaveFocus();
    await ltr.unmount();

    const rtl = await renderWithDS(markup(['قائمة', 'شبكة', 'تصدير']), { locale: 'ar' });
    await expect.element(rtl.getByRole('radio', { name: 'قائمة' })).toBeVisible();
    rtl.getByRole('radio', { name: 'قائمة' }).element().focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(rtl.getByRole('radio', { name: 'شبكة' })).toHaveFocus();
  });

  it('follows the vertical orientation with the up and down arrows', async () => {
    const screen = await renderWithDS(
      <ToggleButtonGroup
        aria-label="Project view"
        orientation="vertical"
        defaultSelectedKeys={['list']}
      >
        <ToggleButton id="list">List</ToggleButton>
        <ToggleButton id="board">Board</ToggleButton>
        <ToggleButton id="table">Table</ToggleButton>
      </ToggleButtonGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Project view' });
    await expect.element(group).toHaveAttribute('data-orientation', 'vertical');
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('radio', { name: 'Board' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('radio', { name: 'Table' })).toHaveFocus();
    expect(
      Number(getComputedStyle(screen.getByRole('radio', { name: 'Table' }).element()).zIndex),
    ).toBeGreaterThan(0);
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(screen.getByRole('radio', { name: 'Board' })).toHaveFocus();
  });

  it('gives its toggles the group size and button variant unless they set their own', async () => {
    const screen = await renderWithDS(
      <ToggleButtonGroup aria-label="Density" size="sm" buttonVariant="outlined">
        <ToggleButton id="compact">Compact</ToggleButton>
        <ToggleButton id="comfortable" variant="tonal" size="lg">
          Comfortable
        </ToggleButton>
      </ToggleButtonGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Density' });
    await expect.element(group).toHaveAttribute('data-size', 'sm');
    const compact = screen.getByRole('radio', { name: 'Compact' });
    await expect.element(compact).toHaveAttribute('data-variant', 'outlined');
    await expect.element(compact).toHaveAttribute('data-size', 'sm');
    const comfortable = screen.getByRole('radio', { name: 'Comfortable' });
    await expect.element(comfortable).toHaveAttribute('data-variant', 'tonal');
    await expect.element(comfortable).toHaveAttribute('data-size', 'lg');
  });

  it('takes size, variant and disabled state from an enclosing ButtonGroup', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Editor" size="sm" buttonVariant="text" isDisabled>
        <ToggleButtonGroup
          aria-label="Alignment"
          defaultSelectedKeys={['start']}
          onSelectionChange={onSelectionChange}
        >
          <ToggleButton id="start">Start</ToggleButton>
          <ToggleButton id="centre">Centre</ToggleButton>
        </ToggleButtonGroup>
      </ButtonGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Alignment' });
    await expect.element(group).toHaveAttribute('data-size', 'sm');
    await expect.element(group).toHaveAttribute('data-disabled', 'true');
    const centre = screen.getByRole('radio', { name: 'Centre' });
    await expect.element(centre).toHaveAttribute('data-size', 'sm');
    await expect.element(centre).toHaveAttribute('data-variant', 'filled');
    await expect.element(centre).toBeDisabled();
    await centre.click({ force: true });
    await expect.element(centre).toHaveAttribute('aria-checked', 'false');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('rounds out the selected item of a connected group', async () => {
    const screen = await renderWithDS(
      <ToggleButtonGroup aria-label="Range" defaultSelectedKeys={['quarter']}>
        <ToggleButton id="month">Month</ToggleButton>
        <ToggleButton id="quarter">Quarter</ToggleButton>
        <ToggleButton id="year">Year</ToggleButton>
      </ToggleButtonGroup>,
      still,
    );
    const quarter = screen.getByRole('radio', { name: 'Quarter' });
    const year = screen.getByRole('radio', { name: 'Year' });
    await expect.element(quarter).toBeVisible();
    expect(radius(quarter.element())).toBe(20);
    expect(radius(year.element())).toBe(4);
    expect(radius(year.element(), 'TopRight')).toBe(20);

    await year.click();
    await expect.element(year).toHaveAttribute('aria-checked', 'true');
    expect(radius(year.element())).toBe(20);
    expect(radius(quarter.element())).toBe(4);
  });

  it('keeps each toggle’s own shape in a standard group', async () => {
    const screen = await renderWithDS(
      <ToggleButtonGroup aria-label="Range" variant="standard" defaultSelectedKeys={['month']}>
        <ToggleButton id="month">Month</ToggleButton>
        <ToggleButton id="year">Year</ToggleButton>
      </ToggleButtonGroup>,
      still,
    );
    const month = screen.getByRole('radio', { name: 'Month' });
    await expect.element(month).toBeVisible();
    expect(radius(month.element())).toBe(12);
    expect(radius(screen.getByRole('radio', { name: 'Year' }).element())).toBe(20);
  });

  it('disables every toggle when the group is disabled', async () => {
    const screen = await renderWithDS(
      <ToggleButtonGroup aria-label="Density" isDisabled defaultSelectedKeys={['compact']}>
        <ToggleButton id="compact">Compact</ToggleButton>
        <ToggleButton id="comfortable">Comfortable</ToggleButton>
      </ToggleButtonGroup>,
    );
    const comfortable = screen.getByRole('radio', { name: 'Comfortable' });
    await expect.element(comfortable).toBeDisabled();
    await comfortable.click({ force: true });
    await expect.element(comfortable).toHaveAttribute('aria-checked', 'false');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          {(['filled', 'tonal', 'outlined', 'elevated'] as const).map((variant) => (
            <div key={variant} className="flex gap-2">
              <ToggleButton variant={variant}>Off</ToggleButton>
              <ToggleButton variant={variant} defaultSelected>
                On
              </ToggleButton>
              <ToggleButton variant={variant} shape="square" defaultSelected isDisabled>
                Locked
              </ToggleButton>
            </div>
          ))}
          <ToggleButtonGroup aria-label="Period" defaultSelectedKeys={['week']}>
            <ToggleButton id="day">Day</ToggleButton>
            <ToggleButton id="week">Week</ToggleButton>
            <ToggleButton id="month">Month</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            aria-label="Status"
            selectionMode="multiple"
            buttonVariant="outlined"
            orientation="vertical"
            defaultSelectedKeys={['paid']}
          >
            <ToggleButton id="paid">Paid</ToggleButton>
            <ToggleButton id="refunded">Refunded</ToggleButton>
          </ToggleButtonGroup>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
