'use client';

import { Suspense, useState } from 'react';
import { examples } from '@/registry/__index__';
import { DSProvider } from '@/registry/ds/ui/ds-provider';
import { cn } from '@/lib/cn';
import { PreviewThemePicker, PreviewThemeScope } from '@/components/showcase/preview-theme';

export function PreviewFrame({
  name,
  align = 'center',
  className,
}: {
  name: string;
  align?: 'center' | 'start' | 'stretch';
  className?: string;
}) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const Example = examples[name];

  return (
    <div
      data-preview={name}
      className="not-prose overflow-hidden rounded-lg border border-outline-variant"
    >
      <div className="flex items-center justify-between gap-2 border-b border-outline-variant bg-surface-container-low px-2 py-1.5">
        <PreviewThemePicker size="sm" />
        <div role="group" aria-label="Direction" className="flex gap-0.5">
          {(['ltr', 'rtl'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={dir === value}
              onClick={() => setDir(value)}
              className={cn(
                'rounded-full px-2.5 py-1 text-label-md text-on-surface-variant uppercase',
                dir === value && 'bg-secondary-container text-on-secondary-container',
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <DSProvider locale={dir === 'rtl' ? 'ar-u-nu-latn' : 'en'}>
        <div
          dir={dir}
          lang="en"
          className={cn(
            'flex min-h-56 w-full bg-background p-6 text-on-background sm:p-10',
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
            <p className="text-body-md text-error">Missing example: {name}</p>
          )}
        </div>
      </DSProvider>
    </div>
  );
}
