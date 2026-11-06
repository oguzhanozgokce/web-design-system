import { Component, useState, type ReactNode } from 'react';
import { GridList, GridListItem } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Checkbox, CheckboxGroup, SelectAllCheckbox } from '@/registry/ds/ui/checkbox';

function part(slot: string, root: ParentNode = document) {
  return root.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
}

class CaughtError extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }

  render() {
    return this.state.message != null ? (
      <p role="alert">{this.state.message}</p>
    ) : (
      this.props.children
    );
  }
}

describe('Checkbox', () => {
  it('renders an accessible checkbox that toggles on click', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <Checkbox onChange={onChange}>Email me when an project is overdue</Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Email me when an project is overdue' });
    await expect.element(checkbox).not.toBeChecked();

    await screen.getByText('Email me when an project is overdue').click();
    await expect.element(checkbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(part('checkbox')?.hasAttribute('data-selected')).toBe(true);
  });

  it('toggles from anywhere in the 40px state layer', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <div className="p-6">
        <Checkbox aria-label="Select DOC-2041" onChange={onChange} />
      </div>,
    );
    const layer = part('state-layer')!;
    expect(layer.getBoundingClientRect().width).toBe(40);
    expect(part('box')!.getBoundingClientRect().width).toBe(18);

    await page.elementLocator(layer).click({ position: { x: 4, y: 20 } });
    await expect.element(screen.getByRole('checkbox', { name: 'Select DOC-2041' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('toggles with the keyboard', async () => {
    const screen = await renderWithDS(<Checkbox>Send message reminders</Checkbox>);
    const checkbox = screen.getByRole('checkbox', { name: 'Send message reminders' });

    await userEvent.tab();
    await expect.element(checkbox).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await expect.element(checkbox).toBeChecked();
    expect(part('state-layer')?.hasAttribute('data-focus-visible')).toBe(true);
  });

  it('keeps the description out of the name and announces it as a description', async () => {
    const screen = await renderWithDS(
      <Checkbox description="Followers get a reminder three days before the due date.">
        Send message reminders
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    await expect.element(checkbox).toHaveAccessibleName('Send message reminders');
    await expect
      .element(checkbox)
      .toHaveAccessibleDescription('Followers get a reminder three days before the due date.');

    await screen.getByText('Followers get a reminder three days before the due date.').click();
    await expect.element(checkbox).toBeChecked();
  });

  it('keeps an explicit aria-label when a description is present', async () => {
    const screen = await renderWithDS(
      <Checkbox aria-label="Message reminders for Riverside" description="Three days before.">
        Reminders
      </Checkbox>,
    );
    await expect
      .element(screen.getByRole('checkbox'))
      .toHaveAccessibleName('Message reminders for Riverside');
  });

  it('supports controlled and indeterminate state', async () => {
    function Controlled() {
      const [selected, setSelected] = useState(false);
      return (
        <Checkbox
          aria-label="Select all projects"
          isSelected={selected}
          isIndeterminate={!selected}
          onChange={setSelected}
        />
      );
    }
    const screen = await renderWithDS(<Controlled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Select all projects' });

    await expect.element(checkbox).toBePartiallyChecked();
    expect(part('box')?.getAttribute('data-state')).toBe('indeterminate');

    await checkbox.click({ force: true });
    await expect.element(checkbox).toBeChecked();
    expect(part('box')?.getAttribute('data-state')).toBe('checked');
  });

  it.each([
    ['system', 'stroke-dashoffset'],
    ['reduced', 'none'],
  ] as const)('draws the check mark with motion %s', async (motion, transitionProperty) => {
    await renderWithDS(<Checkbox defaultSelected>Uploads</Checkbox>, { provider: { motion } });
    const path = document.querySelector('[data-slot="box"] path')!;
    expect(getComputedStyle(path).transitionProperty).toBe(transitionProperty);
    expect(getComputedStyle(path).strokeDashoffset).toBe('0px');
  });

  it('does not toggle when disabled or read-only', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <>
        <Checkbox isDisabled onChange={onChange}>
          Archive closed folders
        </Checkbox>
        <Checkbox isReadOnly onChange={onChange}>
          Lock the March period
        </Checkbox>
      </>,
    );
    const disabled = screen.getByRole('checkbox', { name: 'Archive closed folders' });
    await expect.element(disabled).toBeDisabled();
    await screen.getByText('Archive closed folders').click({ force: true });
    await screen.getByText('Lock the March period').click();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(disabled).not.toBeChecked();
    await expect
      .element(screen.getByRole('checkbox', { name: 'Lock the March period' }))
      .not.toBeChecked();
  });

  it('keeps the click target to the box and its text', async () => {
    const onChange = vi.fn();
    await renderWithDS(
      <div style={{ width: 600 }}>
        <Checkbox onChange={onChange}>Send message reminders</Checkbox>
      </div>,
    );
    expect(part('target')!.getBoundingClientRect().width).toBeLessThan(300);

    await page.elementLocator(part('checkbox')!).click({ position: { x: 580, y: 12 } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('marks a required checkbox without adding the asterisk to its name', async () => {
    const screen = await renderWithDS(
      <Checkbox isRequired>I accept the data processing agreement</Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox', {
      name: 'I accept the data processing agreement',
      exact: true,
    });
    await expect.element(checkbox).toBeRequired();
    expect(part('required')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('works as the selection checkbox of a React Aria GridList', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <GridList
        aria-label="Open projects"
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      >
        <GridListItem id="DOC-2041" textValue="DOC-2041">
          <Checkbox slot="selection" />
          DOC-2041
        </GridListItem>
        <GridListItem id="DOC-2042" textValue="DOC-2042">
          <Checkbox slot="selection" />
          DOC-2042
        </GridListItem>
      </GridList>,
    );
    const checkboxes = screen.getByRole('checkbox');
    expect(checkboxes.elements()).toHaveLength(2);

    await screen.getByText('DOC-2042').click();
    await expect.element(checkboxes.nth(1)).toBeChecked();
    await expect.element(checkboxes.nth(0)).not.toBeChecked();

    await checkboxes.nth(0).click({ force: true });
    await expect.element(checkboxes.nth(0)).toBeChecked();
    expect([...onSelectionChange.mock.lastCall![0]].sort()).toEqual(['DOC-2041', 'DOC-2042']);
  });

  it('shows an error message when invalid', async () => {
    const screen = await renderWithDS(
      <Checkbox isInvalid isRequired errorMessage="Accept the agreement to continue.">
        I accept the data processing agreement
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    await expect.element(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect.element(screen.getByText('Accept the agreement to continue.')).toBeVisible();
    await expect.element(checkbox).toHaveAccessibleDescription('Accept the agreement to continue.');
    await expect.element(checkbox).toHaveAccessibleName('I accept the data processing agreement');
    expect(part('checkbox')?.hasAttribute('data-invalid')).toBe(true);
  });
});

describe('CheckboxGroup', () => {
  it('labels the group and reports the selected values', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <CheckboxGroup
        label="Weekly digest"
        description="Sent every Monday."
        defaultValue={['uploads']}
        onChange={onChange}
      >
        <Checkbox value="uploads">Uploads</Checkbox>
        <Checkbox value="refunds">Refunds</Checkbox>
      </CheckboxGroup>,
    );
    const group = screen.getByRole('group', { name: 'Weekly digest' });
    await expect.element(group).toHaveAccessibleDescription('Sent every Monday.');
    await expect.element(group).toHaveAttribute('data-orientation', 'vertical');

    await screen.getByText('Refunds').click();
    expect(onChange).toHaveBeenLastCalledWith(['uploads', 'refunds']);
    await screen.getByText('Uploads').click();
    expect(onChange).toHaveBeenLastCalledWith(['refunds']);
  });

  it('supports a controlled value', async () => {
    function Controlled() {
      const [value, setValue] = useState<string[]>(['email']);
      return (
        <>
          <CheckboxGroup label="Upload alerts" value={value} onChange={setValue}>
            <Checkbox value="email">Email</Checkbox>
            <Checkbox value="sms">Text message</Checkbox>
          </CheckboxGroup>
          <output>{value.join(',')}</output>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    await expect.element(screen.getByRole('checkbox', { name: 'Email' })).toBeChecked();
    await screen.getByText('Text message').click();
    await expect.element(screen.getByRole('status')).toHaveTextContent('email,sms');
    await screen.getByText('Email').click();
    await expect.element(screen.getByRole('status')).toHaveTextContent('sms');
  });

  it('shows the group error and marks the group invalid', async () => {
    const screen = await renderWithDS(
      <CheckboxGroup
        label="Upload alerts"
        isInvalid
        isRequired
        errorMessage="Pick at least one channel."
        orientation="horizontal"
      >
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">Text message</Checkbox>
      </CheckboxGroup>,
    );
    const group = screen.getByRole('group', { name: 'Upload alerts' });
    await expect.element(group).toHaveAttribute('data-invalid', 'true');
    await expect.element(group).toHaveAttribute('data-orientation', 'horizontal');
    await expect.element(screen.getByText('Pick at least one channel.')).toBeVisible();
    const email = screen.getByRole('checkbox', { name: 'Email' });
    await expect.element(email).toHaveAttribute('aria-invalid', 'true');
    await expect.element(email).toHaveAccessibleDescription('Pick at least one channel.');
  });

  it('selects and clears every enabled option with SelectAllCheckbox', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <CheckboxGroup label="Permissions" defaultValue={['view']} onChange={onChange}>
        <SelectAllCheckbox />
        <Checkbox value="view">View folders</Checkbox>
        <Checkbox value="edit">Edit entries</Checkbox>
        <Checkbox value="sharing" isDisabled>
          Manage sharing
        </Checkbox>
        <Checkbox value="audit" isReadOnly>
          Read the audit log
        </Checkbox>
      </CheckboxGroup>,
    );
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' });
    await expect.element(selectAll).toBePartiallyChecked();
    expect(document.querySelector('[data-select-all]')?.getAttribute('data-slot')).toBe('checkbox');

    await screen.getByText('Select all').click();
    expect(onChange).toHaveBeenLastCalledWith(['view', 'edit']);
    await expect.element(selectAll).toBeChecked();
    await expect.element(screen.getByRole('checkbox', { name: 'Edit entries' })).toBeChecked();
    await expect
      .element(screen.getByRole('checkbox', { name: 'Manage sharing' }))
      .not.toBeChecked();
    await expect
      .element(screen.getByRole('checkbox', { name: 'Read the audit log' }))
      .not.toBeChecked();

    await screen.getByText('Select all').click();
    expect(onChange).toHaveBeenLastCalledWith([]);
    await expect.element(selectAll).not.toBeChecked();

    await screen.getByText('View folders').click();
    await expect.element(selectAll).toBePartiallyChecked();
  });

  it('turns SelectAllCheckbox to the error colour with its group', async () => {
    const screen = await renderWithDS(
      <CheckboxGroup label="Upload alerts" isInvalid errorMessage="Pick at least one channel.">
        <SelectAllCheckbox />
        <Checkbox value="email">Email</Checkbox>
      </CheckboxGroup>,
    );
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' });
    await expect.element(selectAll).toHaveAttribute('aria-invalid', 'true');
    const selectAllRoot = document.querySelector<HTMLElement>('[data-select-all]')!;
    expect(selectAllRoot.hasAttribute('data-invalid')).toBe(true);
    expect(getComputedStyle(part('box', selectAllRoot)!).borderColor).toBe(
      getComputedStyle(
        part('box', screen.getByText('Email').element().closest('[data-slot="checkbox"]')!)!,
      ).borderColor,
    );
    expect(part('error', selectAllRoot)).toBeNull();
  });

  it('refuses to render SelectAllCheckbox outside a CheckboxGroup', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const screen = await renderWithDS(
      <CaughtError>
        <SelectAllCheckbox />
      </CaughtError>,
    );
    await expect
      .element(screen.getByRole('alert'))
      .toHaveTextContent('SelectAllCheckbox must be rendered inside a CheckboxGroup.');
    expect(screen.container.querySelector('input[type="checkbox"]')).toBeNull();
    consoleError.mockRestore();
  });

  it('names SelectAllCheckbox "Select all" by default', async () => {
    const screen = await renderWithDS(
      <CheckboxGroup label="Permissions">
        <SelectAllCheckbox />
        <Checkbox value="view">View folders</Checkbox>
      </CheckboxGroup>,
    );
    await expect.element(screen.getByRole('checkbox', { name: 'Select all' })).toBeInTheDocument();
  });

  it('takes the select-all label from children, then labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <>
        <CheckboxGroup label="Permissions">
          <SelectAllCheckbox />
          <Checkbox value="view">View folders</Checkbox>
        </CheckboxGroup>
        <CheckboxGroup label="Columns">
          <SelectAllCheckbox labels={{ selectAll: 'Show every column' }} />
          <Checkbox value="amount">Amount</Checkbox>
        </CheckboxGroup>
        <CheckboxGroup label="Upload alerts">
          <SelectAllCheckbox labels={{ selectAll: 'Show every column' }}>
            Every channel
          </SelectAllCheckbox>
          <Checkbox value="email">Email</Checkbox>
        </CheckboxGroup>
      </>,
      { provider: { labels: { checkbox: { selectAll: 'Select every permission' } } } },
    );
    await expect
      .element(screen.getByRole('checkbox', { name: 'Select every permission' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('checkbox', { name: 'Show every column' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('checkbox', { name: 'Every channel' }))
      .toBeInTheDocument();
    expect(screen.container.textContent).not.toContain('Select all');
  });

  it.each([
    ['light', {}],
    ['dark', { dark: true }],
    ['RTL', { locale: 'ar' }],
  ])('has no accessibility violations in %s', async (_, options) => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-6 p-6">
        <Checkbox defaultSelected description="Three days before the due date.">
          Send message reminders
        </Checkbox>
        <Checkbox isIndeterminate>Sync every team account</Checkbox>
        <Checkbox isInvalid errorMessage="Accept the agreement to continue.">
          I accept the agreement
        </Checkbox>
        <Checkbox isDisabled defaultSelected>
          Two-factor sign-in
        </Checkbox>
        <Checkbox isDisabled>Archive closed folders</Checkbox>
        <CheckboxGroup
          label="Weekly digest"
          description="Sent every Monday."
          defaultValue={['uploads']}
          isRequired
        >
          <SelectAllCheckbox />
          <Checkbox value="uploads">Uploads</Checkbox>
          <Checkbox value="refunds" description="Includes disputes.">
            Refunds
          </Checkbox>
        </CheckboxGroup>
        <CheckboxGroup
          label="Upload alerts"
          orientation="horizontal"
          isInvalid
          errorMessage="Pick at least one channel."
        >
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">Text message</Checkbox>
        </CheckboxGroup>
      </div>,
      options,
    );
    await expect.element(screen.getByRole('checkbox', { name: 'Uploads' })).toBeChecked();
    expect(screen.container.querySelectorAll('input[type="checkbox"]')).toHaveLength(10);
    await expectNoA11yViolations(screen.container);
  });
});
