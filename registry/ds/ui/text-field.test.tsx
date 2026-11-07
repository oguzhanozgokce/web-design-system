import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { SearchIcon } from '@/registry/ds/lib/icons';
import { TextField } from '@/registry/ds/ui/text-field';

describe('TextField', () => {
  it('follows a controlled value', async () => {
    function Example() {
      const [value, setValue] = useState('studio');
      return (
        <>
          <TextField label="Workspace URL" value={value} onChange={setValue} />
          <output>{value.toUpperCase()}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    const input = screen.getByRole('textbox', { name: 'Workspace URL' });
    await expect.element(input).toHaveValue('studio');
    await input.fill('riverside');
    await expect.element(screen.getByText('RIVERSIDE')).toBeInTheDocument();
  });

  it('renders prefixes, suffixes and icons around the input', async () => {
    const screen = await renderWithDS(
      <div>
        <TextField label="Website" startAdornment="https://" />
        <TextField label="Parcel weight" endAdornment="kg" type="text" inputMode="decimal" />
        <TextField label="Search" startAdornment={<SearchIcon />} />
      </div>,
    );
    await expect.element(screen.getByText('https://')).toBeVisible();
    await expect
      .element(screen.getByRole('textbox', { name: 'Parcel weight' }))
      .toHaveAttribute('inputmode', 'decimal');
    await screen.getByText('https://').click();
    await expect.element(screen.getByRole('textbox', { name: 'Website' })).toHaveFocus();
    const adornments = screen.container.querySelectorAll('[data-slot$="-adornment"]');
    expect([...adornments].map((element) => element.getAttribute('data-slot'))).toEqual([
      'start-adornment',
      'end-adornment',
      'start-adornment',
    ]);
  });

  it('clears the value from the clear button and refocuses the input', async () => {
    const onClear = vi.fn();
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <TextField
        label="Reference"
        defaultValue="DOC-2041"
        isClearable
        onClear={onClear}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Reference' });
    const clear = screen.getByRole('button', { name: 'Clear' });
    await expect.element(clear).toHaveAttribute('tabindex', '-1');
    await clear.click();
    await expect.element(input).toHaveValue('');
    await expect.element(input).toHaveFocus();
    expect(onClear).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith('');
    await expect.element(screen.getByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('clears with Escape and lets Escape through once the field is empty', async () => {
    const onParentKeyDown = vi.fn();
    const onFieldKeyDown = vi.fn();
    const screen = await renderWithDS(
      <div onKeyDown={(event) => onParentKeyDown(event.key)}>
        <TextField label="Reference" defaultValue="DOC-2041" isClearable />
        <TextField
          label="Note"
          defaultValue="Draft"
          isClearable
          onKeyDown={(event) => onFieldKeyDown(event.key)}
        />
      </div>,
    );
    const input = screen.getByRole('textbox', { name: 'Reference' });
    await input.click();
    await userEvent.keyboard('{Escape}');
    await expect.element(input).toHaveValue('');
    expect(onParentKeyDown).not.toHaveBeenCalledWith('Escape');
    await userEvent.keyboard('{Escape}');
    expect(onParentKeyDown).toHaveBeenCalledWith('Escape');
    await userEvent.keyboard('a');
    expect(onParentKeyDown).toHaveBeenCalledWith('a');

    const note = screen.getByRole('textbox', { name: 'Note' });
    await note.click();
    await userEvent.keyboard('{Escape}');
    await expect.element(note).toHaveValue('');
    expect(onFieldKeyDown).not.toHaveBeenCalled();
    await userEvent.keyboard('b');
    expect(onFieldKeyDown).toHaveBeenCalledWith('b');
  });

  it('leaves the value alone when Escape cancels an IME composition', async () => {
    const screen = await renderWithDS(
      <TextField label="Reference" defaultValue="請求書" isClearable />,
    );
    const input = screen.getByRole('textbox', { name: 'Reference' });
    await input.click();
    input
      .element()
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', isComposing: true, bubbles: true }),
      );
    await expect.element(input).toHaveValue('請求書');
    await userEvent.keyboard('{Escape}');
    await expect.element(input).toHaveValue('');
  });

  it('puts the clear button after an end adornment so units stay next to the value', async () => {
    const screen = await renderWithDS(
      <TextField label="Parcel weight" defaultValue="2.5" endAdornment="kg" isClearable />,
    );
    const container = screen.container.querySelector('[data-slot="container"]')!;
    expect([...container.children].map((child) => child.getAttribute('data-slot'))).toEqual([
      'input',
      'end-adornment',
      'clear-button',
    ]);
  });

  it('keeps email, URL and phone controls left to right in RTL', async () => {
    const screen = await renderWithDS(
      <div className="w-96">
        <TextField label="الموقع" type="url" startAdornment="https://" defaultValue="example.com" />
        <TextField label="الهاتف" type="tel" defaultValue="+44 20 7946 0958" />
        <TextField label="الاسم" defaultValue="شركة نورثويند" />
      </div>,
      { locale: 'ar' },
    );
    const website = screen.getByRole('textbox', { name: 'الموقع' }).element();
    const prefix = website.parentElement!.querySelector('[data-slot="start-adornment"]')!;
    expect(prefix.getBoundingClientRect().right).toBeLessThanOrEqual(
      website.getBoundingClientRect().left,
    );
    const phone = screen.getByRole('textbox', { name: 'الهاتف' }).element();
    expect(phone.closest('[data-slot="container"]')?.getAttribute('dir')).toBe('ltr');
    expect(getComputedStyle(phone).direction).toBe('ltr');
    const name = screen.getByRole('textbox', { name: 'الاسم' }).element();
    expect(name.closest('[data-slot="container"]')?.hasAttribute('dir')).toBe(false);
    expect(getComputedStyle(name).direction).toBe('rtl');
  });

  it('restores the default value and counter when its form resets', async () => {
    const screen = await renderWithDS(
      <form>
        <TextField label="Display name" name="displayName" defaultValue="Alex" maxLength={20} />
        <button type="reset">Reset</button>
      </form>,
    );
    const input = screen.getByRole('textbox', { name: 'Display name' });
    await input.fill('Design studio');
    await expect.element(screen.getByText('13/20')).toBeInTheDocument();
    await screen.getByRole('button', { name: 'Reset' }).click();
    await expect.element(input).toHaveValue('Alex');
    await expect.element(screen.getByText('4/20')).toBeInTheDocument();
  });

  it('takes its text and the Field text from labels, then DSProvider', async () => {
    const english = await renderWithDS(
      <TextField label="Reference" defaultValue="DOC-2041" isClearable />,
    );
    await expect.element(english.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    await english.unmount();

    const screen = await renderWithDS(
      <div>
        <TextField label="Reference" defaultValue="DOC-2041" isClearable />
        <TextField
          label="Order note"
          defaultValue="Leave at reception"
          isClearable
          maxLength={60}
          necessityIndicator="label"
          labels={{
            clear: 'Clear note',
            optional: '(if any)',
            characterCountLabel: '{count} of {max} characters used',
          }}
        />
      </div>,
      { provider: { labels: { textField: { clear: 'Empty field' } } } },
    );
    await expect.element(screen.getByRole('button', { name: 'Empty field' })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Clear note' })).toBeInTheDocument();
    await expect
      .element(screen.getByRole('textbox', { name: 'Order note (if any)' }))
      .toHaveAccessibleDescription('18 of 60 characters used');
  });

  it('hides the clear button when the field is disabled or read only', async () => {
    const screen = await renderWithDS(
      <div>
        <TextField label="Region" defaultValue="eu-west-1" isClearable isDisabled />
        <TextField label="Workspace ID" defaultValue="ws_48213" isClearable isReadOnly />
      </div>,
    );
    await expect.element(screen.getByRole('textbox', { name: 'Region' })).toBeDisabled();
    await expect
      .element(screen.getByRole('textbox', { name: 'Workspace ID' }))
      .toHaveAttribute('readonly');
    expect(screen.container.querySelector('[data-slot="clear-button"]')).toBeNull();
    const containers = screen.container.querySelectorAll('[data-slot="container"]');
    expect(containers[0].hasAttribute('data-disabled')).toBe(true);
    expect(containers[1].hasAttribute('data-readonly')).toBe(true);
  });

  it('shows a character counter tied to the input when maxLength is set', async () => {
    const screen = await renderWithDS(
      <div>
        <TextField label="Display name" maxLength={20} defaultValue="Alex" />
        <TextField label="Team name" description="Shown to your team." maxLength={20} />
        <p id="hint">Use letters only.</p>
        <TextField label="City" aria-describedby="hint" maxLength={20} />
        <TextField label="Postcode" maxLength={8} showCounter={false} />
      </div>,
    );
    const input = screen.getByRole('textbox', { name: 'Display name' });
    await expect.element(input).toHaveAttribute('maxlength', '20');
    await expect.element(screen.getByText('4/20')).toBeInTheDocument();
    await expect.element(input).toHaveAccessibleDescription('Character count: 4 of 20');
    await input.fill('Design studio');
    await expect.element(screen.getByText('13/20')).toBeInTheDocument();
    await expect
      .element(screen.getByRole('textbox', { name: 'Team name' }))
      .toHaveAccessibleDescription('Shown to your team. Character count: 0 of 20');
    await expect
      .element(screen.getByRole('textbox', { name: 'City' }))
      .toHaveAccessibleDescription('Use letters only. Character count: 0 of 20');
    await expect
      .element(screen.getByRole('textbox', { name: 'Postcode' }))
      .not.toHaveAccessibleDescription();
    expect(screen.container.querySelectorAll('[data-slot="counter"]')).toHaveLength(3);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid w-96 gap-4 p-4">
          <TextField label="Website" startAdornment="https://" placeholder="example.com" />
          <TextField label="Parcel weight" endAdornment="kg" variant="soft" size="sm" />
          <TextField
            label="Reference"
            defaultValue="DOC-2041"
            isClearable
            startAdornment={<SearchIcon />}
            size="lg"
          />
          <TextField label="Display name" maxLength={32} description="Shown to your team." />
          <TextField label="Access code" isInvalid errorMessage="This code has 2 digits too few." />
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
