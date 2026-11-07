'use client';

import { createContext, use, useMemo, type CSSProperties, type ReactNode, type Ref } from 'react';
import {
  Cell as AriaCell,
  Collection,
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  TableLoadMoreItem,
  composeRenderProps,
  useTableOptions,
  type CellProps as AriaCellProps,
  type ColumnProps as AriaColumnProps,
  type RowProps as AriaRowProps,
  type TableBodyProps as AriaTableBodyProps,
  type TableHeaderProps as AriaTableHeaderProps,
  type TableLoadMoreItemProps,
  type TableProps as AriaTableProps,
} from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { Checkbox } from '@/registry/ds/ui/checkbox';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';

export type TableDensity = 'sm' | 'md';

export type TableAlign = 'start' | 'center' | 'end';

export interface TableLabels {
  selection: string;
  loadingMore: string;
}

export const defaultTableLabels: TableLabels = {
  selection: 'Selection',
  loadingMore: 'Loading more…',
};

export const tableStyles = tv({
  slots: {
    container: 'relative w-full min-w-0 overflow-x-auto overscroll-x-contain',
    table: [
      'w-full border-separate border-spacing-0 text-start text-sm text-on-surface',
      '[--table-surface:var(--surface-raised)]',
    ],
    header: '',
    column: [
      'group/column relative isolate h-(--table-header-height) px-3 align-middle text-xs font-medium whitespace-nowrap text-on-surface-variant',
      "before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:bg-neutral-soft before:content-['']",
      'first:before:rounded-s-item last:before:rounded-e-item',
      'focus-ring-inset first:rounded-s-item last:rounded-e-item',
      'transition-[color] duration-150 ease-out motion-reduce:transition-none',
      'data-[allows-sorting]:cursor-pointer data-[allows-sorting]:select-none data-[hovered]:data-[allows-sorting]:text-on-surface',
      'data-[sort-direction]:text-on-surface',
    ],
    columnContent: 'inline-flex max-w-full items-center gap-1 align-middle',
    columnLabel: 'min-w-0 truncate',
    sortIndicator: [
      'inline-flex shrink-0 items-center justify-center text-[0.875rem] opacity-40 [&_svg]:size-[1em]',
      'transition-[rotate,opacity] duration-200 ease-fluid motion-reduce:transition-none',
      'group-data-[hovered]/column:opacity-70 data-[direction]:opacity-100 data-[direction=ascending]:rotate-180',
    ],
    body: '',
    row: [
      'group/row relative h-(--table-row-height) text-on-surface',
      'focus-ring-inset',
      'transition-[background-color,opacity] duration-[150ms,250ms] ease-out [transition-delay:0ms,calc(var(--table-row-index,0)*24ms)] motion-reduce:transition-none',
      'data-[selection-mode]:cursor-pointer data-[href]:cursor-pointer',
      'data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover',
      'data-[selected]:bg-primary-soft data-[selected]:data-[hovered]:bg-primary-soft-hover data-[selected]:data-[pressed]:bg-primary-soft-hover',
      'data-[disabled]:cursor-default',
    ],
    cell: [
      'border-b border-outline-subtle px-3 py-(--table-cell-py) align-middle',
      'focus-ring-inset group-last/row:border-b-0',
      'group-data-[disabled]/row:not-group-data-[placeholder]/row:opacity-50',
    ],
    selectionColumn: 'w-(--table-selection-width) min-w-(--table-selection-width) ps-3 pe-1',
    selectionCell: 'w-(--table-selection-width) min-w-(--table-selection-width) ps-3 pe-1',
    selectionLabel: 'sr-only',
    loadMore: 'h-(--table-row-height)',
    loadMoreContent: 'flex items-center justify-center gap-2 py-2 text-sm text-on-surface-variant',
  },
  variants: {
    density: {
      sm: {
        table:
          '[--table-cell-py:0.25rem] [--table-header-height:2rem] [--table-row-height:2.5rem] [--table-selection-width:2rem]',
      },
      md: {
        table:
          '[--table-cell-py:0.5rem] [--table-header-height:2.5rem] [--table-row-height:3.25rem] [--table-selection-width:2.125rem]',
      },
    },
    align: {
      start: { column: 'text-start', cell: 'text-start' },
      center: { column: 'text-center', cell: 'text-center' },
      end: { column: 'text-end', cell: 'text-end', columnContent: 'flex-row-reverse' },
    },
    animated: {
      true: { row: 'starting:opacity-0' },
      false: '',
    },
    instant: {
      true: { sortIndicator: 'transition-none' },
      false: '',
    },
    stickyHeader: {
      true: { column: 'sticky top-0 z-2 bg-(--table-surface)' },
      false: '',
    },
    stickyRowHeader: {
      true: {
        column:
          'data-[row-header]:sticky data-[row-header]:inset-s-(--table-sticky-start) data-[row-header]:z-3 data-[row-header]:bg-(--table-surface)',
        selectionColumn: 'sticky inset-s-0 z-3 bg-(--table-surface)',
        cell: [
          '[&[role=rowheader]]:sticky [&[role=rowheader]]:inset-s-(--table-sticky-start) [&[role=rowheader]]:z-1 [&[role=rowheader]]:isolate [&[role=rowheader]]:bg-(--table-surface)',
          "[&[role=rowheader]]:before:pointer-events-none [&[role=rowheader]]:before:absolute [&[role=rowheader]]:before:inset-0 [&[role=rowheader]]:before:-z-1 [&[role=rowheader]]:before:content-['']",
          '[&[role=rowheader]]:before:transition-[background-color] [&[role=rowheader]]:before:duration-150 [&[role=rowheader]]:before:ease-out motion-reduce:[&[role=rowheader]]:before:transition-none',
          '[&[role=rowheader]]:group-data-[hovered]/row:before:bg-neutral-soft [&[role=rowheader]]:group-data-[pressed]/row:before:bg-neutral-soft-hover',
          '[&[role=rowheader]]:group-data-[selected]/row:before:bg-primary-soft [&[role=rowheader]]:group-data-[selected]/row:group-data-[hovered]/row:before:bg-primary-soft-hover [&[role=rowheader]]:group-data-[selected]/row:group-data-[pressed]/row:before:bg-primary-soft-hover',
          "[&[role=rowheader]]:after:pointer-events-none [&[role=rowheader]]:after:absolute [&[role=rowheader]]:after:inset-0 [&[role=rowheader]]:after:border-y-2 [&[role=rowheader]]:after:border-transparent [&[role=rowheader]]:after:content-['']",
          '[&[role=rowheader]]:before:-bottom-px [&[role=rowheader]]:after:-bottom-px [&[role=rowheader]]:group-last/row:before:bottom-0 [&[role=rowheader]]:group-last/row:after:bottom-0',
          '[&[role=rowheader]]:first:after:border-s-2 [&[role=rowheader]]:group-data-[focus-visible]/row:after:border-primary',
        ],
        selectionCell: [
          'sticky inset-s-0 z-1 isolate bg-(--table-surface)',
          "before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:content-['']",
          'before:transition-[background-color] before:duration-150 before:ease-out motion-reduce:before:transition-none',
          'group-data-[hovered]/row:before:bg-neutral-soft group-data-[pressed]/row:before:bg-neutral-soft-hover',
          'group-data-[selected]/row:before:bg-primary-soft group-data-[selected]/row:group-data-[hovered]/row:before:bg-primary-soft-hover group-data-[selected]/row:group-data-[pressed]/row:before:bg-primary-soft-hover',
          "after:pointer-events-none after:absolute after:inset-0 after:border-y-2 after:border-s-2 after:border-transparent after:content-['']",
          'before:-bottom-px after:-bottom-px group-last/row:before:bottom-0 group-last/row:after:bottom-0',
          'group-data-[focus-visible]/row:after:border-primary',
        ],
      },
      false: '',
    },
    hasSelectionColumn: {
      true: { table: '[--table-sticky-start:var(--table-selection-width)]' },
      false: { table: '[--table-sticky-start:0px]' },
    },
  },
  defaultVariants: {
    density: 'md',
    align: 'start',
    animated: false,
    instant: false,
    stickyHeader: false,
    stickyRowHeader: false,
    hasSelectionColumn: false,
  },
});

