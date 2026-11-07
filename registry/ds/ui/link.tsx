'use client';

import type { ReactNode, Ref } from 'react';
import {
  Link as AriaLink,
  VisuallyHidden,
  composeRenderProps,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const linkStyles = tv({
  base: [
    'focus-ring group/link no-tap-highlight cursor-pointer rounded-sm decoration-[1.5px] underline-offset-4',
    'transition-[color,text-decoration-color] duration-100 ease-out motion-reduce:transition-none',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  ],
  variants: {
    variant: {
      inline: 'underline decoration-outline-variant data-[hovered]:decoration-current',
      standalone:
        'inline-flex items-center gap-1 text-sm font-medium underline decoration-transparent data-[hovered]:decoration-current',
    },
    tone: {
      neutral: 'text-on-surface',
      primary: 'text-primary',
      inherit: '',
    },
  },
  defaultVariants: {
    variant: 'inline',
    tone: 'neutral',
  },
});

export type LinkStyleProps = VariantProps<typeof linkStyles>;
export type LinkVariant = 'inline' | 'standalone';
export type LinkTone = 'neutral' | 'primary' | 'inherit';

export interface LinkLabels {
  opensInNewTab: string;
}

export const defaultLinkLabels: LinkLabels = {
  opensInNewTab: '(opens in a new tab)',
};

const glyphStyles = tv({
  slots: {
    wrapper: '',
    spacer: 'inline-block w-[0.1875em]',
    icon: [
      'shrink-0 opacity-60 transition-[translate,opacity] duration-200 ease-fluid rtl:-scale-x-100 motion-reduce:transition-none',
      'group-data-[focus-visible]/link:opacity-100 group-data-[hovered]/link:opacity-100',
    ],
  },
  variants: {
    variant: {
      inline: {
        wrapper: 'whitespace-nowrap',
        icon: 'inline-block size-[0.875em] align-[-0.0625em]',
      },
      standalone: {
        wrapper: 'inline-flex items-center',
        icon: 'size-[1.125em]',
      },
    },
    nudge: {
      forward: {
        icon: 'group-data-[focus-visible]/link:translate-x-[calc(var(--ds-direction,1)*0.1875em)] group-data-[hovered]/link:translate-x-[calc(var(--ds-direction,1)*0.1875em)]',
      },
      diagonal: {
        icon: 'group-data-[focus-visible]/link:translate-x-[calc(var(--ds-direction,1)*0.125em)] group-data-[focus-visible]/link:-translate-y-[0.125em] group-data-[hovered]/link:translate-x-[calc(var(--ds-direction,1)*0.125em)] group-data-[hovered]/link:-translate-y-[0.125em]',
      },
      none: {},
    },
  },
  defaultVariants: {
    variant: 'inline',
    nudge: 'none',
  },
});

const wordJoiner = '⁠';

function externalRel(rel: string | undefined) {
  const tokens = new Set(rel?.split(/\s+/).filter(Boolean));
  tokens.add('noreferrer');
  tokens.add('noopener');
  return [...tokens].join(' ');
}

export interface LinkProps extends Omit<AriaLinkProps, 'children' | 'className'>, LinkStyleProps {
  isExternal?: boolean;
  showArrow?: boolean;
  labels?: Partial<LinkLabels>;
  children?: ReactNode;
  className?: AriaLinkProps['className'];
  ref?: Ref<HTMLAnchorElement>;
}

export function Link({
  variant,
  tone,
  isExternal = false,
  showArrow = false,
  labels,
  children,
  className,
  href,
  target,
  rel,
  download,
  ping,
  referrerPolicy,
  ...props
}: LinkProps) {
  const icons = useIcons();
  const t = useLabels('link', defaultLinkLabels, labels);
  const { decorativeEnabled } = useMotionPreference();
  const resolvedVariant = variant ?? 'inline';
  const resolvedTone = tone ?? 'neutral';
  const anchorProps = props.isDisabled
    ? {}
    : {
        href,
        target: isExternal ? '_blank' : target,
        rel: isExternal ? externalRel(rel) : rel,
        download,
        ping,
        referrerPolicy,
      };
  const glyph = isExternal ? 'external' : showArrow ? 'arrow' : null;
  const Glyph = isExternal ? icons.northEast : icons.arrowForward;
  const glyphClasses = glyphStyles({
    variant: resolvedVariant,
    nudge: decorativeEnabled && glyph ? (isExternal ? 'diagonal' : 'forward') : 'none',
  });

  return (
    <AriaLink
      {...props}
      {...anchorProps}
      data-slot="link"
      data-variant={resolvedVariant}
      data-tone={resolvedTone}
      data-external={isExternal || undefined}
      className={composeRenderProps(className, (className) =>
        linkStyles({ variant: resolvedVariant, tone: resolvedTone, className }),
      )}
    >
      <span data-slot="label">{children}</span>
      {glyph ? (
        <span
          aria-hidden="true"
          data-slot={glyph === 'external' ? 'external-icon' : 'arrow'}
          className={glyphClasses.wrapper()}
        >
          {resolvedVariant === 'inline' ? (
            <>
              {wordJoiner}
              <span className={glyphClasses.spacer()} />
            </>
          ) : null}
          <Glyph className={glyphClasses.icon()} />
        </span>
      ) : null}
      {isExternal ? (
        <VisuallyHidden elementType="span">{` ${t.opensInNewTab}`}</VisuallyHidden>
      ) : null}
    </AriaLink>
  );
}
