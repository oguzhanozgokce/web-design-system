'use client';

import { createContext, use, useMemo, type ReactNode } from 'react';
import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosureGroup as AriaDisclosureGroup,
  DisclosureGroupStateContext,
  DisclosurePanel as AriaDisclosurePanel,
  Heading,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
  type DisclosureGroupProps as AriaDisclosureGroupProps,
  type DisclosurePanelProps as AriaDisclosurePanelProps,
  type DisclosureProps as AriaDisclosureProps,
} from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { useIcons, useMotionPreference } from '@/registry/ds/ui/ds-provider';

const iconSlot =
  'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]';

export const disclosureStyles = tv({
  slots: {
    root: 'relative min-w-0 text-on-surface [--disclosure-radius:var(--radius-container)]',
    heading: 'flex min-w-0',
    trigger: [
      'focus-ring-inset no-tap-highlight group/trigger flex w-full min-w-0 cursor-pointer items-center px-(--disclosure-px) text-start font-medium select-none',
      'transition-[background-color] duration-150 ease-out motion-reduce:transition-none',
      'data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    startIcon: [iconSlot, 'text-on-surface-variant'],
    text: 'flex min-w-0 flex-1 flex-col gap-0.5',
    title: 'break-words',
    description: 'font-normal text-on-surface-variant',
    indicator: [iconSlot, 'text-on-surface-variant group-aria-expanded/trigger:-rotate-180'],
    panel: 'h-(--disclosure-panel-height) [clip-path:inset(-0.5rem_0_0)] aria-hidden:opacity-0',
    content: 'space-y-3 px-(--disclosure-px) text-on-surface-variant',
  },
  variants: {
    variant: {
      plain: '',
      surface: {
        root: 'overflow-clip rounded-(--disclosure-radius) border border-outline-subtle bg-surface-raised',
      },
    },
    size: {
      sm: {
        root: '[--disclosure-px:0.75rem] [--icon-size:1rem]',
        trigger: 'min-h-10 gap-2.5 py-2 text-sm',
        description: 'text-xs',
        content: 'pb-3 text-sm',
      },
      md: {
        root: '[--disclosure-px:1rem] [--icon-size:1rem]',
        trigger: 'min-h-12 gap-3 py-3 text-sm',
        description: 'text-xs',
        content: 'pb-4 text-sm',
      },
      lg: {
        root: '[--disclosure-px:1.25rem] [--icon-size:1.25rem]',
        trigger: 'min-h-14 gap-3 py-4 text-base',
        description: 'text-sm',
        content: 'pb-5 text-base',
      },
    },
    grouping: {
      none: '',
      plain: {
        root: 'border-b border-outline-subtle last:border-b-0',
        trigger: 'rounded-none',
      },
      surface: {
        root: [
          'after:pointer-events-none after:absolute after:inset-x-(--disclosure-px) after:bottom-0 after:h-px after:bg-outline-subtle after:forced-color-adjust-none last:after:hidden forced-colors:after:bg-[CanvasText]',
          '[--disclosure-trigger-radius-top:0px] [--disclosure-trigger-radius-bottom:0px]',
          'first:[--disclosure-trigger-radius-top:calc(var(--accordion-radius)-1px)]',
          'last:[--disclosure-trigger-radius-bottom:calc(var(--accordion-radius)-1px)]',
        ],
        trigger:
          'rounded-t-(--disclosure-trigger-radius-top) rounded-b-(--disclosure-trigger-radius-bottom) aria-expanded:rounded-b-none',
      },
    },
    animated: {
      true: {
        indicator: 'transition-[rotate] duration-250 ease-out-quad motion-reduce:transition-none',
        panel:
          'transition-[height,opacity] duration-200 ease-out-quad motion-reduce:transition-none',
      },
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'plain', grouping: 'none', class: { trigger: 'rounded-item' } },
    {
      variant: 'surface',
      grouping: 'none',
      class: {
        trigger: 'rounded-[calc(var(--disclosure-radius)-1px)] aria-expanded:rounded-b-none',
      },
    },
  ],
  defaultVariants: {
    variant: 'surface',
    size: 'md',
    grouping: 'none',
    animated: true,
  },
});

export const accordionStyles = tv({
  base: 'flex min-w-0 flex-col [--accordion-radius:var(--radius-container)]',
  variants: {
    variant: {
      plain: '',
      surface:
        'overflow-clip rounded-(--accordion-radius) border border-outline-subtle bg-surface-raised',
      separated: 'gap-2',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [{ variant: 'separated', size: 'lg', class: 'gap-3' }],
  defaultVariants: {
    variant: 'surface',
    size: 'md',
  },
});

export type DisclosureVariant = 'plain' | 'surface';

export type DisclosureSize = 'sm' | 'md' | 'lg';

export type AccordionVariant = 'plain' | 'surface' | 'separated';

type DisclosureSlots = ReturnType<typeof disclosureStyles>;

interface AccordionContextValue {
  variant: AccordionVariant;
  size: DisclosureSize;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

const DisclosureSlotsContext = createContext<DisclosureSlots>(disclosureStyles());

export interface AccordionProps extends Omit<AriaDisclosureGroupProps, 'className'> {
  variant?: AccordionVariant;
  size?: DisclosureSize;
  className?: AriaDisclosureGroupProps['className'];
}

export function Accordion({
  variant = 'surface',
  size = 'md',
  className,
  ...props
}: AccordionProps) {
  const context = useMemo<AccordionContextValue>(() => ({ variant, size }), [variant, size]);

  return (
    <AccordionContext value={context}>
      <AriaDisclosureGroup
        {...props}
        data-slot="accordion"
        data-variant={variant}
        data-size={size}
        className={composeRenderProps(className, (className) =>
          accordionStyles({ variant, size, className }),
        )}
      />
    </AccordionContext>
  );
}

export interface DisclosureProps extends Omit<AriaDisclosureProps, 'className'> {
  variant?: DisclosureVariant;
  size?: DisclosureSize;
  className?: AriaDisclosureProps['className'];
}

type DisclosureGrouping = 'none' | 'plain' | 'surface';

function resolveVariant(
  variant: DisclosureVariant | undefined,
  accordion: AccordionContextValue | null,
): { variant: DisclosureVariant; grouping: DisclosureGrouping } {
  if (!accordion || accordion.variant === 'separated') {
    return { variant: variant ?? 'surface', grouping: 'none' };
  }
  return { variant: 'plain', grouping: accordion.variant };
}

export function Disclosure({ variant, size, className, ...props }: DisclosureProps) {
  const accordion = use(AccordionContext);
  const { spatialEnabled } = useMotionPreference();
  const resolved = resolveVariant(variant, accordion);
  const resolvedSize = size ?? accordion?.size ?? 'md';

  const styles = useMemo(
    () =>
      disclosureStyles({
        variant: resolved.variant,
        grouping: resolved.grouping,
        size: resolvedSize,
        animated: spatialEnabled,
      }),
    [resolved.variant, resolved.grouping, resolvedSize, spatialEnabled],
  );

  return (
    <DisclosureSlotsContext value={styles}>
      <AriaDisclosure
        {...props}
        data-slot="disclosure"
        data-variant={resolved.variant}
        data-size={resolvedSize}
        className={composeRenderProps(className, (className) => styles.root({ className }))}
      />
    </DisclosureSlotsContext>
  );
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface DisclosureTriggerProps extends Omit<
  AriaButtonProps,
  'children' | 'className' | 'slot'
> {
  children: ReactNode;
  description?: ReactNode;
  startIcon?: ReactNode;
  level?: HeadingLevel;
  className?: AriaButtonProps['className'];
}

export function DisclosureTrigger({
  children,
  description,
  startIcon,
  level = 3,
  className,
  ...props
}: DisclosureTriggerProps) {
  const styles = use(DisclosureSlotsContext);
  const icons = useIcons();

  return (
    <Heading level={level} data-slot="disclosure-heading" className={styles.heading()}>
      <AriaButton
        {...props}
        slot="trigger"
        data-slot="disclosure-trigger"
        className={composeRenderProps(className, (className) => styles.trigger({ className }))}
      >
        {startIcon ? (
          <span aria-hidden="true" data-slot="disclosure-start-icon" className={styles.startIcon()}>
            {startIcon}
          </span>
        ) : null}
        <span data-slot="disclosure-text" className={styles.text()}>
          <span data-slot="disclosure-title" className={styles.title()}>
            {children}
          </span>
          {description != null ? (
            <span data-slot="disclosure-description" className={styles.description()}>
              {description}
            </span>
          ) : null}
        </span>
        <span aria-hidden="true" data-slot="disclosure-indicator" className={styles.indicator()}>
          <icons.chevronDown />
        </span>
      </AriaButton>
    </Heading>
  );
}

export interface DisclosurePanelProps extends Omit<
  AriaDisclosurePanelProps,
  'className' | 'children'
> {
  children?: ReactNode;
  className?: string;
}

export function DisclosurePanel({ children, className, ...props }: DisclosurePanelProps) {
  const styles = use(DisclosureSlotsContext);

  return (
    <AriaDisclosurePanel {...props} data-slot="disclosure-panel" className={styles.panel()}>
      <div data-slot="disclosure-content" className={styles.content({ className })}>
        <AccordionContext value={null}>
          <DisclosureGroupStateContext value={null}>{children}</DisclosureGroupStateContext>
        </AccordionContext>
      </div>
    </AriaDisclosurePanel>
  );
}
