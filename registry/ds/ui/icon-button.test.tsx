import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import {
  DeleteIcon,
  EditIcon,
  FavoriteFilledIcon,
  FavoriteIcon,
  GridViewIcon,
  ListIcon,
  OpenInNewIcon,
  RefreshIcon,
} from '@/registry/ds/lib/icons';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import { IconButton, IconButtonLink, IconToggleButton } from '@/registry/ds/ui/icon-button';
import { ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

function roleStyle(className: string) {
  const probe = document.createElement('span');
  probe.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(probe);
  const style = getComputedStyle(probe);
  const result = {
    backgroundColor: style.backgroundColor,
    color: style.color,
    borderColor: style.borderTopColor,
  };
  probe.remove();
  return result;
}

describe('IconButton', () => {
  it('renders a ghost neutral circle named by aria-label', async () => {
    const screen = await renderWithDS(<IconButton aria-label="Edit project" icon={<EditIcon />} />);
    const button = screen.getByRole('button', { name: 'Edit project' });
    await expect.element(button).toBeVisible();
    await expect.element(button).toHaveAttribute('data-slot', 'icon-button');
    await expect.element(button).toHaveAttribute('data-variant', 'ghost');
    await expect.element(button).toHaveAttribute('data-tone', 'neutral');
    await expect.element(button).toHaveAttribute('data-size', 'md');
    await expect.element(button).not.toHaveAttribute('data-shape');
    await userEvent.unhover(button);
    await expect
      .poll(() => getComputedStyle(button.element()).backgroundColor)
      .toBe('rgba(0, 0, 0, 0)');
    const style = getComputedStyle(button.element());
    expect(style.color).toBe(roleStyle('text-on-surface').color);
    expect(style.borderTopLeftRadius).toBe('9999px');
    expect(style.cursor).toBe('pointer');
    expect(button.element().getBoundingClientRect().width).toBe(40);
    expect(button.element().getBoundingClientRect().height).toBe(40);
  });

  it('sizes the circle and its icon from xs to lg', async () => {
    const sizes = { xs: [28, 16], sm: [32, 16], md: [40, 20], lg: [48, 24] } as const;
    const screen = await renderWithDS(
      <div className="flex gap-2">
        {(Object.keys(sizes) as (keyof typeof sizes)[]).map((size) => (
          <IconButton key={size} size={size} aria-label={size} icon={<EditIcon />} />
        ))}
      </div>,
    );
    for (const [size, [box, icon]] of Object.entries(sizes)) {
      const button = screen.getByRole('button', { name: size }).element();
      expect(button.getBoundingClientRect().width).toBe(box);
      expect(button.getBoundingClientRect().height).toBe(box);
      expect(button.querySelector('svg')!.getBoundingClientRect().width).toBe(icon);
    }
  });

  it('paints every variant and tone from the shared button roles', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <IconButton aria-label="Solid" variant="solid" icon={<EditIcon />} />
        <IconButton aria-label="Soft" variant="soft" icon={<EditIcon />} />
        <IconButton aria-label="Soft primary" variant="soft" tone="primary" icon={<EditIcon />} />
        <IconButton aria-label="Outline" variant="outline" icon={<EditIcon />} />
        <IconButton aria-label="Delete" variant="ghost" tone="error" icon={<DeleteIcon />} />
      </div>,
    );
    const style = (name: string) =>
      getComputedStyle(screen.getByRole('button', { name, exact: true }).element());

    await expect
      .element(screen.getByRole('button', { name: 'Solid' }))
      .toHaveAttribute('data-tone', 'primary');
    expect(style('Solid').backgroundColor).toBe(roleStyle('bg-primary-solid').backgroundColor);
    expect(style('Solid').color).toBe(roleStyle('text-on-primary-solid').color);
    expect(style('Soft').backgroundColor).toBe(roleStyle('bg-neutral-soft').backgroundColor);
    expect(style('Soft primary').backgroundColor).toBe(
      roleStyle('bg-primary-soft').backgroundColor,
    );
    expect(style('Outline').borderTopColor).toBe(
      roleStyle('border border-outline-variant').borderColor,
    );
    expect(style('Delete').color).toBe(roleStyle('text-error').color);
  });

  it('scales down while pressed, more at xs, and stays still when motion is reduced', async () => {
    async function expectPressedScale(element: Element, scale: string) {
      (element as HTMLElement).focus();
      await userEvent.keyboard('[Space>]');
      await expect.poll(() => element.getAttribute('data-pressed')).toBe('true');
      await expect.poll(() => getComputedStyle(element).scale).toBe(scale);
      await userEvent.keyboard('[/Space]');
    }

    const screen = await renderWithDS(
      <div className="flex gap-2">
        <IconButton aria-label="Medium" icon={<EditIcon />} />
        <IconButton aria-label="Close" size="xs" icon={<EditIcon />} />
      </div>,
    );
    await expectPressedScale(screen.getByRole('button', { name: 'Medium' }).element(), '0.97');
    await expectPressedScale(screen.getByRole('button', { name: 'Close' }).element(), '0.93');
    await screen.unmount();

    const reduced = await renderWithDS(<IconButton aria-label="Medium" icon={<EditIcon />} />, {
      provider: { motion: 'reduced' },
    });
    const still = reduced.getByRole('button', { name: 'Medium' });
    await expect.element(still).toHaveAttribute('data-reduced-motion', 'true');
    still.element().focus();
    await userEvent.keyboard('[Space>]');
    await expect.element(still).toHaveAttribute('data-pressed', 'true');
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(getComputedStyle(still.element()).scale).toBe('1');
    await userEvent.keyboard('[/Space]');
  });

  it('draws the focus ring in the error colour for the error tone', async () => {
    const screen = await renderWithDS(
      <IconButton aria-label="Delete row" tone="error" icon={<DeleteIcon />} />,
    );
    await userEvent.keyboard('{Tab}');
    const button = screen.getByRole('button', { name: 'Delete row' });
    await expect.element(button).toHaveAttribute('data-focus-visible', 'true');
    const style = getComputedStyle(button.element());
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineColor).toBe(roleStyle('text-error').color);
  });

  it('calls onPress from mouse and keyboard', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <IconButton aria-label="Edit project" icon={<EditIcon />} onPress={onPress} />,
    );
    await screen.getByRole('button', { name: 'Edit project' }).click();
    expect(onPress).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it('stays pending while an async onPress runs and blocks repeat presses', async () => {
    let finish: () => void = () => {};
    const onPress = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(
      <IconButton aria-label="Refresh photos" icon={<RefreshIcon />} onPress={onPress} />,
    );
    const button = screen.getByRole('button', { name: 'Refresh photos' });

    await button.click();
    await expect.element(button).toHaveAttribute('data-pending', 'true');
    await expect.element(button).toHaveAttribute('aria-disabled', 'true');
    const progress = screen.getByRole('progressbar', { name: 'Loading' });
    await expect.element(progress).toBeInTheDocument();
    expect(button.element().getAttribute('aria-labelledby')).toContain(
      progress.element().getAttribute('id'),
    );

    await button.click({ force: true });
    expect(onPress).toHaveBeenCalledOnce();

    finish();
    await expect.element(button).not.toHaveAttribute('data-pending');
    await expect.element(button).not.toHaveAttribute('aria-disabled');
  });

  it('says Loading by default', async () => {
    const screen = await renderWithDS(
      <IconButton aria-label="Refresh" icon={<RefreshIcon />} isPending />,
    );
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
  });

  it('takes its pending label from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <>
        <IconButton aria-label="Yenile" icon={<RefreshIcon />} isPending />
        <IconButton
          aria-label="Listeyi yenile"
          icon={<RefreshIcon />}
          isPending
          labels={{ pending: 'Yenileniyor' }}
        />
      </>,
      { provider: { labels: { iconButton: { pending: 'Yükleniyor' } } } },
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Yükleniyor' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Yenileniyor' }))
      .toBeInTheDocument();
  });

  it('does not fire when disabled and fades to half opacity', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <IconButton
        aria-label="Delete row"
        variant="solid"
        icon={<DeleteIcon />}
        isDisabled
        onPress={onPress}
      />,
    );
    const button = screen.getByRole('button', { name: 'Delete row' });
    await expect.element(button).toBeDisabled();
    const style = getComputedStyle(button.element());
    expect(style.opacity).toBe('0.5');
    expect(style.cursor).toBe('not-allowed');
    expect(style.backgroundColor).toBe(roleStyle('bg-primary-solid').backgroundColor);
    await button.click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('takes size, tone, variant and disabled state from a ButtonGroup', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <>
        <ButtonGroup aria-label="Row actions" size="sm" buttonVariant="soft" tone="error">
          <IconButton aria-label="Delete row" icon={<DeleteIcon />} onPress={onPress} />
          <IconToggleButton aria-label="Pin row" icon={<FavoriteIcon />} />
        </ButtonGroup>
        <ButtonGroup aria-label="Toolbar" buttonVariant="ghost" isDisabled>
          <IconButton aria-label="Edit project" icon={<EditIcon />} onPress={onPress} />
          <IconButtonLink href="#status" aria-label="Status" icon={<OpenInNewIcon />} />
        </ButtonGroup>
      </>,
    );
    const remove = screen.getByRole('button', { name: 'Delete row' });
    await expect.element(remove).toHaveAttribute('data-size', 'sm');
    await expect.element(remove).toHaveAttribute('data-variant', 'soft');
    await expect.element(remove).toHaveAttribute('data-tone', 'error');
    expect(remove.element().getBoundingClientRect().width).toBe(32);
    const pin = screen.getByRole('button', { name: 'Pin row' });
    await expect.element(pin).toHaveAttribute('data-size', 'sm');
    await expect.element(pin).toHaveAttribute('data-variant', 'soft');

    const edit = screen.getByRole('button', { name: 'Edit project' });
    await expect.element(edit).toHaveAttribute('data-variant', 'ghost');
    await expect.element(edit).toBeDisabled();
    await edit.click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
    await expect
      .element(screen.getByRole('link', { name: 'Status' }))
      .toHaveAttribute('aria-disabled', 'true');
  });

  it('forwards its ref to the button element', async () => {
    const ref = createRef<HTMLButtonElement>();
    const screen = await renderWithDS(
      <IconButton ref={ref} aria-label="Edit project" icon={<EditIcon />} />,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Edit project' }).element());
  });

  it('renders IconButtonLink as a named link', async () => {
    const screen = await renderWithDS(
      <IconButtonLink
        href="https://example.com/status"
        aria-label="Open status page"
        variant="outline"
        icon={<OpenInNewIcon />}
      />,
    );
    const link = screen.getByRole('link', { name: 'Open status page' });
    await expect.element(link).toHaveAttribute('href', 'https://example.com/status');
    await expect.element(link).toHaveAttribute('data-variant', 'outline');
    await expect.element(link).toHaveAttribute('data-tone', 'neutral');
  });
});

