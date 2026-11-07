import { Component, useState, type ReactNode } from 'react';
import { GridList, GridListItem } from 'react-aria-components';
import { page, userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Checkbox, CheckboxGroup, SelectAllCheckbox } from '@/registry/ds/ui/checkbox';

function part(slot: string, root: ParentNode = document) {
  return root.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
}

function parts(slot: string, root: ParentNode = document) {
  return [...root.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`)];
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
  it('renders an accessible checkbox that toggles on click and rings the box from the keyboard', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <Checkbox onChange={onChange}>Email me when a project is due</Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Email me when a project is due' });
    await expect.element(checkbox).not.toBeChecked();

    await userEvent.tab();
    await expect.element(checkbox).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await expect.element(checkbox).toBeChecked();
    const box = part('box')!;
    expect(box.hasAttribute('data-focus-visible')).toBe(true);
    expect(parseFloat(getComputedStyle(box).outlineWidth)).toBeGreaterThan(0);

    await screen.getByText('Email me when a project is due').click();
    await expect.element(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);
    await screen.getByText('Email me when a project is due').click();
    await expect.element(checkbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(part('checkbox')?.hasAttribute('data-selected')).toBe(true);
    expect(part('checkbox')?.getAttribute('data-size')).toBe('md');
  });

  it('gives an unlabelled checkbox a target larger than its box', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <div data-testid="frame" className="w-fit p-6">
        <Checkbox aria-label="Select Photo.jpg" onChange={onChange} />
      </div>,
    );
    const box = part('box')!.getBoundingClientRect();
    expect(box.width).toBe(18);
    const frame = screen.getByTestId('frame');
    const origin = frame.element().getBoundingClientRect();

    await frame.click({
      position: { x: box.left - origin.left - 3, y: box.top - origin.top + box.height / 2 },
    });
    await expect.element(screen.getByRole('checkbox', { name: 'Select Photo.jpg' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('sizes the box at 16 and 18 pixels and takes the size from its group', async () => {
    const screen = await renderWithDS(
      <>
        <Checkbox size="sm">Compact</Checkbox>
        <Checkbox>Default</Checkbox>
        <CheckboxGroup label="Columns" size="sm">
          <Checkbox value="name">Name</Checkbox>
        </CheckboxGroup>
      </>,
    );
    await expect.element(screen.getByRole('checkbox', { name: 'Name' })).toBeInTheDocument();
    expect(parts('box').map((box) => box.getBoundingClientRect().width)).toEqual([16, 18, 16]);
    expect(parts('checkbox').map((root) => root.getAttribute('data-size'))).toEqual([
      'sm',
      'md',
      'sm',
    ]);
  });

  it('fills a checked box with the solid primary and an invalid one with the solid error', async () => {
    const screen = await renderWithDS(
      <>
        <span data-testid="primary" className="bg-primary-solid" />
        <span data-testid="error" className="bg-error-solid" />
        <Checkbox defaultSelected>Photos</Checkbox>
        <Checkbox defaultSelected isInvalid>
          Videos
        </Checkbox>
        <Checkbox>Music</Checkbox>
      </>,
      { provider: { motion: 'disabled' } },
    );
    await userEvent.unhover(screen.getByText('Videos'));
    const fill = (testId: string) =>
      getComputedStyle(screen.getByTestId(testId).element()).backgroundColor;
    const [photos, videos, music] = parts('box');
    expect(getComputedStyle(photos, '::before').backgroundColor).toBe(fill('primary'));
    expect(getComputedStyle(photos, '::before').opacity).toBe('1');
    expect(getComputedStyle(videos, '::before').backgroundColor).toBe(fill('error'));
    expect(getComputedStyle(music, '::before').opacity).toBe('0');
  });

  it('keeps the description out of the name and announces it as a description', async () => {
    const screen = await renderWithDS(
      <Checkbox description="Members get a reminder three days before the due date.">
        Send reminders
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    await expect.element(checkbox).toHaveAccessibleName('Send reminders');
    await expect
      .element(checkbox)
      .toHaveAccessibleDescription('Members get a reminder three days before the due date.');

    await screen.getByText('Members get a reminder three days before the due date.').click();
    await expect.element(checkbox).toBeChecked();
    await screen.unmount();

    const labelled = await renderWithDS(
      <Checkbox aria-label="Reminders for the Design team" description="Three days before.">
        Reminders
      </Checkbox>,
    );
    await expect
      .element(labelled.getByRole('checkbox'))
      .toHaveAccessibleName('Reminders for the Design team');
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

  it('keeps the click target to the box and its text', async () => {
    const onChange = vi.fn();
    await renderWithDS(
      <div style={{ width: 600 }}>
        <Checkbox onChange={onChange}>Send reminders</Checkbox>
      </div>,
    );
    expect(part('target')!.getBoundingClientRect().width).toBeLessThan(300);
    expect(getComputedStyle(part('target')!).cursor).toBe('pointer');

    await page.elementLocator(part('checkbox')!).click({ position: { x: 580, y: 10 } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('marks a required checkbox without adding the asterisk to its name', async () => {
    const screen = await renderWithDS(<Checkbox isRequired>I accept the terms</Checkbox>);
    const checkbox = screen.getByRole('checkbox', { name: 'I accept the terms', exact: true });
    await expect.element(checkbox).toBeRequired();
    expect(part('required')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('works as the selection checkbox of a React Aria GridList', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <GridList aria-label="Photos" selectionMode="multiple" onSelectionChange={onSelectionChange}>
        <GridListItem id="beach" textValue="Beach">
          <Checkbox slot="selection" />
          Beach
        </GridListItem>
        <GridListItem id="forest" textValue="Forest">
          <Checkbox slot="selection" />
          Forest
        </GridListItem>
      </GridList>,
    );
    const checkboxes = screen.getByRole('checkbox');
    expect(checkboxes.elements()).toHaveLength(2);

    await screen.getByText('Forest').click();
    await expect.element(checkboxes.nth(1)).toBeChecked();
    await expect.element(checkboxes.nth(0)).not.toBeChecked();

    await checkboxes.nth(0).click({ force: true });
    await expect.element(checkboxes.nth(0)).toBeChecked();
    expect([...onSelectionChange.mock.lastCall![0]].sort()).toEqual(['beach', 'forest']);
  });

  it('shows an error message when invalid', async () => {
    const screen = await renderWithDS(
      <Checkbox isInvalid isRequired errorMessage="Accept the terms to continue.">
        I accept the terms
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    await expect.element(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect.element(screen.getByText('Accept the terms to continue.')).toBeVisible();
    await expect.element(checkbox).toHaveAccessibleDescription('Accept the terms to continue.');
    await expect.element(checkbox).toHaveAccessibleName('I accept the terms');
    expect(part('checkbox')?.hasAttribute('data-invalid')).toBe(true);
  });
});

describe('CheckboxGroup', () => {
  it('labels the group and reports the selected values', async () => {
    const onChange = vi.fn();
    function Digest() {
      const [value, setValue] = useState(['uploads']);
      return (
        <CheckboxGroup
          label="Weekly digest"
          description="Sent every Monday."
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
        >
          <Checkbox value="uploads">Uploads</Checkbox>
          <Checkbox value="comments">Comments</Checkbox>
        </CheckboxGroup>
      );
    }
    const screen = await renderWithDS(<Digest />);
    const group = screen.getByRole('group', { name: 'Weekly digest' });
    await expect.element(group).toHaveAccessibleDescription('Sent every Monday.');
    await expect.element(group).toHaveAttribute('data-orientation', 'vertical');
    const uploads = screen.getByRole('checkbox', { name: 'Uploads' });
    await expect.element(uploads).toBeChecked();

    await screen.getByText('Comments').click();
    expect(onChange).toHaveBeenLastCalledWith(['uploads', 'comments']);
    await expect.element(screen.getByRole('checkbox', { name: 'Comments' })).toBeChecked();
    await screen.getByText('Uploads').click();
    expect(onChange).toHaveBeenLastCalledWith(['comments']);
    await expect.element(uploads).not.toBeChecked();
  });

  it('shows the group error and marks the group invalid', async () => {
    const screen = await renderWithDS(
      <CheckboxGroup
        label="Alerts"
        isInvalid
        isRequired
        errorMessage="Pick at least one channel."
        orientation="horizontal"
      >
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">Text message</Checkbox>
      </CheckboxGroup>,
    );
    const group = screen.getByRole('group', { name: 'Alerts' });
    await expect.element(group).toHaveAttribute('data-invalid', 'true');
    await expect.element(group).toHaveAttribute('data-orientation', 'horizontal');
    await expect.element(screen.getByText('Pick at least one channel.')).toBeVisible();
    const email = screen.getByRole('checkbox', { name: 'Email' });
    await expect.element(email).toHaveAttribute('aria-invalid', 'true');
    await expect.element(email).toHaveAccessibleDescription('Pick at least one channel.');
  });

  it('dims the header of a disabled group once, not twice', async () => {
    await renderWithDS(
      <CheckboxGroup label="Alerts" isDisabled>
        <Checkbox value="email">Email</Checkbox>
      </CheckboxGroup>,
    );
    expect(getComputedStyle(part('header')!).opacity).toBe('0.5');
    expect(getComputedStyle(part('items')!).opacity).toBe('1');
    expect(getComputedStyle(part('target')!).opacity).toBe('0.5');
  });

  it('selects and clears every enabled option with SelectAllCheckbox', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <CheckboxGroup label="Permissions" defaultValue={['view']} onChange={onChange}>
        <SelectAllCheckbox />
        <Checkbox value="view">View folders</Checkbox>
        <Checkbox value="edit">Edit files</Checkbox>
        <Checkbox value="sharing" isDisabled>
          Manage sharing
        </Checkbox>
        <Checkbox value="history" isReadOnly>
          See version history
        </Checkbox>
      </CheckboxGroup>,
    );
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' });
    await expect.element(selectAll).toBePartiallyChecked();
    expect(document.querySelector('[data-select-all]')?.getAttribute('data-slot')).toBe('checkbox');

    await screen.getByText('Select all').click();
    expect(onChange).toHaveBeenLastCalledWith(['view', 'edit']);
    await expect.element(selectAll).toBeChecked();
    await expect.element(screen.getByRole('checkbox', { name: 'Edit files' })).toBeChecked();
    await expect
      .element(screen.getByRole('checkbox', { name: 'Manage sharing' }))
      .not.toBeChecked();
    await expect
      .element(screen.getByRole('checkbox', { name: 'See version history' }))
      .not.toBeChecked();

    await screen.getByText('Select all').click();
    expect(onChange).toHaveBeenLastCalledWith([]);
    await expect.element(selectAll).not.toBeChecked();

    await screen.getByText('View folders').click();
    await expect.element(selectAll).toBePartiallyChecked();
  });

  it('turns SelectAllCheckbox to the error colour with its group', async () => {
    const screen = await renderWithDS(
      <CheckboxGroup label="Alerts" isInvalid errorMessage="Pick at least one channel.">
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

  it('takes the select-all label from children, then labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <>
        <CheckboxGroup label="Permissions">
          <SelectAllCheckbox />
          <Checkbox value="view">View folders</Checkbox>
        </CheckboxGroup>
        <CheckboxGroup label="Columns">
          <SelectAllCheckbox labels={{ selectAll: 'Show every column' }} />
          <Checkbox value="size">Size</Checkbox>
        </CheckboxGroup>
        <CheckboxGroup label="Alerts">
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
          Send reminders
        </Checkbox>
        <Checkbox isIndeterminate>Sync every team folder</Checkbox>
        <Checkbox isInvalid errorMessage="Accept the terms to continue.">
          I accept the terms
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
          <Checkbox value="comments" description="Includes replies.">
            Comments
          </Checkbox>
        </CheckboxGroup>
        <CheckboxGroup
          label="Alerts"
          orientation="horizontal"
          size="sm"
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
