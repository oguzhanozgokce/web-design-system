import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { registrySchema } from 'shadcn/schema';
import { fileDigest, validateExport } from '../lib/hosting.ts';
import { registryTemplate, siteUrl } from '../lib/site.ts';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, '.hostinger');
const registry = registrySchema.parse(
  JSON.parse(await readFile(path.join(root, 'registry.json'), 'utf8')),
);
const result = await validateExport(
  path.join(root, 'out'),
  registry.items.map(({ name }) => name),
);
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const dirty = Boolean(
  execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim(),
);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const documentRoot = path.join(output, 'public_html');
await cp(path.join(root, 'out'), documentRoot, { recursive: true });
await cp(path.join(root, 'hosting/.htaccess'), path.join(documentRoot, '.htaccess'));
await cp(
  path.join(root, 'hosting/static.htaccess'),
  path.join(documentRoot, '_next/static/.htaccess'),
);
await writeFile(
  path.join(documentRoot, 'version.json'),
  JSON.stringify({ commit, dirty, items: result.items, registry: registryTemplate }, null, 2),
);

const archive = 'highwren-ui.tar.gz';
execFileSync('tar', ['-czf', path.join(output, archive), '-C', documentRoot, '.'], {
  env: { ...process.env, COPYFILE_DISABLE: '1' },
});
await writeFile(
  path.join(output, 'manifest.json'),
  JSON.stringify(
    {
      commit,
      dirty,
      site: siteUrl,
      pages: result.pages,
      items: result.items,
      files: result.files.length + 3,
      archive,
      sha256: await fileDigest(path.join(output, archive)),
    },
    null,
    2,
  ),
);
console.log(
  `prepare:hosting: ${result.pages} HTML pages and ${result.items} registry items packaged in .hostinger/${archive}${dirty ? ' (uncommitted preview; CI deployment will reject it)' : ''}`,
);
