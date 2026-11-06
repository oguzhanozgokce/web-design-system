import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import {
  ComponentPreview,
  ComponentSource,
  InstallCommand,
} from '@/components/docs/component-preview';
import { PaletteSwatches } from '@/components/docs/palette-swatches';
import { ComponentGrid } from '@/components/showcase/component-grid';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentGrid,
    ComponentPreview,
    ComponentSource,
    InstallCommand,
    PaletteSwatches,
    Step,
    Steps,
    Tab,
    Tabs,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
