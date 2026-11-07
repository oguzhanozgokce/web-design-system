'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Button as AriaButton,
  useLocale,
  type Key,
  type Selection,
  type SortDescriptor,
} from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import {
  compareValues,
  getPageCount,
  hasActiveFilters,
  matchesFilterValue,
  mergePageSelection,
  paginateRows,
  readValue,
  scopeSelection,
  searchRows,
  selectionSize,
  sortRows,
  textOf,
  toDate,
  type DataTableAccessor,
  type DataTableFilterValues,
} from '@/registry/ds/lib/data-table';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { clampPage } from '@/registry/ds/lib/pagination';
import { cn, tv } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';
import { EmptyState } from '@/registry/ds/ui/empty-state';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Menu, MenuItem, MenuTrigger } from '@/registry/ds/ui/menu';
import { Pagination, type PaginationLabels } from '@/registry/ds/ui/pagination';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';
import { SearchField } from '@/registry/ds/ui/search-field';
import { Select, type SelectProps } from '@/registry/ds/ui/select';
import { Skeleton } from '@/registry/ds/ui/skeleton';
import {
  StatusDot,
  StatusTag,
  mergeStatusDefinitions,
  resolveStatus,
  useStatusDefinitions,
  useStatusTagLabels,
  type StatusDefinitions,
  type StatusTagLabels,
} from '@/registry/ds/ui/status-tag';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  type TableAlign,
  type TableDensity,
} from '@/registry/ds/ui/table';
import { Tag, tagStyles, type TagTone } from '@/registry/ds/ui/tag';
import { Tooltip, TooltipTrigger } from '@/registry/ds/ui/tooltip';

export type DataTableColumnType = 'text' | 'number' | 'date' | 'status' | 'tags' | 'custom';

export type DataTableVariant = 'outline' | 'elevated' | 'transparent';

export type DataTableProcessing = 'client' | 'server';

export type DataTableSkeleton = 'text' | 'avatar' | 'pill';

export interface DataTableCellContext {
  density: TableDensity;
  rowLabel: string;
}

export interface DataTableTag {
  id?: Key;
  label: string;
  tone?: TagTone;
}

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  textValue?: string;
  type?: DataTableColumnType;
  accessor?: DataTableAccessor<T>;
  cell?: (row: T, context: DataTableCellContext) => ReactNode;
  compare?: (a: T, b: T) => number;
  getSearchText?: (row: T) => string;
  formatOptions?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
  statuses?: StatusDefinitions;
  statusOptions?: string[];
  onStatusChange?: (row: T, status: string) => void;
  maxVisibleTags?: number;
  chip?: boolean;
  isRowHeader?: boolean;
  allowsSorting?: boolean;
  align?: TableAlign;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  skeleton?: DataTableSkeleton;
}

export interface DataTableAction<T> {
  id: Key;
  label: string;
  icon?: ReactNode;
  tone?: 'neutral' | 'error';
  isDisabled?: boolean;
  onAction: (row: T) => void | Promise<unknown>;
}

export interface DataTableSelectionAction {
  id: Key;
  label: string;
  icon?: ReactNode;
  tone?: 'neutral' | 'error';
  onAction: (keys: Set<Key>) => void | Promise<unknown>;
}

export interface DataTableFilterOption {
  id: Key;
  label: string;
}

export interface DataTableFilter<T> {
  id: string;
  label: string;
  allLabel?: string;
  options: DataTableFilterOption[];
  accessor?: DataTableAccessor<T>;
  predicate?: (row: T, value: Key) => boolean;
}

export interface DataTableLabels {
  totalResults: string;
  resultCount: LabelTemplate<{ count: string }>;
  selectedCount: LabelTemplate<{ count: string }>;
  clearSelection: string;
  search: string;
  all: string;
  actions: string;
  rowAction: LabelTemplate<{ action: string; row: string }>;
  moreActions: LabelTemplate<{ row: string }>;
  more: string;
  editCell: LabelTemplate<{ column: string; row: string }>;
  moreTags: LabelTemplate<{ count: string }>;
  moreTagsLabel: LabelTemplate<{ count: string; tags: string }>;
  emptyTitle: string;
  emptyDescription: string;
  noResultsTitle: string;
  noResultsDescription: string;
  clearFilters: string;
  errorTitle: string;
  errorDescription: string;
  retry: string;
  loading: string;
  pagination: LabelTemplate<{ table: string }>;
}

export const defaultDataTableLabels: DataTableLabels = {
  totalResults: 'Total results',
  resultCount: '{count} results',
  selectedCount: '{count} selected',
  clearSelection: 'Clear selection',
  search: 'Search',
  all: 'All',
  actions: 'Actions',
  rowAction: '{action} {row}',
  moreActions: 'More actions for {row}',
  more: 'More actions',
  editCell: '{column} for {row}',
  moreTags: '+{count}',
  moreTagsLabel: '{count} more: {tags}',
  emptyTitle: 'Nothing here yet',
  emptyDescription: 'New items will show up here.',
  noResultsTitle: 'No results',
  noResultsDescription: 'Try a different search or filter.',
  clearFilters: 'Clear filters',
  errorTitle: 'Something went wrong',
  errorDescription: 'The data could not be loaded.',
  retry: 'Try again',
  loading: 'Loading',
  pagination: 'Pages of {table}',
};