describe('IconToggleButton', () => {
  it('toggles aria-pressed and swaps to the selected icon', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <IconToggleButton
        aria-label="Favourite"
        icon={<FavoriteIcon data-testid="outline" />}
        selectedIcon={<FavoriteFilledIcon data-testid="filled" />}
        onChange={onChange}
      />,
    );
    const button = screen.getByRole('button', { name: 'Favourite' });
    await expect.element(button).toHaveAttribute('aria-pressed', 'false');
    await expect.element(button).toHaveAttribute('data-variant', 'ghost');
    await expect.element(screen.getByTestId('outline')).toBeInTheDocument();

    await button.click();
    await expect.element(button).toHaveAttribute('aria-pressed', 'true');
    await expect.element(button).toHaveAttribute('data-selected', 'true');
    await expect.element(screen.getByTestId('filled')).toBeInTheDocument();
    await expect.element(screen.getByTestId('outline')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(true);

    await userEvent.keyboard(' ');
    await expect.element(button).toHaveAttribute('aria-pressed', 'false');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps the icon when no selectedIcon is given', async () => {
    const screen = await renderWithDS(
      <IconToggleButton
        aria-label="Favourite"
        icon={<FavoriteIcon data-testid="outline" />}
        defaultSelected
      />,
    );
    await expect
      .element(screen.getByRole('button', { name: 'Favourite' }))
      .toHaveAttribute('aria-pressed', 'true');
    await expect.element(screen.getByTestId('outline')).toBeInTheDocument();
  });

  it('tints the selected toggle with the primary soft fill in both variants', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <IconToggleButton aria-label="Ghost off" icon={<FavoriteIcon />} />
        <IconToggleButton aria-label="Ghost on" icon={<FavoriteIcon />} defaultSelected />
        <IconToggleButton aria-label="Soft off" variant="soft" icon={<FavoriteIcon />} />
        <IconToggleButton
          aria-label="Soft on"
          variant="soft"
          icon={<FavoriteIcon />}
          defaultSelected
        />
      </div>,
    );
    const style = (name: string) =>
      getComputedStyle(screen.getByRole('button', { name }).element());
    const selected = roleStyle('bg-primary-soft text-on-primary-soft');
    await expect.element(screen.getByRole('button', { name: 'Ghost on' })).toBeVisible();
    expect(style('Ghost off').backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(style('Soft off').backgroundColor).toBe(roleStyle('bg-neutral-soft').backgroundColor);
    for (const name of ['Ghost on', 'Soft on']) {
      expect(style(name).backgroundColor).toBe(selected.backgroundColor);
      expect(style(name).color).toBe(selected.color);
    }
  });

  it('follows a controlled isSelected', async () => {
    const onChange = vi.fn();

    function Controlled() {
      const [pinned, setPinned] = useState(false);
      return (
        <>
          <IconToggleButton
            aria-label="Pin folder"
            variant="soft"
            icon={<FavoriteIcon />}
            isSelected={pinned}
            onChange={onChange}
          />
          <button type="button" onClick={() => setPinned(true)}>
            Pin from outside
          </button>
        </>
      );
    }

    const screen = await renderWithDS(<Controlled />);
    const toggle = screen.getByRole('button', { name: 'Pin folder' });

    await toggle.click();
    expect(onChange).toHaveBeenCalledWith(true);
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');

    await screen.getByRole('button', { name: 'Pin from outside' }).click();
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.element(toggle).toHaveAttribute('data-selected', 'true');
  });

  it('keeps its colours and halves its opacity when disabled', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <IconToggleButton aria-label="On" icon={<FavoriteIcon />} defaultSelected />
        <IconToggleButton aria-label="Locked" icon={<FavoriteIcon />} defaultSelected isDisabled />
      </div>,
    );
    const on = getComputedStyle(screen.getByRole('button', { name: 'On' }).element());
    const locked = getComputedStyle(screen.getByRole('button', { name: 'Locked' }).element());
    expect(locked.backgroundColor).toBe(on.backgroundColor);
    expect(locked.opacity).toBe('0.5');
    expect(locked.cursor).toBe('not-allowed');
  });

  it('takes selection, size and variant from a ToggleButtonGroup', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <ToggleButtonGroup
        aria-label="Folder layout"
        variant="detached"
        size="sm"
        buttonVariant="soft"
        selectionMode="single"
        defaultSelectedKeys={['list']}
        onSelectionChange={onSelectionChange}
      >
        <IconToggleButton id="list" aria-label="List view" icon={<ListIcon />} />
        <IconToggleButton id="grid" aria-label="Grid view" icon={<GridViewIcon />} />
      </ToggleButtonGroup>,
    );
    const list = screen.getByRole('radio', { name: 'List view' });
    const grid = screen.getByRole('radio', { name: 'Grid view' });
    await expect.element(list).toHaveAttribute('aria-checked', 'true');
    await expect.element(grid).toHaveAttribute('data-variant', 'soft');
    await expect.element(grid).toHaveAttribute('data-size', 'sm');

    await grid.click();
    await expect.element(grid).toHaveAttribute('aria-checked', 'true');
    await expect.element(list).toHaveAttribute('aria-checked', 'false');
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['grid']);

    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(list).toHaveFocus();
  });

  it('does not toggle when disabled', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <IconToggleButton
        aria-label="Favourite"
        icon={<FavoriteIcon />}
        isDisabled
        onChange={onChange}
      />,
    );
    const button = screen.getByRole('button', { name: 'Favourite' });
    await button.click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(button).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('IconButton accessibility', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-3 p-4">
          <div className="flex gap-2">
            {variants.map((variant) => (
              <IconButton
                key={variant}
                variant={variant}
                aria-label={`Edit ${variant}`}
                icon={<EditIcon />}
              />
            ))}
            {variants.map((variant) => (
              <IconButton
                key={variant}
                variant={variant}
                tone="primary"
                aria-label={`Share ${variant}`}
                icon={<EditIcon />}
              />
            ))}
            {variants.map((variant) => (
              <IconButton
                key={variant}
                variant={variant}
                tone="error"
                aria-label={`Delete ${variant}`}
                icon={<DeleteIcon />}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {(['soft', 'ghost'] as const).map((variant) => (
              <IconToggleButton
                key={variant}
                variant={variant}
                aria-label={`Favourite ${variant}`}
                icon={<FavoriteIcon />}
                selectedIcon={<FavoriteFilledIcon />}
              />
            ))}
            {(['soft', 'ghost'] as const).map((variant) => (
              <IconToggleButton
                key={variant}
                variant={variant}
                defaultSelected
                aria-label={`Unfavourite ${variant}`}
                icon={<FavoriteIcon />}
                selectedIcon={<FavoriteFilledIcon />}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <IconButton aria-label="Disabled" icon={<EditIcon />} variant="solid" isDisabled />
            <IconButton aria-label="Pending" icon={<RefreshIcon />} variant="soft" isPending />
            <IconButtonLink href="#status" aria-label="Status" icon={<OpenInNewIcon />} />
          </div>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
