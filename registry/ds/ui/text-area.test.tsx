import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { TextArea } from '@/registry/ds/ui/text-area';

function heightOf(element: Element) {
  return element.getBoundingClientRect().height;
}

function withoutFieldSizing() {
  const supports = CSS.supports.bind(CSS);
  vi.spyOn(CSS, 'supports').mockImplementation(((property: string, value?: string) => {
    if (property === 'field-sizing') return false;
    return value === undefined ? supports(property) : supports(property, value);
  }) as typeof CSS.supports);
}

describe('TextArea', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a labelled multi-line textbox', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <TextArea label="Project note" placeholder="Add a note for the team" onChange={onChange} />,
    );
    const textarea = screen.getByRole('textbox', { name: 'Project note' });
    expect(textarea.element().tagName).toBe('TEXTAREA');
    await expect.element(textarea).toHaveAttribute('rows', '3');
    await textarea.fill('Review the photos by Friday.');
    expect(onChange).toHaveBeenLastCalledWith('Review the photos by Friday.');
  });

  it('follows a controlled value and keeps the counter in step', async () => {
    function Example() {
      const [value, setValue] = useState('Hello!');
      return (
        <>
          <TextArea label="Greeting" maxLength={80} value={value} onChange={setValue} />
          <button type="button" onClick={() => setValue('')}>
            Reset greeting
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    const textarea = screen.getByRole('textbox', { name: 'Greeting' });
    await expect.element(textarea).toHaveValue('Hello!');
    await expect.element(screen.getByText('6/80')).toBeInTheDocument();
    await textarea.fill('Welcome aboard!');
    await expect.element(screen.getByText('15/80')).toBeInTheDocument();
    await screen.getByRole('button', { name: 'Reset greeting' }).click();
    await expect.element(textarea).toHaveValue('');
    await expect.element(screen.getByText('0/80')).toBeInTheDocument();
  });

  it('grows with its content between minRows and maxRows', async () => {
    const screen = await renderWithDS(
      <div className="w-80">
        <TextArea label="Release notes" minRows={2} maxRows={4} />
      </div>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Release notes' });
    const element = textarea.element();
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
    const padding =
      parseFloat(getComputedStyle(element).paddingTop) +
      parseFloat(getComputedStyle(element).paddingBottom);

    expect(heightOf(element)).toBeCloseTo(2 * lineHeight + padding, 0);

    await textarea.click();
    await userEvent.keyboard('Line one{Enter}Line two{Enter}Line three');
    await expect.poll(() => heightOf(element)).toBeCloseTo(3 * lineHeight + padding, 0);

    await userEvent.keyboard('{Enter}Four{Enter}Five{Enter}Six');
    await expect.poll(() => heightOf(element)).toBeCloseTo(4 * lineHeight + padding, 0);
    expect(element.scrollHeight).toBeGreaterThan(element.clientHeight);
  });

  it('measures its content where field-sizing is not supported', async () => {
    withoutFieldSizing();
    const screen = await renderWithDS(
      <div className="w-80">
        <TextArea label="Release notes" minRows={1} maxRows={6} />
      </div>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Release notes' });
    const element = textarea.element() as HTMLTextAreaElement;
    const oneLine = parseFloat(element.style.height);
    expect(oneLine).toBeGreaterThan(0);

    await textarea.click();
    await userEvent.keyboard('Line one{Enter}Line two{Enter}Line three');
    await expect.poll(() => parseFloat(element.style.height)).toBeGreaterThan(oneLine * 2);
    expect(parseFloat(element.style.height)).toBe(element.scrollHeight);
  });

  it('measures again when its width changes where field-sizing is not supported', async () => {
    withoutFieldSizing();
    const screen = await renderWithDS(
      <div style={{ width: 480 }} data-testid="frame">
        <TextArea
          label="Release notes"
          minRows={1}
          maxRows={8}
          defaultValue="Exports now include captions and shared folders show who added each photo and when."
        />
      </div>,
    );
    const element = screen.getByRole('textbox', { name: 'Release notes' }).element();
    const wide = parseFloat((element as HTMLTextAreaElement).style.height);
    (screen.getByTestId('frame').element() as HTMLElement).style.width = '200px';
    await expect
      .poll(() => parseFloat((element as HTMLTextAreaElement).style.height))
      .toBeGreaterThan(wide);
    expect(element.scrollHeight).toBeLessThanOrEqual(element.clientHeight);
  });

  it('does not resize by default and can opt into vertical resizing', async () => {
    const screen = await renderWithDS(
      <div>
        <TextArea label="Internal memo" />
        <TextArea label="Meeting notes" resize="vertical" />
      </div>,
    );
    const memo = screen.getByRole('textbox', { name: 'Internal memo' }).element();
    const notes = screen.getByRole('textbox', { name: 'Meeting notes' }).element();
    expect(getComputedStyle(memo).resize).toBe('none');
    expect(getComputedStyle(notes).resize).toBe('vertical');
  });

  it('counts characters against maxLength', async () => {
    const screen = await renderWithDS(
      <TextArea label="Short bio" maxLength={160} defaultValue="Photographer and cook." />,
    );
    const textarea = screen.getByRole('textbox', { name: 'Short bio' });
    await expect.element(textarea).toHaveAttribute('maxlength', '160');
    await expect.element(screen.getByText('22/160')).toBeInTheDocument();
    await expect.element(textarea).toHaveAccessibleDescription('Character count: 22 of 160');
  });

  it('takes the counter and optional text from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div>
        <TextArea label="Short bio" maxLength={160} defaultValue="Photographer" />
        <TextArea
          label="Feedback"
          maxLength={200}
          defaultValue="Too slow"
          necessityIndicator="label"
          labels={{
            optional: '(if known)',
            characterCount: ({ count, max }) => `${count} of ${max}`,
            characterCountLabel: ({ count }) => `${count} characters so far`,
          }}
        />
      </div>,
      { provider: { labels: { field: { characterCountLabel: '{count} used, {max} allowed' } } } },
    );
    await expect
      .element(screen.getByRole('textbox', { name: 'Short bio' }))
      .toHaveAccessibleDescription('12 used, 160 allowed');
    await expect.element(screen.getByText('12/160', { exact: true })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('textbox', { name: 'Feedback (if known)' }))
      .toHaveAccessibleDescription('8 characters so far');
    await expect.element(screen.getByText('8 of 200', { exact: true })).toBeInTheDocument();
  });

  it('marks invalid, read-only and disabled states', async () => {
    const screen = await renderWithDS(
      <div>
        <TextArea label="Feedback" isRequired isInvalid errorMessage="Add a reason." />
        <TextArea label="History" isReadOnly defaultValue="Edited by Dana" />
        <TextArea label="Archived note" isDisabled defaultValue="Closed" />
      </div>,
    );
    const reason = screen.getByRole('textbox', { name: 'Feedback' });
    await expect.element(reason).toHaveAttribute('aria-invalid', 'true');
    await expect.element(reason).toHaveAccessibleDescription('Add a reason.');
    await expect.element(reason).toBeRequired();
    await expect
      .element(screen.getByRole('textbox', { name: 'History' }))
      .toHaveAttribute('readonly');
    await expect.element(screen.getByRole('textbox', { name: 'Archived note' })).toBeDisabled();
  });

  it('reports the variant and fills the soft frame', async () => {
    const screen = await renderWithDS(
      <div className="grid w-80 gap-4">
        <span data-testid="neutral" className="bg-neutral-soft" />
        <TextArea label="Outline" />
        <TextArea label="Soft" variant="soft" />
      </div>,
    );
    const roots = [...screen.container.querySelectorAll('[data-slot="text-area"]')];
    expect(roots.map((root) => root.getAttribute('data-variant'))).toEqual(['outline', 'soft']);
    const neutral = getComputedStyle(screen.getByTestId('neutral').element()).backgroundColor;
    const frames = roots.map((root) => root.querySelector('[data-slot="container"]')!);
    expect(getComputedStyle(frames[1]).backgroundColor).toBe(neutral);
    expect(getComputedStyle(frames[0]).borderTopLeftRadius).toBe('12px');
    expect(getComputedStyle(frames[0]).borderTopWidth).toBe('1px');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid w-96 gap-4 p-4">
          <TextArea label="Project note" description="Shown under the title." />
          <TextArea label="Short bio" maxLength={160} variant="soft" />
          <TextArea label="History" isReadOnly defaultValue="Edited by Dana" />
          <TextArea label="Archived note" isDisabled defaultValue="Closed" />
          <TextArea label="Feedback" isInvalid errorMessage="Add a reason." />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
