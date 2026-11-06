import { useState, type ReactNode } from 'react';
import { Button as AriaButton } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { ArchiveIcon, CopyIcon, UndoIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import {
  RichTooltip,
  Tooltip,
  TooltipGroup,
  TooltipTrigger,
  tooltipStyles,
} from '@/registry/ds/ui/tooltip';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hover(target: ReturnType<typeof page.getByRole>) {
  await page.getByTestId('pointer-rest').hover();
  await target.hover();
}

function PointerRest() {
  return (
    <p data-testid="pointer-rest" className="p-2">
      Invoices
    </p>
  );
}

function IconTrigger({ label, children }: { label: string; children: ReactNode }) {
  return (
    <AriaButton aria-label={label} className="inline-flex size-10 items-center justify-center">
      {children}
    </AriaButton>
  );
}

describe('Tooltip', () => {
  it('opens on hover only after the delay and describes its trigger', async () => {
    const screen = await renderWithDS(
      <>
        <PointerRest />
        <TooltipTrigger delay={600}>
          <IconTrigger label="Archive">
            <ArchiveIcon />
          </IconTrigger>
          <Tooltip>Archive invoice</Tooltip>
        </TooltipTrigger>
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'Archive' });

    await hover(trigger);
    await wait(250);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toBeVisible();
    await expect.element(tooltip).toHaveTextContent('Archive invoice');
    await expect.element(trigger).toHaveAccessibleDescription('Archive invoice');

    await trigger.unhover();
    await expect.element(tooltip).not.toBeInTheDocument();
    await wait(600);
  });

  it('opens right away on keyboard focus and closes on Escape', async () => {
    const screen = await renderWithDS(
      <TooltipTrigger delay={5000}>
        <IconTrigger label="Archive">
          <ArchiveIcon />
        </IconTrigger>
        <Tooltip>Archive invoice</Tooltip>
      </TooltipTrigger>,
    );

    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Archive' })).toHaveFocus();
    await expect.element(page.getByRole('tooltip')).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Archive' })).toHaveFocus();
    await wait(600);
  });

  it('shows the next tooltip in a group instantly once one has opened', async () => {
    const screen = await renderWithDS(
      <TooltipGroup delay={1200} placement="bottom">
        <PointerRest />
        <div role="toolbar" aria-label="Edit" className="flex gap-2 p-16">
          <TooltipTrigger>
            <IconTrigger label="Undo">
              <UndoIcon />
            </IconTrigger>
            <Tooltip>Undo</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <IconTrigger label="Copy">
              <CopyIcon />
            </IconTrigger>
            <Tooltip>Copy</Tooltip>
          </TooltipTrigger>
        </div>
      </TooltipGroup>,
    );
    const undo = screen.getByRole('button', { name: 'Undo' });
    const copy = screen.getByRole('button', { name: 'Copy' });

    await hover(undo);
    await wait(600);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    await expect.element(page.getByRole('tooltip'), { timeout: 2000 }).toHaveTextContent('Undo');
    expect(document.querySelector('[role="tooltip"]')).toHaveAttribute('data-placement', 'bottom');

    await copy.hover();
    await expect.element(page.getByRole('tooltip'), { timeout: 300 }).toHaveTextContent('Copy');

    await copy.unhover();
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
    await wait(600);
  });

  it('does not open when the group is disabled', async () => {
    const screen = await renderWithDS(
      <TooltipGroup isDisabled delay={0}>
        <PointerRest />
        <TooltipTrigger>
          <IconTrigger label="Archive">
            <ArchiveIcon />
          </IconTrigger>
          <Tooltip>Archive invoice</Tooltip>
        </TooltipTrigger>
      </TooltipGroup>,
    );

    await hover(screen.getByRole('button', { name: 'Archive' }));
    await userEvent.keyboard('{Tab}');
    await wait(300);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('renders shortcut keys as Kbd with spoken names', async () => {
    const screen = await renderWithDS(
      <TooltipTrigger defaultOpen>
        <IconTrigger label="Undo">
          <UndoIcon />
        </IconTrigger>
        <Tooltip shortcut={['command', 'Z']}>Undo</Tooltip>
      </TooltipTrigger>,
    );

    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toBeVisible();
    const keys = document.querySelectorAll('[data-slot="shortcut"] [data-slot="kbd"]');
    expect(keys).toHaveLength(2);
    expect(keys[0]).toHaveAttribute('data-key', 'command');
    expect(keys[0].querySelector('[data-slot="kbd-glyph"]')).toHaveTextContent('⌘');
    expect(keys[0]).toHaveClass('bg-inverse-on-surface/12');
    expect(document.querySelector('[data-slot="shortcut"]')).toHaveAttribute('dir', 'ltr');
    await expect
      .element(screen.getByRole('button', { name: 'Undo' }))
      .toHaveAccessibleDescription('Undo Command Z');
  });

  it('shows mod as the platform shortcut modifier', async () => {
    const isApple = /mac|iphone|ipad|ipod/i.test(navigator.platform);
    const screen = await renderWithDS(
      <TooltipTrigger defaultOpen>
        <IconTrigger label="Undo">
          <UndoIcon />
        </IconTrigger>
        <Tooltip shortcut={['mod', 'Z']}>Undo</Tooltip>
      </TooltipTrigger>,
    );

    await expect
      .element(screen.getByRole('button', { name: 'Undo' }))
      .toHaveAccessibleDescription(`Undo ${isApple ? 'Command' : 'Control'} Z`);
    expect(
      document.querySelector('[data-slot="shortcut"] [data-slot="kbd-glyph"]'),
    ).toHaveTextContent(isApple ? '⌘' : 'Ctrl');
  });

  it('localises the shortcut key names', async () => {
    const screen = await renderWithDS(
      <TooltipTrigger defaultOpen>
        <IconTrigger label="Rückgängig">
          <UndoIcon />
        </IconTrigger>
        <Tooltip shortcut={['command', 'shift', 'Z']}>Wiederholen</Tooltip>
      </TooltipTrigger>,
      { locale: 'de' },
    );

    await expect
      .element(screen.getByRole('button', { name: 'Rückgängig' }))
      .toHaveAccessibleDescription('Wiederholen Befehlstaste Umschalttaste Z');
  });

  it('opens only on keyboard focus with trigger="focus"', async () => {
    const screen = await renderWithDS(
      <>
        <PointerRest />
        <TooltipTrigger trigger="focus" delay={0}>
          <IconTrigger label="Archive">
            <ArchiveIcon />
          </IconTrigger>
          <Tooltip>Archive invoice</Tooltip>
        </TooltipTrigger>
      </>,
    );

    await hover(screen.getByRole('button', { name: 'Archive' }));
    await wait(300);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    await userEvent.keyboard('{Tab}');
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Archive invoice');
    await userEvent.keyboard('{Escape}');
    await wait(600);
  });

  it('supports a controlled open state', async () => {
    const onOpenChange = vi.fn();

    function Controlled() {
      const [isOpen, setOpen] = useState(false);
      return (
        <>
          <p>{isOpen ? 'Hint shown' : 'Hint hidden'}</p>
          <TooltipTrigger
            isOpen={isOpen}
            onOpenChange={(open) => {
              onOpenChange(open);
              setOpen(open);
            }}
          >
            <IconTrigger label="Archive">
              <ArchiveIcon />
            </IconTrigger>
            <Tooltip>Archive invoice</Tooltip>
          </TooltipTrigger>
        </>
      );
    }

    const screen = await renderWithDS(<Controlled />);

    await userEvent.keyboard('{Tab}');
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Archive invoice');
    await expect.element(screen.getByText('Hint shown')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Hint hidden')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await wait(600);
  });

  it('lets a trigger override its group and nested groups inherit', async () => {
    const screen = await renderWithDS(
      <TooltipGroup isDisabled placement="bottom">
        <TooltipGroup delay={0}>
          <div className="flex justify-center p-16">
            <TooltipTrigger isDisabled={false}>
              <IconTrigger label="Archive">
                <ArchiveIcon />
              </IconTrigger>
              <Tooltip>Archive invoice</Tooltip>
            </TooltipTrigger>
          </div>
        </TooltipGroup>
      </TooltipGroup>,
    );

    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Archive' })).toHaveFocus();
    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toBeVisible();
    await expect.element(tooltip).toHaveAttribute('data-placement', 'bottom');
    await userEvent.keyboard('{Escape}');
    await wait(600);
  });

  it('supports placement, an arrow and the locale direction', async () => {
    await renderWithDS(
      <div className="flex justify-center p-24">
        <TooltipTrigger defaultOpen>
          <IconTrigger label="Archive">
            <ArchiveIcon />
          </IconTrigger>
          <Tooltip placement="bottom" showArrow>
            أرشفة الفاتورة
          </Tooltip>
        </TooltipTrigger>
      </div>,
      { locale: 'ar' },
    );

    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toBeVisible();
    await expect.element(tooltip).toHaveAttribute('data-placement', 'bottom');
    await expect.element(tooltip).toHaveAttribute('dir', 'rtl');
    await expect.element(tooltip).toHaveAttribute('lang', 'ar');
    expect(document.querySelector('[role="tooltip"] [data-slot="arrow"]')).not.toBeNull();
  });

  it('keeps the shortcut at the end of the tooltip in Arabic', async () => {
    await renderWithDS(
      <div className="flex justify-center p-24">
        <TooltipTrigger defaultOpen>
          <IconTrigger label="أرشفة">
            <ArchiveIcon />
          </IconTrigger>
          <Tooltip className="w-60" shortcut={['command', 'E']}>
            أرشفة
          </Tooltip>
        </TooltipTrigger>
      </div>,
      { locale: 'ar' },
    );

    await expect.element(page.getByRole('tooltip')).toBeVisible();
    const tooltip = document.querySelector('[role="tooltip"]')!.getBoundingClientRect();
    const label = document.querySelector('[data-slot="label"]')!.getBoundingClientRect();
    const shortcut = document.querySelector('[data-slot="shortcut"]')!.getBoundingClientRect();
    expect(label.right).toBeCloseTo(tooltip.right - 8, 0);
    expect(shortcut.left).toBeCloseTo(tooltip.left + 8, 0);
  });

  it('turns the motion off through the motion variant', () => {
    expect(tooltipStyles({ motion: 'spatial' }).base()).toContain('animate-ds-popover-in');
    expect(tooltipStyles({ motion: 'none' }).base()).not.toContain('animate-ds-popover-in');
  });
});

describe('RichTooltip', () => {
  it('renders a title and body as a tooltip when it has no action', async () => {
    const screen = await renderWithDS(
      <TooltipTrigger defaultOpen>
        <Button variant="text">Net revenue</Button>
        <RichTooltip title="Net revenue">
          Gross sales minus refunds, discounts and fees.
        </RichTooltip>
      </TooltipTrigger>,
    );

    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toBeVisible();
    await expect.element(tooltip).toHaveAttribute('data-slot', 'rich-tooltip');
    await expect
      .element(screen.getByRole('button', { name: 'Net revenue' }))
      .toHaveAccessibleDescription('Net revenue Gross sales minus refunds, discounts and fees.');
  });

  it('becomes a non-modal dialog the keyboard can enter when it has an action', async () => {
    const onLearnMore = vi.fn();
    const screen = await renderWithDS(
      <TooltipTrigger delay={100}>
        <Button variant="text">Net revenue</Button>
        <RichTooltip
          title="Net revenue"
          action={
            <Button variant="text" size="sm" onPress={onLearnMore}>
              How we calculate it
            </Button>
          }
        >
          Gross sales minus refunds, discounts and fees.
        </RichTooltip>
      </TooltipTrigger>,
    );
    const trigger = screen.getByRole('button', { name: 'Net revenue' });

    await userEvent.keyboard('{Tab}');
    await expect.element(trigger).toHaveFocus();
    const dialog = page.getByRole('dialog', { name: 'Net revenue' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveAttribute('data-trigger', 'PreviewTrigger');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Tab}');
    const action = page.getByRole('button', { name: 'How we calculate it' });
    await expect.element(action).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onLearnMore).toHaveBeenCalledOnce();

    await userEvent.keyboard('{Escape}');
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('still becomes a dialog when the rich tooltip is wrapped in another component', async () => {
    function RevenueHelp() {
      return (
        <RichTooltip title="Net revenue" action={<Button variant="text">Details</Button>}>
          Gross sales minus refunds.
        </RichTooltip>
      );
    }

    const screen = await renderWithDS(
      <TooltipTrigger delay={100}>
        <Button variant="text">Net revenue</Button>
        <RevenueHelp />
      </TooltipTrigger>,
    );
    const trigger = screen.getByRole('button', { name: 'Net revenue' });

    await userEvent.keyboard('{Tab}');
    await expect.element(trigger).toHaveFocus();
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect.element(page.getByRole('dialog', { name: 'Net revenue' })).toBeVisible();
    await userEvent.keyboard('{Tab}');
    await expect.element(page.getByRole('button', { name: 'Details' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(trigger).toHaveFocus();
  });

  it('stays closed with an action when the trigger or its group is disabled', async () => {
    const onOpenChange = vi.fn();
    const screen = await renderWithDS(
      <>
        <PointerRest />
        <TooltipTrigger isDisabled delay={50} onOpenChange={onOpenChange}>
          <Button variant="text">Net revenue</Button>
          <RichTooltip title="Net revenue" action={<Button variant="text">Details</Button>}>
            Gross sales minus refunds.
          </RichTooltip>
        </TooltipTrigger>
        <TooltipGroup isDisabled delay={50}>
          <TooltipTrigger>
            <Button variant="text">Refunds</Button>
            <RichTooltip title="Refunds" action={<Button variant="text">Open refunds</Button>}>
              Money returned to customers this month.
            </RichTooltip>
          </TooltipTrigger>
        </TooltipGroup>
      </>,
    );

    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Net revenue' })).toHaveFocus();
    await wait(300);
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Refunds' })).toHaveFocus();
    await wait(300);
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await hover(screen.getByRole('button', { name: 'Net revenue' }));
    await wait(300);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('supports a controlled open state with an action', async () => {
    function Controlled() {
      const [isOpen, setOpen] = useState(false);
      return (
        <>
          <p>{isOpen ? 'Details shown' : 'Details hidden'}</p>
          <TooltipTrigger isOpen={isOpen} onOpenChange={setOpen} delay={50}>
            <Button variant="text">Net revenue</Button>
            <RichTooltip title="Net revenue" action={<Button variant="text">Details</Button>}>
              Gross sales minus refunds.
            </RichTooltip>
          </TooltipTrigger>
        </>
      );
    }

    const screen = await renderWithDS(<Controlled />);
    const trigger = screen.getByRole('button', { name: 'Net revenue' });

    await userEvent.keyboard('{Tab}');
    await expect.element(trigger).toHaveFocus();
    await expect.element(page.getByRole('dialog', { name: 'Net revenue' })).toBeVisible();
    await expect.element(screen.getByText('Details shown')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(screen.getByText('Details hidden')).toBeInTheDocument();
  });

  it('opens with an action on hover', async () => {
    const screen = await renderWithDS(
      <>
        <PointerRest />
        <TooltipTrigger delay={100}>
          <Button variant="text">Net revenue</Button>
          <RichTooltip title="Net revenue" action={<Button variant="text">Details</Button>}>
            Gross sales minus refunds.
          </RichTooltip>
        </TooltipTrigger>
      </>,
    );

    await hover(screen.getByRole('button', { name: 'Net revenue' }));
    await expect.element(page.getByRole('dialog', { name: 'Net revenue' })).toBeVisible();
    await page.getByRole('button', { name: 'Details' }).hover();
    await wait(400);
    await expect.element(page.getByRole('dialog', { name: 'Net revenue' })).toBeVisible();
  });
});

describe('Tooltip accessibility', () => {
  const cases: Record<string, ReactNode> = {
    plain: (
      <TooltipTrigger defaultOpen>
        <IconTrigger label="Undo">
          <UndoIcon />
        </IconTrigger>
        <Tooltip shortcut={['mod', 'shift', 'Z']} showArrow>
          Undo last change
        </Tooltip>
      </TooltipTrigger>
    ),
    rich: (
      <TooltipTrigger defaultOpen>
        <Button variant="text">Net revenue</Button>
        <RichTooltip title="Net revenue" showArrow>
          Gross sales minus refunds, discounts and fees.
        </RichTooltip>
      </TooltipTrigger>
    ),
    action: (
      <TooltipTrigger defaultOpen>
        <Button variant="text">Net revenue</Button>
        <RichTooltip title="Net revenue" action={<Button variant="text">Details</Button>}>
          Gross sales minus refunds, discounts and fees.
        </RichTooltip>
      </TooltipTrigger>
    ),
  };

  for (const [name, ui] of Object.entries(cases)) {
    it(`has no violations for the ${name} tooltip in light, dark and RTL`, async () => {
      for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
        document.documentElement.classList.toggle('dark', 'dark' in options);
        const screen = await renderWithDS(
          <div className="flex justify-center p-32">{ui}</div>,
          options,
        );
        await expect
          .element(page.getByRole(name === 'action' ? 'dialog' : 'tooltip'))
          .toBeVisible();
        await wait(250);
        await expectNoA11yViolations(document.body);
        await screen.unmount();
      }
      document.documentElement.classList.remove('dark');
    });
  }
});
