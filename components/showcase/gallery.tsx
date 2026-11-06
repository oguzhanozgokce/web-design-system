'use client';

import { AnimatePresence, motion, useInView } from 'motion/react';
import Link from 'next/link';
import { Suspense, useRef, useState } from 'react';
import type { GalleryEntry } from '@/lib/gallery';
import { examples } from '@/registry/__index__';
import { SearchIcon } from '@/registry/ds/lib/icons';
import { effectSpring, spatialSpring } from '@/registry/ds/lib/motion';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import { EmptyState } from '@/registry/ds/ui/empty-state';
import { SearchField } from '@/registry/ds/ui/search-field';
import { Skeleton } from '@/registry/ds/ui/skeleton';

export interface GalleryCategory {
  id: string;
  label: string;
}

interface PreviewSettings {
  example?: string;
  zoom?: number;
}

const previews: Record<string, PreviewSettings> = {};

function PreviewSkeleton() {
  return (
    <div className="flex w-48 flex-col gap-3">
      <Skeleton shape="rect" className="h-9 rounded-full" />
      <Skeleton shape="text" lines={2} />
    </div>
  );
}

function GalleryCard({ entry, category }: { entry: GalleryEntry; category: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: '240px 0px' });
  const settings = previews[entry.name] ?? {};
  const Example = examples[settings.example ?? `${entry.name}-demo`];

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        layout: spatialSpring('medium'),
        y: spatialSpring('slow'),
        opacity: effectSpring('medium'),
        scale: effectSpring('fast'),
      }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low transition-[background-color,box-shadow,translate] duration-200 ease-standard hover:bg-surface-container hover:shadow-elevation-2 has-[a:focus-visible]:shadow-elevation-2 motion-safe:hover:-translate-y-0.5"
    >
      <div
        inert
        className="relative h-52 overflow-hidden border-b border-outline-variant bg-surface-container-lowest"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(color-mix(in_srgb,var(--outline-variant)_80%,transparent)_1px,transparent_1px)] [background-size:18px_18px] opacity-50"
        />
        <div className="relative flex size-full items-center justify-center p-5 transition-transform duration-300 ease-standard motion-safe:group-hover:scale-[1.03]">
          <div
            className="flex w-full items-center justify-center"
            style={{ zoom: settings.zoom ?? 0.8 }}
          >
            {inView && Example ? (
              <Suspense fallback={<PreviewSkeleton />}>
                <Example />
              </Suspense>
            ) : (
              <PreviewSkeleton />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-title-md text-on-surface">
            <Link
              href={entry.href}
              className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-secondary"
            >
              {entry.title}
            </Link>
          </h3>
          <span className="shrink-0 text-label-md text-on-surface-variant">{category}</span>
        </div>
        <p className="line-clamp-2 text-body-sm text-on-surface-variant">{entry.description}</p>
      </div>
    </motion.li>
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
  const labelOf = new Map(categories.map((item) => [item.id, item.label]));
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
      <p role="status" className="text-body-sm text-on-surface-variant">
        {visible.length === entries.length
          ? `${entries.length} components`
          : `${visible.length} of ${entries.length} components`}
      </p>
      {visible.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((entry) => (
              <GalleryCard
                key={entry.name}
                entry={entry}
                category={labelOf.get(entry.category) ?? entry.category}
              />
            ))}
          </AnimatePresence>
        </ul>
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
