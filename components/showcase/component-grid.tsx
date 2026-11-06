import { getGalleryEntries } from '@/lib/gallery';
import { GalleryGrid } from '@/components/showcase/gallery';
import { ShowcaseProvider } from '@/components/showcase/showcase-provider';

export async function ComponentGrid({ category }: { category: string }) {
  const entries = (await getGalleryEntries()).filter((entry) => entry.category === category);
  return (
    <div className="not-prose my-6">
      <ShowcaseProvider>
        <GalleryGrid entries={entries} className="md:grid-cols-3 lg:grid-cols-3" />
      </ShowcaseProvider>
    </div>
  );
}
