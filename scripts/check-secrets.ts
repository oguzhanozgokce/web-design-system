import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const patterns: { name: string; pattern: RegExp }[] = [
  { name: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  {
    name: 'GitHub token',
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,})/,
  },
  { name: 'Stripe key', pattern: /\b[sr]k_(?:live|test)_[A-Za-z0-9]{16,}/ },
  { name: 'Slack token', pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'Google API key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'Private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  {
    name: 'JSON Web Token',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  },
  {
    name: 'Hard-coded credential',
    pattern:
      /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|secret[_-]?key|service[_-]?role[_-]?key)\b["']?\s*[:=]\s*["'][A-Za-z0-9_\-./+=]{20,}["']/i,
  },
];

const binary = /\.(?:png|jpe?g|webp|gif|ico|woff2?|ttf|otf|pdf|zip)$/i;

const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  cwd: root,
  encoding: 'utf8',
})
  .split('\n')
  .filter((file) => file && !binary.test(file) && !file.endsWith('package-lock.json'));

const problems: string[] = [];
for (const file of files) {
  let text: string;
  try {
    text = await readFile(path.join(root, file), 'utf8');
  } catch {
    continue;
  }
  text.split('\n').forEach((line, index) => {
    for (const { name, pattern } of patterns) {
      if (pattern.test(line)) problems.push(`${file}:${index + 1} ${name}`);
    }
  });
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(
    `\ncheck:secrets found ${problems.length} possible secret(s). Move them to an ignored .env file.`,
  );
  process.exit(1);
}
console.log(`check:secrets: ${files.length} files clean`);
