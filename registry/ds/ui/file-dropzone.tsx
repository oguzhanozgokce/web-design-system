'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from 'react';
import {
  Button as AriaButton,
  DropZone,
  FileTrigger,
  isDirectoryDropItem,
  isFileDropItem,
  useLocale,
  type DragTypes,
  type DropItem,
  type DropOperation,
  type DropZoneProps,
} from 'react-aria-components';
import {
  describeFileType,
  formatFileSize,
  mayAcceptDrag,
  validateFiles,
  type FileRejection,
} from '@/registry/ds/lib/files';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type { FileRejection, FileRejectionReason } from '@/registry/ds/lib/files';

export type FileDropzoneVariant = 'soft' | 'outline';

export type FileDropzoneSize = 'sm' | 'md' | 'lg';

export interface FileDropzoneLabels {
  prompt: LabelTemplate<{ browse: string }>;
  promptMultiple: LabelTemplate<{ browse: string }>;
  browse: string;
  dropzone: string;
  dropTitle: string;
  dropRefused: string;
  pasteTitle: string;
  hintSize: LabelTemplate<{ size: string }>;
  hintTypes: LabelTemplate<{ types: string }>;
  hintTypesAndSize: LabelTemplate<{ types: string; size: string }>;
  typeImage: string;
  typeVideo: string;
  typeAudio: string;
  typeText: string;
  rejectedType: LabelTemplate<{ name: string }>;
  rejectedTooLarge: LabelTemplate<{ name: string; size: string }>;
  rejectedTooSmall: LabelTemplate<{ name: string; size: string }>;
  rejectedTooMany: LabelTemplate<{ count: string }>;
  rejectedSeveral: LabelTemplate<{ count: string }>;
}

export const defaultFileDropzoneLabels: FileDropzoneLabels = {
  prompt: 'Drag a file here or {browse}',
  promptMultiple: 'Drag files here or {browse}',
  browse: 'browse',
  dropzone: 'Drop or paste files',
  dropTitle: 'Drop to add',
  dropRefused: 'This file type isn’t accepted',
  pasteTitle: 'Paste to add',
  hintSize: 'Up to {size}',
  hintTypes: '{types}',
  hintTypesAndSize: '{types} · up to {size}',
  typeImage: 'Images',
  typeVideo: 'Videos',
  typeAudio: 'Audio',
  typeText: 'Text',
  rejectedType: '{name} isn’t a supported file type',
  rejectedTooLarge: '{name} is larger than {size}',
  rejectedTooSmall: '{name} is smaller than {size}',
  rejectedTooMany: ({ count }) =>
    count === '1' ? 'You can add only one file' : `You can add up to ${count} files`,
  rejectedSeveral: '{count} files weren’t added',
};

const stacked = 'col-start-1 row-start-1';

