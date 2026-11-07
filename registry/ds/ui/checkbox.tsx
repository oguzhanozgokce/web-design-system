'use client';

import {
  createContext,
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import {
  CheckboxButton,
  CheckboxField,
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupStateContext,
  FieldError,
  Label,
  Text,
  composeRenderProps,
  type CheckboxButtonRenderProps,
  type CheckboxFieldProps,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const checkboxStyles = tv({
  slots: {
    root: 'group/checkbox flex flex-col items-start gap-1',
    target: [
      'group/checkbox-target no-tap-highlight inline-flex max-w-full cursor-pointer items-start gap-3 text-sm text-on-surface select-none',
      'data-[readonly]:cursor-default',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    control:
      "relative grid shrink-0 place-items-center after:absolute after:-inset-1 after:content-['']",
    box: [
      'focus-ring relative grid size-(--checkbox-size) place-items-center rounded-md border border-outline bg-surface-raised text-on-primary-solid',
      'transition-[border-color,scale] duration-200 ease-out motion-reduce:transition-none',
      "before:pointer-events-none before:absolute before:-inset-px before:scale-70 before:rounded-[inherit] before:bg-primary-solid before:opacity-0 before:content-['']",
      'before:transition-[scale,opacity,background-color] before:duration-[100ms,200ms,100ms] before:ease-out motion-reduce:before:transition-none',
      'data-[state=checked]:border-primary-solid data-[state=checked]:before:scale-100 data-[state=checked]:before:opacity-100',
      'data-[state=indeterminate]:border-primary-solid data-[state=indeterminate]:before:scale-100 data-[state=indeterminate]:before:opacity-100',
    ],
    mark: 'relative size-(--checkbox-mark) fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]',
    content: 'flex min-w-0 flex-col gap-0.5',
    label: '',
    required: 'ms-0.5 text-error',
    description: 'text-xs text-on-surface-variant',
    error: 'text-xs text-error',
  },
  variants: {
    size: {
      sm: { root: '[--checkbox-mark:0.625rem] [--checkbox-size:1rem]' },
      md: { root: '[--checkbox-mark:0.75rem] [--checkbox-size:1.125rem]' },
    },
    hasContent: {
      true: {
        control: 'mt-[calc((1.25rem-var(--checkbox-size))/2)]',
        error: 'ps-[calc(var(--checkbox-size)+0.75rem)]',
      },
      false: '',
    },
    interactive: {
      true: {
        box: 'group-data-[pressed]/checkbox-target:scale-95 motion-reduce:group-data-[pressed]/checkbox-target:scale-100',
      },
      false: '',
    },
    invalid: {
      true: {
        box: [
          'border-error text-on-error-solid [--focus-color:var(--error)] before:bg-error-solid',
          'data-[state=checked]:border-error-solid data-[state=indeterminate]:border-error-solid',
        ],
      },
      false: '',
    },
    instant: {
      true: { box: 'transition-none before:transition-none' },
      false: '',
    },
  },
  compoundVariants: [
    {
      interactive: true,
      instant: true,
      class: { box: 'group-data-[pressed]/checkbox-target:scale-100' },
    },
    {
      interactive: true,
      invalid: false,
      class: {
        box: [
          'group-data-[hovered]/checkbox-target:border-on-surface-variant',
          'group-data-[hovered]/checkbox-target:data-[state=checked]:border-primary-solid-hover group-data-[hovered]/checkbox-target:data-[state=indeterminate]:border-primary-solid-hover',
          'group-data-[hovered]/checkbox-target:before:bg-primary-solid-hover',
        ],
      },
    },
    {
      interactive: true,
      invalid: true,
      class: { box: 'group-data-[hovered]/checkbox-target:before:bg-error-solid-hover' },
    },
  ],
  defaultVariants: {
    size: 'md',
    hasContent: true,
    interactive: true,
    invalid: false,
    instant: false,
  },
});

const checkMarkStyles = tv({
  base: '[stroke-dasharray:1] transition-[stroke-dashoffset] motion-reduce:transition-none',
  variants: {
    visible: {
      true: '[stroke-dashoffset:0] delay-15 duration-150 ease-linear',
      false: '[stroke-dashoffset:1] duration-0',
    },
    instant: {
      true: 'transition-none',
      false: '',
    },
  },
  defaultVariants: {
    visible: false,
    instant: false,
  },
});

export const checkboxGroupStyles = tv({
  slots: {
    root: 'group/checkbox-group flex flex-col gap-3',
    header: 'flex flex-col gap-1 group-data-[disabled]/checkbox-group:opacity-50',
    label: 'text-sm font-medium text-on-surface',
    required: 'ms-0.5 text-error',
    description: 'text-xs text-on-surface-variant',
    items: 'flex',
    error: 'text-xs text-error',
  },
  variants: {
    orientation: {
      vertical: { items: 'flex-col gap-3' },
      horizontal: { items: 'flex-row flex-wrap gap-x-6 gap-y-3' },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export type CheckboxGroupStyleProps = VariantProps<typeof checkboxGroupStyles>;

export type CheckboxSize = 'sm' | 'md';

export interface CheckboxLabels {
  selectAll: string;
}

export const defaultCheckboxLabels: CheckboxLabels = {
  selectAll: 'Select all',
};

type ErrorMessage = ReactNode | ((validation: ValidationResult) => ReactNode);

const CheckboxGroupRegisterContext = createContext<((value: string) => () => void) | null>(null);
const CheckboxGroupValuesContext = createContext<readonly string[]>([]);
const CheckboxSizeContext = createContext<CheckboxSize | null>(null);

function useCheckboxValueRegistry() {
  const [values, setValues] = useState<readonly string[]>([]);
  const register = useCallback((value: string) => {
    setValues((current) => (current.includes(value) ? current : [...current, value]));
    return () => setValues((current) => current.filter((item) => item !== value));
  }, []);
  return { values, register };
}

function useGroupItemRegistration(value: string | undefined, isLocked: boolean) {
  const register = use(CheckboxGroupRegisterContext);
  const isGroupItem = use(CheckboxGroupStateContext) != null;

  useLayoutEffect(() => {
    if (!register || !isGroupItem || value == null || isLocked) return;
    return register(value);
  }, [register, isGroupItem, value, isLocked]);
}

function labelledByWithDescription(
  props: { 'aria-label'?: string; 'aria-labelledby'?: string },
  labelId: string,
  hasLabel: boolean,
  hasDescription: boolean,
) {
  if (props['aria-labelledby'] != null || props['aria-label'] != null) {
    return props['aria-labelledby'];
  }
  return hasLabel && hasDescription ? labelId : undefined;
}

function useInstantMotion() {
  return useMotionPreference().preference !== 'system';
}

function RequiredMark({ className }: { className: string }) {
  return (
    <span aria-hidden="true" data-slot="required" className={className}>
      *
    </span>
  );
}

function checkState(state: CheckboxButtonRenderProps) {
  if (state.isIndeterminate) return 'indeterminate';
  return state.isSelected ? 'checked' : 'unchecked';
}

interface CheckboxControlProps {
  state: CheckboxButtonRenderProps;
  size: CheckboxSize;
  hasContent: boolean;
  instant: boolean;
}

function CheckboxControl({ state, size, hasContent, instant }: CheckboxControlProps) {
  const styles = checkboxStyles({
    size,
    hasContent,
    interactive: !state.isDisabled && !state.isReadOnly,
    invalid: state.isInvalid,
    instant,
  });
  const current = checkState(state);

  return (
    <span data-slot="control" className={styles.control()}>
      <span
        data-slot="box"
        data-state={current}
        data-focus-visible={state.isFocusVisible || undefined}
        className={styles.box()}
      >
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          focusable="false"
          data-slot="mark"
          className={styles.mark()}
        >
          <path
            d="M2.5 6.25 4.75 8.5 9.5 3.5"
            pathLength={1}
            className={checkMarkStyles({ visible: current === 'checked', instant })}
          />
          <path
            d="M3 6h6"
            pathLength={1}
            className={checkMarkStyles({ visible: current === 'indeterminate', instant })}
          />
        </svg>
      </span>
    </span>
  );
}

export interface CheckboxProps extends Omit<CheckboxFieldProps, 'children' | 'className'> {
  children?: ReactNode;
  description?: ReactNode;
  errorMessage?: ErrorMessage;
  size?: CheckboxSize;
  className?: CheckboxFieldProps['className'];
  ref?: Ref<HTMLDivElement>;
}

export function Checkbox({
  children,
  description,
  errorMessage,
  size: sizeProp,
  className,
  ...props
}: CheckboxProps) {
  const labelId = useId();
  const instant = useInstantMotion();
  const groupSize = use(CheckboxSizeContext);
  useGroupItemRegistration(props.value, Boolean(props.isDisabled || props.isReadOnly));

  const size = sizeProp ?? groupSize ?? 'md';
  const hasLabel = children != null;
  const hasDescription = description != null;
  const hasContent = hasLabel || hasDescription;
  const styles = checkboxStyles({ size, hasContent });

  return (
    <CheckboxField
      {...props}
      aria-labelledby={labelledByWithDescription(props, labelId, hasLabel, hasDescription)}
      data-slot="checkbox"
      data-size={size}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      <CheckboxButton data-slot="target" className={styles.target()}>
        {(state) => (
          <>
            <CheckboxControl state={state} size={size} hasContent={hasContent} instant={instant} />
            {hasContent ? (
              <span data-slot="content" className={styles.content()}>
                {hasLabel ? (
                  <span id={labelId} data-slot="label" className={styles.label()}>
                    {children}
                    {props.isRequired ? <RequiredMark className={styles.required()} /> : null}
                  </span>
                ) : null}
                {hasDescription ? (
                  <Text slot="description" data-slot="description" className={styles.description()}>
                    {description}
                  </Text>
                ) : null}
              </span>
            ) : null}
          </>
        )}
      </CheckboxButton>
      <FieldError data-slot="error" className={styles.error()}>
        {errorMessage}
      </FieldError>
    </CheckboxField>
  );
}

export interface CheckboxGroupProps
  extends Omit<AriaCheckboxGroupProps, 'children' | 'className'>, CheckboxGroupStyleProps {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ErrorMessage;
  size?: CheckboxSize;
  children?: ReactNode;
  className?: AriaCheckboxGroupProps['className'];
  ref?: Ref<HTMLDivElement>;
}

export function CheckboxGroup({
  label,
  description,
  errorMessage,
  orientation,
  size,
  children,
  className,
  ...props
}: CheckboxGroupProps) {
  const { values, register } = useCheckboxValueRegistry();
  const styles = checkboxGroupStyles({ orientation });

  return (
    <AriaCheckboxGroup
      {...props}
      data-slot="checkbox-group"
      data-orientation={orientation ?? 'vertical'}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      <CheckboxGroupRegisterContext value={register}>
        <CheckboxGroupValuesContext value={values}>
          <CheckboxSizeContext value={size ?? null}>
            {label != null || description != null ? (
              <span data-slot="header" className={styles.header()}>
                {label != null ? (
                  <Label data-slot="label" className={styles.label()}>
                    {label}
                    {props.isRequired ? <RequiredMark className={styles.required()} /> : null}
                  </Label>
                ) : null}
                {description != null ? (
                  <Text slot="description" data-slot="description" className={styles.description()}>
                    {description}
                  </Text>
                ) : null}
              </span>
            ) : null}
            <div data-slot="items" className={styles.items()}>
              {children}
            </div>
            <FieldError data-slot="error" className={styles.error()}>
              {errorMessage}
            </FieldError>
          </CheckboxSizeContext>
        </CheckboxGroupValuesContext>
      </CheckboxGroupRegisterContext>
    </AriaCheckboxGroup>
  );
}

export interface SelectAllCheckboxProps extends Omit<
  CheckboxProps,
  | 'value'
  | 'name'
  | 'isSelected'
  | 'defaultSelected'
  | 'isIndeterminate'
  | 'onChange'
  | 'validate'
  | 'validationBehavior'
> {
  labels?: Partial<CheckboxLabels>;
}

export function SelectAllCheckbox({
  children,
  labels,
  isDisabled,
  isReadOnly,
  isInvalid,
  ...props
}: SelectAllCheckboxProps) {
  const t = useLabels('checkbox', defaultCheckboxLabels, labels);
  const state = use(CheckboxGroupStateContext);
  const values = use(CheckboxGroupValuesContext);
  if (!state) throw new Error('SelectAllCheckbox must be rendered inside a CheckboxGroup.');

  const selectedCount = values.filter((value) => state.value.includes(value)).length;
  const isAllSelected = values.length > 0 && selectedCount === values.length;

  function handleChange(isSelected: boolean) {
    if (!state) return;
    state.setValue(
      isSelected
        ? [...new Set([...state.value, ...values])]
        : state.value.filter((value) => !values.includes(value)),
    );
  }

  return (
    <CheckboxGroupStateContext value={null}>
      <Checkbox
        {...props}
        data-select-all=""
        isSelected={isAllSelected}
        isIndeterminate={selectedCount > 0 && !isAllSelected}
        isDisabled={isDisabled || state.isDisabled || values.length === 0}
        isReadOnly={isReadOnly || state.isReadOnly}
        isInvalid={isInvalid ?? state.isInvalid}
        validationBehavior="aria"
        onChange={handleChange}
      >
        {children ?? t.selectAll}
      </Checkbox>
    </CheckboxGroupStateContext>
  );
}
