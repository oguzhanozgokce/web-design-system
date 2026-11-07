import {
  installedRegistryPath,
  registryFileTarget,
  rewriteRegistryImports,
} from '@/lib/registry-paths';

it('keeps registry targets and documented installation paths in sync', () => {
  for (const [file, expected] of [
    ['ui/button.tsx', 'components/ds/button.tsx'],
    ['lib/utils.ts', 'lib/ds/utils.ts'],
    ['hooks/use-media-query.ts', 'hooks/ds/use-media-query.ts'],
    ['blocks/settings.tsx', 'components/settings.tsx'],
    ['styles/theme.css', 'styles/ds/theme.css'],
    ['licenses/LICENSE', 'licenses/ds/LICENSE'],
    ['licenses/NOTICE', 'licenses/ds/NOTICE'],
  ]) {
    expect(
      installedRegistryPath({
        path: `registry/ds/${file}`,
        type: '',
        target: registryFileTarget(file),
      }),
    ).toBe(expected);
  }
});

it('shows copyable imports in examples without changing external imports or code', () => {
  const source = `import { useState } from 'react';
import type { ButtonProps } from '@/registry/ds/ui/button';
import { tv } from '@/registry/ds/lib/utils.ts';
const load = () => import('@/registry/ds/hooks/use-media-query');`;
  expect(rewriteRegistryImports(source)).toBe(`import { useState } from 'react';
import type { ButtonProps } from '@/components/ds/button';
import { tv } from '@/lib/ds/utils';
const load = () => import('@/hooks/ds/use-media-query');`);
});
