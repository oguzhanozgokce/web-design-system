import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const registryRoot = path.join(root, 'registry/ds');
const only = process.argv.slice(2).map((file) => path.resolve(root, file));

const palette =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

const rules: { pattern: RegExp; message: string; skip?: (file: string) => boolean }[] = [
  {
    pattern: /(?<![sS]eed\w*\s*[:=]\s*\{?\s*['"])#[0-9a-fA-F]{3,8}\b(?![\w-])/,
    message: 'raw hex colour; use a Material 3 role',
    skip: (file) => file.endsWith('styles/tokens.css'),
  },
  {
    pattern: new RegExp(
      `(?<![\\w-])(?:[a-z-]+:)*(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|shadow|accent|caret|divide|placeholder)-(?:${palette})-\\d{2,3}\\b`,
    ),
    message: 'Tailwind palette colour; use a Material 3 role',
  },
  {
    pattern: /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|fill|stroke)-(?:white|black)\b/,
    message: 'white or black; use a Material 3 role',
  },
  {
    pattern:
      /(?<![\w-])(?:[a-z-]+:)*-?(?:(?:ml|mr|pl|pr|left|right|scroll-ml|scroll-mr|scroll-pl|scroll-pr|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|border-l|border-r)-(?!to-)[\w./[\]()-]+|(?:start|end)-(?:\d|\[|\(|px\b|full\b|auto\b))/,
    message:
      'physical or deprecated direction utility; use ms/me, ps/pe, inset-s/inset-e, rounded-s/e, border-s/e',
  },
  {
    pattern: /(?<![\w-])(?:[a-z-]+:)*(?:text-left|text-right|float-left|float-right)\b/,
    message: 'physical alignment; use text-start/text-end',
  },
  {
    pattern: /(?<![\w.-])dark:[a-z[]/,
    message: 'dark: variant; roles already switch with the theme',
  },
];

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return files.flat();
}

const problems: string[] = [];
const allFiles = (await walk(registryRoot)).filter((file) => /\.(tsx?|css)$/.test(file));
const files = only.length ? allFiles.filter((file) => only.includes(file)) : allFiles;

for (const file of files) {
  const relative = path.relative(root, file);
  const lines = (await readFile(file, 'utf8')).split('\n');
  lines.forEach((line, index) => {
    for (const rule of rules) {
      if (rule.skip?.(file)) continue;
      const match = line.match(rule.pattern);
      if (match) problems.push(`${relative}:${index + 1} ${rule.message}: ${match[0]}`);
    }
  });
}

for (const file of files.filter((candidate) => candidate.endsWith('.css'))) {
  const css = await readFile(file, 'utf8');
  const inline = [...css.matchAll(/@theme inline \{/g)].map((match) => {
    let depth = 0;
    for (let index = match.index; index < css.length; index++) {
      if (css[index] === '{') depth++;
      if (css[index] === '}' && --depth === 0) return [match.index, index];
    }
    return [match.index, css.length];
  });
  for (const match of css.matchAll(/light-dark\(/g)) {
    if (inline.some(([from, to]) => match.index > from && match.index < to)) continue;
    const line = css.slice(0, match.index).split('\n').length;
    problems.push(
      `${path.relative(root, file)}:${line} light-dark() in a declared variable resolves where it is declared once Tailwind lowers it; write per-mode blocks or keep it in @theme inline`,
    );
  }
}

for (const file of files.filter((candidate) => candidate.endsWith('.messages.ts'))) {
  problems.push(
    `${path.relative(root, file)}: the library ships no translations; put built-in text in labels`,
  );
}

for (const file of files.filter((candidate) => /ui\/[^/]+\.tsx$/.test(candidate))) {
  const code = await readFile(file, 'utf8');
  for (const match of code.matchAll(/useLabels\(\s*'[^']+',\s*(default\w+Labels)/g)) {
    if (!new RegExp(`export const ${match[1]}\\b`).test(code)) {
      problems.push(`${path.relative(root, file)}: ${match[1]} is used but not exported`);
    }
  }
}

const itemsDir = path.join(root, 'registry/items');
const items = await Promise.all(
  (await readdir(itemsDir))
    .filter((file) => file.endsWith('.json'))
    .map(async (file) => JSON.parse(await readFile(path.join(itemsDir, file), 'utf8'))),
);
const docs = (await walk(path.join(root, 'content/docs'))).filter((file) => file.endsWith('.mdx'));
const examples = existsSync(path.join(registryRoot, 'examples'))
  ? await readdir(path.join(registryRoot, 'examples'))
  : [];
const owned = new Set(items.flatMap((item: { files: string[] }) => item.files));

if (!only.length) {
  for (const item of items as { name: string; type: string; category: string; files: string[] }[]) {
    if (item.category === 'foundations') continue;
    const page = docs.find((doc) => path.basename(doc, '.mdx') === item.name);
    if (!page) problems.push(`${item.name}: no docs page content/docs/**/${item.name}.mdx`);
    if (!examples.some((example) => example.startsWith(`${item.name}-`))) {
      problems.push(`${item.name}: no example registry/ds/examples/${item.name}-*.tsx`);
    }
    const main = item.files.find((file) => file.endsWith('.tsx') && !file.endsWith('.messages.ts'));
    if (item.type === 'registry:ui' && main) {
      const test = path.join(registryRoot, main.replace(/\.tsx$/, '.test.tsx'));
      if (!existsSync(test)) problems.push(`${item.name}: no test ${path.relative(root, test)}`);
    }
  }

  for (const file of allFiles) {
    const relative = path.relative(registryRoot, file);
    if (/^(ui|lib|hooks|blocks|styles)\//.test(relative) && !relative.includes('.test.')) {
      if (!owned.has(relative))
        problems.push(`registry/ds/${relative} belongs to no registry item`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\ncheck:ds found ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`check:ds: ${files.length} files clean`);
