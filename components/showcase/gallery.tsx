'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { GalleryEntry } from '@/lib/gallery';
import { SearchIcon } from '@/registry/ds/lib/icons';
import { effectSpring, spatialSpring } from '@/registry/ds/lib/motion';
import { cn } from '@/registry/ds/lib/utils';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import { EmptyState } from '@/registry/ds/ui/empty-state';
import { SearchField } from '@/registry/ds/ui/search-field';
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
        className="absolute start-1/2 top-1/2 flex items-center justify-center rtl:translate-x-1/2"
        style={{
          width: stageWidth,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        layout: spatialSpring('medium'),
        y: spatialSpring('medium'),
        opacity: effectSpring('medium'),
        scale: effectSpring('fast'),
      }}
      className="group relative flex flex-col gap-3"
    >
      <div
        inert
        className="aspect-[16/11] overflow-clip rounded-xl border border-outline-variant bg-surface-container-low transition-[background-color,border-color,box-shadow] duration-200 ease-standard group-hover:border-outline group-hover:bg-surface-container group-hover:shadow-elevation-1 group-has-[a:focus-visible]:border-outline"
      >
        <div className="size-full transition-transform duration-300 ease-standard motion-safe:group-hover:scale-[1.04]">
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
        className="w-fit text-title-sm text-on-surface outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-secondary"
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
    <ul className={cn('grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4', className)}>
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
    <div className="flex flex-col gap-6">
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
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-label-lg text-on-surface-variant">Preview colour</span>
        <PreviewThemePicker size="sm" />
      </div>
      <p role="status" className="text-body-sm text-on-surface-variant">
        {visible.length === entries.length
          ? `${entries.length} components`
          : `${visible.length} of ${entries.length} components`}
      </p>
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
