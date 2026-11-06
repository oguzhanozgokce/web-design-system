'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import {
  dynamicSchemeCss,
  parseSeed,
  removeBootStyles,
  schemeKey,
  type DynamicContrast,
} from '@/registry/ds/lib/dynamic-color';
import type { ColorMode, PaletteStyle } from '@/registry/ds/lib/color-scheme';
import { ThemeScopeContext } from '@/registry/ds/lib/theme-scope';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export interface DynamicThemeValue {
  seed: string;
  paletteStyle: PaletteStyle;
  contrast: DynamicContrast;
  mode?: ColorMode;
}

const DynamicThemeContext = createContext<DynamicThemeValue | null>(null);

export function useDynamicTheme() {
  return use(DynamicThemeContext);
}

interface DynamicThemeBaseProps {
  seed?: string | null;
  paletteStyle?: PaletteStyle;
  contrast?: DynamicContrast;
  nonce?: string;
  children?: ReactNode;
}

export interface DynamicThemeElementProps
  extends DynamicThemeBaseProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'nonce'> {
  scope?: 'element';
  mode?: ColorMode;
  storageKey?: never;
}

export interface DynamicThemeRootProps extends DynamicThemeBaseProps {
  scope: 'root';
  storageKey?: string;
  mode?: never;
  className?: never;
}

export type DynamicThemeProps = DynamicThemeElementProps | DynamicThemeRootProps;

const subscribeNothing = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

interface StyleEntry {
  element: HTMLStyleElement;
  count: number;
}

const mountedStyles = new Map<string, StyleEntry>();

function acquireStyle(id: string, css: string, nonce?: string) {
  let entry = mountedStyles.get(id);
  if (!entry) {
    const element = document.createElement('style');
    element.setAttribute('data-ds-scheme-style', id);
    if (nonce) element.nonce = nonce;
    element.textContent = css;
    document.head.append(element);
    entry = { element, count: 0 };
    mountedStyles.set(id, entry);
  }
  const current = entry;
  current.count += 1;
  return () => {
    current.count -= 1;
    if (current.count > 0) return;
    current.element.remove();
    mountedStyles.delete(id);
  };
}

function useScheme(
  seed: string | null | undefined,
  paletteStyle: PaletteStyle,
  contrast: DynamicContrast,
  mode: ColorMode | undefined,
  scope: 'root' | 'element',
) {
  const parsed = parseSeed(seed);
  const key = parsed ? schemeKey({ seed: parsed, paletteStyle, contrast, mode }) : null;
  return useMemo(() => {
    if (!parsed || !key) return { key: null, value: null, css: null };
    const value: DynamicThemeValue = { seed: parsed, paletteStyle, contrast, mode };
    const target = scope === 'root' ? ({ scope: 'root' } as const) : { scope, key };
    return { key, value, css: dynamicSchemeCss(value, target) };
  }, [key, parsed, paletteStyle, contrast, mode, scope]);
}

function RootTheme({
  seed,
  paletteStyle = 'tonal-spot',
  contrast = 'auto',
  storageKey,
  nonce,
  children,
}: DynamicThemeRootProps) {
  const { key, value, css } = useScheme(seed, paletteStyle, contrast, undefined, 'root');
  const hydrated = useHydrated();

  useLayoutEffect(() => {
    if (!hydrated || !css || !key) return;
    const release = acquireStyle(`root:${key}`, css, nonce);
    if (storageKey) removeBootStyles(storageKey);
    return release;
  }, [hydrated, css, key, nonce, storageKey]);

  useEffect(() => {
    if (!storageKey || !hydrated) return;
    try {
      if (css) localStorage.setItem(storageKey, css);
      else localStorage.removeItem(storageKey);
    } catch {}
    if (!css) removeBootStyles(storageKey);
  }, [storageKey, hydrated, css]);

  return (
    <DynamicThemeContext value={value}>
      {!hydrated && !storageKey && css ? (
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} />
      ) : null}
      {children}
    </DynamicThemeContext>
  );
}

function ElementTheme({
  seed,
  paletteStyle = 'tonal-spot',
  contrast = 'auto',
  mode,
  nonce,
  children,
  ...props
}: Omit<DynamicThemeElementProps, 'scope'>) {
  const { key, value, css } = useScheme(seed, paletteStyle, contrast, mode, 'element');
  const hydrated = useHydrated();
  const scope = useMemo(() => (key ? { key, mode } : null), [key, mode]);

  useInsertionEffect(() => {
    if (!hydrated || !css || !key) return;
    return acquireStyle(key, css, nonce);
  }, [hydrated, css, key, nonce]);

  return (
    <DynamicThemeContext value={value}>
      <ThemeScopeContext value={scope}>
        {!hydrated && css ? (
          <style nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} />
        ) : null}
        <div
          data-slot="dynamic-theme"
          data-ds-scheme={key ?? undefined}
          data-theme={mode}
          {...props}
        >
          {children}
        </div>
      </ThemeScopeContext>
    </DynamicThemeContext>
  );
}

export function DynamicTheme(props: DynamicThemeProps) {
  if (props.scope === 'root') return <RootTheme {...props} />;
  const { scope, ...rest } = props;
  return <ElementTheme {...rest} />;
}

const ignore = () => {};

export function useThemeTransition() {
  const { effectsEnabled } = useMotionPreference();
  return useCallback(
    (update: () => void) => {
      if (
        !effectsEnabled ||
        typeof document === 'undefined' ||
        typeof document.startViewTransition !== 'function'
      ) {
        update();
        return;
      }
      const transition = document.startViewTransition(() => {
        try {
          flushSync(update);
        } catch (error) {
          reportError(error);
        }
      });
      transition.ready.catch(ignore);
      transition.updateCallbackDone.catch(ignore);
      transition.finished.catch(ignore);
    },
    [effectsEnabled],
  );
}
