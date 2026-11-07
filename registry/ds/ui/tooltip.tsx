'use client';

import {
  Children,
  createContext,
  isValidElement,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  Keyboard,
  Popover as AriaPopover,
  PreviewTrigger,
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  TooltipTriggerStateContext,
  composeRenderProps,
  useLocale,
  type PreviewTriggerProps,
  type TooltipProps as AriaTooltipProps,
  type TooltipTriggerComponentProps,
} from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { ButtonGroupContext } from '@/registry/ds/ui/button';
import { useDirection } from '@/registry/ds/ui/ds-provider';
import { Kbd, type KbdKey } from '@/registry/ds/ui/kbd';
import { PopoverArrow, popoverMotion, usePopoverMotion } from '@/registry/ds/ui/popover';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';

export type TooltipPlacement = NonNullable<AriaTooltipProps['placement']>;

const defaultDelay = 500;
const defaultCloseDelay = 200;

interface TooltipGroupValue {
  delay?: number;
  closeDelay?: number;
  placement?: TooltipPlacement;
  isDisabled?: boolean;
}

const TooltipGroupContext = createContext<TooltipGroupValue>({});

const InteractiveTooltipContext = createContext<Dispatch<SetStateAction<number>> | null>(null);

export interface TooltipGroupProps extends TooltipGroupValue {
  children: ReactNode;
}

export function TooltipGroup({
  delay,
  closeDelay,
  placement,
  isDisabled,
  children,
}: TooltipGroupProps) {
  const parent = use(TooltipGroupContext);
  const value = useMemo(
    () => ({
      delay: delay ?? parent.delay,
      closeDelay: closeDelay ?? parent.closeDelay,
      placement: placement ?? parent.placement,
      isDisabled: isDisabled ?? parent.isDisabled,
    }),
    [delay, closeDelay, placement, isDisabled, parent],
  );

  return <TooltipGroupContext value={value}>{children}</TooltipGroupContext>;
}

export type TooltipTriggerProps = TooltipTriggerComponentProps;

export function TooltipTrigger({
  delay,
  closeDelay,
  isDisabled,
  trigger,
  shouldCloseOnPress,
  children,
  ...props
}: TooltipTriggerProps) {
  const group = use(TooltipGroupContext);
  const [interactiveTooltips, setInteractiveTooltips] = useState(0);
  const timing = {
    delay: delay ?? group.delay ?? defaultDelay,
    closeDelay: closeDelay ?? group.closeDelay ?? defaultCloseDelay,
    isDisabled: isDisabled ?? group.isDisabled,
  };
  const isInteractive = interactiveTooltips > 0 || holdsInteractiveTooltip(children);

  return (
    <InteractiveTooltipContext value={setInteractiveTooltips}>
      {isInteractive ? (
        <PreviewTooltipTrigger {...props} {...timing}>
          {children}
        </PreviewTooltipTrigger>
      ) : (
        <AriaTooltipTrigger
          {...props}
          {...timing}
          trigger={trigger}
          shouldCloseOnPress={shouldCloseOnPress}
        >
          {children}
        </AriaTooltipTrigger>
      )}
    </InteractiveTooltipContext>
  );
}

function PreviewTooltipTrigger({
  isOpen: isOpenProp,
  defaultOpen = false,
  onOpenChange,
  isDisabled,
  ...props
}: PreviewTriggerProps) {
  const [isOpen, setOpen] = useControllableState(isOpenProp, defaultOpen, onOpenChange);

  useEffect(() => {
    if (isDisabled && isOpen) setOpen(false);
  }, [isDisabled, isOpen, setOpen]);

  return (
    <PreviewTrigger
      {...props}
      isDisabled={isDisabled}
      isOpen={isOpen && !isDisabled}
      onOpenChange={(next) => {
        if (!next || !isDisabled) setOpen(next);
      }}
    />
  );
}

function holdsInteractiveTooltip(children: ReactNode) {
  return Children.toArray(children).some(
    (child) =>
      isValidElement<RichTooltipProps>(child) &&
      child.type === RichTooltip &&
      child.props.action != null,
  );
}

function useInteractiveTooltip(isInteractive: boolean) {
  const register = use(InteractiveTooltipContext);

  useLayoutEffect(() => {
    if (!register || !isInteractive) return;
    register((count) => count + 1);
    return () => register((count) => count - 1);
  }, [register, isInteractive]);
}

export const tooltipStyles = tv({
  slots: {
    base: [
      'flex min-h-7 max-w-xs items-center gap-2.5 rounded-item bg-inverse-surface px-2.5 py-1.5 text-xs text-inverse-on-surface shadow-md',
      'origin-(--trigger-anchor-point) [--ds-popover-scale:0.9] forced-colors:border',
    ],
    label: 'me-auto min-w-0',
    shortcut: 'flex shrink-0 items-center gap-0.5',
    key: 'h-4 min-w-4 rounded-sm bg-inverse-on-surface/15 px-1 text-xs font-medium text-inverse-on-surface',
    arrow: 'text-inverse-surface',
  },
  variants: {
    motion: {
      spatial: { base: popoverMotion.spatial },
      fade: { base: popoverMotion.fade },
      none: { base: popoverMotion.none },
    },
  },
  defaultVariants: {
    motion: 'spatial',
  },
});

