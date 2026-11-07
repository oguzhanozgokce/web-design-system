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

    await toggle.click();
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.element(toggle).toHaveAttribute('data-selected', 'true');
    expect(onChange).toHaveBeenLastCalledWith(true);

    toggle.element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(onChange).toHaveBeenLastCalledWith(false);
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

  it('tints the selected toggle, leaves the rest neutral and dims it when disabled', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <ToggleButton>Soft off</ToggleButton>
        <ToggleButton defaultSelected>Soft on</ToggleButton>
        <ToggleButton variant="ghost">Ghost off</ToggleButton>
        <ToggleButton variant="ghost" defaultSelected>
          Ghost on
        </ToggleButton>
        <ToggleButton defaultSelected isDisabled>
          Soft locked
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
    expect(style('Soft locked').backgroundColor).toBe(selected.backgroundColor);
    expect(style('Soft locked').opacity).toBe('0.5');
    expect(style('Soft locked').cursor).toBe('not-allowed');
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

  it('hides the separators around the selection in an attached group and spaces a detached one by 4px', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <>
        <ToggleButtonGroup
          aria-label="Range"
          defaultSelectedKeys={['week']}
          onSelectionChange={onSelectionChange}
        >
          <ToggleButton id="day">Day</ToggleButton>
          <ToggleButton id="week">Week</ToggleButton>
          <ToggleButton id="month">Month</ToggleButton>
          <ToggleButton id="year">Year</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup aria-label="Period" variant="detached">
          <ToggleButton id="quarter">Quarter</ToggleButton>
          <ToggleButton id="half">Half</ToggleButton>
        </ToggleButtonGroup>
      </>,
    );
    const shown = (name: string) => {
      const style = getComputedStyle(screen.getByRole('radio', { name }).element(), '::before');
      return style.display !== 'none' && style.content !== 'none' && style.content !== 'normal';
    };
    const attached = screen.getByRole('radiogroup', { name: 'Range' });
    await expect.element(attached).toHaveAttribute('data-variant', 'attached');
    const detached = screen.getByRole('radiogroup', { name: 'Period' });
    await expect.element(detached).toHaveAttribute('data-variant', 'detached');
    expect(getComputedStyle(detached.element()).columnGap).toBe('4px');
    expect(shown('Week')).toBe(false);
    expect(shown('Month')).toBe(false);
    expect(shown('Year')).toBe(true);

    await screen.getByRole('radio', { name: 'Year' }).click();
    await expect
      .element(screen.getByRole('radio', { name: 'Year' }))
      .toHaveAttribute('aria-checked', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set<Key>(['year']));
    expect(shown('Week')).toBe(true);
    expect(shown('Month')).toBe(true);
    expect(shown('Year')).toBe(false);
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
