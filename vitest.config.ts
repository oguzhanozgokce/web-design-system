import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-dom/server',
      'react/jsx-dev-runtime',
      'react-aria-components',
      'motion/react',
      '@internationalized/date',
      '@material/material-color-utilities',
      'tailwind-variants/config',
      'vitest-browser-react',
      'axe-core',
    ],
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          server: { deps: { inline: ['@material/material-color-utilities'] } },
          include: ['registry/**/*.test.ts', 'lib/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['registry/**/*.test.tsx', 'components/**/*.test.tsx'],
          setupFiles: ['./test/setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
