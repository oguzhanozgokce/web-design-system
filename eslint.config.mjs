import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const noComments = {
  meta: { type: 'suggestion', schema: [] },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (
            comment.type === 'Block' &&
            comment.range[0] === 0 &&
            /^\s*@license\b/.test(comment.value) &&
            comment.value.includes('SPDX-License-Identifier:')
          )
            continue;
          context.report({
            loc: comment.loc,
            message:
              'Only required licence headers belong in code. Put reasoning in commit messages or docs.',
          });
        }
      },
    };
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    plugins: { ds: { rules: { 'no-comments': noComments } } },
    rules: {
      'ds/no-comments': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['registry/ds/**/*.{ts,tsx}'],
    rules: {
      '@next/next/no-img-element': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message:
                'Import registry files through @/registry/ds/... so the shadcn CLI can rewrite them.',
            },
            {
              group: ['next', 'next/*', 'next-intl', 'next-intl/*'],
              message: 'The library stays framework-agnostic. Routing comes from DSProvider.',
            },
            {
              group: ['lucide-react', '@/components/*', '@/lib/*'],
              message: 'Use @/registry/ds/lib/icons and other registry files only.',
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    '.hostinger/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.source/**',
    'public/r/**',
    'registry/__index__.tsx',
    '.vitest/**',
  ]),
]);

export default eslintConfig;
