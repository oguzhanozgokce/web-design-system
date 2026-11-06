'use client';

import { use, useCallback, useMemo, useRef, useState, type ReactNode, type Ref } from 'react';
import {
  ComboBox as AriaComboBox,
  ComboBoxStateContext,
  ComboBoxValue,
  ProgressBar,
  composeRenderProps,
  useFilter,
  useLocale,
  type ComboBoxProps as AriaComboBoxProps,
  type ListBoxRenderProps,
} from 'react-aria-components';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { cn, tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import {
  Field,
  FieldAdornment,
  FieldButton,
  FieldGroup,
  FieldInput,
  fieldStyles,
  type FieldBaseProps,
  type FieldLabels,
} from '@/registry/ds/ui/field';
import {
  ListBox,
  ListBoxKeywordsContext,
  ListBoxStatus,
  type ListBoxKeywordIndex,
  type ListBoxProps,
} from '@/registry/ds/ui/list-box';
import { Popover } from '@/registry/ds/ui/popover';
import { Spinner } from '@/registry/ds/ui/spinner';

export type ComboBoxSelectionMode = 'single' | 'multiple';

export interface ComboBoxLabels {
  noResults: string;
  loading: string;
  clear: string;
  showSuggestions: string;
  selectedCount: LabelTemplate<{ count: string }>;
}

export const defaultComboBoxLabels: ComboBoxLabels = {
  noResults: 'No results',
  loading: 'Loading…',
  clear: 'Clear',
  showSuggestions: 'Show suggestions',
  selectedCount: '{count} selected',
};

export const comboBoxStyles = tv({
  slots: {
    count: [
      'ms-1 inline-flex h-6 shrink-0 items-center rounded-sm px-2 text-label-md whitespace-nowrap tabular-digits [unicode-bidi:plaintext] select-none',
      'bg-secondary-container text-on-secondary-container',
      'group-data-[disabled]/control:bg-on-surface/12 group-data-[disabled]/control:text-current',
    ],
    value: 'sr-only',
    loading:
      'ms-1 flex shrink-0 items-center justify-center text-primary [&_svg]:size-(--icon-size)',
    arrow: 'group-data-[open]/combo-box:rotate-180',
    popover: 'flex min-w-[min(var(--trigger-width),calc(100vw-1.5rem))] flex-col',
    list: 'max-h-[inherit]',
  },
  variants: {
    animated: {
      true: {
        arrow:
          'transition-[rotate] duration-(--ds-duration-spatial-fast) ease-spatial-fast motion-reduce:transition-none',
      },
      false: {},
    },
  },
  defaultVariants: {
    animated: true,
  },
});

export interface ComboBoxProps<
  T extends object = object,
  M extends ComboBoxSelectionMode = 'single',
>
  extends Omit<AriaComboBoxProps<T, M>, 'children' | 'className'>, FieldBaseProps {
  children: ReactNode | ((item: T) => ReactNode);
  dependencies?: ReadonlyArray<unknown>;
  placeholder?: string;
  startAdornment?: ReactNode;
  isLoading?: boolean;
  isClearable?: boolean;
  onClear?: () => void;
  renderEmptyState?: ListBoxProps<T>['renderEmptyState'];
  inputRef?: Ref<HTMLInputElement>;
  labels?: Partial<ComboBoxLabels & FieldLabels>;
  className?: AriaComboBoxProps<T, M>['className'];
}

interface ComboBoxSelectionProps {
  labels?: Partial<ComboBoxLabels>;
}

function ComboBoxSelection({ labels }: ComboBoxSelectionProps) {
  const state = use(ComboBoxStateContext);
  const t = useLabels('comboBox', defaultComboBoxLabels, labels);
  const { locale } = useLocale();
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const styles = comboBoxStyles();
  const count = state?.selectionManager.selectedKeys.size ?? 0;

  return (
    <>
      <ComboBoxValue data-slot="selected-value" className={styles.value()} />
      {count > 0 ? (
        <span aria-hidden="true" data-slot="selected-count" className={styles.count()}>
          {t.format('selectedCount', { count: formatter.format(count) })}
        </span>
      ) : null}
    </>
  );
}

interface ComboBoxClearButtonProps {
  onClear?: () => void;
  focusInput: () => void;
  labels?: Partial<ComboBoxLabels>;
}

function ComboBoxClearButton({ onClear, focusInput, labels }: ComboBoxClearButtonProps) {
  const state = use(ComboBoxStateContext);
  const t = useLabels('comboBox', defaultComboBoxLabels, labels);
  const icons = useIcons();

  if (!state) return null;
  if (state.inputValue === '' && state.selectionManager.isEmpty) return null;

  function clear() {
    state?.setValue(null);
    state?.setInputValue('');
    onClear?.();
    focusInput();
  }

  return (
    <FieldButton
      slot={null}
      aria-label={t.clear}
      excludeFromTabOrder
      preventFocusOnPress
      onPress={clear}
      data-slot="clear-button"
    >
      <icons.close />
    </FieldButton>
  );
}

export function ComboBox<T extends object = object, M extends ComboBoxSelectionMode = 'single'>({
  label,
  isLabelHidden,
  description,
  errorMessage,
  necessityIndicator,
  size = 'md',
  variant = 'outlined',
  children,
  dependencies,
  placeholder,
  startAdornment,
  isLoading = false,
  isClearable = true,
  onClear,
  renderEmptyState,
  inputRef,
  labels,
  defaultFilter,
  allowsEmptyCollection = true,
  className,
  ...props
}: ComboBoxProps<T, M>) {
  const t = useLabels('comboBox', defaultComboBoxLabels, labels);
  const icons = useIcons();
  const groupRef = useRef<HTMLDivElement>(null);
  const [keywordIndex] = useState<ListBoxKeywordIndex>(() => new Map());
  const { contains } = useFilter({ sensitivity: 'base' });
  const { spatialEnabled } = useMotionPreference();
  const { direction } = useLocale();
  const field = fieldStyles({ size, variant });
  const styles = comboBoxStyles({ animated: spatialEnabled });
  const canClear = isClearable && !props.isDisabled && !props.isReadOnly;
  const isMultiple = props.selectionMode === 'multiple';

  const matchesTextOrKeywords = useCallback(
    (textValue: string, inputValue: string) =>
      contains(textValue, inputValue) ||
      (keywordIndex.get(textValue) ?? []).some((keyword) => contains(keyword, inputValue)),
    [contains, keywordIndex],
  );

  function focusInput() {
    groupRef.current?.querySelector('input')?.focus();
  }

  function emptyState(renderProps: ListBoxRenderProps) {
    if (isLoading) {
      return <ListBoxStatus icon={<Spinner className="text-primary" />}>{t.loading}</ListBoxStatus>;
    }
    if (renderEmptyState) return renderEmptyState(renderProps);
    return <ListBoxStatus>{t.noResults}</ListBoxStatus>;
  }

  return (
    <ListBoxKeywordsContext value={keywordIndex}>
      <AriaComboBox<T, M>
        {...props}
        defaultFilter={defaultFilter ?? matchesTextOrKeywords}
        allowsEmptyCollection={allowsEmptyCollection}
        data-slot="combo-box"
        data-size={size}
        data-variant={variant}
        data-loading={isLoading || undefined}
        className={composeRenderProps(className, (className) =>
          field.root({ className: cn('group/combo-box', className) }),
        )}
      >
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
          <FieldGroup ref={groupRef} isReadOnly={props.isReadOnly}>
            {startAdornment != null ? (
              <FieldAdornment placement="start">{startAdornment}</FieldAdornment>
            ) : null}
            <FieldInput ref={inputRef} placeholder={placeholder} />
            {isMultiple ? <ComboBoxSelection labels={labels} /> : null}
            {isLoading ? (
              <ProgressBar
                isIndeterminate
                aria-label={t.loading}
                data-slot="loading"
                className={styles.loading()}
              >
                <Spinner />
              </ProgressBar>
            ) : null}
            {canClear ? (
              <ComboBoxClearButton onClear={onClear} focusInput={focusInput} labels={labels} />
            ) : null}
            <FieldButton aria-label={t.showSuggestions} data-slot="trigger">
              <icons.arrowDropDown className={styles.arrow()} />
            </FieldButton>
          </FieldGroup>
          <Popover dir={direction} offset={4} maxHeight={320} className={styles.popover()}>
            <ListBox<T>
              dependencies={dependencies}
              density={size === 'sm' ? 'sm' : 'md'}
              renderEmptyState={emptyState}
              className={styles.list()}
            >
              {children}
            </ListBox>
          </Popover>
        </Field>
      </AriaComboBox>
    </ListBoxKeywordsContext>
  );
}
