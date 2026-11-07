'use client';

import { Suspense, useState, type ReactNode } from 'react';
import type { Key } from 'react-aria-components';
import { examples } from '@/registry/__index__';
import { DSProvider } from '@/registry/ds/ui/ds-provider';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';
import { cn } from '@/lib/cn';
import { PreviewThemePicker, PreviewThemeScope } from '@/components/showcase/preview-theme';

type Direction = 'ltr' | 'rtl';

const directions: { id: Direction; label: string }[] = [
  { id: 'ltr', label: 'LTR' },
  { id: 'rtl', label: 'RTL' },
];

function isDirection(value: unknown): value is Direction {
  return value === 'ltr' || value === 'rtl';
}

export interface PreviewFrameProps {
  name: string;
  align?: 'center' | 'start' | 'stretch';
  className?: string;
  code?: ReactNode;
}

export function PreviewFrame({ name, align = 'center', className, code }: PreviewFrameProps) {
  const [dir, setDir] = useState<Direction>('ltr');
  const [view, setView] = useState<Key>('preview');
  const Example = examples[name];

  return (
    <Tabs
      variant="pill"
      size="sm"
      selectedKey={view}
      onSelectionChange={setView}
      data-preview={name}
      className="not-prose my-6 gap-0 overflow-clip rounded-container border border-outline-subtle bg-surface-raised text-on-surface"
    >
      <div
        data-slot="preview-toolbar"
        className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-outline-subtle px-2 py-2"
      >
        <TabList aria-label="Example view">
          <Tab id="preview">Preview</Tab>
          {code ? <Tab id="code">Code</Tab> : null}
        </TabList>
        {view === 'preview' ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <PreviewThemePicker size="sm" />
            <SegmentedControl
              aria-label="Direction"
              size="sm"
              disallowEmptySelection
              selectedKeys={[dir]}
              onSelectionChange={(keys) => {
                const [next] = keys;
                if (isDirection(next)) setDir(next);
              }}
            >
              {directions.map((item) => (
                <SegmentedControlItem key={item.id} id={item.id}>
                  {item.label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
        ) : null}
      </div>
      <TabPanel id="preview" className="rounded-none -outline-offset-2">
        <DSProvider locale={dir === 'rtl' ? 'ar-u-nu-latn' : 'en'}>
          <div
            dir={dir}
            lang="en"
            data-slot="preview-stage"
            className={cn(
              'flex min-h-56 w-full bg-canvas p-6 text-on-surface sm:p-10',
              align === 'center' && 'items-center justify-center',
              align === 'start' && 'items-start justify-start',
              align === 'stretch' && 'items-stretch',
              className,
            )}
          >
            {Example ? (
              <PreviewThemeScope className="contents">
                <Suspense fallback={null}>
                  <Example />
                </Suspense>
              </PreviewThemeScope>
            ) : (
              <p className="text-sm text-error">Missing example: {name}</p>
            )}
          </div>
        </DSProvider>
      </TabPanel>
      {code ? (
        <TabPanel
          id="code"
          className="rounded-none -outline-offset-2 [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0 [&_figure]:shadow-none"
        >
          {code}
        </TabPanel>
      ) : null}
    </Tabs>
  );
}
