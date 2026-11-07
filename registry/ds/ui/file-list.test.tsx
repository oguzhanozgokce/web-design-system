import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { FileIcon, FileItem, FileList, type FileListEntry } from '@/registry/ds/ui/file-list';

function part(root: Element, name: string) {
  return root.querySelector<HTMLElement>(`[data-slot="${name}"]`);
}

function rowOf(root: Element, name: string) {
  return [...root.querySelectorAll<HTMLElement>('[role="row"]')].find((row) =>
    row.textContent?.includes(name),
  )!;
}

const entries: FileListEntry[] = [
  {
    id: 'beach',
    file: { name: 'beach.jpg', size: 3_200_000, type: 'image/jpeg' },
    status: 'complete',
  },
  {
    id: 'interview',
    file: { name: 'interview.mp4', size: 48_600_000 },
    status: 'uploading',
    progress: 0.42,
  },
  { id: 'memo', file: { name: 'memo.m4a', size: 2_100_000 }, status: 'uploading' },
  { id: 'notes', file: { name: 'notes.pdf', size: 420_000 }, status: 'error' },
  { id: 'plan', file: { name: 'plan.xlsx', size: 96_000 }, status: 'queued' },
  { id: 'cover', file: { name: 'cover.png', size: 1_400 } },
];

