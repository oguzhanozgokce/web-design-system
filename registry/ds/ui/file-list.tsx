'use client';

import { createContext, use, type ComponentProps, type ReactNode } from 'react';
import {
  GridList,
  GridListItem,
  Text,
  useLocale,
  type GridListItemProps,
  type GridListProps,
  type Key,
} from 'react-aria-components';
import {
  formatFileSize,
  getFileExtension,
  getFileKind,
  type FileDescriptor,
  type FileKind,
} from '@/registry/ds/lib/files';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { cn, tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { LinearProgress } from '@/registry/ds/ui/progress';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

export type { FileDescriptor, FileKind } from '@/registry/ds/lib/files';

export type FileItemStatus = 'idle' | 'queued' | 'uploading' | 'complete' | 'error';

export type FileListVariant = 'outline' | 'soft' | 'transparent';

export interface FileListLabels {
  list: string;
  remove: LabelTemplate<{ name: string }>;
  cancel: LabelTemplate<{ name: string }>;
  retry: LabelTemplate<{ name: string }>;
  queued: string;
  uploading: string;
  complete: string;
  failed: string;
}

export const defaultFileListLabels: FileListLabels = {
  list: 'Files',
  remove: 'Remove {name}',
  cancel: 'Cancel {name}',
  retry: 'Retry {name}',
  queued: 'Waiting',
  uploading: 'Uploading',
  complete: 'Uploaded',
  failed: 'Upload failed',
};

const lightInk = 'fill-surface-raised';
const darkInk = 'fill-[light-dark(var(--on-surface),var(--surface-raised))]';
const paleInk = 'fill-[light-dark(var(--surface-raised),var(--on-surface))]';

export const fileKindTones: Record<FileKind, { label: string; ink: string }> = {
  image: { label: 'fill-chart-6', ink: paleInk },
  video: { label: 'fill-chart-7', ink: lightInk },
  audio: { label: 'fill-chart-5', ink: darkInk },
  pdf: { label: 'fill-chart-8', ink: lightInk },
  document: { label: 'fill-chart-1', ink: lightInk },
  spreadsheet: { label: 'fill-chart-3', ink: darkInk },
  presentation: { label: 'fill-chart-2', ink: darkInk },
  archive: { label: 'fill-chart-4', ink: darkInk },
  code: { label: 'fill-on-surface-variant', ink: lightInk },
  other: { label: 'fill-on-surface-variant', ink: lightInk },
};

export interface FileIconProps extends Omit<ComponentProps<'svg'>, 'children'> {
  file: Pick<FileDescriptor, 'name' | 'type'>;
  kind?: FileKind;
}

export function FileIcon({ file, kind, className, ...props }: FileIconProps) {
  const resolvedKind = kind ?? getFileKind(file);
  const extension = getFileExtension(file.name).slice(0, 4).toUpperCase();
  const tone = fileKindTones[resolvedKind];
  const wide = extension.length > 3;
  const labelWidth = wide ? 31 : 27;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-slot="file-icon"
      data-kind={resolvedKind}
      className={cn('size-10 shrink-0 overflow-visible', className)}
      {...props}
    >
      <path
        d="M11 1.75h15.5l9.75 9.75V35a3.25 3.25 0 0 1-3.25 3.25H11A3.25 3.25 0 0 1 7.75 35V5A3.25 3.25 0 0 1 11 1.75Z"
        strokeWidth={1.5}
        strokeLinejoin="round"
        className="fill-surface-raised stroke-outline-variant"
      />
      <path
        d="M26.5 1.75V8.5a3 3 0 0 0 3 3h6.75"
        strokeWidth={1.5}
        strokeLinejoin="round"
        className="stroke-outline-variant"
      />
      {extension ? (
        <>
          <rect
            x="1"
            y="18"
            width={labelWidth}
            height="16"
            rx="8"
            data-slot="file-icon-label"
            className={tone.label}
          />
          <text
            x={1 + labelWidth / 2}
            y={wide ? 28.9 : 29.2}
            textAnchor="middle"
            fontSize={wide ? 8 : 9}
            fontWeight="600"
            className={tone.ink}
          >
            {extension}
          </text>
        </>
      ) : null}
    </svg>
  );
}