export const fileDropzoneStyles = tv({
  slots: {
    root: 'group/file-dropzone flex w-full min-w-0 flex-col gap-1.5',
    label: 'w-fit cursor-default text-sm font-medium text-on-surface',
    stage: 'relative grid w-full min-w-0 items-center',
    zone: [
      'group/zone relative isolate flex min-w-0 overflow-hidden text-on-surface select-none',
      'outline-0 outline-offset-2 outline-(--focus-color,var(--primary))',
      'data-[focus-visible]:outline-2 has-[[data-slot=file-dropzone-browse][data-focus-visible]]:outline-2',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
      '[interpolate-size:allow-keywords]',
    ],
    tile: [
      'grid shrink-0 place-items-center bg-surface-segment text-on-surface-variant shadow-xs',
      'inset-ring-1 inset-ring-[color:light-dark(transparent,color-mix(in_srgb,var(--on-surface)_12%,transparent))]',
      'group-data-[drop-target]/zone:text-on-surface group-data-[hovered]/zone:text-on-surface',
      '[&_svg]:size-(--tile-icon)',
    ],
    text: 'flex min-w-0 flex-col gap-1',
    stack: 'grid min-w-0',
    browse: [
      `${stacked} min-w-0 cursor-pointer font-medium text-on-surface outline-none after:absolute after:inset-0`,
      'data-[disabled]:cursor-not-allowed',
    ],
    browseLink:
      'text-primary underline-offset-3 group-data-[hovered]/zone:underline group-has-[[data-slot=file-dropzone-browse][data-focus-visible]]/zone:underline',
    message: `${stacked} pointer-events-none min-w-0 font-medium`,
    hint: 'min-w-0 text-on-surface-variant',
    content: 'flex max-w-full min-w-0 cursor-default text-start outline-none',
    float: 'pointer-events-none animate-ds-fade-in text-xs font-medium',
    error: 'text-xs text-error',
    status: 'sr-only',
  },
  variants: {
    variant: {
      soft: {
        zone: 'bg-neutral-soft data-[drop-target]:bg-neutral-soft-hover data-[hovered]:bg-neutral-soft-hover',
      },
      outline: {
        zone: 'border border-dashed border-outline-variant bg-transparent data-[drop-target]:border-outline data-[drop-target]:bg-neutral-soft data-[hovered]:bg-neutral-soft',
      },
    },
    size: {
      sm: {
        float: 'col-start-1 row-start-2 mt-1.5 justify-self-start text-start',
        stage: 'min-h-16 justify-items-start',
        zone: 'gap-3 rounded-field px-4 py-3 text-start [--zone-min-h:4rem]',
        tile: 'size-8 rounded-lg [--tile-icon:1rem]',
        browse: 'text-sm',
        message: 'text-sm',
        hint: 'text-xs',
      },
      md: {
        float: 'absolute inset-x-0 bottom-3 text-center',
        stage: 'min-h-44 justify-items-center',
        zone: 'gap-3 rounded-container px-6 py-6 text-center [--zone-min-h:11rem]',
        tile: 'size-10 rounded-xl [--tile-icon:1.25rem]',
        browse: 'text-sm',
        message: 'text-sm',
        hint: 'text-xs',
      },
      lg: {
        float: 'absolute inset-x-0 bottom-4 text-center',
        stage: 'min-h-60 justify-items-center',
        zone: 'gap-4 rounded-dialog px-8 py-8 text-center [--zone-min-h:15rem]',
        tile: 'size-12 rounded-2xl [--tile-icon:1.5rem]',
        browse: 'text-base',
        message: 'text-base',
        hint: 'text-sm',
      },
    },
    hugging: {
      true: {
        zone: 'w-fit max-w-full min-h-0 cursor-default items-center justify-center px-4 py-3.5',
      },
      false: {
        zone: 'w-full min-h-(--zone-min-h) cursor-pointer items-center justify-center',
      },
    },
    motion: {
      full: {
        zone: [
          'transition-[scale,width,min-height,background-color,border-color]',
          'duration-[var(--ds-duration-spatial-fast),var(--ds-duration-spatial),var(--ds-duration-spatial),150ms,150ms]',
          'ease-[var(--ds-ease-spatial-fast),var(--ds-ease-spatial),var(--ds-ease-spatial),ease-out,ease-out]',
          'motion-reduce:transition-[background-color,border-color]',
        ],
        tile: [
          'transition-[translate,color] duration-(--ds-duration-spatial-fast) ease-(--ds-ease-spatial-fast)',
          'motion-reduce:transition-[color]',
        ],
        browse: 'transition-[opacity,translate] duration-150 ease-out motion-reduce:translate-y-0',
        message: 'transition-[opacity,translate] duration-150 ease-out motion-reduce:translate-y-0',
      },
      reduced: {
        zone: 'transition-[background-color,border-color] duration-150 ease-out',
        tile: 'transition-[color] duration-150 ease-out',
        browse: 'translate-y-0 transition-opacity duration-150 ease-out',
        message: 'translate-y-0 transition-opacity duration-150 ease-out',
      },
      none: {
        browse: 'translate-y-0',
        message: 'translate-y-0',
      },
    },
    grows: {
      true: {
        zone: [
          'has-[[data-slot=file-dropzone-browse][data-pressed]]:scale-[0.99] data-[drop-target]:scale-[1.02]',
          'motion-reduce:scale-100!',
        ],
        tile: 'group-data-[hovered]/zone:-translate-y-0.5 group-data-[drop-target]/zone:-translate-y-1 motion-reduce:translate-y-0!',
      },
      false: {},
    },
    tone: {
      neutral: {},
      error: {
        zone: '[--focus-color:var(--error)]',
      },
    },
  },
  compoundVariants: [
    { size: 'sm', hugging: false, class: { zone: 'flex-row justify-start' } },
    { size: ['md', 'lg'], hugging: false, class: { zone: 'flex-col', text: 'items-center' } },
    { variant: 'soft', hugging: true, class: { zone: 'data-[hovered]:bg-neutral-soft' } },
    { variant: 'outline', hugging: true, class: { zone: 'data-[hovered]:bg-transparent' } },
    { variant: 'soft', tone: 'error', class: { zone: 'inset-ring-1 inset-ring-error/60' } },
    { variant: 'outline', tone: 'error', class: { zone: 'border-error/60' } },
  ],
  defaultVariants: {
    variant: 'soft',
    size: 'md',
    hugging: false,
    motion: 'full',
    grows: true,
    tone: 'neutral',
  },
});

