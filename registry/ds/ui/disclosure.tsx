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
    root: 'relative min-w-0 text-on-surface',
    heading: 'flex min-w-0',
    trigger: [
      'state-layer focus-ring-inset group/trigger flex w-full min-w-0 cursor-default items-center text-start select-none',
      'data-[disabled]:text-on-surface/38',
    ],
    startIcon: [
      iconSlot,
      'text-on-surface-variant group-data-[disabled]/trigger:text-on-surface/38',
    ],
    text: 'flex min-w-0 flex-1 flex-col gap-0.5',
    title: 'break-words',
    description: 'text-on-surface-variant group-data-[disabled]/trigger:text-on-surface/38',
    indicator: [
      iconSlot,
      'text-on-surface-variant group-aria-expanded/trigger:rotate-180 group-data-[disabled]/trigger:text-on-surface/38',
    ],
    panel: 'h-(--disclosure-panel-height) [clip-path:inset(-0.5rem_0_0)] aria-hidden:opacity-0',
    content: 'space-y-3 text-on-surface-variant',
  },
  variants: {
    variant: {
      plain: '',
      outlined: {
        root: 'overflow-clip rounded-(--disclosure-radius) border border-outline-variant data-[disabled]:border-on-surface/12',
      },
      filled: {
        root: 'overflow-clip rounded-(--disclosure-radius) bg-surface-container-high',
      },
    },
    size: {
      sm: {
        root: '[--disclosure-radius:var(--radius-md)] [--icon-size:1.25rem]',
        trigger: 'min-h-12 gap-3 px-3 py-2.5',
        title: 'text-title-sm',
        description: 'text-body-sm',
        content: 'px-3 pb-3 text-body-sm',
      },
      md: {
        root: '[--disclosure-radius:var(--radius-md)] [--icon-size:1.5rem]',
        trigger: 'min-h-14 gap-3 px-4 py-4',
        title: 'text-title-md',
        description: 'text-body-md',
        content: 'px-4 pb-4 text-body-md',
      },
      lg: {
        root: '[--disclosure-radius:var(--radius-lg)] [--icon-size:1.5rem]',
        trigger: 'min-h-16 gap-4 px-5 py-5',
        title: 'text-title-lg',
        description: 'text-body-md',
        content: 'px-5 pb-5 text-body-lg',
      },
    },
    grouping: {
      none: '',
      plain: { trigger: 'rounded-none' },
      outlined: {
        root: [
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
        indicator:
          'transition-[rotate] duration-(--ds-duration-spatial) ease-spatial motion-reduce:transition-none',
        panel:
          '[transition:height_var(--ds-duration-spatial)_var(--ds-ease-spatial),opacity_var(--ds-duration-effect)_var(--ds-ease-effect)] motion-reduce:transition-none',
      },
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'plain', grouping: 'none', class: { trigger: 'rounded-(--disclosure-radius)' } },
    {
      variant: 'outlined',
      grouping: 'none',
      class: {
        trigger: 'rounded-[calc(var(--disclosure-radius)-1px)] aria-expanded:rounded-b-none',
      },
    },
    {
      variant: 'filled',
      grouping: 'none',
      class: { trigger: 'rounded-(--disclosure-radius) aria-expanded:rounded-b-none' },
    },
  ],
  defaultVariants: {
    variant: 'outlined',
    size: 'md',
    grouping: 'none',
    animated: true,
  },
});

export const accordionStyles = tv({
  base: 'flex min-w-0 flex-col',
  variants: {
    variant: {
      plain: 'divide-y divide-outline-variant',
      outlined:
        'divide-y divide-outline-variant overflow-clip rounded-(--accordion-radius) border border-outline-variant',
      separated: 'gap-2',
    },
    size: {
      sm: '[--accordion-radius:var(--radius-md)]',
      md: '[--accordion-radius:var(--radius-md)]',
      lg: '[--accordion-radius:var(--radius-lg)]',
    },
  },
  compoundVariants: [{ variant: 'separated', size: 'lg', class: 'gap-3' }],
  defaultVariants: {
    variant: 'outlined',
    size: 'md',
  },
});

export type DisclosureVariant = 'plain' | 'outlined' | 'filled';

export type DisclosureSize = 'sm' | 'md' | 'lg';

export type AccordionVariant = 'plain' | 'outlined' | 'separated';

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
  variant = 'outlined',
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

type DisclosureGrouping = 'none' | 'plain' | 'outlined';

function resolveVariant(
  variant: DisclosureVariant | undefined,
  accordion: AccordionContextValue | null,
): { variant: DisclosureVariant; grouping: DisclosureGrouping } {
  if (!accordion) return { variant: variant ?? 'outlined', grouping: 'none' };
  if (accordion.variant === 'separated') return { variant: variant ?? 'filled', grouping: 'none' };
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