const allKey = '__ds-all__';
const actionsColumnId = '__ds-actions__';

export const dataTableStyles = tv({
  slots: {
    root: '@container/data-table relative flex w-full min-w-0 flex-col text-on-surface',
    toolbar: [
      'flex flex-col gap-3 px-4 pt-4 pb-3',
      '@3xl/data-table:flex-row @3xl/data-table:items-center @3xl/data-table:justify-between @3xl/data-table:gap-6',
    ],
    summary: 'flex min-h-10 min-w-0 shrink-0 flex-col justify-center',
    summaryLabel: 'animate-ds-fade-in text-xs text-on-surface-variant',
    summaryValue: 'animate-ds-fade-in text-sm font-semibold text-on-surface tabular-digits',
    summarySkeleton: 'my-1 h-3 w-20 rounded-sm',
    selectionBar: 'flex min-h-10 animate-ds-fade-in flex-wrap items-center gap-2',
    selectionCount: 'text-sm font-semibold whitespace-nowrap text-on-surface tabular-digits',
    selectionDivider: 'mx-1 h-5 w-px shrink-0 bg-outline-subtle',
    selectionAction: '@max-md/data-table:w-8 @max-md/data-table:px-0',
    selectionActionLabel: '@max-md/data-table:sr-only',
    controls: [
      'flex min-w-0 flex-col gap-2',
      '@3xl/data-table:flex-row @3xl/data-table:items-center @3xl/data-table:justify-end',
    ],
    filters: [
      '-mx-4 flex min-w-0 items-center gap-2 overflow-x-auto px-4 py-0.5',
      '@3xl/data-table:mx-0 @3xl/data-table:overflow-visible @3xl/data-table:px-0',
    ],
    filter: 'w-auto min-w-32 shrink-0',
    search:
      'w-full shrink-0 @3xl/data-table:w-60 [&_[data-slot=container]]:rounded-control [&_[data-slot=container]]:ps-3.5',
    tableArea: 'min-w-0',
    footer: 'border-t border-outline-subtle px-3 py-3',
    chip: 'inline-flex items-center rounded-md bg-neutral-soft font-medium whitespace-nowrap text-on-surface tabular-digits',
    number: 'whitespace-nowrap tabular-digits',
    date: 'whitespace-nowrap text-on-surface-variant',
    text: '',
    tags: 'flex items-center gap-1',
    moreTags: 'focus-ring cursor-default text-on-surface-variant',
    actionsColumn: 'w-0',
    actions: 'flex items-center justify-end gap-1.5',
    state: 'flex items-center justify-center py-6',
    cell: 'whitespace-nowrap',
    statusSelect: 'w-40',
    skeletonMedia: 'flex items-center gap-3',
    skeletonLine: 'h-3 rounded-sm',
    skeletonPill: 'h-5 w-16 rounded-control',
    live: 'sr-only',
  },
  variants: {
    variant: {
      outline: {
        root: 'rounded-container border border-outline-subtle bg-surface-raised [--ds-avatar-ring:var(--surface-raised)]',
        tableArea: 'px-2',
      },
      elevated: {
        root: 'rounded-container bg-surface-raised shadow-sm [--ds-avatar-ring:var(--surface-raised)]',
        tableArea: 'px-2',
      },
      transparent: {
        toolbar: 'px-0 pt-0',
        filters: '-mx-0 px-0',
        footer: 'px-0',
      },
    },
    density: {
      sm: { chip: 'h-5 px-1.5 text-xs', statusSelect: '[&_[data-slot=trigger]]:h-7' },
      md: { chip: 'h-6 px-2 text-xs' },
    },
    hasToolbar: {
      true: '',
      false: { tableArea: 'pt-2' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    density: 'md',
    hasToolbar: true,
  },
});

export interface StatusSelectProps extends Omit<
  SelectProps<object>,
  'children' | 'items' | 'value' | 'defaultValue' | 'onChange' | 'selectionMode'
> {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (status: string) => void;
  options: string[];
  statuses?: StatusDefinitions;
  statusLabels?: Partial<StatusTagLabels>;
}

export function StatusSelect({
  value,
  defaultValue,
  onChange,
  options,
  statuses,
  statusLabels,
  ...props
}: StatusSelectProps) {
  const shared = useStatusDefinitions();
  const t = useStatusTagLabels(statusLabels);
  const definitions = mergeStatusDefinitions(shared, statuses);

  return (
    <Select
      {...props}
      value={value}
      defaultValue={defaultValue}
      onChange={(key) => {
        if (key != null) onChange?.(String(key));
      }}
    >
      {options.map((option) => {
        const resolved = resolveStatus(option, definitions, t);
        return (
          <ListBoxItem
            key={option}
            id={option}
            textValue={resolved.label}
            startIcon={<StatusDot status={option} statuses={definitions ?? undefined} />}
          >
            {resolved.label}
          </ListBoxItem>
        );
      })}
    </Select>
  );
}

export interface DataTableProps<T extends object> {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  data: readonly T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => Key;
  getRowLabel?: (row: T) => string;
  processing?: DataTableProcessing;
  totalCount?: number;
  sortDescriptor?: SortDescriptor | null;
  defaultSortDescriptor?: SortDescriptor | null;
  onSortChange?: (descriptor: SortDescriptor | null) => void;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: Selection;
  defaultSelectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  disabledKeys?: Iterable<Key>;
  selectionActions?: DataTableSelectionAction[];
  showSearch?: boolean;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
  getSearchText?: (row: T) => string;
  filters?: DataTableFilter<T>[];
  filterValues?: DataTableFilterValues;
  defaultFilterValues?: DataTableFilterValues;
  onFilterChange?: (values: DataTableFilterValues) => void;
  paging?: boolean;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  rowActions?: DataTableAction<T>[] | ((row: T) => DataTableAction<T>[]);
  inlineActionCount?: number;
  onRowAction?: (key: Key) => void;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<unknown>;
  emptyState?: ReactNode;
  noResultsState?: ReactNode;
  showCount?: boolean;
  toolbarActions?: ReactNode;
  density?: TableDensity;
  variant?: DataTableVariant;
  stickyRowHeader?: boolean;
  labels?: Partial<DataTableLabels>;
  paginationLabels?: Partial<PaginationLabels>;
  className?: string;
  style?: CSSProperties;
}

type BodyItem<T> =
  | { id: Key; kind: 'row'; row: T; index: number }
  | { id: string; kind: 'placeholder'; index: number };

interface ResolvedColumn<T> extends DataTableColumn<T> {
  type: DataTableColumnType;
  align: TableAlign;
  isActions?: boolean;
}

type Labels = ReturnType<typeof useLabels<DataTableLabels>>;

function defaultAlign(type: DataTableColumnType): TableAlign {
  return type === 'number' ? 'end' : 'start';
}

function hasError(error: unknown) {
  return error !== undefined && error !== null && error !== false;
}

function normalizeTags(value: unknown): DataTableTag[] {
  if (!Array.isArray(value)) return value == null || value === '' ? [] : [{ label: textOf(value) }];
  return value.map((item) =>
    item != null && typeof item === 'object' && 'label' in item
      ? (item as DataTableTag)
      : { label: textOf(item) },
  );
}

function sizeStyle(column: DataTableColumn<unknown>): CSSProperties | undefined {
  if (column.width == null && column.minWidth == null && column.maxWidth == null) return undefined;
  return { width: column.width, minWidth: column.minWidth, maxWidth: column.maxWidth };
}

function skeletonOf<T>(column: ResolvedColumn<T>): DataTableSkeleton {
  if (column.skeleton) return column.skeleton;
  if (column.type === 'status' || column.type === 'tags' || column.chip) return 'pill';
  if (column.isRowHeader && column.type === 'custom') return 'avatar';
  return 'text';
}

function headerText<T>(column: DataTableColumn<T>) {
  return column.textValue ?? (typeof column.header === 'string' ? column.header : column.id);
}

function isPromise(value: unknown): value is Promise<unknown> {
  return value != null && typeof (value as Promise<unknown>).then === 'function';
}

function useAnnouncement(message: string, isArmed: boolean) {
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    if (!isArmed) return;
    const timer = setTimeout(() => setAnnouncement(message), 600);
    return () => clearTimeout(timer);
  }, [message, isArmed]);
  return announcement;
}

