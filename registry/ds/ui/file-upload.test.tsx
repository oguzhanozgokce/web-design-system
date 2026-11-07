import { useState } from 'react';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import {
  FileUpload,
  FileUploadError,
  type FileUploadContext,
  type FileUploadItem,
} from '@/registry/ds/ui/file-upload';

function part(root: Element, name: string) {
  return root.querySelector<HTMLElement>(`[data-slot="${name}"]`);
}

function pick(root: Element, files: File[]) {
  const input = root.querySelector<HTMLInputElement>('input[type="file"]')!;
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function drag(zone: Element, files: File[], types = ['dragenter', 'dragover', 'drop']) {
  for (const type of types) {
    const event = new DragEvent(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', {
      value: {
        types: ['Files'],
        items: files.map((file) => ({ kind: 'file', type: file.type, getAsFile: () => file })),
        files,
        effectAllowed: 'all',
        dropEffect: 'none',
        getData: () => '',
      },
    });
    zone.dispatchEvent(event);
  }
}

function file(name: string, size = 1_000, type = 'image/png') {
  return new File([new Uint8Array(size)], name, { type });
}

function announcer(root: Element) {
  return part(root, 'upload-announcer')!;
}

interface Pending {
  file: File;
  context: FileUploadContext;
  resolve: () => void;
  reject: (reason: unknown) => void;
}

function controlledUploads() {
  const pending: Pending[] = [];
  const onUpload = vi.fn(
    (uploaded: File, context: FileUploadContext) =>
      new Promise<void>((resolve, reject) => {
        pending.push({ file: uploaded, context, resolve, reject });
      }),
  );
  return { pending, onUpload };
}

