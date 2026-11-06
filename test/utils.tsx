import axe from 'axe-core';
import type { ReactNode } from 'react';
import { render, type RenderOptions } from 'vitest-browser-react';
import { DSProvider, type DSProviderProps } from '@/registry/ds/ui/ds-provider';

interface RenderWithDSOptions extends RenderOptions {
  locale?: string;
  dark?: boolean;
  provider?: Omit<DSProviderProps, 'children' | 'locale'>;
}

export function renderWithDS(
  ui: ReactNode,
  { locale = 'en', dark = false, provider, ...options }: RenderWithDSOptions = {},
) {
  const dir = ['ar'].includes(locale.split('-')[0]) ? 'rtl' : 'ltr';
  return render(
    <DSProvider locale={locale} {...provider}>
      <div
        dir={dir}
        lang={locale}
        className={`${dark ? 'dark' : 'light'} bg-background text-on-background`}
        data-testid="ds-root"
      >
        {ui}
      </div>
    </DSProvider>,
    options,
  );
}

export async function expectNoA11yViolations(element: Element = document.body) {
  const results = await axe.run(element, {
    resultTypes: ['violations'],
    rules: { region: { enabled: false } },
  });
  const violations = results.violations.flatMap((violation) =>
    violation.nodes.map((node) => {
      const detail = node.any[0]?.data as
        { fgColor?: string; bgColor?: string; contrastRatio?: number } | undefined;
      const colors = detail?.contrastRatio
        ? ` fg ${detail.fgColor} bg ${detail.bgColor} ratio ${detail.contrastRatio}`
        : '';
      return `${violation.id}: ${node.html.slice(0, 160)}${colors}`;
    }),
  );
  expect(violations).toEqual([]);
}
