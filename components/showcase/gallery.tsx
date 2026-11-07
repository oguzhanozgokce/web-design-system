'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { GalleryEntry } from '@/lib/gallery';
import { SearchIcon } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import { EmptyState } from '@/registry/ds/ui/empty-state';
import { SearchField } from '@/registry/ds/ui/search-field';
import { entrance } from '@/components/showcase/motion';
import { PreviewThemePicker, PreviewThemeScope } from '@/components/showcase/preview-theme';
import { galleryPreviews } from '@/components/showcase/previews';

export interface GalleryCategory {
  id: string;
  label: string;
}

const stageWidth = 320;

function FitPreview({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, (entry.contentRect.width - 24) / stageWidth));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative size-full overflow-clip">
      <div
        data-slot="gallery-stage"
        className="absolute inset-s-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rtl:translate-x-1/2"
        style={{ width: stageWidth, scale: String(scale) }}
      >
        {children}
      </div>
    </div>
  );
}

function GalleryTile({ entry }: { entry: GalleryEntry }) {
  const Preview = galleryPreviews[entry.name];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        layout: entrance(0, 0.35),
        y: entrance(0, 0.35),
        opacity: { duration: 0.2, ease: 'easeOut' },
        scale: { duration: 0.15, ease: 'easeOut' },
      }}
      data-gallery-tile={entry.name}
      className="group relative flex flex-col gap-2.5"
    >
      <div
        inert
        data-slot="gallery-frame"
        className="aspect-[16/11] overflow-clip rounded-container border border-outline-subtle bg-surface-raised transition-[border-color,box-shadow] duration-200 ease-out group-hover:shadow-md group-has-[a:focus-visible]:border-outline-variant"
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
      <Link
        href={entry.href}
        className="w-fit ps-1 text-sm font-medium text-on-surface outline-none after:absolute after:inset-0 after:rounded-container after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
      >
        {entry.title}
      </Link>
    </motion.li>
  );
}

export function GalleryGrid({
  entries,
  className,
}: {
  entries: GalleryEntry[];
  className?: string;
}) {
  return (
    <ul className={cn('grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-3 lg:grid-cols-4', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {entries.map((entry) => (
          <GalleryTile key={entry.name} entry={entry} />
        ))}
      </AnimatePresence>
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
  const needle = query.trim().toLocaleLowerCase();
  const visible = entries.filter(
    (entry) =>
      (category === 'all' || entry.category === category) &&
      (!needle || `${entry.title} ${entry.description}`.toLocaleLowerCase().includes(needle)),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
          <Chip id="all">All</Chip>
          {categories.map((item) => (
            <Chip key={item.id} id={item.id}>
              {item.label}
            </Chip>
          ))}
        </ChipGroup>
        <SearchField
          aria-label="Search components"
          placeholder="Search components"
          value={query}
          onChange={setQuery}
          className="w-full lg:w-72"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-outline-subtle pt-4">
        <p role="status" className="text-sm text-on-surface-variant tabular-digits">
          {visible.length === entries.length
            ? `${entries.length} components`
            : `${visible.length} of ${entries.length} components`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-on-surface-variant">Accent colour</span>
          <PreviewThemePicker size="sm" />
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
    </div>
  );
}
