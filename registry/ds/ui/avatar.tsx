'use client';

import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useMemo,
  useState,
  type ComponentProps,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Button as AriaButton,
  composeRenderProps,
  useLocale,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type AvatarShape = 'circle' | 'rounded';

export type AvatarTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

export type AvatarImageState = 'loading' | 'loaded' | 'error';

export type AvatarGroupSeam = 'ring' | 'clip';

export const avatarStyles = tv({
  slots: {
    root: 'relative inline-flex shrink-0 align-middle select-none',
    visual:
      'relative flex size-full items-center justify-center overflow-hidden font-medium tabular-digits',
    image: 'absolute inset-0 size-full object-cover opacity-0 data-[loaded]:opacity-100',
    initials: 'leading-none whitespace-nowrap',
    icon: 'inline-flex shrink-0 text-(length:--icon-size) [&_svg]:size-[1em]',
    status: [
      'absolute overflow-hidden rounded-full ring-[color:var(--ds-avatar-ring,var(--canvas))]',
      'after:absolute after:rounded-full',
    ],
  },
  variants: {
    size: {
      xs: {
        root: 'size-6',
        visual: 'text-xs',
        icon: '[--icon-size:0.875rem]',
        status: 'size-2 ring-[1.5px]',
      },
      sm: {
        root: 'size-8',
        visual: 'text-xs',
        icon: '[--icon-size:1.125rem]',
        status: 'size-2.5 ring-2',
      },
      md: {
        root: 'size-10',
        visual: 'text-sm',
        icon: '[--icon-size:1.25rem]',
        status: 'size-3 ring-2',
      },
      lg: {
        root: 'size-12',
        visual: 'text-base',
        icon: '[--icon-size:1.5rem]',
        status: 'size-3.5 ring-2',
      },
      xl: {
        root: 'size-16',
        visual: 'text-xl',
        icon: '[--icon-size:2rem]',
        status: 'size-4 ring-[3px]',
      },
    },
    shape: {
      circle: {
        visual: 'rounded-full',
        status: 'inset-s-[85.4%] top-[85.4%] -translate-1/2 rtl:translate-x-1/2',
      },
      rounded: {
        visual: 'rounded-xl',
        status: '-inset-e-0.5 -bottom-0.5',
      },
    },
    tone: {
      neutral: { visual: 'bg-neutral-soft text-on-surface' },
      primary: { visual: 'bg-primary-soft text-on-primary-soft' },
      success: { visual: 'bg-success-soft text-on-success-soft' },
      warning: { visual: 'bg-warning-soft text-on-warning-soft' },
      error: { visual: 'bg-error-soft text-on-error-soft' },
      info: { visual: 'bg-info-soft text-on-info-soft' },
    },
    status: {
      online: { status: 'bg-success-solid' },
      away: {
        status:
          'bg-warning-solid after:-inset-s-[12%] after:-top-[12%] after:size-[66%] after:bg-[color:var(--ds-avatar-ring,var(--canvas))]',
      },
      busy: {
        status:
          'bg-error-solid after:inset-x-[22%] after:top-1/2 after:h-[24%] after:-translate-y-1/2 after:bg-on-error-solid',
      },
      offline: {
        status: 'border-2 border-outline bg-[color:var(--ds-avatar-ring,var(--canvas))]',
      },
    },
    animated: {
      true: {
        image: 'transition-opacity duration-250 ease-out motion-reduce:transition-none',
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      shape: 'rounded',
      size: ['xs', 'sm'],
      class: { visual: 'rounded-lg' },
    },
  ],
  defaultVariants: {
    size: 'md',
    shape: 'circle',
    tone: 'neutral',
    animated: false,
  },
});

export const avatarGroupStyles = tv({
  slots: {
    root: 'isolate inline-flex items-center',
    item: 'relative inline-flex shrink-0 not-first:-ms-(--avatar-overlap) focus-within:z-10',
    overflow: '',
  },
  variants: {
    size: {
      xs: {
        root: '[--avatar-overlap:0.375rem] [--avatar-size:1.5rem]',
        overflow: 'text-[0.625rem]',
      },
      sm: { root: '[--avatar-overlap:0.5rem] [--avatar-size:2rem]', overflow: 'text-xs' },
      md: { root: '[--avatar-overlap:0.625rem] [--avatar-size:2.5rem]', overflow: 'text-xs' },
      lg: { root: '[--avatar-overlap:0.75rem] [--avatar-size:3rem]', overflow: 'text-sm' },
      xl: { root: '[--avatar-overlap:1rem] [--avatar-size:4rem]', overflow: 'text-base' },
    },
    shape: {
      circle: {
        item: [
          '[--avatar-cut-x:calc(var(--avatar-size)*1.5_-_var(--avatar-overlap))]',
          'rtl:[--avatar-cut-x:calc(var(--avatar-overlap)_-_var(--avatar-size)/2)]',
          '[--avatar-cut:radial-gradient(circle_at_var(--avatar-cut-x)_50%,transparent_calc(var(--avatar-size)/2_+_var(--avatar-seam)),var(--color-on-surface)_calc(var(--avatar-size)/2_+_var(--avatar-seam)_+_0.5px))]',
          'rounded-full',
        ],
      },
      rounded: {
        item: [
          '[--avatar-cut-to:left] rtl:[--avatar-cut-to:right]',
          '[--avatar-cut:linear-gradient(to_var(--avatar-cut-to),transparent_calc(var(--avatar-overlap)_+_var(--avatar-seam)),var(--color-on-surface)_calc(var(--avatar-overlap)_+_var(--avatar-seam)))]',
          'rounded-xl',
        ],
      },
    },
    seam: {
      ring: {
        item: 'bg-[color:var(--ds-avatar-ring,var(--canvas))] ring-2 ring-[color:var(--ds-avatar-ring,var(--canvas))]',
      },
      clip: {
        root: '[--avatar-seam:2px]',
        item: 'not-last:not-focus-within:[mask-image:var(--avatar-cut)]',
      },
    },
    animated: {
      true: {
        item: 'transition-[scale,opacity] duration-300 ease-fluid starting:scale-75 starting:opacity-0 motion-reduce:transition-none',
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      shape: 'rounded',
      size: ['xs', 'sm'],
      class: { item: 'rounded-lg' },
    },
  ],
  defaultVariants: {
    size: 'sm',
    shape: 'circle',
    seam: 'ring',
    animated: false,
  },
});

export const avatarButtonStyles = tv({
  base: [
    'focus-ring no-tap-highlight relative inline-flex shrink-0 cursor-pointer no-underline select-none',
    'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-transparent after:transition-[background-color] after:duration-100 after:ease-out',
    'data-[hovered]:after:bg-neutral-soft data-[pressed]:after:bg-neutral-soft-hover',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    'pointer-coarse:before:absolute',
  ],
  variants: {
    shape: {
      circle: 'rounded-full',
      rounded: 'rounded-xl',
    },
    size: {
      xs: 'pointer-coarse:before:-inset-3',
      sm: 'pointer-coarse:before:-inset-2',
      md: 'pointer-coarse:before:-inset-1',
      lg: '',
      xl: '',
    },
    animated: {
      true: 'transition-[scale] duration-250 ease-out data-[pressed]:scale-[0.96] motion-reduce:transition-none motion-reduce:data-[pressed]:scale-100',
      false: '',
    },
  },
  compoundVariants: [
    {
      shape: 'rounded',
      size: ['xs', 'sm'],
      class: 'rounded-lg',
    },
  ],
  defaultVariants: {
    shape: 'circle',
    size: 'md',
    animated: true,
  },
});

let graphemes: Intl.Segmenter | null | undefined;

function firstGrapheme(text: string) {
  if (graphemes === undefined) {
    graphemes =
      typeof Intl !== 'undefined' && 'Segmenter' in Intl
        ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        : null;
  }
  if (graphemes) {
    for (const { segment } of graphemes.segment(text)) return segment;
    return '';
  }
  return Array.from(text)[0] ?? '';
}

const startsWithLetterOrDigit = /^[\p{L}\p{N}]/u;
const firstLetterOrDigit = /[\p{L}\p{N}]/u;
const startsCased = /^\p{Cased}/u;

export function getAvatarInitials(name: string, locale?: string) {
  const words = name
    .trim()
    .split(/\s+/u)
    .filter((word) => startsWithLetterOrDigit.test(word));
  if (!words.length) {
    const match = firstLetterOrDigit.exec(name);
    return match ? firstGrapheme(name.slice(match.index)).toLocaleUpperCase(locale) : '';
  }
  const first = firstGrapheme(words[0]);
  const last = words.length > 1 ? firstGrapheme(words[words.length - 1]) : '';
  const initials =
    last && startsCased.test(first) && startsCased.test(last) ? `${first}${last}` : first;
  return initials.toLocaleUpperCase(locale);
}

interface AvatarGroupContextValue {
  size: AvatarSize;
  shape: AvatarShape;
}

const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

function useImageState(src: string | undefined) {
  const [state, setState] = useState<{ src?: string; value: AvatarImageState }>({
    value: 'loading',
  });
  const current: AvatarImageState | undefined = !src
    ? undefined
    : state.src === src
      ? state.value
      : 'loading';
  const settle = useCallback(
    (value: AvatarImageState) =>
      setState((previous) =>
        previous.src === src && previous.value === value ? previous : { src, value },
      ),
    [src],
  );
  return [current, settle] as const;
}

export interface AvatarLabels {
  online: string;
  away: string;
  busy: string;
  offline: string;
  more: LabelTemplate<{ count: string }>;
  overflowCap: LabelTemplate<{ max: string }>;
}

export const defaultAvatarLabels: AvatarLabels = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
  more: '{count} more',
  overflowCap: '{max}+',
};

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
  name?: string;
  alt?: string;
  src?: string;
  imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
  fallbackIcon?: ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  tone?: AvatarTone;
  status?: AvatarStatus;
  labels?: Partial<AvatarLabels>;
}

