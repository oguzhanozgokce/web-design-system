import { ArrowForwardIcon, FolderIcon } from '@/registry/ds/lib/icons';
import { CardContent, CardHeader, ClickableCard } from '@/registry/ds/ui/card';

const folders = [
  { slug: 'photos', title: 'Photos', updated: 'Updated 2 hours ago', count: '1,204 items' },
  { slug: 'videos', title: 'Videos', updated: 'Updated yesterday', count: '86 items' },
  { slug: 'music', title: 'Music', updated: 'Updated 3 days ago', count: '342 items' },
];

export default function CardClickable() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {folders.map((folder) => (
        <ClickableCard key={folder.slug} href={`#${folder.slug}`} variant="outlined">
          <CardHeader
            leading={<FolderIcon className="size-6 text-primary" />}
            title={folder.title}
            description={folder.updated}
          />
          <CardContent className="mt-auto flex items-center justify-between gap-2">
            <span className="text-title-md tabular-digits">{folder.count}</span>
            <ArrowForwardIcon className="size-5 text-on-surface-variant rtl:-scale-x-100" />
          </CardContent>
        </ClickableCard>
      ))}
    </div>
  );
}