describe('FileUpload', () => {
  it('collects picked files without uploading when there is no onUpload', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <FileUpload label="Attachments" allowsMultiple onChange={onChange} />,
    );
    pick(screen.container, [file('lake.png'), file('river.png')]);
    await expect.element(screen.getByRole('grid', { name: 'Attachments' })).toBeVisible();
    await expect.element(screen.getByRole('row', { name: /^lake\.png/ })).toBeVisible();
    await expect.element(screen.getByRole('row', { name: /^river\.png/ })).toBeVisible();
    const items: FileUploadItem[] = onChange.mock.calls.at(-1)![0];
    expect(items.map((item) => [item.file.name, item.status])).toEqual([
      ['lake.png', 'idle'],
      ['river.png', 'idle'],
    ]);
    await expect.element(announcer(screen.container)).toHaveTextContent('2 files added');
    expect(screen.container.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('uploads each file, rolls its progress and announces when it is done', async () => {
    const { pending, onUpload } = controlledUploads();
    const screen = await renderWithDS(<FileUpload onUpload={onUpload} />);
    const lake = file('lake.png', 2_400_000);
    pick(screen.container, [lake]);
    await expect.poll(() => pending.length).toBe(1);
    expect(onUpload.mock.calls[0][0]).toBe(lake);
    const bar = screen.getByRole('progressbar', { name: 'lake.png' });
    await expect.element(bar).not.toHaveAttribute('aria-valuenow');
    pending[0].context.onProgress(0.37);
    await expect.element(bar).toHaveAttribute('aria-valuenow', '37');
    await expect
      .element(screen.getByRole('row', { name: 'lake.png 2.4 MB Uploading 37%' }))
      .toBeInTheDocument();
    pending[0].resolve();
    await expect
      .element(screen.getByRole('row', { name: 'lake.png 2.4 MB Uploaded' }))
      .toBeInTheDocument();
    await expect.element(announcer(screen.container)).toHaveTextContent('lake.png uploaded');
    const row = screen.container.querySelector('[role="row"]')!;
    expect(part(row, 'check')).not.toBeNull();
  });

  it('shows the message of a FileUploadError and retries on request', async () => {
    const { pending, onUpload } = controlledUploads();
    const screen = await renderWithDS(<FileUpload onUpload={onUpload} />);
    pick(screen.container, [file('lake.png')]);
    await expect.poll(() => pending.length).toBe(1);
    pending[0].reject(new FileUploadError('Connection lost'));
    await expect
      .element(screen.getByRole('row', { name: 'lake.png 1 kB Connection lost' }))
      .toBeInTheDocument();
    await expect
      .element(announcer(screen.container))
      .toHaveTextContent('lake.png couldn’t be uploaded');
    await screen.getByRole('button', { name: 'Retry lake.png' }).click();
    await expect.poll(() => pending.length).toBe(2);
    pending[1].reject(new Error('socket hang up'));
    await expect
      .element(screen.getByRole('row', { name: 'lake.png 1 kB Upload failed' }))
      .toBeInTheDocument();
    await screen.getByRole('button', { name: 'Retry lake.png' }).click();
    await expect.poll(() => pending.length).toBe(3);
    pending[2].resolve();
    await expect.element(announcer(screen.container)).toHaveTextContent('lake.png uploaded');
  });

  it('cancels a running upload through its signal and removes the row', async () => {
    const { pending, onUpload } = controlledUploads();
    const onChange = vi.fn();
    const screen = await renderWithDS(<FileUpload onUpload={onUpload} onChange={onChange} />);
    pick(screen.container, [file('lake.png')]);
    await expect.poll(() => pending.length).toBe(1);
    const { signal } = pending[0].context;
    await screen.getByRole('button', { name: 'Cancel lake.png' }).click();
    expect(signal.aborted).toBe(true);
    await expect.element(screen.getByRole('grid')).not.toBeInTheDocument();
    pending[0].context.onProgress(0.5);
    pending[0].reject(signal.reason);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onChange.mock.calls.at(-1)![0]).toEqual([]);
    await expect
      .element(screen.getByRole('button', { name: 'Drag a file here or browse' }))
      .toHaveFocus();
  });

  it('runs at most maxConcurrent uploads at once', async () => {
    const { pending, onUpload } = controlledUploads();
    const screen = await renderWithDS(
      <FileUpload allowsMultiple maxConcurrent={2} onUpload={onUpload} />,
    );
    pick(screen.container, [file('a.png'), file('b.png'), file('c.png')]);
    await expect.poll(() => pending.length).toBe(2);
    await expect.element(screen.getByRole('row', { name: 'c.png 1 kB Waiting' })).toBeVisible();
    pending[0].resolve();
    await expect.poll(() => pending.length).toBe(3);
    expect(pending.map((entry) => entry.file.name)).toEqual(['a.png', 'b.png', 'c.png']);
  });

  it('counts the files it holds against maxFiles', async () => {
    const onReject = vi.fn();
    const screen = await renderWithDS(
      <FileUpload allowsMultiple maxFiles={2} onReject={onReject} />,
    );
    pick(screen.container, [file('a.png')]);
    await expect.element(screen.getByRole('row')).toHaveLength(1);
    pick(screen.container, [file('b.png'), file('c.png')]);
    await expect.poll(() => onReject.mock.calls.length).toBe(1);
    expect(onReject.mock.calls[0][0].map((entry: { file: File }) => entry.file.name)).toEqual([
      'c.png',
    ]);
    await expect.element(screen.getByRole('row')).toHaveLength(2);
  });

  it('works controlled through value and onChange', async () => {
    function Controlled() {
      const [items, setItems] = useState<FileUploadItem[]>([
        { id: 'kept', file: { name: 'kept.pdf', size: 12_000 }, status: 'complete' },
      ]);
      return (
        <>
          <FileUpload allowsMultiple value={items} onChange={setItems} />
          <output>{items.map((item) => item.file.name).join(', ')}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    pick(screen.container, [file('lake.png')]);
    await expect.element(screen.getByRole('status').last()).toBeInTheDocument();
    await expect.element(screen.getByText('kept.pdf, lake.png')).toBeVisible();
    await screen.getByRole('button', { name: 'Remove kept.pdf' }).click();
    await expect.element(screen.getByText('lake.png', { exact: true }).last()).toBeVisible();
    await expect.element(screen.getByRole('row')).toHaveLength(1);
  });

  it('closes the box around one file in the single layout and replaces it on a new drop', async () => {
    const { pending, onUpload } = controlledUploads();
    const screen = await renderWithDS(
      <div style={{ width: 380 }}>
        <FileUpload layout="single" label="Profile photo" onUpload={onUpload} />
      </div>,
    );
    const root = part(screen.container, 'file-upload')!;
    expect(root.dataset.layout).toBe('single');
    pick(screen.container, [file('portrait.png')]);
    await expect.poll(() => pending.length).toBe(1);
    const dropzone = part(screen.container, 'file-dropzone')!;
    await expect.element(dropzone).toHaveAttribute('data-hugging');
    const zone = part(screen.container, 'zone')!;
    expect(zone.contains(screen.container.querySelector('[role="grid"]'))).toBe(true);

    drag(zone, [file('avatar.png')], ['dragenter', 'dragover']);
    await expect
      .poll(() => part(screen.container, 'float-message')?.textContent)
      .toBe('Drop to replace');
    drag(zone, [file('avatar.png')]);
    await expect.poll(() => pending.length).toBe(2);
    expect(pending[0].context.signal.aborted).toBe(true);
    await expect.element(screen.getByRole('row')).toHaveLength(1);
    await expect.element(screen.getByRole('row', { name: /^avatar\.png/ })).toBeVisible();
  });

  it('returns focus to the browse button when the single file is removed', async () => {
    const screen = await renderWithDS(<FileUpload layout="single" />);
    pick(screen.container, [file('portrait.png')]);
    await screen.getByRole('button', { name: 'Remove portrait.png' }).click();
    await expect
      .element(screen.getByRole('button', { name: 'Drag a file here or browse' }))
      .toHaveFocus();
  });

  it('aborts running uploads when it unmounts', async () => {
    const { pending, onUpload } = controlledUploads();
    const screen = await renderWithDS(<FileUpload onUpload={onUpload} />);
    pick(screen.container, [file('lake.png')]);
    await expect.poll(() => pending.length).toBe(1);
    screen.unmount();
    expect(pending[0].context.signal.aborted).toBe(true);
  });

  it('takes labels from the labels prop and from DSProvider', async () => {
    const { pending, onUpload } = controlledUploads();
    const screen = await renderWithDS(
      <FileUpload
        onUpload={onUpload}
        labels={{ uploadedAnnouncement: '{name} hochgeladen', cancel: '{name} abbrechen' }}
      />,
      { provider: { labels: { fileDropzone: { browse: 'auswählen' } } } },
    );
    await expect
      .element(screen.getByRole('button', { name: 'Drag a file here or auswählen' }))
      .toBeVisible();
    pick(screen.container, [file('lake.png')]);
    await expect.poll(() => pending.length).toBe(1);
    await expect.element(screen.getByRole('button', { name: 'lake.png abbrechen' })).toBeVisible();
    pending[0].resolve();
    await expect.element(announcer(screen.container)).toHaveTextContent('lake.png hochgeladen');
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
    ['right-to-left', { locale: 'ar' }],
  ])('has no accessibility violations in %s', async (_name, options) => {
    const { pending, onUpload } = controlledUploads();
    const screen = await renderWithDS(
      <div className="flex flex-col gap-6 p-4">
        <FileUpload label="Photos" allowsMultiple onUpload={onUpload} />
        <FileUpload
          label="Profile photo"
          layout="single"
          defaultValue={[
            { id: 'p', file: { name: 'portrait.png', size: 820_000 }, status: 'complete' },
          ]}
        />
      </div>,
      options,
    );
    pick(screen.container, [file('lake.png'), file('river.png')]);
    await expect.poll(() => pending.length).toBe(2);
    pending[0].context.onProgress(0.4);
    pending[1].reject(new FileUploadError('Connection lost'));
    await expect.element(screen.getByRole('button', { name: 'Retry river.png' })).toBeVisible();
    await expect
      .poll(() => document.getAnimations().filter((item) => item.playState === 'running').length, {
        timeout: 3000,
      })
      .toBe(0);
    await expectNoA11yViolations(screen.container);
  });
});
