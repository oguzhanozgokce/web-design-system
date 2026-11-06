import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { ScheduleIcon } from '@/registry/ds/lib/icons';
import { Tag, TagGroup, type TagTone } from '@/registry/ds/ui/tag';

const tones: TagTone[] = ['neutral', 'primary', 'success', 'warning', 'error', 'info'];

function Labels({ initial }: { initial: string[] }) {
  const [labels, setLabels] = useState(initial.map((name) => ({ id: name, name })));
  return (
    <TagGroup
      label="Labels"
      items={labels}
      onRemove={(keys) => setLabels((current) => current.filter((item) => !keys.has(item.id)))}
    >
      {(item) => <Tag id={item.id}>{item.name}</Tag>}
    </TagGroup>
  );
}

describe('Tag', () => {
  it('renders a static label with its tone, variant and size', async () => {
    const screen = await renderWithDS(
      <Tag tone="success" variant="outlined" dot>
        Paid
      </Tag>,
    );
    const tag = screen.getByText('Paid').element().closest('[data-slot="tag"]')!;
    expect(tag.tagName).toBe('SPAN');
    expect(tag.getAttribute('role')).toBeNull();
    expect(tag.getAttribute('data-tone')).toBe('success');
    expect(tag.getAttribute('data-variant')).toBe('outlined');
    expect(tag.getAttribute('data-size')).toBe('md');
    expect(tag.getBoundingClientRect().height).toBe(24);
    expect(getComputedStyle(tag).borderTopLeftRadius).toBe('4px');
    expect(tag.querySelector('[data-slot="dot"]')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('is 20px high at size sm and shows an icon instead of the dot', async () => {
    const screen = await renderWithDS(
      <Tag size="sm" tone="info" icon={<ScheduleIcon data-testid="icon" />} dot>
        Scheduled
      </Tag>,
    );
    const tag = screen.getByText('Scheduled').element().closest('[data-slot="tag"]')!;
    expect(tag.getBoundingClientRect().height).toBe(20);
    expect(tag.querySelector('[data-slot="icon"]')).not.toBeNull();
    expect(tag.querySelector('[data-slot="dot"]')).toBeNull();
  });

  it('pulses the dot only when motion is allowed', async () => {
    const screen = await renderWithDS(
      <Tag tone="primary" dot="pulse">
        Syncing
      </Tag>,
    );
    const dot = screen
      .getByText('Syncing')
      .element()
      .parentElement!.querySelector('[data-slot="dot"]')!;
    expect(dot.className).toContain('animate-ds-pulse');
    expect(dot.className).toContain('motion-reduce:animate-none');
  });

  it('stops the pulse when the provider turns motion down', async () => {
    for (const motion of ['reduced', 'disabled'] as const) {
      const screen = await renderWithDS(
        <div>
          <Tag tone="primary" dot="pulse">
            Uploading
          </Tag>
          <TagGroup label="Status">
            <Tag id="sync" tone="primary" dot="pulse">
              Syncing
            </Tag>
          </TagGroup>
        </div>,
        { provider: { motion } },
      );
      const dots = screen.container.querySelectorAll('[data-slot="dot"]');
      expect(dots).toHaveLength(2);
      for (const dot of dots) expect(dot.className).not.toContain('animate-ds-pulse');
      await screen.unmount();
    }
  });

  it('passes HTML attributes to a static tag', async () => {
    const screen = await renderWithDS(
      <Tag id="status" title="Paid on 12 May" data-testid="status">
        Paid
      </Tag>,
    );
    const tag = screen.getByTestId('status');
    await expect.element(tag).toHaveAttribute('id', 'status');
    await expect.element(tag).toHaveAttribute('title', 'Paid on 12 May');
  });
});

describe('TagGroup', () => {
  it('renders a labelled grid of tags with a description', async () => {
    const screen = await renderWithDS(
      <TagGroup label="Labels" description="Shown on the project">
        <Tag id="sharing" tone="primary">
          Sharing
        </Tag>
        <Tag id="urgent" tone="error">
          Urgent
        </Tag>
      </TagGroup>,
    );
    const grid = screen.getByRole('grid', { name: 'Labels' });
    await expect.element(grid).toBeVisible();
    await expect.element(grid).toHaveAccessibleDescription('Shown on the project');
    const urgent = screen.getByRole('row', { name: 'Urgent' });
    await expect.element(urgent).toHaveAttribute('data-tone', 'error');
    await expect.element(urgent).toHaveAttribute('data-variant', 'tonal');
    expect(urgent.element().className).not.toContain('state-layer');
    expect(urgent.element().getBoundingClientRect().height).toBe(24);
  });

  it('removes a tag from its remove button and from the keyboard', async () => {
    const screen = await renderWithDS(<Labels initial={['Sharing', 'Enterprise', 'Urgent']} />);
    await screen.getByRole('button', { name: 'Remove Sharing' }).click();
    await expect.element(screen.getByRole('row', { name: 'Sharing' })).not.toBeInTheDocument();

    screen.getByRole('row', { name: 'Enterprise' }).element().focus();
    await userEvent.keyboard('{Backspace}');
    await expect.element(screen.getByRole('row', { name: 'Enterprise' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('row', { name: 'Urgent' })).toHaveFocus();
  });

  it('says None in English once every tag is removed', async () => {
    const screen = await renderWithDS(<Labels initial={['Sharing']} />);
    await screen.getByRole('button', { name: 'Remove Sharing' }).click();
    await expect.element(screen.getByText('None')).toBeVisible();
    await expect.element(screen.getByRole('group', { name: 'Labels' })).toBeInTheDocument();
  });

  it('shows a focus ring on the group when the last tag is removed from the keyboard', async () => {
    const screen = await renderWithDS(<Labels initial={['Sharing']} />);
    screen.getByRole('row', { name: 'Sharing' }).element().focus();
    await userEvent.keyboard('{Delete}');
    const group = screen.getByRole('group', { name: 'Labels' });
    await expect.element(group).toHaveFocus();
    await expect.element(group).toHaveAttribute('data-focus-visible', 'true');
    expect(getComputedStyle(group.element()).outlineStyle).toBe('solid');
  });

  it('gives the remove button a 24px hit area at both sizes', async () => {
    const screen = await renderWithDS(
      <div>
        <TagGroup label="Small" size="sm" onRemove={() => {}}>
          <Tag id="design">Design</Tag>
        </TagGroup>
        <TagGroup label="Medium" onRemove={() => {}}>
          <Tag id="beta">Beta</Tag>
        </TagGroup>
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

  it('names the remove button after a numeric label or the textValue', async () => {
    const screen = await renderWithDS(
      <TagGroup label="Project years" onRemove={() => {}}>
        <Tag id="2024">{2024}</Tag>
        <Tag id="vip" textValue="VIP follower" icon={<ScheduleIcon />}>
          <strong>VIP</strong> follower
        </Tag>
      </TagGroup>,
    );
    await expect.element(screen.getByRole('button', { name: 'Remove 2024' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Remove VIP follower' })).toBeVisible();
  });

  it('falls back to React Aria naming when a tag has no text label', async () => {
    const screen = await renderWithDS(
      <TagGroup label="Labels" onRemove={() => {}}>
        <Tag id="vip">
          <strong>VIP</strong>
        </Tag>
      </TagGroup>,
    );
    const remove = screen.container.querySelector('[data-slot="remove"]')!;
    expect(remove.getAttribute('aria-label')).not.toBe('Remove ');
    expect(remove.getAttribute('aria-labelledby')).toContain(remove.id);
  });

  it('takes the remove and empty labels from DSProvider', async () => {
    const screen = await renderWithDS(<Labels initial={['Fatura']} />, {
      provider: { labels: { tag: { remove: '{label} etiketini kaldır', empty: 'Yok' } } },
    });
    await screen.getByRole('button', { name: 'Fatura etiketini kaldır' }).click();
    await expect.element(screen.getByText('Yok')).toBeVisible();
  });

  it('prefers the labels prop over DSProvider, and a tag’s labels over its group’s', async () => {
    const screen = await renderWithDS(
      <>
        <TagGroup
          label="Etiketler"
          onRemove={() => {}}
          labels={{ remove: '{label} etiketini kaldır' }}
        >
          <Tag id="sharing">Fatura</Tag>
          <Tag id="urgent" labels={{ remove: ({ label }) => `${label} etiketini sil` }}>
            Acil
          </Tag>
        </TagGroup>
        <TagGroup label="Kategoriler" items={[]} labels={{ empty: 'Henüz kategori yok' }}>
          {(item: { id: string }) => <Tag id={item.id}>{item.id}</Tag>}
        </TagGroup>
      </>,
      { provider: { labels: { tag: { remove: 'Kaldır: {label}', empty: 'Yok' } } } },
    );
    await expect
      .element(screen.getByRole('button', { name: 'Fatura etiketini kaldır' }))
      .toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Acil etiketini sil' })).toBeVisible();
    await expect.element(screen.getByText('Henüz kategori yok')).toBeVisible();
    await expect.element(screen.getByText('Yok', { exact: true })).not.toBeInTheDocument();
  });

  it('accepts a custom empty state', async () => {
    const screen = await renderWithDS(
      <TagGroup label="Categories" items={[]} renderEmptyState={() => 'No categories yet'}>
        {(item: { id: string }) => <Tag id={item.id}>{item.id}</Tag>}
      </TagGroup>,
    );
    await expect.element(screen.getByText('No categories yet')).toBeVisible();
  });

  it('selects tags, fills them and shows a check', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <TagGroup
        label="Email me when"
        selectionMode="multiple"
        tone="primary"
        variant="outlined"
        onSelectionChange={onSelectionChange}
      >
        <Tag id="message">Message received</Tag>
        <Tag id="overdue">Project overdue</Tag>
      </TagGroup>,
    );
    const message = screen.getByRole('row', { name: 'Message received' });
    expect(message.element().className).toContain('state-layer');
    expect(message.element().querySelector('[data-slot="check"]')).toBeNull();
    const outlinedBackground = getComputedStyle(message.element()).backgroundColor;

    await message.click();
    await expect.element(message).toHaveAttribute('aria-selected', 'true');
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['message']);
    expect(message.element().querySelector('[data-slot="check"]')).not.toBeNull();
    const probe = document.createElement('span');
    probe.className = 'bg-primary';
    screen.getByTestId('ds-root').element().append(probe);
    const primary = getComputedStyle(probe).backgroundColor;
    expect(outlinedBackground).toBe('rgba(0, 0, 0, 0)');
    await expect.poll(() => getComputedStyle(message.element()).backgroundColor).toBe(primary);

    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard(' ');
    await expect
      .element(screen.getByRole('row', { name: 'Project overdue' }))
      .toHaveAttribute('aria-selected', 'true');
  });

  it('follows a controlled selection', async () => {
    function Controlled() {
      const [selected, setSelected] = useState<Selection>(new Set(['message']));
      return (
        <>
          <TagGroup
            label="Email me when"
            selectionMode="single"
            selectedKeys={selected}
            onSelectionChange={setSelected}
          >
            <Tag id="message">Message received</Tag>
            <Tag id="overdue">Project overdue</Tag>
          </TagGroup>
          <button type="button" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </>
      );
    }
    const screen = await renderWithDS(<Controlled />);
    const message = screen.getByRole('row', { name: 'Message received' });
    const overdue = screen.getByRole('row', { name: 'Project overdue' });
    await expect.element(message).toHaveAttribute('aria-selected', 'true');
    await overdue.click();
    await expect.element(overdue).toHaveAttribute('aria-selected', 'true');
    await expect.element(message).toHaveAttribute('aria-selected', 'false');
    await screen.getByRole('button', { name: 'Clear' }).click();
    await expect.element(overdue).toHaveAttribute('aria-selected', 'false');
  });

  it('moves focus with ArrowLeft to the next tag in RTL', async () => {
    const screen = await renderWithDS(
      <TagGroup label="الوسوم" selectionMode="single">
        <Tag id="paid">مدفوع</Tag>
        <Tag id="due">مستحق</Tag>
      </TagGroup>,
      { locale: 'ar' },
    );
    screen.getByRole('row', { name: 'مدفوع' }).element().focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(screen.getByRole('row', { name: 'مستحق' })).toHaveFocus();
  });

  it('shows the error message instead of the description when invalid', async () => {
    const screen = await renderWithDS(
      <TagGroup
        label="Categories"
        description="Used in reports"
        errorMessage="Add at least one category."
        isInvalid
        items={[]}
      >
        {(item: { id: string }) => <Tag id={item.id}>{item.id}</Tag>}
      </TagGroup>,
    );
    const group = screen.getByRole('group', { name: 'Categories' });
    await expect.element(group).toHaveAccessibleDescription('Add at least one category.');
    await expect.element(screen.getByText('Used in reports')).not.toBeInTheDocument();
    expect(
      screen.container.querySelector('[data-slot="tag-group"]')?.getAttribute('data-invalid'),
    ).toBe('true');
  });

  it('disables every tag and its remove button when the group is disabled', async () => {
    const onRemove = vi.fn();
    const screen = await renderWithDS(
      <TagGroup label="Access" isDisabled onRemove={onRemove}>
        <Tag id="backups">Backups</Tag>
      </TagGroup>,
    );
    const backups = screen.getByRole('row', { name: 'Backups' });
    await expect.element(backups).toHaveAttribute('data-disabled', 'true');
    const remove = screen.getByRole('button', { name: 'Remove Backups' });
    await expect.element(remove).toBeDisabled();
    await remove.click({ force: true });
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('leaves a disabled group out of the tab order', async () => {
    const screen = await renderWithDS(
      <div>
        <button type="button">Before</button>
        <TagGroup label="Access" isDisabled onRemove={() => {}}>
          <Tag id="backups">Backups</Tag>
          <Tag id="reports">Reports</Tag>
        </TagGroup>
        <button type="button">After</button>
      </div>,
    );
    screen.getByRole('button', { name: 'Before' }).element().focus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('lets a tag override the group tone and size', async () => {
    const screen = await renderWithDS(
      <TagGroup label="Labels" tone="info" size="sm">
        <Tag id="a">Enterprise</Tag>
        <Tag id="b" tone="warning" size="md">
          Needs review
        </Tag>
      </TagGroup>,
    );
    const enterprise = screen.getByRole('row', { name: 'Enterprise' });
    const review = screen.getByRole('row', { name: 'Needs review' });
    await expect.element(enterprise).toHaveAttribute('data-tone', 'info');
    await expect.element(enterprise).toHaveAttribute('data-size', 'sm');
    await expect.element(review).toHaveAttribute('data-tone', 'warning');
    expect(review.element().getBoundingClientRect().height).toBe(24);
  });
});

describe('Tag accessibility', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          {(['tonal', 'outlined', 'filled'] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap gap-2">
              {tones.map((tone) => (
                <Tag key={tone} tone={tone} variant={variant} dot>
                  {tone}
                </Tag>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap gap-2 bg-surface-container p-2">
            {tones.map((tone) => (
              <Tag key={tone} tone={tone} variant="outlined" size="sm">
                {tone}
              </Tag>
            ))}
          </div>
          <TagGroup
            label="Labels"
            description="Shown on the project"
            onRemove={() => {}}
            selectionMode="multiple"
            defaultSelectedKeys={['sharing']}
          >
            {tones.map((tone) => (
              <Tag key={tone} id={tone === 'primary' ? 'sharing' : tone} tone={tone}>
                {tone}
              </Tag>
            ))}
          </TagGroup>
          <TagGroup label="Access" isDisabled onRemove={() => {}}>
            <Tag id="backups">Backups</Tag>
          </TagGroup>
          <TagGroup label="Empty" items={[]} isInvalid errorMessage="Add at least one label.">
            {(item: { id: string }) => <Tag id={item.id}>{item.id}</Tag>}
          </TagGroup>
        </div>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      screen.unmount();
    }
  });
});
