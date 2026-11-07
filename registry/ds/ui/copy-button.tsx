'use client';

import { use, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'react-aria-components';
import {
  resolveCopyValue,
  useCopyToClipboard,
  type CopyStatus,
  type CopyValue,
} from '@/registry/ds/hooks/use-copy-to-clipboard';
import { tv } from '@/registry/ds/lib/utils';
import { Button, ButtonGroupContext, type ButtonProps } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { IconButton, type IconButtonSize } from '@/registry/ds/ui/icon-button';

export const copyButtonStyles = tv({
  slots: {
    glyph:
      'grid shrink-0 place-items-center text-(length:--icon-size) *:col-start-1 *:row-start-1 [&_svg]:size-[1em]',
    icon: '',
    label: 'grid justify-items-center *:col-start-1 *:row-start-1',
    face: 'inline-flex items-center gap-1.5 group-data-[size=lg]/button:gap-2 group-data-[size=md]/button:gap-2',
  },
  variants: {
    state: {
      idle: {},
      copied: { icon: 'text-success group-data-[variant=solid]/button:text-current' },
      failed: {},
    },
    shown: {
      true: { icon: 'scale-100 opacity-100', face: 'visible opacity-100' },
      false: { icon: 'opacity-0', face: 'invisible opacity-0' },
    },
    motion: {
      spatial: {
        icon: 'transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-opacity',
        face: 'transition-[opacity,visibility] duration-150 ease-out',
      },
      fade: {
        icon: 'transition-opacity duration-150 ease-out',
        face: 'transition-[opacity,visibility] duration-150 ease-out',
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
    shown: true,
    motion: 'none',
  },
});

export type CopyButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';

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
  const motion = useGlyphMotion();
  const styles = copyButtonStyles({ motion });
  const glyphs = [
    { state: 'idle', Icon: icons.copy },
    { state: 'copied', Icon: icons.check },
    { state: 'failed', Icon: icons.error },
  ] as const;

  return (
    <span data-slot="glyph" data-status={status} className={styles.glyph()}>
      {glyphs.map(({ state, Icon }) => (
        <Icon
          key={state}
          data-glyph={state}
          className={copyButtonStyles({ motion, state, shown: status === state }).icon()}
        />
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
  const motion = useGlyphMotion();
  const styles = copyButtonStyles({ motion });
  const copied = status === 'copied';

  return (
    <span data-slot="copy-label" className={styles.label()}>
      <span data-slot="face" className={styles.face({ shown: !copied })}>
        <CopyGlyph status={copied ? 'idle' : status} />
        <span>{status === 'failed' ? t.copyFailed : children}</span>
      </span>
      <span data-slot="face" className={styles.face({ shown: copied })}>
        <CopyGlyph status={copied ? 'copied' : 'idle'} />
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
  | 'onPress'
  | 'children'
  | 'startIcon'
  | 'endIcon'
  | 'tone'
  | 'isPending'
  | 'value'
  | 'labels'
  | 'size'
> {
  value: CopyValue;
  size?: IconButtonSize;
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
  size,
  fullWidth,
  'aria-label': ariaLabel,
  ...props
}: CopyButtonProps) {
  const t = useLabels('copyButton', defaultCopyButtonLabels, labels);
  const group = use(ButtonGroupContext);
  const { status, attempt, copy } = useCopyToClipboard({ timeout, onCopy, onCopyError });
  const iconOnly = children == null;
  const tone = status === 'failed' ? 'error' : undefined;
  const announcement = status === 'copied' ? t.copied : status === 'failed' ? t.copyFailed : null;

  function handlePress() {
    const source = resolveCopyValue(value);
    const task = copy(source);
    return typeof source === 'string' ? undefined : task;
  }

  return (
    <>
      {iconOnly ? (
        <IconButton
          {...props}
          variant={variant ?? group?.variant ?? 'ghost'}
          tone={tone}
          size={size ?? group?.size ?? 'sm'}
          aria-label={ariaLabel ?? t.copy}
          data-status={status}
          onPress={handlePress}
          icon={<CopyGlyph status={status} />}
        />
      ) : (
        <Button
          {...props}
          variant={variant ?? group?.variant ?? 'soft'}
          tone={tone}
          size={size === 'xs' ? 'sm' : (size ?? group?.size ?? 'sm')}
          fullWidth={fullWidth}
          aria-label={ariaLabel}
          data-status={status}
          onPress={handlePress}
        >
          <CopyLabel status={status} labels={labels}>
            {children}
          </CopyLabel>
        </Button>
      )}
      <CopyAnnouncer message={announcement} attempt={attempt} />
    </>
  );
}
