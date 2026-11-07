import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { FileDropzone } from '@/registry/ds/ui/file-dropzone';

function part(root: Element, name: string) {
  return root.querySelector<HTMLElement>(`[data-slot="${name}"]`)!;
}

function fakeTransfer(files: File[]) {
  return {
    types: ['Files'],
    items: files.map((file) => ({ kind: 'file', type: file.type, getAsFile: () => file })),
    files,
    effectAllowed: 'all',
    dropEffect: 'none',
    getData: () => '',
  };
}

function drag(target: Element, type: string, files: File[]) {
  const event = new DragEvent(type, { bubbles: true, cancelable: true, clientX: 20, clientY: 20 });
  Object.defineProperty(event, 'dataTransfer', { value: fakeTransfer(files) });
  target.dispatchEvent(event);
}

function dropFiles(zone: Element, files: File[]) {
  drag(zone, 'dragenter', files);
  drag(zone, 'dragover', files);
  drag(zone, 'drop', files);
}

function pick(root: Element, files: File[]) {
  const input = root.querySelector<HTMLInputElement>('input[type="file"]')!;
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function file(name: string, size: number, type = '') {
  return new File([new Uint8Array(size)], name, { type });
}

function errorColor(root: Element) {
  const reference = document.createElement('span');
  reference.className = 'text-error';
  root.append(reference);
  const color = getComputedStyle(reference).color;
  reference.remove();
  return color;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const photo = file('lake.png', 1_200, 'image/png');
const large = file('panorama.png', 4_000_000, 'image/png');
const notes = file('notes.txt', 300, 'text/plain');

describe('FileDropzone', () => {
  it('names the browse button with its prompt and describes it with the limits', async () => {
    const screen = await renderWithDS(
      <FileDropzone acceptedFileTypes={['image/*', '.pdf']} maxSize={5_000_000} />,
    );
    const browse = screen.getByRole('button', { name: 'Drag a file here or browse' });
    await expect.element(browse).toHaveAccessibleDescription('Images, PDF · up to 5 MB');
    await expect
      .element(screen.getByRole('button', { name: 'Drop or paste files' }))
      .toBeInTheDocument();
    const root = part(screen.container, 'file-dropzone');
    expect(root.getAttribute('role')).toBeNull();
    const input = screen.container.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(input.accept).toBe('image/*,.pdf');
    expect(input.multiple).toBe(false);
  });

  it('labels the group, the drop target and the browse button from label', async () => {
    const screen = await renderWithDS(
      <FileDropzone label="Cover image" allowsMultiple maxSize={2_000_000} />,
    );
    await expect.element(screen.getByRole('group', { name: 'Cover image' })).toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'Cover image Drag files here or browse' }))
      .toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'Drop or paste files Cover image' }))
      .toBeInTheDocument();
    expect(screen.container.querySelector<HTMLInputElement>('input[type="file"]')!.multiple).toBe(
      true,
    );
  });

  it('opens the file picker from the keyboard', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const screen = await renderWithDS(
      <>
        <button type="button">Before</button>
        <FileDropzone />
      </>,
    );
    await screen.getByRole('button', { name: 'Before' }).click();
    await userEvent.keyboard('{Tab}');
    const zone = part(screen.container, 'zone');
    await expect.element(zone).toHaveAttribute('data-focus-visible');
    expect(part(screen.container, 'message').textContent).toBe('Paste to add');
    await userEvent.keyboard('{Tab}');
    await expect
      .element(screen.getByRole('button', { name: 'Drag a file here or browse' }))
      .toHaveFocus();
    expect(part(screen.container, 'message').dataset.line).toBe('prompt');
    await userEvent.keyboard('{Enter}');
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it('opens the file picker when the box is pressed', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const screen = await renderWithDS(<FileDropzone />);
    const zone = part(screen.container, 'zone');
    const box = zone.getBoundingClientRect();
    const browse = part(screen.container, 'file-dropzone-browse');
    const target = document.elementFromPoint(box.left + 12, box.top + 12);
    expect(target).toBe(browse);
    await screen.getByRole('button', { name: 'Drag a file here or browse' }).click();
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it('grows and says drop while files are held over it, then takes the drop', async () => {
    const onSelect = vi.fn();
    const screen = await renderWithDS(<FileDropzone onSelect={onSelect} />);
    const zone = part(screen.container, 'zone');
    drag(zone, 'dragenter', [photo]);
    drag(zone, 'dragover', [photo]);
    await expect.element(zone).toHaveAttribute('data-drop-target');
    const message = part(screen.container, 'message');
    expect(message.dataset.line).toBe('drop');
    expect(message.textContent).toBe('Drop to add');
    await wait(500);
    expect(getComputedStyle(zone).scale).toBe('1.02');
    drag(zone, 'drop', [photo]);
    await expect.poll(() => onSelect.mock.calls.length).toBe(1);
    expect(zone.hasAttribute('data-drop-target')).toBe(false);
  });

  it('warns while a file of the wrong type is held over it and does not grow', async () => {
    const screen = await renderWithDS(<FileDropzone acceptedFileTypes={['image/*']} />);
    const zone = part(screen.container, 'zone');
    drag(zone, 'dragenter', [notes]);
    drag(zone, 'dragover', [notes]);
    await expect.element(zone).toHaveAttribute('data-drop-refused');
    const message = part(screen.container, 'message');
    expect(message.textContent).toBe('This file type isn’t accepted');
    expect(getComputedStyle(message).color).toBe(errorColor(screen.container));
    await wait(450);
    expect(getComputedStyle(zone).scale).not.toBe('1.02');
  });

  it('refuses files by type, size and count with a shake and an announcement', async () => {
    const onSelect = vi.fn();
    const onReject = vi.fn();
    const screen = await renderWithDS(
      <FileDropzone
        acceptedFileTypes={['image/*']}
        maxSize={2_000_000}
        onSelect={onSelect}
        onReject={onReject}
      />,
    );
    const zone = part(screen.container, 'zone');
    dropFiles(zone, [large]);
    await expect.poll(() => onReject.mock.calls.length).toBe(1);
    expect(onReject.mock.calls[0][0]).toEqual([{ file: large, reason: 'too-large' }]);
    const message = part(screen.container, 'message');
    await expect.element(message).toHaveTextContent('panorama.png is larger than 2 MB');
    expect(message.dataset.line).toBe('rejected');
    expect(getComputedStyle(message).color).toBe(errorColor(screen.container));
    await expect.element(zone).toHaveAttribute('data-rejecting');
    expect(zone.getAnimations().some((animation) => animation.playState === 'running')).toBe(true);
    await expect
      .element(screen.getByRole('status'))
      .toHaveTextContent('panorama.png is larger than 2 MB');

    pick(screen.container, [notes]);
    await expect.poll(() => onReject.mock.calls.length).toBe(2);
    expect(onReject.mock.calls[1][0]).toEqual([{ file: notes, reason: 'type' }]);
    await expect
      .element(screen.getByRole('status'))
      .toHaveTextContent('notes.txt isn’t a supported file type');

    pick(screen.container, [photo, file('river.png', 900, 'image/png')]);
    await expect.poll(() => onReject.mock.calls.length).toBe(3);
    expect(onSelect.mock.calls.at(-1)![0]).toEqual([photo]);
    expect(onReject.mock.calls[2][0][0].reason).toBe('too-many');
    await expect.element(screen.getByRole('status')).toHaveTextContent('You can add only one file');
  });

  it('turns the line back after the rejection has shown for a moment', async () => {
    const screen = await renderWithDS(<FileDropzone maxSize={10} />);
    pick(screen.container, [photo]);
    const message = part(screen.container, 'message');
    await expect.poll(() => message.dataset.line).toBe('rejected');
    await expect.poll(() => message.dataset.line, { timeout: 3000 }).toBe('prompt');
    expect(part(screen.container, 'zone').hasAttribute('data-rejecting')).toBe(false);
  });

  it('counts the files already added against maxFiles', async () => {
    const onSelect = vi.fn();
    const onReject = vi.fn();
    const screen = await renderWithDS(
      <FileDropzone
        allowsMultiple
        maxFiles={3}
        fileCount={2}
        onSelect={onSelect}
        onReject={onReject}
      />,
    );
    pick(screen.container, [photo, notes]);
    await expect.poll(() => onReject.mock.calls.length).toBe(1);
    expect(onSelect.mock.calls[0][0]).toEqual([photo]);
    expect(onReject.mock.calls[0][0]).toEqual([{ file: notes, reason: 'too-many' }]);
    await expect.element(screen.getByRole('status')).toHaveTextContent('You can add up to 3 files');
  });

  it('summarises several refused files in one message', async () => {
    const screen = await renderWithDS(<FileDropzone allowsMultiple minSize={1_000} />);
    pick(screen.container, [notes, file('empty.png', 0, 'image/png')]);
    await expect.element(screen.getByRole('status')).toHaveTextContent('2 files weren’t added');
  });

  it('adds pasted files while the drop target has focus', async () => {
    const onSelect = vi.fn();
    const screen = await renderWithDS(<FileDropzone onSelect={onSelect} />);
    const target = screen.getByRole('button', { name: 'Drop or paste files' }).element();
    (target as HTMLElement).focus();
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: fakeTransfer([photo]) });
    document.dispatchEvent(event);
    await expect.poll(() => onSelect.mock.calls.length).toBe(1);
    expect(onSelect.mock.calls[0][0]).toEqual([photo]);
  });

  it('ignores drops and picks while disabled', async () => {
    const onSelect = vi.fn();
    const screen = await renderWithDS(<FileDropzone isDisabled onSelect={onSelect} />);
    await expect
      .element(screen.getByRole('button', { name: 'Drag a file here or browse' }))
      .toBeDisabled();
    const root = part(screen.container, 'file-dropzone');
    expect(root.hasAttribute('data-disabled')).toBe(true);
    dropFiles(part(screen.container, 'zone'), [photo]);
    pick(screen.container, [photo]);
    await wait(100);
    expect(onSelect).not.toHaveBeenCalled();
    expect(getComputedStyle(part(screen.container, 'zone')).opacity).toBe('0.5');
  });

  it('shows an error message and describes the browse button with it when invalid', async () => {
    const screen = await renderWithDS(
      <FileDropzone
        label="Cover image"
        size="sm"
        isInvalid
        errorMessage="Add a cover image"
        description="PNG or JPG"
      />,
    );
    const browse = screen.getByRole('button', { name: 'Cover image Drag a file here or browse' });
    await expect.element(browse).toHaveAccessibleDescription('PNG or JPG Add a cover image');
    const root = part(screen.container, 'file-dropzone');
    expect(root.hasAttribute('data-invalid')).toBe(true);
    expect(part(screen.container, 'error').textContent).toBe('Add a cover image');
  });

  it('closes around its children and shows refusals under them', async () => {
    const screen = await renderWithDS(
      <div style={{ width: 360 }}>
        <FileDropzone maxSize={10}>
          <span data-testid="row">lake.png</span>
        </FileDropzone>
      </div>,
    );
    const root = part(screen.container, 'file-dropzone');
    expect(root.hasAttribute('data-hugging')).toBe(true);
    expect(screen.container.querySelector('[data-slot="file-dropzone-browse"]')).toBeNull();
    await wait(500);
    const zone = part(screen.container, 'zone');
    const row = screen.getByTestId('row').element();
    expect(zone.getBoundingClientRect().width).toBeLessThan(200);
    expect(zone.contains(row)).toBe(true);
    expect(part(screen.container, 'stage').getBoundingClientRect().height).toBe(176);
    dropFiles(zone, [photo]);
    await expect
      .poll(() => screen.container.querySelector('[data-slot="float-message"]')?.textContent)
      .toBe('lake.png is larger than 10 bytes');
    const float = part(screen.container, 'float-message');
    expect(float.getBoundingClientRect().top).toBeGreaterThan(zone.getBoundingClientRect().bottom);
  });

  it('takes its sizes and variants', async () => {
    const screen = await renderWithDS(
      <>
        <FileDropzone size="sm" variant="outline" aria-label="Small" />
        <FileDropzone size="lg" aria-label="Large" />
      </>,
    );
    const [small, large] = screen.container.querySelectorAll<HTMLElement>(
      '[data-slot="file-dropzone"]',
    );
    expect(small.dataset.size).toBe('sm');
    expect(small.dataset.variant).toBe('outline');
    expect(small.getAttribute('aria-label')).toBe('Small');
    expect(part(small, 'stage').getBoundingClientRect().height).toBe(64);
    expect(getComputedStyle(part(small, 'zone')).borderStyle).toBe('dashed');
    expect(part(large, 'stage').getBoundingClientRect().height).toBe(240);
  });

  it('takes labels from the labels prop and from DSProvider', async () => {
    const screen = await renderWithDS(
      <FileDropzone
        maxSize={1_000_000}
        labels={{ prompt: 'Drop a file here or {browse}', browse: 'choose one' }}
      />,
      {
        provider: {
          labels: { fileDropzone: { hintSize: 'Maximum {size}', dropzone: 'File target' } },
        },
      },
    );
    await expect
      .element(screen.getByRole('button', { name: 'Drop a file here or choose one' }))
      .toHaveAccessibleDescription('Maximum 1 MB');
    expect(part(screen.container, 'browse-link').textContent).toBe('choose one');
    await expect.element(screen.getByRole('button', { name: 'File target' })).toBeInTheDocument();
  });

  it('formats sizes for the locale', async () => {
    const screen = await renderWithDS(<FileDropzone maxSize={2_500_000} />, { locale: 'de-DE' });
    expect(part(screen.container, 'hint').textContent).toBe('Up to 2,5 MB');
  });

  it('only changes colour and text under reduced motion', async () => {
    const screen = await renderWithDS(<FileDropzone maxSize={10} />, {
      provider: { motion: 'reduced' },
    });
    const zone = part(screen.container, 'zone');
    drag(zone, 'dragenter', [photo]);
    drag(zone, 'dragover', [photo]);
    await expect.element(zone).toHaveAttribute('data-drop-target');
    await wait(450);
    expect(getComputedStyle(zone).scale).not.toBe('1.02');
    expect(getComputedStyle(part(screen.container, 'tile')).translate).toBe('none');
    drag(zone, 'drop', [photo]);
    await expect.element(zone).toHaveAttribute('data-rejecting');
    expect(
      zone.getAnimations().filter((animation) => !(animation instanceof CSSTransition)),
    ).toEqual([]);
    expect(part(screen.container, 'message').textContent).toBe('lake.png is larger than 10 bytes');
  });

  it('keeps logical order in right-to-left layouts', async () => {
    const screen = await renderWithDS(<FileDropzone size="sm" maxSize={1_000_000} />, {
      locale: 'ar',
    });
    const zone = part(screen.container, 'zone');
    const tile = part(screen.container, 'tile');
    expect(tile.getBoundingClientRect().left).toBeGreaterThan(
      part(screen.container, 'text').getBoundingClientRect().left,
    );
    expect(zone.getBoundingClientRect().right - tile.getBoundingClientRect().right).toBeCloseTo(
      16,
      0,
    );
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
    ['right-to-left', { locale: 'ar' }],
  ])('has no accessibility violations in %s', async (_name, options) => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-4 p-4">
        <FileDropzone label="Photos" allowsMultiple acceptedFileTypes={['image/*']} />
        <FileDropzone size="sm" variant="outline" aria-label="Attachment" maxSize={2_000_000} />
        <FileDropzone
          label="Cover"
          size="sm"
          isInvalid
          errorMessage="Add a cover image"
          maxSize={2_000_000}
        />
        <FileDropzone aria-label="Archive" isDisabled />
      </div>,
      options,
    );
    await expectNoA11yViolations(screen.container);
    pick(screen.container, [notes]);
    await expect
      .poll(() => screen.container.querySelector('[role="status"]')?.textContent)
      .toMatch(/notes/);
    await expectNoA11yViolations(screen.container);
  });
});
