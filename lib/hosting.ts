import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { open, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { registryItemSchema } from 'shadcn/schema';
import { siteUrl } from './site';

export async function exportFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  async function visit(relative: string) {
    for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
      const name = path.posix.join(relative, entry.name);
      if (entry.name.startsWith('.') || entry.isSymbolicLink())
        throw new Error(`Unexpected hidden file or symlink in export: ${name}`);
      if (entry.isDirectory()) await visit(name);
      else if (entry.isFile() && !/\.(?:php\d*|phtml|phar|cgi|pl|sh)$/i.test(name))
        files.push(name);
      else throw new Error(`Unexpected server code or file type in export: ${name}`);
    }
  }
  await visit('');
  return files.sort();
}

export async function validateExport(directory: string, itemNames: string[]) {
  const files = await exportFiles(directory);
  const available = new Set(files);
  const required = [
    'index.html',
    '404.html',
    'docs/index.html',
    'theme/index.html',
    'api/search',
    'robots.txt',
    'sitemap.xml',
    'favicon.svg',
  ];
  for (const file of required) {
    if (!available.has(file)) throw new Error(`Missing exported file: ${file}`);
  }
  JSON.parse(await readFile(path.join(directory, 'api/search'), 'utf8'));
  for (const name of itemNames) {
    const item = registryItemSchema.parse(
      JSON.parse(await readFile(path.join(directory, 'r', `${name}.json`), 'utf8')),
    );
    if (item.name !== name || !item.files?.length || item.files.some((file) => !file.content))
      throw new Error(`Incomplete exported registry item: ${name}`);
  }

  const brokenLinks = new Set<string>();
  function checkReference(reference: string, page: string) {
    const base = new URL(page.endsWith('index.html') ? page.slice(0, -10) : page, `${siteUrl}/`);
    const target = new URL(reference.replaceAll('&amp;', '&'), base);
    if (target.origin !== siteUrl) return;
    const file = decodeURIComponent(target.pathname).slice(1);
    if (!available.has(file) && !available.has(path.posix.join(file, 'index.html')))
      brokenLinks.add(`Broken exported link in ${page}: ${reference}`);
  }

  const sitemap = await readFile(path.join(directory, 'sitemap.xml'), 'utf8');
  const robots = await readFile(path.join(directory, 'robots.txt'), 'utf8');
  if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`))
    throw new Error('robots.txt must reference the production sitemap');
  const pages = files.filter((file) => file.endsWith('.html'));
  for (const page of pages) {
    const html = await readFile(path.join(directory, page), 'utf8');
    for (const tag of html.matchAll(
      /<(?:a|area|link|script|img|source|video|audio|iframe|use|image)\b[^>]*>/gi,
    )) {
      for (const match of tag[0].matchAll(/\s(?:href|src)="([^"]+)"/gi))
        checkReference(match[1], page);
    }
    if (page === '404.html' || page === '404/index.html' || page.startsWith('_not-found/'))
      continue;
    const canonical = `${siteUrl}/${page.replace(/index\.html$/, '')}`;
    if (!html.includes(`rel="canonical" href="${canonical}"`))
      throw new Error(`Missing production canonical URL in ${page}: ${canonical}`);
    if (!sitemap.includes(`<loc>${canonical}</loc>`))
      throw new Error(`Missing sitemap entry for ${page}`);
  }
  for (const file of files.filter((name) => name.endsWith('.css'))) {
    const css = await readFile(path.join(directory, file), 'utf8');
    for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) checkReference(match[1], file);
  }
  if (brokenLinks.size) throw new Error([...brokenLinks].join('\n'));
  return { files, pages: pages.length, items: itemNames.length };
}

export async function fileDigest(file: string) {
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (!(await handle.stat()).isFile()) throw new Error(`Expected a regular file: ${file}`);
    return createHash('sha256')
      .update(await handle.readFile())
      .digest('hex');
  } finally {
    await handle.close();
  }
}
