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
    'focus-ring group/link cursor-pointer rounded-xs text-primary',
    'transition-[color,text-decoration-color,text-decoration-thickness] duration-150 ease-standard motion-reduce:transition-none',
    'data-[disabled]:cursor-default data-[disabled]:text-on-surface/38',
  ],
  variants: {
    variant: {
      inline: 'underline decoration-1 underline-offset-[0.2em] data-[hovered]:decoration-2',
      standalone:
        'inline-flex items-center gap-1 text-label-lg underline decoration-transparent decoration-1 underline-offset-[0.25em] data-[hovered]:decoration-current',
    },
  },
  defaultVariants: {
    variant: 'inline',
  },
});

export type LinkStyleProps = VariantProps<typeof linkStyles>;

export interface LinkLabels {
  opensInNewTab: string;
}

export const defaultLinkLabels: LinkLabels = {
  opensInNewTab: '(opens in a new tab)',
};

const glyphStyles = tv({
  slots: {
    wrapper: '',
    icon: 'shrink-0 transition-[translate] duration-(--ds-duration-spatial-fast) ease-spatial-fast rtl:-scale-x-100 motion-reduce:transition-none',
  },
  variants: {
    variant: {
      inline: {
        wrapper: 'whitespace-nowrap',
        icon: 'ms-[0.1875em] inline-block size-[1em] align-[-0.125em]',
      },
      standalone: {
        wrapper: 'inline-flex items-center',
        icon: 'size-[1.25em]',
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

const wordJoiner = '\u2060';

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
      data-external={isExternal || undefined}
      className={composeRenderProps(className, (className) =>
        linkStyles({ variant: resolvedVariant, className }),
      )}
    >
      <span data-slot="label">{children}</span>
      {glyph ? (
        <span
          aria-hidden="true"
          data-slot={glyph === 'external' ? 'external-icon' : 'arrow'}
          className={glyphClasses.wrapper()}
        >
          {resolvedVariant === 'inline' ? wordJoiner : null}
          <Glyph className={glyphClasses.icon()} />
        </span>
      ) : null}
      {isExternal ? (
        <VisuallyHidden elementType="span">{` ${t.opensInNewTab}`}</VisuallyHidden>
      ) : null}
    </AriaLink>
  );
}