function CountText({ count, text, formatted }: { count: number; text: string; formatted: string }) {
  const index = text.indexOf(formatted);
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <RollingNumber value={count} />
      {text.slice(index + formatted.length)}
    </>
  );
}

interface TagsCellProps {
  value: unknown;
  max: number;
  density: TableDensity;
  labels: Labels;
  formatter: Intl.NumberFormat;
}

function TagsCell({ value, max, density, labels: t, formatter }: TagsCellProps) {
  const tags = normalizeTags(value);
  const visible = tags.slice(0, Math.max(0, max));
  const rest = tags.slice(visible.length);
  const size = density === 'sm' ? 'sm' : 'md';
  const styles = dataTableStyles();
  const restText = rest.map((tag) => tag.label).join(', ');

  return (
    <div data-slot="data-table-tags" className={styles.tags()}>
      {visible.map((tag, index) => (
        <Tag key={String(tag.id ?? `${tag.label}-${index}`)} size={size} tone={tag.tone}>
          {tag.label}
        </Tag>
      ))}
      {rest.length ? (
        <TooltipTrigger delay={300}>
          <AriaButton
            aria-label={t.format('moreTagsLabel', {
              count: formatter.format(rest.length),
              tags: restText,
            })}
            data-slot="data-table-more-tags"
            className={tagStyles({ size, variant: 'outline' }).root({
              className: styles.moreTags(),
            })}
          >
            {t.format('moreTags', { count: formatter.format(rest.length) })}
          </AriaButton>
          <Tooltip>{restText}</Tooltip>
        </TooltipTrigger>
      ) : null}
    </div>
  );
}

