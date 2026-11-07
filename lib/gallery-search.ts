import type { GalleryEntry } from '@/lib/gallery';

export interface GalleryCategory {
  id: string;
  label: string;
}

export function filterGallery(
  entries: readonly GalleryEntry[],
  categories: readonly GalleryCategory[],
  category: string,
  query: string,
) {
  const needle = query.trim().toLowerCase();
  return entries.filter(
    (entry) =>
      (category === 'all' || entry.category === category) &&
      (!needle ||
        `${entry.title} ${entry.description} ${categories.find((item) => item.id === entry.category)?.label ?? entry.category}`
          .toLowerCase()
          .includes(needle)),
  );
}
