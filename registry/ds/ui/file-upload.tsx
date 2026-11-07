'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useLocale, type Key } from 'react-aria-components';
import type { FileDescriptor } from '@/registry/ds/lib/files';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { tv } from '@/registry/ds/lib/utils';
import { useLabels } from '@/registry/ds/ui/ds-provider';
import {
  FileDropzone,
  type FileDropzoneLabels,
  type FileDropzoneProps,
} from '@/registry/ds/ui/file-dropzone';
import {
  FileItem,
  FileList,
  type FileItemStatus,
  type FileListLabels,
  type FileListVariant,
} from '@/registry/ds/ui/file-list';

export type FileUploadStatus = FileItemStatus;

export type FileUploadLayout = 'list' | 'single';

export interface FileUploadItem {
  id: Key;
  file: File | FileDescriptor;
  status: FileUploadStatus;
  progress?: number;
  error?: string;
}

export interface FileUploadContext {
  signal: AbortSignal;
  onProgress: (fraction: number) => void;
}

export class FileUploadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FileUploadError';
  }
}

export interface FileUploadLabels {
  dropToReplace: string;
  uploadedAnnouncement: LabelTemplate<{ name: string }>;
  failedAnnouncement: LabelTemplate<{ name: string }>;
  addedAnnouncement: LabelTemplate<{ name: string; count: string }>;
}

export const defaultFileUploadLabels: FileUploadLabels = {
  dropToReplace: 'Drop to replace',
  uploadedAnnouncement: '{name} uploaded',
  failedAnnouncement: '{name} couldn’t be uploaded',
  addedAnnouncement: ({ name, count }) =>
    count === '1' ? `${name} added` : `${count} files added`,
};

export const fileUploadStyles = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col gap-3',
    status: 'sr-only',
  },
});

export interface FileUploadProps extends Omit<
  FileDropzoneProps,
  'onSelect' | 'labels' | 'children' | 'fileCount'
> {
  value?: FileUploadItem[];
  defaultValue?: FileUploadItem[];
  onChange?: (items: FileUploadItem[]) => void;
  onUpload?: (file: File, context: FileUploadContext) => Promise<unknown>;
  maxConcurrent?: number;
  layout?: FileUploadLayout;
  listVariant?: FileListVariant;
  labels?: Partial<FileUploadLabels & FileDropzoneLabels & FileListLabels>;
}

function isUploadable(file: File | FileDescriptor): file is File {
  return typeof Blob !== 'undefined' && file instanceof Blob;
}

