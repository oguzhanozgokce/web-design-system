import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { fileDigest, validateExport } from './hosting';
import { siteUrl } from './site';

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'highwren-export-'));
  directories.push(directory);
  const files: Record<string, string> = {
    '404.html': '<h1>Not found</h1>',
    'robots.txt': `Sitemap: ${siteUrl}/sitemap.xml`,
    'api/search': '{"indexes":[]}',
    'favicon.svg': '<svg/>',
    'sitemap.xml': ['/', '/docs/', '/theme/']
      .map((route) => `<loc>${siteUrl}${route}</loc>`)
      .join(''),
    'r/button.json': JSON.stringify({
      name: 'button',
      type: 'registry:ui',
      files: [
        { path: 'button.tsx', type: 'registry:ui', content: 'export const Button = () => null;' },
      ],
    }),
  };
  for (const route of ['', 'docs/', 'theme/'])
    files[`${route}index.html`] =
      `<link rel="canonical" href="${siteUrl}/${route}"><style href="base-ui-disable-scrollbar"></style><a href="/docs">Docs</a>`;
  for (const [file, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true });
    await writeFile(path.join(directory, file), content);
  }
  return directory;
}

it('accepts directory routes and complete registry payloads from a static export', async () => {
  const result = await validateExport(await fixture(), ['button']);
  expect(result).toMatchObject({ pages: 4, items: 1 });
});

it('rejects exports that would upload symlinks, hidden configuration or executable server files', async () => {
  const directory = await fixture();
  await symlink(path.join(directory, 'index.html'), path.join(directory, 'linked.html'));
  await expect(validateExport(directory, ['button'])).rejects.toThrow('symlink');
  await rm(path.join(directory, 'linked.html'));
  for (const file of ['.env', 'preview.php']) {
    await writeFile(path.join(directory, file), 'unexpected');
    await expect(validateExport(directory, ['button'])).rejects.toThrow('Unexpected');
    await rm(path.join(directory, file));
  }
});

it('reports broken links in lowercase and uppercase HTML before packaging', async () => {
  const directory = await fixture();
  for (const link of [
    '<a href="/docs/missing/">Missing</a>',
    '<SCRIPT SRC="/missing.js"></SCRIPT>',
  ]) {
    await writeFile(
      path.join(directory, 'docs/index.html'),
      `<link rel="canonical" href="${siteUrl}/docs/">${link}`,
    );
    await expect(validateExport(directory, ['button'])).rejects.toThrow(
      'Broken exported link in docs/index.html',
    );
  }
});

it('hashes a regular artifact and refuses to follow a substituted symlink', async () => {
  const directory = await fixture();
  const artifact = path.join(directory, 'artifact');
  await writeFile(artifact, 'abc');
  expect(await fileDigest(artifact)).toBe(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
  await rm(artifact);
  await symlink(path.join(directory, 'index.html'), artifact);
  await expect(fileDigest(artifact)).rejects.toThrow();
});

it('rejects registry JSON without embedded source and pages with the wrong canonical host', async () => {
  const directory = await fixture();
  await writeFile(
    path.join(directory, 'r/button.json'),
    '{"name":"button","type":"registry:ui","files":[]}',
  );
  await expect(validateExport(directory, ['button'])).rejects.toThrow(
    'Incomplete exported registry item',
  );
  await writeFile(
    path.join(directory, 'docs/index.html'),
    '<link rel="canonical" href="https://example.com/docs/">',
  );
  await expect(validateExport(directory, [])).rejects.toThrow('Missing production canonical URL');
});
