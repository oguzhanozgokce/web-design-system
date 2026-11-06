'use client';

import {
  createContext,
  use,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Button as AriaButton,
  ButtonContext,
  Label,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList,
  TagListContext,
  Text,
  useSlottedContext,
  type Key,
  type TagGroupProps as AriaTagGroupProps,
  type TagListProps,
  type TagProps as AriaTagProps,
} from 'react-aria-components';
import { mergeLabels, type LabelTemplate } from '@/registry/ds/lib/labels';
import { tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type TagTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export type TagVariant = 'tonal' | 'outlined' | 'filled';

export type TagSize = 'sm' | 'md';

export const tagStyles = tv({
  slots: {
    root: [
      'group/tag relative inline-flex max-w-full shrink-0 items-center rounded-xs border align-middle whitespace-nowrap no-underline',
      'transition-[background-color,color,border-color] duration-150 ease-standard motion-reduce:transition-none',
      'data-[disabled]:text-on-surface/38',
    ],
    leading:
      'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]',
    dot: 'size-1.5 shrink-0 rounded-full group-data-[disabled]/tag:bg-current',
    label: 'min-w-0 truncate',
    remove: [
      'state-layer focus-ring relative inline-flex shrink-0 cursor-default items-center justify-center rounded-full text-(length:--icon-size) after:absolute [&_svg]:size-[1em]',
    ],
    group: 'flex min-w-0 flex-col gap-1.5',
    groupLabel: 'w-fit cursor-default text-label-lg text-on-surface',
    list: 'focus-ring flex flex-wrap items-center rounded-xs',
    empty: 'text-body-md text-on-surface-variant',
    description: 'text-body-sm text-on-surface-variant',
    error: 'text-body-sm text-error',
  },
  variants: {
    variant: {
      tonal: { root: 'border-transparent data-[disabled]:bg-on-surface/12' },
      outlined: { root: 'bg-transparent data-[disabled]:border-on-surface/12' },
      filled: { root: 'border-transparent data-[disabled]:bg-on-surface/12', dot: 'bg-current' },
    },
    tone: {
      neutral: {
        root: 'data-[selected]:not-data-[disabled]:border-transparent data-[selected]:not-data-[disabled]:bg-inverse-surface data-[selected]:not-data-[disabled]:text-inverse-on-surface',
        dot: 'bg-on-surface-variant',
      },
      primary: {
        root: 'data-[selected]:not-data-[disabled]:border-transparent data-[selected]:not-data-[disabled]:bg-primary data-[selected]:not-data-[disabled]:text-on-primary',
        dot: 'bg-primary',
      },
      success: {
        root: 'data-[selected]:not-data-[disabled]:border-transparent data-[selected]:not-data-[disabled]:bg-success data-[selected]:not-data-[disabled]:text-on-success',
        dot: 'bg-success',
      },
      warning: {
        root: 'data-[selected]:not-data-[disabled]:border-transparent data-[selected]:not-data-[disabled]:bg-warning data-[selected]:not-data-[disabled]:text-on-warning',
        dot: 'bg-warning',
      },
      error: {
        root: 'data-[selected]:not-data-[disabled]:border-transparent data-[selected]:not-data-[disabled]:bg-error data-[selected]:not-data-[disabled]:text-on-error',
        dot: 'bg-error',
      },
      info: {
        root: 'data-[selected]:not-data-[disabled]:border-transparent data-[selected]:not-data-[disabled]:bg-info data-[selected]:not-data-[disabled]:text-on-info',
        dot: 'bg-info',
      },
    },
    size: {
      sm: {
        root: 'h-5 gap-1 px-1.5 text-label-sm [--icon-size:0.75rem]',
        remove: 'size-3.5 after:-inset-[0.3125rem]',
        list: 'gap-1',
      },
      md: {
        root: 'h-6 gap-1 px-2 text-label-sm [--icon-size:0.875rem]',
        remove: 'size-4 after:-inset-1',
        list: 'gap-1.5',
      },
    },
    pulse: {
      true: { dot: 'animate-ds-pulse motion-reduce:animate-none' },
      false: '',
    },
    interactive: {
      true: { root: 'state-layer' },
      false: '',
    },
    focusable: {
      true: { root: 'focus-ring cursor-default select-none' },
      false: '',
    },
    removable: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'tonal',
      tone: 'neutral',
      class: { root: 'bg-surface-container-highest text-on-surface' },
    },
    {
      variant: 'tonal',
      tone: 'primary',
      class: { root: 'bg-primary-container text-on-primary-container' },
    },
    {
      variant: 'tonal',
      tone: 'success',
      class: { root: 'bg-success-container text-on-success-container' },
    },
    {
      variant: 'tonal',
      tone: 'warning',
      class: { root: 'bg-warning-container text-on-warning-container' },
    },
    {
      variant: 'tonal',
      tone: 'error',
      class: { root: 'bg-error-container text-on-error-container' },
    },
    {
      variant: 'tonal',
      tone: 'info',
      class: { root: 'bg-info-container text-on-info-container' },
    },
    {
      variant: 'outlined',
      tone: 'neutral',
      class: { root: 'border-outline-variant text-on-surface-variant' },
    },
    { variant: 'outlined', tone: 'primary', class: { root: 'border-primary/40 text-primary' } },
    { variant: 'outlined', tone: 'success', class: { root: 'border-success/40 text-success' } },
    { variant: 'outlined', tone: 'warning', class: { root: 'border-warning/40 text-warning' } },
    { variant: 'outlined', tone: 'error', class: { root: 'border-error/40 text-error' } },
    { variant: 'outlined', tone: 'info', class: { root: 'border-info/40 text-info' } },
    {
      variant: 'filled',
      tone: 'neutral',
      class: { root: 'bg-inverse-surface text-inverse-on-surface' },
    },
    { variant: 'filled', tone: 'primary', class: { root: 'bg-primary text-on-primary' } },
    { variant: 'filled', tone: 'success', class: { root: 'bg-success text-on-success' } },
    { variant: 'filled', tone: 'warning', class: { root: 'bg-warning text-on-warning' } },
    { variant: 'filled', tone: 'error', class: { root: 'bg-error text-on-error' } },
    { variant: 'filled', tone: 'info', class: { root: 'bg-info text-on-info' } },
    { removable: true, size: 'sm', class: { root: 'pe-0.5' } },
    { removable: true, size: 'md', class: { root: 'pe-1' } },
  ],
  defaultVariants: {
    variant: 'tonal',
    tone: 'neutral',
    size: 'md',
    pulse: false,
    interactive: false,
    focusable: false,
    removable: false,
  },
});