function clampFraction(value: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

export function FileUpload({
  value,
  defaultValue,
  onChange,
  onUpload,
  maxConcurrent = 3,
  layout = 'list',
  listVariant = 'outline',
  labels,
  allowsMultiple,
  maxFiles,
  isDisabled,
  label,
  className,
  ...dropzoneProps
}: FileUploadProps) {
  const t = useLabels('fileUpload', defaultFileUploadLabels, labels);
  const { locale } = useLocale();
  const baseId = useId();
  const nextId = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const focusBrowseNext = useRef(false);
  const running = useRef(new Map<Key, AbortController>());
  const [internal, setInternal] = useState<FileUploadItem[]>(defaultValue ?? []);
  const [announcement, setAnnouncement] = useState({ message: '', count: 0 });
  const isControlled = value !== undefined;
  const items = isControlled ? value : internal;
  const latest = useRef(items);
  const settings = useRef({ onChange, onUpload, isControlled, maxConcurrent, t, locale });
  const single = layout === 'single';

  useLayoutEffect(() => {
    latest.current = items;
  }, [items]);

  useLayoutEffect(() => {
    settings.current = { onChange, onUpload, isControlled, maxConcurrent, t, locale };
  });

  useEffect(() => {
    const uploads = running.current;
    return () => {
      for (const controller of uploads.values()) controller.abort();
      uploads.clear();
    };
  }, []);

  useLayoutEffect(() => {
    if (!focusBrowseNext.current || items.length > 0) return;
    focusBrowseNext.current = false;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    rootRef.current?.querySelector<HTMLElement>('[data-slot="file-dropzone-browse"]')?.focus();
  }, [items.length]);

  function commit(update: (current: FileUploadItem[]) => FileUploadItem[]) {
    const next = update(latest.current);
    if (next === latest.current) return;
    latest.current = next;
    if (!settings.current.isControlled) setInternal(next);
    settings.current.onChange?.(next);
  }

  function patch(id: Key, changes: Partial<FileUploadItem>) {
    commit((current) =>
      current.some((item) => item.id === id)
        ? current.map((item) => (item.id === id ? { ...item, ...changes } : item))
        : current,
    );
  }

  function announce(message: string) {
    setAnnouncement((previous) => ({ message, count: previous.count + 1 }));
  }

  function start(item: FileUploadItem, file: File) {
    const upload = settings.current.onUpload;
    if (!upload) return;
    const controller = new AbortController();
    running.current.set(item.id, controller);
    patch(item.id, { status: 'uploading', progress: undefined, error: undefined });
    let settled = false;
    Promise.resolve()
      .then(() =>
        upload(file, {
          signal: controller.signal,
          onProgress: (fraction) => {
            if (controller.signal.aborted || settled) return;
            patch(item.id, { progress: clampFraction(fraction) });
          },
        }),
      )
      .then(
        () => {
          if (controller.signal.aborted) return;
          settled = true;
          patch(item.id, { status: 'complete', progress: 1 });
          announce(settings.current.t.format('uploadedAnnouncement', { name: file.name }));
        },
        (reason: unknown) => {
          if (controller.signal.aborted) return;
          settled = true;
          patch(item.id, {
            status: 'error',
            error: reason instanceof FileUploadError ? reason.message : undefined,
          });
          announce(settings.current.t.format('failedAnnouncement', { name: file.name }));
        },
      )
      .finally(() => {
        if (running.current.get(item.id) === controller) running.current.delete(item.id);
        pump();
      });
  }

  function pump() {
    const limit = Math.max(1, settings.current.maxConcurrent);
    for (const item of latest.current) {
      if (running.current.size >= limit) break;
      if (item.status !== 'queued' || running.current.has(item.id)) continue;
      if (isUploadable(item.file)) start(item, item.file);
    }
  }

  function stop(id: Key) {
    running.current.get(id)?.abort();
    running.current.delete(id);
  }

  function add(files: File[]) {
    const status: FileUploadStatus = settings.current.onUpload ? 'queued' : 'idle';
    const added: FileUploadItem[] = files.map((file) => ({
      id: `${baseId}-${nextId.current++}`,
      file,
      status,
    }));
    if (single) {
      for (const item of latest.current) stop(item.id);
      commit(() => added.slice(0, 1));
    } else {
      commit((current) => [...current, ...added]);
    }
    if (status === 'idle' && added.length) {
      announce(
        settings.current.t.format('addedAnnouncement', {
          name: added[0].file.name,
          count: new Intl.NumberFormat(settings.current.locale).format(added.length),
        }),
      );
    }
    pump();
  }

  function remove(id: Key) {
    stop(id);
    commit((current) => current.filter((item) => item.id !== id));
    if (!single && latest.current.length === 0) focusBrowseNext.current = true;
    pump();
  }

  function retry(id: Key) {
    patch(id, { status: 'queued', progress: undefined, error: undefined });
    pump();
  }

  const styles = fileUploadStyles();

  const list =
    items.length > 0 ? (
      <FileList
        aria-label={typeof label === 'string' ? label : undefined}
        items={single ? items.slice(0, 1) : items}
        variant={single ? 'transparent' : listVariant}
        isDisabled={isDisabled}
        labels={labels}
        className={single ? 'w-64 max-w-full' : undefined}
      >
        {(item) => (
          <FileItem
            id={item.id}
            file={item.file}
            status={item.status}
            progress={item.progress}
            error={item.error}
            onRemove={() => remove(item.id)}
            onCancel={() => remove(item.id)}
            onRetry={
              onUpload && isUploadable(item.file) && item.status === 'error'
                ? () => retry(item.id)
                : undefined
            }
          />
        )}
      </FileList>
    ) : null;

  return (
    <div
      ref={rootRef}
      data-slot="file-upload"
      data-layout={layout}
      className={styles.root({ className })}
    >
      <FileDropzone
        {...dropzoneProps}
        label={label}
        isDisabled={isDisabled}
        allowsMultiple={single ? false : allowsMultiple}
        maxFiles={single ? 1 : maxFiles}
        fileCount={single ? 0 : items.length}
        labels={single && items.length > 0 ? { ...labels, dropTitle: t.dropToReplace } : labels}
        onSelect={add}
      >
        {single ? list : null}
      </FileDropzone>
      {single ? null : list}
      <span role="status" data-slot="upload-announcer" className={styles.status()}>
        {announcement.message ? <span key={announcement.count}>{announcement.message}</span> : null}
      </span>
    </div>
  );
}