export function Avatar({
  name,
  alt,
  src,
  imageProps,
  fallbackIcon,
  size: sizeProp,
  shape: shapeProp,
  tone = 'neutral',
  status,
  labels,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: AvatarProps) {
  const group = use(AvatarGroupContext);
  const icons = useIcons();
  const t = useLabels('avatar', defaultAvatarLabels, labels);
  const { locale } = useLocale();
  const { effectsEnabled } = useMotionPreference();
  const [imageState, settleImage] = useImageState(src || undefined);

  const size = sizeProp ?? group?.size ?? 'md';
  const shape = shapeProp ?? group?.shape ?? 'circle';
  const trimmedName = name?.trim() ?? '';
  const initials = useMemo(
    () => (trimmedName ? getAvatarInitials(trimmedName, locale) : ''),
    [trimmedName, locale],
  );
  const label = (alt ?? ariaLabel ?? trimmedName).trim();
  const isDecorative = !label && !ariaLabelledBy;
  const styles = avatarStyles({ size, shape, tone, status, animated: effectsEnabled });

  const imageRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (!node?.complete) return;
      if (node.naturalWidth > 0) {
        settleImage('loaded');
        return;
      }
      node.decode().then(
        () => node.isConnected && settleImage('loaded'),
        () => node.isConnected && settleImage('error'),
      );
    },
    [settleImage],
  );

  const FallbackIcon = icons.person;

  return (
    <span
      {...props}
      aria-hidden={isDecorative && !status ? true : props['aria-hidden']}
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      data-tone={tone}
      data-status={status}
      data-image-state={imageState}
      className={styles.root({ className })}
    >
      <span
        role={isDecorative ? undefined : 'img'}
        aria-label={isDecorative ? undefined : label || undefined}
        aria-labelledby={isDecorative ? undefined : ariaLabelledBy}
        aria-hidden={isDecorative || undefined}
        translate="no"
        data-slot="avatar-visual"
        className={styles.visual()}
      >
        {imageState === 'loaded' ? null : initials ? (
          <span data-slot="avatar-initials" className={styles.initials()}>
            {initials}
          </span>
        ) : (
          <span data-slot="avatar-icon" className={styles.icon()}>
            {fallbackIcon ?? <FallbackIcon />}
          </span>
        )}
        {src && imageState !== 'error' ? (
          <img
            key={src}
            {...imageProps}
            ref={imageRef}
            src={src}
            alt=""
            data-slot="avatar-image"
            data-loaded={imageState === 'loaded' || undefined}
            onLoad={(event) => {
              if (event.currentTarget.isConnected) settleImage('loaded');
              imageProps?.onLoad?.(event);
            }}
            onError={(event) => {
              if (event.currentTarget.isConnected) settleImage('error');
              imageProps?.onError?.(event);
            }}
            className={styles.image({ className: imageProps?.className })}
          />
        ) : null}
      </span>
      {status ? (
        <span data-slot="avatar-status" data-status={status} className={styles.status()}>
          <span className="sr-only">{t[status]}</span>
        </span>
      ) : null}
    </span>
  );
}

