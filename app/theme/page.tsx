import type { Metadata } from 'next';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ThemeBuilder } from '@/components/theme-builder/theme-builder';
import { buildSchemes, defaultSettings } from '@/components/theme-builder/theme-model';
import { baseOptions } from '@/lib/layout.shared';
import { DSProvider } from '@/registry/ds/ui/ds-provider';

export const metadata: Metadata = {
  title: 'Theme builder',
  description:
    'Generate a colour scheme from one seed colour, preview it on an admin screen and export tokens.css or tokens/config.json.',
};

export default function ThemePage() {
  return (
    <HomeLayout {...baseOptions()}>
      <DSProvider locale="en">
        <ThemeBuilder initialSchemes={buildSchemes(defaultSettings.seed, defaultSettings.style)} />
      </DSProvider>
    </HomeLayout>
  );
}
