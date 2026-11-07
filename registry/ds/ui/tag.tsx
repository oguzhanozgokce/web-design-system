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

export type TagVariant = 'soft' | 'solid' | 'outline';

export type TagSize = 'sm' | 'md';

const selectedSolid = {
  neutral:
    'data-[selected]:border-transparent data-[selected]:bg-inverse-surface data-[selected]:text-inverse-on-surface data-[selected]:data-[hovered]:bg-inverse-surface-hover',
  primary:
    'data-[selected]:border-transparent data-[selected]:bg-primary-solid data-[selected]:text-on-primary-solid data-[selected]:data-[hovered]:bg-primary-solid-hover',
  success:
    'data-[selected]:border-transparent data-[selected]:bg-success-solid data-[selected]:text-on-success-solid data-[selected]:data-[hovered]:bg-success-solid-hover',
  warning:
    'data-[selected]:border-transparent data-[selected]:bg-warning-solid data-[selected]:text-on-warning-solid data-[selected]:data-[hovered]:bg-warning-solid-hover',
  error:
    'data-[selected]:border-transparent data-[selected]:bg-error-solid data-[selected]:text-on-error-solid data-[selected]:data-[hovered]:bg-error-solid-hover',
  info: 'data-[selected]:border-transparent data-[selected]:bg-info-solid data-[selected]:text-on-info-solid data-[selected]:data-[hovered]:bg-info-solid-hover',
} satisfies Record<TagTone, string>;