export interface AvatarButtonProps
  extends
    Omit<AriaButtonProps, 'children' | 'className' | 'name' | 'value' | 'isPending'>,
    Pick<
      AvatarProps,
      | 'name'
      | 'alt'
      | 'src'
      | 'imageProps'
      | 'fallbackIcon'
      | 'size'
      | 'shape'
      | 'tone'
      | 'status'
      | 'labels'
    > {
  className?: AriaButtonProps['className'];
}

export function AvatarButton({
  name,
  alt,
  src,
  imageProps,
  fallbackIcon,
  size: sizeProp,
  shape: shapeProp,
  tone,
  status,
  labels,
  className,
  ...props
}: AvatarButtonProps) {
  const group = use(AvatarGroupContext);
  const { spatialEnabled } = useMotionPreference();
  const size = sizeProp ?? group?.size ?? 'md';
  const shape = shapeProp ?? group?.shape ?? 'circle';

  return (
    <AriaButton
      {...props}
      data-slot="avatar-button"
      data-size={size}
      data-shape={shape}
      className={composeRenderProps(className, (className) =>
        avatarButtonStyles({ size, shape, animated: spatialEnabled, className }),
      )}
    >
      <Avatar
        name={name}
        alt={alt}
        src={src}
        imageProps={imageProps}
        fallbackIcon={fallbackIcon}
        size={size}
        shape={shape}
        tone={tone}
        status={status}
        labels={labels}
      />
    </AriaButton>
  );
}