const browseMark = '\uE000';

const focusableContent = 'button:not([disabled]), input:not([disabled]), [tabindex="0"]';

const shownLine = 'opacity-100';
const hiddenLine = 'opacity-0 translate-y-0.5';

type DropzoneLabelReader = ReturnType<typeof useLabels<FileDropzoneLabels>>;

function describeRejections(
  rejections: FileRejection[],
  t: DropzoneLabelReader,
  locale: string,
  limits: { maxSize?: number; minSize?: number; maxFiles?: number },
) {
  const count = new Intl.NumberFormat(locale).format(limits.maxFiles ?? 1);
  if (rejections.every((rejection) => rejection.reason === 'too-many')) {
    return t.format('rejectedTooMany', { count });
  }
  if (rejections.length > 1) {
    return t.format('rejectedSeveral', {
      count: new Intl.NumberFormat(locale).format(rejections.length),
    });
  }
  const [{ file, reason }] = rejections;
  if (reason === 'too-large') {
    return t.format('rejectedTooLarge', {
      name: file.name,
      size: formatFileSize(limits.maxSize ?? 0, locale),
    });
  }
  if (reason === 'too-small') {
    return t.format('rejectedTooSmall', {
      name: file.name,
      size: formatFileSize(limits.minSize ?? 0, locale),
    });
  }
  return t.format('rejectedType', { name: file.name });
}

function describeAcceptedTypes(
  acceptedFileTypes: readonly string[],
  t: DropzoneLabelReader,
  locale: string,
) {
  const wildcards: Record<string, string> = {
    'image/*': t.typeImage,
    'video/*': t.typeVideo,
    'audio/*': t.typeAudio,
    'text/*': t.typeText,
  };
  const names = acceptedFileTypes.map((token) => {
    const key = token.trim().toLowerCase();
    return wildcards[key] ?? describeFileType(key);
  });
  return new Intl.ListFormat(locale, { type: 'unit', style: 'short' }).format([...new Set(names)]);
}

async function collectFiles(items: DropItem[]) {
  const files: File[] = [];
  async function visit(item: DropItem) {
    if (isFileDropItem(item)) {
      files.push(await item.getFile());
    } else if (isDirectoryDropItem(item)) {
      for await (const entry of item.getEntries()) await visit(entry);
    }
  }
  for (const item of items) await visit(item);
  return files;
}

