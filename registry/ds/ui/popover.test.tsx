import { Input, Label, TextField } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import {
  Popover,
  PopoverDialog,
  PopoverPreviewTrigger,
  PopoverTrigger,
  type PopoverDialogProps,
  type PopoverProps,
} from '@/registry/ds/ui/popover';

function FolderPopover({
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
      <Button>Storage</Button>
      <Popover {...popover}>
        <PopoverDialog title="Storage details" showCloseButton={showCloseButton} labels={labels}>
          <p>Photos and videos use 36 GB of 50 GB.</p>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
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

describe('Popover', () => {
  it('animates the morph surface without scaling its content and finishes closing', async () => {
    const completed: string[] = [];
    const screen = await renderWithDS(
      <FolderPopover
        popover={{
          animation: 'morph',
          onAnimationStart: (event) => {
            if (event.target !== event.currentTarget || event.pseudoElement) return;
            const popover = event.currentTarget;
            const surface = getComputedStyle(popover, '::before');
            expect(surface.backgroundColor).toBe(roleBackground('bg-surface-overlay'));
            expect(surface.animationName).not.toBe('none');
            expect(surface.transformOrigin).toBe(getComputedStyle(popover).transformOrigin);
            const content = popover.querySelector('[data-slot="popover-content"]')!;
            expect(getComputedStyle(content).transform).toBe('none');
            expect(getComputedStyle(popover).scale).toBe('none');
            const phase = popover.hasAttribute('data-exiting') ? 'exit' : 'enter';
            void Promise.all(popover.getAnimations().map((animation) => animation.finished)).then(
              () => completed.push(phase),
            );
          },
        }}
      />,
    );
    await screen.getByRole('button', { name: 'Storage' }).click();
    const dialog = page.getByRole('dialog', { name: 'Storage details' });
    await expect.element(dialog).toBeVisible();
    await expect.poll(() => completed).toEqual(['enter']);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.poll(() => completed).toEqual(['enter', 'exit']);
  });

  it.each(['reduced', 'disabled'] as const)(
    'respects %s motion for the morph surface and content',
    async (motion) => {
      const screen = await renderWithDS(
        <FolderPopover popover={{ animation: 'morph', isEntering: true }} />,
        { provider: { motion } },
      );
      await screen.getByRole('button', { name: 'Storage' }).click();
      await expect.element(page.getByRole('dialog')).toBeVisible();
      const popover = document.querySelector('[data-slot="popover"]')!;
      expect(getComputedStyle(popover, '::before').animationName).toBe('none');
      expect(
        getComputedStyle(popover.querySelector('[data-slot="popover-content"]')!).animationName,
      ).toBe('none');
      if (motion === 'disabled') expect(getComputedStyle(popover).animationName).toBe('none');
      await page.getByRole('button', { name: 'Close', exact: true }).click();
      await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    },
  );

  it('keeps a hover preview non-modal and lets focus enter its action', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <PopoverPreviewTrigger delay={0}>
        <Button>Preview collection</Button>
        <Popover animation="morph" aria-label="Collection preview" className="p-4">
          <p>Four original scenes.</p>
          <Button onPress={onPress}>Save collection</Button>
        </Popover>
      </PopoverPreviewTrigger>,
    );
    const trigger = screen.getByRole('button', { name: 'Preview collection' });
    trigger.element().focus();
    await trigger.hover();
    const preview = page.getByRole('dialog', { name: 'Collection preview' });
    await expect.element(preview).toBeVisible();
    await expect.element(trigger).toHaveFocus();
    await expect.element(preview).not.toHaveAttribute('aria-modal', 'true');
    await userEvent.keyboard('{Tab}');
    const save = page.getByRole('button', { name: 'Save collection' });
    await expect.element(save).toHaveFocus();
    await save.click();
    expect(onPress).toHaveBeenCalledOnce();
    await expect.element(preview).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(preview).not.toBeInTheDocument();
  });

  it('keeps a long morph panel inside a compact viewport with scrollable content', async () => {
    const previous = { width: window.innerWidth, height: window.innerHeight };
    await page.viewport(375, 667);
    try {
      const screen = await renderWithDS(
        <div className="flex h-32 items-center justify-center">
          <PopoverTrigger>
            <Button>Details</Button>
            <Popover animation="morph">
              <PopoverDialog title="Collection details" showCloseButton className="w-80">
                {Array.from({ length: 20 }, (_, index) => (
                  <p key={index} className="py-2">
                    Scene {index + 1}
                  </p>
                ))}
              </PopoverDialog>
            </Popover>
          </PopoverTrigger>
        </div>,
      );
      await screen.getByRole('button', { name: 'Details', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Collection details' });
      await expect.element(dialog).toBeVisible();
      const content = dialog.element();
      await expect.poll(() => content.scrollHeight > content.clientHeight).toBe(true);
      const bounds = content.getBoundingClientRect();
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(375);
      expect(bounds.bottom).toBeLessThanOrEqual(667);
      await page.getByRole('button', { name: 'Close', exact: true }).click();
      await expect.element(dialog).not.toBeInTheDocument();
    } finally {
      await page.viewport(previous.width, previous.height);
    }
  });

  it('opens a dialog named by its title and closes from the close button', async () => {
    const screen = await renderWithDS(<FolderPopover />);
    const trigger = screen.getByRole('button', { name: 'Storage' });

    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Storage details' });
    await expect.element(dialog).toBeVisible();
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect
      .element(page.getByText('Photos and videos use 36 GB of 50 GB.'))
      .toBeInTheDocument();

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('renders an arrow, the placement and the surface styles', async () => {
    const screen = await renderWithDS(
      <div className="flex h-96 items-end justify-center">
        <FolderPopover popover={{ placement: 'top', showArrow: true }} />
      </div>,
    );

    await screen.getByRole('button', { name: 'Storage' }).click();
    const popover = document.querySelector('[data-slot="popover"]');
    expect(popover).not.toBeNull();
    await expect.poll(() => popover?.getAttribute('data-placement')).toBe('top');
    expect(popover).toHaveAttribute('data-arrow', 'true');
    expect(popover?.querySelector('[data-slot="arrow"]')).not.toBeNull();
    const style = getComputedStyle(popover!);
    expect(style.backgroundColor).toBe(roleBackground('bg-surface-overlay'));
    expect(style.boxShadow).not.toBe('none');
    expect(getComputedStyle(popover!.querySelector('[data-slot="arrow"] svg')!).fill).toBe(
      style.backgroundColor,
    );
  });

  it('pads its dialog 16px by default and 12px with padding sm', async () => {
    for (const [padding, pixels] of [
      [undefined, '16px'],
      ['sm', '12px'],
    ] as const) {
      const screen = await renderWithDS(
        <PopoverTrigger>
          <Button>Storage</Button>
          <Popover>
            <PopoverDialog title="Storage details" padding={padding}>
              36 GB of 50 GB used.
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>,
      );
      await screen.getByRole('button', { name: 'Storage' }).click();
      const dialog = page.getByRole('dialog', { name: 'Storage details' });
      await expect.element(dialog).toBeVisible();
      await expect.element(dialog).toHaveAttribute('data-padding', padding ?? 'md');
      expect(getComputedStyle(dialog.element()).paddingInlineStart).toBe(pixels);
      expect(getComputedStyle(dialog.element()).paddingTop).toBe(pixels);
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
      await screen.unmount();
    }
  });

  it('holds a form and closes through the render prop, without the styles of a surrounding ButtonGroup', async () => {
    const onSave = vi.fn();
    const screen = await renderWithDS(
      <ButtonGroup buttonVariant="outline" size="lg">
        <PopoverTrigger>
          <Button>Rename</Button>
          <Popover>
            <PopoverDialog title="Rename folder">
              {({ close }) => (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    onSave(new FormData(event.currentTarget).get('name'));
                    close();
                  }}
                >
                  <TextField name="name" defaultValue="Design assets" autoFocus>
                    <Label>Folder name</Label>
                    <Input />
                  </TextField>
                  <Button type="submit">Save</Button>
                </form>
              )}
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      </ButtonGroup>,
    );

    await screen.getByRole('button', { name: 'Rename' }).click();
    const input = page.getByRole('textbox', { name: 'Folder name' });
    await expect.element(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, 'Backups');
    const save = page.getByRole('button', { name: 'Save' });
    await expect.element(save).toHaveAttribute('data-variant', 'solid');
    await expect.element(save).toHaveAttribute('data-size', 'md');
    await save.click();

    expect(onSave).toHaveBeenCalledWith('Backups');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the close button Close by default, then from DSProvider, then from its labels prop', async () => {
    const english = await renderWithDS(<FolderPopover />, { locale: 'tr' });
    await english.getByRole('button', { name: 'Storage' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Close' }))
      .toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await english.unmount();

    const provider = { labels: { popover: { close: 'Dismiss' } } };
    const screen = await renderWithDS(<FolderPopover />, { provider });
    await screen.getByRole('button', { name: 'Storage' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Dismiss' }))
      .toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await screen.unmount();

    const own = await renderWithDS(<FolderPopover labels={{ close: 'Close this window' }} />, {
      provider,
    });
    await own.getByRole('button', { name: 'Storage' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Close this window' }))
      .toBeVisible();
  });

  it('sets the popover direction and language from the locale and places start on the right', async () => {
    const screen = await renderWithDS(
      <div className="flex justify-end p-4">
        <FolderPopover popover={{ placement: 'start', showArrow: true }} />
      </div>,
      { locale: 'ar' },
    );
    const trigger = screen.getByRole('button', { name: 'Storage' });
    await trigger.click();
    await expect.element(page.getByRole('dialog', { name: 'Storage details' })).toBeVisible();
    const popover = document.querySelector('[data-slot="popover"]');
    expect(popover).toHaveAttribute('dir', 'rtl');
    expect(popover).toHaveAttribute('lang', 'ar');
    await expect.poll(() => popover?.getAttribute('data-placement')).toBe('right');
    expect(popover!.getBoundingClientRect().left).toBeGreaterThan(
      trigger.element().getBoundingClientRect().right,
    );
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(
        <FolderPopover popover={{ showArrow: true, animation: 'morph' }} />,
        options,
      );
      await screen.getByRole('button', { name: 'Storage' }).click();
      await expect.element(page.getByRole('dialog')).toBeVisible();
      await expect
        .poll(() => document.querySelector('[data-slot="popover"]')?.hasAttribute('data-entering'))
        .toBe(false);
      await expectNoA11yViolations(document.body);
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
      await screen.unmount();
    }
    document.documentElement.classList.remove('dark');
  });
});
