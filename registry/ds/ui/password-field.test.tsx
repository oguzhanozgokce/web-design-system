import { useState } from 'react';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { LockIcon } from '@/registry/ds/lib/icons';
import { PasswordField, type PasswordRule } from '@/registry/ds/ui/password-field';

const rules: PasswordRule[] = [
  { label: 'At least 12 characters', test: (value) => value.length >= 12 },
  { label: 'One number', test: (value) => /\d/.test(value) },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
];

function pressWithCapsLock(element: Element, type: 'keydown' | 'keyup', capsLock: boolean) {
  element.dispatchEvent(
    new KeyboardEvent(type, { key: 'A', bubbles: true, modifierCapsLock: capsLock }),
  );
}

async function settleAnimations() {
  const finite = document
    .getAnimations()
    .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity);
  await Promise.all(finite.map((animation) => animation.finished));
}

describe('PasswordField', () => {
  it('renders a labelled password input for signing in', async () => {
    const screen = await renderWithDS(
      <PasswordField label="Password" name="password" startAdornment={<LockIcon />} />,
    );
    const input = screen.getByLabelText('Password', { exact: true });
    await expect.element(input).toHaveAttribute('type', 'password');
    await expect.element(input).toHaveAttribute('autocomplete', 'current-password');
    await expect.element(input).toHaveAttribute('spellcheck', 'false');
    await expect.element(input).toHaveAttribute('autocapitalize', 'off');
    await expect.element(input).toHaveAttribute('name', 'password');
    expect(screen.container.querySelector('[role="meter"]')).toBeNull();
  });

  it('reveals and hides the password with a pressed toggle that keeps focus in the input', async () => {
    const onRevealChange = vi.fn();
    const screen = await renderWithDS(
      <PasswordField label="Password" onRevealChange={onRevealChange} />,
    );
    const input = screen.getByLabelText('Password', { exact: true });
    const toggle = screen.getByRole('button', { name: 'Show password' });
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect.element(toggle).toHaveAttribute('aria-controls', input.element().id);

    await input.fill('correct horse');
    await toggle.click();
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect.element(input).toHaveAttribute('type', 'text');
    await expect.element(input).toHaveValue('correct horse');
    await expect.element(input).toHaveFocus();
    expect(onRevealChange).toHaveBeenLastCalledWith(true);

    await toggle.click();
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect.element(input).toHaveAttribute('type', 'password');
  });

  it('reaches the toggle with Tab and switches it with Space', async () => {
    const screen = await renderWithDS(<PasswordField label="Password" />);
    await screen.getByLabelText('Password', { exact: true }).click();
    await userEvent.keyboard('{Tab}');
    const toggle = screen.getByRole('button', { name: 'Show password' });
    await expect.element(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('names the next action in a tooltip while the toggle keeps one accessible name', async () => {
    const screen = await renderWithDS(<PasswordField label="Password" />);
    await screen.getByLabelText('Password', { exact: true }).click();
    await userEvent.keyboard('{Tab}');
    const toggle = screen.getByRole('button', { name: 'Show password' });
    await expect.element(toggle).toHaveFocus();
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Show password');

    await userEvent.keyboard(' ');
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
    await userEvent.keyboard('{Tab}');
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Hide password');
    await expect
      .element(screen.getByRole('button', { name: 'Show password' }))
      .toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the tooltip on hover and never on a disabled toggle', async () => {
    const screen = await renderWithDS(
      <div className="grid gap-4 p-8">
        <PasswordField label="Password" defaultRevealed />
        <PasswordField label="Recovery key" isDisabled />
      </div>,
    );
    await screen.getByLabelText('Password', { exact: true }).click();
    const toggles = screen.getByRole('button', { name: 'Show password' });
    await toggles.first().hover();
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Hide password');
    await toggles.last().hover({ force: true });
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument();
  });

  it('follows a controlled reveal state', async () => {
    function Example() {
      const [isRevealed, setRevealed] = useState(true);
      return (
        <>
          <PasswordField label="API secret" isRevealed={isRevealed} onRevealChange={setRevealed} />
          <output>{isRevealed ? 'visible' : 'hidden'}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    await expect
      .element(screen.getByLabelText('API secret', { exact: true }))
      .toHaveAttribute('type', 'text');
    await screen.getByRole('button', { name: 'Show password' }).click();
    await expect.element(screen.getByText('hidden')).toBeInTheDocument();
  });

  it('hides the password again when its form is submitted', async () => {
    const screen = await renderWithDS(
      <form onSubmit={(event) => event.preventDefault()}>
        <PasswordField label="Password" defaultRevealed />
        <button type="submit">Sign in</button>
      </form>,
    );
    const input = screen.getByLabelText('Password', { exact: true });
    await expect.element(input).toHaveAttribute('type', 'text');
    await screen.getByRole('button', { name: 'Sign in' }).click();
    await expect.element(input).toHaveAttribute('type', 'password');
  });

  it('never writes the password into the DOM outside the input value', async () => {
    const secret = 'Ledger-Vault-2026';
    function Controlled() {
      const [value, setValue] = useState('');
      return <PasswordField label="Controlled" value={value} onChange={setValue} rules={rules} />;
    }
    const screen = await renderWithDS(
      <div>
        <PasswordField label="Uncontrolled" rules={rules} />
        <Controlled />
      </div>,
    );
    for (const name of ['Uncontrolled', 'Controlled']) {
      const input = screen.getByLabelText(name, { exact: true });
      await input.fill(secret);
      await expect.element(input).toHaveValue(secret);
      expect(input.element().hasAttribute('value')).toBe(false);
    }
    await screen.getByRole('button', { name: 'Show password' }).first().click();
    expect(screen.container.innerHTML).not.toContain(secret);
  });

  it('follows a controlled value set from outside', async () => {
    function Example() {
      const [value, setValue] = useState('Draft1');
      return (
        <>
          <PasswordField label="Password" value={value} onChange={setValue} rules={rules} />
          <button type="button" onClick={() => setValue('')}>
            Start over
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    const input = screen.getByLabelText('Password', { exact: true });
    await expect.element(input).toHaveValue('Draft1');
    const items = screen.container.querySelectorAll('[data-slot="rule"]');
    expect([...items].map((item) => item.hasAttribute('data-met'))).toEqual([false, true, true]);
    await screen.getByRole('button', { name: 'Start over' }).click();
    await expect.element(input).toHaveValue('');
    expect(screen.container.querySelectorAll('[data-slot="rule"][data-met]')).toHaveLength(0);
  });

  it('keeps the input in step when a controlled onChange rejects a keystroke', async () => {
    function Example() {
      const [value, setValue] = useState('Ledger');
      return (
        <PasswordField
          label="Password"
          value={value}
          onChange={(next) => setValue(next.replace(/\s/g, ''))}
        />
      );
    }
    const screen = await renderWithDS(<Example />);
    const input = screen.getByLabelText('Password', { exact: true });
    await input.click();
    await userEvent.keyboard('{End} ');
    await expect.element(input).toHaveValue('Ledger');
    await userEvent.keyboard('2026');
    await expect.element(input).toHaveValue('Ledger2026');
  });

  it('checks the rules again when they change without a keystroke', async () => {
    function Example() {
      const [name, setName] = useState('dana');
      const nameRules: PasswordRule[] = [
        { label: 'Does not contain your name', test: (value) => !value.includes(name) },
      ];
      return (
        <>
          <PasswordField label="Password" rules={nameRules} />
          <button type="button" onClick={() => setName('Ledger')}>
            Rename account
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Example />);
    await screen.getByLabelText('Password', { exact: true }).fill('Ledger-Vault-2026');
    const rule = screen.container.querySelector('[data-slot="rule"]')!;
    expect(rule.hasAttribute('data-met')).toBe(true);
    await screen.getByRole('button', { name: 'Rename account' }).click();
    await expect.poll(() => rule.hasAttribute('data-met')).toBe(false);
    await expect
      .element(screen.getByLabelText('Password', { exact: true }))
      .toHaveValue('Ledger-Vault-2026');
  });

  it('restores the default value and checklist when its form resets', async () => {
    const screen = await renderWithDS(
      <form>
        <PasswordField label="Password" rules={rules} />
        <button type="reset">Reset</button>
      </form>,
    );
    const input = screen.getByLabelText('Password', { exact: true });
    await input.fill('Ledger-Vault-2026');
    expect(screen.container.querySelectorAll('[data-slot="rule"][data-met]')).toHaveLength(3);
    await screen.getByRole('button', { name: 'Reset' }).click();
    await expect.element(input).toHaveValue('');
    expect(screen.container.querySelectorAll('[data-slot="rule"][data-met]')).toHaveLength(0);
  });

  it('checks a confirmation again when the password it matches changes', async () => {
    const onSubmit = vi.fn();
    function Example() {
      const [password, setPassword] = useState('');
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <PasswordField label="New password" value={password} onChange={setPassword} />
          <PasswordField
            label="Confirm new password"
            validate={(value) =>
              value && value !== password ? 'The passwords do not match.' : null
            }
          />
          <button type="submit">Update password</button>
        </form>
      );
    }
    const screen = await renderWithDS(<Example />);
    const password = screen.getByLabelText('New password', { exact: true });
    const confirmation = screen.getByLabelText('Confirm new password', { exact: true });
    await password.fill('Ledger-2026-spring');
    await confirmation.fill('Ledger-2026-spring');
    await password.fill('Ledger-2026-autumn');
    await screen.getByRole('button', { name: 'Update password' }).click();
    expect(onSubmit).not.toHaveBeenCalled();
    await expect.element(confirmation).toHaveAttribute('aria-invalid', 'true');
    await expect.element(confirmation).toHaveAccessibleDescription('The passwords do not match.');
    await password.fill('Ledger-2026-spring');
    await screen.getByRole('button', { name: 'Update password' }).click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('warns about Caps Lock only while the field is focused', async () => {
    const screen = await renderWithDS(<PasswordField label="Password" />);
    const input = screen.getByLabelText('Password', { exact: true });
    const announcer = screen.container.querySelector('[data-slot="caps-lock-announcer"]')!;
    expect(announcer.getAttribute('aria-live')).toBe('polite');
    await input.click();

    pressWithCapsLock(input.element(), 'keydown', true);
    await expect
      .element(screen.getByText('Caps Lock is on', { exact: true }).first())
      .toBeVisible();
    expect(announcer.textContent).toBe('Caps Lock is on');

    pressWithCapsLock(input.element(), 'keyup', false);
    await expect.poll(() => screen.container.querySelector('[data-slot="caps-lock"]')).toBeNull();
    expect(announcer.textContent).toBe('');

    pressWithCapsLock(input.element(), 'keydown', true);
    await expect
      .poll(() => screen.container.querySelector('[data-slot="caps-lock"]'))
      .not.toBeNull();
    (input.element() as HTMLInputElement).blur();
    await expect.poll(() => screen.container.querySelector('[data-slot="caps-lock"]')).toBeNull();
  });

  it('can turn the Caps Lock warning off', async () => {
    const screen = await renderWithDS(
      <PasswordField label="Password" showCapsLockWarning={false} />,
    );
    const input = screen.getByLabelText('Password', { exact: true });
    await input.click();
    pressWithCapsLock(input.element(), 'keydown', true);
    expect(screen.container.querySelector('[data-slot="caps-lock"]')).toBeNull();
    expect(screen.container.querySelector('[data-slot="caps-lock-announcer"]')).toBeNull();
  });

  it('shows a strength meter from the strength prop', async () => {
    function Example() {
      const [value, setValue] = useState('');
      return (
        <PasswordField
          label="New password"
          value={value}
          onChange={setValue}
          strength={value.length > 10 ? 3 : 1}
        />
      );
    }
    const screen = await renderWithDS(<Example />);
    const input = screen.getByLabelText('New password', { exact: true });
    await expect.element(input).toHaveAttribute('autocomplete', 'new-password');
    const meter = screen.getByRole('meter', { name: 'Password strength' });
    await expect.element(meter).toHaveAttribute('aria-valuenow', '0');
    const value = screen.container.querySelector('[data-slot="strength-value"]')!;
    expect(getComputedStyle(value).visibility).toBe('hidden');

    await input.fill('Ledger-Vault-2026');
    await expect.element(meter).toHaveAttribute('aria-valuenow', '3');
    await expect.element(meter).toHaveAttribute('aria-valuetext', 'Good');
    expect(getComputedStyle(value).visibility).toBe('visible');
    const filled = screen.container.querySelectorAll('[data-slot="strength-segment"][data-filled]');
    expect(filled).toHaveLength(3);
  });

  it('derives strength from rules and describes the input with the checklist', async () => {
    const screen = await renderWithDS(<PasswordField label="New password" rules={rules} />);
    const input = screen.getByLabelText('New password', { exact: true });
    await expect.element(input).toHaveAttribute('autocomplete', 'new-password');
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        'At least 12 characters: not met. One number: not met. One uppercase letter: not met.',
      );
    await input.fill('Ledger2026');
    await expect
      .element(input)
      .toHaveAccessibleDescription(
        'At least 12 characters: not met. One number: met. One uppercase letter: met.',
      );
    await expect
      .element(screen.getByRole('meter', { name: 'Password strength' }))
      .toHaveAttribute('aria-valuetext', 'Good');
    const items = screen.container.querySelectorAll('[data-slot="rule"]');
    expect([...items].map((item) => item.hasAttribute('data-met'))).toEqual([false, true, true]);
    await expect
      .element(screen.getByRole('list', { name: 'Password requirements' }))
      .toBeInTheDocument();
  });

  it('announces checklist and strength changes once typing pauses', async () => {
    const screen = await renderWithDS(<PasswordField label="New password" rules={rules} />);
    const input = screen.getByLabelText('New password', { exact: true });
    const announcer = screen.container.querySelector('[data-slot="announcer"]')!;
    expect(announcer.getAttribute('aria-live')).toBe('polite');
    await input.fill('Ledger');
    await expect
      .poll(() => announcer.textContent, { timeout: 3000 })
      .toBe('One uppercase letter: met. Password strength: Weak.');
    await input.fill('Ledger-Vault-2026');
    await expect
      .poll(() => announcer.textContent, { timeout: 3000 })
      .toBe('At least 12 characters: met. One number: met. Password strength: Strong.');
  });

  it('stays quiet when focus has left the field', async () => {
    const screen = await renderWithDS(
      <div>
        <PasswordField label="New password" rules={rules} />
        <button type="button">Continue</button>
      </div>,
    );
    await screen.getByLabelText('New password', { exact: true }).fill('Ledger');
    await screen.getByRole('button', { name: 'Continue' }).click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(screen.container.querySelector('[data-slot="announcer"]')!.textContent).toBe('');
  });

  it('marks invalid, required and disabled states', async () => {
    const screen = await renderWithDS(
      <div>
        <PasswordField
          label="Current password"
          isRequired
          isInvalid
          errorMessage="That password is not right."
        />
        <PasswordField label="Recovery key" isDisabled />
      </div>,
    );
    const current = screen.getByRole('textbox', { name: 'Current password' });
    await expect.element(current).toHaveAttribute('aria-invalid', 'true');
    await expect.element(current).toHaveAttribute('required');
    await expect.element(current).toHaveAccessibleDescription('That password is not right.');
    await expect.element(screen.getByLabelText('Recovery key', { exact: true })).toBeDisabled();
    await expect
      .element(screen.getByRole('button', { name: 'Show password' }).last())
      .toBeDisabled();
  });

  it('takes its text and the Field text from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div className="grid gap-4 p-8">
        <PasswordField label="Passphrase" strength={2} defaultValue="horse-battery" />
        <PasswordField
          label="Vault key"
          necessityIndicator="label"
          strength={4}
          defaultValue="Ledger-Vault-2026"
          labels={{
            showPassword: 'Show vault key',
            hidePassword: 'Hide vault key',
            strength: 'Key strength',
            strength4: 'Very strong',
            optional: '(if set)',
          }}
        />
      </div>,
      { provider: { labels: { passwordField: { showPassword: 'Show', strength: 'Strength' } } } },
    );
    await expect.element(screen.getByRole('button', { name: 'Show', exact: true })).toBeVisible();
    await expect
      .element(screen.getByRole('meter', { name: 'Strength', exact: true }))
      .toHaveAttribute('aria-valuetext', 'Fair');
    const toggle = screen.getByRole('button', { name: 'Show vault key' });
    await expect
      .element(screen.getByRole('meter', { name: 'Key strength' }))
      .toHaveAttribute('aria-valuetext', 'Very strong');
    const input = screen.getByRole('textbox', { name: 'Vault key (if set)' });
    await expect.element(input).toHaveAttribute('type', 'password');
    await toggle.click();
    await input.hover();
    await toggle.hover();
    await expect.element(page.getByRole('tooltip')).toHaveTextContent('Hide vault key');
  });

  it('words the checklist from label templates', async () => {
    const screen = await renderWithDS(
      <PasswordField
        label="New password"
        rules={rules}
        defaultValue="Ledger2026"
        labels={{
          requirements: 'Your password needs',
          ruleMet: ({ rule }) => `${rule}, done.`,
          ruleUnmet: '{rule}, still missing.',
        }}
      />,
    );
    await expect
      .element(screen.getByLabelText('New password', { exact: true }))
      .toHaveAccessibleDescription(
        'At least 12 characters, still missing. One number, done. One uppercase letter, done.',
      );
    await expect
      .element(screen.getByRole('list', { name: 'Your password needs' }))
      .toBeInTheDocument();
  });

  it('lets autoComplete override the default from rules', async () => {
    const screen = await renderWithDS(
      <PasswordField label="Password" rules={rules} autoComplete="current-password" />,
    );
    await expect
      .element(screen.getByLabelText('Password', { exact: true }))
      .toHaveAttribute('autocomplete', 'current-password');
  });

  it('renders the reveal tooltip in the page direction and language', async () => {
    const screen = await renderWithDS(<PasswordField label="كلمة المرور" />, { locale: 'ar' });
    await screen.getByLabelText('كلمة المرور', { exact: true }).click();
    await userEvent.keyboard('{Tab}');
    const tooltip = page.getByRole('tooltip');
    await expect.element(tooltip).toHaveTextContent('Show password');
    await expect.element(tooltip).toHaveAttribute('dir', 'rtl');
    await expect.element(tooltip).toHaveAttribute('lang', 'ar');
  });

  it('fills the meter from the start edge in RTL layouts', async () => {
    const screen = await renderWithDS(
      <div className="w-80">
        <PasswordField label="كلمة المرور" strength={1} defaultValue="abc" />
      </div>,
      { locale: 'ar' },
    );
    const segments = screen.container.querySelectorAll('[data-slot="strength-segment"]');
    const first = segments[0].getBoundingClientRect();
    const last = segments[3].getBoundingClientRect();
    expect(segments[0].hasAttribute('data-filled')).toBe(true);
    expect(first.left).toBeGreaterThan(last.left);
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="grid w-96 gap-4 p-4">
          <PasswordField label="Password" startAdornment={<LockIcon />} />
          <PasswordField label="New password" rules={rules} defaultValue="Ledger2026" />
          <PasswordField label="Passphrase" strength={2} defaultValue="horse" variant="filled" />
          <PasswordField label="API secret" defaultRevealed defaultValue="sk_live_51" size="lg" />
          <PasswordField label="Current password" isInvalid errorMessage="Try again." />
          <PasswordField label="Recovery key" isDisabled size="sm" />
        </div>,
        options,
      );
      const input = screen.getByLabelText('Password', { exact: true });
      await input.click();
      pressWithCapsLock(input.element(), 'keydown', true);
      await expect
        .poll(() => screen.container.querySelector('[data-slot="caps-lock"]'))
        .not.toBeNull();
      await settleAnimations();
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });

  it('has no accessibility violations with the tooltip open in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      document.documentElement.classList.toggle('dark', 'dark' in options);
      const screen = await renderWithDS(
        <div className="w-96 p-16">
          <PasswordField label="Password" defaultRevealed defaultValue="Ledger-Vault-2026" />
        </div>,
        options,
      );
      await screen.getByLabelText('Password', { exact: true }).click();
      await userEvent.keyboard('{Tab}');
      await expect.element(page.getByRole('tooltip')).toBeVisible();
      await settleAnimations();
      await expectNoA11yViolations(document.body);
      await screen.unmount();
    }
    document.documentElement.classList.remove('dark');
  });
});