export const tagStyles = tv({
  slots: {
    root: [
      'group/tag relative inline-flex max-w-full shrink-0 cursor-default items-center rounded-control border font-medium align-middle whitespace-nowrap no-underline',
      'transition-control motion-reduce:transition-none',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    interactiveRoot: '',
    leading:
      'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]',
    dot: 'size-1.5 shrink-0 rounded-full',
    label: 'min-w-0 truncate',
    remove: [
      'focus-ring no-tap-highlight relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-current after:absolute [&_svg]:size-(--remove-icon-size)',
      'transition-[background-color] duration-100 ease-out data-[hovered]:bg-current/12 data-[pressed]:bg-current/16',
      'data-[disabled]:cursor-not-allowed',
    ],
    group: 'flex min-w-0 flex-col gap-1.5',
    groupLabel: 'w-fit cursor-default text-sm font-medium text-on-surface',
    list: 'focus-ring flex flex-wrap items-center rounded-item',
    empty: 'text-sm text-on-surface-variant',
    description: 'text-xs text-on-surface-variant',
    error: 'text-xs text-error',
  },
  variants: {
    variant: {
      soft: { root: 'border-transparent', dot: 'bg-current' },
      solid: { root: 'border-transparent', dot: 'bg-current' },
      outline: {
        root: 'border-outline-variant bg-transparent text-on-surface',
        interactiveRoot:
          'data-[hovered]:not-data-[selected]:bg-neutral-soft data-[pressed]:not-data-[selected]:bg-neutral-soft-hover',
      },
    },
    tone: {
      neutral: { root: selectedSolid.neutral },
      primary: { root: selectedSolid.primary },
      success: { root: selectedSolid.success },
      warning: { root: selectedSolid.warning },
      error: { root: selectedSolid.error },
      info: { root: selectedSolid.info },
    },
    size: {
      sm: {
        root: 'h-5 gap-1 px-1.5 text-xs [--icon-size:0.75rem]',
        remove: '-me-0.5 size-3.5 after:-inset-[0.3125rem] [--remove-icon-size:0.625rem]',
        list: 'gap-1',
      },
      md: {
        root: 'h-6 gap-1 px-2 text-xs [--icon-size:0.875rem]',
        remove: '-me-0.5 size-4 after:-inset-1 [--remove-icon-size:0.75rem]',
        list: 'gap-1.5',
      },
    },
    pulse: {
      true: { dot: 'animate-ds-pulse motion-reduce:animate-none' },
      false: '',
    },
    interactive: {
      true: {
        root: 'cursor-pointer data-[pressed]:scale-[0.97] motion-reduce:data-[pressed]:scale-100',
      },
      false: '',
    },
    focusable: {
      true: { root: 'focus-ring no-tap-highlight select-none' },
      false: '',
    },
    removable: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'soft',
      tone: 'neutral',
      class: {
        root: 'bg-neutral-soft text-on-surface',
        interactiveRoot:
          'data-[hovered]:not-data-[selected]:bg-neutral-soft-hover data-[pressed]:not-data-[selected]:bg-neutral-soft-hover',
      },
    },
    {
      variant: 'soft',
      tone: 'primary',
      class: {
        root: 'bg-primary-soft text-on-primary-soft',
        interactiveRoot:
          'data-[hovered]:not-data-[selected]:bg-primary-soft-hover data-[pressed]:not-data-[selected]:bg-primary-soft-hover',
      },
    },
    {
      variant: 'soft',
      tone: 'success',
      class: {
        root: 'bg-success-soft text-on-success-soft',
        interactiveRoot:
          'data-[hovered]:not-data-[selected]:bg-success-soft-hover data-[pressed]:not-data-[selected]:bg-success-soft-hover',
      },
    },
    {
      variant: 'soft',
      tone: 'warning',
      class: {
        root: 'bg-warning-soft text-on-warning-soft',
        interactiveRoot:
          'data-[hovered]:not-data-[selected]:bg-warning-soft-hover data-[pressed]:not-data-[selected]:bg-warning-soft-hover',
      },
    },
    {
      variant: 'soft',
      tone: 'error',
      class: {
        root: 'bg-error-soft text-on-error-soft',
        interactiveRoot:
          'data-[hovered]:not-data-[selected]:bg-error-soft-hover data-[pressed]:not-data-[selected]:bg-error-soft-hover',
      },
    },
    {
      variant: 'soft',
      tone: 'info',
      class: {
        root: 'bg-info-soft text-on-info-soft',
        interactiveRoot:
          'data-[hovered]:not-data-[selected]:bg-info-soft-hover data-[pressed]:not-data-[selected]:bg-info-soft-hover',
      },
    },
    {
      variant: 'solid',
      tone: 'neutral',
      class: {
        root: 'bg-inverse-surface text-inverse-on-surface',
        interactiveRoot:
          'data-[hovered]:bg-inverse-surface-hover data-[pressed]:bg-inverse-surface-hover',
      },
    },
    {
      variant: 'solid',
      tone: 'primary',
      class: {
        root: 'bg-primary-solid text-on-primary-solid',
        interactiveRoot:
          'data-[hovered]:bg-primary-solid-hover data-[pressed]:bg-primary-solid-hover',
      },
    },
    {
      variant: 'solid',
      tone: 'success',
      class: {
        root: 'bg-success-solid text-on-success-solid',
        interactiveRoot:
          'data-[hovered]:bg-success-solid-hover data-[pressed]:bg-success-solid-hover',
      },
    },
    {
      variant: 'solid',
      tone: 'warning',
      class: {
        root: 'bg-warning-solid text-on-warning-solid',
        interactiveRoot:
          'data-[hovered]:bg-warning-solid-hover data-[pressed]:bg-warning-solid-hover',
      },
    },
    {
      variant: 'solid',
      tone: 'error',
      class: {
        root: 'bg-error-solid text-on-error-solid',
        interactiveRoot: 'data-[hovered]:bg-error-solid-hover data-[pressed]:bg-error-solid-hover',
      },
    },
    {
      variant: 'solid',
      tone: 'info',
      class: {
        root: 'bg-info-solid text-on-info-solid',
        interactiveRoot: 'data-[hovered]:bg-info-solid-hover data-[pressed]:bg-info-solid-hover',
      },
    },
    {
      variant: 'outline',
      tone: 'neutral',
      class: {
        dot: 'bg-on-surface-variant',
        leading: 'text-on-surface-variant group-data-[selected]/tag:text-current',
      },
    },
    {
      variant: 'outline',
      tone: 'primary',
      class: { dot: 'bg-primary', leading: 'text-primary group-data-[selected]/tag:text-current' },
    },
    {
      variant: 'outline',
      tone: 'success',
      class: { dot: 'bg-success', leading: 'text-success group-data-[selected]/tag:text-current' },
    },
    {
      variant: 'outline',
      tone: 'warning',
      class: { dot: 'bg-warning', leading: 'text-warning group-data-[selected]/tag:text-current' },
    },
    {
      variant: 'outline',
      tone: 'error',
      class: { dot: 'bg-error', leading: 'text-error group-data-[selected]/tag:text-current' },
    },
    {
      variant: 'outline',
      tone: 'info',
      class: { dot: 'bg-info', leading: 'text-info group-data-[selected]/tag:text-current' },
    },
    { removable: true, size: 'sm', class: { root: 'pe-1' } },
    { removable: true, size: 'md', class: { root: 'pe-1' } },
  ],
  defaultVariants: {
    variant: 'soft',
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
  variant = 'soft',
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
      interactive: isInteractive(selectionMode),
      focusable: true,
      removable: allowsRemoving,
    });
  }

  function isInteractive(selectionMode: 'none' | 'single' | 'multiple') {
    return selectionMode !== 'none' || hasAction;
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
      className={({ selectionMode, allowsRemoving }) => {
        const styles = slotsFor(selectionMode, allowsRemoving);
        return styles.root({
          className: [isInteractive(selectionMode) ? styles.interactiveRoot() : '', className],
        });
      }}
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
  variant = 'soft',
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
