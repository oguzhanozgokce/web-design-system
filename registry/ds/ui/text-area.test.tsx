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
      <TextArea label="Project note" placeholder="Thanks for your business" onChange={onChange} />,
    );
    const textarea = screen.getByRole('textbox', { name: 'Project note' });
    expect(textarea.element().tagName).toBe('TEXTAREA');
    await expect.element(textarea).toHaveAttribute('rows', '3');
    await textarea.fill('Message due in 14 days.');
    expect(onChange).toHaveBeenLastCalledWith('Message due in 14 days.');
  });

  it('follows a controlled value and keeps the counter in step', async () => {
    function Example() {
      const [value, setValue] = useState('Net 30');
      return (
        <>
          <TextArea label="Message terms" maxLength={80} value={value} onChange={setValue} />
          <button type="button" onClick={() => setValue('')}>
            Reset terms
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    const textarea = screen.getByRole('textbox', { name: 'Message terms' });
    await expect.element(textarea).toHaveValue('Net 30');
    await expect.element(screen.getByText('6/80')).toBeInTheDocument();
    await textarea.fill('Due on comment');
    await expect.element(screen.getByText('14/80')).toBeInTheDocument();
    await screen.getByRole('button', { name: 'Reset terms' }).click();
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
          defaultValue="Exports now include the payee category and shared folders show who added each session."
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
      <TextArea label="Short bio" maxLength={160} defaultValue="Finance lead at Nova." />,
    );
    const textarea = screen.getByRole('textbox', { name: 'Short bio' });
    await expect.element(textarea).toHaveAttribute('maxlength', '160');
    await expect.element(screen.getByText('21/160')).toBeInTheDocument();
    await expect.element(textarea).toHaveAccessibleDescription('Character count: 21 of 160');
  });

  it('takes the counter and optional text from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div>
        <TextArea label="Short bio" maxLength={160} defaultValue="Finance lead" />
        <TextArea
          label="Refund reason"
          maxLength={200}
          defaultValue="Damaged"
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
      .element(screen.getByRole('textbox', { name: 'Refund reason (if known)' }))
      .toHaveAccessibleDescription('7 characters so far');
    await expect.element(screen.getByText('7 of 200', { exact: true })).toBeInTheDocument();
  });

  it('marks invalid, read-only and disabled states', async () => {
    const screen = await renderWithDS(
      <div>
        <TextArea label="Refund reason" isRequired isInvalid errorMessage="Add a reason." />
        <TextArea label="Audit trail" isReadOnly defaultValue="Approved by Dana" />
        <TextArea label="Archived note" isDisabled defaultValue="Closed" />
      </div>,
    );
    const reason = screen.getByRole('textbox', { name: 'Refund reason' });
    await expect.element(reason).toHaveAttribute('aria-invalid', 'true');
    await expect.element(reason).toHaveAccessibleDescription('Add a reason.');
    await expect.element(reason).toBeRequired();
    await expect
      .element(screen.getByRole('textbox', { name: 'Audit trail' }))
      .toHaveAttribute('readonly');
    await expect.element(screen.getByRole('textbox', { name: 'Archived note' })).toBeDisabled();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid w-96 gap-4 p-4">
          <TextArea label="Project note" description="Printed under the totals." />
          <TextArea label="Short bio" maxLength={160} variant="filled" />
          <TextArea label="Refund reason" isInvalid errorMessage="Add a reason." />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