type TagSlots = ReturnType<typeof tagStyles>;

export interface TagStyleProps {
  tone?: TagTone;
  variant?: TagVariant;
  size?: TagSize;
}

export interface TagLabels {
  remove: LabelTemplate<{ label: string }>;
  empty: string;
}

export const defaultTagLabels: TagLabels = {
  remove: 'Remove {label}',
  empty: 'None',
};

interface TagGroupContextValue {
  tone?: TagTone;
  variant: TagVariant;
  size: TagSize;
  isDisabled?: boolean;
  labels?: Partial<TagLabels>;
}

const TagGroupStyleContext = createContext<TagGroupContextValue | null>(null);

type TagItemProps = Pick<
  AriaTagProps,
  | 'textValue'
  | 'isDisabled'
  | 'onAction'
  | 'href'
  | 'hrefLang'
  | 'target'
  | 'rel'
  | 'download'
  | 'ping'
  | 'referrerPolicy'
  | 'routerOptions'
>;

export interface TagProps
  extends
    TagStyleProps,
    TagItemProps,
    Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'id' | 'className' | 'style' | 'rel'> {
  id?: Key;
  dot?: boolean | 'pulse';
  icon?: ReactNode;
  children?: ReactNode;
  labels?: Partial<TagLabels>;
  className?: string;
  style?: CSSProperties;
}

