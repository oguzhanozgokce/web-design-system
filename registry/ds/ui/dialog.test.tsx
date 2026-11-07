import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { InfoIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  useDialogLayout,
  type DialogHeaderProps,
  type DialogProps,
} from '@/registry/ds/ui/dialog';

const desktop = { width: 1280, height: 800 };
const phone = { width: 375, height: 812 };

function InviteDialog({
  dialog,
  header,
  body = <p>Invites expire after 7 days.</p>,
}: {
  dialog?: Partial<DialogProps>;
  header?: Partial<DialogHeaderProps>;
  body?: React.ReactNode;
}) {
  return (
    <DialogTrigger>
      <Button>Invite teammate</Button>
      <Dialog {...dialog}>
        <DialogHeader
          title="Invite teammate"
          description="They get access to the Projects folder."
          {...header}
        />
        <DialogBody>{body}</DialogBody>
        <DialogFooter>
          <Button slot="close" variant="soft" tone="neutral">
            Cancel
          </Button>
          <Button slot="close">Send invite</Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}

function folderEntries(count: number) {
  return (
    <ul>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="py-2">
          Photo {index + 1}: shared with the design team
        </li>
      ))}
    </ul>
  );
}

function surface() {
  return document.querySelector<HTMLElement>('[data-slot="dialog-surface"]');
}

function roleBackground(className: string) {
  const probe = document.createElement('div');
  probe.className = className;
  document.body.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

function removeStaleLiveAnnouncements() {
  document
    .querySelectorAll('[data-live-announcer] [role="img"]')
    .forEach((announcement) => announcement.remove());
}

async function pressScrim() {
  const overlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]');
  expect(overlay).not.toBeNull();
  await userEvent.click(page.elementLocator(overlay!), { position: { x: 4, y: 4 } });
}

