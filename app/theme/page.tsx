import type { Metadata } from 'next';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ThemeBuilder } from '@/components/theme-builder/theme-builder';
import { baseOptions } from '@/lib/layout.shared';
import { DSProvider } from '@/registry/ds/ui/ds-provider';

export const metadata: Metadata = {
  title: 'Theme builder',
  description:
    'Generate a Material 3 scheme from one seed colour, preview it on an admin screen and export tokens.css, tokens/config.json or the Compose call.',
};

export default function ThemePage() {
  return (
    <HomeLayout {...baseOptions()}>
      <DSProvider locale="en">
        <ThemeBuilder />
      </DSProvider>
    </HomeLayout>
  );
}
