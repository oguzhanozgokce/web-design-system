import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { CalendarIcon, FilterIcon, ScheduleIcon } from '@/registry/ds/lib/icons';
import { AssistChip, Chip, ChipGroup, FilterChip } from '@/registry/ds/ui/chip';

const still = { provider: { motion: 'disabled' as const } };

const statuses = [
  { id: 'paid', name: 'Paid' },
  { id: 'pending', name: 'Pending' },
  { id: 'overdue', name: 'Overdue' },
];

function Labels({ initial }: { initial: string[] }) {
  const [labels, setLabels] = useState(initial.map((name) => ({ id: name, name })));
  return (
    <ChipGroup
      aria-label="Labels"
      items={labels}
      onRemove={(keys) => setLabels((current) => current.filter((item) => !keys.has(item.id)))}
      renderEmptyState={() => 'No labels'}
    >
      {(item) => <Chip id={item.id}>{item.name}</Chip>}
    </ChipGroup>
  );
}

describe('ChipGroup', () => {
  it('renders a labelled grid of chips', async () => {
    const screen = await renderWithDS(
      <ChipGroup label="Status" description="Filter invoices by status">
        <Chip id="paid">Paid</Chip>
        <Chip id="overdue">Overdue</Chip>
      </ChipGroup>,
    );
    const grid = screen.getByRole('grid', { name: 'Status' });
    await expect.element(grid).toBeVisible();
    await expect.element(grid).toHaveAccessibleDescription('Filter invoices by status');
    const chip = screen.getByRole('row', { name: 'Paid' });
    await expect.element(chip).toHaveAttribute('data-variant', 'outlined');
    await expect.element(chip).toHaveAttribute('data-size', 'md');
    expect(chip.element().className).not.toContain('state-layer');
  });

  it('selects several chips in multiple mode and shows a check', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <ChipGroup
        aria-label="Status"
        selectionMode="multiple"
        items={statuses}
        onSelectionChange={onSelectionChange}
      >
        {(item) => <Chip id={item.id}>{item.name}</Chip>}
      </ChipGroup>,
      still,
    );
    const paid = screen.getByRole('row', { name: 'Paid' });
    const overdue = screen.getByRole('row', { name: 'Overdue' });
    expect(paid.element().className).toContain('state-layer');
    const check = paid.element().querySelector('[data-slot="start-icon"]');
    expect(check?.getBoundingClientRect().width).toBe(0);

    await paid.click();
    await overdue.click();
    await expect.element(paid).toHaveAttribute('aria-selected', 'true');
    await expect.element(overdue).toHaveAttribute('aria-selected', 'true');
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['paid', 'overdue']);
    expect(check?.getBoundingClientRect().width).toBeGreaterThan(17);
    expect(getComputedStyle(paid.element()).paddingInlineStart).toBe('8px');

    await paid.click();
    await expect.element(paid).toHaveAttribute('aria-selected', 'false');
    expect(getComputedStyle(paid.element()).paddingInlineStart).toBe('16px');
  });

  it('keeps one chip selected in single mode', async () => {
    function Period() {
      const [selected, setSelected] = useState<Selection>(new Set(['month']));
      return (
        <ChipGroup
          aria-label="Period"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selected}
          onSelectionChange={setSelected}
        >
          <Chip id="week">This week</Chip>
          <Chip id="month">This month</Chip>
        </ChipGroup>
      );
    }
    const screen = await renderWithDS(<Period />);
    const week = screen.getByRole('row', { name: 'This week' });
    const month = screen.getByRole('row', { name: 'This month' });
    await expect.element(month).toHaveAttribute('aria-selected', 'true');
    await week.click();
    await expect.element(week).toHaveAttribute('aria-selected', 'true');
    await expect.element(month).toHaveAttribute('aria-selected', 'false');
    await week.click();
    await expect.element(week).toHaveAttribute('aria-selected', 'true');
  });

  it('removes a chip from its remove button and from the keyboard', async () => {
    const screen = await renderWithDS(<Labels initial={['Design', 'Billing', 'Urgent']} />);
    await screen.getByRole('button', { name: 'Remove Design' }).click();
    await expect.element(screen.getByRole('row', { name: 'Design' })).not.toBeInTheDocument();

    screen.getByRole('row', { name: 'Billing' }).element().focus();
    await userEvent.keyboard('{Delete}');
    await expect.element(screen.getByRole('row', { name: 'Billing' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('row', { name: 'Urgent' })).toBeInTheDocument();
  });

  it("reaches the focused chip's remove button with Tab, then leaves the group", async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-2">
        <button type="button">Before</button>
        <Labels initial={['Design', 'Billing']} />
        <button type="button">After</button>
      </div>,
    );
    screen.getByRole('button', { name: 'Before' }).element().focus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('row', { name: 'Design' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Remove Design' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('moves focus to the next chip after its remove button is pressed', async () => {
    const screen = await renderWithDS(<Labels initial={['Design', 'Billing']} />);
    screen.getByRole('row', { name: 'Design' }).element().focus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Remove Design' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('row', { name: 'Design' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('row', { name: 'Billing' })).toHaveFocus();
  });

  it('shows a focus ring on the empty group after the last chip is removed', async () => {
    const screen = await renderWithDS(<Labels initial={['Design']} />);
    screen.getByRole('row', { name: 'Design' }).element().focus();
    await userEvent.keyboard('{Backspace}');
    const list = screen.getByRole('group', { name: 'Labels' });
    await expect.element(list).toHaveFocus();
    await expect.element(list).toHaveTextContent('No labels');
    await expect.element(list).toHaveAttribute('data-focus-visible', 'true');
    expect(getComputedStyle(list.element()).outlineStyle).toBe('solid');
    expect(getComputedStyle(list.element()).outlineWidth).toBe('3px');
  });

  it('shows a check over the avatar of a selected chip', async () => {
    const screen = await renderWithDS(
      <ChipGroup aria-label="Assignees" selectionMode="multiple" defaultSelectedKeys={['ayse']}>
        <Chip id="ayse" avatar="AD">
          Ayşe Demir
        </Chip>
        <Chip id="jonas" avatar="JW">
          Jonas Weber
        </Chip>
      </ChipGroup>,
      still,
    );
    const ayse = screen.getByRole('row', { name: 'Ayşe Demir' });
    const jonas = screen.getByRole('row', { name: 'Jonas Weber' });
    await expect.element(ayse).toHaveAttribute('aria-selected', 'true');
    const checkOpacity = (row: typeof ayse) =>
      getComputedStyle(row.element().querySelector('[data-slot="avatar-check"]')!).opacity;
    expect(checkOpacity(ayse)).toBe('1');
    expect(checkOpacity(jonas)).toBe('0');
    await jonas.click();
    await expect.element(jonas).toHaveAttribute('aria-selected', 'true');
    expect(checkOpacity(jonas)).toBe('1');
  });

  it('takes the remove label from the chip, then its group, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-2">
        <ChipGroup aria-label="Etiketler" onRemove={() => {}}>
          <Chip id="tasarim">Tasarım</Chip>
        </ChipGroup>
        <ChipGroup aria-label="Labels" onRemove={() => {}} labels={{ remove: 'Delete {label}' }}>
          <Chip id="design">Design</Chip>
          <Chip id="billing" labels={{ remove: 'Drop {label}' }}>
            Billing
          </Chip>
        </ChipGroup>
      </div>,
      { provider: { labels: { chip: { remove: '{label} öğesini kaldır' } } } },
    );
    await expect
      .element(screen.getByRole('button', { name: 'Tasarım öğesini kaldır' }))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Delete Design' })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Drop Billing' })).toBeInTheDocument();
  });

  it('moves focus with ArrowRight, Home and End', async () => {
    const screen = await renderWithDS(
      <ChipGroup aria-label="Status" selectionMode="multiple" items={statuses}>
        {(item) => <Chip id={item.id}>{item.name}</Chip>}
      </ChipGroup>,
    );
    screen.getByRole('row', { name: 'Paid' }).element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(screen.getByRole('row', { name: 'Pending' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect.element(screen.getByRole('row', { name: 'Overdue' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(screen.getByRole('row', { name: 'Paid' })).toHaveFocus();
  });

  it('moves focus to the next chip with ArrowLeft in RTL', async () => {
    const screen = await renderWithDS(
      <ChipGroup aria-label="الحالة" selectionMode="multiple" items={statuses}>
        {(item) => <Chip id={item.id}>{item.name}</Chip>}
      </ChipGroup>,
      { locale: 'ar' },
    );
    screen.getByRole('row', { name: 'Paid' }).element().focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(screen.getByRole('row', { name: 'Pending' })).toHaveFocus();
  });

  it('disables every chip when the group is disabled', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <ChipGroup
        aria-label="Status"
        selectionMode="multiple"
        isDisabled
        onSelectionChange={onSelectionChange}
      >
        <Chip id="paid">Paid</Chip>
      </ChipGroup>,
    );
    const paid = screen.getByRole('row', { name: 'Paid' });
    await expect.element(paid).toHaveAttribute('data-disabled', 'true');
    await paid.click({ force: true });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('leaves a disabled group out of the tab order', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-2">
        <button type="button">Before</button>
        <ChipGroup aria-label="Teams" selectionMode="multiple" isDisabled>
          <Chip id="finance">Finance</Chip>
          <Chip id="sales">Sales</Chip>
        </ChipGroup>
        <button type="button">After</button>
      </div>,
    );
    screen.getByRole('button', { name: 'Before' }).element().focus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('removes a selectable chip without toggling its selection', async () => {
    const onSelectionChange = vi.fn();
    function Filters() {
      const [items, setItems] = useState(statuses);
      return (
        <ChipGroup
          aria-label="Status"
          selectionMode="multiple"
          items={items}
          onSelectionChange={onSelectionChange}
          onRemove={(keys) => setItems((current) => current.filter(({ id }) => !keys.has(id)))}
        >
          {(item) => <Chip id={item.id}>{item.name}</Chip>}
        </ChipGroup>
      );
    }
    const screen = await renderWithDS(<Filters />);
    await screen.getByRole('button', { name: 'Remove Paid' }).click();
    await expect.element(screen.getByRole('row', { name: 'Paid' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('row', { name: 'Pending' })).toBeInTheDocument();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('swaps a leading icon for the check while selected', async () => {
    const screen = await renderWithDS(
      <ChipGroup aria-label="Attachments" selectionMode="multiple">
        <Chip id="documents" startIcon={<FilterIcon data-testid="icon" />}>
          Documents
        </Chip>
      </ChipGroup>,
    );
    const chip = screen.getByRole('row', { name: 'Documents' });
    await expect.element(screen.getByTestId('icon')).toBeInTheDocument();
    await chip.click();
    await expect.element(chip).toHaveAttribute('aria-selected', 'true');
    await expect.element(screen.getByTestId('icon')).not.toBeInTheDocument();
  });

  it('names the remove button from textValue, or from the chip when there is none', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const screen = await renderWithDS(
      <ChipGroup aria-label="Approvers" onRemove={() => {}}>
        <Chip id="ayse" textValue="Ayşe Demir">
          <strong>Ayşe</strong> Demir
        </Chip>
        <Chip id="jonas">
          <strong>Jonas</strong> Weber
        </Chip>
      </ChipGroup>,
    );
    await expect
      .element(screen.getByRole('button', { name: 'Remove Ayşe Demir', exact: true }))
      .toBeInTheDocument();
    const fallback = screen.getByRole('button', { name: /Jonas Weber/ });
    await expect.element(fallback).toBeInTheDocument();
    expect(fallback.element().getAttribute('aria-label')).toBe('Remove');
    warn.mockRestore();
  });

  it('runs onAction and shows a state layer on action chips', async () => {
    const onAction = vi.fn();
    const screen = await renderWithDS(
      <ChipGroup aria-label="Suggestions">
        <Chip id="overdue" onAction={onAction}>
          Show overdue invoices
        </Chip>
      </ChipGroup>,
    );
    const chip = screen.getByRole('row', { name: 'Show overdue invoices' });
    expect(chip.element().className).toContain('state-layer');
    await chip.click();
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('passes size and variant to its chips', async () => {
    const screen = await renderWithDS(
      <ChipGroup aria-label="Status" size="sm" variant="tonal">
        <Chip id="paid">Paid</Chip>
      </ChipGroup>,
    );
    const paid = screen.getByRole('row', { name: 'Paid' });
    await expect.element(paid).toHaveAttribute('data-size', 'sm');
    await expect.element(paid).toHaveAttribute('data-variant', 'tonal');
    const box = paid.element().getBoundingClientRect();
    expect(box.height).toBe(28);
    expect(getComputedStyle(paid.element()).borderTopLeftRadius).toBe('8px');
  });
});

describe('AssistChip', () => {
  it('renders a 32px button and calls onPress', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <AssistChip startIcon={<CalendarIcon />} onPress={onPress}>
        Add to calendar
      </AssistChip>,
    );
    const chip = screen.getByRole('button', { name: 'Add to calendar' });
    expect(chip.element().getBoundingClientRect().height).toBe(32);
    await chip.click();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('shows a pending state while an async onPress runs', async () => {
    let finish: () => void = () => {};
    const onPress = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const screen = await renderWithDS(
      <AssistChip startIcon={<ScheduleIcon />} onPress={onPress}>
        Remind me tomorrow
      </AssistChip>,
    );
    const chip = screen.getByRole('button', { name: 'Remind me tomorrow' });
    await chip.click();
    await expect.element(chip).toHaveAttribute('data-pending', 'true');
    await expect.element(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument();
    await chip.click({ force: true });
    expect(onPress).toHaveBeenCalledOnce();
    finish();
    await expect.element(chip).not.toHaveAttribute('data-pending');
  });
  it('shows the pending spinner over an avatar', async () => {
    const onPress = vi.fn(() => new Promise<void>(() => {}));
    const screen = await renderWithDS(
      <AssistChip avatar="AD" onPress={onPress}>
        Ask Ayşe to approve
      </AssistChip>,
    );
    const chip = screen.getByRole('button', { name: 'Ask Ayşe to approve' });
    await chip.click();
    await expect.element(chip).toHaveAttribute('data-pending', 'true');
    const progress = screen.getByRole('progressbar', { name: 'Loading' });
    await expect.element(progress).toBeInTheDocument();
    expect(chip.element().querySelector('[data-slot="avatar"]')?.contains(progress.element())).toBe(
      true,
    );
  });

  it('takes its pending label from labels, then DSProvider', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <AssistChip isPending>Remind me tomorrow</AssistChip>
        <AssistChip isPending labels={{ pending: 'Kaydediliyor' }}>
          Save
        </AssistChip>
      </div>,
      { provider: { labels: { chip: { pending: 'Yükleniyor' } } } },
    );
    await expect
      .element(screen.getByRole('progressbar', { name: 'Yükleniyor' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('progressbar', { name: 'Kaydediliyor' }))
      .toBeInTheDocument();
  });

  it('ignores presses when disabled', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <AssistChip isDisabled onPress={onPress}>
        Share with client
      </AssistChip>,
    );
    const chip = screen.getByRole('button', { name: 'Share with client' });
    await expect.element(chip).toBeDisabled();
    await expect.element(chip).toHaveAttribute('data-disabled', 'true');
    await chip.click({ force: true });
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('FilterChip', () => {
  it('toggles and swaps its icon for a check', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <FilterChip startIcon={<FilterIcon data-testid="icon" />} onChange={onChange}>
        Overdue only
      </FilterChip>,
    );
    const chip = screen.getByRole('button', { name: 'Overdue only' });
    await expect.element(chip).toHaveAttribute('aria-pressed', 'false');
    await expect.element(screen.getByTestId('icon')).toBeInTheDocument();
    await chip.click();
    await expect.element(chip).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith(true);
    await expect.element(screen.getByTestId('icon')).not.toBeInTheDocument();
  });

  it('is toggled from the keyboard and ignores presses when disabled', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <FilterChip onChange={onChange}>Unpaid</FilterChip>
        <FilterChip isDisabled onChange={onChange}>
          Archived
        </FilterChip>
      </div>,
    );
    screen.getByRole('button', { name: 'Unpaid' }).element().focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(true);
    await screen.getByRole('button', { name: 'Archived' }).click({ force: true });
    expect(onChange).toHaveBeenCalledOnce();
  });
  it('follows isSelected when controlled', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <FilterChip isSelected={false} onChange={onChange}>
        Overdue only
      </FilterChip>,
    );
    const chip = screen.getByRole('button', { name: 'Overdue only' });
    await chip.click();
    expect(onChange).toHaveBeenLastCalledWith(true);
    await expect.element(chip).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('Chip accessibility', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          {(['outlined', 'elevated', 'tonal'] as const).map((variant) => (
            <ChipGroup
              key={variant}
              aria-label={`Status ${variant}`}
              variant={variant}
              selectionMode="multiple"
              defaultSelectedKeys={['paid']}
              disabledKeys={['overdue']}
              items={statuses}
            >
              {(item) => <Chip id={item.id}>{item.name}</Chip>}
            </ChipGroup>
          ))}
          <Labels initial={['Design', 'Billing']} />
          <ChipGroup aria-label="Assignees" onRemove={() => {}}>
            <Chip id="ayse" avatar="AD">
              Ayşe Demir
            </Chip>
          </ChipGroup>
          <div className="flex flex-wrap gap-2">
            <AssistChip startIcon={<CalendarIcon />}>Add to calendar</AssistChip>
            <AssistChip variant="elevated">Share</AssistChip>
            <FilterChip defaultSelected>Overdue only</FilterChip>
            <FilterChip variant="tonal" defaultSelected>
              Mine
            </FilterChip>
            <FilterChip isDisabled>Archived</FilterChip>
          </div>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