describe('Dialog', () => {
  beforeEach(async () => {
    await page.viewport(desktop.width, desktop.height);
  });

  afterAll(async () => {
    await page.viewport(414, 896);
  });

  it('opens a modal dialog named by its title and described by its description', async () => {
    const screen = await renderWithDS(<InviteDialog />);
    const trigger = screen.getByRole('button', { name: 'Invite teammate' });

    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Invite teammate' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog).toHaveFocus();
    await expect
      .element(dialog)
      .toHaveAccessibleDescription('They get access to the Projects folder.');
    await expect
      .element(page.getByRole('heading', { level: 2, name: 'Invite teammate' }))
      .toBeVisible();
    expect(surface()).toHaveAttribute('data-size', 'md');
    expect(surface()).not.toHaveAttribute('data-fullscreen');
    const style = getComputedStyle(surface()!);
    expect(style.backgroundColor).toBe(roleBackground('bg-surface-overlay'));
    expect(style.boxShadow).not.toBe('none');
    const overlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')!;
    expect(getComputedStyle(overlay).backgroundColor).toBe(roleBackground('bg-backdrop'));
  });

  it('sits at the bottom of a phone screen and in the centre from 640px', async () => {
    await page.viewport(phone.width, phone.height);
    const screen = await renderWithDS(<InviteDialog />);
    await screen.getByRole('button', { name: 'Invite teammate' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await expect
      .poll(() => Math.round(phone.height - surface()!.getBoundingClientRect().bottom))
      .toBe(16);
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await screen.unmount();

    await page.viewport(desktop.width, desktop.height);
    const wide = await renderWithDS(<InviteDialog />);
    await wide.getByRole('button', { name: 'Invite teammate' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await expect
      .poll(() => {
        const box = surface()!.getBoundingClientRect();
        return Math.round(box.top - (desktop.height - box.bottom));
      })
      .toBe(0);
  });

  it('closes when the scrim is pressed, unless isDismissable is false', async () => {
    const screen = await renderWithDS(<InviteDialog />);
    await screen.getByRole('button', { name: 'Invite teammate' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await pressScrim();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await screen.unmount();

    const required = await renderWithDS(<InviteDialog dialog={{ isDismissable: false }} />);
    await required.getByRole('button', { name: 'Invite teammate' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await pressScrim();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect.element(page.getByRole('dialog')).toBeVisible();
  });

  it('puts a hero icon above the title, aligned to the start, and closes from the close button', async () => {
    const screen = await renderWithDS(
      <InviteDialog header={{ icon: <InfoIcon />, iconTone: 'success', showCloseButton: true }} />,
    );
    const trigger = screen.getByRole('button', { name: 'Invite teammate' });
    await trigger.click();

    const header = document.querySelector('[data-slot="dialog-header"]');
    const icon = header?.querySelector<HTMLElement>('[data-slot="dialog-icon"]');
    expect(icon?.querySelector('svg')).not.toBeNull();
    expect(getComputedStyle(icon!).backgroundColor).toBe(roleBackground('bg-success-soft'));
    expect(icon!.offsetWidth).toBe(40);
    expect(getComputedStyle(icon!).borderTopLeftRadius).not.toBe('0px');
    const heading = header!.querySelector<HTMLElement>('[data-slot="dialog-heading"]')!;
    expect(heading.offsetLeft).toBe(icon!.offsetLeft);
    expect(heading.offsetTop).toBeGreaterThan(icon!.offsetTop + icon!.offsetHeight);

    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it('shows scroll dividers only while the body overflows', async () => {
    const screen = await renderWithDS(
      <InviteDialog dialog={{ size: 'sm' }} body={folderEntries(60)} />,
    );
    await screen.getByRole('button', { name: 'Invite teammate' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();

    const body = document.querySelector<HTMLElement>('[data-slot="dialog-body"]')!;
    await expect.poll(() => body.hasAttribute('data-overflow-bottom')).toBe(true);
    expect(body).not.toHaveAttribute('data-overflow-top');
    expect(body).toHaveAttribute('tabindex', '0');
    expect(getComputedStyle(body).borderTopColor).toBe('rgba(0, 0, 0, 0)');

    body.scrollTop = body.scrollHeight;
    await expect.poll(() => body.hasAttribute('data-overflow-top')).toBe(true);
    await expect.poll(() => body.hasAttribute('data-overflow-bottom')).toBe(false);
    await expect.poll(() => getComputedStyle(body).borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await screen.unmount();

    const short = await renderWithDS(<InviteDialog />);
    await short.getByRole('button', { name: 'Invite teammate' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    const shortBody = document.querySelector<HTMLElement>('[data-slot="dialog-body"]')!;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(shortBody).not.toHaveAttribute('data-overflow-top');
    expect(shortBody).not.toHaveAttribute('data-overflow-bottom');
    expect(shortBody).not.toHaveAttribute('tabindex');
  });

  it('turns into a full-screen dialog with a top app bar on compact screens', async () => {
    await page.viewport(phone.width, phone.height);
    const onSave = vi.fn();
    const screen = await renderWithDS(
      <InviteDialog
        dialog={{ fullScreenOnMobile: true }}
        header={{
          action: (
            <Button variant="ghost" tone="primary" onPress={onSave}>
              Save
            </Button>
          ),
        }}
      />,
    );
    await screen.getByRole('button', { name: 'Invite teammate' }).click();
    const dialog = page.getByRole('dialog', { name: 'Invite teammate' });
    await expect.element(dialog).toBeVisible();

    expect(surface()).toHaveAttribute('data-fullscreen', 'true');
    expect(getComputedStyle(surface()!).borderTopLeftRadius).toBe('0px');
    const box = surface()!.getBoundingClientRect();
    expect(box.width).toBe(phone.width);
    expect(box.height).toBe(phone.height);
    const appBar = document.querySelector<HTMLElement>('[data-slot="dialog-header"]')!;
    expect(getComputedStyle(appBar).minHeight).toBe('56px');

    const close = dialog.getByRole('button', { name: 'Close' });
    const save = dialog.getByRole('button', { name: 'Save' });
    await expect.element(close).toBeVisible();
    await expect.element(close).toHaveAttribute('data-size', 'md');
    await expect.element(save).toBeVisible();
    expect(document.querySelector('[data-slot="dialog-footer"]')).not.toBeVisible();
    expect(close.element().getBoundingClientRect().left).toBeLessThan(
      save.element().getBoundingClientRect().left,
    );

    await save.click();
    expect(onSave).toHaveBeenCalledOnce();
    await close.click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('applies each size as a maximum width', async () => {
    for (const [size, width] of [
      ['sm', 384],
      ['md', 448],
      ['lg', 512],
      ['xl', 672],
      ['full', desktop.width],
    ] as const) {
      const screen = await renderWithDS(<InviteDialog dialog={{ size }} />);
      await screen.getByRole('button', { name: 'Invite teammate' }).click();
      await expect.element(page.getByRole('dialog')).toBeVisible();
      expect(surface()).toHaveAttribute('data-size', size);
      expect(surface()!.offsetWidth).toBe(width);
      if (size === 'full') expect(surface()).toHaveAttribute('data-fullscreen', 'true');
      else expect(surface()).not.toHaveAttribute('data-fullscreen');
      await userEvent.keyboard('{Escape}');
      await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
      await screen.unmount();
    }
  });

  it('renders nothing for empty header slots', async () => {
    const hasIcon = false;
    const screen = await renderWithDS(
      <InviteDialog
        header={{ icon: hasIcon && <InfoIcon />, description: hasIcon && 'Unused description' }}
      />,
    );
    await screen.getByRole('button', { name: 'Invite teammate' }).click();
    const dialog = page.getByRole('dialog', { name: 'Invite teammate' });
    await expect.element(dialog).toBeVisible();
    const header = document.querySelector('[data-slot="dialog-header"]');
    expect(header?.querySelector('[data-slot="dialog-icon"]')).toBeNull();
    expect(header?.querySelector('[data-slot="dialog-description"]')).toBeNull();
    await expect.element(dialog).not.toHaveAttribute('aria-describedby');
  });

  it('lists every description and a consumer aria-describedby', async () => {
    const screen = await renderWithDS(
      <>
        <p id="folder-owner">Owned by Ayşe Demir.</p>
        <DialogTrigger>
          <Button>Share folder</Button>
          <Dialog aria-describedby="folder-owner">
            <DialogHeader title="Share folder" description="Members see every entry." />
            <DialogBody>
              <DialogDescription>Links stay valid for 7 days.</DialogDescription>
            </DialogBody>
          </Dialog>
        </DialogTrigger>
      </>,
    );
    await screen.getByRole('button', { name: 'Share folder' }).click();
    await expect
      .element(page.getByRole('dialog', { name: 'Share folder' }))
      .toHaveAccessibleDescription(
        'Owned by Ayşe Demir. Members see every entry. Links stay valid for 7 days.',
      );
  });

  it('tells content which layout it is in through useDialogLayout', async () => {
    function LayoutName() {
      const { isFullScreen } = useDialogLayout();
      return <span data-testid="layout">{isFullScreen ? 'full screen' : 'basic'}</span>;
    }

    await page.viewport(phone.width, phone.height);
    const screen = await renderWithDS(
      <InviteDialog
        dialog={{ fullScreenOnMobile: true }}
        header={{ action: <Button variant="ghost">Save</Button> }}
        body={<LayoutName />}
      />,
    );
    await screen.getByRole('button', { name: 'Invite teammate' }).click();
    await expect.element(page.getByTestId('layout')).toHaveTextContent('full screen');

    await page.viewport(desktop.width, desktop.height);
    await expect.element(page.getByTestId('layout')).toHaveTextContent('basic');
    expect(surface()).not.toHaveAttribute('data-fullscreen');
    const dialog = page.getByRole('dialog');
    await expect.element(dialog.getByRole('button', { name: 'Send invite' })).toBeVisible();
    await expect.element(dialog.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(dialog.getByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('opens without a trigger, uncontrolled from defaultOpen or controlled', async () => {
    const onDefaultOpenChange = vi.fn();
    const uncontrolled = await renderWithDS(
      <Dialog defaultOpen onOpenChange={onDefaultOpenChange}>
        <DialogHeader title="What changed in March" showCloseButton />
        <DialogBody>Exports now include attachments.</DialogBody>
      </Dialog>,
    );
    const changes = page.getByRole('dialog', { name: 'What changed in March' });
    await expect.element(changes).toBeVisible();
    await changes.getByRole('button', { name: 'Close' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(onDefaultOpenChange).toHaveBeenCalledWith(false);
    await uncontrolled.unmount();

    const onOpenChange = vi.fn();

    function Controlled() {
      const [isOpen, setOpen] = useState(false);
      return (
        <>
          <Button onPress={() => setOpen(true)}>Rename folder</Button>
          <p>{isOpen ? 'Open' : 'Closed'}</p>
          <Dialog
            isOpen={isOpen}
            onOpenChange={(open) => {
              onOpenChange(open);
              setOpen(open);
            }}
          >
            <DialogHeader title="Rename folder" showCloseButton />
            <DialogBody>Names show in search and in shared links.</DialogBody>
          </Dialog>
        </>
      );
    }

    const screen = await renderWithDS(<Controlled />);
    await screen.getByRole('button', { name: 'Rename folder' }).click();
    await expect.element(page.getByRole('dialog', { name: 'Rename folder' })).toBeVisible();
    await expect.element(screen.getByText('Open')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await expect.element(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('names every close button from labels, then DSProvider, then the English default', async () => {
    const english = await renderWithDS(<InviteDialog header={{ showCloseButton: true }} />, {
      locale: 'tr',
    });
    await english.getByRole('button', { name: 'Invite teammate' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Close' }))
      .toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await english.unmount();

    const provided = await renderWithDS(<InviteDialog header={{ showCloseButton: true }} />, {
      provider: { labels: { dialog: { close: 'Kapat' } } },
    });
    await provided.getByRole('button', { name: 'Invite teammate' }).click();
    await expect
      .element(page.getByRole('dialog').getByRole('button', { name: 'Kapat' }))
      .toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await provided.unmount();

    await page.viewport(phone.width, phone.height);
    const screen = await renderWithDS(
      <DialogTrigger>
        <Button>Invite teammate</Button>
        <Dialog fullScreenOnMobile labels={{ close: 'Pencereyi kapat' }}>
          <DialogHeader title="Ekip arkadaşı davet et" />
          <DialogBody>Davetler 7 gün sonra sona erer.</DialogBody>
          <DialogFooter>
            <DialogClose />
          </DialogFooter>
        </Dialog>
      </DialogTrigger>,
      { provider: { labels: { dialog: { close: 'Kapat' } } } },
    );
    await screen.getByRole('button', { name: 'Invite teammate' }).click();
    const dialog = page.getByRole('dialog', { name: 'Ekip arkadaşı davet et' });
    await expect.element(dialog).toBeVisible();
    expect(surface()).toHaveAttribute('data-fullscreen', 'true');
    const closeButtons = dialog.getByRole('button', { name: 'Pencereyi kapat' }).elements();
    expect(closeButtons).toHaveLength(2);
    await expect.element(dialog.getByRole('button', { name: 'Kapat' })).not.toBeInTheDocument();
  });

  it('renders its buttons at their own size and variant when opened from a ButtonGroup', async () => {
    const screen = await renderWithDS(
      <ButtonGroup aria-label="Profile actions" size="sm" buttonVariant="outline">
        <Button>Copy link</Button>
        <DialogTrigger>
          <Button>Edit profile</Button>
          <Dialog>
            <DialogHeader title="Edit profile" />
            <DialogFooter>
              <Button slot="close">Save</Button>
            </DialogFooter>
          </Dialog>
        </DialogTrigger>
      </ButtonGroup>,
    );
    const trigger = screen.getByRole('button', { name: 'Edit profile' });
    await expect.element(trigger).toHaveAttribute('data-size', 'sm');
    await expect.element(trigger).toHaveAttribute('data-variant', 'outline');

    await trigger.click();
    const save = page.getByRole('dialog').getByRole('button', { name: 'Save' });
    await expect.element(save).toHaveAttribute('data-size', 'md');
    await expect.element(save).toHaveAttribute('data-variant', 'solid');
  });

  it('sets the direction and language of the portal from the locale', async () => {
    const screen = await renderWithDS(<InviteDialog header={{ showCloseButton: true }} />, {
      locale: 'ar',
    });
    await screen.getByRole('button', { name: 'Invite teammate' }).click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toHaveAttribute('dir', 'rtl');
    expect(overlay).toHaveAttribute('lang', 'ar');

    const close = page.getByRole('dialog').getByRole('button', { name: 'Close' });
    await expect.element(close).toBeVisible();
    const closeBox = close.element().getBoundingClientRect();
    const surfaceBox = surface()!.getBoundingClientRect();
    expect(closeBox.left - surfaceBox.left).toBeLessThan(surfaceBox.right - closeBox.right);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    const layouts = [
      {
        viewport: desktop,
        dialog: (
          <InviteDialog
            dialog={{ size: 'sm' }}
            header={{ icon: <InfoIcon />, showCloseButton: true }}
            body={folderEntries(30)}
          />
        ),
      },
      {
        viewport: phone,
        dialog: (
          <InviteDialog
            dialog={{ fullScreenOnMobile: true }}
            header={{ action: <Button variant="ghost">Save</Button> }}
            body={folderEntries(30)}
          />
        ),
      },
    ];
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      for (const { viewport, dialog } of layouts) {
        await page.viewport(viewport.width, viewport.height);
        const screen = await renderWithDS(dialog, options);
        await screen.getByRole('button', { name: 'Invite teammate' }).click();
        await expect.element(page.getByRole('dialog')).toBeVisible();
        await new Promise((resolve) => setTimeout(resolve, 400));
        removeStaleLiveAnnouncements();
        await expectNoA11yViolations(document.body);
        await userEvent.keyboard('{Escape}');
        await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
        await screen.unmount();
      }
    }
    document.documentElement.classList.remove('dark');
  });
});
