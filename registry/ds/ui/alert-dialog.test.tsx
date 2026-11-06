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

function DeleteLedger(props: Partial<AlertDialogProps>) {
  return (
    <DialogTrigger>
      <Button tone="destructive">Delete ledger</Button>
      <AlertDialog
        title="Delete “Operating account”?"
        description="All 1,284 entries and their attachments are removed. This cannot be undone."
        tone="destructive"
        confirmLabel="Delete ledger"
        {...props}
      />
    </DialogTrigger>
  );
}

function removeStaleLiveAnnouncements() {
  document
    .querySelectorAll('[data-live-announcer] [role="img"]')
    .forEach((announcement) => announcement.remove());
}

async function openDialog(screen: Awaited<ReturnType<typeof renderWithDS>>) {
  await screen.getByRole('button', { name: 'Delete ledger' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect.element(dialog).toBeVisible();
  return dialog;
}

describe('AlertDialog', () => {
  it('renders an alertdialog named by its title and described by its description', async () => {
    const screen = await renderWithDS(<DeleteLedger />);
    const dialog = await openDialog(screen);

    await expect.element(dialog).toHaveAccessibleName('Delete “Operating account”?');
    await expect
      .element(dialog)
      .toHaveAccessibleDescription(
        'All 1,284 entries and their attachments are removed. This cannot be undone.',
      );
    await expect.element(dialog).toHaveAttribute('data-tone', 'destructive');
    await expect
      .element(dialog.getByRole('button', { name: 'Delete ledger' }))
      .toHaveAttribute('data-tone', 'destructive');
  });

  it('uses English defaults whatever the locale', async () => {
    const screen = await renderWithDS(
      <DialogTrigger>
        <Button>Publish</Button>
        <AlertDialog title="Publish the March report?" requireConfirmation="PUBLISH" />
      </DialogTrigger>,
      { locale: 'tr' },
    );
    await screen.getByRole('button', { name: 'Publish' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Publish the March report?' });
    await expect.element(dialog.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    await expect.element(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect
      .element(dialog.getByRole('textbox', { name: 'Type PUBLISH to confirm' }))
      .toBeVisible();
    expect(document.querySelector('[data-slot="alert-dialog-phrase"]')).toHaveTextContent(
      'PUBLISH',
    );
  });

  it('takes its button text from props and the rest from labels', async () => {
    const screen = await renderWithDS(
      <DialogTrigger>
        <Button>Yayınla</Button>
        <AlertDialog
          title="Mart raporu yayınlansın mı?"
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
  });

  it('takes its labels from DSProvider and accepts a template function', async () => {
    const screen = await renderWithDS(<DeleteLedger requireConfirmation="BORRAR" />, {
      provider: {
        labels: {
          alertDialog: {
            typeToConfirm: ({ phrase }: { phrase: string }) => `Escribe ${phrase} para confirmar`,
          },
        },
      },
    });
    const dialog = await openDialog(screen);
    await expect
      .element(dialog.getByRole('textbox', { name: 'Escribe BORRAR para confirmar' }))
      .toBeVisible();
    expect(document.querySelector('[data-slot="alert-dialog-phrase"]')).toHaveTextContent('BORRAR');
  });

  it('labels the field in plain text when a template does not keep the phrase as given', async () => {
    const screen = await renderWithDS(
      <DeleteLedger
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
    const screen = await renderWithDS(<DeleteLedger />);
    const dialog = await openDialog(screen);
    await expect.element(dialog.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    await screen.unmount();

    const publish = await renderWithDS(
      <DialogTrigger>
        <Button>Publish</Button>
        <AlertDialog title="Publish the March report?" confirmLabel="Publish" />
      </DialogTrigger>,
    );
    await publish.getByRole('button', { name: 'Publish' }).click();
    await expect
      .element(page.getByRole('alertdialog').getByRole('button', { name: 'Publish' }))
      .toHaveFocus();
  });

  it('cancels, calls onCancel and returns focus to the trigger', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const screen = await renderWithDS(<DeleteLedger onCancel={onCancel} onConfirm={onConfirm} />);
    const dialog = await openDialog(screen);

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('button', { name: 'Delete ledger' })).toHaveFocus();
  });

  it('closes right away when onConfirm is synchronous', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithDS(<DeleteLedger onConfirm={onConfirm} />);
    const dialog = await openDialog(screen);

    await dialog.getByRole('button', { name: 'Delete ledger' }).click();
    expect(onConfirm).toHaveBeenCalledOnce();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('stays open and locked while an async onConfirm runs, then closes', async () => {
    const work = deferred();
    const onConfirm = vi.fn(() => work.promise);
    const screen = await renderWithDS(<DeleteLedger onConfirm={onConfirm} />);
    const dialog = await openDialog(screen);
    const confirm = dialog.getByRole('button', { name: 'Delete ledger' });
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
      if (attempt === 1) throw new Error('The ledger has 3 unpaid invoices.');
    });
    const screen = await renderWithDS(<DeleteLedger onConfirm={onConfirm} />);
    const dialog = await openDialog(screen);
    const confirm = dialog.getByRole('button', { name: 'Delete ledger' });

    await confirm.click();
    const alert = dialog.getByRole('alert');
    await expect.element(alert).toHaveTextContent('The ledger has 3 unpaid invoices.');
    await expect.element(confirm).not.toHaveAttribute('data-pending');
    await expect.element(dialog.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    await expect.element(page.getByRole('alertdialog')).toBeVisible();

    await confirm.click();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it('falls back to the error label or a custom errorMessage', async () => {
    const screen = await renderWithDS(<DeleteLedger onConfirm={() => Promise.reject()} />);
    let dialog = await openDialog(screen);
    await dialog.getByRole('button', { name: 'Delete ledger' }).click();
    await expect
      .element(dialog.getByRole('alert'))
      .toHaveTextContent('Something went wrong. Try again.');
    await screen.unmount();

    const custom = await renderWithDS(
      <DeleteLedger
        onConfirm={() => Promise.reject(new Error('409'))}
        errorMessage={(error) => `Server answered ${(error as Error).message}.`}
      />,
    );
    dialog = await openDialog(custom);
    await dialog.getByRole('button', { name: 'Delete ledger' }).click();
    await expect.element(dialog.getByRole('alert')).toHaveTextContent('Server answered 409.');
  });

  it('requires the confirmation phrase before confirming', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithDS(
      <DeleteLedger requireConfirmation="DELETE" onConfirm={onConfirm} />,
    );
    const dialog = await openDialog(screen);
    const input = dialog.getByRole('textbox', { name: 'Type DELETE to confirm' });
    const confirm = dialog.getByRole('button', { name: 'Delete ledger' });

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
    const screen = await renderWithDS(<DeleteLedger requireConfirmation="DELETE" />);
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
    await expect.element(screen.getByRole('button', { name: 'Delete ledger' })).toHaveFocus();
  });

  it('ignores Enter while an input method is composing and repeat Enter while pending', async () => {
    const work = deferred();
    const onConfirm = vi.fn(() => work.promise);
    const screen = await renderWithDS(
      <DeleteLedger requireConfirmation="DELETE" onConfirm={onConfirm} />,
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
    await expect.element(screen.getByRole('button', { name: 'Delete ledger' })).toHaveFocus();
  });

  it('keeps the confirm button disabled while isConfirmDisabled is set', async () => {
    const screen = await renderWithDS(<DeleteLedger isConfirmDisabled />);
    const dialog = await openDialog(screen);
    await expect.element(dialog.getByRole('button', { name: 'Delete ledger' })).toBeDisabled();
    await screen.unmount();

    const publish = await renderWithDS(
      <DialogTrigger>
        <Button>Publish</Button>
        <AlertDialog title="Publish the March report?" confirmLabel="Publish" isConfirmDisabled />
      </DialogTrigger>,
    );
    await publish.getByRole('button', { name: 'Publish' }).click();
    const alert = page.getByRole('alertdialog');
    await expect.element(alert.getByRole('button', { name: 'Publish' })).toBeDisabled();
    await expect.element(alert.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('shows a synchronous throw inline and stays open', async () => {
    const screen = await renderWithDS(
      <DeleteLedger
        onConfirm={() => {
          throw new Error('You need the Owner role to delete ledgers.');
        }}
      />,
    );
    const dialog = await openDialog(screen);
    await dialog.getByRole('button', { name: 'Delete ledger' }).click();
    await expect
      .element(dialog.getByRole('alert'))
      .toHaveTextContent('You need the Owner role to delete ledgers.');
    await expect.element(page.getByRole('alertdialog')).toBeVisible();
  });

  it('keeps the scrim inert while pending even when dismissable', async () => {
    const work = deferred();
    const screen = await renderWithDS(
      <DeleteLedger isDismissable onConfirm={() => work.promise} />,
    );
    const dialog = await openDialog(screen);
    await dialog.getByRole('button', { name: 'Delete ledger' }).click();
    await expect.element(dialog).toHaveAttribute('data-pending', 'true');

    const overlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')!;
    await userEvent.click(page.elementLocator(overlay), { position: { x: 4, y: 4 } });
    await new Promise((resolve) => setTimeout(resolve, 150));
    await expect.element(page.getByRole('alertdialog')).toBeVisible();

    work.resolve();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('skips the body for empty children and an empty icon', async () => {
    const hasIcon = false;
    const screen = await renderWithDS(
      <DeleteLedger icon={hasIcon && <DeleteIcon />}>{hasIcon && 'Unused note'}</DeleteLedger>,
    );
    await openDialog(screen);
    expect(document.querySelector('[data-slot="dialog-body"]')).toBeNull();
    expect(document.querySelector('[data-slot="alert-dialog-icon"]')).toBeNull();
    expect(document.querySelector('[data-slot="dialog-header"]')).not.toHaveClass('text-center');
  });

  it('ignores the scrim by default and can opt in to dismissal', async () => {
    const screen = await renderWithDS(<DeleteLedger />);
    await openDialog(screen);
    const overlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')!;
    await userEvent.click(page.elementLocator(overlay), { position: { x: 4, y: 4 } });
    await new Promise((resolve) => setTimeout(resolve, 150));
    await expect.element(page.getByRole('alertdialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    await screen.unmount();

    const dismissable = await renderWithDS(<DeleteLedger isDismissable />);
    await openDialog(dismissable);
    const nextOverlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')!;
    await userEvent.click(page.elementLocator(nextOverlay), { position: { x: 4, y: 4 } });
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('supports a controlled open state', async () => {
    const onOpenChange = vi.fn();

    function RemoveMember() {
      const [isOpen, setOpen] = useState(false);
      return (
        <>
          <Button variant="text" tone="destructive" onPress={() => setOpen(true)}>
            Remove Ayşe Demir
          </Button>
          <AlertDialog
            isOpen={isOpen}
            onOpenChange={(open) => {
              onOpenChange(open);
              setOpen(open);
            }}
            tone="destructive"
            title="Remove Ayşe Demir from Finance?"
            confirmLabel="Remove"
            onConfirm={async () => {}}
          />
        </>
      );
    }

    const screen = await renderWithDS(<RemoveMember />);
    await screen.getByRole('button', { name: 'Remove Ayşe Demir' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Remove Ayşe Demir from Finance?' });
    await expect.element(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Remove' }).click();
    await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('colours the hero icon by tone', async () => {
    const screen = await renderWithDS(<DeleteLedger icon={<DeleteIcon />} />);
    await openDialog(screen);
    const icon = document.querySelector('[data-slot="alert-dialog-icon"]');
    expect(icon).toHaveClass('text-error');
    expect(document.querySelector('[data-slot="dialog-header"]')).toHaveClass('text-center');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(
        <DeleteLedger
          icon={<DeleteIcon />}
          requireConfirmation="DELETE"
          onConfirm={() => Promise.reject(new Error('The ledger has 3 unpaid invoices.'))}
        />,
        options,
      );
      const dialog = await openDialog(screen);
      await userEvent.type(dialog.getByRole('textbox'), 'DELETE');
      await dialog.getByRole('button', { name: 'Delete ledger' }).click();
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