interface RowActionsProps<T> {
  row: T;
  rowLabel: string;
  actions: DataTableAction<T>[];
  inlineCount: number;
  density: TableDensity;
  isPending: boolean;
  onMenuAction: (action: DataTableAction<T>) => void;
  labels: Labels;
}

function RowActions<T>({
  row,
  rowLabel,
  actions,
  inlineCount,
  density,
  isPending,
  onMenuAction,
  labels: t,
}: RowActionsProps<T>) {
  const icons = useIcons();
  const size = density === 'sm' ? 'xs' : 'sm';
  const inline = actions.slice(0, Math.max(0, inlineCount));
  const menu = actions.slice(inline.length);
  const styles = dataTableStyles();

  return (
    <div data-slot="data-table-actions" className={styles.actions()}>
      {inline.map((action) => (
        <TooltipTrigger key={String(action.id)} delay={300}>
          <IconButton
            variant="outline"
            tone={action.tone === 'error' ? 'error' : 'neutral'}
            size={size}
            aria-label={t.format('rowAction', { action: action.label, row: rowLabel })}
            icon={action.icon ?? <icons.edit />}
            isDisabled={action.isDisabled}
            onPress={() => action.onAction(row)}
            data-action={action.id}
          />
          <Tooltip>{action.label}</Tooltip>
        </TooltipTrigger>
      ))}
      {menu.length ? (
        <MenuTrigger>
          <TooltipTrigger delay={300}>
            <IconButton
              variant="outline"
              size={size}
              aria-label={t.format('moreActions', { row: rowLabel })}
              icon={<icons.moreVertical />}
              isPending={isPending}
            />
            <Tooltip>{t.more}</Tooltip>
          </TooltipTrigger>
          <Menu
            placement="bottom end"
            onAction={(key) => {
              const action = menu.find((candidate) => candidate.id === key);
              if (action) onMenuAction(action);
            }}
          >
            {menu.map((action) => (
              <MenuItem
                key={String(action.id)}
                id={action.id}
                startIcon={action.icon}
                tone={action.tone === 'error' ? 'error' : 'neutral'}
                isDisabled={action.isDisabled}
              >
                {action.label}
              </MenuItem>
            ))}
          </Menu>
        </MenuTrigger>
      ) : null}
    </div>
  );
}

const skeletonWidths = ['w-28', 'w-20', 'w-32', 'w-24', 'w-16'];

function PlaceholderCell<T>({
  column,
  index,
  density,
  inlineActions,
  label,
}: {
  column: ResolvedColumn<T>;
  index: number;
  density: TableDensity;
  inlineActions: number;
  label: string;
}) {
  const styles = dataTableStyles();
  const width = skeletonWidths[(index + column.id.length) % skeletonWidths.length];
  if (column.isActions) {
    const box = density === 'sm' ? 'size-7' : 'size-8';
    return (
      <div className={styles.actions()}>
        {Array.from({ length: inlineActions + 1 }, (_, slot) => (
          <Skeleton key={slot} shape="circle" className={box} />
        ))}
      </div>
    );
  }
  const kind = skeletonOf(column);
  const name = column.isRowHeader ? <span className="sr-only">{label}</span> : null;
  if (kind === 'avatar') {
    return (
      <div className={styles.skeletonMedia()}>
        <Skeleton shape="circle" className={density === 'sm' ? 'size-6' : 'size-8'} />
        <Skeleton shape="block" className={cn(styles.skeletonLine(), width)} />
        {name}
      </div>
    );
  }
  if (kind === 'pill') {
    return (
      <>
        <Skeleton
          shape="block"
          className={cn(styles.skeletonPill(), column.align === 'end' && 'ms-auto')}
        />
        {name}
      </>
    );
  }
  return (
    <>
      <Skeleton
        shape="block"
        className={cn(styles.skeletonLine(), column.align === 'end' ? 'ms-auto w-12' : width)}
      />
      {name}
    </>
  );
}

