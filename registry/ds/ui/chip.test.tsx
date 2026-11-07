import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { CalendarIcon, FilterIcon, ScheduleIcon } from '@/registry/ds/lib/icons';
import { AssistChip, Chip, ChipGroup, FilterChip } from '@/registry/ds/ui/chip';

const still = { provider: { motion: 'disabled' as const } };

const statuses = [
  { id: 'active', name: 'Active' },
  { id: 'draft', name: 'Draft' },
  { id: 'archived', name: 'Archived' },
];

function probe(className: string, property: 'backgroundColor' | 'color' = 'backgroundColor') {
  const element = document.createElement('span');
  element.className = className;
  document.querySelector('[data-testid="ds-root"]')!.append(element);
  const value = getComputedStyle(element)[property];
  element.remove();
  return value;
}

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
      <ChipGroup label="Status" description="Filter projects by status">
        <Chip id="active">Active</Chip>
        <Chip id="archived">Archived</Chip>
        <Chip id="recent" onAction={() => {}}>
          Show recent projects
        </Chip>
      </ChipGroup>,
    );
    const grid = screen.getByRole('grid', { name: 'Status' });
    await expect.element(grid).toBeVisible();
    await expect.element(grid).toHaveAccessibleDescription('Filter projects by status');
    const chip = screen.getByRole('row', { name: 'Active' });
    await expect.element(chip).toHaveAttribute('data-variant', 'soft');
    await expect.element(chip).toHaveAttribute('data-size', 'md');
    const style = getComputedStyle(chip.element());
    expect(style.cursor).toBe('default');
    expect(style.height).toBe('32px');
    expect(style.borderTopLeftRadius).toBe('9999px');
    expect(style.backgroundColor).toBe(probe('bg-neutral-soft'));
    expect(
      getComputedStyle(screen.getByRole('row', { name: 'Show recent projects' }).element()).cursor,
    ).toBe('pointer');
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
    const active = screen.getByRole('row', { name: 'Active' });
    const archived = screen.getByRole('row', { name: 'Archived' });
    expect(getComputedStyle(active.element()).cursor).toBe('pointer');
    const check = active.element().querySelector('[data-slot="start-icon"]');
    expect(check?.getBoundingClientRect().width).toBe(0);

    await active.click();
    await archived.click();
    await expect.element(active).toHaveAttribute('aria-selected', 'true');
    await expect.element(archived).toHaveAttribute('aria-selected', 'true');
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['active', 'archived']);
    expect(check?.getBoundingClientRect().width).toBe(22);
    await expect
      .poll(() => getComputedStyle(active.element()).color)
      .toBe(probe('text-on-primary-soft', 'color'));
    await userEvent.unhover(active);
    await expect
      .poll(() => getComputedStyle(active.element()).backgroundColor)
      .toBe(probe('bg-primary-soft'));

    await active.click();
    await expect.element(active).toHaveAttribute('aria-selected', 'false');
    expect(check?.getBoundingClientRect().width).toBe(0);
  });

  it('removes a chip from its remove button', async () => {
    const screen = await renderWithDS(<Labels initial={['Design', 'Sharing']} />);
    await screen.getByRole('button', { name: 'Remove Design' }).click();
    await expect.element(screen.getByRole('row', { name: 'Design' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('row', { name: 'Sharing' })).toBeInTheDocument();
  });

  it('tabs to the remove button, then moves focus to the next chip once it is pressed', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-2">
        <button type="button">Before</button>
        <Labels initial={['Design', 'Sharing']} />
        <button type="button">After</button>
      </div>,
    );
    screen.getByRole('button', { name: 'Before' }).element().focus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('row', { name: 'Design' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Remove Design' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('row', { name: 'Design' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('row', { name: 'Sharing' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Remove Sharing' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
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
    expect(getComputedStyle(list.element()).outlineWidth).toBe('2px');
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
          <Chip id="sharing" labels={{ remove: 'Drop {label}' }}>
            Sharing
          </Chip>
        </ChipGroup>
      </div>,
      { provider: { labels: { chip: { remove: '{label} öğesini kaldır' } } } },
    );
    await expect
      .element(screen.getByRole('button', { name: 'Tasarım öğesini kaldır' }))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Delete Design' })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Drop Sharing' })).toBeInTheDocument();
  });

  it('disables every chip when the group is disabled', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <div className="flex flex-col gap-2">
        <button type="button">Before</button>
        <ChipGroup
          aria-label="Status"
          selectionMode="multiple"
          isDisabled
          onSelectionChange={onSelectionChange}
        >
          <Chip id="active">Active</Chip>
          <Chip id="draft">Draft</Chip>
        </ChipGroup>
        <button type="button">After</button>
      </div>,
    );
    const active = screen.getByRole('row', { name: 'Active' });
    await expect.element(active).toHaveAttribute('data-disabled', 'true');
    expect(getComputedStyle(active.element()).opacity).toBe('0.5');
    expect(getComputedStyle(active.element()).cursor).toBe('not-allowed');
    await active.click({ force: true });
    expect(onSelectionChange).not.toHaveBeenCalled();
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
    await screen.getByRole('button', { name: 'Remove Active' }).click();
    await expect.element(screen.getByRole('row', { name: 'Active' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('row', { name: 'Draft' })).toBeInTheDocument();
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

  it('passes size and variant to its chips', async () => {
    const screen = await renderWithDS(
      <ChipGroup aria-label="Status" size="sm" variant="outline">
        <Chip id="active">Active</Chip>
      </ChipGroup>,
    );
    const active = screen.getByRole('row', { name: 'Active' });
    await expect.element(active).toHaveAttribute('data-size', 'sm');
    await expect.element(active).toHaveAttribute('data-variant', 'outline');
    const style = getComputedStyle(active.element());
    expect(active.element().getBoundingClientRect().height).toBe(24);
    expect(style.borderTopLeftRadius).toBe('9999px');
    expect(style.borderTopWidth).toBe('1px');
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('gives the remove button a 24px hit area at both sizes', async () => {
    const screen = await renderWithDS(
      <div className="flex flex-col gap-2">
        <ChipGroup aria-label="Small" size="sm" onRemove={() => {}}>
          <Chip id="design">Design</Chip>
        </ChipGroup>
        <ChipGroup aria-label="Medium" onRemove={() => {}}>
          <Chip id="research">Research</Chip>
        </ChipGroup>
      </div>,
    );
    const buttons = screen.container.querySelectorAll('[data-slot="remove"]');
    expect(buttons).toHaveLength(2);
    for (const remove of buttons) {
      const hitArea = getComputedStyle(remove, '::after');
      expect(hitArea.width).toBe('24px');
      expect(hitArea.height).toBe('24px');
    }
  });
});

describe('AssistChip', () => {
  it('shows a pending state while an async onPress runs, until it settles or rejects', async () => {
    let finish: () => void = () => {};
    let fail: (reason: Error) => void = () => {};
    const onPress = vi.fn(
      () =>
        new Promise<void>((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
    );
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

    await chip.click();
    await expect.element(chip).toHaveAttribute('data-pending', 'true');
    fail(new Error('Calendar unavailable'));
    await expect.element(chip).not.toHaveAttribute('data-pending');
    expect(onPress).toHaveBeenCalledTimes(2);
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
});

describe('FilterChip', () => {
  it('toggles and swaps its icon for a check', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(
      <FilterChip startIcon={<FilterIcon data-testid="icon" />} onChange={onChange}>
        Starred only
      </FilterChip>,
    );
    const chip = screen.getByRole('button', { name: 'Starred only' });
    await expect.element(chip).toHaveAttribute('aria-pressed', 'false');
    await expect.element(screen.getByTestId('icon')).toBeInTheDocument();
    await chip.click();
    await expect.element(chip).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith(true);
    await expect.element(screen.getByTestId('icon')).not.toBeInTheDocument();
  });
});

describe('Chip accessibility', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          {(['soft', 'outline'] as const).map((variant) => (
            <ChipGroup
              key={variant}
              aria-label={`Status ${variant}`}
              variant={variant}
              selectionMode="multiple"
              defaultSelectedKeys={['active']}
              disabledKeys={['archived']}
              items={statuses}
            >
              {(item) => <Chip id={item.id}>{item.name}</Chip>}
            </ChipGroup>
          ))}
          <Labels initial={['Design', 'Sharing']} />
          <ChipGroup aria-label="Assignees" onRemove={() => {}}>
            <Chip id="ayse" avatar="AD">
              Ayşe Demir
            </Chip>
          </ChipGroup>
          <div className="flex flex-wrap gap-2">
            <AssistChip startIcon={<CalendarIcon />}>Add to calendar</AssistChip>
            <AssistChip variant="outline">Share</AssistChip>
            <FilterChip defaultSelected>Starred only</FilterChip>
            <FilterChip variant="outline" defaultSelected>
              Mine
            </FilterChip>
            <FilterChip variant="outline" size="sm">
              Recent
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
