'use client';

import { createContext, use, useMemo, useState, type ReactNode } from 'react';
import {
  Button as AriaButton,
  ButtonContext,
  Label,
  ProgressBar,
  Tag,
  TagGroup,
  TagList,
  TagListContext,
  Text,
  ToggleButton as AriaToggleButton,
  composeRenderProps,
  useSlottedContext,
  type ButtonProps as AriaButtonProps,
  type PressEvent,
  type TagGroupProps,
  type TagListProps,
  type TagProps,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';
import { mergeLabels, type LabelTemplate } from '@/registry/ds/lib/labels';
import { tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';

const iconBase =
  'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]';

export const chipStyles = tv({
  slots: {
    root: [
      'focus-ring group/chip relative isolate inline-flex max-w-full shrink-0 cursor-default items-center rounded-sm border whitespace-nowrap no-underline select-none',
      '[transition:background-color_150ms_var(--ease-standard),color_150ms_var(--ease-standard),border-color_150ms_var(--ease-standard),box-shadow_150ms_var(--ease-standard),padding_var(--chip-morph-duration)_var(--ds-ease-spatial-fast)]',
      'motion-reduce:[--chip-morph-duration:0ms]',
      'data-[disabled]:text-on-surface/38 data-[disabled]:shadow-none',
    ],
    leadingIcon: iconBase,
    trailingIcon: iconBase,
    reveal: [
      'grid grid-cols-[0fr] group-data-[pending]/chip:grid-cols-[1fr] group-data-[selected]/chip:grid-cols-[1fr]',
      '[transition:grid-template-columns_var(--chip-morph-duration)_var(--ds-ease-spatial-fast)]',
    ],
    revealContent: 'flex min-w-0 overflow-hidden',
    avatar: [
      'relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary-container text-label-sm text-on-primary-container',
      'group-data-[disabled]/chip:opacity-38 [&_img]:size-full [&_img]:object-cover',
    ],
    avatarContent: 'grid size-full place-items-center',
    avatarPending:
      'absolute inset-0 grid place-items-center bg-primary-container text-(length:--icon-size) text-on-primary-container',
    avatarCheck: [
      'absolute inset-0 grid scale-50 place-items-center bg-primary text-(length:--icon-size) text-on-primary opacity-0 [&_svg]:size-[1em]',
      'transition-[opacity,scale] duration-(--chip-morph-duration) ease-standard',
      'group-data-[selected]/chip:scale-100 group-data-[selected]/chip:opacity-100',
    ],
    label: 'min-w-0 truncate',
    remove: [
      'state-layer focus-ring relative inline-flex shrink-0 cursor-default items-center justify-center rounded-full text-(length:--icon-size) [&_svg]:size-[1em]',
      'data-[disabled]:text-on-surface/38',
    ],
    group: 'flex flex-col gap-2',
    groupLabel: 'text-label-lg text-on-surface-variant',
    list: 'focus-ring flex flex-wrap gap-2 rounded-xs data-[empty]:text-body-md data-[empty]:text-on-surface-variant',
    description: 'text-body-sm text-on-surface-variant',
  },
  variants: {
    variant: {
      outlined: {
        root: [
          'border-outline-variant bg-transparent text-on-surface-variant data-[disabled]:border-on-surface/12',
          'data-[selected]:not-data-[disabled]:border-transparent data-[selected]:not-data-[disabled]:bg-secondary-container data-[selected]:not-data-[disabled]:text-on-secondary-container',
          'data-[selected]:data-[disabled]:border-transparent data-[selected]:data-[disabled]:bg-on-surface/12',
        ],
      },
      elevated: {
        root: [
          'border-transparent bg-surface-container-low text-on-surface-variant shadow-elevation-1 data-[disabled]:bg-on-surface/12 data-[hovered]:shadow-elevation-2',
          'data-[selected]:not-data-[disabled]:bg-secondary-container data-[selected]:not-data-[disabled]:text-on-secondary-container',
        ],
      },
      tonal: {
        root: [
          'border-transparent bg-secondary-container text-on-secondary-container data-[disabled]:bg-on-surface/12',
          'data-[selected]:not-data-[disabled]:bg-secondary data-[selected]:not-data-[disabled]:text-on-secondary',
        ],
      },
    },
    size: {
      sm: {
        root: 'h-7 text-label-lg [--icon-size:1rem]',
        leadingIcon: 'me-1.5',
        trailingIcon: 'ms-1.5',
        avatar: 'me-1.5 size-5',
        remove: 'ms-0.5 size-5',
      },
      md: {
        root: 'h-8 text-label-lg [--icon-size:1.125rem]',
        leadingIcon: 'me-2',
        trailingIcon: 'ms-2',
        avatar: 'me-2 size-6',
        remove: 'ms-1 size-6',
      },
    },
    leading: {
      none: '',
      icon: '',
      avatar: '',
      reveal: '',
    },
    trailing: {
      none: '',
      icon: '',
      remove: '',
    },
    interactive: {
      true: { root: 'state-layer' },
      false: '',
    },
    morph: {
      true: { root: '[--chip-morph-duration:var(--ds-duration-spatial-fast)]' },
      false: { root: '[--chip-morph-duration:0ms]' },
    },
  },
  compoundVariants: [
    {
      variant: ['outlined', 'elevated'],
      class: {
        leadingIcon:
          'text-primary group-data-[disabled]/chip:text-inherit group-data-[selected]/chip:text-inherit',
      },
    },
    { size: 'md', leading: 'none', class: { root: 'ps-4' } },
    { size: 'md', leading: 'icon', class: { root: 'ps-2' } },
    { size: 'md', leading: 'avatar', class: { root: 'ps-1' } },
    {
      size: 'md',
      leading: 'reveal',
      class: { root: 'ps-4 data-[pending]:ps-2 data-[selected]:ps-2' },
    },
    { size: 'md', trailing: 'none', class: { root: 'pe-4' } },
    { size: 'md', trailing: 'icon', class: { root: 'pe-2' } },
    { size: 'md', trailing: 'remove', class: { root: 'pe-1' } },
    { size: 'sm', leading: 'none', class: { root: 'ps-3' } },
    { size: 'sm', leading: 'icon', class: { root: 'ps-1.5' } },
    { size: 'sm', leading: 'avatar', class: { root: 'ps-1' } },
    {
      size: 'sm',
      leading: 'reveal',
      class: { root: 'ps-3 data-[pending]:ps-1.5 data-[selected]:ps-1.5' },
    },
    { size: 'sm', trailing: 'none', class: { root: 'pe-3' } },
    { size: 'sm', trailing: 'icon', class: { root: 'pe-1.5' } },
    { size: 'sm', trailing: 'remove', class: { root: 'pe-1' } },
  ],
  defaultVariants: {
    variant: 'outlined',
    size: 'md',
    leading: 'none',
    trailing: 'none',
    interactive: true,
    morph: true,
  },
});

export type ChipVariant = 'outlined' | 'elevated' | 'tonal';

export interface ChipLabels {
  remove: LabelTemplate<{ label: string }>;
  pending: string;
}

export const defaultChipLabels: ChipLabels = {
  remove: 'Remove {label}',
  pending: 'Loading',
};

export type ChipSize = 'sm' | 'md';

export interface ChipStyleProps {
  variant?: ChipVariant;
  size?: ChipSize;
}

type ChipSlots = ReturnType<typeof chipStyles>;

type LeadingKind = 'none' | 'icon' | 'avatar' | 'reveal';

function leadingKind(startIcon: ReactNode, avatar: ReactNode, hasReveal: boolean): LeadingKind {
  if (startIcon) return 'icon';
  if (avatar) return 'avatar';
  return hasReveal ? 'reveal' : 'none';
}

interface ChipGroupContextValue {
  variant: ChipVariant;
  size: ChipSize;
  isDisabled?: boolean;
  labels?: Partial<ChipLabels>;
}

const ChipGroupContext = createContext<ChipGroupContextValue | null>(null);

interface ChipRemoveButtonProps {
  label: string;
  labels?: Partial<ChipLabels>;
  className: string;
}

function ChipRemoveButton({ label, labels, className }: ChipRemoveButtonProps) {
  const icons = useIcons();
  const t = useLabels('chip', defaultChipLabels, labels);
  const remove = useSlottedContext(ButtonContext, 'remove');
  const naming = label
    ? { 'aria-label': t.format('remove', { label }) }
    : {
        id: remove?.id,
        'aria-label': remove?.['aria-label'],
        'aria-labelledby': remove?.['aria-labelledby'],
      };

  return (
    <AriaButton
      {...naming}
      slot={null}
      onPress={remove?.onPress}
      isDisabled={remove?.isDisabled}
      data-slot="remove"
      className={className}
    >
      <icons.close />
    </AriaButton>
  );
}

interface ChipContentProps {
  styles: ChipSlots;
  leading: LeadingKind;
  startIcon?: ReactNode;
  avatar?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
  isSelectable?: boolean;
  isSelected?: boolean;
  isPending?: boolean;
  removeLabel?: string;
  labels?: Partial<ChipLabels>;
}

function ChipContent({
  styles,
  leading,
  startIcon,
  avatar,
  endIcon,
  children,
  isSelectable = false,
  isSelected = false,
  isPending = false,
  removeLabel,
  labels,
}: ChipContentProps) {
  const icons = useIcons();
  const t = useLabels('chip', defaultChipLabels, labels);
  const check = <icons.check />;
  const pending = isPending ? (
    <ProgressBar
      isIndeterminate
      aria-label={t.pending}
      data-slot="pending"
      className="inline-flex size-[1em] items-center justify-center"
    >
      <Spinner />
    </ProgressBar>
  ) : null;

  return (
    <>
      {leading === 'icon' ? (
        <span data-slot="start-icon" className={styles.leadingIcon()}>
          {pending ?? (isSelectable && isSelected ? check : startIcon)}
        </span>
      ) : null}
      {leading === 'avatar' ? (
        <span data-slot="avatar" className={styles.avatar()}>
          <span aria-hidden="true" className={styles.avatarContent()}>
            {avatar}
          </span>
          {isSelectable ? (
            <span data-slot="avatar-check" className={styles.avatarCheck()}>
              {check}
            </span>
          ) : null}
          {pending ? <span className={styles.avatarPending()}>{pending}</span> : null}
        </span>
      ) : null}
      {leading === 'reveal' ? (
        <span data-slot="start-icon" className={styles.reveal()}>
          <span className={styles.revealContent()}>
            <span className={styles.leadingIcon()}>{pending ?? (isSelectable ? check : null)}</span>
          </span>
        </span>
      ) : null}
      {children != null ? (
        <span data-slot="label" className={styles.label()}>
          {children}
        </span>
      ) : null}
      {removeLabel != null ? (
        <ChipRemoveButton label={removeLabel} labels={labels} className={styles.remove()} />
      ) : endIcon ? (
        <span data-slot="end-icon" className={styles.trailingIcon()}>
          {endIcon}
        </span>
      ) : null}
    </>
  );
}

export interface ChipProps extends Omit<TagProps, 'children' | 'className'>, ChipStyleProps {
  startIcon?: ReactNode;
  avatar?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
  labels?: Partial<ChipLabels>;
  className?: TagProps['className'];
}

export function Chip({
  variant,
  size,
  startIcon,
  avatar,
  endIcon,
  children,
  labels,
  textValue,
  className,
  isDisabled,
  ...props
}: ChipProps) {
  const group = use(ChipGroupContext);
  const chipLabels = mergeLabels<Partial<ChipLabels>>({}, group?.labels, labels);
  const { spatialEnabled } = useMotionPreference();
  const style = {
    variant: variant ?? group?.variant ?? 'outlined',
    size: size ?? group?.size ?? 'md',
  };
  const label = textValue ?? (typeof children === 'string' ? children : undefined);
  const hasAction = Boolean(props.onAction || props.href);

  function slotsFor(selectionMode: 'none' | 'single' | 'multiple', allowsRemoving: boolean) {
    const isSelectable = selectionMode !== 'none';
    return chipStyles({
      ...style,
      leading: leadingKind(startIcon, avatar, isSelectable),
      trailing: allowsRemoving ? 'remove' : endIcon ? 'icon' : 'none',
      interactive: isSelectable || hasAction,
      morph: spatialEnabled,
    });
  }

  return (
    <Tag
      {...props}
      textValue={label}
      isDisabled={isDisabled ?? group?.isDisabled}
      data-slot="chip"
      data-variant={style.variant}
      data-size={style.size}
      className={composeRenderProps(className, (className, { selectionMode, allowsRemoving }) =>
        slotsFor(selectionMode, allowsRemoving).root({ className }),
      )}
    >
      {({ selectionMode, allowsRemoving, isSelected }) => (
        <ChipContent
          styles={slotsFor(selectionMode, allowsRemoving)}
          leading={leadingKind(startIcon, avatar, selectionMode !== 'none')}
          startIcon={startIcon}
          avatar={avatar}
          endIcon={endIcon}
          isSelectable={selectionMode !== 'none'}
          isSelected={isSelected}
          removeLabel={allowsRemoving ? (label ?? '') : undefined}
          labels={chipLabels}
        >
          {children}
        </ChipContent>
      )}
    </Tag>
  );
}

function ChipList<T extends object>(props: TagListProps<T>) {
  const group = use(ChipGroupContext);
  const gridProps = useSlottedContext(TagListContext);
  const list = <TagList {...props} />;

  if (!group?.isDisabled || !gridProps) return list;

  return (
    <TagListContext value={Object.assign({}, gridProps, { tabIndex: -1 })}>{list}</TagListContext>
  );
}

export interface ChipGroupProps<T extends object>
  extends Omit<TagGroupProps, 'children' | 'className'>, ChipStyleProps {
  label?: ReactNode;
  description?: ReactNode;
  items?: Iterable<T>;
  children?: ReactNode | ((item: T) => ReactNode);
  renderEmptyState?: TagListProps<T>['renderEmptyState'];
  dependencies?: TagListProps<T>['dependencies'];
  isDisabled?: boolean;
  labels?: Partial<ChipLabels>;
  className?: string;
}

export function ChipGroup<T extends object>({
  variant = 'outlined',
  size = 'md',
  label,
  description,
  items,
  children,
  renderEmptyState,
  dependencies,
  isDisabled,
  labels,
  className,
  ...props
}: ChipGroupProps<T>) {
  const styles = chipStyles({ size });
  const context = useMemo(
    () => ({ variant, size, isDisabled, labels }),
    [variant, size, isDisabled, labels],
  );

  return (
    <ChipGroupContext value={context}>
      <TagGroup
        {...props}
        data-slot="chip-group"
        data-variant={variant}
        data-size={size}
        data-disabled={isDisabled || undefined}
        className={styles.group({ className })}
      >
        {label != null ? (
          <Label data-slot="chip-group-label" className={styles.groupLabel()}>
            {label}
          </Label>
        ) : null}
        <ChipList
          items={items}
          dependencies={dependencies}
          renderEmptyState={renderEmptyState}
          data-slot="chip-list"
          className={styles.list()}
        >
          {children}
        </ChipList>
        {description != null ? (
          <Text
            slot="description"
            data-slot="chip-group-description"
            className={styles.description()}
          >
            {description}
          </Text>
        ) : null}
      </TagGroup>
    </ChipGroupContext>
  );
}

export interface AssistChipProps
  extends Omit<AriaButtonProps, 'onPress' | 'children' | 'className'>, ChipStyleProps {
  onPress?: (event: PressEvent) => void | Promise<unknown>;
  startIcon?: ReactNode;
  avatar?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
  labels?: Partial<ChipLabels>;
  className?: AriaButtonProps['className'];
}

export function AssistChip({
  variant = 'outlined',
  size = 'md',
  startIcon,
  avatar,
  endIcon,
  children,
  labels,
  className,
  onPress,
  isPending: isPendingProp,
  ...props
}: AssistChipProps) {
  const { spatialEnabled } = useMotionPreference();
  const [isRunning, setRunning] = useState(false);
  const isPending = isPendingProp ?? isRunning;
  const leading = leadingKind(startIcon, avatar, true);
  const styles = chipStyles({
    variant,
    size,
    leading,
    trailing: endIcon ? 'icon' : 'none',
    morph: spatialEnabled,
  });

  function handlePress(event: PressEvent) {
    const result = onPress?.(event);
    if (result && typeof result.then === 'function') {
      setRunning(true);
      result.then(
        () => setRunning(false),
        () => setRunning(false),
      );
    }
  }

  return (
    <AriaButton
      {...props}
      onPress={handlePress}
      isPending={isPending}
      data-slot="chip"
      data-variant={variant}
      data-size={size}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      <ChipContent
        styles={styles}
        leading={leading}
        startIcon={startIcon}
        avatar={avatar}
        endIcon={endIcon}
        isPending={isPending}
        labels={labels}
      >
        {children}
      </ChipContent>
    </AriaButton>
  );
}

export interface FilterChipProps
  extends Omit<AriaToggleButtonProps, 'children' | 'className'>, ChipStyleProps {
  startIcon?: ReactNode;
  avatar?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
  className?: AriaToggleButtonProps['className'];
}

export function FilterChip({
  variant = 'outlined',
  size = 'md',
  startIcon,
  avatar,
  endIcon,
  children,
  className,
  ...props
}: FilterChipProps) {
  const { spatialEnabled } = useMotionPreference();
  const leading = leadingKind(startIcon, avatar, true);
  const styles = chipStyles({
    variant,
    size,
    leading,
    trailing: endIcon ? 'icon' : 'none',
    morph: spatialEnabled,
  });

  return (
    <AriaToggleButton
      {...props}
      data-slot="chip"
      data-variant={variant}
      data-size={size}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      {({ isSelected }) => (
        <ChipContent
          styles={styles}
          leading={leading}
          startIcon={startIcon}
          avatar={avatar}
          endIcon={endIcon}
          isSelectable
          isSelected={isSelected}
        >
          {children}
        </ChipContent>
      )}
    </AriaToggleButton>
  );
}
