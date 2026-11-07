'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Heading, Tab, TabList, TabPanel, Tabs, useLocale, type Key } from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { tv } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import { Dialog, type DialogProps } from '@/registry/ds/ui/dialog';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Spinner } from '@/registry/ds/ui/spinner';

export interface LightboxItem {
  id: Key;
  src: string;
  alt: string;
  thumbnailSrc?: string;
  title?: string;
  description?: string;
}

export interface LightboxLabels {
  title: string;
  close: string;
  previous: string;
  next: string;
  thumbnails: string;
  viewport: string;
  zoomIn: string;
  zoomOut: string;
  fit: string;
  loading: string;
  error: string;
  retry: string;
  position: LabelTemplate<{ current: string; total: string }>;
  thumbnail: LabelTemplate<{ number: string; name: string }>;
}

export const defaultLightboxLabels: LightboxLabels = {
  title: 'Image viewer',
  close: 'Close image viewer',
  previous: 'Previous image',
  next: 'Next image',
  thumbnails: 'Choose an image',
  viewport: 'Image viewport',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  fit: 'Fit image',
  loading: 'Loading image',
  error: 'This image could not be loaded.',
  retry: 'Try again',
  position: '{current} of {total}',
  thumbnail: 'Image {number}: {name}',
};

export const lightboxStyles = tv({
  slots: {
    root: 'flex min-h-0 flex-1 flex-col',
    header: 'flex shrink-0 items-center gap-3 border-b border-outline-subtle px-4 py-3',
    title: 'min-w-0 flex-1 truncate text-sm font-semibold text-on-surface',
    position: 'shrink-0 text-xs text-on-surface-variant tabular-nums',
    panel: 'flex min-h-0 flex-1 flex-col gap-2 p-3 outline-none sm:p-4',
    viewport:
      'focus-ring-inset relative min-h-0 flex-1 overflow-auto overscroll-contain rounded-container bg-canvas',
    imageFrame: 'grid place-items-center',
    image: 'h-full min-h-0 w-full min-w-0 object-contain',
    status:
      'absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center text-sm text-on-surface-variant',
    toolbar: 'flex shrink-0 flex-wrap items-center justify-center gap-1',
    divider: 'mx-2 h-5 border-e border-outline-subtle',
    caption: 'shrink-0 px-4 text-center text-sm text-on-surface-variant [overflow-wrap:anywhere]',
    list: 'mx-auto flex max-w-full gap-2 overflow-x-auto px-4 py-3',
    thumbnail: [
      'focus-ring no-tap-highlight relative flex size-14 shrink-0 cursor-pointer overflow-hidden rounded-item border-2 border-transparent bg-neutral-soft p-0.5 outline-offset-2',
      'data-[selected]:border-primary data-[hovered]:bg-neutral-soft-hover',
      'transition-[border-color,background-color] duration-150 ease-out motion-reduce:transition-none',
    ],
    thumbnailImage: 'size-full rounded-sm object-cover',
  },
});

export interface LightboxProps extends Pick<
  DialogProps,
  'isOpen' | 'defaultOpen' | 'onOpenChange' | 'className'
> {
  items: readonly LightboxItem[];
  selectedKey?: Key;
  defaultSelectedKey?: Key;
  onSelectionChange?: (key: Key) => void;
  labels?: Partial<LightboxLabels>;
}