export const fileListStyles = tv({
  slots: {
    list: 'flex w-full min-w-0 flex-col gap-2 outline-none',
    row: [
      'group/file-item focus-ring relative grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-start text-on-surface',
      'data-[disabled]:opacity-50',
    ],
    icon: 'size-10',
    body: 'flex min-w-0 flex-col',
    name: 'flex min-w-0 text-sm font-medium',
    nameText: 'inline-flex max-w-full min-w-0',
    stem: 'min-w-0 truncate',
    extension: 'shrink-0',
    meta: 'mt-1 flex min-w-0 items-center gap-1 text-xs text-on-surface-variant tabular-digits',
    metaStatus: 'min-w-0 truncate',
    separator: 'shrink-0',
    barRow: 'grid grid-rows-[1fr] data-[collapsed]:grid-rows-[0fr] data-[collapsed]:opacity-0',
    barClip: 'min-h-0 overflow-hidden',
    bar: 'pt-2',
    end: 'flex shrink-0 items-center gap-1',
    statusSlot: 'grid size-5 shrink-0 place-items-center',
    check:
      'grid size-5 place-items-center rounded-full bg-success-solid text-on-success-solid [&_svg]:size-3.5',
    failed: 'text-error [&_svg]:size-5',
  },
  variants: {
    variant: {
      outline: { row: 'rounded-container border border-outline-subtle bg-surface-raised p-3' },
      soft: { row: 'rounded-container bg-neutral-soft p-3' },
      transparent: { row: 'rounded-item' },
    },
    motion: {
      full: {
        row: 'transition-[opacity,translate] duration-250 ease-fluid starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none',
        barRow:
          'transition-[grid-template-rows,opacity] duration-300 ease-fluid data-[status=complete]:delay-500 motion-reduce:transition-opacity',
        check:
          'transition-[scale,opacity] duration-(--ds-duration-spatial-fast) ease-(--ds-ease-spatial-fast) starting:scale-0 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:starting:scale-100',
      },
      reduced: {
        row: 'transition-opacity duration-150 ease-out starting:opacity-0',
        barRow: 'transition-opacity duration-150 ease-out data-[status=complete]:delay-500',
        check: 'transition-opacity duration-150 ease-out starting:opacity-0',
      },
      none: {},
    },
  },
  defaultVariants: {
    variant: 'outline',
    motion: 'full',
  },
});

function useFileMotion() {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (spatialEnabled) return 'full' as const;
  return effectsEnabled ? ('reduced' as const) : ('none' as const);
}

const percentFormat: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };

function splitName(name: string) {
  const extension = getFileExtension(name);
  if (!extension) return { stem: name, extension: '' };
  const at = name.length - extension.length - 1;
  return { stem: name.slice(0, at), extension: name.slice(at) };
}

export interface FileListEntry {
  id: Key;
  file: FileDescriptor;
  status?: FileItemStatus;
  progress?: number;
  error?: string;
}

interface FileListContextValue {
  variant: FileListVariant;
  isDisabled?: boolean;
  labels?: Partial<FileListLabels>;
  onRemove?: (id: Key) => void;
  onCancel?: (id: Key) => void;
  onRetry?: (id: Key) => void;
}

const FileListContext = createContext<FileListContextValue>({ variant: 'outline' });

export interface FileItemProps extends Omit<
  GridListItemProps,
  'children' | 'className' | 'textValue' | 'onAction'
> {
  file: FileDescriptor;
  status?: FileItemStatus;
  progress?: number;
  error?: string;
  icon?: ReactNode;
  onRemove?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  labels?: Partial<FileListLabels>;
  className?: string;
}

