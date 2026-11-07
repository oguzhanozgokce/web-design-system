import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { ScheduleIcon } from '@/registry/ds/lib/icons';
import { Tag, TagGroup, type TagTone } from '@/registry/ds/ui/tag';

const tones: TagTone[] = ['neutral', 'primary', 'success', 'warning', 'error', 'info'];

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
      <div>
        <Tag id="status" title="Published on 12 May" tone="success" variant="outline" dot>
          Published
        </Tag>
        <Tag size="sm" tone="info" icon={<ScheduleIcon />} dot>
          Scheduled
        </Tag>
      </div>,
    );
    const tag = screen.getByText('Published').element().closest('[data-slot="tag"]')!;
    expect(tag.tagName).toBe('SPAN');
    expect(tag.id).toBe('status');
    expect(tag.getAttribute('title')).toBe('Published on 12 May');
    expect(tag.getAttribute('role')).toBeNull();
    expect(tag.getAttribute('data-tone')).toBe('success');
    expect(tag.getAttribute('data-variant')).toBe('outline');
    expect(tag.getAttribute('data-size')).toBe('md');
    expect(tag.getBoundingClientRect().height).toBe(24);
    expect(getComputedStyle(tag).borderTopLeftRadius).toBe('9999px');
    expect(getComputedStyle(tag).color).toBe(probe('text-on-surface', 'color'));
    const dot = tag.querySelector('[data-slot="dot"]')!;
    expect(dot.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(dot).backgroundColor).toBe(probe('bg-success'));
    const small = screen.getByText('Scheduled').element().closest('[data-slot="tag"]')!;
    expect(small.getBoundingClientRect().height).toBe(20);
    expect(small.querySelector('[data-slot="icon"]')).not.toBeNull();
    expect(small.querySelector('[data-slot="dot"]')).toBeNull();
  });

  it('paints soft and solid tags from the tone roles', async () => {
    const screen = await renderWithDS(
      <div className="flex gap-2">
        <Tag tone="warning">Soft</Tag>
        <Tag tone="warning" variant="solid">
          Solid
        </Tag>
        <Tag>Neutral</Tag>
        <Tag variant="solid">Inverse</Tag>
      </div>,
    );
    const background = (text: string) =>
      getComputedStyle(screen.getByText(text).element().closest('[data-slot="tag"]')!)
        .backgroundColor;
    expect(background('Soft')).toBe(probe('bg-warning-soft'));
    expect(background('Solid')).toBe(probe('bg-warning-solid'));
    expect(background('Neutral')).toBe(probe('bg-neutral-soft'));
    expect(background('Inverse')).toBe(probe('bg-inverse-surface'));
  });

  it('pulses the dot only while the provider allows motion', async () => {
    for (const [motion, animation] of [
      ['system', 'ds-pulse'],
      ['reduced', 'none'],
      ['disabled', 'none'],
    ] as const) {
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
      for (const dot of dots) expect(getComputedStyle(dot).animationName).toBe(animation);
      await screen.unmount();
    }
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
    await expect.element(urgent).toHaveAttribute('data-variant', 'soft');
    expect(getComputedStyle(urgent.element()).cursor).toBe('default');
    expect(urgent.element().getBoundingClientRect().height).toBe(24);
  });

  it('removes a tag from its remove button and from the keyboard', async () => {
    const screen = await renderWithDS(<Labels initial={['Sharing', 'Research', 'Urgent']} />);
    await screen.getByRole('button', { name: 'Remove Sharing' }).click();
    await expect.element(screen.getByRole('row', { name: 'Sharing' })).not.toBeInTheDocument();

    screen.getByRole('row', { name: 'Research' }).element().focus();
    await userEvent.keyboard('{Backspace}');
    await expect.element(screen.getByRole('row', { name: 'Research' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('row', { name: 'Urgent' })).toHaveFocus();
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
        <Tag id="pinned" textValue="Pinned folder" icon={<ScheduleIcon />}>
          <strong>Pinned</strong> folder
        </Tag>
        <Tag id="starred">
          <strong>Starred</strong>
        </Tag>
      </TagGroup>,
    );
    await expect.element(screen.getByRole('button', { name: 'Remove 2024' })).toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'Remove Pinned folder' }))
      .toBeVisible();
    const remove = screen.container.querySelectorAll('[data-slot="remove"]')[2];
    expect(remove.getAttribute('aria-label')).not.toBe('Remove ');
    expect(remove.getAttribute('aria-labelledby')).toContain(remove.id);
  });

  it('prefers the labels prop over DSProvider, and a tag’s labels over its group’s', async () => {
    const english = await renderWithDS(
      <>
        <Labels initial={['Sharing']} />
        <TagGroup label="Categories" items={[]} renderEmptyState={() => 'No categories yet'}>
          {(item: { id: string }) => <Tag id={item.id}>{item.id}</Tag>}
        </TagGroup>
      </>,
    );
    await english.getByRole('button', { name: 'Remove Sharing' }).click();
    await expect.element(english.getByText('None')).toBeVisible();
    await expect.element(english.getByRole('group', { name: 'Labels' })).toBeInTheDocument();
    await expect.element(english.getByText('No categories yet')).toBeVisible();
    await english.unmount();

    const screen = await renderWithDS(
      <>
        <Labels initial={['Rapor']} />
        <TagGroup
          label="Etiketler"
          onRemove={() => {}}
          labels={{ remove: '{label} etiketini kaldır' }}
        >
          <Tag id="sharing">Tasarım</Tag>
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
      .element(screen.getByRole('button', { name: 'Tasarım etiketini kaldır' }))
      .toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Acil etiketini sil' })).toBeVisible();
    await expect.element(screen.getByText('Henüz kategori yok')).toBeVisible();
    await expect.element(screen.getByText('Yok', { exact: true })).not.toBeInTheDocument();
    await screen.getByRole('button', { name: 'Kaldır: Rapor' }).click();
    await expect.element(screen.getByText('Yok', { exact: true })).toBeVisible();
  });

  it('selects tags, fills them and shows a check', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithDS(
      <TagGroup
        label="Email me when"
        selectionMode="multiple"
        tone="primary"
        variant="outline"
        onSelectionChange={onSelectionChange}
      >
        <Tag id="message">Message received</Tag>
        <Tag id="shared">Project shared</Tag>
      </TagGroup>,
    );
    const message = screen.getByRole('row', { name: 'Message received' });
    expect(getComputedStyle(message.element()).cursor).toBe('pointer');
    expect(message.element().querySelector('[data-slot="check"]')).toBeNull();
    await expect
      .poll(() => getComputedStyle(message.element()).backgroundColor)
      .toBe('rgba(0, 0, 0, 0)');

    await message.click();
    await expect.element(message).toHaveAttribute('aria-selected', 'true');
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['message']);
    expect(message.element().querySelector('[data-slot="check"]')).not.toBeNull();
    await userEvent.unhover(message);
    await expect
      .poll(() => getComputedStyle(message.element()).backgroundColor)
      .toBe(probe('bg-primary-solid'));
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
      <div>
        <button type="button">Before</button>
        <TagGroup label="Access" isDisabled onRemove={onRemove}>
          <Tag id="backups">Backups</Tag>
          <Tag id="reports">Reports</Tag>
        </TagGroup>
        <button type="button">After</button>
      </div>,
    );
    const backups = screen.getByRole('row', { name: 'Backups' });
    await expect.element(backups).toHaveAttribute('data-disabled', 'true');
    expect(getComputedStyle(backups.element()).opacity).toBe('0.5');
    expect(getComputedStyle(backups.element()).cursor).toBe('not-allowed');
    const remove = screen.getByRole('button', { name: 'Remove Backups' });
    await expect.element(remove).toBeDisabled();
    await remove.click({ force: true });
    expect(onRemove).not.toHaveBeenCalled();
    screen.getByRole('button', { name: 'Before' }).element().focus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('lets a tag override the group tone and size', async () => {
    const screen = await renderWithDS(
      <TagGroup label="Labels" tone="info" size="sm">
        <Tag id="a">Research</Tag>
        <Tag id="b" tone="warning" size="md">
          Needs review
        </Tag>
      </TagGroup>,
    );
    const research = screen.getByRole('row', { name: 'Research' });
    const review = screen.getByRole('row', { name: 'Needs review' });
    await expect.element(research).toHaveAttribute('data-tone', 'info');
    await expect.element(research).toHaveAttribute('data-size', 'sm');
    expect(research.element().getBoundingClientRect().height).toBe(20);
    await expect.element(review).toHaveAttribute('data-tone', 'warning');
    expect(review.element().getBoundingClientRect().height).toBe(24);
  });
});

describe('Tag accessibility', () => {
  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <div className="flex flex-col gap-4 p-4">
          {(['soft', 'outline', 'solid'] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap gap-2">
              {tones.map((tone) => (
                <Tag key={tone} tone={tone} variant={variant} dot>
                  {tone}
                </Tag>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap gap-2 bg-surface-raised p-2">
            {tones.map((tone) => (
              <Tag key={tone} tone={tone} variant="outline" size="sm">
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
      await screen.unmount();
    }
  });
});
