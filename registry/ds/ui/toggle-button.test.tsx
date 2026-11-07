import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { StarFilledIcon, StarIcon } from '@/registry/ds/lib/icons';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

function roleStyle(className: string) {
  const probe = document.createElement('span');
  probe.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(probe);
  const style = getComputedStyle(probe);
  const result = { backgroundColor: style.backgroundColor, color: style.color };
  probe.remove();
  return result;
}

function radius(element: Element, corner: 'TopLeft' | 'TopRight' = 'TopLeft') {
  return parseFloat(getComputedStyle(element)[`border${corner}Radius`]);
}

function label(element: Element) {
  return element.querySelector('[data-slot="label"] > :not([aria-hidden])')!;
}

describe('ToggleButton', () => {
  it('renders a soft pressed-state button that toggles on press', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <ToggleButton onChange={onChange}>Watch folder</ToggleButton>,
    );
    const toggle = screen.getByRole('button', { name: 'Watch folder' });
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect.element(toggle).toHaveAttribute('data-variant', 'soft');
    await expect.element(toggle).toHaveAttribute('data-size', 'md');
    await expect.element(toggle).not.toHaveAttribute('data-shape');
    expect(toggle.element().getBoundingClientRect().height).toBe(40);
    expect(radius(toggle.element())).toBe(9999);

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
            Pin to sidebar
          </ToggleButton>
          <p>{pinned ? 'Pinned' : 'Not pinned'}</p>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    const toggle = screen.getByRole('button', { name: 'Pin to sidebar' });
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

  it('tints the selected toggle and leaves the rest neutral', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <ToggleButton>Soft off</ToggleButton>
        <ToggleButton defaultSelected>Soft on</ToggleButton>
        <ToggleButton variant="ghost">Ghost off</ToggleButton>
        <ToggleButton variant="ghost" defaultSelected>
          Ghost on
        </ToggleButton>
      </div>,
    );
    const style = (name: string) =>
      getComputedStyle(screen.getByRole('button', { name }).element());
    await expect.element(screen.getByRole('button', { name: 'Soft on' })).toBeVisible();
    const selected = roleStyle('bg-primary-soft text-on-primary-soft');
    expect(style('Soft off').backgroundColor).toBe(roleStyle('bg-neutral-soft').backgroundColor);
    expect(style('Soft off').color).toBe(roleStyle('text-on-surface').color);
    expect(style('Ghost off').backgroundColor).toBe('rgba(0, 0, 0, 0)');
    for (const name of ['Soft on', 'Ghost on']) {
      expect(style(name).backgroundColor).toBe(selected.backgroundColor);
      expect(style(name).color).toBe(selected.color);
    }
  });

  it('turns the label semibold when selected without changing the width', async () => {
    const screen = await renderWithDS(<ToggleButton>Bold</ToggleButton>);
    const toggle = screen.getByRole('button', { name: 'Bold' });
    await expect.element(toggle).toBeVisible();
    const width = toggle.element().getBoundingClientRect().width;
    expect(getComputedStyle(label(toggle.element())).fontWeight).toBe('500');

    await toggle.click();
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(getComputedStyle(label(toggle.element())).fontWeight).toBe('600');
    expect(toggle.element().getBoundingClientRect().width).toBe(width);
  });

  it('scales down while pressed and keeps its pill shape', async () => {
    const screen = await renderWithDS(<ToggleButton>Bold</ToggleButton>);
    const toggle = screen.getByRole('button', { name: 'Bold' });
    await expect.element(toggle).toBeVisible();
    toggle.element().focus();
    await userEvent.keyboard('[Space>]');
    await expect.element(toggle).toHaveAttribute('data-pressed', 'true');
    await expect.poll(() => getComputedStyle(toggle.element()).scale).toBe('0.97');
    expect(radius(toggle.element())).toBe(9999);
    await userEvent.keyboard('[/Space]');
  });

  it('keeps its colours and halves its opacity when disabled', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <ToggleButton defaultSelected>Enabled</ToggleButton>
        <ToggleButton defaultSelected isDisabled>
          Disabled
        </ToggleButton>
      </div>,
    );
    const enabled = getComputedStyle(screen.getByRole('button', { name: 'Enabled' }).element());
    const disabled = getComputedStyle(screen.getByRole('button', { name: 'Disabled' }).element());
    expect(disabled.backgroundColor).toBe(enabled.backgroundColor);
    expect(disabled.opacity).toBe('0.5');
    expect(disabled.cursor).toBe('not-allowed');
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

  it('takes size and variant from a ButtonGroup and maps button variants onto toggles', async () => {
    const screen = await renderWithDS(
      <>
        <ButtonGroup aria-label="Format" size="sm" buttonVariant="solid">
          <ToggleButton>Bold</ToggleButton>
          <ToggleButton variant="ghost">Italic</ToggleButton>
        </ButtonGroup>
        <ButtonGroup aria-label="Text" buttonVariant="outline" isDisabled>
          <ToggleButton>Underline</ToggleButton>
        </ButtonGroup>
      </>,
    );
    const bold = screen.getByRole('button', { name: 'Bold' });
    await expect.element(bold).toHaveAttribute('data-variant', 'soft');
    await expect.element(bold).toHaveAttribute('data-size', 'sm');
    await expect
      .element(screen.getByRole('button', { name: 'Italic' }))
      .toHaveAttribute('data-variant', 'ghost');
    const underline = screen.getByRole('button', { name: 'Underline' });
    await expect.element(underline).toHaveAttribute('data-variant', 'ghost');
    await expect.element(underline).toBeDisabled();
  });
});

