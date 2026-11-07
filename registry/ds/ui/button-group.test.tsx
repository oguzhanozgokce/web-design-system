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

function separator(element: Element) {
  const style = getComputedStyle(element, '::before');
  const shown = style.display !== 'none' && style.content !== 'none' && style.content !== 'normal';
  return { shown, width: style.width, height: style.height };
}

const pill = 9999;

describe('ButtonGroup', () => {
  it('renders a labelled, attached group by default', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Project actions">
        <Button>Open</Button>
        <Button>Share</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'Project actions' });
    await expect.element(group).toBeVisible();
    await expect.element(group).toHaveAttribute('data-slot', 'button-group');
    await expect.element(group).toHaveAttribute('data-variant', 'attached');
    await expect.element(group).toHaveAttribute('data-orientation', 'horizontal');
    await expect.element(group).toHaveAttribute('data-size', 'md');
    expect(getComputedStyle(group.element()).columnGap).toBe('0px');
  });

  it('gives its buttons a default size, variant and tone that explicit props override', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Member" size="sm" buttonVariant="soft" tone="error">
        <Button>Remove</Button>
        <Button variant="outline" size="lg" tone="neutral">
          Keep
        </Button>
        <ButtonLink href="#activity">Activity</ButtonLink>
      </ButtonGroup>,
    );
    const inherited = screen.getByRole('button', { name: 'Remove' });
    await expect.element(inherited).toHaveAttribute('data-variant', 'soft');
    await expect.element(inherited).toHaveAttribute('data-size', 'sm');
    await expect.element(inherited).toHaveAttribute('data-tone', 'error');

    const explicit = screen.getByRole('button', { name: 'Keep' });
    await expect.element(explicit).toHaveAttribute('data-variant', 'outline');
    await expect.element(explicit).toHaveAttribute('data-size', 'lg');
    await expect.element(explicit).toHaveAttribute('data-tone', 'neutral');

    await expect
      .element(screen.getByRole('link', { name: 'Activity' }))
      .toHaveAttribute('data-variant', 'soft');
  });

  it('lets nested content opt out of the group defaults with a null context', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Member" size="sm" buttonVariant="ghost" tone="error" isDisabled>
        <Button>Remove</Button>
        <ButtonGroupContext value={null}>
          <Button>Confirm</Button>
        </ButtonGroupContext>
      </ButtonGroup>,
    );
    await expect.element(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    await expect.element(confirm).toBeEnabled();
    await expect.element(confirm).toHaveAttribute('data-variant', 'solid');
    await expect.element(confirm).toHaveAttribute('data-size', 'md');
    await expect.element(confirm).toHaveAttribute('data-tone', 'primary');
  });

  it('lets a nested group inherit the outer defaults and override them', async () => {
    const screen = await renderWithDS(
      <ButtonGroup
        aria-label="Folder toolbar"
        variant="detached"
        size="sm"
        buttonVariant="soft"
        tone="error"
        isDisabled
      >
        <ButtonGroup aria-label="History">
          <Button>Undo</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Export" size="lg" buttonVariant="outline" isDisabled={false}>
          <Button>Photos</Button>
        </ButtonGroup>
      </ButtonGroup>,
    );
    await expect
      .element(screen.getByRole('group', { name: 'History' }))
      .toHaveAttribute('data-size', 'sm');
    const undo = screen.getByRole('button', { name: 'Undo' });
    await expect.element(undo).toHaveAttribute('data-size', 'sm');
    await expect.element(undo).toHaveAttribute('data-variant', 'soft');
    await expect.element(undo).toHaveAttribute('data-tone', 'error');
    await expect.element(undo).toBeDisabled();

    const photos = screen.getByRole('button', { name: 'Photos' });
    await expect.element(photos).toHaveAttribute('data-size', 'lg');
    await expect.element(photos).toHaveAttribute('data-variant', 'outline');
    await expect.element(photos).toHaveAttribute('data-tone', 'error');
    await expect.element(photos).toBeEnabled();
  });

  it('keeps Button defaults outside a group', async () => {
    const screen = await renderWithDS(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    await expect.element(button).toHaveAttribute('data-variant', 'solid');
    await expect.element(button).toHaveAttribute('data-size', 'md');
    await expect.element(button).toHaveAttribute('data-tone', 'primary');
  });

  it('disables every button when the group is disabled, unless a button opts back in', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Export" isDisabled>
        <Button onPress={onPress}>Photos</Button>
        <Button onPress={onPress} isDisabled={false}>
          Videos
        </Button>
      </ButtonGroup>,
    );
    await expect.element(screen.getByRole('group')).toHaveAttribute('data-disabled', 'true');
    await screen.getByRole('button', { name: 'Photos' }).click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Videos' }).click();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('rounds only the outer ends of an attached group into a pill', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Period">
        <Button>Previous</Button>
        <Button>Today</Button>
        <Button>Next</Button>
      </ButtonGroup>,
    );
    const today = screen.getByRole('button', { name: 'Today' });
    await expect.element(today).toBeVisible();
    const first = radii(screen.getByRole('button', { name: 'Previous' }).element());
    const last = radii(screen.getByRole('button', { name: 'Next' }).element());

    expect(first.topLeft).toBe(pill);
    expect(first.bottomLeft).toBe(pill);
    expect(first.topRight).toBe(0);
    expect(radii(today.element())).toEqual({
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    });
    expect(last.topRight).toBe(pill);
    expect(last.topLeft).toBe(0);
  });

  it('draws a faint separator between attached items, but not around outline items', async () => {
    const screen = await renderWithDS(
      <>
        <ButtonGroup aria-label="Period" buttonVariant="soft">
          <Button>Day</Button>
          <Button>Week</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Outline" buttonVariant="outline">
          <Button>Month</Button>
          <Button>Year</Button>
        </ButtonGroup>
      </>,
    );
    await expect.element(screen.getByRole('button', { name: 'Week' })).toBeVisible();
    expect(separator(screen.getByRole('button', { name: 'Day' }).element()).shown).toBe(false);
    const week = separator(screen.getByRole('button', { name: 'Week' }).element());
    expect(week.shown).toBe(true);
    expect(week.width).toBe('1px');
    expect(week.height).toBe('20px');

    const year = screen.getByRole('button', { name: 'Year' }).element();
    expect(separator(year).shown).toBe(false);
    expect(getComputedStyle(year).marginInlineStart).toBe('-1px');
  });

  it('cancels the press scale inside an attached group', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Period">
        <Button>Previous</Button>
        <Button>Today</Button>
      </ButtonGroup>,
    );
    const today = screen.getByRole('button', { name: 'Today' });
    await expect.element(today).toBeVisible();
    today.element().focus();
    await userEvent.keyboard('[Space>]');
    await expect.element(today).toHaveAttribute('data-pressed', 'true');
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(getComputedStyle(today.element()).scale).toBe('1');
    await userEvent.keyboard('[/Space]');
    await expect.element(today).not.toHaveAttribute('data-pressed');
  });

  it('raises the keyboard-focused button so its neighbour cannot cover the focus ring', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Period">
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

  it('mirrors attached ends in RTL', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="الفترة">
        <Button startIcon={<ChevronLeftIcon className="rtl:-scale-x-100" />}>السابق</Button>
        <Button endIcon={<ChevronRightIcon className="rtl:-scale-x-100" />}>التالي</Button>
      </ButtonGroup>,
      { locale: 'ar' },
    );
    await expect.element(screen.getByRole('button', { name: 'التالي' })).toBeVisible();
    const first = radii(screen.getByRole('button', { name: 'السابق' }).element());
    const last = radii(screen.getByRole('button', { name: 'التالي' }).element());
    expect(first.topRight).toBe(pill);
    expect(first.topLeft).toBe(0);
    expect(last.topLeft).toBe(pill);
    expect(last.topRight).toBe(0);
  });

  it('rounds the top and bottom ends of a vertical attached group by half the height', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Move" orientation="vertical" size="sm">
        <Button>Move up</Button>
        <Button>Move down</Button>
      </ButtonGroup>,
    );
    await expect.element(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical');
    const down = screen.getByRole('button', { name: 'Move down' }).element();
    const first = radii(screen.getByRole('button', { name: 'Move up' }).element());
    const last = radii(down);
    expect(first.topLeft).toBe(16);
    expect(first.topRight).toBe(16);
    expect(first.bottomLeft).toBe(0);
    expect(last.bottomRight).toBe(16);
    expect(last.topRight).toBe(0);
    const line = separator(down);
    expect(line.shown).toBe(true);
    expect(line.height).toBe('1px');
  });

  it('spaces a detached group and keeps every button a pill', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Actions" variant="detached" buttonVariant="outline">
        <Button>Edit</Button>
        <Button>Share</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'Actions' });
    await expect.element(group).toHaveAttribute('data-variant', 'detached');
    expect(getComputedStyle(group.element()).columnGap).toBe('8px');
    expect(getComputedStyle(group.element()).flexWrap).toBe('wrap');
    const share = screen.getByRole('button', { name: 'Share' }).element();
    expect(radii(share).topLeft).toBe(pill);
    expect(separator(share).shown).toBe(false);
  });

  it('stretches its buttons when fullWidth is set', async () => {
    const screen = await renderWithDS(
      <div className="w-96">
        <ButtonGroup aria-label="Plan" fullWidth>
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
          <ButtonGroup aria-label="Project" variant="detached">
            <Button>Open</Button>
            <Button variant="outline">Rename</Button>
            <Button variant="ghost" tone="error">
              Delete
            </Button>
          </ButtonGroup>
          {(['solid', 'soft', 'outline', 'ghost'] as const).map((buttonVariant) => (
            <ButtonGroup
              key={buttonVariant}
              aria-label={buttonVariant}
              buttonVariant={buttonVariant}
            >
              <Button>Day</Button>
              <Button>Week</Button>
              <Button>Month</Button>
            </ButtonGroup>
          ))}
          <ButtonGroup aria-label="Disabled" isDisabled>
            <Button>Archive</Button>
            <Button>Remove</Button>
          </ButtonGroup>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
