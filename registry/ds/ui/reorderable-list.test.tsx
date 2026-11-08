import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations, renderWithDS } from '@/test/utils';
import { Button } from '@/registry/ds/ui/button';
import { ReorderableList, type ReorderableListProps } from '@/registry/ds/ui/reorderable-list';

const items = [
  { id: 'overview', name: 'Overview' },
  { id: 'activity', name: 'Activity' },
  { id: 'files', name: 'Files' },
];

function List(props: Partial<ReorderableListProps<(typeof items)[number]>>) {
  return (
    <ReorderableList
      aria-label="Navigation order"
      defaultValue={items}
      getKey={(item) => item.id}
      getTextValue={(item) => item.name}
      {...props}
    >
      {props.children ?? ((item) => item.name)}
    </ReorderableList>
  );
}

function order(container: HTMLElement) {
  return [...container.querySelectorAll('[data-slot="reorderable-list-item"]')].map((row) =>
    row.getAttribute('data-key'),
  );
}

describe('ReorderableList', () => {
  it('commits a pointer drop once and preserves the row content', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(<List onChange={onChange} />);
    await screen
      .getByRole('row', { name: 'Overview', exact: true })
      .dropTo(screen.getByRole('row', { name: 'Files', exact: true }), {
        targetPosition: { x: 100, y: 60 },
      });
    await expect.poll(() => order(screen.container)).toEqual(['activity', 'files', 'overview']);
    expect(onChange).toHaveBeenCalledExactlyOnceWith([items[1], items[2], items[0]]);
    await expect.element(screen.getByRole('button', { name: 'Reorder Overview' })).toBeVisible();
  });

  it('connects the keyboard handle to the uncontrolled order and commits only on drop', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(<List onChange={onChange} />);
    screen.getByRole('button', { name: 'Reorder Overview' }).element().focus();
    await userEvent.keyboard('{Enter}');
    await expect
      .element(screen.getByRole('button', { name: 'Insert between Overview and Activity' }))
      .toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect
      .element(screen.getByRole('button', { name: 'Insert between Activity and Files' }))
      .toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => order(screen.container)).toEqual(['activity', 'overview', 'files']);
    expect(onChange).toHaveBeenCalledExactlyOnceWith([items[1], items[0], items[2]]);
  });

  it('keeps the controlled order when a parent rejects a drop', async () => {
    const onChange = vi.fn();
    const screen = await renderWithDS(<List value={items} onChange={onChange} />);
    await screen
      .getByRole('row', { name: 'Overview', exact: true })
      .dropTo(screen.getByRole('row', { name: 'Files', exact: true }), {
        targetPosition: { x: 100, y: 60 },
      });
    await expect.poll(() => onChange.mock.calls.length).toBe(1);
    expect(order(screen.container)).toEqual(['overview', 'activity', 'files']);
  });

  it('supports row actions, disabled handles and provider labels with local overrides', async () => {
    const onPress = vi.fn();
    const screen = await renderWithDS(
      <>
        <List disabledKeys={['files']}>
          {(item) => <Button onPress={onPress}>Open {item.name}</Button>}
        </List>
        <List aria-label="Read only" isDisabled labels={{ reorder: 'Move {item}' }} />
        <List aria-label="Empty" defaultValue={[]} />
      </>,
      {
        provider: {
          labels: { reorderableList: { reorder: 'Arrange {item}', empty: 'Nothing here' } },
        },
      },
    );
    await screen.getByRole('button', { name: 'Open Overview' }).click();
    expect(onPress).toHaveBeenCalledOnce();
    await expect.element(screen.getByRole('button', { name: 'Arrange Files' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Open Files' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Move Overview' })).toBeDisabled();
    await expect.element(screen.getByText('Nothing here')).toBeVisible();
  });

  it('has no accessibility violations in light, dark and RTL', async () => {
    for (const options of [{}, { dark: true }, { locale: 'ar' }]) {
      const screen = await renderWithDS(
        <List disabledKeys={['files']}>{(item) => <span>{item.name}</span>}</List>,
        options,
      );
      await expectNoA11yViolations(screen.container);
      await screen.unmount();
    }
  });
});
