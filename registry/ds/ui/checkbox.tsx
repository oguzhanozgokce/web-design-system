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
    target:
      'inline-flex max-w-full cursor-default items-start gap-3 text-on-surface select-none data-[disabled]:text-on-surface/38',
    control: 'relative grid size-4.5 shrink-0 place-items-center',
    stateLayer: 'state-layer focus-ring absolute -inset-2.75 rounded-full',
    box: 'relative size-4.5 rounded-[2px] border-2 transition-[background-color,border-color] duration-150 ease-standard motion-reduce:transition-none',
    mark: 'absolute -inset-0.5 size-4.5 fill-none stroke-current stroke-2',
    content: 'flex min-w-0 flex-col gap-0.5',
    label: 'text-body-lg',
    required: 'ms-0.5 text-error',
    description:
      'text-body-md text-on-surface-variant group-data-[disabled]/checkbox:text-on-surface/38',
    error: 'text-body-sm text-error',
  },
  variants: {
    tone: {
      default: '',
      invalid: '',
      disabled: '',
    },
    filled: {
      true: '',
      false: { box: 'bg-transparent' },
    },
    hasContent: {
      true: { control: 'mt-0.75', error: 'ps-7.5' },
      false: '',
    },
    instant: {
      true: { box: 'transition-none' },
      false: '',
    },
  },
  compoundVariants: [
    {
      tone: 'default',
      filled: false,
      class: { box: 'border-on-surface-variant', stateLayer: 'text-on-surface' },
    },
    {
      tone: 'default',
      filled: true,
      class: { box: 'border-primary bg-primary text-on-primary', stateLayer: 'text-primary' },
    },
    { tone: 'invalid', filled: false, class: { box: 'border-error', stateLayer: 'text-error' } },
    {
      tone: 'invalid',
      filled: true,
      class: { box: 'border-error bg-error text-on-error', stateLayer: 'text-error' },
    },
    { tone: 'disabled', filled: false, class: { box: 'border-on-surface/38' } },
    {
      tone: 'disabled',
      filled: true,
      class: { box: 'border-transparent bg-on-surface/38 text-surface' },
    },
  ],
  defaultVariants: {
    tone: 'default',
    filled: false,
    hasContent: true,
    instant: false,
  },
});

const checkMarkStyles = tv({
  base: '[stroke-dasharray:1] transition-[stroke-dashoffset] motion-reduce:transition-none',
  variants: {
    visible: {
      true: '[stroke-dashoffset:0] duration-(--ds-duration-effect) ease-effect',
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
    header: 'flex flex-col gap-0.5',
    label: 'text-title-sm text-on-surface group-data-[disabled]/checkbox-group:text-on-surface/38',
    required: 'ms-0.5 text-error',
    description:
      'text-body-sm text-on-surface-variant group-data-[disabled]/checkbox-group:text-on-surface/38',
    items: 'flex',
    error: 'text-body-sm text-error',
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

export interface CheckboxLabels {
  selectAll: string;
}

export const defaultCheckboxLabels: CheckboxLabels = {
  selectAll: 'Select all',
};

type CheckboxTone = 'default' | 'invalid' | 'disabled';

type ErrorMessage = ReactNode | ((validation: ValidationResult) => ReactNode);

const CheckboxGroupRegisterContext = createContext<((value: string) => () => void) | null>(null);
const CheckboxGroupValuesContext = createContext<readonly string[]>([]);

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

function checkboxTone({ isDisabled, isInvalid }: CheckboxButtonRenderProps): CheckboxTone {
  if (isDisabled) return 'disabled';
  return isInvalid ? 'invalid' : 'default';
}

interface CheckboxControlProps {
  state: CheckboxButtonRenderProps;
  hasContent: boolean;
  instant: boolean;
}

function CheckboxControl({ state, hasContent, instant }: CheckboxControlProps) {
  const filled = state.isSelected || state.isIndeterminate;
  const styles = checkboxStyles({ tone: checkboxTone(state), filled, hasContent, instant });

  return (
    <span data-slot="control" className={styles.control()}>
      <span
        aria-hidden="true"
        data-slot="state-layer"
        data-hovered={state.isHovered || undefined}
        data-pressed={state.isPressed || undefined}
        data-focus-visible={state.isFocusVisible || undefined}
        data-disabled={state.isDisabled || state.isReadOnly || undefined}
        className={styles.stateLayer()}
      />
      <span
        data-slot="box"
        data-state={
          state.isIndeterminate ? 'indeterminate' : state.isSelected ? 'checked' : 'unchecked'
        }
        className={styles.box()}
      >
        <svg
          viewBox="0 0 18 18"
          aria-hidden="true"
          focusable="false"
          data-slot="mark"
          className={styles.mark()}
        >
          <path
            d="M4.5 9.5 7.5 12.5 13.5 6.5"
            pathLength={1}
            className={checkMarkStyles({
              visible: state.isSelected && !state.isIndeterminate,
              instant,
            })}
          />
          <path
            d="M5 9h8"
            pathLength={1}
            className={checkMarkStyles({ visible: state.isIndeterminate, instant })}
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
  className?: CheckboxFieldProps['className'];
  ref?: Ref<HTMLDivElement>;
}

export function Checkbox({
  children,
  description,
  errorMessage,
  className,
  ...props
}: CheckboxProps) {
  const labelId = useId();
  const instant = useInstantMotion();
  useGroupItemRegistration(props.value, Boolean(props.isDisabled || props.isReadOnly));

  const hasLabel = children != null;
  const hasDescription = description != null;
  const hasContent = hasLabel || hasDescription;
  const styles = checkboxStyles({ hasContent });

  return (
    <CheckboxField
      {...props}
      aria-labelledby={labelledByWithDescription(props, labelId, hasLabel, hasDescription)}
      data-slot="checkbox"
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      <CheckboxButton data-slot="target" className={styles.target()}>
        {(state) => (
          <>
            <CheckboxControl state={state} hasContent={hasContent} instant={instant} />
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
  children?: ReactNode;
  className?: AriaCheckboxGroupProps['className'];
  ref?: Ref<HTMLDivElement>;
}

export function CheckboxGroup({
  label,
  description,
  errorMessage,
  orientation,
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