interface TableContextValue {
  density: TableDensity;
  stickyHeader: boolean;
  stickyRowHeader: boolean;
  labels?: Partial<TableLabels>;
}

const TableContext = createContext<TableContextValue>({
  density: 'md',
  stickyHeader: false,
  stickyRowHeader: false,
});

export function useTableDensity() {
  return use(TableContext).density;
}

export interface TableProps extends Omit<AriaTableProps, 'className'> {
  density?: TableDensity;
  stickyHeader?: boolean;
  stickyRowHeader?: boolean;
  labels?: Partial<TableLabels>;
  className?: AriaTableProps['className'];
  containerClassName?: string;
  containerStyle?: CSSProperties;
  ref?: Ref<HTMLTableElement>;
}

export function Table({
  density = 'md',
  stickyHeader = false,
  stickyRowHeader = false,
  labels,
  className,
  containerClassName,
  containerStyle,
  ref,
  ...props
}: TableProps) {
  const hasSelectionColumn =
    props.selectionMode != null &&
    props.selectionMode !== 'none' &&
    props.selectionBehavior !== 'replace';
  const styles = tableStyles({ density, hasSelectionColumn });
  const context = useMemo(
    () => ({ density, stickyHeader, stickyRowHeader, labels }),
    [density, stickyHeader, stickyRowHeader, labels],
  );

  return (
    <TableContext value={context}>
      <div
        data-slot="table-container"
        className={styles.container({ className: containerClassName })}
        style={containerStyle}
      >
        <AriaTable
          {...props}
          ref={ref}
          data-slot="table"
          data-density={density}
          data-sticky-header={stickyHeader || undefined}
          data-sticky-row-header={stickyRowHeader || undefined}
          className={composeRenderProps(className, (className) => styles.table({ className }))}
        />
      </div>
    </TableContext>
  );
}