function LightboxStage({
  item,
  labels,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: {
  item: LightboxItem;
  labels?: Partial<LightboxLabels>;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}) {
  const t = useLabels('lightbox', defaultLightboxLabels, labels);
  const icons = useIcons();
  const { effectsEnabled } = useMotionPreference();
  const { direction } = useLocale();
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const styles = lightboxStyles();

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    element.scrollLeft =
      ((element.scrollWidth - element.clientWidth) / 2) * (direction === 'rtl' ? -1 : 1);
    element.scrollTop = (element.scrollHeight - element.clientHeight) / 2;
  }, [zoom, direction]);

  return (
    <>
      <div
        ref={viewport}
        role="region"
        aria-label={t.viewport}
        tabIndex={0}
        className={styles.viewport()}
        data-slot="lightbox-viewport"
        data-zoom={zoom}
      >
        <div
          className={styles.imageFrame()}
          style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
        >
          {status !== 'error' ? (
            <img
              key={attempt}
              src={item.src}
              alt={item.alt}
              draggable={false}
              decoding="async"
              onLoad={() => setStatus('loaded')}
              onError={() => setStatus('error')}
              className={styles.image({
                className:
                  status === 'loaded' && effectsEnabled
                    ? 'animate-ds-fade-in motion-reduce:animate-none'
                    : undefined,
              })}
              style={{ visibility: status === 'loaded' ? 'visible' : 'hidden' }}
            />
          ) : null}
        </div>
        {status === 'loading' ? (
          <div className={styles.status()}>
            <Spinner aria-label={t.loading} />
          </div>
        ) : null}
        {status === 'error' ? (
          <div role="alert" className={styles.status()}>
            <icons.image className="size-8" />
            <p>{t.error}</p>
            <Button
              variant="soft"
              onPress={() => {
                setStatus('loading');
                setAttempt((value) => value + 1);
              }}
            >
              {t.retry}
            </Button>
          </div>
        ) : null}
      </div>
      <div className={styles.toolbar()}>
        <IconButton
          aria-label={t.previous}
          isDisabled={!hasPrevious}
          onPress={onPrevious}
          icon={<icons.chevronLeft className="rtl:-scale-x-100" />}
        />
        <IconButton
          aria-label={t.next}
          isDisabled={!hasNext}
          onPress={onNext}
          icon={<icons.chevronRight className="rtl:-scale-x-100" />}
        />
        <span aria-hidden="true" className={styles.divider()} />
        <IconButton
          aria-label={t.zoomOut}
          isDisabled={zoom === 1 || status !== 'loaded'}
          onPress={() => setZoom((value) => Math.max(1, value - 0.5))}
          icon={<icons.zoomOut />}
        />
        <IconButton
          aria-label={t.fit}
          isDisabled={zoom === 1 || status !== 'loaded'}
          onPress={() => setZoom(1)}
          icon={<icons.fullscreenExit />}
        />
        <IconButton
          aria-label={t.zoomIn}
          isDisabled={zoom === 3 || status !== 'loaded'}
          onPress={() => setZoom((value) => Math.min(3, value + 0.5))}
          icon={<icons.zoomIn />}
        />
      </div>
    </>
  );
}

export function Lightbox({
  items,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  labels,
  ...props
}: LightboxProps) {
  const t = useLabels('lightbox', defaultLightboxLabels, labels);
  const icons = useIcons();
  const { locale } = useLocale();
  const [selected, select] = useControllableState<Key>(
    selectedKey,
    defaultSelectedKey ?? items[0]?.id ?? '',
    onSelectionChange,
  );
  const index = Math.max(
    0,
    items.findIndex((item) => item.id === selected),
  );
  const item = items[index];
  const styles = lightboxStyles();
  const format = (value: number) => value.toLocaleString(locale);
  if (!item) return null;

  return (
    <Dialog {...props} size="full" data-slot="lightbox">
      <Tabs selectedKey={item.id} onSelectionChange={select} className={styles.root()}>
        <header className={styles.header()}>
          <Heading slot="title" className={styles.title()}>
            {item.title ?? t.title}
          </Heading>
          <span role="status" className={styles.position()}>
            {t.format('position', { current: format(index + 1), total: format(items.length) })}
          </span>
          <IconButton slot="close" aria-label={t.close} icon={<icons.close />} />
        </header>
        <TabList aria-label={t.thumbnails} className={styles.list()}>
          {items.map((entry, i) => (
            <Tab
              key={entry.id}
              id={entry.id}
              aria-label={t.format('thumbnail', {
                number: format(i + 1),
                name: entry.title ?? entry.alt,
              })}
              className={styles.thumbnail()}
            >
              <img
                src={entry.thumbnailSrc ?? entry.src}
                alt=""
                loading="lazy"
                decoding="async"
                className={styles.thumbnailImage()}
              />
            </Tab>
          ))}
        </TabList>
        {items.map((entry, entryIndex) => (
          <TabPanel
            key={`${entry.id}:${entry.src}`}
            id={entry.id}
            className={styles.panel()}
            data-slot="lightbox-panel"
          >
            <LightboxStage
              item={entry}
              labels={labels}
              hasPrevious={entryIndex > 0}
              hasNext={entryIndex < items.length - 1}
              onPrevious={() => select(items[entryIndex - 1].id)}
              onNext={() => select(items[entryIndex + 1].id)}
            />
            {entry.description ? <p className={styles.caption()}>{entry.description}</p> : null}
          </TabPanel>
        ))}
      </Tabs>
    </Dialog>
  );
}