function currentScale(element: Element) {
  const scale = getComputedStyle(element).scale;
  return !scale || scale === 'none' ? '1' : scale.split(' ')[0];
}

function play(element: Element | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  if (!element || typeof element.animate !== 'function') return;
  element.animate(keyframes, options);
}

const gulpEase = 'cubic-bezier(0.3, 1.2, 0.4, 1)';
const openEase = 'cubic-bezier(0.3, 1.4, 0.4, 1)';

function useFileMotion() {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (spatialEnabled) return 'full' as const;
  return effectsEnabled ? ('reduced' as const) : ('none' as const);
}

type DropzoneLine = 'prompt' | 'drop' | 'refused' | 'rejected' | 'paste';

export interface FileDropzoneProps {
  acceptedFileTypes?: string[];
  allowsMultiple?: boolean;
  acceptDirectory?: boolean;
  defaultCamera?: 'user' | 'environment';
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  fileCount?: number;
  isDisabled?: boolean;
  isInvalid?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  icon?: ReactNode;
  variant?: FileDropzoneVariant;
  size?: FileDropzoneSize;
  onSelect?: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  labels?: Partial<FileDropzoneLabels>;
  className?: string;
  children?: ReactNode;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function FileDropzone({
  acceptedFileTypes,
  allowsMultiple = false,
  acceptDirectory,
  defaultCamera,
  maxSize,
  minSize,
  maxFiles,
  fileCount = 0,
  isDisabled = false,
  isInvalid = false,
  label,
  description,
  errorMessage,
  icon,
  variant = 'soft',
  size = 'md',
  onSelect,
  onReject,
  labels,
  className,
  children,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}: FileDropzoneProps) {
  const t = useLabels('fileDropzone', defaultFileDropzoneLabels, labels);
  const icons = useIcons();
  const { locale } = useLocale();
  const motion = useFileMotion();
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const hintId = `${generatedId}-hint`;
  const browseId = `${generatedId}-browse`;
  const errorId = `${generatedId}-error`;
  const zoneRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLSpanElement>(null);
  const browseRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const focusContentNext = useRef(false);
  const contentHadFocus = useRef(false);
  const messageTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isOver, setOver] = useState(false);
  const [dragFits, setDragFits] = useState(true);
  const [rejection, setRejection] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState({ message: '', count: 0 });

  const hugging = children != null && children !== false;
  const limit = allowsMultiple ? maxFiles : 1;
  const showError = isInvalid && errorMessage != null;
  const refusedDrag = isOver && !dragFits;

  useEffect(() => () => clearTimeout(messageTimer.current), []);

  useLayoutEffect(() => {
    if (!hugging && contentHadFocus.current) {
      contentHadFocus.current = false;
      const active = document.activeElement;
      if (!active || active === document.body) browseRef.current?.focus();
    }
    if (!hugging || !focusContentNext.current) return;
    let frame = 0;
    let attempts = 0;
    const focusContent = () => {
      const content = contentRef.current;
      const row = content?.querySelector<HTMLElement>('[role="row"]');
      if (row || attempts++ >= 4) {
        focusContentNext.current = false;
        (row ?? content?.querySelector<HTMLElement>(focusableContent) ?? content)?.focus();
      } else {
        frame = requestAnimationFrame(focusContent);
      }
    };
    focusContent();
    return () => cancelAnimationFrame(frame);
  }, [hugging]);

