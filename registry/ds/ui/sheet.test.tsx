import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
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
        <SheetHeader
          title="Project Atlas"
          description="Updated by the design team on 14 November"
        />
        <SheetBody>
          <p>Three tasks are still open.</p>
        </SheetBody>
        <SheetFooter>
          <Button variant="soft" tone="neutral" slot="close">
            Cancel
          </Button>
          <Button>Save changes</Button>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}

function UploadTracker({ onConfirm }: { onConfirm?: () => void }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'upload-tracker' : undefined}
        onPress={() => setOpen(!isOpen)}
      >
        Show uploads
      </Button>
      <Sheet
        id="upload-tracker"
        side="bottom"
        variant="standard"
        isOpen={isOpen}
        onOpenChange={setOpen}
      >
        <SheetHeader title="Uploads" description="3 photos left" />
        <SheetBody>Uploading to the Team folder.</SheetBody>
        <SheetFooter>
          <Button onPress={onConfirm}>Pause uploads</Button>
        </SheetFooter>
      </Sheet>
    </>
  );
}

function roleBackground(className: string) {
  const probe = document.createElement('div');
  probe.className = className;
  document.body.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

function closeButton() {
  return page.getByRole('dialog').getByRole('button', { name: 'Close' });
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
  it('opens a modal dialog named by its title and closes from the close button and slot="close"', async () => {
    const screen = await renderWithDS(<ProjectSheet />);
    const trigger = screen.getByRole('button', { name: 'Open project' });

    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Project Atlas' });
    await expect.element(dialog).toBeVisible();
    await expect
      .element(dialog)
      .toHaveAccessibleDescription('Updated by the design team on 14 November');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');

    const root = part('sheet');
    expect(root).toHaveAttribute('data-side', 'end');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-variant', 'modal');
    expect(root).not.toHaveAttribute('data-detached');
    const surface = getComputedStyle(part('sheet-surface'));
    expect(surface.backgroundColor).toBe(roleBackground('bg-surface-overlay'));
    expect(surface.boxShadow).not.toBe('none');
    expect(getComputedStyle(part('sheet-overlay')).backgroundColor).toBe(
      roleBackground('bg-backdrop'),
    );

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();

    await trigger.click();
    await page.getByRole('button', { name: 'Cancel' }).click();
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
            aria-label="Edit Alex Morgan"
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
    await expect.element(page.getByRole('dialog', { name: 'Edit Alex Morgan' })).toBeVisible();
    await expect.element(screen.getByText('Open')).toBeInTheDocument();

    await page.getByRole('button', { name: 'Save role' }).click();
    await expect.element(screen.getByText('Closed')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('sizes side sheets by width, rounds only the corners that face the page and floats detached sheets 8px in', async () => {
    await page.viewport(1280, 800);
    for (const [size, width] of [
      ['sm', 320],
      ['md', 384],
      ['lg', 512],
      ['xl', 672],
    ] as const) {
      const screen = await renderWithDS(<ProjectSheet side="end" size={size} />);
      await screen.getByRole('button', { name: 'Open project' }).click();
      await expect.element(page.getByRole('dialog')).toBeVisible();
      expect(part('sheet').offsetWidth).toBe(width);
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
      await screen.unmount();
    }
    await page.viewport(414, 896);

    const narrow = await renderWithDS(<ProjectSheet side="end" />);
    await narrow.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(part('sheet').offsetWidth).toBe(Math.round(414 * 0.85));
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await narrow.unmount();

    const top = await renderWithDS(<ProjectSheet side="top" />);
    await top.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    const rounded = getComputedStyle(part('sheet-surface'));
    expect(rounded.borderTopLeftRadius).toBe('0px');
    expect(rounded.borderBottomLeftRadius).toBe('24px');
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await top.unmount();

    const full = await renderWithDS(<ProjectSheet side="top" size="full" />);
    await full.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(getComputedStyle(part('sheet-surface')).borderBottomLeftRadius).toBe('0px');
    expect(part('sheet').getBoundingClientRect().height).toBe(window.innerHeight);
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await full.unmount();

    for (const side of ['end', 'bottom'] as const) {
      const screen = await renderWithDS(<ProjectSheet side={side} detached />, {
        provider: { motion: 'disabled' },
      });
      await screen.getByRole('button', { name: 'Open project' }).click();
      await expect.element(page.getByRole('dialog')).toBeVisible();
      const root = part('sheet');
      expect(root).toHaveAttribute('data-detached', 'true');
      const box = root.getBoundingClientRect();
      expect(Math.round(window.innerHeight - box.bottom)).toBe(8);
      if (side === 'end') {
        expect(Math.round(box.top)).toBe(8);
        expect(Math.round(document.documentElement.clientWidth - box.right)).toBe(8);
      }
      const surface = getComputedStyle(part('sheet-surface'));
      expect(surface.borderTopLeftRadius).toBe('24px');
      expect(surface.borderBottomRightRadius).toBe('24px');
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
      await screen.unmount();
    }
  });

  it('gives bottom sheets a drag handle that dismisses past 96px and springs back otherwise', async () => {
    const onOpenChange = vi.fn();
    const screen = await renderWithDS(
      <SheetTrigger onOpenChange={onOpenChange}>
        <Button>Share project</Button>
        <Sheet side="bottom">
          <SheetHeader title="Share project" showCloseButton={false} />
          <SheetBody>Send Project Atlas to a teammate.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Share project' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Share project' })).toBeVisible();
    const zone = part('sheet-handle-zone');
    expect(part('sheet-handle')).toHaveAttribute('aria-hidden', 'true');
    expect(getComputedStyle(part('sheet-surface')).borderTopLeftRadius).toBe('24px');
    expect(getComputedStyle(part('sheet-surface')).borderBottomLeftRadius).toBe('0px');

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
          <SheetBody>Open, archived and draft projects.</SheetBody>
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
          <SheetBody>Check the photos before you continue.</SheetBody>
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
        <Button>Photos</Button>
        <Sheet side="bottom" snapPoints={['50%', '90%']} onSnapPointChange={onSnapPointChange}>
          <SheetHeader title="Photos" />
          <SheetBody>42 photos this month.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Photos' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Photos' })).toBeVisible();
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
        <Button>Photos</Button>
        <Sheet side="bottom" snapPoints={['50%', '90%']} defaultSnapPoint="90%">
          <SheetHeader title="Photos" />
          <SheetBody>42 photos this month.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Photos' }).click();
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
              <Chip id="open">Open</Chip>
              <Chip id="archived">Archived</Chip>
            </ChipGroup>
          </SheetHeader>
          <SheetBody>Open, archived and draft projects.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Filters' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await drag(page.getByRole('row', { name: 'Archived' }).element(), 200, 10, 40);
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(translateY(part('sheet-surface'))).toBe(0);

    await drag(closeButton().element(), 200, 10, 40);
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(translateY(part('sheet-surface'))).toBe(0);
    expect(part('sheet-surface')).not.toHaveAttribute('data-dragging');
  });

  it('still steps through snap points from the handle after a drag', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Photos</Button>
        <Sheet side="bottom" snapPoints={['50%', '90%']}>
          <SheetHeader title="Photos" />
          <SheetBody>42 photos this month.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Photos' }).click();
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

    function PhotoSheet() {
      const [snapPoint, setSnapPoint] = useState<SheetSnapPoint>('50%');
      return (
        <SheetTrigger>
          <Button>Photos</Button>
          <Sheet
            side="bottom"
            snapPoints={['50%', '90%']}
            snapPoint={snapPoint}
            onSnapPointChange={setSnapPoint}
          >
            <SheetHeader title="Photos" />
            <SheetBody>
              <Button onPress={() => setSnapPoint('90%')}>Show all</Button>
            </SheetBody>
          </Sheet>
        </SheetTrigger>
      );
    }

    const screen = await renderWithDS(<PhotoSheet />, { provider: { motion: 'reduced' } });
    await screen.getByRole('button', { name: 'Photos' }).click();
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
        <Button>Photos</Button>
        <Sheet
          side="bottom"
          snapPoints={['50%', '90%']}
          snapPoint="50%"
          onSnapPointChange={onSnapPointChange}
        >
          <SheetHeader title="Photos" />
          <SheetBody>42 photos this month.</SheetBody>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );
    await fixed.getByRole('button', { name: 'Photos' }).click();
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
              <p key={index}>Photo IMG-{2000 + index} added by Alex Morgan.</p>
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
  });

  it('expands to the largest snap point when the keyboard reaches content below the fold', async () => {
    const screen = await renderWithDS(
      <SheetTrigger>
        <Button>Photos</Button>
        <Sheet side="bottom" snapPoints={['50%', '90%']}>
          <SheetHeader title="Photos" />
          <SheetBody>
            {Array.from({ length: 60 }, (_, index) => (
              <p key={index}>Photo {index + 1}, Team folder.</p>
            ))}
          </SheetBody>
          <SheetFooter>
            <Button>Download all</Button>
          </SheetFooter>
        </Sheet>
      </SheetTrigger>,
      { provider: { motion: 'reduced' } },
    );

    await screen.getByRole('button', { name: 'Photos' }).click();
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

  it('renders a standard sheet that leaves the page usable and can ignore Escape', async () => {
    const onArchive = vi.fn();
    const onConfirm = vi.fn();
    const screen = await renderWithDS(
      <div>
        <Button onPress={onArchive}>Archive album</Button>
        <UploadTracker onConfirm={onConfirm} />
      </div>,
    );
    const toggle = screen.getByRole('button', { name: 'Show uploads' });

    await toggle.click();
    const dialog = page.getByRole('dialog', { name: 'Uploads' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).not.toHaveAttribute('aria-modal');
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(part('sheet')).toHaveAttribute('data-variant', 'standard');
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toBeNull();
    await expect.element(closeButton()).not.toHaveAttribute('aria-expanded');

    await screen.getByRole('button', { name: 'Archive album' }).click();
    expect(onArchive).toHaveBeenCalledOnce();
    await dialog.getByRole('button', { name: 'Pause uploads' }).click();
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
    await screen.unmount();

    await renderWithDS(
      <Sheet
        side="bottom"
        variant="standard"
        defaultOpen
        isKeyboardDismissDisabled
        aria-label="Upload progress"
      >
        <SheetBody>
          <Button>Pause upload</Button>
        </SheetBody>
      </Sheet>,
    );
    const locked = page.getByRole('dialog', { name: 'Upload progress' });
    await locked.getByRole('button', { name: 'Pause upload' }).click();
    await userEvent.keyboard('{Escape}');
    await wait(100);
    await expect.element(locked).toBeVisible();
  });

  it('warns when a standard sheet is placed inside SheetTrigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await renderWithDS(
      <SheetTrigger>
        <Button>Selection</Button>
        <Sheet variant="standard" aria-label="Selection">
          <SheetBody>3 photos selected.</SheetBody>
        </Sheet>
      </SheetTrigger>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('isOpen and onOpenChange'));
    warn.mockRestore();
  });

  it('names its controls in English, then from DSProvider, then from its labels prop first', async () => {
    const provider = { labels: { sheet: { close: 'Dismiss', dragHandle: 'Resize panel' } } };
    const own = { close: 'Close this panel', dragHandle: 'Resize this panel' };
    for (const [options, labels, close, handle] of [
      [{ locale: 'tr' }, undefined, 'Close', 'Resize sheet'],
      [{ provider }, undefined, 'Dismiss', 'Resize panel'],
      [{ provider }, own, own.close, own.dragHandle],
    ] as const) {
      const screen = await renderWithDS(
        <ProjectSheet side="bottom" snapPoints={['50%', '90%']} labels={labels} />,
        options,
      );
      await screen.getByRole('button', { name: 'Open project' }).click();
      const dialog = page.getByRole('dialog', { name: 'Project Atlas' });
      await expect.element(dialog.getByRole('button', { name: close })).toBeVisible();
      await expect.element(dialog.getByRole('button', { name: handle })).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
      await screen.unmount();
    }
  });

  it('takes its direction from the locale so end sheets open on the left in Arabic', async () => {
    const screen = await renderWithDS(<ProjectSheet size="sm" />, { locale: 'ar' });
    await screen.getByRole('button', { name: 'Open project' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    expect(part('sheet-overlay')).toHaveAttribute('dir', 'rtl');
    await expect.poll(() => Math.round(part('sheet').getBoundingClientRect().left)).toBe(0);
    await expect.element(page.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      for (const [sheet, trigger] of [
        [<ProjectSheet key="end" />, 'Open project'],
        [<ProjectSheet key="bottom" side="bottom" snapPoints={['50%', '90%']} />, 'Open project'],
        [<UploadTracker key="standard" />, 'Show uploads'],
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