type TagContentProps = Omit<TagProps, keyof TagItemProps | 'labels'>;

interface TagLeadingProps {
  styles: TagSlots;
  dot?: boolean | 'pulse';
  icon?: ReactNode;
  isSelected?: boolean;
}

function TagLeading({ styles, dot, icon, isSelected }: TagLeadingProps) {
  const icons = useIcons();
  if (isSelected) {
    return (
      <span data-slot="check" className={styles.leading()}>
        <icons.check />
      </span>
    );
  }
  if (icon) {
    return (
      <span data-slot="icon" aria-hidden="true" className={styles.leading()}>
        {icon}
      </span>
    );
  }
  if (dot) return <span data-slot="dot" aria-hidden="true" className={styles.dot()} />;
  return null;
}

interface TagRemoveButtonProps {
  label?: string;
  labels?: Partial<TagLabels>;
  className: string;
}

function TagRemoveButton({ label, labels, className }: TagRemoveButtonProps) {
  const icons = useIcons();
  const t = useLabels('tag', defaultTagLabels, labels);
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

function StaticTag({
  tone = 'neutral',
  variant = 'tonal',
  size = 'md',
  dot,
  icon,
  children,
  className,
  id,
  ...props
}: TagContentProps) {
  const { decorativeEnabled } = useMotionPreference();
  const styles = tagStyles({ tone, variant, size, pulse: dot === 'pulse' && decorativeEnabled });

  return (
    <span
      {...props}
      id={id == null ? undefined : String(id)}
      data-slot="tag"
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      className={styles.root({ className })}
    >
      <TagLeading styles={styles} dot={dot} icon={icon} />
      {children != null ? (
        <span data-slot="label" className={styles.label()}>
          {children}
        </span>
      ) : null}
    </span>
  );
}

function plainText(children: ReactNode) {
  return typeof children === 'string' || typeof children === 'number'
    ? String(children)
    : undefined;
}

interface GroupTagProps extends TagContentProps {
  group: TagGroupContextValue;
  item: TagItemProps;
  labels?: Partial<TagLabels>;
}

function GroupTag({
  group,
  item,
  labels,
  tone,
  variant,
  size,
  dot,
  icon,
  children,
  className,
  style,
  id,
}: GroupTagProps) {
  const resolved = {
    tone: tone ?? group.tone ?? 'neutral',
    variant: variant ?? group.variant,
    size: size ?? group.size,
  };
  const { decorativeEnabled } = useMotionPreference();
  const label = item.textValue ?? plainText(children);
  const hasAction = Boolean(item.onAction || item.href);

  function slotsFor(selectionMode: 'none' | 'single' | 'multiple', allowsRemoving: boolean) {
    return tagStyles({
      ...resolved,
      pulse: dot === 'pulse' && decorativeEnabled,
      interactive: selectionMode !== 'none' || hasAction,
      focusable: true,
      removable: allowsRemoving,
    });
  }

  return (
    <AriaTag
      {...item}
      id={id}
      textValue={label}
      isDisabled={item.isDisabled ?? group.isDisabled}
      style={style}
      data-slot="tag"
      data-tone={resolved.tone}
      data-variant={resolved.variant}
      data-size={resolved.size}
      className={({ selectionMode, allowsRemoving }) =>
        slotsFor(selectionMode, allowsRemoving).root({ className })
      }
    >
      {({ selectionMode, allowsRemoving, isSelected }) => {
        const styles = slotsFor(selectionMode, allowsRemoving);
        return (
          <>
            <TagLeading styles={styles} dot={dot} icon={icon} isSelected={isSelected} />
            {children != null ? (
              <span data-slot="label" className={styles.label()}>
                {children}
              </span>
            ) : null}
            {allowsRemoving ? (
              <TagRemoveButton
                label={label}
                labels={mergeLabels<Partial<TagLabels>>({}, group.labels, labels)}
                className={styles.remove()}
              />
            ) : null}
          </>
        );
      }}
    </AriaTag>
  );
}

export function Tag({
  textValue,
  isDisabled,
  onAction,
  href,
  hrefLang,
  target,
  rel,
  download,
  ping,
  referrerPolicy,
  routerOptions,
  labels,
  ...props
}: TagProps) {
  const group = use(TagGroupStyleContext);
  if (!group) return <StaticTag {...props} />;
  const item = {
    textValue,
    isDisabled,
    onAction,
    href,
    hrefLang,
    target,
    rel,
    download,
    ping,
    referrerPolicy,
    routerOptions,
  };
  return <GroupTag {...props} group={group} item={item} labels={labels} />;
}

interface TagGroupListProps<T extends object> extends TagListProps<T> {
  isGroupDisabled?: boolean;
}

function TagGroupList<T extends object>({ isGroupDisabled, ...props }: TagGroupListProps<T>) {
  const gridProps = useSlottedContext(TagListContext);
  const list = <TagList {...props} />;
  if (!isGroupDisabled || !gridProps) return list;
  return (
    <TagListContext value={Object.assign({}, gridProps, { tabIndex: -1 })}>{list}</TagListContext>
  );
}

export interface TagGroupProps<T extends object>
  extends Omit<AriaTagGroupProps, 'children' | 'className' | 'style'>, TagStyleProps {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isInvalid?: boolean;
  isDisabled?: boolean;
  items?: Iterable<T>;
  children?: ReactNode | ((item: T) => ReactNode);
  renderEmptyState?: TagListProps<T>['renderEmptyState'];
  dependencies?: TagListProps<T>['dependencies'];
  labels?: Partial<TagLabels>;
  className?: string;
  style?: CSSProperties;
}

export function TagGroup<T extends object>({
  tone,
  variant = 'tonal',
  size = 'md',
  label,
  description,
  errorMessage,
  isInvalid = false,
  isDisabled,
  items,
  children,
  renderEmptyState,
  dependencies,
  labels,
  className,
  style,
  ...props
}: TagGroupProps<T>) {
  const t = useLabels('tag', defaultTagLabels, labels);
  const styles = tagStyles({ size });
  const context = useMemo(
    () => ({ tone, variant, size, isDisabled, labels }),
    [tone, variant, size, isDisabled, labels],
  );
  const showError = isInvalid && errorMessage != null;

  return (
    <TagGroupStyleContext value={context}>
      <AriaTagGroup
        {...props}
        data-slot="tag-group"
        data-variant={variant}
        data-size={size}
        data-invalid={isInvalid || undefined}
        data-disabled={isDisabled || undefined}
        className={styles.group({ className })}
        style={style}
      >
        {label != null ? (
          <Label data-slot="tag-group-label" className={styles.groupLabel()}>
            <TagGroupStyleContext value={null}>{label}</TagGroupStyleContext>
          </Label>
        ) : null}
        <TagGroupList
          isGroupDisabled={isDisabled}
          items={items}
          dependencies={dependencies}
          renderEmptyState={
            renderEmptyState ??
            (() => (
              <span data-slot="tag-group-empty" className={styles.empty()}>
                {t.empty}
              </span>
            ))
          }
          data-slot="tag-list"
          className={styles.list()}
        >
          {children}
        </TagGroupList>
        {showError ? (
          <Text slot="errorMessage" data-slot="tag-group-error" className={styles.error()}>
            <TagGroupStyleContext value={null}>{errorMessage}</TagGroupStyleContext>
          </Text>
        ) : description != null ? (
          <Text
            slot="description"
            data-slot="tag-group-description"
            className={styles.description()}
          >
            <TagGroupStyleContext value={null}>{description}</TagGroupStyleContext>
          </Text>
        ) : null}
      </AriaTagGroup>
    </TagGroupStyleContext>
  );
}
