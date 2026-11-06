import { useRef, useState } from 'react';
import { Button as AriaButton, Input, Label, TextField } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { Card } from '@/registry/ds/ui/card';
import {
  Popover,
  PopoverDialog,
  PopoverTrigger,
  popoverStyles,
  type PopoverDialogProps,
  type PopoverProps,
} from '@/registry/ds/ui/popover';

function LedgerPopover({
  popover,
  showCloseButton = true,
  labels,
}: {
  popover?: Omit<PopoverProps, 'children'>;
  showCloseButton?: boolean;
  labels?: PopoverDialogProps['labels'];
}) {
  return (
    <PopoverTrigger>
      <Button>Billing cycle</Button>
      <Popover {...popover}>
        <PopoverDialog title="Next invoice" showCloseButton={showCloseButton} labels={labels}>
          <p>Your Team plan renews on 1 December.</p>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  );
}

describe('Popover', () => {
  it('opens a dialog named by its title and closes from the close button', async () => {
    const screen = await renderWithDS(<LedgerPopover />);
    const trigger = screen.getByRole('button', { name: 'Billing cycle' });

    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Next invoice' });
    await expect.element(dialog).toBeVisible();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect
      .element(page.getByText('Your Team plan renews on 1 December.'))
      .toBeInTheDocument();

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const screen = await renderWithDS(<LedgerPopover />);
    const trigger = screen.getByRole('button', { name: 'Billing cycle' });

    await trigger.click();
    await expect.element(page.getByRole('dialog', { name: 'Next invoice' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('opens from the keyboard and moves focus into the popover', async () => {
    await renderWithDS(<LedgerPopover />);

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('dialog', { name: 'Next invoice' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Close' }))
      .toHaveFocus();
  });

  it('renders an arrow, the placement and the surface styles', async () => {
    const screen = await renderWithDS(
      <div className="flex h-96 items-end justify-center">
        <LedgerPopover popover={{ placement: 'top', showArrow: true }} />
      </div>,
    );

    await screen.getByRole('button', { name: 'Billing cycle' }).click();
    const popover = document.querySelector('[data-slot="popover"]');
    expect(popover).not.toBeNull();
    await expect.poll(() => popover?.getAttribute('data-placement')).toBe('top');
    expect(popover).toHaveAttribute('data-arrow', 'true');
    expect(popover?.querySelector('[data-slot="arrow"]')).not.toBeNull();
    expect(popover).toHaveClass('bg-surface-container-high', 'rounded-md', 'shadow-elevation-2');
  });

  it('exports popoverStyles for other overlays', () => {
    expect(popoverStyles()).toContain('bg-surface-container-high');
    expect(popoverStyles({ motion: 'none' })).not.toContain('animate-ds-popover-in');
    expect(popoverStyles({ className: 'min-w-(--trigger-width)' })).toContain(
      'min-w-(--trigger-width)',
    );
  });

  it('supports controlled open state', async () => {
    const onOpenChange = vi.fn();

    function Controlled() {
      const [isOpen, setOpen] = useState(false);
      return (
        <>
          <p>{isOpen ? 'Open' : 'Closed'}</p>
          <PopoverTrigger
            isOpen={isOpen}
            onOpenChange={(open) => {
              onOpenChange(open);
              setOpen(open);
            }}
          >
            <Button>Billing cycle</Button>
            <Popover>
              <PopoverDialog title="Next invoice" showCloseButton>
                Renews on 1 December.
              </PopoverDialog>
            </Popover>
          </PopoverTrigger>
        </>
      );
    }

    const screen = await renderWithDS(<Controlled />);
    await screen.getByRole('button', { name: 'Billing cycle' }).click();
    await expect.element(screen.getByText('Open')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
    await expect.element(screen.getByText('Closed')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('holds a form and closes through the render prop', async () => {
    const onSave = vi.fn();
    const screen = await renderWithDS(
      <PopoverTrigger>
        <Button>Rename</Button>
        <Popover>
          <PopoverDialog title="Rename ledger">
            {({ close }) => (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  onSave(new FormData(event.currentTarget).get('name'));
                  close();
                }}
              >
                <TextField name="name" defaultValue="Operating account" autoFocus>
                  <Label>Ledger name</Label>
                  <Input />
                </TextField>
                <Button type="submit">Save</Button>
              </form>
            )}
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>,
    );

    await screen.getByRole('button', { name: 'Rename' }).click();
    const input = page.getByRole('textbox', { name: 'Ledger name' });
    await expect.element(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, 'Payroll');
    await page.getByRole('button', { name: 'Save' }).click();

    expect(onSave).toHaveBeenCalledWith('Payroll');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('anchors a standalone popover to any element', async () => {
    function Anchored() {
      const anchor = useRef<HTMLSpanElement>(null);
      const [isOpen, setOpen] = useState(false);
      return (
        <div className="flex flex-col items-center gap-4">
          <span ref={anchor}>Monthly budget</span>
          <AriaButton onPress={() => setOpen(true)}>Explain</AriaButton>
          <Popover triggerRef={anchor} isOpen={isOpen} onOpenChange={setOpen}>
            <PopoverDialog aria-label="Budget">
              Resets on the first day of each month.
            </PopoverDialog>
          </Popover>
        </div>
      );
    }

    const screen = await renderWithDS(<Anchored />);
    await screen.getByRole('button', { name: 'Explain' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Budget' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the close button Close by default, whatever the locale', async () => {
    const screen = await renderWithDS(<LedgerPopover />, { locale: 'tr' });
    await screen.getByRole('button', { name: 'Billing cycle' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Close' }))
      .toBeVisible();
  });

  it('takes the close label from DSProvider, and from its labels prop first', async () => {
    const provider = { labels: { popover: { close: 'Kapat' } } };
    const screen = await renderWithDS(<LedgerPopover />, { provider });
    await screen.getByRole('button', { name: 'Billing cycle' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Kapat' }))
      .toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await screen.unmount();

    const own = await renderWithDS(<LedgerPopover labels={{ close: 'Pencereyi kapat' }} />, {
      provider,
    });
    await own.getByRole('button', { name: 'Billing cycle' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Pencereyi kapat' }))
      .toBeVisible();
  });

  it('raises cards inside it above its own surface', async () => {
    const screen = await renderWithDS(
      <PopoverTrigger>
        <Button>Billing cycle</Button>
        <Popover>
          <PopoverDialog title="Next invoice">
            <Card variant="outlined">Team plan, 12 seats</Card>
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>,
    );
    await screen.getByRole('button', { name: 'Billing cycle' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(document.querySelector('[data-slot="popover"] [data-slot="card"]')).toHaveAttribute(
      'data-surface',
      'surface-container-highest',
    );
  });

  it('sets the popover direction and language from the locale', async () => {
    const screen = await renderWithDS(<LedgerPopover />, { locale: 'ar' });
    await screen.getByRole('button', { name: 'Billing cycle' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Next invoice' })).toBeVisible();
    const popover = document.querySelector('[data-slot="popover"]');
    expect(popover).toHaveAttribute('dir', 'rtl');
    expect(popover).toHaveAttribute('lang', 'ar');
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Close' }))
      .toBeVisible();
  });

  it('places start on the right in Arabic', async () => {
    const screen = await renderWithDS(
      <div className="flex justify-end p-4">
        <PopoverTrigger>
          <Button>Sync</Button>
          <Popover placement="start" showArrow>
            <PopoverDialog aria-label="Sync schedule">Every hour.</PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </div>,
      { locale: 'ar' },
    );

    const trigger = screen.getByRole('button', { name: 'Sync' });
    await trigger.click();
    await expect.element(page.getByRole('dialog', { name: 'Sync schedule' })).toBeVisible();
    const popover = document.querySelector('[data-slot="popover"]');
    await expect.poll(() => popover?.getAttribute('data-placement')).toBe('right');
    expect(popover!.getBoundingClientRect().left).toBeGreaterThan(
      trigger.element().getBoundingClientRect().right,
    );
  });

  it('closes when the pointer presses outside', async () => {
    const onOpenChange = vi.fn();
    const screen = await renderWithDS(
      <PopoverTrigger onOpenChange={onOpenChange}>
        <Button>Billing cycle</Button>
        <Popover>
          <PopoverDialog title="Next invoice">Renews on 1 December.</PopoverDialog>
        </Popover>
      </PopoverTrigger>,
    );

    await screen.getByRole('button', { name: 'Billing cycle' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Next invoice' })).toBeVisible();
    await page.getByTestId('underlay').click({ force: true, position: { x: 400, y: 800 } });
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('skips the scale animation when motion is disabled', async () => {
    const screen = await renderWithDS(<LedgerPopover />, { provider: { motion: 'disabled' } });
    await screen.getByRole('button', { name: 'Billing cycle' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Next invoice' })).toBeVisible();
    expect(document.querySelector('[data-slot="popover"]')?.className).not.toContain(
      'animate-ds-popover-in',
    );
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(<LedgerPopover popover={{ showArrow: true }} />, options);
      await screen.getByRole('button', { name: 'Billing cycle' }).click();
      await expect.element(page.getByRole('dialog')).toBeVisible();
      await new Promise((resolve) => setTimeout(resolve, 250));
      await expectNoA11yViolations(document.body);
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
      await screen.unmount();
    }
    document.documentElement.classList.remove('dark');
  });
});
