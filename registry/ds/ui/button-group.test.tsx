import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonGroupContext, ButtonLink } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

function radii(element: Element) {
  const style = getComputedStyle(element);
  return {
    topLeft: parseFloat(style.borderTopLeftRadius),
    topRight: parseFloat(style.borderTopRightRadius),
    bottomLeft: parseFloat(style.borderBottomLeftRadius),
    bottomRight: parseFloat(style.borderBottomRightRadius),
  };
}

const still = { provider: { motion: 'disabled' as const } };

describe('ButtonGroup', () => {
  it('renders a labelled group with its variant on the root', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Project actions" variant="connected">
        <Button>Approve</Button>
        <Button>Reject</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'Project actions' });
    await expect.element(group).toBeVisible();
    await expect.element(group).toHaveAttribute('data-slot', 'button-group');
    await expect.element(group).toHaveAttribute('data-variant', 'connected');
    await expect.element(group).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('gives its buttons a default size, variant and tone that explicit props override', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Member" size="sm" buttonVariant="tonal" tone="destructive">
        <Button>Suspend</Button>
        <Button variant="outlined" size="lg" tone="default">
          Keep
        </Button>
        <ButtonLink href="#audit">Audit log</ButtonLink>
      </ButtonGroup>,
    );
    const inherited = screen.getByRole('button', { name: 'Suspend' });
    await expect.element(inherited).toHaveAttribute('data-variant', 'tonal');
    await expect.element(inherited).toHaveAttribute('data-size', 'sm');
    await expect.element(inherited).toHaveAttribute('data-tone', 'destructive');
    await expect.element(inherited).toHaveClass('bg-error-container');

    const explicit = screen.getByRole('button', { name: 'Keep' });
    await expect.element(explicit).toHaveAttribute('data-variant', 'outlined');
    await expect.element(explicit).toHaveAttribute('data-size', 'lg');
    await expect.element(explicit).toHaveAttribute('data-tone', 'default');

    await expect
      .element(screen.getByRole('link', { name: 'Audit log' }))
      .toHaveAttribute('data-variant', 'tonal');
  });

  it('lets nested content opt out of the group defaults with a null context', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Member" size="sm" buttonVariant="text" tone="destructive" isDisabled>
        <Button>Suspend</Button>
        <ButtonGroupContext value={null}>
          <Button>Confirm</Button>
        </ButtonGroupContext>
      </ButtonGroup>,
    );
    await expect.element(screen.getByRole('button', { name: 'Suspend' })).toBeDisabled();
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    await expect.element(confirm).toBeEnabled();
    await expect.element(confirm).toHaveAttribute('data-variant', 'filled');
    await expect.element(confirm).toHaveAttribute('data-size', 'md');
    await expect.element(confirm).toHaveAttribute('data-tone', 'default');
  });

  it('lets a nested group inherit the outer defaults and override them', async () => {
    const screen = await renderWithDS(
      <ButtonGroup
        aria-label="Folder toolbar"
        size="sm"
        buttonVariant="tonal"
        tone="destructive"
        isDisabled
      >
        <ButtonGroup aria-label="History" variant="connected">
          <Button>Undo</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Export" size="lg" buttonVariant="outlined" isDisabled={false}>
          <Button>CSV</Button>
        </ButtonGroup>
      </ButtonGroup>,
      still,
    );
    await expect
      .element(screen.getByRole('group', { name: 'History' }))
      .toHaveAttribute('data-size', 'sm');
    const undo = screen.getByRole('button', { name: 'Undo' });
    await expect.element(undo).toHaveAttribute('data-size', 'sm');
    await expect.element(undo).toHaveAttribute('data-variant', 'tonal');
    await expect.element(undo).toHaveAttribute('data-tone', 'destructive');
    await expect.element(undo).toBeDisabled();
    expect(radii(undo.element()).topLeft).toBe(16);

    const csv = screen.getByRole('button', { name: 'CSV' });
    await expect.element(csv).toHaveAttribute('data-size', 'lg');
    await expect.element(csv).toHaveAttribute('data-variant', 'outlined');
    await expect.element(csv).toHaveAttribute('data-tone', 'destructive');
    await expect.element(csv).toBeEnabled();
  });

  it('keeps Button defaults outside a group', async () => {
    const screen = await renderWithDS(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    await expect.element(button).toHaveAttribute('data-variant', 'filled');
    await expect.element(button).toHaveAttribute('data-size', 'md');
    await expect.element(button).toHaveAttribute('data-tone', 'default');
  });

  it('disables every button when the group is disabled, unless a button opts back in', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Export" isDisabled>
        <Button onPress={onPress}>CSV</Button>
        <Button onPress={onPress} isDisabled={false}>
          PDF
        </Button>
      </ButtonGroup>,
    );
    await expect.element(screen.getByRole('group')).toHaveAttribute('data-disabled', 'true');
    await screen.getByRole('button', { name: 'CSV' }).click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'PDF' }).click();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('rounds only the outer corners of a connected group', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Period" variant="connected">
        <Button>Previous</Button>
        <Button>Today</Button>
        <Button>Next</Button>
      </ButtonGroup>,
      still,
    );
    const today = screen.getByRole('button', { name: 'Today' });
    await expect.element(today).toBeVisible();
    const first = radii(screen.getByRole('button', { name: 'Previous' }).element());
    const last = radii(screen.getByRole('button', { name: 'Next' }).element());

    expect(first.topLeft).toBe(20);
    expect(first.bottomLeft).toBe(20);
    expect(first.topRight).toBe(4);
    expect(radii(today.element())).toEqual({
      topLeft: 4,
      topRight: 4,
      bottomLeft: 4,
      bottomRight: 4,
    });
    expect(last.topRight).toBe(20);
    expect(last.topLeft).toBe(4);
  });

  it('rounds out a pressed button in a connected group without shrinking it', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Period" variant="connected">
        <Button>Previous</Button>
        <Button>Today</Button>
        <Button>Next</Button>
      </ButtonGroup>,
      still,
    );
    const today = screen.getByRole('button', { name: 'Today' });
    await expect.element(today).toBeVisible();
    today.element().focus();
    await userEvent.keyboard('[Space>]');
    await expect.element(today).toHaveAttribute('data-pressed', 'true');
    expect(radii(today.element())).toEqual({
      topLeft: 20,
      topRight: 20,
      bottomLeft: 20,
      bottomRight: 20,
    });
    expect(getComputedStyle(today.element()).scale).toBe('1');
    await userEvent.keyboard('[/Space]');
    await expect.element(today).not.toHaveAttribute('data-pressed');
    expect(radii(today.element()).topLeft).toBe(4);
  });

  it('raises the keyboard-focused button so its neighbour cannot cover the focus ring', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Period" variant="connected">
        <Button>Previous</Button>
        <Button>Next</Button>
      </ButtonGroup>,
    );
    const previous = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });
    await expect.element(previous).toBeVisible();
    expect(getComputedStyle(previous.element()).zIndex).toBe('auto');

    await userEvent.keyboard('{Tab}');
    await expect.element(previous).toHaveFocus();
    await expect.element(previous).toHaveAttribute('data-focus-visible', 'true');
    expect(Number(getComputedStyle(previous.element()).zIndex)).toBeGreaterThan(0);
    expect(getComputedStyle(next.element()).zIndex).toBe('auto');
  });

  it('mirrors connected corners in RTL', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="الفترة" variant="connected">
        <Button startIcon={<ChevronLeftIcon className="rtl:-scale-x-100" />}>السابق</Button>
        <Button endIcon={<ChevronRightIcon className="rtl:-scale-x-100" />}>التالي</Button>
      </ButtonGroup>,
      { locale: 'ar', ...still },
    );
    await expect.element(screen.getByRole('button', { name: 'التالي' })).toBeVisible();
    const first = radii(screen.getByRole('button', { name: 'السابق' }).element());
    const last = radii(screen.getByRole('button', { name: 'التالي' }).element());
    expect(first.topRight).toBe(20);
    expect(first.topLeft).toBe(4);
    expect(last.topLeft).toBe(20);
    expect(last.topRight).toBe(4);
  });

  it('rounds the top and bottom ends of a vertical connected group', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Move" variant="connected" orientation="vertical" size="sm">
        <Button>Move up</Button>
        <Button>Move down</Button>
      </ButtonGroup>,
      still,
    );
    await expect.element(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical');
    const first = radii(screen.getByRole('button', { name: 'Move up' }).element());
    const last = radii(screen.getByRole('button', { name: 'Move down' }).element());
    expect(first.topLeft).toBe(16);
    expect(first.topRight).toBe(16);
    expect(first.bottomLeft).toBe(4);
    expect(last.bottomRight).toBe(16);
    expect(last.topRight).toBe(4);
  });

  it('animates corner changes with the spatial spring and skips it when motion is reduced', async () => {
    const markup = (
      <ButtonGroup aria-label="Period" variant="connected">
        <Button>Week</Button>
        <Button>Month</Button>
      </ButtonGroup>
    );
    const animated = await renderWithDS(markup);
    const animatedStyle = getComputedStyle(
      animated.getByRole('button', { name: 'Week' }).element(),
    );
    expect(animatedStyle.transitionProperty).toContain('border-radius');
    expect(animatedStyle.transitionDuration.split(', ').at(-1)).not.toBe('0s');
    await animated.unmount();

    const reduced = await renderWithDS(markup, { provider: { motion: 'reduced' } });
    const reducedStyle = getComputedStyle(reduced.getByRole('button', { name: 'Week' }).element());
    expect(reducedStyle.transitionDuration.split(', ').at(-1)).toBe('0s');
  });

  it('stretches its buttons when fullWidth is set', async () => {
    const screen = await renderWithDS(
      <div className="w-96">
        <ButtonGroup aria-label="Plan" variant="connected" fullWidth>
          <Button>Monthly</Button>
          <Button>Yearly</Button>
        </ButtonGroup>
      </div>,
    );
    await expect.element(screen.getByRole('button', { name: 'Monthly' })).toBeVisible();
    const monthly = screen.getByRole('button', { name: 'Monthly' }).element();
    const yearly = screen.getByRole('button', { name: 'Yearly' }).element();
    expect(monthly.getBoundingClientRect().width).toBeCloseTo(
      yearly.getBoundingClientRect().width,
      0,
    );
    expect(screen.getByRole('group').element().getBoundingClientRect().width).toBe(384);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          <ButtonGroup aria-label="Project">
            <Button>Approve</Button>
            <Button variant="outlined">Request changes</Button>
            <Button variant="text" tone="destructive">
              Reject
            </Button>
          </ButtonGroup>
          {(['filled', 'tonal', 'outlined', 'elevated'] as const).map((buttonVariant) => (
            <ButtonGroup
              key={buttonVariant}
              aria-label={buttonVariant}
              variant="connected"
              buttonVariant={buttonVariant}
            >
              <Button>Day</Button>
              <Button>Week</Button>
              <Button>Month</Button>
            </ButtonGroup>
          ))}
          <ButtonGroup aria-label="Disabled" isDisabled variant="connected">
            <Button>Archive</Button>
            <Button>Delete</Button>
          </ButtonGroup>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