function selectionCheckboxSize(density: TableDensity) {
  return density === 'sm' ? 'sm' : 'md';
}

export interface TableHeaderProps<T extends object> extends Omit<
  AriaTableHeaderProps<T>,
  'className'
> {
  className?: AriaTableHeaderProps<T>['className'];
}

export function TableHeader<T extends object>({
  columns,
  children,
  dependencies,
  className,
  ...props
}: TableHeaderProps<T>) {
  const { density, stickyHeader, stickyRowHeader, labels } = use(TableContext);
  const { selectionBehavior, selectionMode } = useTableOptions();
  const t = useLabels('table', defaultTableLabels, labels);
  const styles = tableStyles({ density, stickyHeader, stickyRowHeader });

  return (
    <AriaTableHeader
      {...props}
      data-slot="table-header"
      className={composeRenderProps(className, (className) => styles.header({ className }))}
    >
      {selectionBehavior === 'toggle' ? (
        <AriaColumn
          data-slot="table-selection-column"
          className={styles.column({ className: styles.selectionColumn() })}
        >
          {selectionMode === 'multiple' ? (
            <Checkbox slot="selection" size={selectionCheckboxSize(density)} />
          ) : (
            <span className={styles.selectionLabel()}>{t.selection}</span>
          )}
        </AriaColumn>
      ) : null}
      <Collection items={columns} dependencies={dependencies}>
        {children}
      </Collection>
    </AriaTableHeader>
  );
}

export interface ColumnProps extends Omit<AriaColumnProps, 'children' | 'className'> {
  align?: TableAlign;
  children?: ReactNode;
  className?: AriaColumnProps['className'];
}

