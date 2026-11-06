import { useState } from 'react';
import { SearchField as AriaSearchField, TextField as AriaTextField } from 'react-aria-components';
import { cdp, page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { LinkIcon, SearchIcon } from '@/registry/ds/lib/icons';
import {
  Field,
  FieldAdornment,
  FieldButton,
  FieldCounter,
  FieldGroup,
  FieldInput,
  fieldStyles,
} from '@/registry/ds/ui/field';
import { TextField } from '@/registry/ds/ui/text-field';

function characterPositions(element: Element) {
  const text = element.firstChild as Text;
  return [...text.data].map((_, index) => {
    const range = document.createRange();
    range.setStart(text, index);
    range.setEnd(text, index + 1);
    return range.getBoundingClientRect().left;
  });
}

describe('Field', () => {
  it('marks required fields with a hidden asterisk and keeps the name clean', async () => {
    const screen = await renderWithDS(<TextField label="Work email" isRequired />);
    const input = screen.getByRole('textbox', { name: 'Work email' });
    await expect.element(input).toBeRequired();
    const indicator = screen.container.querySelector('[data-slot="necessity-indicator"]');
    expect(indicator?.textContent).toBe('*');
    expect(indicator?.getAttribute('aria-hidden')).toBe('true');
  });

  it('marks optional fields with (optional) when necessityIndicator is label', async () => {
    const screen = await renderWithDS(
      <div>
        <TextField label="Company" necessityIndicator="label" />
        <TextField label="Work email" necessityIndicator="label" isRequired />
      </div>,
    );
    await expect
      .element(screen.getByRole('textbox', { name: 'Company (optional)' }))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('textbox', { name: 'Work email' })).toBeRequired();
  });

  it('takes its text from labels, then DSProvider, then the English default', async () => {
    const screen = await renderWithDS(
      <div>
        <AriaTextField
          className={fieldStyles().root()}
          defaultValue="DE1234"
          aria-describedby="tax-count"
        >
          <Field
            label="TAX number"
            necessityIndicator="label"
            labels={{ optional: '(if registered)' }}
            counter={
              <FieldCounter
                id="tax-count"
                count={6}
                max={14}
                labels={{
                  characterCount: '{count} / {max}',
                  characterCountLabel: ({ count, max }) => `${count} of ${max} characters used`,
                }}
              />
            }
          >
            <FieldGroup>
              <FieldInput />
            </FieldGroup>
          </Field>
        </AriaTextField>
        <TextField label="Company" necessityIndicator="label" maxLength={40} defaultValue="Nova" />
      </div>,
      {
        provider: {
          labels: {
            field: {
              optional: '(not required)',
              characterCountLabel: '{count} typed, {max} at most',
            },
          },
        },
      },
    );
    await expect
      .element(screen.getByRole('textbox', { name: 'TAX number (if registered)' }))
      .toHaveAccessibleDescription('6 of 14 characters used');
    await expect.element(screen.getByText('6 / 14', { exact: true })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('textbox', { name: 'Company (not required)' }))
      .toHaveAccessibleDescription('4 typed, 40 at most');
    await expect.element(screen.getByText('4/40', { exact: true })).toBeInTheDocument();
  });

  it('hides the label visually but keeps it as the accessible name', async () => {
    const screen = await renderWithDS(<TextField label="Search folders" isLabelHidden />);
    await expect
      .element(screen.getByRole('textbox', { name: 'Search folders' }))
      .toBeInTheDocument();
    const label = screen.container.querySelector('[data-slot="label"]');
    expect(label?.className).toContain('sr-only');
  });

  it('describes the input and swaps the description for the error when invalid', async () => {
    function Example() {
      const [value, setValue] = useState('finance');
      return (
        <TextField
          label="Sharing email"
          description="Projects are sent here."
          errorMessage="Enter an address like name@company.com."
          isInvalid={!value.includes('@')}
          value={value}
          onChange={setValue}
        />
      );
    }
    const screen = await renderWithDS(<Example />);
    const input = screen.getByRole('textbox', { name: 'Sharing email' });
    await expect.element(input).toHaveAttribute('aria-invalid', 'true');
    await expect
      .element(input)
      .toHaveAccessibleDescription('Enter an address like name@company.com.');
    await expect.element(screen.getByText('Projects are sent here.')).not.toBeInTheDocument();

    await input.fill('finance@nova.com');
    await expect.element(input).not.toHaveAttribute('aria-invalid');
    await expect.element(input).toHaveAccessibleDescription('Projects are sent here.');
  });

  it('passes the validation result to an errorMessage function', async () => {
    const screen = await renderWithDS(
      <TextField
        label="Seats"
        validationBehavior="aria"
        validate={(value) => (Number(value) > 50 ? 'over-plan' : null)}
        errorMessage={(validation) =>
          validation.validationErrors.includes('over-plan') ? 'Your plan includes 50 seats.' : null
        }
        defaultValue="80"
      />,
    );
    await expect
      .element(screen.getByRole('textbox', { name: 'Seats' }))
      .toHaveAccessibleDescription('Your plan includes 50 seats.');
  });

  it('shows native validation messages after a form submit', async () => {
    const screen = await renderWithDS(
      <form onSubmit={(event) => event.preventDefault()}>
        <TextField label="Company" name="company" isRequired />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    const input = screen.getByRole('textbox', { name: 'Company' });
    await expect.element(input).toHaveAttribute('aria-invalid', 'true');
    await expect.element(input).toHaveFocus();
    const error = screen.container.querySelector('[data-slot="error"]');
    expect(error?.textContent?.length).toBeGreaterThan(0);
  });

  it('sizes the control at 36, 40 and 48 pixels', async () => {
    const screen = await renderWithDS(
      <div className="w-80">
        <TextField label="Small" size="sm" />
        <TextField label="Medium" />
        <TextField label="Large" size="lg" />
      </div>,
    );
    const heights = [...screen.container.querySelectorAll('[data-slot="container"]')].map(
      (element) => element.getBoundingClientRect().height,
    );
    expect(heights).toEqual([36, 40, 48]);
    const root = screen.container.querySelector('[data-slot="text-field"]');
    expect(root?.getAttribute('data-size')).toBe('sm');
    expect(root?.getAttribute('data-variant')).toBe('outlined');
  });

  it('draws hover, focus and error borders and the caret from the control state', async () => {
    const screen = await renderWithDS(
      <div className="w-80">
        <span data-testid="primary" className="border border-primary" />
        <span data-testid="error" className="border border-error" />
        <span data-testid="on-surface" className="border border-on-surface" />
        <TextField label="Company" />
        <TextField label="IBAN" isInvalid errorMessage="This IBAN has 2 digits too few." />
        <TextField label="Notes" variant="filled" />
      </div>,
    );
    const colorOf = (testId: string) =>
      getComputedStyle(screen.getByTestId(testId).element()).borderTopColor;
    const [company, iban, notes] = [
      ...screen.container.querySelectorAll('[data-slot="container"]'),
    ] as HTMLElement[];

    await userEvent.hover(company);
    await expect.element(company).toHaveAttribute('data-hovered', 'true');
    await expect.poll(() => getComputedStyle(company).borderTopColor).toBe(colorOf('on-surface'));

    const companyInput = screen.getByRole('textbox', { name: 'Company' });
    await companyInput.click();
    await expect.poll(() => getComputedStyle(company).borderTopColor).toBe(colorOf('primary'));
    await expect.element(company).toHaveAttribute('data-focus-within', 'true');
    expect(getComputedStyle(companyInput.element()).caretColor).toBe(colorOf('primary'));

    const ibanInput = screen.getByRole('textbox', { name: 'IBAN' });
    await ibanInput.click();
    await expect.poll(() => getComputedStyle(iban).borderTopColor).toBe(colorOf('error'));
    expect(getComputedStyle(ibanInput.element()).caretColor).toBe(colorOf('error'));

    await screen.getByRole('textbox', { name: 'Notes' }).click();
    await expect
      .poll(() => getComputedStyle(notes, '::after').backgroundColor)
      .toBe(colorOf('primary'));
    await expect.poll(() => getComputedStyle(notes, '::after').height).toBe('2px');
  });

  it('lets other React Aria fields reuse the parts', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <AriaSearchField className={fieldStyles().root()} defaultValue="Q3 projects">
        <Field label="Search folders" description="Searches names and references." variant="filled">
          <FieldGroup>
            <FieldAdornment>
              <SearchIcon />
            </FieldAdornment>
            <FieldInput />
            <FieldButton aria-label="Run search" onPress={onPress}>
              <SearchIcon />
            </FieldButton>
          </FieldGroup>
        </Field>
      </AriaSearchField>,
    );
    const input = screen.getByRole('searchbox', { name: 'Search folders' });
    await expect.element(input).toHaveAccessibleDescription('Searches names and references.');
    const action = screen.getByRole('button', { name: 'Run search' });
    await expect.element(action).toHaveAttribute('data-slot', 'action');
    await action.click();
    expect(onPress).toHaveBeenCalledOnce();
    const container = screen.container.querySelector('[data-slot="container"]');
    expect(container?.className).toContain('bg-surface-container-highest');
  });

  it('focuses the input when an adornment is pressed', async () => {
    const screen = await renderWithDS(
      <AriaTextField className={fieldStyles().root()}>
        <Field label="Invite link">
          <FieldGroup>
            <FieldAdornment>
              <LinkIcon data-testid="link-icon" />
            </FieldAdornment>
            <FieldInput />
          </FieldGroup>
        </Field>
      </AriaTextField>,
    );
    await screen.getByTestId('link-icon').click();
    await expect.element(screen.getByRole('textbox', { name: 'Invite link' })).toHaveFocus();
  });

  it('counts characters and announces the count once typing settles', async () => {
    function Example() {
      const [value, setValue] = useState('');
      return (
        <AriaTextField
          className={fieldStyles().root()}
          value={value}
          onChange={setValue}
          aria-describedby="note-count"
        >
          <Field
            label="Note"
            counter={<FieldCounter id="note-count" count={value.length} max={40} />}
          >
            <FieldGroup>
              <FieldInput />
            </FieldGroup>
          </Field>
        </AriaTextField>
      );
    }
    const screen = await renderWithDS(<Example />);
    const input = screen.getByRole('textbox', { name: 'Note' });
    await expect.element(input).toHaveAccessibleDescription('Character count: 0 of 40');
    await input.click();
    await userEvent.keyboard('Paid');
    await expect.element(screen.getByText('4/40')).toBeInTheDocument();
    const live = screen.container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe('');
    await expect.poll(() => live?.textContent, { timeout: 2000 }).toBe('Character count: 4 of 40');
  });

  it('does not announce counts that change while the input is not focused', async () => {
    function Example() {
      const [value, setValue] = useState('');
      return (
        <>
          <TextField label="Note" maxLength={40} value={value} onChange={setValue} />
          <button type="button" onClick={() => setValue('Paid in full')}>
            Use template
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    await screen.getByRole('button', { name: 'Use template' }).click();
    await expect.element(screen.getByText('12/40')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 900));
    const live = screen.container.querySelector('[data-slot="counter-announcer"]');
    expect(live?.textContent).toBe('');

    const input = screen.getByRole('textbox', { name: 'Note' });
    await input.click();
    await userEvent.keyboard('.');
    await expect.poll(() => live?.textContent, { timeout: 2000 }).toBe('Character count: 13 of 40');
  });

  it('keeps text adornments in their own reading order in RTL', async () => {
    const screen = await renderWithDS(
      <div className="w-96">
        <TextField label="الموقع" startAdornment="https://" />
      </div>,
      { locale: 'ar' },
    );
    const adornment = screen.container.querySelector('[data-slot="start-adornment"]')!;
    const positions = characterPositions(adornment);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('keeps every control visible in forced colours mode', async () => {
    const screen = await renderWithDS(
      <div className="grid w-80 gap-4">
        <TextField label="Company" />
        <TextField label="Tax ID" variant="filled" />
      </div>,
    );
    const [outlined, filled] = screen.container.querySelectorAll('[data-slot="container"]');
    expect(getComputedStyle(filled).borderBottomWidth).toBe('0px');
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });
    try {
      const canvas = getComputedStyle(document.body).backgroundColor;
      for (const control of [outlined, filled]) {
        const style = getComputedStyle(control);
        expect(style.borderBottomStyle).toBe('solid');
        expect(style.borderBottomWidth).toBe('1px');
        expect(style.borderBottomColor).not.toBe(canvas);
      }
    } finally {
      await cdp().send('Emulation.setEmulatedMedia', { features: [] });
    }
  });

  it('flags a count over the limit', async () => {
    await renderWithDS(<FieldCounter count={42} max={40} />);
    const counter = page.getByText('42/40').element().closest('[data-slot="counter"]');
    expect(counter?.getAttribute('data-over')).toBe('true');
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid w-96 gap-4 p-4">
          <TextField label="Company" description="Shown on projects." isRequired />
          <TextField label="Tax ID" necessityIndicator="label" variant="filled" />
          <TextField label="Sharing email" isInvalid errorMessage="Enter a valid email." />
          <TextField
            label="Sharing email"
            variant="filled"
            isInvalid
            errorMessage="Enter a valid email."
          />
          <TextField label="Workspace ID" isReadOnly defaultValue="ws_48213" />
          <TextField label="Region" isDisabled defaultValue="eu-west-1" />
          <TextField label="Display name" maxLength={32} defaultValue="Nova Finance" />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