describe('ToggleButtonGroup', () => {
  it('works as a radio group in single selection mode', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <ToggleButtonGroup
        aria-label="Upload period"
        defaultSelectedKeys={['week']}
        disallowEmptySelection
        onSelectionChange={onSelectionChange}
      >
        <ToggleButton id="day">Day</ToggleButton>
        <ToggleButton id="week">Week</ToggleButton>
        <ToggleButton id="month">Month</ToggleButton>
      </ToggleButtonGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Upload period' });
    await expect.element(group).toHaveAttribute('data-variant', 'attached');
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
      const [selected, setSelected] = useState<Set<Key>>(new Set(['photos']));
      return (
        <>
          <ToggleButtonGroup
            aria-label="File type"
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={setSelected}
          >
            <ToggleButton id="photos">Photos</ToggleButton>
            <ToggleButton id="videos">Videos</ToggleButton>
            <ToggleButton id="documents">Documents</ToggleButton>
          </ToggleButtonGroup>
          <output>{[...selected].sort().join(',')}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Filters />);
    await expect.element(screen.getByRole('toolbar', { name: 'File type' })).toBeVisible();
    await screen.getByRole('button', { name: 'Documents' }).click();
    await expect.element(screen.getByText('documents,photos')).toBeVisible();
    await screen.getByRole('button', { name: 'Photos' }).click();
    await expect.element(screen.getByText('documents', { exact: true })).toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'Documents' }))
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
      <ToggleButtonGroup aria-label="Density" size="sm" buttonVariant="ghost">
        <ToggleButton id="compact">Compact</ToggleButton>
        <ToggleButton id="comfortable" variant="soft" size="lg">
          Comfortable
        </ToggleButton>
      </ToggleButtonGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Density' });
    await expect.element(group).toHaveAttribute('data-size', 'sm');
    const compact = screen.getByRole('radio', { name: 'Compact' });
    await expect.element(compact).toHaveAttribute('data-variant', 'ghost');
    await expect.element(compact).toHaveAttribute('data-size', 'sm');
    const comfortable = screen.getByRole('radio', { name: 'Comfortable' });
    await expect.element(comfortable).toHaveAttribute('data-variant', 'soft');
    await expect.element(comfortable).toHaveAttribute('data-size', 'lg');
  });

  it('takes size, variant and disabled state from an enclosing ButtonGroup', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Editor" size="sm" buttonVariant="ghost" isDisabled>
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
    await expect.element(centre).toHaveAttribute('data-variant', 'ghost');
    await expect.element(centre).toBeDisabled();
    await centre.click({ force: true });
    await expect.element(centre).toHaveAttribute('aria-checked', 'false');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('joins an attached group into one pill and hides the separators around the selection', async () => {
    const screen = await renderWithDS(
      <ToggleButtonGroup aria-label="Range" defaultSelectedKeys={['week']}>
        <ToggleButton id="day">Day</ToggleButton>
        <ToggleButton id="week">Week</ToggleButton>
        <ToggleButton id="month">Month</ToggleButton>
        <ToggleButton id="year">Year</ToggleButton>
      </ToggleButtonGroup>,
    );
    const shown = (name: string) => {
      const style = getComputedStyle(screen.getByRole('radio', { name }).element(), '::before');
      return style.display !== 'none' && style.content !== 'none' && style.content !== 'normal';
    };
    const day = screen.getByRole('radio', { name: 'Day' });
    await expect.element(day).toBeVisible();
    expect(radius(day.element())).toBe(9999);
    expect(radius(day.element(), 'TopRight')).toBe(0);
    expect(radius(screen.getByRole('radio', { name: 'Week' }).element())).toBe(0);
    expect(radius(screen.getByRole('radio', { name: 'Year' }).element(), 'TopRight')).toBe(9999);
    expect(shown('Week')).toBe(false);
    expect(shown('Month')).toBe(false);
    expect(shown('Year')).toBe(true);

    await screen.getByRole('radio', { name: 'Year' }).click();
    await expect
      .element(screen.getByRole('radio', { name: 'Year' }))
      .toHaveAttribute('aria-checked', 'true');
    expect(shown('Week')).toBe(true);
    expect(shown('Month')).toBe(true);
    expect(shown('Year')).toBe(false);
  });

  it('spaces a detached group by 4px and keeps each toggle a pill', async () => {
    const screen = await renderWithDS(
      <ToggleButtonGroup aria-label="Range" variant="detached" defaultSelectedKeys={['month']}>
        <ToggleButton id="month">Month</ToggleButton>
        <ToggleButton id="year">Year</ToggleButton>
      </ToggleButtonGroup>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Range' });
    await expect.element(group).toHaveAttribute('data-variant', 'detached');
    expect(getComputedStyle(group.element()).columnGap).toBe('4px');
    expect(radius(screen.getByRole('radio', { name: 'Month' }).element())).toBe(9999);
    expect(radius(screen.getByRole('radio', { name: 'Year' }).element())).toBe(9999);
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
          {(['soft', 'ghost'] as const).map((variant) => (
            <div key={variant} className="flex gap-2">
              <ToggleButton variant={variant}>Off</ToggleButton>
              <ToggleButton variant={variant} defaultSelected>
                On
              </ToggleButton>
              <ToggleButton variant={variant} defaultSelected isDisabled>
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
            aria-label="File type"
            selectionMode="multiple"
            buttonVariant="ghost"
            orientation="vertical"
            defaultSelectedKeys={['photos']}
          >
            <ToggleButton id="photos">Photos</ToggleButton>
            <ToggleButton id="videos">Videos</ToggleButton>
          </ToggleButtonGroup>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