export function Column({ align = 'start', children, className, ...props }: ColumnProps) {
  const { density, stickyHeader, stickyRowHeader } = use(TableContext);
  const icons = useIcons();
  const { spatialEnabled } = useMotionPreference();
  const styles = tableStyles({
    density,
    align,
    stickyHeader,
    stickyRowHeader,
    instant: !spatialEnabled,
  });

  return (
    <AriaColumn
      {...props}
      data-slot="table-column"
      data-align={align}
      data-row-header={props.isRowHeader || undefined}
      className={composeRenderProps(className, (className) => styles.column({ className }))}
    >
      {({ allowsSorting, sortDirection }) => (
        <span data-slot="table-column-content" className={styles.columnContent()}>
          <span data-slot="table-column-label" className={styles.columnLabel()}>
            {children}
          </span>
          {allowsSorting ? (
            <span
              aria-hidden="true"
              data-slot="table-sort-indicator"
              data-direction={sortDirection}
              className={styles.sortIndicator()}
            >
              <icons.chevronDown />
            </span>
          ) : null}
        </span>
      )}
    </AriaColumn>
  );
}

export interface TableBodyProps<T extends object> extends Omit<AriaTableBodyProps<T>, 'className'> {
  className?: AriaTableBodyProps<T>['className'];
}

export function TableBody<T extends object>({ className, ...props }: TableBodyProps<T>) {
  const { density } = use(TableContext);
  const styles = tableStyles({ density });

  return (
    <AriaTableBody
      {...props}
      data-slot="table-body"
      className={composeRenderProps(className, (className) => styles.body({ className }))}
    />
  );
}

export interface RowProps<T extends object> extends Omit<AriaRowProps<T>, 'className'> {
  index?: number;
  isPlaceholder?: boolean;
  className?: AriaRowProps<T>['className'];
}

export function Row<T extends object>({
  id,
  columns,
  children,
  dependencies,
  index,
  isPlaceholder = false,
  className,
  style,
  ...props
}: RowProps<T>) {
  const { density, stickyRowHeader } = use(TableContext);
  const { selectionBehavior } = useTableOptions();
  const { spatialEnabled } = useMotionPreference();
  const styles = tableStyles({
    density,
    stickyRowHeader,
    animated: spatialEnabled && index != null,
  });
  const rowStyle =
    index == null
      ? style
      : composeRenderProps(
          style,
          (style) => ({ ...style, '--table-row-index': Math.min(index, 20) }) as CSSProperties,
        );

  return (
    <AriaRow
      {...props}
      id={id}
      dependencies={dependencies}
      data-slot="table-row"
      data-placeholder={isPlaceholder || undefined}
      style={rowStyle}
      className={composeRenderProps(className, (className) => styles.row({ className }))}
    >
      {selectionBehavior === 'toggle' ? (
        <AriaCell
          data-slot="table-selection-cell"
          className={styles.cell({ className: styles.selectionCell() })}
        >
          {isPlaceholder ? null : (
            <Checkbox slot="selection" size={selectionCheckboxSize(density)} />
          )}
        </AriaCell>
      ) : null}
      <Collection items={columns} dependencies={dependencies}>
        {children}
      </Collection>
    </AriaRow>
  );
}

export interface CellProps extends Omit<AriaCellProps, 'className'> {
  align?: TableAlign;
  className?: AriaCellProps['className'];
}

export function Cell({ align = 'start', className, ...props }: CellProps) {
  const { density, stickyRowHeader } = use(TableContext);
  const styles = tableStyles({ density, align, stickyRowHeader });

  return (
    <AriaCell
      {...props}
      data-slot="table-cell"
      data-align={align}
      className={composeRenderProps(className, (className) => styles.cell({ className }))}
    />
  );
}

export interface TableLoadMoreProps extends Omit<TableLoadMoreItemProps, 'children'> {
  children?: ReactNode;
  labels?: Partial<TableLabels>;
}

export function TableLoadMore({ children, labels, className, ...props }: TableLoadMoreProps) {
  const context = use(TableContext);
  const t = useLabels('table', defaultTableLabels, labels ?? context.labels);
  const styles = tableStyles({ density: context.density });

  return (
    <TableLoadMoreItem
      {...props}
      data-slot="table-load-more"
      className={styles.loadMore({ className })}
    >
      <span data-slot="table-load-more-content" className={styles.loadMoreContent()}>
        {children ?? (
          <>
            <Spinner />
            <span>{t.loadingMore}</span>
          </>
        )}
      </span>
    </TableLoadMoreItem>
  );
}
