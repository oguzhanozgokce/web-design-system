import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { DeleteIcon } from '@/registry/ds/lib/icons';
import { AlertDialog, type AlertDialogProps } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';
import { DialogTrigger } from '@/registry/ds/ui/dialog';

function deferred() {
  let resolve: () => void = () => {};
  let reject: (reason?: unknown) => void = () => {};
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function DeleteFolder(props: Partial<AlertDialogProps>) {
  return (
    <DialogTrigger>
      <Button tone="error">Delete folder</Button>
      <AlertDialog
        title="Delete “Design assets”?"
        description="All 1,284 photos and their comments are removed. This cannot be undone."
        tone="error"
        confirmLabel="Delete folder"
        {...props}
      />
    </DialogTrigger>
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

function removeStaleLiveAnnouncements() {
  document
    .querySelectorAll('[data-live-announcer] [role="img"]')
    .forEach((announcement) => announcement.remove());
}

async function openDialog(screen: Awaited<ReturnType<typeof renderWithDS>>) {
  await screen.getByRole('button', { name: 'Delete folder' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect.element(dialog).toBeVisible();
  return dialog;
}

describe('AlertDialog', () => {
  it('renders an alertdialog named by its title and described by its description', async () => {
    const screen = await renderWithDS(<DeleteFolder />);
    const dialog = await openDialog(screen);

    await expect.element(dialog).toHaveAccessibleName('Delete “Design assets”?');
    await expect
      .element(dialog)
      .toHaveAccessibleDescription(
        'All 1,284 photos and their comments are removed. This cannot be undone.',
      );
    await expect.element(dialog).toHaveAttribute('data-tone', 'error');
    const confirm = dialog.getByRole('button', { name: 'Delete folder' });
    await expect.element(confirm).toHaveAttribute('data-variant', 'solid');
    await expect.element(confirm).toHaveAttribute('data-tone', 'error');
    const cancel = dialog.getByRole('button', { name: 'Cancel' });
    await expect.element(cancel).toHaveAttribute('data-variant', 'soft');
    await expect.element(cancel).toHaveAttribute('data-tone', 'neutral');
  });

  it('takes its button text from props and the rest from labels, then DSProvider, then English', async () => {
    const screen = await renderWithDS(
      <DialogTrigger>
        <Button>Yayınla</Button>
        <AlertDialog
          title="Mart güncellemesi yayınlansın mı?"
          confirmLabel="Yayınla"
          cancelLabel="Vazgeç"
          requireConfirmation="YAYINLA"
          onConfirm={() => Promise.reject()}
          labels={{
            typeToConfirm: 'Onaylamak için {phrase} yazın',
            error: 'Bir sorun oluştu. Tekrar deneyin.',
          }}
        />
      </DialogTrigger>,
      { provider: { labels: { alertDialog: { error: 'Hata' } } } },
    );
    await screen.getByRole('button', { name: 'Yayınla' }).click();
    const dialog = page.getByRole('alertdialog');
    const input = dialog.getByRole('textbox', { name: 'Onaylamak için YAYINLA yazın' });
    await expect.element(input).toBeVisible();
    expect(document.querySelector('[data-slot="alert-dialog-phrase"]')).toHaveTextContent(
      'YAYINLA',
    );
    await expect.element(dialog.getByRole('button', { name: 'Vazgeç' })).toBeVisible();

    await userEvent.type(input, 'YAYINLA');
    await dialog.getByRole('button', { name: 'Yayınla' }).click();
    await expect
      .element(dialog.getByRole('alert'))
      .toHaveTextContent('Bir sorun oluştu. Tekrar deneyin.');
    await screen.unmount();

    const provided = await renderWithDS(<DeleteFolder requireConfirmation="BORRAR" />, {
      provider: {
        labels: {
          alertDialog: {
            typeToConfirm: ({ phrase }: { phrase: string }) => `Escribe ${phrase} para confirmar`,
          },
        },
      },
    });
    const providedDialog = await openDialog(provided);
    await expect
      .element(providedDialog.getByRole('textbox', { name: 'Escribe BORRAR para confirmar' }))
      .toBeVisible();
    await provided.unmount();

    const english = await renderWithDS(
      <DialogTrigger>
        <Button>Publish</Button>
        <AlertDialog title="Publish the March update?" requireConfirmation="PUBLISH" />
      </DialogTrigger>,
      { locale: 'tr' },
    );
    await english.getByRole('button', { name: 'Publish' }).click();
    const englishDialog = page.getByRole('alertdialog', { name: 'Publish the March update?' });
    await expect.element(englishDialog.getByRole('button', { name: 'Confirm' })).toBeVisible();
    await expect.element(englishDialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect
      .element(englishDialog.getByRole('textbox', { name: 'Type PUBLISH to confirm' }))
      .toBeVisible();
  });

  it('labels the field in plain text when a template does not keep the phrase as given', async () => {
    const screen = await renderWithDS(
      <DeleteFolder
        requireConfirmation="delete"
        labels={{ typeToConfirm: ({ phrase }) => `Type “${phrase.toUpperCase()}” to confirm` }}
      />,
    );
    const dialog = await openDialog(screen);
    await expect
      .element(dialog.getByRole('textbox', { name: 'Type “DELETE” to confirm' }))
      .toBeVisible();
    expect(document.querySelector('[data-slot="alert-dialog-phrase"]')).toBeNull();
  });

  it('focuses Cancel first for destructive actions and Confirm otherwise', async () => {
    const screen = await renderWithDS(<DeleteFolder />);
    const dialog = await openDialog(screen);
    await expect.element(dialog.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    await screen.unmount();

    const publish = await renderWithDS(
      <DialogTrigger>
        <Button>Publish</Button>
        <AlertDialog title="Publish the March update?" tone="warning" confirmLabel="Publish" />
      </DialogTrigger>,
    );
    await publish.getByRole('button', { name: 'Publish' }).click();
    const publishDialog = page.getByRole('alertdialog');
    await expect.element(publishDialog).toHaveAttribute('data-tone', 'warning');
    const confirm = publishDialog.getByRole('button', { name: 'Publish' });
    await expect.element(confirm).toHaveFocus();
    await expect.element(confirm).toHaveAttribute('data-variant', 'solid');
    await expect.element(confirm).toHaveAttribute('data-tone', 'primary');
  });

  it('cancels and calls onCancel without confirming', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const screen = await renderWithDS(<DeleteFolder onCancel={onCancel} onConfirm={onConfirm} />);
    const dialog = await openDialog(screen);

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('closes right away when onConfirm is synchronous', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithDS(<DeleteFolder onConfirm={onConfirm} />);
    const dialog = await openDialog(screen);

    await dialog.getByRole('button', { name: 'Delete folder' }).click();
    expect(onConfirm).toHaveBeenCalledOnce();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('stays open and locked while an async onConfirm runs, then closes', async () => {
    const work = deferred();
    const onConfirm = vi.fn(() => work.promise);
    const screen = await renderWithDS(<DeleteFolder onConfirm={onConfirm} />);
    const dialog = await openDialog(screen);
    const confirm = dialog.getByRole('button', { name: 'Delete folder' });
    const cancel = dialog.getByRole('button', { name: 'Cancel' });

    await confirm.click();
    await expect.element(confirm).toHaveAttribute('data-pending', 'true');
    await expect.element(cancel).toBeDisabled();
    await expect.element(dialog).toHaveAttribute('data-pending', 'true');
    await expect.element(dialog.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();

    await confirm.click({ force: true });
    expect(onConfirm).toHaveBeenCalledOnce();

    await userEvent.keyboard('{Escape}');
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect.element(page.getByRole('alertdialog')).toBeVisible();

    work.resolve();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows the rejection inline, stays open and lets the person retry', async () => {
    let attempt = 0;
    const onConfirm = vi.fn(async () => {
      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      if (attempt === 1) throw new Error('The folder has 3 shared projects.');
    });
    const screen = await renderWithDS(<DeleteFolder onConfirm={onConfirm} />);
    const dialog = await openDialog(screen);
    const confirm = dialog.getByRole('button', { name: 'Delete folder' });

    await confirm.click();
    const alert = dialog.getByRole('alert');
    await expect.element(alert).toHaveTextContent('The folder has 3 shared projects.');
    expect(getComputedStyle(alert.element()).backgroundColor).toBe(roleBackground('bg-error-soft'));
    await expect.element(confirm).not.toHaveAttribute('data-pending');
    await expect.element(dialog.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    await expect.element(page.getByRole('alertdialog')).toBeVisible();

    await confirm.click();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it('shows the error label, a custom errorMessage or a synchronous throw inline', async () => {
    const screen = await renderWithDS(<DeleteFolder onConfirm={() => Promise.reject()} />);
    let dialog = await openDialog(screen);
    await dialog.getByRole('button', { name: 'Delete folder' }).click();
    await expect
      .element(dialog.getByRole('alert'))
      .toHaveTextContent('Something went wrong. Try again.');
    await screen.unmount();

    const custom = await renderWithDS(
      <DeleteFolder
        onConfirm={() => Promise.reject(new Error('409'))}
        errorMessage={(error) => `Server answered ${(error as Error).message}.`}
      />,
    );
    dialog = await openDialog(custom);
    await dialog.getByRole('button', { name: 'Delete folder' }).click();
    await expect.element(dialog.getByRole('alert')).toHaveTextContent('Server answered 409.');
    await custom.unmount();

    const thrown = await renderWithDS(
      <DeleteFolder
        onConfirm={() => {
          throw new Error('You need the Owner role to delete folders.');
        }}
      />,
    );
    dialog = await openDialog(thrown);
    await dialog.getByRole('button', { name: 'Delete folder' }).click();
    await expect
      .element(dialog.getByRole('alert'))
      .toHaveTextContent('You need the Owner role to delete folders.');
    await expect.element(page.getByRole('alertdialog')).toBeVisible();
  });

  it('requires the confirmation phrase before confirming', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithDS(
      <DeleteFolder requireConfirmation="DELETE" onConfirm={onConfirm} />,
    );
    const dialog = await openDialog(screen);
    const input = dialog.getByRole('textbox', { name: 'Type DELETE to confirm' });
    const confirm = dialog.getByRole('button', { name: 'Delete folder' });

    await expect.element(input).toHaveFocus();
    await expect.element(confirm).toBeDisabled();

    await userEvent.type(input, 'delete');
    await expect.element(confirm).toBeDisabled();
    await userEvent.keyboard('{Enter}');
    expect(onConfirm).not.toHaveBeenCalled();

    await userEvent.clear(input);
    await userEvent.type(input, 'DELETE');
    await expect.element(confirm).toBeEnabled();
    await userEvent.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledOnce();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('lets Escape and Tab leave the phrase field as from any other control', async () => {
    const screen = await renderWithDS(<DeleteFolder requireConfirmation="DELETE" />);
    const dialog = await openDialog(screen);
    const input = dialog.getByRole('textbox', { name: 'Type DELETE to confirm' });
    const cancel = dialog.getByRole('button', { name: 'Cancel' });
    await expect.element(input).toHaveFocus();

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await expect.element(cancel).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(input).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Delete folder' })).toHaveFocus();
  });

  it('ignores Enter while an input method is composing and repeat Enter while pending', async () => {
    const work = deferred();
    const onConfirm = vi.fn(() => work.promise);
    const screen = await renderWithDS(
      <DeleteFolder requireConfirmation="DELETE" onConfirm={onConfirm} />,
    );
    const dialog = await openDialog(screen);
    const input = dialog.getByRole('textbox', { name: 'Type DELETE to confirm' });
    await userEvent.type(input, 'DELETE');

    input
      .element()
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }),
      );
    expect(onConfirm).not.toHaveBeenCalled();

    await userEvent.keyboard('{Enter}{Enter}{Enter}');
    expect(onConfirm).toHaveBeenCalledOnce();
    await expect.element(input).toHaveAttribute('readonly');

    work.resolve();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Delete folder' })).toHaveFocus();
  });

  it('keeps the confirm button disabled while isConfirmDisabled is set', async () => {
    const screen = await renderWithDS(<DeleteFolder isConfirmDisabled />);
    const dialog = await openDialog(screen);
    await expect.element(dialog.getByRole('button', { name: 'Delete folder' })).toBeDisabled();
    await screen.unmount();

    const publish = await renderWithDS(
      <DialogTrigger>
        <Button>Publish</Button>
        <AlertDialog title="Publish the March update?" confirmLabel="Publish" isConfirmDisabled />
      </DialogTrigger>,
    );
    await publish.getByRole('button', { name: 'Publish' }).click();
    const alert = page.getByRole('alertdialog');
    await expect.element(alert.getByRole('button', { name: 'Publish' })).toBeDisabled();
    await expect.element(alert.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('ignores the scrim by default, and when dismissable closes from it only while idle', async () => {
    const pressScrim = async () => {
      const overlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')!;
      await userEvent.click(page.elementLocator(overlay), { position: { x: 4, y: 4 } });
    };
    const screen = await renderWithDS(<DeleteFolder />);
    await openDialog(screen);
    await pressScrim();
    await new Promise((resolve) => setTimeout(resolve, 150));
    await expect.element(page.getByRole('alertdialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    await screen.unmount();

    const work = deferred();
    const dismissable = await renderWithDS(
      <DeleteFolder isDismissable onConfirm={() => work.promise} />,
    );
    await openDialog(dismissable);
    await pressScrim();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();

    const dialog = await openDialog(dismissable);
    await dialog.getByRole('button', { name: 'Delete folder' }).click();
    await expect.element(dialog).toHaveAttribute('data-pending', 'true');
    await pressScrim();
    await new Promise((resolve) => setTimeout(resolve, 150));
    await expect.element(page.getByRole('alertdialog')).toBeVisible();

    work.resolve();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('skips the body for empty children and an empty icon', async () => {
    const hasIcon = false;
    const screen = await renderWithDS(
      <DeleteFolder icon={hasIcon && <DeleteIcon />}>{hasIcon && 'Unused note'}</DeleteFolder>,
    );
    await openDialog(screen);
    expect(document.querySelector('[data-slot="dialog-body"]')).toBeNull();
    expect(document.querySelector('[data-slot="alert-dialog-icon"]')).toBeNull();
    expect(document.querySelector('[data-slot="dialog-icon"]')).toBeNull();
  });

  it('supports a controlled open state', async () => {
    const onOpenChange = vi.fn();

    function RemoveMember() {
      const [isOpen, setOpen] = useState(false);
      return (
        <>
          <Button variant="ghost" tone="error" onPress={() => setOpen(true)}>
            Remove Ayşe Demir
          </Button>
          <AlertDialog
            isOpen={isOpen}
            onOpenChange={(open) => {
              onOpenChange(open);
              setOpen(open);
            }}
            tone="error"
            title="Remove Ayşe Demir from Design?"
            confirmLabel="Remove"
            onConfirm={async () => {}}
          />
        </>
      );
    }

    const screen = await renderWithDS(<RemoveMember />);
    await screen.getByRole('button', { name: 'Remove Ayşe Demir' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Remove Ayşe Demir from Design?' });
    await expect.element(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Remove' }).click();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('tints the hero icon with the tone', async () => {
    const screen = await renderWithDS(<DeleteFolder icon={<DeleteIcon />} />);
    await openDialog(screen);
    expect(document.querySelector('[data-slot="alert-dialog-icon"] svg')).not.toBeNull();
    const icon = document.querySelector<HTMLElement>('[data-slot="dialog-icon"]')!;
    expect(icon).toHaveAttribute('data-tone', 'error');
    expect(getComputedStyle(icon).backgroundColor).toBe(roleBackground('bg-error-soft'));
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(
        <DeleteFolder
          icon={<DeleteIcon />}
          requireConfirmation="DELETE"
          onConfirm={() => Promise.reject(new Error('The folder has 3 shared projects.'))}
        />,
        options,
      );
      const dialog = await openDialog(screen);
      await userEvent.type(dialog.getByRole('textbox'), 'DELETE');
      await dialog.getByRole('button', { name: 'Delete folder' }).click();
      await expect.element(dialog.getByRole('alert')).toBeVisible();
      await new Promise((resolve) => setTimeout(resolve, 350));
      removeStaleLiveAnnouncements();
      await expectNoA11yViolations(document.body);
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
      await screen.unmount();
    }
    document.documentElement.classList.remove('dark');
  });
});
