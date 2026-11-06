import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { PreviewFrame } from '@/components/docs/preview-frame';

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
    <Tabs items={['Preview', 'Code']} className="not-prose">
      <Tab value="Preview" className="p-0">
        <PreviewFrame name={name} align={align} className={className} />
      </Tab>
      <Tab value="Code" className="p-0">
        <DynamicCodeBlock lang="tsx" code={code.trimEnd()} />
      </Tab>
    </Tabs>
  );
}

export function InstallCommand({ name }: { name: string }) {
  return <DynamicCodeBlock lang="bash" code={`npx shadcn@latest add @ds/${name}`} />;
}

export async function ComponentSource({ file }: { file: string }) {
  const code = await readFile(path.join(process.cwd(), 'registry/ds', file), 'utf8');
  return <DynamicCodeBlock lang={file.endsWith('.css') ? 'css' : 'tsx'} code={code.trimEnd()} />;
}
