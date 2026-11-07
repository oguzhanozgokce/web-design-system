'use client';

import { useId, type ReactNode } from 'react';
import { CopyButton } from '@/registry/ds/ui/copy-button';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export interface ThemeExportProps {
  css: string;
  config: string;
  isPending: boolean;
}

interface ExportBlockProps {
  id: string;
  fileName: string;
  copyLabel: string;
  code: string;
  isPending: boolean;
  children: ReactNode;
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-neutral-soft px-1 py-0.5 font-mono text-[0.85em] text-on-surface">
      {children}
    </code>
  );
}

function ExportBlock({ id, fileName, copyLabel, code, isPending, children }: ExportBlockProps) {
  return (
    <TabPanel id={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-prose min-w-0 flex-1 basis-64 text-sm text-on-surface-variant">
          {children}
        </p>
        <CopyButton value={code} size="sm" variant="outline" isDisabled={isPending}>
          {copyLabel}
        </CopyButton>
      </div>
      <pre
        role="region"
        tabIndex={0}
        dir="ltr"
        aria-label={fileName}
        data-export-code={id}
        className="max-h-96 overflow-auto rounded-field border border-outline-subtle bg-surface-raised p-4 font-mono text-xs leading-5 text-on-surface focus-ring"
      >
        <code>{code}</code>
      </pre>
    </TabPanel>
  );
}

export function ThemeExport({ css, config, isPending }: ThemeExportProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={isPending}
      data-slot="theme-export"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-lg font-semibold text-on-surface">
          Export
        </h2>
        <p className="max-w-prose text-sm text-on-surface-variant">
          Copy the generated tokens, or the config that regenerates them from the seed.
        </p>
      </div>
      <Tabs defaultSelectedKey="css">
        <TabList aria-label="Export format">
          <Tab id="css">tokens.css</Tab>
          <Tab id="config">config.json</Tab>
        </TabList>
        <ExportBlock
          id="css"
          fileName="tokens.css"
          copyLabel="Copy CSS"
          code={css}
          isPending={isPending}
        >
          Replaces the colour blocks of <InlineCode>registry/ds/styles/tokens.css</InlineCode>:
          light, dark, the medium and high contrast levels, and the eight chart colours for each
          mode. The motion variables below them stay as they are.
        </ExportBlock>
        <ExportBlock
          id="config"
          fileName="tokens/config.json"
          copyLabel="Copy JSON"
          code={config}
          isPending={isPending}
        >
          Save it as <InlineCode>tokens/config.json</InlineCode> and run{' '}
          <InlineCode>npm run generate</InlineCode> to rebuild the tokens from the source.
        </ExportBlock>
      </Tabs>
    </section>
  );
}
