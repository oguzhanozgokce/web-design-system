'use client';

import { useMemo, type ReactNode } from 'react';
import {
  Button as AriaButton,
  Select as AriaSelect,
  SelectValue,
  composeRenderProps,
  useLocale,
  type SelectProps as AriaSelectProps,
  type SelectValueRenderProps,
} from 'react-aria-components';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { cn, tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import {
  Field,
  FieldAdornment,
  fieldStyles,
  type FieldBaseProps,
  type FieldLabels,
} from '@/registry/ds/ui/field';
import {
  ListBox,
  ListBoxStatus,
  ListBoxValueContext,
  type ListBoxProps,
} from '@/registry/ds/ui/list-box';
import { Popover } from '@/registry/ds/ui/popover';
import { Spinner } from '@/registry/ds/ui/spinner';

export type SelectSelectionMode = 'single' | 'multiple';

export type SelectValueDisplay = 'text' | 'count' | 'chips';

export interface SelectLabels {
  placeholder: string;
  empty: string;
  loading: string;
  selectedCount: LabelTemplate<{ count: string }>;
  moreCount: LabelTemplate<{ count: string }>;
}

export const defaultSelectLabels: SelectLabels = {
  placeholder: 'Select an option',
  empty: 'No options',
  loading: 'Loading…',
  selectedCount: '{count} selected',
  moreCount: '+{count}',
};

export const selectStyles = tv({
  slots: {
    trigger: 'no-tap-highlight cursor-pointer text-start',
    value: 'block min-w-0 flex-1 truncate data-[placeholder]:text-on-surface-variant',
    chips: 'flex min-w-0 items-center gap-1 overflow-hidden',
    chip: 'inline-flex h-6 max-w-40 min-w-0 items-center rounded-control bg-neutral-soft px-2 text-xs font-medium text-on-surface [unicode-bidi:plaintext]',
    more: 'inline-flex h-6 shrink-0 items-center rounded-control border border-outline-variant px-1.5 text-xs font-medium text-on-surface-variant tabular-digits [unicode-bidi:plaintext]',
    indicator:
      '-me-1 ms-1 flex shrink-0 items-center justify-center text-on-surface-variant [&_svg]:size-(--icon-size)',
    arrow: 'group-data-[open]/select:rotate-180',
    popover:
      'flex min-w-[min(var(--trigger-width),calc(100vw-1.5rem))] flex-col border border-outline-subtle [--ds-popover-scale:0.95]',
    list: 'max-h-[inherit]',
  },
  variants: {
    variant: {
      outline: {
        trigger:
          'data-[pressed]:not-data-[invalid]:border-primary data-[pressed]:inset-ring-2 data-[pressed]:not-data-[invalid]:inset-ring-primary/20 data-[pressed]:data-[invalid]:inset-ring-error/20',
      },
      soft: {
        trigger:
          'data-[pressed]:not-data-[invalid]:border-primary data-[pressed]:not-data-[invalid]:bg-surface-raised data-[pressed]:inset-ring-2 data-[pressed]:not-data-[invalid]:inset-ring-primary/20 data-[pressed]:data-[invalid]:inset-ring-error/20',
      },
    },
    animated: {
      true: {
        arrow: 'transition-[rotate] duration-150 ease-out motion-reduce:transition-none',
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'outline',
    animated: true,
  },
});

export type SelectVariant = 'outline' | 'soft';

export interface SelectProps<T extends object = object, M extends SelectSelectionMode = 'single'>
  extends Omit<AriaSelectProps<T, M>, 'children' | 'className' | 'placeholder'>, FieldBaseProps {
  items?: Iterable<T>;
  children: ReactNode | ((item: T) => ReactNode);
  dependencies?: ReadonlyArray<unknown>;
  placeholder?: string;
  startAdornment?: ReactNode;
  isLoading?: boolean;
  onLoadMore?: () => void;
  valueDisplay?: SelectValueDisplay;
  maxChips?: number;
  renderEmptyState?: ListBoxProps<T>['renderEmptyState'];
  labels?: Partial<SelectLabels & FieldLabels>;
  className?: AriaSelectProps<T, M>['className'];
}

interface SelectValueContentProps<T> {
  values: SelectValueRenderProps<T> & { defaultChildren: ReactNode };
  placeholder?: string;
  valueDisplay: SelectValueDisplay;
  maxChips: number;
  labels?: Partial<SelectLabels>;
}

function SelectValueContent<T>({
  values,
  placeholder,
  valueDisplay,
  maxChips,
  labels,
}: SelectValueContentProps<T>) {
  const t = useLabels('select', defaultSelectLabels, labels);
  const { locale } = useLocale();
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const styles = selectStyles();
  const { isPlaceholder, selectedText, state, defaultChildren } = values;

  if (isPlaceholder) return placeholder ?? t.placeholder;

  if (state.selectionManager.selectionMode !== 'multiple') {
    return <ListBoxValueContext value>{defaultChildren}</ListBoxValueContext>;
  }

  const count = state.selectedItems.length;

  if (valueDisplay === 'count') {
    return (
      <>
        <span data-slot="count" className="[unicode-bidi:plaintext]">
          {t.format('selectedCount', { count: formatter.format(count) })}
        </span>{' '}
        <span className="sr-only">{selectedText}</span>
      </>
    );
  }

  if (valueDisplay === 'chips') {
    const visible = state.selectedItems.slice(0, Math.max(1, maxChips));
    const rest = count - visible.length;
    return (
      <>
        <span aria-hidden="true" data-slot="chips" className={styles.chips()}>
          {visible.map((item) => (
            <span key={item.key} data-slot="chip" className={styles.chip()}>
              <span className="truncate">{item.textValue}</span>
            </span>
          ))}
          {rest > 0 ? (
            <span data-slot="more" className={styles.more()}>
              {t.format('moreCount', { count: formatter.format(rest) })}
            </span>
          ) : null}
        </span>
        <span className="sr-only">{selectedText}</span>
      </>
    );
  }

  return selectedText;
}

export function Select<T extends object = object, M extends SelectSelectionMode = 'single'>({
  label,
  isLabelHidden,
  description,
  errorMessage,
  necessityIndicator,
  size = 'md',
  variant = 'outline',
  items,
  children,
  dependencies,
  placeholder,
  startAdornment,
  isLoading = false,
  onLoadMore,
  valueDisplay = 'text',
  maxChips = 2,
  renderEmptyState,
  labels,
  allowsEmptyCollection = true,
  className,
  ...props
}: SelectProps<T, M>) {
  const t = useLabels('select', defaultSelectLabels, labels);
  const icons = useIcons();
  const { spatialEnabled } = useMotionPreference();
  const { direction } = useLocale();
  const field = fieldStyles({ size, variant });
  const styles = selectStyles({ variant, animated: spatialEnabled });

  return (
    <AriaSelect<T, M>
      {...props}
      placeholder={placeholder}
      allowsEmptyCollection={allowsEmptyCollection}
      data-slot="select"
      data-size={size}
      data-variant={variant}
      data-loading={isLoading || undefined}
      className={composeRenderProps(className, (className) =>
        field.root({ className: cn('group/select', className) }),
      )}
    >
      {({ isInvalid }) => (
        <Field
          label={label}
          isLabelHidden={isLabelHidden}
          description={description}
          errorMessage={errorMessage}
          necessityIndicator={necessityIndicator}
          isRequired={props.isRequired}
          size={size}
          variant={variant}
          labels={labels}
        >
          <AriaButton
            data-slot="trigger"
            data-invalid={isInvalid || undefined}
            className={field.container({ className: styles.trigger() })}
          >
            {startAdornment != null ? (
              <FieldAdornment placement="start">{startAdornment}</FieldAdornment>
            ) : null}
            <SelectValue<T> data-slot="value" className={styles.value()}>
              {(values) => (
                <SelectValueContent
                  values={values}
                  placeholder={placeholder}
                  valueDisplay={valueDisplay}
                  maxChips={maxChips}
                  labels={labels}
                />
              )}
            </SelectValue>
            <span aria-hidden="true" data-slot="indicator" className={styles.indicator()}>
              {isLoading ? <Spinner /> : <icons.chevronDown className={styles.arrow()} />}
            </span>
          </AriaButton>
          <Popover dir={direction} offset={4} maxHeight={320} className={styles.popover()}>
            <ListBox<T>
              items={items}
              dependencies={dependencies}
              density={size === 'sm' ? 'sm' : 'md'}
              isLoading={isLoading}
              onLoadMore={onLoadMore}
              labels={{ loading: t.loading }}
              renderEmptyState={
                renderEmptyState ?? (() => <ListBoxStatus>{t.empty}</ListBoxStatus>)
              }
              className={styles.list()}
            >
              {children}
            </ListBox>
          </Popover>
        </Field>
      )}
    </AriaSelect>
  );
}