export type TooltipStyleProps = VariantProps<typeof tooltipStyles>;

interface TooltipShortcutProps {
  keys: readonly KbdKey[];
  className: string;
  keyClassName: string;
}

function TooltipShortcut({ keys, className, keyClassName }: TooltipShortcutProps) {
  return (
    <Keyboard data-slot="shortcut" className={className}>
      {keys.map((key, index) => (
        <Kbd key={`${index}:${key}`} variant="ghost" size="sm" className={keyClassName}>
          {key}
        </Kbd>
      ))}
    </Keyboard>
  );
}

export interface TooltipProps extends Omit<AriaTooltipProps, 'children' | 'className'> {
  children?: ReactNode;
  shortcut?: readonly KbdKey[];
  showArrow?: boolean;
  className?: AriaTooltipProps['className'];
}

export function Tooltip({
  children,
  shortcut,
  showArrow = false,
  placement,
  offset,
  className,
  ...props
}: TooltipProps) {
  const group = use(TooltipGroupContext);
  const { locale } = useLocale();
  const direction = useDirection();
  const motion = usePopoverMotion();
  const styles = tooltipStyles({ motion });
  const themeScope = useThemeScopeProps();

  return (
    <AriaTooltip
      dir={direction}
      lang={locale}
      {...themeScope}
      {...props}
      placement={placement ?? group.placement ?? 'top'}
      offset={offset ?? (showArrow ? 10 : 6)}
      data-slot="tooltip"
      className={composeRenderProps(className, (className) => styles.base({ className }))}
    >
      {showArrow ? <PopoverArrow className={styles.arrow()} /> : null}
      <span data-slot="label" className={styles.label()}>
        {children}
      </span>
      {shortcut?.length ? (
        <TooltipShortcut
          keys={shortcut}
          className={styles.shortcut()}
          keyClassName={styles.key()}
        />
      ) : null}
    </AriaTooltip>
  );
}

export const richTooltipStyles = tv({
  slots: {
    base: [
      'flex max-w-[min(20rem,calc(100vw-1.5rem))] flex-col gap-1 rounded-overlay bg-surface-overlay px-4 py-3 text-sm text-on-surface-variant shadow-md outline-none',
      'origin-(--trigger-anchor-point) [--ds-popover-scale:0.9] has-data-[slot=actions]:pb-2 forced-colors:border',
    ],
    title: 'text-sm font-semibold text-on-surface',
    body: 'text-sm',
    actions: '-ms-3 mt-1 flex flex-wrap items-center gap-1',
    arrow: 'text-surface-overlay',
  },
  variants: {
    motion: {
      spatial: { base: popoverMotion.spatial },
      fade: { base: popoverMotion.fade },
      none: { base: popoverMotion.none },
    },
  },
  defaultVariants: {
    motion: 'spatial',
  },
});

export type RichTooltipStyleProps = VariantProps<typeof richTooltipStyles>;

export interface RichTooltipProps extends Pick<
  AriaTooltipProps,
  'placement' | 'offset' | 'crossOffset' | 'shouldFlip' | 'containerPadding'
> {
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  showArrow?: boolean;
  className?: string;
}

export function RichTooltip({
  title,
  children,
  action,
  showArrow = false,
  placement,
  offset,
  className,
  ...props
}: RichTooltipProps) {
  const tooltipState = use(TooltipTriggerStateContext);
  const group = use(TooltipGroupContext);
  const { locale } = useLocale();
  const direction = useDirection();
  const motion = usePopoverMotion();
  const themeScope = useThemeScopeProps();
  const titleId = useId();
  const bodyId = useId();
  const styles = richTooltipStyles({ motion });
  const position = {
    ...props,
    placement: placement ?? group.placement ?? 'top',
    offset: offset ?? (showArrow ? 12 : 8),
  };

  useInteractiveTooltip(action != null);

  const content = (
    <ButtonGroupContext value={null}>
      {showArrow ? <PopoverArrow className={styles.arrow()} /> : null}
      {title != null ? (
        <div id={titleId} data-slot="title" className={styles.title()}>
          {title}
        </div>
      ) : null}
      {children != null ? (
        <div id={bodyId} data-slot="body" className={styles.body()}>
          {children}
        </div>
      ) : null}
      {action != null ? (
        <div data-slot="actions" className={styles.actions()}>
          {action}
        </div>
      ) : null}
    </ButtonGroupContext>
  );

  if (tooltipState) {
    return (
      <AriaTooltip
        dir={direction}
        lang={locale}
        {...themeScope}
        {...position}
        data-slot="rich-tooltip"
        className={styles.base({ className })}
      >
        {content}
      </AriaTooltip>
    );
  }

  return (
    <AriaPopover
      {...themeScope}
      {...position}
      lang={locale}
      aria-labelledby={title != null ? titleId : bodyId}
      data-slot="rich-tooltip"
      className={styles.base({ className })}
    >
      {content}
    </AriaPopover>
  );
}
