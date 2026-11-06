import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { Card } from '@/registry/ds/ui/card';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import {
  Sheet,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
  type SheetProps,
  type SheetSnapPoint,
} from '@/registry/ds/ui/sheet';

function ProjectSheet(props: Omit<SheetProps, 'children'>) {
  return (
    <SheetTrigger>
      <Button>Open project</Button>
      <Sheet {...props}>
        <SheetHeader title="Project DOC-2048" description="Riverside Studios, due 14 November" />
        <SheetBody>
          <p>Three line items, paid by team transfer.</p>
        </SheetBody>
        <SheetFooter>
          <Button variant="text" slot="close">
            Cancel
          </Button>
          <Button>Mark as paid</Button>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}

function OrderTracker({ onConfirm }: { onConfirm?: () => void }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'order-tracker' : undefined}
        onPress={() => setOpen(!isOpen)}
      >
        Track order
      </Button>
      <Sheet
        id="order-tracker"
        side="bottom"
        variant="standard"
        isOpen={isOpen}
        onOpenChange={setOpen}
      >
        <SheetHeader title="Order 4821" description="Arriving this afternoon" />
        <SheetBody>Handed to DHL Express.</SheetBody>
        <SheetFooter>
          <Button onPress={onConfirm}>Confirm delivery</Button>
        </SheetFooter>
      </Sheet>
    </>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function part(slot: string) {
  const element = document.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (!element) throw new Error(`No element with data-slot="${slot}"`);
  return element;
}

function translateY(element: Element) {
  const transform = getComputedStyle(element).transform;
  return transform === 'none' ? 0 : new DOMMatrix(transform).m42;
}

async function drag(element: Element, deltaY: number, steps: number, interval: number) {
  const rect = element.getBoundingClientRect();
  const clientX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  const init = {
    bubbles: true,
    cancelable: true,
    pointerId: 7,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    clientX,
  };
  element.dispatchEvent(new PointerEvent('pointerdown', { ...init, buttons: 1, clientY: startY }));
  for (let step = 1; step <= steps; step++) {
    await wait(interval);
    element.dispatchEvent(
      new PointerEvent('pointermove', {
        ...init,
        buttons: 1,
        clientY: startY + (deltaY * step) / steps,
      }),
    );
  }
  element.dispatchEvent(
    new PointerEvent('pointerup', { ...init, buttons: 0, clientY: startY + deltaY }),
  );
  await wait(50);
}

describe('Sheet', () => {
  it('opens a modal dialog named by its title and closes from the close button', async () => {
    const screen = await renderWithDS(<ProjectSheet />);
    const trigger = screen.getByRole('button', { name: 'Open project' });

    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Project DOC-2048' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveAccessibleDescription('Riverside Studios, due 14 November');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');

    const root = part('sheet');
    expect(root).toHaveAttribute('data-side', 'end');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-variant', 'modal');
    expect(part('sheet-surface')).toHaveClass(
      'bg-surface-container-low',
      'rounded-s-xl',
      'shadow-elevation-1',
    );

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('closes on Escape and from a footer button with slot="close"', async () => {
    const screen = await renderWithDS(<ProjectSheet />);
    const trigger = screen.getByRole('button', { name: 'Open project' });

    await trigger.click();
    await expect.element(page.getByRole('dialog')).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();

    await trigger.click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps focus inside while open', async () => {
    const screen = await renderWithDS(<ProjectSheet />);
    await screen.getByRole('button', { name: 'Open project' }).click();
    const dialog = page.getByRole('dialog');
    await expect.element(dialog).toHaveFocus();

    await userEvent.keyboard('{Tab}');
    await expect.element(dialog.getByRole('button', { name: 'Close' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Tab}');
    await expect.element(dialog.getByRole('button', { name: 'Mark as paid' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(dialog.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('closes when the scrim is pressed unless it is not dismissable', async () => {
    const screen = await renderWithDS(<ProjectSheet size="sm" />);
    await screen.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await page.elementLocator(part('sheet-overlay')).click({ position: { x: 8, y: 8 } });
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await screen.unmount();

    const locked = await renderWithDS(<ProjectSheet size="sm" isDismissable={false} />);
    await locked.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await page.elementLocator(part('sheet-overlay')).click({ position: { x: 8, y: 8 } });
    await wait(100);
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports controlled state and closes through the render prop', async () => {
    const onOpenChange = vi.fn();

    function Controlled() {
      const [isOpen, setOpen] = useState(false);
      return (
        <>
          <Button onPress={() => setOpen(true)}>Edit member</Button>
          <p>{isOpen ? 'Open' : 'Closed'}</p>
          <Sheet
            side="start"
            isOpen={isOpen}
            onOpenChange={(open) => {
              onOpenChange(open);
              setOpen(open);
            }}
            aria-label="Edit Ayşe Demir"
          >
            {({ close }) => (
              <SheetBody>
                <Button onPress={close}>Save role</Button>
              </SheetBody>
            )}
          </Sheet>
        </>
      );
    }

    const screen = await renderWithDS(<Controlled />);
    await screen.getByRole('button', { name: 'Edit member' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Edit Ayşe Demir' })).toBeVisible();
    await expect.element(screen.getByText('Open')).toBeInTheDocument();
    expect(part('sheet-surface')).toHaveClass('rounded-e-xl');

    await page.getByRole('button', { name: 'Save role' }).click();
    await expect.element(screen.getByText('Closed')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('sizes side sheets by width and rounds only the exposed corners', async () => {
    const screen = await renderWithDS(<ProjectSheet side="end" size="sm" />);
    await screen.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await expect.poll(() => part('sheet').getBoundingClientRect().width).toBe(320);
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await screen.unmount();

    const top = await renderWithDS(<ProjectSheet side="top" size="full" />);
    await top.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(part('sheet-surface')).toHaveClass('rounded-none');
    expect(part('sheet-surface')).not.toHaveClass('rounded-b-xl');
    expect(part('sheet').getBoundingClientRect().height).toBe(window.innerHeight);
  });

  it('gives bottom sheets a drag handle that dismisses past 96px and springs back otherwise', async () => {
    const onOpenChange = vi.fn();
    const screen = await renderWithDS(
      <SheetTrigger onOpenChange={onOpenChange}>
        <Button>Share project</Button>
        <Sheet side="bottom">
          <SheetHeader title="Share project" showCloseButton={false} />
          <SheetBody>Send DOC-2048 to the follower.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Share project' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Share project' })).toBeVisible();
    const zone = part('sheet-handle-zone');
    expect(part('sheet-handle')).toHaveAttribute('aria-hidden', 'true');
    expect(part('sheet-surface')).toHaveClass('rounded-t-xl');

    await drag(zone, 40, 8, 40);
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(translateY(part('sheet-surface'))).toBe(0);

    await drag(zone, 140, 14, 40);
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('dismisses a bottom sheet flung down faster than 500px/s', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Filters</Button>
        <Sheet side="bottom">
          <SheetHeader title="Filters" />
          <SheetBody>Paid, overdue and draft projects.</SheetBody>
        </Sheet>
      </SheetTrigger>,
    );

    await screen.getByRole('button', { name: 'Filters' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await wait(400);
    await drag(part('sheet-header'), 60, 3, 16);
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps a bottom sheet open when it is not dismissable', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Review upload</Button>
        <Sheet side="bottom" isDismissable={false}>
          <SheetHeader title="Review upload" />
          <SheetBody>Confirm the team account before you continue.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Review upload' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await drag(part('sheet-handle-zone'), 200, 10, 40);
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(translateY(part('sheet-surface'))).toBe(0);
  });

  it('rests at snap points and resizes from the handle with pointer and keyboard', async () => {
    const onSnapPointChange = vi.fn();
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Transactions</Button>
        <Sheet side="bottom" snapPoints={['50%', '90%']} onSnapPointChange={onSnapPointChange}>
          <SheetHeader title="Transactions" />
          <SheetBody>42 transactions this month.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Transactions' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Transactions' })).toBeVisible();
    const surface = part('sheet-surface');
    const handle = page.getByRole('button', { name: 'Resize sheet' });

    expect(surface).toHaveAttribute('data-snap-point', '50%');
    expect(Math.abs(surface.offsetHeight - window.innerHeight * 0.9)).toBeLessThan(2);
    expect(Math.abs(translateY(surface) - window.innerHeight * 0.4)).toBeLessThan(2);
    await expect.element(handle).toHaveAttribute('aria-expanded', 'false');

    await handle.click();
    await expect.poll(() => surface.getAttribute('data-snap-point')).toBe('90%');
    expect(onSnapPointChange).toHaveBeenLastCalledWith('90%');
    await expect.element(handle).toHaveAttribute('aria-expanded', 'true');
    expect(translateY(surface)).toBe(0);

    await userEvent.keyboard('{Enter}');
    await expect.poll(() => surface.getAttribute('data-snap-point')).toBe('50%');
    expect(onSnapPointChange).toHaveBeenLastCalledWith('50%');
  });

  it('drags between snap points before it dismisses', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Transactions</Button>
        <Sheet side="bottom" snapPoints={['50%', '90%']} defaultSnapPoint="90%">
          <SheetHeader title="Transactions" />
          <SheetBody>42 transactions this month.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Transactions' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    const surface = part('sheet-surface');
    expect(surface).toHaveAttribute('data-snap-point', '90%');

    await drag(part('sheet-header'), window.innerHeight * 0.35, 20, 40);
    await expect.poll(() => surface.getAttribute('data-snap-point')).toBe('50%');
    await expect.element(page.getByRole('dialog')).toBeVisible();

    await drag(part('sheet-header'), 150, 15, 40);
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('never starts a drag from a button or a chip in the header', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Filters</Button>
        <Sheet side="bottom">
          <SheetHeader title="Filters">
            <ChipGroup label="Status" selectionMode="multiple" className="mt-3">
              <Chip id="paid">Paid</Chip>
              <Chip id="overdue">Overdue</Chip>
            </ChipGroup>
          </SheetHeader>
          <SheetBody>Paid, overdue and draft projects.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Filters' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await drag(page.getByRole('row', { name: 'Overdue' }).element(), 200, 10, 40);
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(translateY(part('sheet-surface'))).toBe(0);

    await drag(part('sheet-close'), 200, 10, 40);
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(translateY(part('sheet-surface'))).toBe(0);
    expect(part('sheet-surface')).not.toHaveAttribute('data-dragging');
  });

  it('still steps through snap points from the handle after a drag', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Transactions</Button>
        <Sheet side="bottom" snapPoints={['50%', '90%']}>
          <SheetHeader title="Transactions" />
          <SheetBody>42 transactions this month.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Transactions' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    const surface = part('sheet-surface');
    await drag(part('sheet-header'), 30, 6, 40);
    expect(surface).toHaveAttribute('data-snap-point', '50%');

    await page.getByRole('button', { name: 'Resize sheet' }).click();
    await expect.poll(() => surface.getAttribute('data-snap-point')).toBe('90%');

    await drag(part('sheet-handle'), -30, 6, 40);
    await page.getByRole('button', { name: 'Resize sheet' }).click();
    await expect.poll(() => surface.getAttribute('data-snap-point')).toBe('50%');
  });

  it('follows a controlled snap point', async () => {
    const onSnapPointChange = vi.fn();

    function Transactions() {
      const [snapPoint, setSnapPoint] = useState<SheetSnapPoint>('50%');
      return (
        <SheetTrigger>
          <Button>Transactions</Button>
          <Sheet
            side="bottom"
            snapPoints={['50%', '90%']}
            snapPoint={snapPoint}
            onSnapPointChange={setSnapPoint}
          >
            <SheetHeader title="Transactions" />
            <SheetBody>
              <Button onPress={() => setSnapPoint('90%')}>Show all</Button>
            </SheetBody>
          </Sheet>
        </SheetTrigger>
      );
    }

    const screen = await renderWithDS(<Transactions />, { provider: { motion: 'reduced' } });
    await screen.getByRole('button', { name: 'Transactions' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    const surface = part('sheet-surface');
    expect(surface).toHaveAttribute('data-snap-point', '50%');

    await page.getByRole('button', { name: 'Show all' }).click();
    await expect.poll(() => surface.getAttribute('data-snap-point')).toBe('90%');
    expect(translateY(surface)).toBe(0);
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await screen.unmount();

    const fixed = await renderWithDS(
      <SheetTrigger>
        <Button>Transactions</Button>
        <Sheet
          side="bottom"
          snapPoints={['50%', '90%']}
          snapPoint="50%"
          onSnapPointChange={onSnapPointChange}
        >
          <SheetHeader title="Transactions" />
          <SheetBody>42 transactions this month.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );
    await fixed.getByRole('button', { name: 'Transactions' }).click();
    await page.getByRole('button', { name: 'Resize sheet' }).click();
    expect(onSnapPointChange).toHaveBeenLastCalledWith('90%');
    expect(part('sheet-surface')).toHaveAttribute('data-snap-point', '50%');

    onSnapPointChange.mockClear();
    await drag(part('sheet-header'), -window.innerHeight * 0.35, 20, 40);
    expect(onSnapPointChange).toHaveBeenLastCalledWith('90%');
    expect(part('sheet-surface')).toHaveAttribute('data-snap-point', '50%');
    expect(Math.abs(translateY(part('sheet-surface')) - window.innerHeight * 0.4)).toBeLessThan(2);
  });

  it('makes a body that scrolls reachable from the keyboard', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Audit log</Button>
        <Sheet size="sm">
          <SheetHeader title="Audit log" />
          <SheetBody>
            {Array.from({ length: 60 }, (_, index) => (
              <p key={index}>Project INV-{2000 + index} exported by Ayşe Demir.</p>
            ))}
          </SheetBody>
        </Sheet>
      </SheetTrigger>,
    );
    await screen.getByRole('button', { name: 'Audit log' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await expect.poll(() => part('sheet-body').getAttribute('tabindex')).toBe('0');
    expect(part('sheet-body')).toHaveAttribute('data-scrollable');
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Tab}');
    await expect.element(page.elementLocator(part('sheet-body'))).toHaveFocus();
    await wait(400);
    await expectNoA11yViolations(document.body);
  });

  it('expands to the largest snap point when the keyboard reaches content below the fold', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Transactions</Button>
        <Sheet side="bottom" snapPoints={['50%', '90%']}>
          <SheetHeader title="Transactions" />
          <SheetBody>
            {Array.from({ length: 60 }, (_, index) => (
              <p key={index}>Card message {index + 1}, Operating account.</p>
            ))}
          </SheetBody>
          <SheetFooter>
            <Button>Export CSV</Button>
          </SheetFooter>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Transactions' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    const surface = part('sheet-surface');
    expect(surface).toHaveAttribute('data-snap-point', '50%');

    await page.elementLocator(part('sheet-body')).click({ position: { x: 24, y: 24 } });
    await wait(50);
    expect(surface).toHaveAttribute('data-snap-point', '50%');

    await page.getByRole('button', { name: 'Resize sheet' }).click();
    await expect.poll(() => surface.getAttribute('data-snap-point')).toBe('90%');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => surface.getAttribute('data-snap-point')).toBe('50%');

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Tab}');
    await expect.element(page.elementLocator(part('sheet-body'))).toHaveFocus();
    await expect.poll(() => surface.getAttribute('data-snap-point')).toBe('90%');
    expect(translateY(surface)).toBe(0);
  });

  it('only drags bottom sheets, with or without the handle', async () => {
    const top = await renderWithDS(<ProjectSheet side="top" />, {
      provider: { motion: 'reduced' },
    });
    await top.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(document.querySelector('[data-slot="sheet-handle-zone"]')).toBeNull();
    await drag(part('sheet-header'), -200, 10, 40);
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(translateY(part('sheet-surface'))).toBe(0);
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await top.unmount();

    const bottom = await renderWithDS(<ProjectSheet side="bottom" showDragHandle={false} />, {
      provider: { motion: 'reduced' },
    });
    await bottom.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(document.querySelector('[data-slot="sheet-handle-zone"]')).toBeNull();
    await drag(part('sheet-header'), 160, 10, 40);
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps a standard sheet open on Escape when keyboard dismiss is disabled', async () => {
    await renderWithDS(
      <Sheet
        side="bottom"
        variant="standard"
        defaultOpen
        isKeyboardDismissDisabled
        aria-label="Upload progress"
      >
        <SheetBody>
          <Button>Cancel upload</Button>
        </SheetBody>
      </Sheet>,
    );
    const dialog = page.getByRole('dialog', { name: 'Upload progress' });
    await expect.element(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel upload' }).click();
    await userEvent.keyboard('{Escape}');
    await wait(100);
    await expect.element(dialog).toBeVisible();
  });

  it('renders a standard sheet that leaves the page usable', async () => {
    const onArchive = vi.fn();
    const onConfirm = vi.fn();
    const screen = await renderWithDS(
      <div>
        <Button onPress={onArchive}>Archive order</Button>
        <OrderTracker onConfirm={onConfirm} />
      </div>,
    );
    const toggle = screen.getByRole('button', { name: 'Track order' });

    await toggle.click();
    const dialog = page.getByRole('dialog', { name: 'Order 4821' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).not.toHaveAttribute('aria-modal');
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(part('sheet')).toHaveAttribute('data-variant', 'standard');
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toBeNull();
    expect(part('sheet-close')).not.toHaveAttribute('aria-expanded');

    await screen.getByRole('button', { name: 'Archive order' }).click();
    expect(onArchive).toHaveBeenCalledOnce();
    await dialog.getByRole('button', { name: 'Confirm delivery' }).click();
    expect(onConfirm).toHaveBeenCalledOnce();
    await expect.element(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(toggle).toHaveFocus();
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect.element(page.getByRole('dialog')).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(toggle).toHaveFocus();
  });

  it('warns when a standard sheet is placed inside SheetTrigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await renderWithDS(
      <SheetTrigger>
        <Button>Order summary</Button>
        <Sheet variant="standard" aria-label="Order summary">
          <SheetBody>3 orders selected.</SheetBody>
        </Sheet>
      </SheetTrigger>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('isOpen and onOpenChange'));
    warn.mockRestore();
  });

  it('names the close button and the drag handle in English by default', async () => {
    const screen = await renderWithDS(<ProjectSheet side="bottom" snapPoints={['50%', '90%']} />, {
      locale: 'tr',
    });
    await screen.getByRole('button', { name: 'Open project' }).click();
    const dialog = page.getByRole('dialog', { name: 'Project DOC-2048' });
    await expect.element(dialog.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect.element(dialog.getByRole('button', { name: 'Resize sheet' })).toBeVisible();
  });

  it('takes its labels from DSProvider, and from its labels prop first', async () => {
    const provider = { labels: { sheet: { close: 'Kapat', dragHandle: 'Boyutlandır' } } };
    const screen = await renderWithDS(<ProjectSheet side="bottom" snapPoints={['50%', '90%']} />, {
      provider,
    });
    await screen.getByRole('button', { name: 'Open project' }).click();
    let dialog = page.getByRole('dialog', { name: 'Project DOC-2048' });
    await expect.element(dialog.getByRole('button', { name: 'Kapat' })).toBeVisible();
    await expect.element(dialog.getByRole('button', { name: 'Boyutlandır' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await screen.unmount();

    const own = await renderWithDS(
      <ProjectSheet
        side="bottom"
        snapPoints={['50%', '90%']}
        labels={{ close: 'Paneli kapat', dragHandle: 'Paneli yeniden boyutlandır' }}
      />,
      { provider },
    );
    await own.getByRole('button', { name: 'Open project' }).click();
    dialog = page.getByRole('dialog', { name: 'Project DOC-2048' });
    await expect.element(dialog.getByRole('button', { name: 'Paneli kapat' })).toBeVisible();
    await expect
      .element(dialog.getByRole('button', { name: 'Paneli yeniden boyutlandır' }))
      .toBeVisible();
  });

  it('raises cards inside it above its own surface', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Open project</Button>
        <Sheet aria-label="Project DOC-2048">
          <SheetBody>
            <Card variant="outlined">Paid by team transfer</Card>
          </SheetBody>
        </Sheet>
      </SheetTrigger>,
    );
    await screen.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(part('sheet-body').querySelector('[data-slot="card"]')).toHaveAttribute(
      'data-surface',
      'surface-container',
    );
  });

  it('takes its direction from the locale so end sheets open on the left in Arabic', async () => {
    const screen = await renderWithDS(<ProjectSheet size="sm" />, { locale: 'ar' });
    await screen.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(part('sheet-overlay')).toHaveAttribute('dir', 'rtl');
    await expect.poll(() => Math.round(part('sheet').getBoundingClientRect().left)).toBe(0);
    await expect.element(page.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  it('fades with reduced motion and skips animation when motion is disabled', async () => {
    const reduced = await renderWithDS(<ProjectSheet />, { provider: { motion: 'reduced' } });
    await reduced.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(part('sheet').className).toContain('data-[entering]:animate-ds-fade-in');
    expect(part('sheet').className).not.toContain('animate-ds-sheet-in-end');
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await reduced.unmount();

    const disabled = await renderWithDS(<ProjectSheet />, { provider: { motion: 'disabled' } });
    await disabled.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(part('sheet').className).not.toContain('animate-ds');
    expect(part('sheet-overlay').className).not.toContain('animate-ds');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      for (const [sheet, trigger] of [
        [<ProjectSheet key="end" />, 'Open project'],
        [<ProjectSheet key="bottom" side="bottom" snapPoints={['50%', '90%']} />, 'Open project'],
        [<OrderTracker key="standard" />, 'Track order'],
      ] as const) {
        const screen = await renderWithDS(sheet, options);
        await screen.getByRole('button', { name: trigger }).click();
        await expect.element(page.getByRole('dialog')).toBeVisible();
        await wait(400);
        await expectNoA11yViolations(document.body);
        await userEvent.keyboard('{Escape}');
        await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
        await screen.unmount();
      }
    }
    document.documentElement.classList.remove('dark');
  });
});
