import { page, userEvent } from 'vitest/browser';
import { cleanup } from 'vitest-browser-react';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toastCount() {
  return document.querySelectorAll('[role="alertdialog"]').length;
}

const notifications = () => page.getByRole('region', { name: 'Notifications' });

afterEach(async () => {
  toast.dismiss();
  await cleanup();
  document.documentElement.classList.remove('dark');
});

describe('Toast', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      await renderWithDS(<Toaster isExpanded maxVisibleToasts={5} />, {
        ...options,
        provider: { motion: 'disabled' },
      });
      toast('Draft saved', { action: { label: 'Undo', onAction: () => {} } });
      toast.info('Upload scheduled for Friday', {
        description: 'Funds arrive in one to two business days.',
      });
      toast.success('Message received');
      toast.warning('Card ending 4242 expires in 7 days', { title: 'Update sharing' });
      toast.error('Sync failed', { action: { label: 'Retry', onAction: () => {} } });
      toast.loading('Exporting 240 orders');

      await expect.poll(toastCount).toBe(5);
      await wait(50);
      await expectNoA11yViolations();
      toast.dismiss();
      await cleanup();
    }
  });

  it('announces a message inside a labelled notifications region', async () => {
    await renderWithDS(<Toaster />);
    toast('Project DOC-2048 sent to Nova Corp');

    const item = notifications().getByRole('alertdialog', {
      name: 'Project DOC-2048 sent to Nova Corp',
    });
    await expect.element(item).toBeVisible();
    await expect.element(item).toHaveAttribute('data-tone', 'default');
    await expect.element(notifications()).toHaveAttribute('data-placement', 'bottom-end');
    await expect
      .element(item.getByRole('alert'))
      .toHaveTextContent('Project DOC-2048 sent to Nova Corp');
  });

  it('gives each tone its container and icon, with a title and description', async () => {
    await renderWithDS(<Toaster isExpanded maxVisibleToasts={5} />);
    toast.success('Message received');
    toast.warning('Card ending 4242 expires in 7 days', {
      title: 'Update sharing',
      description: 'Renewal is on 1 December.',
    });

    const success = page.getByRole('alertdialog', { name: 'Message received' });
    await expect.element(success).toHaveAttribute('data-tone', 'success');
    await expect.element(success).toHaveClass(/bg-success-container/);
    expect(success.element().querySelector('[data-slot="icon"] svg')).not.toBeNull();

    const warning = page.getByRole('alertdialog', { name: 'Update sharing' });
    await expect.element(warning).toHaveClass(/bg-warning-container/);
    await expect
      .element(warning)
      .toHaveAccessibleDescription('Card ending 4242 expires in 7 days Renewal is on 1 December.');
  });

  it('closes from the close button and reports why', async () => {
    const onClose = vi.fn();
    await renderWithDS(<Toaster />);
    toast.success('Message received', { onClose });

    const item = page.getByRole('alertdialog', { name: 'Message received' });
    await item.getByRole('button', { name: 'Close' }).click();
    await expect.element(item).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledWith('close');
  });

  it('dismisses itself when its duration runs out', async () => {
    const onClose = vi.fn();
    const screen = await renderWithDS(
      <>
        <p>Folder</p>
        <Toaster duration={300} />
      </>,
    );
    await userEvent.hover(screen.getByText('Folder'));
    toast('Draft saved', { onClose });

    const item = page.getByRole('alertdialog', { name: 'Draft saved' });
    await expect.element(item).toBeInTheDocument();
    await expect.element(item).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledWith('timeout');
  });

  it('fans the stack out and pauses every countdown while hovered', async () => {
    const screen = await renderWithDS(
      <>
        <p>Folder</p>
        <Toaster duration={1000} />
      </>,
    );
    await userEvent.hover(screen.getByText('Folder'));
    toast('Comment uploaded');
    toast('Project approved');

    const front = page.getByRole('alertdialog', { name: 'Project approved' });
    const behind = page.getByRole('alertdialog', { name: 'Comment uploaded' });
    const list = notifications().getByRole('list');
    await expect.element(front).toHaveAttribute('data-front', 'true');
    await expect.element(behind).toHaveAttribute('data-stacked', 'true');

    await userEvent.hover(front);
    await expect.element(list).toHaveAttribute('data-expanded', 'true');
    await expect.element(list).toHaveAttribute('data-paused', 'true');
    await expect.element(behind).not.toHaveAttribute('data-stacked');

    await wait(1300);
    await expect.element(front).toBeInTheDocument();
    await expect.element(behind).toBeInTheDocument();

    await userEvent.hover(screen.getByText('Folder'));
    await expect.element(list).not.toHaveAttribute('data-expanded');
    await expect.element(front, { timeout: 2500 }).not.toBeInTheDocument();
  });

  it('expands for keyboard focus and closes the focused toast with Escape', async () => {
    const onClose = vi.fn();
    const screen = await renderWithDS(
      <>
        <Button>Approve project</Button>
        <Toaster />
      </>,
    );
    toast('Project approved');
    toast('Message scheduled', { onClose });

    const front = page.getByRole('alertdialog', { name: 'Message scheduled' });
    await expect.element(front).toBeVisible();
    await screen.getByRole('button', { name: 'Approve project' }).click();
    await userEvent.keyboard('{Tab}');

    await expect.element(front).toHaveFocus();
    const list = notifications().getByRole('list');
    await expect.element(list).toHaveAttribute('data-expanded', 'true');
    await expect.element(list).toHaveAttribute('data-paused', 'true');

    await userEvent.keyboard('{Escape}');
    await expect.element(front).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledWith('escape');
    await expect.element(page.getByRole('alertdialog', { name: 'Project approved' })).toHaveFocus();
  });

  it('updates one toast in place', async () => {
    await renderWithDS(<Toaster />);
    const id = toast.loading('Uploading 3 comments');

    const loading = page.getByRole('alertdialog', { name: 'Uploading 3 comments' });
    await expect.element(loading).toHaveAttribute('data-loading', 'true');
    const node = loading.element();

    expect(
      toast.update(id, { message: 'Comments uploaded', tone: 'success', isLoading: false }),
    ).toBe(true);
    const done = page.getByRole('alertdialog', { name: 'Comments uploaded' });
    await expect.element(done).toHaveAttribute('data-tone', 'success');
    await expect.element(done).not.toHaveAttribute('data-loading');
    expect(done.element()).toBe(node);
    expect(toastCount()).toBe(1);
    expect(toast.update('missing', { message: 'Nothing' })).toBe(false);
  });

  it('follows a promise from loading to success or error', async () => {
    await renderWithDS(<Toaster isExpanded />);
    let finish: (file: string) => void = () => {};
    toast.promise(new Promise<string>((resolve) => (finish = resolve)), {
      loading: 'Exporting 240 orders',
      success: (file) => ({ message: 'Export ready', description: file }),
      error: 'Export failed',
    });

    const pending = page.getByRole('alertdialog', { name: 'Exporting 240 orders' });
    await expect.element(pending).toHaveAttribute('data-loading', 'true');
    const node = pending.element();

    finish('orders-november.csv');
    const ready = page.getByRole('alertdialog', { name: 'Export ready' });
    await expect.element(ready).toHaveAttribute('data-tone', 'success');
    await expect.element(ready).toHaveAccessibleDescription('orders-november.csv');
    expect(ready.element()).toBe(node);

    toast.promise(Promise.reject(new Error('team timeout')), {
      loading: 'Syncing team feed',
      success: 'Team feed synced',
      error: (reason) => `Sync failed: ${(reason as Error).message}`,
    });
    await expect
      .element(page.getByRole('alertdialog', { name: 'Sync failed: team timeout' }))
      .toHaveAttribute('data-tone', 'error');
  });

  it('runs the action, then dismisses with the action reason', async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    await renderWithDS(<Toaster />);
    toast('Project archived', { action: { label: 'Undo', onAction }, onClose });

    const item = page.getByRole('alertdialog', { name: 'Project archived' });
    await item.getByRole('button', { name: 'Undo' }).click();
    expect(onAction).toHaveBeenCalledOnce();
    await expect.element(item).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledWith('action');
  });

  it('keeps the toast open while an async action runs', async () => {
    let finish: () => void = () => {};
    const onAction = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    await renderWithDS(<Toaster duration={200} />);
    toast('3 projects archived', { action: { label: 'Undo', onAction } });

    const item = page.getByRole('alertdialog', { name: '3 projects archived' });
    await item.getByRole('button', { name: 'Undo' }).click();
    await expect.element(item.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    await wait(500);
    await expect.element(item).toBeInTheDocument();

    finish();
    await expect.element(item).not.toBeInTheDocument();
  });

  it('keeps errors with an action open while other toasts time out', async () => {
    const screen = await renderWithDS(
      <>
        <p>Folder</p>
        <Toaster duration={200} />
      </>,
    );
    await userEvent.hover(screen.getByText('Folder'));
    toast.error('Card ending 4242 was declined', {
      title: 'Message failed',
      action: { label: 'Update card', onAction: () => {} },
    });
    toast.info('Upload scheduled for Friday');

    await expect
      .element(page.getByRole('alertdialog', { name: 'Upload scheduled for Friday' }))
      .not.toBeInTheDocument();
    await wait(400);
    await expect.element(page.getByRole('alertdialog', { name: 'Message failed' })).toBeVisible();
  });

  it('shows at most maxVisibleToasts and brings queued toasts back', async () => {
    await renderWithDS(<Toaster maxVisibleToasts={2} />);
    toast('Order 1001 shipped');
    toast('Order 1002 shipped');
    toast('Order 1003 shipped');

    const newest = page.getByRole('alertdialog', { name: 'Order 1003 shipped' });
    await expect.element(newest).toBeVisible();
    await expect.poll(toastCount).toBe(2);
    await expect
      .element(page.getByRole('alertdialog', { name: 'Order 1001 shipped' }))
      .not.toBeInTheDocument();

    toast.dismiss(toast('Order 1004 shipped'));
    await newest.getByRole('button', { name: 'Close' }).click();
    await expect
      .element(page.getByRole('alertdialog', { name: 'Order 1001 shipped' }))
      .toBeInTheDocument();
  });

  it('replaces a toast that reuses an id and dismisses every toast at once', async () => {
    await renderWithDS(<Toaster isExpanded />);
    toast('Saving changes', { id: 'save-status' });
    toast.success('Changes saved', { id: 'save-status' });
    toast('Draft restored');

    await expect
      .element(page.getByRole('alertdialog', { name: 'Changes saved' }))
      .toHaveAttribute('data-tone', 'success');
    await expect.poll(toastCount).toBe(2);

    toast.dismiss();
    await expect.poll(toastCount).toBe(0);
  });

  it('routes toasts to a named toaster and renders one toaster per id', async () => {
    await renderWithDS(
      <>
        <Toaster />
        <Toaster />
        <Toaster toasterId="folder" placement="top-center" aria-label="Folder updates" />
      </>,
    );
    toast('Draft saved');
    toast('Folder closed for October', { toasterId: 'folder' });

    const folder = page.getByRole('region', { name: 'Folder updates' });
    await expect
      .element(folder.getByRole('alertdialog', { name: 'Folder closed for October' }))
      .toBeVisible();
    await expect.element(folder).toHaveAttribute('data-placement', 'top-center');
    await expect
      .element(notifications().getByRole('alertdialog', { name: 'Draft saved' }))
      .toBeVisible();
    expect(document.querySelectorAll('[data-slot="toaster"]')).toHaveLength(2);
  });

  it('takes its region and close labels from labels, then DSProvider', async () => {
    await renderWithDS(<Toaster labels={{ close: 'Kapat' }} />, {
      provider: { labels: { toast: { close: 'Gizle', notifications: 'Bildirimler' } } },
    });
    toast('Mesaj gönderildi');

    const region = page.getByRole('region', { name: 'Bildirimler' });
    await expect.element(region).toBeVisible();
    await expect.element(region.getByRole('button', { name: 'Kapat' })).toBeVisible();
  });

  it('places start and end by reading direction', async () => {
    await page.viewport(1024, 768);
    try {
      await renderWithDS(<Toaster placement="bottom-start" />, { locale: 'ar' });
      toast('تم إرسال الفاتورة');

      const region = page.getByRole('region', { name: 'Notifications' });
      await expect.element(region).toHaveAttribute('dir', 'rtl');
      const box = region.element().getBoundingClientRect();
      expect(Math.round(window.innerWidth - box.right)).toBe(24);
      expect(Math.round(window.innerHeight - box.bottom)).toBe(24);
    } finally {
      await page.viewport(414, 896);
    }
  });

  it('removes a toast at once when motion is disabled', async () => {
    await renderWithDS(<Toaster />, { provider: { motion: 'disabled' } });
    toast('Draft saved');

    const item = page.getByRole('alertdialog', { name: 'Draft saved' });
    await expect.element(item).toHaveClass(/transition-none/);
    toast.dismiss();
    await expect.element(item, { timeout: 100 }).not.toBeInTheDocument();
  });

  it('draws the focus ring on a keyboard-focused toast and on its buttons', async () => {
    const screen = await renderWithDS(
      <>
        <Button>Approve project</Button>
        <Toaster />
      </>,
    );
    toast('Project archived', { action: { label: 'Undo', onAction: () => {} } });

    const item = page.getByRole('alertdialog', { name: 'Project archived' });
    await expect.element(item).toBeVisible();
    await screen.getByRole('button', { name: 'Approve project' }).click();
    await userEvent.keyboard('{Tab}');
    await expect.element(item).toHaveFocus();
    expect(getComputedStyle(item.element()).outlineStyle).toBe('solid');

    await userEvent.keyboard('{Tab}');
    const undo = item.getByRole('button', { name: 'Undo' });
    await expect.element(undo).toHaveFocus();
    expect(getComputedStyle(undo.element()).outlineStyle).toBe('solid');
  });

  it('hides the close button only on toasts that time out when showCloseButton is false', async () => {
    await renderWithDS(<Toaster showCloseButton={false} isExpanded />);
    toast('Share link copied');
    toast('Your tax report is being prepared', { duration: Infinity });

    await expect
      .element(
        page
          .getByRole('alertdialog', { name: 'Your tax report is being prepared' })
          .getByRole('button', { name: 'Close' }),
      )
      .toBeVisible();
    await expect
      .element(
        page
          .getByRole('alertdialog', { name: 'Share link copied' })
          .getByRole('button', { name: 'Close' }),
      )
      .not.toBeInTheDocument();
  });

  it('restarts the countdown when a toast is updated', async () => {
    const screen = await renderWithDS(
      <>
        <p>Folder</p>
        <Toaster duration={500} />
      </>,
    );
    await userEvent.hover(screen.getByText('Folder'));
    const id = toast('Uploading comments: 1 of 3');
    await wait(300);
    toast.update(id, { message: 'Uploading comments: 2 of 3' });
    await wait(300);

    const item = page.getByRole('alertdialog', { name: 'Uploading comments: 2 of 3' });
    await expect.element(item).toBeInTheDocument();
    await expect.element(item).not.toBeInTheDocument();
  });

  it('turns a promise function that throws into the error toast', async () => {
    await renderWithDS(<Toaster />);
    toast.promise(
      () => {
        throw new Error('Not signed in');
      },
      {
        loading: 'Syncing team feed',
        success: 'Team feed synced',
        error: (reason) => `Sync failed: ${(reason as Error).message}`,
      },
    );

    await expect
      .element(page.getByRole('alertdialog', { name: 'Sync failed: Not signed in' }))
      .toHaveAttribute('data-tone', 'error');
  });

  it('stays open when an async action fails', async () => {
    const onClose = vi.fn();
    await renderWithDS(<Toaster />);
    toast('Project archived', {
      action: { label: 'Undo', onAction: () => Promise.reject(new Error('Offline')) },
      onClose,
    });

    const item = page.getByRole('alertdialog', { name: 'Project archived' });
    await item.getByRole('button', { name: 'Undo' }).click();
    await wait(300);
    await expect.element(item).toBeInTheDocument();
    await expect.element(item.getByRole('button', { name: 'Undo' })).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves a toast to another toaster when its id is reused there', async () => {
    const onClose = vi.fn();
    await renderWithDS(
      <>
        <Toaster />
        <Toaster toasterId="folder" aria-label="Folder updates" />
      </>,
    );
    toast('Closing October', { id: 'folder-close', onClose });
    await expect
      .element(notifications().getByRole('alertdialog', { name: 'Closing October' }))
      .toBeVisible();

    toast.success('October closed', { id: 'folder-close', toasterId: 'folder' });
    await expect
      .element(
        page
          .getByRole('region', { name: 'Folder updates' })
          .getByRole('alertdialog', { name: 'October closed' }),
      )
      .toBeVisible();
    await expect.poll(toastCount).toBe(1);
    expect(onClose).toHaveBeenCalledWith('programmatic');
  });

  it('resumes the countdown when the mouse leaves, even if focus stayed in the stack', async () => {
    const screen = await renderWithDS(
      <>
        <p>Folder</p>
        <Toaster duration={1500} />
      </>,
    );
    await userEvent.hover(screen.getByText('Folder'));
    toast('Comment uploaded');
    toast('Project approved');

    const front = page.getByRole('alertdialog', { name: 'Project approved' });
    const behind = page.getByRole('alertdialog', { name: 'Comment uploaded' });
    await front.getByRole('button', { name: 'Close' }).click();
    await expect.element(front).not.toBeInTheDocument();
    await expect.poll(() => behind.element().contains(document.activeElement)).toBe(true);

    await userEvent.hover(screen.getByText('Folder'));
    const list = notifications().getByRole('list');
    await expect.element(list).not.toHaveAttribute('data-paused');
    await expect.element(list).not.toHaveAttribute('data-expanded');
    await expect.element(behind, { timeout: 3000 }).not.toBeInTheDocument();
  });

  it('hides the tone icon with icon null and shows a custom icon', async () => {
    await renderWithDS(<Toaster isExpanded />);
    toast.success('Message received', { icon: null });
    toast('Folder exported', { icon: <svg data-testid="folder-icon" aria-hidden="true" /> });

    const plain = page.getByRole('alertdialog', { name: 'Message received' });
    await expect.element(plain).toHaveAttribute('data-tone', 'success');
    expect(plain.element().querySelector('[data-slot="icon"]')).toBeNull();
    await expect
      .element(
        page.getByRole('alertdialog', { name: 'Folder exported' }).getByTestId('folder-icon'),
      )
      .toBeInTheDocument();
  });

  it('clears the title, description and action when an update passes null', async () => {
    await renderWithDS(<Toaster />);
    const id = toast('3 comments uploaded', {
      title: 'Comments',
      description: 'Ready to match in the folder.',
      action: { label: 'Match', onAction: () => {} },
    });

    const item = page.getByRole('alertdialog', { name: 'Comments' });
    await expect
      .element(item)
      .toHaveAccessibleDescription('3 comments uploaded Ready to match in the folder.');

    toast.update(id, { title: null, description: null, action: null });
    const plain = page.getByRole('alertdialog', { name: '3 comments uploaded' });
    await expect.element(plain).toHaveAccessibleDescription('');
    await expect.element(plain.getByRole('button', { name: 'Match' })).not.toBeInTheDocument();
  });

  it('stacks from the top edge for top placements', async () => {
    await renderWithDS(<Toaster placement="top-center" />, { provider: { motion: 'disabled' } });
    toast('Order 1001 shipped');
    toast('Order 1002 shipped');

    const front = page.getByRole('alertdialog', { name: 'Order 1002 shipped' });
    const behind = page.getByRole('alertdialog', { name: 'Order 1001 shipped' });
    await expect.element(behind).toHaveAttribute('data-stacked', 'true');
    await expect.element(notifications()).toHaveAttribute('data-placement', 'top-center');
    await expect
      .poll(() => Math.round(notifications().element().getBoundingClientRect().top))
      .toBe(16);
    const frontBox = front.element().getBoundingClientRect();
    const behindBox = behind.element().getBoundingClientRect();
    expect(Math.round(frontBox.top)).toBe(16);
    expect(Math.round(behindBox.bottom - frontBox.bottom)).toBe(10);
  });

  it('fades instead of sliding with reduced motion', async () => {
    await renderWithDS(<Toaster />, { provider: { motion: 'reduced' } });
    toast('Draft saved');

    const item = page.getByRole('alertdialog', { name: 'Draft saved' });
    await expect.element(item).toHaveClass(/transition-opacity/);
    expect(item.element().className).not.toMatch(/translate:0_100%/);
  });

  it('never hands out an id that a caller already chose', async () => {
    await renderWithDS(<Toaster isExpanded />);
    const first = toast('Order 1001 shipped');
    const taken = `toast-${Number(first.split('-')[1]) + 1}`;
    toast('Order 1002 shipped', { id: taken });

    expect(toast('Order 1003 shipped')).not.toBe(taken);
    await expect.poll(toastCount).toBe(3);
  });
});
