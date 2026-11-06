'use client';

import { useId, type ReactNode } from 'react';
import { CopyButton } from '@/registry/ds/ui/copy-button';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

export interface ThemeExportProps {
  css: string;
  config: string;
  compose: string;
}

interface ExportBlockProps {
  id: string;
  fileName: string;
  copyLabel: string;
  code: string;
  children: ReactNode;
}

function InlineCode({ children }: { children: ReactNode }) {
  return <code className="font-mono text-body-sm text-on-surface">{children}</code>;
}

function ExportBlock({ id, fileName, copyLabel, code, children }: ExportBlockProps) {
  return (
    <TabPanel id={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-prose min-w-0 flex-1 basis-64 text-body-md text-on-surface-variant">
          {children}
        </p>
        <CopyButton value={code} size="sm">
          {copyLabel}
        </CopyButton>
      </div>
      <pre
        role="region"
        tabIndex={0}
        dir="ltr"
        aria-label={fileName}
        data-export-code={id}
        className="max-h-96 overflow-auto rounded-md border border-outline-variant bg-surface-container p-4 font-mono text-body-sm text-on-surface focus-ring"
      >
        <code>{code}</code>
      </pre>
    </TabPanel>
  );
}

export function ThemeExport({ css, config, compose }: ThemeExportProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} data-slot="theme-export" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-title-lg text-on-surface">
          Export
        </h2>
        <p className="max-w-prose text-body-md text-on-surface-variant">
          The same seed and style give the same hex values on the web and on mobile.
        </p>
      </div>
      <Tabs variant="secondary" defaultSelectedKey="css">
        <TabList aria-label="Export format">
          <Tab id="css">tokens.css</Tab>
          <Tab id="config">config.json</Tab>
          <Tab id="compose">Compose</Tab>
        </TabList>
        <ExportBlock id="css" fileName="tokens.css" copyLabel="Copy CSS" code={css}>
          Replaces the colour blocks of <InlineCode>registry/ds/styles/tokens.css</InlineCode>:
          light, dark, and the medium and high contrast levels. The motion variables below them stay
          as they are.
        </ExportBlock>
        <ExportBlock id="config" fileName="tokens/config.json" copyLabel="Copy JSON" code={config}>
          Save it as <InlineCode>tokens/config.json</InlineCode> and run{' '}
          <InlineCode>npm run generate</InlineCode> to rebuild the tokens from the source.
        </ExportBlock>
        <ExportBlock id="compose" fileName="Compose" copyLabel="Copy Kotlin" code={compose}>
          Pass its <InlineCode>colorScheme</InlineCode> and <InlineCode>extendedColors</InlineCode>{' '}
          to <InlineCode>DSTheme</InlineCode> in the mobile library; the second carries success,
          warning and info. Without <InlineCode>dark</InlineCode> the call follows the system
          setting.
        </ExportBlock>
      </Tabs>
    </section>
  );
}