export function DataTable<T extends object>({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  data,
  columns,
  getRowId,
  getRowLabel,
  processing = 'client',
  totalCount,
  sortDescriptor: sortDescriptorProp,
  defaultSortDescriptor = null,
  onSortChange,
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  disabledKeys,
  selectionActions,
  showSearch = true,
  searchValue,
  defaultSearchValue = '',
  onSearchChange,
  getSearchText,
  filters,
  filterValues: filterValuesProp,
  defaultFilterValues,
  onFilterChange,
  paging = true,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize = 10,
  rowActions,
  inlineActionCount = 2,
  onRowAction,
  isLoading = false,
  error,
  onRetry,
  emptyState,
  noResultsState,
  showCount = true,
  toolbarActions,
  density = 'md',
  variant = 'outline',
  stickyRowHeader = variant !== 'transparent',
  labels,
  paginationLabels,
  className,
  style,
}: DataTableProps<T>) {
  const t = useLabels('dataTable', defaultDataTableLabels, labels);
  const statusLabels = useStatusTagLabels();
  const sharedStatuses = useStatusDefinitions();
  const icons = useIcons();
  const { locale } = useLocale();
  const isServer = processing === 'server';
  const tableRef = useRef<HTMLTableElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [sortDescriptor, setSortDescriptor] = useControllableState<SortDescriptor | null>(
    sortDescriptorProp,
    defaultSortDescriptor,
    onSortChange,
  );
  const [selection, setSelection] = useControllableState<Selection>(
    selectedKeys,
    defaultSelectedKeys ?? new Set<Key>(),
    onSelectionChange,
  );
  const [search, setSearch] = useControllableState(searchValue, defaultSearchValue, onSearchChange);
  const [filterValues, setFilterValues] = useControllableState<DataTableFilterValues>(
    filterValuesProp,
    defaultFilterValues ?? {},
    onFilterChange,
  );
  const [rawPage, setPage] = useControllableState(pageProp, defaultPage, onPageChange);
  const [pendingRows, setPendingRows] = useState<ReadonlySet<Key>>(() => new Set());
  const [hasQueried, setHasQueried] = useState(false);

  const collator = useMemo(
    () => new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }),
    [locale],
  );
  const integerFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const resolvedColumns = useMemo<ResolvedColumn<T>[]>(() => {
    const list = columns.map((column): ResolvedColumn<T> => {
      const type = column.type ?? (column.cell ? 'custom' : 'text');
      return { ...column, type, align: column.align ?? defaultAlign(type) };
    });
    if (!list.some((column) => column.isRowHeader) && list.length) {
      list[0] = { ...list[0], isRowHeader: true };
    }
    if (rowActions) {
      list.push({
        id: actionsColumnId,
        header: t.actions,
        textValue: t.actions,
        type: 'custom',
        align: 'end',
        isActions: true,
      });
    }
    return list;
  }, [columns, rowActions, t.actions]);

  const formatters = useMemo(() => {
    const map = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();
    for (const column of resolvedColumns) {
      if (column.type === 'number') {
        map.set(
          column.id,
          new Intl.NumberFormat(locale, column.formatOptions as Intl.NumberFormatOptions),
        );
      } else if (column.type === 'date') {
        map.set(
          column.id,
          new Intl.DateTimeFormat(
            locale,
            (column.formatOptions as Intl.DateTimeFormatOptions) ?? { dateStyle: 'medium' },
          ),
        );
      }
    }
    return map;
  }, [resolvedColumns, locale]);

  function statusDefinitions(column: DataTableColumn<T>) {
    return mergeStatusDefinitions(sharedStatuses, column.statuses);
  }

  function columnValue(column: DataTableColumn<T>, row: T) {
    return readValue(row, column.accessor ?? (column.id as keyof T));
  }

  function columnText(column: ResolvedColumn<T>, row: T) {
    if (column.getSearchText) return column.getSearchText(row);
    const value = columnValue(column, row);
    if (column.type === 'status') {
      return resolveStatus(textOf(value), statusDefinitions(column), statusLabels).label;
    }
    if (column.type === 'tags') {
      return normalizeTags(value)
        .map((tag) => tag.label)
        .join(' ');
    }
    if (column.type === 'date' || column.type === 'number') return '';
    return textOf(value);
  }

  const rowHeaderColumn = resolvedColumns.find((column) => column.isRowHeader);

  function labelOf(row: T) {
    if (getRowLabel) return getRowLabel(row);
    if (!rowHeaderColumn) return String(getRowId(row));
    return textOf(columnValue(rowHeaderColumn, row)) || String(getRowId(row));
  }

  const processed = (() => {
    if (isServer) return [...data];
    let rows = [...data];
    for (const filter of filters ?? []) {
      const selected = filterValues[filter.id];
      if (selected == null) continue;
      const column = resolvedColumns.find((candidate) => candidate.id === filter.id);
      rows = rows.filter((row) =>
        filter.predicate
          ? filter.predicate(row, selected)
          : matchesFilterValue(
              readValue(row, filter.accessor ?? column?.accessor ?? (filter.id as keyof T)),
              selected,
            ),
      );
    }
    if (search.trim()) {
      rows = searchRows(
        rows,
        search,
        getSearchText ??
          ((row) =>
            resolvedColumns
              .filter((column) => !column.isActions)
              .map((column) => columnText(column, row))
              .join(' ')),
        locale,
      );
    }
    if (sortDescriptor) {
      const column = resolvedColumns.find((candidate) => candidate.id === sortDescriptor.column);
      if (column) {
        const compare =
          column.compare ??
          ((a: T, b: T) =>
            column.type === 'status'
              ? collator.compare(columnText(column, a), columnText(column, b))
              : compareValues(columnValue(column, a), columnValue(column, b), collator));
        rows = sortRows(rows, compare, sortDescriptor.direction);
      }
    }
    return rows;
  })();

  const total = isServer ? (totalCount ?? data.length) : processed.length;
  const pageCount = paging ? getPageCount(total, pageSize) : 1;
  const page = clampPage(rawPage, pageCount);
  const pageRows = paging && !isServer ? paginateRows(processed, page, pageSize) : processed;
  const pageKeys = pageRows.map(getRowId);
  const isQueried = search.trim() !== '' || hasActiveFilters(filterValues);
  const showError = hasError(error) && !isLoading;

  const bodyItems: BodyItem<T>[] = isLoading
    ? Array.from({ length: Math.min(pageSize, 10) }, (_, index) => ({
        id: `__ds-placeholder-${index}`,
        kind: 'placeholder' as const,
        index,
      }))
    : showError
      ? []
      : pageRows.map((row, index) => ({ id: getRowId(row), kind: 'row' as const, row, index }));

  const knownKeys = isServer ? null : new Set(data.map(getRowId));
  const selectedCount =
    selection === 'all' || !knownKeys
      ? selectionSize(selection, total)
      : [...selection].filter((key) => knownKeys.has(key)).length;
  const formattedTotal = integerFormatter.format(total);
  const resultText = t.format('resultCount', { count: formattedTotal });
  const formattedSelected = integerFormatter.format(selectedCount);
  const selectedText = t.format('selectedCount', { count: formattedSelected });
  const announcement = useAnnouncement(isLoading ? '' : resultText, hasQueried && !isLoading);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    if (isLoading) table.setAttribute('aria-busy', 'true');
    else table.removeAttribute('aria-busy');
  }, [isLoading]);

  function markQueried() {
    if (!hasQueried) setHasQueried(true);
  }

  function updateSearch(value: string) {
    markQueried();
    setSearch(value);
    setPage(1);
  }

  function updateFilter(id: string, value: Key | null) {
    markQueried();
    setFilterValues({ ...filterValues, [id]: value });
    setPage(1);
  }

  function clearQuery() {
    markQueried();
    setSearch('');
    setFilterValues(Object.fromEntries(Object.keys(filterValues).map((key) => [key, null])));
    setPage(1);
    searchRef.current?.focus();
  }

  function updateSort(descriptor: SortDescriptor) {
    setSortDescriptor(descriptor);
    setPage(1);
  }

  function updateSelection(next: Selection) {
    setSelection(
      mergePageSelection(selection, next, pageKeys, isServer ? undefined : processed.map(getRowId)),
    );
  }

  function selectedSet() {
    if (selection === 'all') return new Set(isServer ? pageKeys : processed.map(getRowId));
    return new Set(knownKeys ? [...selection].filter((key) => knownKeys.has(key)) : selection);
  }

  function focusTable() {
    requestAnimationFrame(() => {
      const target =
        tableRef.current?.querySelector<HTMLElement>(
          '[role="row"][tabindex], [role="gridcell"][tabindex]',
        ) ?? tableRef.current;
      target?.focus();
    });
  }

  function clearSelection() {
    setSelection(new Set());
    focusTable();
  }

  function runSelectionAction(action: DataTableSelectionAction) {
    const result = action.onAction(selectedSet());
    if (isPromise(result)) return result.then(clearSelection);
    clearSelection();
  }

  function runMenuAction(row: T, action: DataTableAction<T>) {
    const key = getRowId(row);
    const result = action.onAction(row);
    if (!isPromise(result)) return;
    setPendingRows((current) => new Set(current).add(key));
    const settle = () =>
      setPendingRows((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    result.then(settle, settle);
  }

  function renderValue(column: ResolvedColumn<T>, row: T, rowLabel: string) {
    const context: DataTableCellContext = { density, rowLabel };
    if (column.cell) return column.cell(row, context);
    const value = columnValue(column, row);
    const styles = dataTableStyles({ density });

    if (column.type === 'status') {
      const status = textOf(value);
      const definitions = statusDefinitions(column);
      if (column.onStatusChange) {
        return (
          <StatusSelect
            aria-label={t.format('editCell', { column: headerText(column), row: rowLabel })}
            size="sm"
            value={status}
            options={column.statusOptions ?? Object.keys(column.statuses ?? {})}
            statuses={definitions ?? undefined}
            onChange={(next) => column.onStatusChange?.(row, next)}
            className={styles.statusSelect()}
          />
        );
      }
      return (
        <StatusTag
          status={status}
          statuses={column.statuses}
          size={density === 'sm' ? 'sm' : 'md'}
        />
      );
    }

    if (column.type === 'tags') {
      return (
        <TagsCell
          value={value}
          max={column.maxVisibleTags ?? 2}
          density={density}
          labels={t}
          formatter={integerFormatter}
        />
      );
    }

    let content: ReactNode = textOf(value);
    let tone = styles.text();
    if (column.type === 'number' && value != null && value !== '') {
      const formatter = formatters.get(column.id) as Intl.NumberFormat;
      content = formatter.format(Number(value));
      tone = styles.number();
    } else if (column.type === 'date') {
      const date = toDate(value);
      const formatter = formatters.get(column.id) as Intl.DateTimeFormat;
      content = date ? <time dateTime={date.toISOString()}>{formatter.format(date)}</time> : null;
      tone = styles.date();
    }

    if (column.chip && content != null && content !== '') {
      return (
        <span data-slot="data-table-chip" className={styles.chip()}>
          {content}
        </span>
      );
    }
    return <span className={tone}>{content}</span>;
  }

  const hasToolbar = showCount || showSearch || Boolean(filters?.length) || toolbarActions != null;
  const styles = dataTableStyles({ variant, density, hasToolbar });
  const tableSelection = scopeSelection(selection, pageKeys);
  const showFooter = paging && pageCount > 1 && !showError;
  const showSelectionBar = selectionMode !== 'none' && selectedCount > 0;

  function renderEmpty() {
    if (showError) {
      return (
        <div data-slot="data-table-error" className={styles.state()}>
          <EmptyState
            size="sm"
            headingLevel={3}
            icon={<icons.error />}
            title={t.errorTitle}
            description={t.errorDescription}
            primaryAction={
              onRetry ? (
                <Button variant="soft" size="sm" onPress={onRetry}>
                  {t.retry}
                </Button>
              ) : undefined
            }
          />
        </div>
      );
    }
    if (isQueried && (isServer || data.length > 0)) {
      return (
        <div data-slot="data-table-no-results" className={styles.state()}>
          {noResultsState ?? (
            <EmptyState
              size="sm"
              headingLevel={3}
              icon={<icons.search />}
              title={t.noResultsTitle}
              description={t.noResultsDescription}
              primaryAction={
                <Button variant="soft" size="sm" onPress={clearQuery}>
                  {t.clearFilters}
                </Button>
              }
            />
          )}
        </div>
      );
    }
    return (
      <div data-slot="data-table-empty" className={styles.state()}>
        {emptyState ?? (
          <EmptyState
            size="sm"
            headingLevel={3}
            icon={<icons.inbox />}
            title={t.emptyTitle}
            description={t.emptyDescription}
          />
        )}
      </div>
    );
  }

  const renderDependencies = [
    density,
    locale,
    resolvedColumns,
    formatters,
    pendingRows,
    t,
    statusLabels,
    sharedStatuses,
    rowActions,
    inlineActionCount,
  ];

  return (
    <div
      data-slot="data-table"
      data-variant={variant}
      data-density={density}
      data-processing={processing}
      data-loading={isLoading || undefined}
      className={styles.root({ className })}
      style={style}
    >
      {hasToolbar ? (
        <div data-slot="data-table-toolbar" className={styles.toolbar()}>
          <div data-slot="data-table-summary" className={styles.summary()}>
            {showSelectionBar ? (
              <div data-slot="data-table-selection-bar" className={styles.selectionBar()}>
                <TooltipTrigger delay={300}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label={t.clearSelection}
                    icon={<icons.close />}
                    onPress={clearSelection}
                  />
                  <Tooltip>{t.clearSelection}</Tooltip>
                </TooltipTrigger>
                <span data-slot="data-table-selected-count" className={styles.selectionCount()}>
                  <CountText
                    count={selectedCount}
                    text={selectedText}
                    formatted={formattedSelected}
                  />
                </span>
                {selectionActions?.length ? (
                  <>
                    <span aria-hidden="true" className={styles.selectionDivider()} />
                    {selectionActions.map((action) => (
                      <Button
                        key={String(action.id)}
                        variant="outline"
                        tone={action.tone === 'error' ? 'error' : 'neutral'}
                        size="sm"
                        startIcon={action.icon}
                        onPress={() => runSelectionAction(action)}
                        className={action.icon ? styles.selectionAction() : undefined}
                      >
                        <span className={action.icon ? styles.selectionActionLabel() : undefined}>
                          {action.label}
                        </span>
                      </Button>
                    ))}
                  </>
                ) : null}
              </div>
            ) : showCount ? (
              <>
                <span data-slot="data-table-total-label" className={styles.summaryLabel()}>
                  {t.totalResults}
                </span>
                {isLoading && total === 0 ? (
                  <Skeleton shape="block" className={styles.summarySkeleton()} />
                ) : (
                  <span data-slot="data-table-total" className={styles.summaryValue()}>
                    <CountText count={total} text={resultText} formatted={formattedTotal} />
                  </span>
                )}
              </>
            ) : null}
          </div>
          {filters?.length || showSearch || toolbarActions != null ? (
            <div data-slot="data-table-controls" className={styles.controls()}>
              {filters?.length ? (
                <div data-slot="data-table-filters" className={styles.filters()}>
                  {filters.map((filter) => (
                    <Select
                      key={filter.id}
                      aria-label={filter.label}
                      size="sm"
                      value={filterValues[filter.id] ?? allKey}
                      onChange={(key) =>
                        updateFilter(filter.id, key == null || key === allKey ? null : key)
                      }
                      className={styles.filter()}
                    >
                      <ListBoxItem id={allKey}>{filter.allLabel ?? t.all}</ListBoxItem>
                      {filter.options.map((option) => (
                        <ListBoxItem key={String(option.id)} id={option.id}>
                          {option.label}
                        </ListBoxItem>
                      ))}
                    </Select>
                  ))}
                </div>
              ) : null}
              {showSearch ? (
                <SearchField
                  inputRef={searchRef}
                  aria-label={t.search}
                  placeholder={t.search}
                  size="sm"
                  variant="soft"
                  value={search}
                  onChange={updateSearch}
                  className={styles.search()}
                />
              ) : null}
              {toolbarActions}
            </div>
          ) : null}
        </div>
      ) : null}
      <div data-slot="data-table-body" className={styles.tableArea()}>
        <Table
          ref={tableRef}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          density={density}
          stickyRowHeader={stickyRowHeader}
          selectionMode={selectionMode}
          selectedKeys={tableSelection}
          onSelectionChange={updateSelection}
          disabledKeys={disabledKeys}
          sortDescriptor={sortDescriptor ?? undefined}
          onSortChange={updateSort}
          onRowAction={onRowAction}
        >
          <TableHeader columns={resolvedColumns} dependencies={[t.actions]}>
            {(column) => (
              <Column
                id={column.id}
                isRowHeader={column.isRowHeader}
                allowsSorting={column.allowsSorting}
                align={column.align}
                textValue={headerText(column)}
                style={sizeStyle(column as DataTableColumn<unknown>)}
                className={column.isActions ? styles.actionsColumn() : undefined}
              >
                {column.isActions ? (
                  <span className="sr-only">{column.header}</span>
                ) : (
                  column.header
                )}
              </Column>
            )}
          </TableHeader>
          <TableBody
            items={bodyItems}
            dependencies={renderDependencies}
            renderEmptyState={renderEmpty}
          >
            {(item) => {
              if (item.kind === 'placeholder') {
                return (
                  <Row
                    id={item.id}
                    columns={resolvedColumns}
                    isDisabled
                    isPlaceholder
                    dependencies={renderDependencies}
                  >
                    {(column) => (
                      <Cell align={column.align} className={styles.cell()}>
                        <PlaceholderCell
                          column={column}
                          index={item.index}
                          density={density}
                          inlineActions={inlineActionCount}
                          label={t.loading}
                        />
                      </Cell>
                    )}
                  </Row>
                );
              }
              const rowLabel = labelOf(item.row);
              const actions = rowActions
                ? typeof rowActions === 'function'
                  ? rowActions(item.row)
                  : rowActions
                : [];
              return (
                <Row
                  id={item.id}
                  columns={resolvedColumns}
                  index={item.index}
                  textValue={rowLabel}
                  dependencies={[...renderDependencies, item.row]}
                >
                  {(column) => (
                    <Cell
                      align={column.align}
                      textValue={column.isRowHeader ? rowLabel : undefined}
                      className={styles.cell()}
                    >
                      {column.isActions ? (
                        <RowActions
                          row={item.row}
                          rowLabel={rowLabel}
                          actions={actions}
                          inlineCount={inlineActionCount}
                          density={density}
                          isPending={pendingRows.has(item.id)}
                          onMenuAction={(action) => runMenuAction(item.row, action)}
                          labels={t}
                        />
                      ) : (
                        renderValue(column, item.row, rowLabel)
                      )}
                    </Cell>
                  )}
                </Row>
              );
            }}
          </TableBody>
        </Table>
      </div>
      {showFooter ? (
        <div data-slot="data-table-footer" className={styles.footer()}>
          <Pagination
            aria-label={ariaLabel ? t.format('pagination', { table: ariaLabel }) : undefined}
            size="sm"
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            isDisabled={isLoading}
            labels={paginationLabels}
          />
        </div>
      ) : null}
      <div role="status" data-slot="data-table-status" className={styles.live()}>
        {isLoading ? t.loading : announcement}
      </div>
    </div>
  );
}