export function FileItem({
  file,
  status = 'idle',
  progress,
  error,
  icon,
  onRemove,
  onCancel,
  onRetry,
  labels,
  className,
  id,
  isDisabled,
  ...props
}: FileItemProps) {
  const list = use(FileListContext);
  const t = useLabels('fileList', defaultFileListLabels, { ...list.labels, ...labels });
  const icons = useIcons();
  const { locale } = useLocale();
  const motion = useFileMotion();
  const styles = fileListStyles({ variant: list.variant, motion });
  const { stem, extension } = splitName(file.name);
  const fraction = status === 'complete' ? 1 : Math.min(1, Math.max(0, progress ?? 0));
  const measured = status !== 'uploading' || progress != null;
  const tracksUpload = status !== 'idle';
  const barOpen = status === 'queued' || status === 'uploading';
  const disabled = isDisabled || list.isDisabled;

  const remove = onRemove ?? (list.onRemove && id != null ? () => list.onRemove?.(id) : undefined);
  const cancel = onCancel ?? (list.onCancel && id != null ? () => list.onCancel?.(id) : undefined);
  const retry = onRetry ?? (list.onRetry && id != null ? () => list.onRetry?.(id) : undefined);
  const running = status === 'queued' || status === 'uploading';
  const dismiss = running && cancel ? cancel : remove;
  const dismissLabel =
    running && cancel
      ? t.format('cancel', { name: file.name })
      : t.format('remove', { name: file.name });

  return (
    <GridListItem
      {...props}
      id={id}
      textValue={file.name}
      isDisabled={disabled}
      data-status={status}
      className={styles.row({ className })}
    >
      {icon ?? <FileIcon file={file} className={styles.icon()} />}
      <div data-slot="body" className={styles.body()}>
        <span data-slot="name" className={styles.name()}>
          <span aria-hidden="true" dir="auto" className={styles.nameText()}>
            <span data-slot="name-stem" className={styles.stem()}>
              {stem}
            </span>
            {extension ? <span className={styles.extension()}>{extension}</span> : null}
          </span>
          <span className="sr-only">{file.name}</span>
        </span>
        <Text slot="description" data-slot="meta" className={styles.meta()}>
          <span className="shrink-0">{formatFileSize(file.size, locale)}</span>
          {tracksUpload ? (
            <>
              <span aria-hidden="true" className={styles.separator()}>
                ·
              </span>
              {status === 'uploading' && measured ? (
                <>
                  <span className="sr-only">{t.uploading}</span>
                  <RollingNumber
                    value={fraction}
                    formatOptions={percentFormat}
                    isAnimated={motion === 'full'}
                  />
                </>
              ) : (
                <span
                  data-slot="status"
                  className={styles.metaStatus({
                    className: status === 'error' ? 'text-error' : '',
                  })}
                >
                  {status === 'queued'
                    ? t.queued
                    : status === 'uploading'
                      ? t.uploading
                      : status === 'complete'
                        ? t.complete
                        : (error ?? t.failed)}
                </span>
              )}
            </>
          ) : null}
        </Text>
        {tracksUpload ? (
          <div
            data-slot="progress-row"
            data-status={status}
            data-collapsed={barOpen ? undefined : true}
            className={styles.barRow()}
          >
            <div
              aria-hidden={status === 'uploading' ? undefined : true}
              className={styles.barClip()}
            >
              {status === 'error' ? null : (
                <LinearProgress
                  size="sm"
                  value={fraction * 100}
                  isIndeterminate={!measured}
                  aria-label={file.name}
                  className={styles.bar()}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
      <div data-slot="actions" className={styles.end()}>
        {tracksUpload ? (
          <span data-slot="status-icon" className={styles.statusSlot()}>
            {status === 'complete' ? (
              <span data-slot="check" className={styles.check()}>
                <icons.check />
              </span>
            ) : status === 'error' ? (
              <span className={styles.failed()}>
                <icons.error />
              </span>
            ) : null}
          </span>
        ) : null}
        {status === 'error' && retry ? (
          <IconButton
            size="xs"
            icon={<icons.refresh />}
            aria-label={t.format('retry', { name: file.name })}
            isDisabled={disabled}
            onPress={retry}
          />
        ) : null}
        {dismiss ? (
          <IconButton
            size="xs"
            icon={<icons.close />}
            aria-label={dismissLabel}
            isDisabled={disabled}
            onPress={dismiss}
          />
        ) : null}
      </div>
    </GridListItem>
  );
}

export interface FileListProps<T extends FileListEntry = FileListEntry> extends Omit<
  GridListProps<T>,
  'children' | 'className' | 'items' | 'layout'
> {
  items?: Iterable<T>;
  children?: ReactNode | ((item: T) => ReactNode);
  variant?: FileListVariant;
  isDisabled?: boolean;
  onRemove?: (id: Key) => void;
  onCancel?: (id: Key) => void;
  onRetry?: (id: Key) => void;
  labels?: Partial<FileListLabels>;
  className?: string;
}

function renderEntry(entry: FileListEntry) {
  return (
    <FileItem
      id={entry.id}
      file={entry.file}
      status={entry.status}
      progress={entry.progress}
      error={entry.error}
    />
  );
}

export function FileList<T extends FileListEntry = FileListEntry>({
  items,
  children,
  variant = 'outline',
  isDisabled,
  onRemove,
  onCancel,
  onRetry,
  labels,
  className,
  ...props
}: FileListProps<T>) {
  const t = useLabels('fileList', defaultFileListLabels, labels);
  const styles = fileListStyles({ variant });
  const ariaLabel = props['aria-label'] ?? (props['aria-labelledby'] ? undefined : t.list);

  return (
    <FileListContext value={{ variant, isDisabled, labels, onRemove, onCancel, onRetry }}>
      <GridList
        {...props}
        aria-label={ariaLabel}
        items={items}
        layout="stack"
        data-slot="file-list"
        data-variant={variant}
        className={styles.list({ className })}
      >
        {children ?? renderEntry}
      </GridList>
    </FileListContext>
  );
}