describe('FileList', () => {
  it('names each row with the file, its size and its status', async () => {
    const screen = await renderWithDS(<FileList items={entries} />, {
      provider: { motion: 'disabled' },
    });
    await expect.element(screen.getByRole('grid', { name: 'Files' })).toBeVisible();
    for (const name of [
      'beach.jpg 3.2 MB Uploaded',
      'interview.mp4 48.6 MB Uploading 42%',
      'memo.m4a 2.1 MB Uploading',
      'notes.pdf 420 kB Upload failed',
      'plan.xlsx 96 kB Waiting',
      'cover.png 1 kB',
    ]) {
      await expect.element(screen.getByRole('row', { name, exact: true })).toBeInTheDocument();
    }
  });

  it('shows a progress bar while uploading, measured or not', async () => {
    const screen = await renderWithDS(<FileList items={entries} />);
    const measured = screen.getByRole('progressbar', { name: 'interview.mp4' });
    await expect.element(measured).toHaveAttribute('aria-valuenow', '42');
    const unmeasured = screen.getByRole('progressbar', { name: 'memo.m4a' });
    await expect.element(unmeasured).not.toHaveAttribute('aria-valuenow');
    const interview = rowOf(screen.container, 'interview.mp4');
    expect(part(interview, 'rolling-number')).not.toBeNull();
    const memo = rowOf(screen.container, 'memo.m4a');
    expect(part(memo, 'status')!.textContent).toBe('Uploading');
  });

  it('pops a check when complete and folds the bar away', async () => {
    const screen = await renderWithDS(<FileList items={entries} />);
    const beach = rowOf(screen.container, 'beach.jpg');
    expect(part(beach, 'check')).not.toBeNull();
    const bar = part(beach, 'progress-row')!;
    expect(bar.hasAttribute('data-collapsed')).toBe(true);
    await expect.poll(() => bar.getBoundingClientRect().height).toBe(0);
    await expect
      .element(screen.getByRole('progressbar', { name: 'beach.jpg' }))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'plan.xlsx' }))
      .not.toBeInTheDocument();
  });

  it('shows the error message of a failed row', async () => {
    const screen = await renderWithDS(
      <FileList
        items={[
          {
            id: 'notes',
            file: { name: 'notes.pdf', size: 420_000 },
            status: 'error',
            error: 'Connection lost',
          },
        ]}
      />,
    );
    const row = rowOf(screen.container, 'notes.pdf');
    const status = part(row, 'status')!;
    expect(status.textContent).toBe('Connection lost');
    expect(row.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('offers cancel while running, retry after a failure and remove otherwise', async () => {
    const onRemove = vi.fn();
    const onCancel = vi.fn();
    const onRetry = vi.fn();
    const screen = await renderWithDS(
      <FileList items={entries} onRemove={onRemove} onCancel={onCancel} onRetry={onRetry} />,
    );
    await screen.getByRole('button', { name: 'Cancel interview.mp4' }).click();
    expect(onCancel).toHaveBeenCalledWith('interview');
    await screen.getByRole('button', { name: 'Cancel plan.xlsx' }).click();
    expect(onCancel).toHaveBeenCalledWith('plan');
    await screen.getByRole('button', { name: 'Retry notes.pdf' }).click();
    expect(onRetry).toHaveBeenCalledWith('notes');
    await screen.getByRole('button', { name: 'Remove notes.pdf' }).click();
    await screen.getByRole('button', { name: 'Remove beach.jpg' }).click();
    expect(onRemove.mock.calls.map(([id]) => id)).toEqual(['notes', 'beach']);
    expect(screen.container.querySelectorAll('button[aria-label^="Retry"]').length).toBe(1);
  });

  it('removes a running file when no cancel handler is given', async () => {
    const onRemove = vi.fn();
    const screen = await renderWithDS(<FileList items={entries} onRemove={onRemove} />);
    await screen.getByRole('button', { name: 'Remove interview.mp4' }).click();
    expect(onRemove).toHaveBeenCalledWith('interview');
  });

  it('takes static FileItem children with their own handlers', async () => {
    const onRemove = vi.fn();
    const screen = await renderWithDS(
      <FileList aria-label="Attachments" variant="soft">
        <FileItem id="a" file={{ name: 'agenda.docx', size: 24_000 }} onRemove={onRemove} />
        <FileItem
          id="b"
          file={{ name: 'avatar.png', size: 64_000 }}
          icon={<span data-testid="thumb" />}
          isDisabled
          onRemove={onRemove}
        />
      </FileList>,
    );
    await expect.element(screen.getByRole('grid', { name: 'Attachments' })).toBeVisible();
    await expect.element(screen.getByTestId('thumb')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Remove avatar.png' })).toBeDisabled();
    await screen.getByRole('button', { name: 'Remove agenda.docx' }).click();
    expect(onRemove).toHaveBeenCalledTimes(1);
    const disabled = rowOf(screen.container, 'avatar.png');
    expect(getComputedStyle(disabled).opacity).toBe('0.5');
  });

  it('truncates long names in the middle and keeps the extension', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 260 }}>
        <FileList
          items={[
            {
              id: 'long',
              file: { name: 'a-very-long-name-for-a-holiday-photo-from-the-coast.jpeg', size: 10 },
            },
          ]}
        />
      </div>,
    );
    const row = rowOf(screen.container, 'holiday');
    const name = part(row, 'name')!;
    const stem = part(name, 'name-stem')!;
    expect(stem.scrollWidth).toBeGreaterThan(stem.clientWidth);
    expect(name.textContent!.endsWith('.jpeg')).toBe(true);
    expect(name.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    );
  });

  it('takes labels from the labels prop and from DSProvider', async () => {
    const screen = await renderWithDS(
      <FileList
        items={entries.slice(3, 4)}
        onRemove={() => {}}
        onRetry={() => {}}
        labels={{ remove: '{name} entfernen' }}
      />,
      { provider: { labels: { fileList: { retry: '{name} erneut senden', list: 'Dateien' } } } },
    );
    await expect.element(screen.getByRole('grid', { name: 'Dateien' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'notes.pdf entfernen' })).toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'notes.pdf erneut senden' }))
      .toBeVisible();
  });

  it('keeps the actions at the end in right-to-left layouts', async () => {
    const screen = await renderWithDS(
      <FileList items={entries.slice(0, 1)} onRemove={() => {}} />,
      {
        locale: 'ar',
      },
    );
    const row = rowOf(screen.container, 'beach.jpg');
    const icon = part(row, 'file-icon')!;
    const actions = part(row, 'actions')!;
    expect(icon.getBoundingClientRect().left).toBeGreaterThan(actions.getBoundingClientRect().left);
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
    ['right-to-left', { locale: 'ar' }],
  ])('has no accessibility violations in %s', async (_name, options) => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4 p-4">
        <FileList items={entries} onRemove={() => {}} onRetry={() => {}} onCancel={() => {}} />
        <FileList aria-label="Soft" variant="soft" items={entries.slice(0, 2)} />
        <FileList aria-label="Transparent" variant="transparent" items={entries.slice(3)} />
      </div>,
      options,
    );
    await expectNoA11yViolations(screen.container);
  });
});

describe('FileIcon', () => {
  it('labels the page with the extension in the colour of its kind', async () => {
    const screen = await renderWithDS(
      <>
        <FileIcon file={{ name: 'holiday.png' }} />
        <FileIcon file={{ name: 'chapter.docx' }} />
        <FileIcon file={{ name: 'clip', type: 'video/mp4' }} />
        <FileIcon file={{ name: 'README' }} kind="code" />
      </>,
    );
    const icons = [...screen.container.querySelectorAll<SVGElement>('[data-slot="file-icon"]')];
    expect(icons.map((icon) => icon.dataset.kind)).toEqual(['image', 'document', 'video', 'code']);
    expect(icons.map((icon) => icon.querySelector('text')?.textContent ?? null)).toEqual([
      'PNG',
      'DOCX',
      null,
      null,
    ]);
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true);
    const label = icons[0].querySelector('rect')!.getBoundingClientRect();
    const page = icons[0].querySelector('path')!.getBoundingClientRect();
    expect(label.left).toBeLessThan(page.left);
  });
});
