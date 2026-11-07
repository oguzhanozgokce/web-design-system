import { Input, Label, TextField } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import {
  Popover,
  PopoverDialog,
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

    const provider = { labels: { popover: { close: 'Kapat' } } };
    const screen = await renderWithDS(<FolderPopover />, { provider });
    await screen.getByRole('button', { name: 'Storage' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Kapat' }))
      .toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await screen.unmount();

    const own = await renderWithDS(<FolderPopover labels={{ close: 'Pencereyi kapat' }} />, {
      provider,
    });
    await own.getByRole('button', { name: 'Storage' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Pencereyi kapat' }))
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
      const screen = await renderWithDS(<FolderPopover popover={{ showArrow: true }} />, options);
      await screen.getByRole('button', { name: 'Storage' }).click();
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
