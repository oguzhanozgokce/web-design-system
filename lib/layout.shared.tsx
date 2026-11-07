import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-[0.4375rem] bg-primary-solid text-[0.6875rem] leading-none font-semibold text-on-primary-solid"
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