export interface AvatarGroupProps extends Omit<ComponentProps<'span'>, 'children'> {
  children?: ReactNode;
  max?: number;
  total?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  seam?: AvatarGroupSeam;
  labels?: Partial<AvatarLabels>;
}

const entryStaggerMs = 45;

const overflowCap = 99;

export function AvatarGroup({
  children,
  max = 4,
  total,
  size = 'sm',
  shape = 'circle',
  seam = 'ring',
  labels,
  className,
  ...props
}: AvatarGroupProps) {
  const t = useLabels('avatar', defaultAvatarLabels, labels);
  const { locale } = useLocale();
  const { spatialEnabled } = useMotionPreference();
  const context = useMemo(() => ({ size, shape }), [size, shape]);
  const items = Children.toArray(children).filter(isValidElement);
  const visible = items.slice(0, Math.max(1, Math.floor(max)));
  const hidden = Math.max(0, (total ?? items.length) - visible.length);
  const styles = avatarGroupStyles({ size, shape, seam, animated: spatialEnabled });
  const overflowStyles = avatarStyles({ size, shape, tone: 'neutral' });

  const stagger = (index: number) =>
    spatialEnabled ? { transitionDelay: `${index * entryStaggerMs}ms` } : undefined;

  return (
    <span
      role="group"
      {...props}
      data-slot="avatar-group"
      data-size={size}
      data-shape={shape}
      data-seam={seam}
      className={styles.root({ className })}
    >
      <AvatarGroupContext value={context}>
        {visible.map((child, index) => (
          <span
            key={child.key ?? index}
            data-slot="avatar-group-item"
            className={styles.item()}
            style={stagger(index)}
          >
            {child}
          </span>
        ))}
        {hidden > 0 ? (
          <span
            data-slot="avatar-group-item"
            className={styles.item()}
            style={stagger(visible.length)}
          >
            <span
              data-slot="avatar"
              data-size={size}
              data-shape={shape}
              data-tone="neutral"
              className={overflowStyles.root()}
            >
              <span
                role="img"
                aria-label={t.format('more', {
                  count: new Intl.NumberFormat(locale).format(hidden),
                })}
                dir="auto"
                data-slot="avatar-overflow"
                className={overflowStyles.visual({ className: styles.overflow() })}
              >
                {hidden > overflowCap
                  ? t.format('overflowCap', {
                      max: new Intl.NumberFormat(locale).format(overflowCap),
                    })
                  : new Intl.NumberFormat(locale, { signDisplay: 'always' }).format(hidden)}
              </span>
            </span>
          </span>
        ) : null}
      </AvatarGroupContext>
    </span>
  );
}
