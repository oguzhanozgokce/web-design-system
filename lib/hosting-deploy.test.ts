import { execFile } from 'node:child_process';
import { chmod, mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterEach, expect, it } from 'vitest';

const exec = promisify(execFile);
const script = path.resolve('scripts/activate-hostinger.sh');
const commit = 'a'.repeat(40);
const release = `${commit}-123-1`;
const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function fixture(healthy = true) {
  const directory = await realpath(await mkdtemp(path.join(tmpdir(), 'highwren-deploy-')));
  directories.push(directory);
  const root = path.join(directory, 'domains/ui.highwren.com');
  const live = path.join(root, 'public_html');
  const stage = path.join(root, `.deploy/${release}/site`);
  const bin = path.join(directory, 'bin');
  const files: Record<string, string> = {
    [`${live}/index.html`]: 'old',
    [`${live}/default.php`]: 'placeholder',
    [`${live}/_next/static/old.js`]: 'existing browser chunk',
    [`${live}/.well-known/acme-challenge/token`]: 'certificate token',
    [`${directory}/domains/another.example/public_html/index.html`]: 'another site',
    [`${stage}/index.html`]: 'new',
    [`${stage}/404.html`]: 'not found',
    [`${stage}/.htaccess`]: 'DirectoryIndex index.html',
    [`${stage}/r/button.json`]: '{}',
    [`${stage}/api/search`]: '{}',
    [`${stage}/_next/static/new.js`]: 'new browser chunk',
    [`${stage}/version.json`]: JSON.stringify({ commit, dirty: false }, null, 2),
    [`${bin}/curl`]: healthy
      ? '#!/bin/sh\ncat "$TEST_LIVE/version.json"\n'
      : '#!/bin/sh\nexit 22\n',
    [`${bin}/sleep`]: '#!/bin/sh\nexit 0\n',
  };
  for (const [file, content] of Object.entries(files)) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content);
  }
  await chmod(path.join(bin, 'curl'), 0o755);
  await chmod(path.join(bin, 'sleep'), 0o755);
  const run = () =>
    exec('bash', [script, root, release, commit], {
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, TEST_LIVE: live },
    });
  return { directory, root, live, stage, run };
}

it('replaces only the UI site while preserving ACME challenges and existing browser chunks', async () => {
  const { directory, root, live, run } = await fixture();
  await run();
  expect(await readFile(path.join(live, 'index.html'), 'utf8')).toBe('new');
  expect(await readFile(path.join(live, '_next/static/old.js'), 'utf8')).toBe(
    'existing browser chunk',
  );
  expect(await readFile(path.join(live, '.well-known/acme-challenge/token'), 'utf8')).toBe(
    'certificate token',
  );
  expect(
    await readFile(path.join(directory, 'domains/another.example/public_html/index.html'), 'utf8'),
  ).toBe('another site');
  expect(await readFile(path.join(root, `.deploy/${release}/previous/index.html`), 'utf8')).toBe(
    'old',
  );
  await expect(readFile(path.join(live, 'default.php'))).rejects.toThrow();
});

it('restores the previous site and returns failure when the public revision check fails', async () => {
  const { live, run } = await fixture(false);
  await expect(run()).rejects.toMatchObject({ code: 1 });
  expect(await readFile(path.join(live, 'index.html'), 'utf8')).toBe('old');
  expect(await readFile(path.join(live, 'default.php'), 'utf8')).toBe('placeholder');
  await expect(readFile(path.join(live, '_next/static/new.js'))).rejects.toThrow();
});

it('refuses an uncommitted package before changing the live site', async () => {
  const { stage, live, run } = await fixture();
  await writeFile(
    path.join(stage, 'version.json'),
    JSON.stringify({ commit, dirty: true }, null, 2),
  );
  await expect(run()).rejects.toMatchObject({ code: 1 });
  expect(await readFile(path.join(live, 'index.html'), 'utf8')).toBe('old');
});
