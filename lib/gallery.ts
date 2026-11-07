import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { source } from '@/lib/source';
import { installedRegistryPath, type RegistryFile } from '@/lib/registry-paths';

export interface GalleryEntry {
  name: string;
  title: string;
  description: string;
  category: string;
  href: string;
}

export const galleryCategories = [
  { id: 'actions', label: 'Actions' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'layout', label: 'Layout' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'data-display', label: 'Data display' },
  { id: 'charts', label: 'Charts' },
] as const;

interface ItemFile {
  name: string;
  type: string;
  title: string;
  description: string;
  category: string;
}

export async function getGalleryEntries(): Promise<GalleryEntry[]> {
  const directory = path.join(process.cwd(), 'registry/items');
  const files = (await readdir(directory)).filter((file) => file.endsWith('.json'));
  const items: ItemFile[] = await Promise.all(
    files.map(async (file) => JSON.parse(await readFile(path.join(directory, file), 'utf8'))),
  );
  const pages = new Map(source.getPages().map((page) => [page.slugs.at(-1), page.url]));
  const order = galleryCategories.map((category) => category.id as string);

  return items
    .filter((item) => item.type === 'registry:ui' && order.includes(item.category))
    .map((item) => ({
      name: item.name,
      title: item.title.replace(/\b[a-z]/g, (letter) => letter.toUpperCase()),
      description: item.description,
      category: item.category,
      href: pages.get(item.name) ?? `/docs/components/${item.category}/${item.name}`,
    }))
    .sort(
      (a, b) =>
        order.indexOf(a.category) - order.indexOf(b.category) || a.title.localeCompare(b.title),
    );
}

interface RegistryItem {
  name: string;
  files: RegistryFile[];
  registryDependencies?: string[];
}

export async function getInstallFiles(name: string) {
  const registry: { items: RegistryItem[] } = JSON.parse(
    await readFile(path.join(process.cwd(), 'registry.json'), 'utf8'),
  );
  const byName = new Map(registry.items.map((item) => [item.name, item]));
  const seen = new Set<string>();
  const files: string[] = [];
  const visit = (itemName: string) => {
    if (seen.has(itemName)) return;
    seen.add(itemName);
    const item = byName.get(itemName);
    if (!item) return;
    for (const file of item.files) files.push(installedRegistryPath(file));
    for (const dependency of item.registryDependencies ?? [])
      visit(dependency.replace(/^@ds\//, ''));
  };
  visit(name);
  return files;
}
