'use client';

import { use, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { composeRenderProps, useLocale } from 'react-aria-components';
import {
  resolveCopyValue,
  useCopyToClipboard,
  type CopyStatus,
  type CopyValue,
} from '@/registry/ds/hooks/use-copy-to-clipboard';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { Button, ButtonGroupContext, type ButtonProps } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const copyButtonStyles = tv({
  slots: {
    base: '',
    glyph:
      'grid shrink-0 place-items-center text-(length:--icon-size) *:col-start-1 *:row-start-1 [&_svg]:size-[1em]',
    icon: '',
    label: 'grid justify-items-center *:col-start-1 *:row-start-1',
    face: 'inline-flex items-center gap-2 group-data-[size=sm]/button:gap-1.5 group-data-[size=xl]/button:gap-2.5 group-data-[size=xs]/button:gap-1',
  },
  variants: {
    iconOnly: {
      true: {
        base: [
          'px-0 data-[size=lg]:w-12 data-[size=md]:w-10 data-[size=sm]:w-8 data-[size=xl]:w-14 data-[size=xs]:w-7',
          'pointer-coarse:after:absolute pointer-coarse:data-[size=md]:after:-inset-1 pointer-coarse:data-[size=sm]:after:-inset-2 pointer-coarse:data-[size=xs]:after:-inset-2.5',
          'data-[size=lg]:[--icon-size:1.5rem] data-[size=md]:[--icon-size:1.5rem] data-[size=sm]:[--icon-size:1.25rem] data-[size=xl]:[--icon-size:1.75rem] data-[size=xs]:[--icon-size:1.125rem]',
          'data-[variant=outlined]:not-data-[disabled]:text-on-surface-variant data-[variant=text]:not-data-[disabled]:text-on-surface-variant',
        ],
      },
    },
    shown: {
      true: { icon: 'opacity-100', face: 'visible opacity-100' },
      false: { icon: 'opacity-0', face: 'invisible opacity-0' },
    },
    motion: {
      spatial: {
        icon: 'transition-[opacity,scale] duration-[150ms,var(--ds-duration-spatial-fast)] ease-[var(--ease-standard),var(--ds-ease-spatial-fast)] motion-reduce:transition-opacity',
        face: 'transition-[opacity,visibility] duration-150 ease-standard',
      },
      fade: {
        icon: 'transition-opacity duration-150 ease-standard',
        face: 'transition-[opacity,visibility] duration-150 ease-standard',
      },
      none: {},
    },
  },
  compoundVariants: [
    {
      shown: false,
      motion: 'spatial',
      class: { icon: 'scale-50 motion-reduce:scale-100' },
    },
  ],
  defaultVariants: {
    iconOnly: true,
    shown: true,
    motion: 'none',
  },
});

export type CopyButtonStyleProps = VariantProps<typeof copyButtonStyles>;

export interface CopyButtonLabels {
  copy: string;
  copied: string;
  copyFailed: string;
}

export const defaultCopyButtonLabels: CopyButtonLabels = {
  copy: 'Copy',
  copied: 'Copied',
  copyFailed: 'Couldn’t copy',
};

type GlyphMotion = 'spatial' | 'fade' | 'none';

function useGlyphMotion(): GlyphMotion {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  return spatialEnabled ? 'spatial' : effectsEnabled ? 'fade' : 'none';
}

function CopyGlyph({ status }: { status: CopyStatus }) {
  const icons = useIcons();
  const styles = copyButtonStyles({ motion: useGlyphMotion() });
  const glyphs = [
    { state: 'idle', Icon: icons.copy },
    { state: 'copied', Icon: icons.check },
    { state: 'failed', Icon: icons.error },
  ] as const;

  return (
    <span data-slot="glyph" data-status={status} className={styles.glyph()}>
      {glyphs.map(({ state, Icon }) => (
        <Icon key={state} className={styles.icon({ shown: status === state })} />
      ))}
    </span>
  );
}

interface CopyLabelProps {
  status: CopyStatus;
  labels?: Partial<CopyButtonLabels>;
  children: ReactNode;
}

function CopyLabel({ status, labels, children }: CopyLabelProps) {
  const t = useLabels('copyButton', defaultCopyButtonLabels, labels);
  const icons = useIcons();
  const styles = copyButtonStyles({ motion: useGlyphMotion() });
  const copied = status === 'copied';

  return (
    <span data-slot="copy-label" className={styles.label()}>
      <span data-slot="face" className={styles.face({ shown: !copied })}>
        <CopyGlyph status={copied ? 'idle' : status} />
        <span>{status === 'failed' ? t.copyFailed : children}</span>
      </span>
      <span data-slot="face" className={styles.face({ shown: copied })}>
        <span data-slot="glyph" className={styles.glyph()}>
          <icons.check />
        </span>
        <span>{t.copied}</span>
      </span>
    </span>
  );
}

function subscribeToNothing() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

function CopyAnnouncer({ message, attempt }: { message: string | null; attempt: number }) {
  const { locale, direction } = useLocale();
  const isClient = useIsClient();
  if (!isClient) return null;

  return createPortal(
    <span
      role="status"
      aria-live="polite"
      lang={locale}
      dir={direction}
      data-slot="announcer"
      data-live-announcer="true"
      className="sr-only"
    >
      {message ? <span key={attempt}>{message}</span> : null}
    </span>,
    document.body,
  );
}

export interface CopyButtonProps extends Omit<
  ButtonProps,
  'onPress' | 'children' | 'startIcon' | 'endIcon' | 'tone' | 'isPending' | 'value' | 'labels'
> {
  value: CopyValue;
  onCopy?: (text: string) => void;
  onCopyError?: (error: unknown) => void;
  timeout?: number;
  labels?: Partial<CopyButtonLabels>;
  children?: ReactNode;
}

export function CopyButton({
  value,
  onCopy,
  onCopyError,
  timeout,
  labels,
  children,
  variant,
  className,
  'aria-label': ariaLabel,
  ...props
}: CopyButtonProps) {
  const t = useLabels('copyButton', defaultCopyButtonLabels, labels);
  const group = use(ButtonGroupContext);
  const { status, attempt, copy } = useCopyToClipboard({ timeout, onCopy, onCopyError });
  const iconOnly = children == null;
  const styles = copyButtonStyles({ iconOnly });
  const announcement = status === 'copied' ? t.copied : status === 'failed' ? t.copyFailed : null;

  function handlePress() {
    const source = resolveCopyValue(value);
    const task = copy(source);
    return typeof source === 'string' ? undefined : task;
  }

  return (
    <>
      <Button
        {...props}
        variant={variant ?? group?.variant ?? (iconOnly ? 'text' : 'outlined')}
        aria-label={iconOnly ? (ariaLabel ?? t.copy) : ariaLabel}
        data-status={status}
        onPress={handlePress}
        startIcon={iconOnly ? <CopyGlyph status={status} /> : undefined}
        className={composeRenderProps(className, (className) => styles.base({ className }))}
      >
        {iconOnly ? undefined : (
          <CopyLabel status={status} labels={labels}>
            {children}
          </CopyLabel>
        )}
      </Button>
      <CopyAnnouncer message={announcement} attempt={attempt} />
    </>
  );
}
