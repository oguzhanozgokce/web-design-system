'use client';

import { Link } from 'react-aria-components';
import { memo, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { GalleryEntry } from '@/lib/gallery';
import { filterGallery, type GalleryCategory } from '@/lib/gallery-search';
import { ArrowForwardIcon, SearchIcon } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import { EmptyState } from '@/registry/ds/ui/empty-state';
import { SearchField } from '@/registry/ds/ui/search-field';
import { PreviewThemePicker, PreviewThemeScope } from '@/components/showcase/preview-theme';
import { galleryPreviews } from '@/components/showcase/previews';

export type { GalleryCategory } from '@/lib/gallery-search';

const stageWidth = 320;

const featuredNames = [
  'button',
  'card',
  'area-chart',
  'switch',
  'tabs',
  'cookie-consent',
  'data-table',
  'lightbox',
  'funnel-chart',
];

function FitPreview({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = ref.current;
    const stage = stageRef.current;
    if (!element || !stage) return;
    const observer = new ResizeObserver(() => {
      setScale(
        Math.max(
          0,
          Math.min(
            1,
            (element.clientWidth - 24) / stageWidth,
            (element.clientHeight - 24) / (stage.offsetHeight || 1),
          ),
        ),
      );
    });
    observer.observe(element);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative size-full overflow-clip">
      <div
        ref={stageRef}
        data-slot="gallery-stage"
        className="absolute inset-s-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rtl:translate-x-1/2"
        style={{ width: stageWidth, scale: String(scale) }}
      >
        {children}
      </div>
    </div>
  );
}

const GalleryTile = memo(function GalleryTile({ entry }: { entry: GalleryEntry }) {
  const Preview = galleryPreviews[entry.name];

  return (
    <li data-gallery-tile={entry.name} className="group relative flex flex-col gap-2.5">
      <div
        inert
        data-slot="gallery-frame"
        className="aspect-[16/11] overflow-clip rounded-overlay border border-outline-subtle bg-surface-raised transition-[border-color,box-shadow] duration-200 ease-out group-hover:shadow-sm group-has-[a:focus-visible]:border-outline-variant"
      >
        <div className="size-full transition-transform duration-300 ease-fluid motion-safe:group-hover:scale-[1.03]">
          <FitPreview>
            {Preview ? (
              <PreviewThemeScope>
                <Preview />
              </PreviewThemeScope>
            ) : null}
          </FitPreview>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-1">
        <Link
          href={entry.href}
          className="w-fit ps-1 text-sm font-medium text-on-surface outline-none after:absolute after:inset-0 after:rounded-container after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
        >
          {entry.title}
        </Link>
        <ArrowForwardIcon
          aria-hidden
          className="text-on-surface-variant transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1 rtl:-scale-x-100 rtl:motion-safe:group-hover:-translate-x-1"
        />
      </div>
    </li>
  );
});

export function GalleryGrid({
  entries,
  className,
}: {
  entries: GalleryEntry[];
  className?: string;
}) {
  return (
    <ul className={cn('grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {entries.map((entry) => (
        <GalleryTile key={entry.name} entry={entry} />
      ))}
    </ul>
  );
}

export function ComponentGallery({
  entries,
  categories,
}: {
  entries: GalleryEntry[];
  categories: readonly GalleryCategory[];
}) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const isBrowsing = category === 'all' && !query.trim();
  const filtered = filterGallery(entries, categories, category, query);
  const visible =
    isBrowsing && !expanded
      ? featuredNames.flatMap((name) => entries.filter((entry) => entry.name === name))
      : filtered;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <ChipGroup
          aria-label="Category"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[category]}
          onSelectionChange={(keys) => {
            const [next] = [...keys];
            if (next != null) setCategory(String(next));
          }}
        >
          <Chip id="all">Explore</Chip>
          {categories.map((item) => (
            <Chip key={item.id} id={item.id}>
              {item.label}
            </Chip>
          ))}
        </ChipGroup>
        <div className="flex flex-col gap-4 border-y border-outline-subtle py-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            aria-label="Search components"
            placeholder="Search components"
            value={query}
            onChange={setQuery}
            className="w-full sm:w-72"
          />
          <p role="status" className="text-xs text-on-surface-variant tabular-nums">
            {isBrowsing && !expanded
              ? `${visible.length} selected · ${entries.length} to explore`
              : `${visible.length} components`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">Preview colour</span>
            <PreviewThemePicker size="sm" />
          </div>
        </div>
      </div>
      {visible.length ? (
        <GalleryGrid entries={visible} />
      ) : (
        <EmptyState
          icon={<SearchIcon />}
          title="No component matches"
          description="Try another word, or clear the search to see every component."
        />
      )}
      {isBrowsing && (
        <div className="mt-5 flex justify-center">
          <Button
            variant="outline"
            onPress={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? 'Back to selected components' : `Explore all ${entries.length} components`}
          </Button>
        </div>
      )}
    </div>
  );
}
