import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-md bg-primary text-label-md text-on-primary"
          >
            ds
          </span>
          {appName}
        </span>
      ),
    },
    links: [
      { text: 'Docs', url: '/docs' },
      { text: 'Theme builder', url: '/theme' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