  function refuse(message: string, shake: boolean) {
    setRejection(message);
    setAnnouncement((previous) => ({ message, count: previous.count + 1 }));
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setRejection(null), 1800);
    if (shake && motion === 'full') {
      play(
        zoneRef.current,
        [
          { translate: '0 0' },
          { translate: '-7px 0' },
          { translate: '6px 0' },
          { translate: '-4px 0' },
          { translate: '2px 0' },
          { translate: '0 0' },
        ],
        { duration: 420, easing: 'ease-out' },
      );
    }
  }

  function gulp() {
    const zone = zoneRef.current;
    if (motion !== 'full' || !zone) return;
    play(
      zone,
      [
        { scale: currentScale(zone), easing: gulpEase },
        { scale: '0.985', offset: 0.35, easing: gulpEase },
        { scale: '1.006', offset: 0.7, easing: gulpEase },
        { scale: '1' },
      ],
      { duration: 460 },
    );
    play(
      tileRef.current,
      [
        { scale: '1', easing: openEase },
        { scale: '1.08', offset: 0.4, easing: openEase },
        { scale: '1' },
      ],
      { duration: 460 },
    );
  }

  function receive(files: File[]) {
    if (isDisabled || files.length === 0) return;
    const { accepted, rejected } = validateFiles(files, {
      acceptedFileTypes,
      maxSize,
      minSize,
      maxFiles: limit,
      fileCount,
    });
    if (accepted.length) {
      focusContentNext.current =
        !hugging && browseRef.current != null && document.activeElement === browseRef.current;
      gulp();
      onSelect?.(accepted);
    }
    if (rejected.length) {
      onReject?.(rejected);
      refuse(
        describeRejections(rejected, t, locale, { maxSize, minSize, maxFiles: limit }),
        accepted.length === 0,
      );
    } else if (accepted.length) {
      clearTimeout(messageTimer.current);
      setRejection(null);
    }
  }

  function getDropOperation(types: DragTypes, allowedOperations: DropOperation[]): DropOperation {
    setDragFits(mayAcceptDrag(types, acceptedFileTypes));
    return allowedOperations.includes('copy') ? 'copy' : allowedOperations[0];
  }

  const handleDrop: DropZoneProps['onDrop'] = (event) => {
    void collectFiles(event.items).then(receive);
  };

  function handleContentBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
      contentHadFocus.current = false;
    }
  }

  const styles = fileDropzoneStyles({
    variant,
    size,
    hugging,
    motion,
    grows: motion === 'full' && !refusedDrag,
    tone: isInvalid ? 'error' : 'neutral',
  });

  const dragLine: DropzoneLine | null = isOver ? (dragFits ? 'drop' : 'refused') : null;
  const restingLine: DropzoneLine = dragLine ?? (rejection != null ? 'rejected' : 'prompt');

  const hintParts = () => {
    if (description != null) return description;
    const types = acceptedFileTypes?.length
      ? describeAcceptedTypes(acceptedFileTypes, t, locale)
      : null;
    const sizeText = maxSize != null ? formatFileSize(maxSize, locale) : null;
    if (types && sizeText) return t.format('hintTypesAndSize', { types, size: sizeText });
    if (types) return t.format('hintTypes', { types });
    if (sizeText) return t.format('hintSize', { size: sizeText });
    return null;
  };
  const hint = hintParts();

  const promptText = t.format(allowsMultiple ? 'promptMultiple' : 'prompt', {
    browse: browseMark,
  });
  const markAt = promptText.indexOf(browseMark);
  const describedBy =
    [hint != null ? hintId : null, showError ? errorId : null, ariaDescribedby]
      .filter(Boolean)
      .join(' ') || undefined;

  const lineText: Record<DropzoneLine, string | null> = {
    prompt: null,
    drop: t.dropTitle,
    refused: t.dropRefused,
    rejected: rejection,
    paste: t.pasteTitle,
  };

  const browseLabelledBy = label != null ? `${labelId} ${browseId}` : undefined;

  return (
    <div
      id={id}
      role={label != null || ariaLabel || ariaLabelledby ? 'group' : undefined}
      aria-label={label == null ? ariaLabel : undefined}
      aria-labelledby={label != null ? labelId : ariaLabelledby}
      data-slot="file-dropzone"
      data-variant={variant}
      data-size={size}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
      data-hugging={hugging || undefined}
      className={styles.root({ className })}
    >
      {label != null ? (
        <span id={labelId} data-slot="label" className={styles.label()}>
          {label}
        </span>
      ) : null}
      <div data-slot="stage" className={styles.stage()}>
        <DropZone
          ref={zoneRef}
          aria-label={t.dropzone}
          aria-labelledby={label != null ? labelId : undefined}
          isDisabled={isDisabled}
          getDropOperation={getDropOperation}
          onDropEnter={() => {
            setOver(true);
            clearTimeout(messageTimer.current);
            setRejection(null);
          }}
          onDropExit={() => setOver(false)}
          onDrop={handleDrop}
          data-slot="zone"
          data-drop-refused={refusedDrag || undefined}
          data-rejecting={rejection != null || undefined}
          className={styles.zone()}
        >
          {({ isFocusVisible }) => {
            if (hugging) {
              return (
                <div
                  ref={contentRef}
                  data-slot="content"
                  tabIndex={-1}
                  onFocus={() => {
                    contentHadFocus.current = true;
                  }}
                  onBlur={handleContentBlur}
                  className={styles.content()}
                >
                  {children}
                </div>
              );
            }
            const line = restingLine === 'prompt' && isFocusVisible ? 'paste' : restingLine;
            return (
              <>
                <span ref={tileRef} aria-hidden="true" data-slot="tile" className={styles.tile()}>
                  {icon ?? <icons.upload />}
                </span>
                <span data-slot="text" className={styles.text()}>
                  <span className={styles.stack()}>
                    <FileTrigger
                      acceptedFileTypes={acceptedFileTypes}
                      allowsMultiple={allowsMultiple}
                      acceptDirectory={acceptDirectory}
                      defaultCamera={defaultCamera}
                      onSelect={(list) => receive(list ? Array.from(list) : [])}
                    >
                      <AriaButton
                        ref={browseRef}
                        id={browseId}
                        isDisabled={isDisabled}
                        aria-labelledby={browseLabelledBy}
                        aria-describedby={describedBy}
                        data-slot="file-dropzone-browse"
                        className={styles.browse({
                          className: line === 'prompt' ? shownLine : hiddenLine,
                        })}
                      >
                        {markAt < 0 ? (
                          promptText
                        ) : (
                          <>
                            {promptText.slice(0, markAt)}
                            <span data-slot="browse-link" className={styles.browseLink()}>
                              {t.browse}
                            </span>
                            {promptText.slice(markAt + browseMark.length)}
                          </>
                        )}
                      </AriaButton>
                    </FileTrigger>
                    <span
                      aria-hidden="true"
                      data-slot="message"
                      data-line={line}
                      className={styles.message({
                        className: [
                          line === 'prompt' ? hiddenLine : shownLine,
                          line === 'rejected' || line === 'refused' ? 'text-error' : '',
                        ],
                      })}
                    >
                      {lineText[line]}
                    </span>
                  </span>
                  {hint != null ? (
                    <span id={hintId} data-slot="hint" className={styles.hint()}>
                      {hint}
                    </span>
                  ) : null}
                </span>
              </>
            );
          }}
        </DropZone>
        {hugging && restingLine !== 'prompt' ? (
          <span
            key={restingLine}
            aria-hidden="true"
            data-slot="float-message"
            data-line={restingLine}
            className={styles.float({
              className: restingLine === 'drop' ? 'text-on-surface-variant' : 'text-error',
            })}
          >
            {lineText[restingLine]}
          </span>
        ) : null}
      </div>
      {showError ? (
        <span id={errorId} data-slot="error" className={styles.error()}>
          {errorMessage}
        </span>
      ) : null}
      <span role="status" data-slot="announcer" className={styles.status()}>
        {announcement.message ? <span key={announcement.count}>{announcement.message}</span> : null}
      </span>
    </div>
  );
}
