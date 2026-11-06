import { dynamicThemeBootScript } from '@/registry/ds/lib/dynamic-color';

export interface DynamicThemeScriptProps {
  storageKey: string;
  nonce?: string;
}

export function DynamicThemeScript({ storageKey, nonce }: DynamicThemeScriptProps) {
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: dynamicThemeBootScript(storageKey) }}
    />
  );
}
