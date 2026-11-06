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

describe('IconButton', () => {
  it('renders an accessible button named by aria-label', async () => {
    const screen = await renderWithDS(<IconButton aria-label="Edit project" icon={<EditIcon />} />);
    const button = screen.getByRole('button', { name: 'Edit project' });
    await expect.element(button).toBeVisible();
    await expect.element(button).toHaveAttribute('data-variant', 'standard');
    await expect.element(button).toHaveAttribute('data-size', 'md');
    await expect.element(button).toHaveAttribute('data-shape', 'round');
    expect(button.element().getBoundingClientRect().width).toBe(40);
    expect(button.element().getBoundingClientRect().height).toBe(40);
  });

  it('sizes the button from xs to xl', async () => {
    const sizes = { xs: 28, sm: 32, md: 40, lg: 48, xl: 56 } as const;
    const screen = await renderWithDS(
      <div className="flex gap-2">
        {(Object.keys(sizes) as (keyof typeof sizes)[]).map((size) => (
          <IconButton key={size} size={size} aria-label={size} icon={<EditIcon />} />
        ))}
      </div>,
    );
    for (const [size, pixels] of Object.entries(sizes)) {
      const rect = screen.getByRole('button', { name: size }).element().getBoundingClientRect();
      expect(rect.width).toBe(pixels);
      expect(rect.height).toBe(pixels);
    }
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
      <IconButton aria-label="Refresh balances" icon={<RefreshIcon />} onPress={onPress} />,
    );
    const button = screen.getByRole('button', { name: 'Refresh balances' });

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

  it('does not fire when disabled', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <IconButton aria-label="Delete row" icon={<DeleteIcon />} isDisabled onPress={onPress} />,
    );
    const button = screen.getByRole('button', { name: 'Delete row' });
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('marks the destructive tone and square shape on the root', async () => {
    const screen = await renderWithDS(
      <IconButton
        aria-label="Delete row"
        icon={<DeleteIcon />}
        variant="tonal"
        tone="destructive"
        shape="square"
      />,
    );
    const button = screen.getByRole('button', { name: 'Delete row' });
    await expect.element(button).toHaveAttribute('data-tone', 'destructive');
    await expect.element(button).toHaveAttribute('data-shape', 'square');
    await expect.element(button).toHaveClass('bg-error-container');
  });

  it('scales the square corner with the size', async () => {
    const corners = { xs: '8px', sm: '8px', md: '12px', lg: '12px', xl: '16px' } as const;
    const screen = await renderWithDS(
      <div className="flex gap-2">
        {(Object.keys(corners) as (keyof typeof corners)[]).map((size) => (
          <IconButton key={size} size={size} shape="square" aria-label={size} icon={<EditIcon />} />
        ))}
      </div>,
    );
    for (const [size, radius] of Object.entries(corners)) {
      const button = screen.getByRole('button', { name: size }).element();
      expect(getComputedStyle(button).borderRadius).toBe(radius);
    }
  });

  it('runs the press morph on the spatial spring and drops it for reduced motion', async () => {
    const screen = await renderWithDS(<IconButton aria-label="Edit project" icon={<EditIcon />} />);
    const button = screen.getByRole('button', { name: 'Edit project' });
    await expect.element(button).not.toHaveAttribute('data-reduced-motion');
    expect(getComputedStyle(button.element()).transitionDuration.split(', ').at(-1)).not.toBe('0s');
    await screen.unmount();

    const reduced = await renderWithDS(
      <IconButton aria-label="Edit project" icon={<EditIcon />} />,
      {
        provider: { motion: 'reduced' },
      },
    );
    const still = reduced.getByRole('button', { name: 'Edit project' });
    await expect.element(still).toHaveAttribute('data-reduced-motion', 'true');
    expect(getComputedStyle(still.element()).transitionDuration.split(', ').at(-1)).toBe('0s');
  });

  it('takes size, tone, variant and disabled state from a ButtonGroup', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <>
        <ButtonGroup aria-label="Row actions" size="sm" buttonVariant="tonal" tone="destructive">
          <IconButton aria-label="Delete row" icon={<DeleteIcon />} onPress={onPress} />
          <IconToggleButton aria-label="Pin row" icon={<FavoriteIcon />} />
        </ButtonGroup>
        <ButtonGroup aria-label="Toolbar" buttonVariant="text" isDisabled>
          <IconButton aria-label="Edit project" icon={<EditIcon />} onPress={onPress} />
          <IconButtonLink href="#status" aria-label="Status" icon={<OpenInNewIcon />} />
        </ButtonGroup>
      </>,
    );
    const remove = screen.getByRole('button', { name: 'Delete row' });
    await expect.element(remove).toHaveAttribute('data-size', 'sm');
    await expect.element(remove).toHaveAttribute('data-variant', 'tonal');
    await expect.element(remove).toHaveAttribute('data-tone', 'destructive');
    expect(remove.element().getBoundingClientRect().width).toBe(32);
    await expect
      .element(screen.getByRole('button', { name: 'Pin row' }))
      .toHaveAttribute('data-size', 'sm');

    const edit = screen.getByRole('button', { name: 'Edit project' });
    await expect.element(edit).toHaveAttribute('data-variant', 'standard');
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
        icon={<OpenInNewIcon />}
      />,
    );
    await expect
      .element(screen.getByRole('link', { name: 'Open status page' }))
      .toHaveAttribute('href', 'https://example.com/status');
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

  it('follows a controlled isSelected', async () => {
    const onChange = vi.fn();

    function Controlled() {
      const [pinned, setPinned] = useState(false);
      return (
        <>
          <IconToggleButton
            aria-label="Pin folder"
            variant="filled"
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
    await expect.element(toggle).toHaveClass('data-[selected]:bg-primary');
  });

  it('swaps shape when selected, so the state does not rest on colour', async () => {
    const screen = await renderWithDS(
      <>
        <IconToggleButton aria-label="Favourite" variant="tonal" icon={<FavoriteIcon />} />
        <IconToggleButton
          aria-label="Pin"
          variant="outlined"
          shape="square"
          icon={<FavoriteIcon />}
        />
      </>,
      { provider: { motion: 'reduced' } },
    );
    const round = screen.getByRole('button', { name: 'Favourite' });
    const square = screen.getByRole('button', { name: 'Pin' });
    expect(getComputedStyle(round.element()).borderRadius).toBe('50%');
    expect(getComputedStyle(square.element()).borderRadius).toBe('12px');

    await round.click();
    await square.click();
    await expect.element(round).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => getComputedStyle(round.element()).borderRadius).toBe('12px');
    await expect.poll(() => getComputedStyle(square.element()).borderRadius).toBe('50%');
  });

  it('uses the disabled roles when a selected toggle is disabled', async () => {
    const variants = ['standard', 'filled', 'tonal', 'outlined'] as const;
    const screen = await renderWithDS(
      <div className="flex gap-2">
        {variants.map((variant) => (
          <IconToggleButton
            key={variant}
            variant={variant}
            aria-label={variant}
            icon={<FavoriteIcon />}
            defaultSelected
            isDisabled
          />
        ))}
        <span data-testid="disabled-roles" className="bg-on-surface/12 text-on-surface/38" />
      </div>,
    );
    const expected = getComputedStyle(screen.getByTestId('disabled-roles').element());
    for (const variant of variants) {
      const style = getComputedStyle(screen.getByRole('button', { name: variant }).element());
      expect(style.color).toBe(expected.color);
      if (variant !== 'standard') expect(style.backgroundColor).toBe(expected.backgroundColor);
    }
  });

  it('takes selection, size and variant from a ToggleButtonGroup', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <ToggleButtonGroup
        aria-label="Folder layout"
        variant="standard"
        size="sm"
        buttonVariant="outlined"
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
    await expect.element(grid).toHaveAttribute('data-variant', 'outlined');
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
    const variants = ['standard', 'filled', 'tonal', 'outlined'] as const;
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
                tone="destructive"
                aria-label={`Delete ${variant}`}
                icon={<DeleteIcon />}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {variants.map((variant) => (
              <IconToggleButton
                key={variant}
                variant={variant}
                aria-label={`Favourite ${variant}`}
                icon={<FavoriteIcon />}
                selectedIcon={<FavoriteFilledIcon />}
              />
            ))}
            {variants.map((variant) => (
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
            <IconButton aria-label="Disabled" icon={<EditIcon />} variant="filled" isDisabled />
            <IconButton aria-label="Pending" icon={<RefreshIcon />} variant="tonal" isPending />
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
