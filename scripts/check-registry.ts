import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { resolveConfigPaths } from '@shadcn/registry/internal/get-config';
import { updateFiles } from '@shadcn/registry/internal/updaters/update-files';
import { rawConfigSchema, registrySchema } from 'shadcn/schema';
import { installedRegistryPath, rewriteRegistryImports } from '../lib/registry-paths.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const exec = promisify(execFile);
const registry = registrySchema.parse(
  JSON.parse(await readFile(path.join(root, 'registry.json'), 'utf8')),
);
const installation = await readFile(
  path.join(root, 'content/docs/foundations/installation.mdx'),
  'utf8',
);
const snippet = installation.match(/```json title="components.json"\n([\s\S]*?)\n```/);
if (!snippet) throw new Error('Installation docs must contain a components.json example');
const documented = rawConfigSchema.parse(JSON.parse(snippet[1]));
const files = await Promise.all(
  registry.items
    .flatMap((item) => item.files ?? [])
    .map(async (file) => ({
      ...file,
      content: await readFile(path.join(root, file.path), 'utf8'),
    })),
);
const byPath = new Map(files.map((file) => [file.path, file]));
const payloads = new Map(
  registry.items.map((item) => [
    `/r/${item.name}.json`,
    { ...item, files: item.files?.map((file) => byPath.get(file.path)) },
  ]),
);
const server = createServer((request, response) => {
  const item = payloads.get(request.url ?? '');
  response.writeHead(item ? 200 : 404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(item ?? { error: 'Missing registry item' }));
});
await new Promise<void>((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Registry server did not start');
const registryOrigin = `http://127.0.0.1:${address.port}`;

try {
  for (const aliases of [
    documented.aliases,
    {
      components: '@/kit',
      ui: '@/kit/controls',
      lib: '@/kit/helpers',
      hooks: '@/kit/hooks',
      utils: '@/kit/helpers/utils',
    },
  ]) {
    const consumer = await mkdtemp(path.join(tmpdir(), 'ds-consumer-'));
    try {
      await mkdir(path.join(consumer, 'app'), { recursive: true });
      await symlink(path.join(root, 'node_modules'), path.join(consumer, 'node_modules'), 'dir');
      await writeFile(
        path.join(consumer, 'package.json'),
        JSON.stringify({
          name: 'ds-consumer',
          private: true,
          type: 'module',
          dependencies: {
            next: '16.4.5',
            react: '19.3.1',
            'react-dom': '19.3.1',
            tailwindcss: '4.3.4',
          },
        }),
      );
      await writeFile(
        path.join(consumer, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            target: 'ES2023',
            lib: ['ES2023', 'DOM', 'DOM.Iterable'],
            module: 'esnext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: true,
            noEmit: true,
            esModuleInterop: true,
            types: ['react', 'react-dom'],
            paths: { '@/*': ['./*'] },
          },
          include: ['**/*.ts', '**/*.tsx'],
          exclude: ['node_modules'],
        }),
      );
      await writeFile(path.join(consumer, 'app/global.css'), "@import 'tailwindcss';\n");
      await writeFile(
        path.join(consumer, 'app/page.tsx'),
        'export default function Page() { return null; }\n',
      );
      const raw = { ...documented, aliases, tailwind: { ...documented.tailwind, baseColor: '' } };
      await writeFile(path.join(consumer, 'components.json'), JSON.stringify(raw));
      const config = await resolveConfigPaths(consumer, raw);
      await exec(
        process.execPath,
        [
          path.join(path.dirname(require.resolve('shadcn')), 'index.js'),
          'add',
          '@ds/button',
          '--cwd',
          consumer,
          '--dry-run',
          '--silent',
        ],
        {
          cwd: consumer,
          env: { ...process.env, DS_REGISTRY_URL: registryOrigin },
          maxBuffer: 1024 * 1024,
        },
      );
      await updateFiles(files, config, { silent: true, interactive: false, isRemote: true });

      if (aliases === documented.aliases) {
        for (const file of files) await readFile(path.join(consumer, installedRegistryPath(file)));
        await mkdir(path.join(consumer, 'examples'));
        for (const name of await readdir(path.join(root, 'registry/ds/examples'))) {
          if (!name.endsWith('.tsx')) continue;
          const source = await readFile(path.join(root, 'registry/ds/examples', name), 'utf8');
          await writeFile(path.join(consumer, 'examples', name), rewriteRegistryImports(source));
        }
      }

      try {
        await exec(
          process.execPath,
          [
            require.resolve('typescript/lib/tsc.js'),
            '--project',
            path.join(consumer, 'tsconfig.json'),
          ],
          { cwd: consumer, maxBuffer: 1024 * 1024 },
        );
      } catch (error) {
        const output = error as { stdout?: string; stderr?: string };
        throw new Error(
          `Installed registry failed typechecking for ${aliases.ui}\n${output.stdout ?? ''}${output.stderr ?? ''}`,
          { cause: error },
        );
      }
      console.log(
        `check:registry: ${registry.items.length} items install and typecheck with ${aliases.ui}`,
      );
    } finally {
      await rm(consumer, { recursive: true, force: true });
    }
  }
} finally {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}
