'use client';

import { useMemo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  DropIndicator,
  GridList,
  GridListItem,
  composeRenderProps,
  useDragAndDrop,
  type GridListProps,
  type Key,
} from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { fluidTween } from '@/registry/ds/lib/motion';
import { reorderItems } from '@/registry/ds/lib/reorderable-list.ts';
import { tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { IconButton } from '@/registry/ds/ui/icon-button';

const MotionItem = motion.create(GridListItem);

export const reorderableListStyles = tv({
  slots: {
    root: 'group/reorderable-list focus-ring relative flex min-w-0 flex-col text-sm text-on-surface not-data-[focus-visible]:outline-none',
    item: [
      'group/reorderable-item focus-ring relative flex min-w-0 items-center gap-3 text-start text-on-surface not-data-[focus-visible]:outline-none',
      'transition-[background-color,border-color,box-shadow,opacity] duration-150 ease-out motion-reduce:transition-none',
      'data-[focus-visible]:z-10 data-[dragging]:opacity-40 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
      'data-[allows-dragging]:cursor-grab data-[dragging]:cursor-grabbing',
    ],
    handle:
      'shrink-0 cursor-grab text-on-surface-variant data-[pressed]:cursor-grabbing group-data-[dragging]/reorderable-item:cursor-grabbing',
    content: 'flex min-w-0 flex-1 items-center gap-3 [overflow-wrap:anywhere]',
    indicator: [
      'pointer-events-none relative z-20 h-0 shrink-0 outline-none',
      'after:absolute after:inset-x-0 after:-top-px after:h-0.5 after:rounded-full after:bg-primary-solid after:opacity-0',
      'data-[drop-target]:after:opacity-100',
      'before:absolute before:inset-s-0 before:-top-1 before:size-2 before:rounded-full before:bg-primary-solid before:opacity-0 data-[drop-target]:before:opacity-100',
    ],
    empty:
      'rounded-container border border-dashed border-outline-subtle px-6 py-10 text-center text-sm text-on-surface-variant',
  },
  variants: {
    variant: {
      outline: {
        root: 'gap-2',
        indicator: '-my-1',
        item: 'rounded-container border border-outline-subtle bg-surface-raised px-3 py-3 data-[hovered]:border-outline-variant data-[hovered]:shadow-xs data-[dragging]:border-primary',
      },
      plain: {
        root: 'gap-0',
        item: 'border-b border-outline-subtle px-2 py-2 last:border-b-0 data-[hovered]:bg-neutral-soft',
      },
    },
  },
  defaultVariants: { variant: 'outline' },
});

export interface ReorderableListLabels {
  reorder: LabelTemplate<{ item: string }>;
  empty: string;
}

export const defaultReorderableListLabels: ReorderableListLabels = {
  reorder: 'Reorder {item}',
  empty: 'No items to reorder',
};

export interface ReorderableListProps<T extends object> extends Omit<
  GridListProps<T>,
  | 'items'
  | 'children'
  | 'dragAndDropHooks'
  | 'selectionMode'
  | 'selectionBehavior'
  | 'selectedKeys'
  | 'defaultSelectedKeys'
  | 'onSelectionChange'
  | 'disallowEmptySelection'
  | 'disabledBehavior'
  | 'onAction'
  | 'layout'
  | 'orientation'
  | 'onChange'
> {
  value?: T[];
  defaultValue?: T[];
  onChange?: (value: T[]) => void;
  getKey: (item: T) => Key;
  getTextValue: (item: T) => string;
  children: (item: T, index: number) => ReactNode;
  variant?: 'outline' | 'plain';
  isDisabled?: boolean;
  labels?: Partial<ReorderableListLabels>;
}

export function ReorderableList<T extends object>({
  value,
  defaultValue = [],
  onChange,
  getKey,
  getTextValue,
  children,
  variant = 'outline',
  isDisabled = false,
  disabledKeys,
  labels,
  className,
  renderEmptyState,
  ...props
}: ReorderableListProps<T>) {
  const [items, setItems] = useControllableState(value, defaultValue, onChange);
  const t = useLabels('reorderableList', defaultReorderableListLabels, labels);
  const icons = useIcons();
  const { spatialEnabled } = useMotionPreference();
  const styles = reorderableListStyles({ variant });
  const disabled = useMemo(
    () => new Set(isDisabled ? items.map(getKey) : disabledKeys),
    [isDisabled, items, getKey, disabledKeys],
  );
  const { dragAndDropHooks } = useDragAndDrop<T>({
    isDisabled,
    getItems: (keys) =>
      items
        .filter((item) => keys.has(getKey(item)))
        .map((item) => ({ 'text/plain': getTextValue(item) })),
    getAllowedDropOperations: () => ['move'],
    onReorder({ keys, target }) {
      const { key, dropPosition } = target;
      if (isDisabled || dropPosition === 'on') return;
      setItems((current) => reorderItems(current, keys, key, dropPosition, getKey));
    },
    renderDropIndicator: (target) => (
      <DropIndicator
        target={target}
        data-slot="reorderable-list-indicator"
        className={styles.indicator()}
      />
    ),
  });

  return (
    <GridList
      {...props}
      selectionMode="none"
      disabledKeys={disabled}
      disabledBehavior="all"
      dragAndDropHooks={dragAndDropHooks}
      layout="stack"
      orientation="vertical"
      data-slot="reorderable-list"
      data-variant={variant}
      data-disabled={isDisabled || undefined}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
      renderEmptyState={renderEmptyState ?? (() => <div className={styles.empty()}>{t.empty}</div>)}
    >
      {items.map((item, index) => {
        const key = getKey(item);
        const textValue = getTextValue(item);
        return (
          <MotionItem
            key={key}
            id={key}
            value={item}
            textValue={textValue}
            data-slot="reorderable-list-item"
            data-key={key}
            className={styles.item()}
            layout={spatialEnabled ? 'position' : false}
            layoutDependency={items}
            transition={fluidTween()}
          >
            <IconButton
              slot="drag"
              aria-label={t.format('reorder', { item: textValue })}
              isDisabled={disabled.has(key)}
              data-slot="reorderable-list-handle"
              className={styles.handle()}
              icon={<icons.dragIndicator />}
            />
            <div data-slot="reorderable-list-content" className={styles.content()}>
              {children(item, index)}
            </div>
          </MotionItem>
        );
      })}
    </GridList>
  );
}
