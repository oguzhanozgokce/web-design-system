'use client';

import { createContext, use, type ComponentProps, type ReactNode } from 'react';
import {
  Collection,
  Header,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxLoadMoreItem,
  ListBoxSection as AriaListBoxSection,
  composeRenderProps,
  type ListBoxItemProps as AriaListBoxItemProps,
  type ListBoxProps as AriaListBoxProps,
  type ListBoxRenderProps,
  type ListBoxSectionProps as AriaListBoxSectionProps,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';

export const listBoxStyles = tv({
  slots: {
    root: [
      'group/list-box focus-ring-inset flex min-h-0 flex-col gap-0.5 overflow-auto rounded-md p-1 text-on-surface not-data-[focus-visible]:outline-none',
      'data-[empty]:justify-center',
    ],
    section: [
      'flex flex-col gap-0.5',
      'not-first:mt-1 not-first:border-t not-first:border-outline-variant not-first:pt-1',
    ],
    header: 'px-(--list-box-item-px) pt-2 pb-1 text-label-md text-on-surface-variant select-none',
    item: [
      'group/item state-layer focus-ring-inset relative flex min-h-(--list-box-item-height) cursor-default items-center gap-(--list-box-item-gap) rounded-sm px-(--list-box-item-px) py-(--list-box-item-py)',
      'text-start text-on-surface no-underline select-none not-data-[focus-visible]:outline-none',
      'transition-colors duration-150 ease-standard motion-reduce:transition-none',
      'data-[selected]:bg-secondary-container data-[selected]:text-on-secondary-container',
      'data-[disabled]:text-on-surface/38 data-[disabled]:data-[selected]:bg-on-surface/12 data-[disabled]:data-[selected]:text-on-surface/38',
      'forced-colors:data-[focus-visible]:outline-[Highlight] forced-colors:data-[selected]:outline-1 forced-colors:data-[selected]:outline-[Highlight]',
    ],
    avatar:
      'flex size-(--list-box-avatar-size) shrink-0 items-center justify-center group-data-[disabled]/control:opacity-38 group-data-[disabled]/item:opacity-38 [&>*]:size-full!',
    icon: [
      'inline-flex shrink-0 items-center justify-center text-(length:--icon-size) text-on-surface-variant [&_svg]:size-[1em]',
      'group-data-[selected]/item:text-current group-data-[disabled]/control:text-current group-data-[disabled]/item:text-current',
    ],
    content: 'flex min-w-0 flex-1 flex-col',
    label: 'text-body-lg [overflow-wrap:anywhere] pointer-fine:text-body-md',
    description: [
      'text-body-sm [overflow-wrap:anywhere] text-on-surface-variant',
      'group-data-[selected]/item:text-current group-data-[disabled]/item:text-current',
    ],
    check:
      'inline-flex size-(--icon-size) shrink-0 items-center justify-center text-(length:--icon-size) [&_svg]:size-[1em]',
    status:
      'flex min-h-(--list-box-item-height) items-center justify-center gap-2 px-(--list-box-item-px) py-4 text-center text-body-md text-on-surface-variant [&_svg]:size-(--icon-size) [&_svg]:shrink-0',
    loader:
      'flex min-h-(--list-box-item-height) items-center justify-center gap-2 px-(--list-box-item-px) text-body-md text-on-surface-variant outline-none',
  },
  variants: {
    density: {
      sm: {
        root: '[--icon-size:1.125rem] [--list-box-avatar-size:1.5rem] [--list-box-item-gap:0.5rem] [--list-box-item-height:2rem] [--list-box-item-px:0.625rem] [--list-box-item-py:0.25rem]',
      },
      md: {
        root: '[--icon-size:1.25rem] [--list-box-avatar-size:2rem] [--list-box-item-gap:0.75rem] [--list-box-item-height:2.5rem] [--list-box-item-px:0.75rem] [--list-box-item-py:0.5rem]',
      },
    },
    variant: {
      plain: {},
      outlined: { root: 'border border-outline-variant bg-surface' },
    },
  },
  defaultVariants: {
    density: 'md',
    variant: 'plain',
  },
});

export type ListBoxStyleProps = VariantProps<typeof listBoxStyles>;

export type ListBoxDensity = 'sm' | 'md';

export type ListBoxVariant = 'plain' | 'outlined';

export interface ListBoxLabels {
  empty: string;
  loading: string;
}

export const defaultListBoxLabels: ListBoxLabels = {
  empty: 'No items',
  loading: 'Loading…',
};

export const ListBoxValueContext = createContext(false);

export type ListBoxKeywordIndex = Map<string, readonly string[]>;

export const ListBoxKeywordsContext = createContext<ListBoxKeywordIndex | null>(null);

export interface ListBoxStatusProps extends ComponentProps<'div'> {
  icon?: ReactNode;
}

export function ListBoxStatus({ icon, className, children, ...props }: ListBoxStatusProps) {
  return (
    <div {...props} data-slot="list-box-status" className={listBoxStyles().status({ className })}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

export interface ListBoxProps<T extends object>
  extends Omit<AriaListBoxProps<T>, 'className'>, ListBoxStyleProps {
  isLoading?: boolean;
  onLoadMore?: () => void;
  labels?: Partial<ListBoxLabels>;
  className?: AriaListBoxProps<T>['className'];
}

export function ListBox<T extends object>({
  density = 'md',
  variant = 'plain',
  isLoading,
  onLoadMore,
  items,
  dependencies,
  children,
  renderEmptyState,
  labels,
  className,
  ...props
}: ListBoxProps<T>) {
  const t = useLabels('listBox', defaultListBoxLabels, labels);
  const styles = listBoxStyles({ density, variant });
  const hasLoader = isLoading != null || onLoadMore != null;

  function emptyState(renderProps: ListBoxRenderProps) {
    if (renderEmptyState) return renderEmptyState(renderProps);
    return <ListBoxStatus>{t.empty}</ListBoxStatus>;
  }

  return (
    <AriaListBox
      {...props}
      items={hasLoader ? undefined : items}
      dependencies={hasLoader ? undefined : dependencies}
      renderEmptyState={isLoading ? undefined : emptyState}
      data-slot="list-box"
      data-density={density}
      data-variant={variant}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      {hasLoader ? (
        <>
          <Collection items={items} dependencies={dependencies}>
            {children}
          </Collection>
          <ListBoxLoadMoreItem
            isLoading={isLoading}
            onLoadMore={onLoadMore}
            data-slot="list-box-loader"
            className={styles.loader()}
          >
            <Spinner className="text-(length:--icon-size) text-primary" />
            <span>{t.loading}</span>
          </ListBoxLoadMoreItem>
        </>
      ) : (
        children
      )}
    </AriaListBox>
  );
}

export interface ListBoxSectionProps<T extends object> extends Omit<
  AriaListBoxSectionProps<T>,
  'className'
> {
  title?: ReactNode;
  className?: string;
}

export function ListBoxSection<T extends object>({
  title,
  items,
  dependencies,
  children,
  className,
  ...props
}: ListBoxSectionProps<T>) {
  const styles = listBoxStyles();

  return (
    <AriaListBoxSection
      {...props}
      data-slot="list-box-section"
      className={styles.section({ className })}
    >
      {title != null ? (
        <Header data-slot="list-box-header" className={styles.header()}>
          {title}
        </Header>
      ) : null}
      <Collection items={items} dependencies={dependencies}>
        {children}
      </Collection>
    </AriaListBoxSection>
  );
}

export interface ListBoxItemProps<T extends object = object> extends Omit<
  AriaListBoxItemProps<T>,
  'children' | 'className'
> {
  children?: ReactNode;
  description?: ReactNode;
  startIcon?: ReactNode;
  avatar?: ReactNode;
  keywords?: readonly string[];
  className?: AriaListBoxItemProps<T>['className'];
}

interface ListBoxItemContentProps {
  children?: ReactNode;
  description?: ReactNode;
  startIcon?: ReactNode;
  avatar?: ReactNode;
  isSelected: boolean;
  hasSelection: boolean;
}

function ListBoxItemContent({
  children,
  description,
  startIcon,
  avatar,
  isSelected,
  hasSelection,
}: ListBoxItemContentProps) {
  const isValue = use(ListBoxValueContext);
  const icons = useIcons();
  const styles = listBoxStyles();

  const leading = (
    <>
      {avatar != null ? (
        <span aria-hidden="true" data-slot="avatar" className={styles.avatar()}>
          {avatar}
        </span>
      ) : null}
      {startIcon != null ? (
        <span aria-hidden="true" data-slot="start-icon" className={styles.icon()}>
          {startIcon}
        </span>
      ) : null}
    </>
  );

  if (isValue) {
    return (
      <span
        data-slot="list-box-value"
        className="flex min-w-0 items-center gap-(--field-gap) [--list-box-avatar-size:1.5rem]"
      >
        {leading}
        <span className="truncate">{children}</span>
      </span>
    );
  }

  return (
    <>
      {leading}
      <span data-slot="content" className={styles.content()}>
        <span data-slot="label" className={styles.label()}>
          {children}
        </span>
        {description != null ? (
          <span data-slot="description" className={styles.description()}>
            {description}
          </span>
        ) : null}
      </span>
      {hasSelection ? (
        <span aria-hidden="true" data-slot="check" className={styles.check()}>
          {isSelected ? <icons.check /> : null}
        </span>
      ) : null}
    </>
  );
}

function plainText(children: ReactNode): string | undefined {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (!Array.isArray(children)) return undefined;
  const parts = children.map(plainText);
  return parts.every((part) => part != null) ? parts.join('') : undefined;
}

export function ListBoxItem<T extends object = object>({
  children,
  description,
  startIcon,
  avatar,
  keywords,
  textValue: textValueProp,
  className,
  ...props
}: ListBoxItemProps<T>) {
  const keywordIndex = use(ListBoxKeywordsContext);
  const textValue = textValueProp ?? plainText(children);
  if (keywordIndex && textValue != null) keywordIndex.set(textValue, keywords ?? []);
  const styles = listBoxStyles();

  return (
    <AriaListBoxItem
      {...props}
      textValue={textValue}
      data-slot="list-box-item"
      className={composeRenderProps(className, (className) => styles.item({ className }))}
    >
      {({ isSelected, selectionMode }) => (
        <ListBoxItemContent
          description={description}
          startIcon={startIcon}
          avatar={avatar}
          isSelected={isSelected}
          hasSelection={selectionMode !== 'none'}
        >
          {children}
        </ListBoxItemContent>
      )}
    </AriaListBoxItem>
  );
}
