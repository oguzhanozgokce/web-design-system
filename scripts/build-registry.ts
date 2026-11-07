import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

interface Credit {
  source: string;
  url: string;
  license: string;
  copyright: string;
}

interface ItemMeta {
  name: string;
  type: 'registry:ui' | 'registry:lib' | 'registry:hook' | 'registry:block' | 'registry:style';
  title: string;
  description: string;
  category: string;
  files: string[];
  dependencies?: string[];
  registryDependencies?: string[];
  docs?: string;
  credits?: Credit[];
}

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'registry/ds');
const itemsDir = path.join(root, 'registry/items');
const builtIn = new Set(['react', 'react-dom', 'react/jsx-runtime']);

function fileType(file: string) {
  if (file.startsWith('ui/')) return 'registry:ui';
  if (file.startsWith('hooks/')) return 'registry:hook';
  if (file.startsWith('lib/')) return 'registry:lib';
  if (file.startsWith('blocks/')) return 'registry:component';
  return 'registry:file';
}

function fileTarget(file: string) {
  if (file.startsWith('styles/')) return `~/styles/ds/${path.basename(file)}`;
  return undefined;
}

function packageName(specifier: string) {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function importsOf(code: string) {
  const specifiers = new Set<string>();
  for (const match of code.matchAll(/(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]/g)) {
    specifiers.add(match[1]);
  }
  for (const match of code.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    specifiers.add(match[1]);
  }
  for (const match of code.matchAll(/@import\s+['"]\.\/([^'"]+)['"]/g)) {
    specifiers.add(`@/registry/ds/styles/${match[1]}`);
  }
  return [...specifiers];
}

function resolveRegistryFile(specifier: string) {
  const relative = specifier.replace(/^@\/registry\/ds\//, '');
  for (const candidate of [relative, `${relative}.ts`, `${relative}.tsx`]) {
    if (existsSync(path.join(source, candidate)) && path.extname(candidate)) return candidate;
  }
  return relative;
}

const metaFiles = (await readdir(itemsDir)).filter((file) => file.endsWith('.json')).sort();
const items: ItemMeta[] = await Promise.all(
  metaFiles.map(async (file) => JSON.parse(await readFile(path.join(itemsDir, file), 'utf8'))),
);

const owner = new Map<string, string>();
for (const item of items) {
  for (const file of item.files) {
    if (owner.has(file))
      throw new Error(`${file} belongs to both ${owner.get(file)} and ${item.name}`);
    owner.set(file, item.name);
  }
}

const problems: string[] = [];
const registryItems = [];

for (const item of items) {
  const dependencies = new Set(item.dependencies ?? []);
  const registryDependencies = new Set<string>(item.registryDependencies ?? []);

  for (const file of item.files) {
    const absolute = path.join(source, file);
    if (!existsSync(absolute)) {
      problems.push(`${item.name}: missing file registry/ds/${file}`);
      continue;
    }
    const code = await readFile(absolute, 'utf8');
    for (const specifier of importsOf(code)) {
      if (specifier.startsWith('@/registry/ds/')) {
        const target = resolveRegistryFile(specifier);
        const dependency = owner.get(target);
        if (!dependency)
          problems.push(`${item.name}: ${file} imports ${specifier}, owned by no item`);
        else if (dependency !== item.name) registryDependencies.add(`@ds/${dependency}`);
      } else if (specifier.startsWith('.') || specifier.startsWith('@/')) {
        problems.push(`${item.name}: ${file} uses a relative or non-registry import ${specifier}`);
      } else if (!builtIn.has(specifier) && !specifier.startsWith('node:')) {
        dependencies.add(packageName(specifier));
      }
    }
  }

  registryItems.push({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    categories: [item.category],
    ...(dependencies.size ? { dependencies: [...dependencies].sort() } : {}),
    ...(registryDependencies.size
      ? { registryDependencies: [...registryDependencies].sort() }
      : {}),
    files: item.files.map((file) => {
      const target = fileTarget(file);
      return {
        path: `registry/ds/${file}`,
        type: fileType(file),
        ...(target ? { target } : {}),
      };
    }),
    ...(item.docs ? { docs: item.docs } : {}),
    ...(item.credits?.length ? { meta: { credits: item.credits } } : {}),
  });
}

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'ds',
  homepage: 'https://github.com/oguzhanozgokce/web-design-system',
  items: registryItems,
};

await writeFile(path.join(root, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);

const examplesDir = path.join(source, 'examples');
const examples = existsSync(examplesDir)
  ? (await readdir(examplesDir)).filter((file) => file.endsWith('.tsx')).sort()
  : [];

const index = `'use client';

import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export const examples: Record<string, LazyExoticComponent<ComponentType>> = {
${examples
  .map((file) => {
    const name = file.replace(/\.tsx$/, '');
    return `  '${name}': lazy(() => import('@/registry/ds/examples/${name}')),`;
  })
  .join('\n')}
};
`;

await writeFile(path.join(root, 'registry/__index__.tsx'), index);

const vendored: (Credit & { item: string })[] = [
  {
    item: 'icons',
    source: 'Material Symbols',
    url: 'https://github.com/google/material-design-icons',
    license: 'Apache-2.0',
    copyright: 'Copyright 2022 Google LLC',
  },
];

const credits = [
  ...vendored,
  ...items.flatMap((item) =>
    (item.credits ?? []).map((credit) => ({ ...credit, item: item.name })),
  ),
];

for (const credit of credits) {
  if (!['MIT', 'ISC', 'Apache-2.0'].includes(credit.license))
    problems.push(
      `${credit.item}: credit ${credit.source} has unsupported license ${credit.license}`,
    );
}

const mitText = (copyright: string) => `${copyright}

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

const iscText = (copyright: string) => `${copyright}

Permission to use, copy, modify, and/or distribute this software for any purpose with or without
fee is hereby granted, provided that the above copyright notice and this permission notice appear
in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS
SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
OF THIS SOFTWARE.`;

const apacheText = (copyright: string) => `${copyright}

Licensed under the Apache License, Version 2.0, the same license as this project; the full text is
in LICENSE.`;

const licenseText: Record<string, (copyright: string) => string> = {
  MIT: mitText,
  ISC: iscText,
  'Apache-2.0': apacheText,
};

const bySource = new Map<string, (Credit & { item: string })[]>();
for (const credit of credits) {
  bySource.set(credit.source, [...(bySource.get(credit.source) ?? []), credit]);
}

const notices = `# Third-party notices

Generated by \`scripts/build-registry.ts\` from the \`credits\` field of \`registry/items/*.json\`. Do
not edit by hand.

These components contain code adapted from the projects below. The registry also carries each
item's credits in \`meta.credits\`, so a project that installs one of them can keep the notice.

${[...bySource.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([source, entries]) => {
    const copyrights = [...new Set(entries.map((entry) => entry.copyright))];
    const license = entries[0].license;
    const text = copyrights.map((copyright) => licenseText[license](copyright)).join('\n\n');
    return `## ${source}

${entries.map((entry) => `- \`${entry.item}\`: <${entry.url}>`).join('\n')}

License: ${license}

\`\`\`text
${text}
\`\`\``;
  })
  .join('\n\n')}
`;

await writeFile(path.join(root, 'THIRD_PARTY_NOTICES.md'), notices);

if (problems.length) {
  console.error(problems.map((problem) => `registry: ${problem}`).join('\n'));
  process.exitCode = 1;
}
console.log(`registry: ${registryItems.length} items, ${examples.length} examples`);
