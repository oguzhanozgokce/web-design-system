import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { PreviewFrame } from '@/components/docs/preview-frame';
import { rewriteRegistryImports } from '@/lib/registry-paths';

export async function ComponentPreview({
  name,
  align,
  className,
}: {
  name: string;
  align?: 'center' | 'start' | 'stretch';
  className?: string;
}) {
  const code = await readFile(
    path.join(process.cwd(), 'registry/ds/examples', `${name}.tsx`),
    'utf8',
  ).catch(() => `Missing example file registry/ds/examples/${name}.tsx`);

  return (
    <PreviewFrame
      name={name}
      align={align}
      className={className}
      code={<DynamicCodeBlock lang="tsx" code={rewriteRegistryImports(code.trimEnd())} />}
    />
  );
}

export function InstallCommand({ name }: { name: string }) {
  return <DynamicCodeBlock lang="bash" code={`npx shadcn@4.23.0 add @ds/${name}`} />;
}

export async function ComponentSource({ file }: { file: string }) {
  const code = await readFile(path.join(process.cwd(), 'registry/ds', file), 'utf8');
  return <DynamicCodeBlock lang={file.endsWith('.css') ? 'css' : 'tsx'} code={code.trimEnd()} />;
}
