import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BrandMark } from '@/components/brand-mark';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
          <BrandMark className="text-primary" />
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
