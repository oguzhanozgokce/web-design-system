'use client';

import { useId, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import {
  Button as AriaButton,
  ButtonContext,
  NumberField as AriaNumberField,
  composeRenderProps,
  useLocale,
  useSlottedContext,
  type NumberFieldProps as AriaNumberFieldProps,
} from 'react-aria-components';
import { formatLabel, type LabelTemplate } from '@/registry/ds/lib/labels';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import {
  Field,
  FieldGroup,
  FieldInput,
  fieldStyles,
  type FieldBaseProps,
  type FieldLabels,
  type FieldSize,
} from '@/registry/ds/ui/field';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

export const numberFieldStyles = tv({
  slots: {
    container: 'gap-0 overflow-hidden',
    value: 'relative flex min-w-0 flex-1 self-stretch',
    input: [
      'w-0 tabular-digits',
      'motion-safe:not-forced-colors:data-[rolling]:text-transparent motion-safe:not-forced-colors:data-[rolling]:caret-transparent',
    ],
    roller: [
      'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap',
      'motion-reduce:hidden forced-colors:hidden',
    ],
    sizer: 'hidden',
    steppers: 'flex shrink-0 flex-col self-stretch border-s border-outline-subtle',
    stepper: [
      'focus-ring-inset transition-control no-tap-highlight flex shrink-0 cursor-pointer items-center justify-center self-stretch border-outline-subtle text-on-surface-variant motion-reduce:transition-none',
      'data-[hovered]:bg-neutral-soft data-[hovered]:text-on-surface data-[pressed]:bg-neutral-soft-hover data-[pressed]:text-on-surface',
      'data-[disabled]:cursor-not-allowed data-[disabled]:not-group-data-[disabled]/control:opacity-50',
      '[&_svg]:size-(--icon-size)',
    ],
  },
  variants: {
    layout: {
      stepper: {
        container: 'px-0',
        value: 'px-2',
        input: 'text-center',
        roller: 'justify-center px-2',
        stepper: 'data-[slot=decrement]:border-e data-[slot=increment]:border-s',
      },
      inline: {
        container: 'pe-0',
        input: 'text-start',
        roller: 'justify-start',
        steppers: 'ms-(--field-gap)',
        stepper: 'flex-1 data-[slot=increment]:border-b pointer-coarse:w-10',
      },
      compact: {
        container: 'w-fit p-(--key-inset)',
        value: [
          'grid min-w-(--key-size) flex-none place-items-center px-(--value-px) leading-(--key-size) font-medium',
        ],
        input: 'absolute inset-0 w-full px-(--value-px) text-center',
        roller: 'static col-start-1 row-start-1 justify-center overflow-visible',
        sizer: 'invisible col-start-1 row-start-1 block whitespace-pre tabular-digits',
        stepper: [
          'size-(--key-size) self-center rounded-[calc(var(--radius-field)-var(--key-inset)-1px)] bg-neutral-soft text-on-surface',
          'data-[hovered]:bg-neutral-soft-hover data-[pressed]:scale-[0.92] data-[reduced-motion]:data-[pressed]:scale-100 motion-reduce:data-[pressed]:scale-100',
        ],
      },
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    isRolling: {
      true: {},
      false: { roller: 'invisible' },
    },
  },
  compoundVariants: [
    { layout: ['stepper', 'inline'], size: 'sm', class: { container: 'min-w-32' } },
    { layout: ['stepper', 'inline'], size: 'md', class: { container: 'min-w-36' } },
    { layout: ['stepper', 'inline'], size: 'lg', class: { container: 'min-w-44' } },
    { layout: 'stepper', size: 'sm', class: { stepper: 'w-8' } },
    { layout: 'stepper', size: 'md', class: { stepper: 'w-10' } },
    { layout: 'stepper', size: 'lg', class: { stepper: 'w-12' } },
    { layout: 'inline', size: 'sm', class: { stepper: 'w-6 [--icon-size:0.875rem]' } },
    { layout: 'inline', size: 'md', class: { stepper: 'w-7 [--icon-size:1rem]' } },
    { layout: 'inline', size: 'lg', class: { stepper: 'w-8 [--icon-size:1.125rem]' } },
    {
      layout: 'compact',
      size: 'sm',
      class: {
        container: '[--key-inset:0.1875rem] [--key-size:1.5rem] [--value-px:0.5rem]',
        stepper: '[--icon-size:0.875rem]',
      },
    },
    {
      layout: 'compact',
      size: 'md',
      class: {
        container: '[--key-inset:0.25rem] [--key-size:1.875rem] [--value-px:0.625rem]',
        value: 'text-base',
        stepper: '[--icon-size:1rem]',
      },
    },
    {
      layout: 'compact',
      size: 'lg',
      class: {
        container: '[--key-inset:0.25rem] [--key-size:2.375rem] [--value-px:0.875rem]',
        value: 'text-lg',
        stepper: '[--icon-size:1.25rem]',
      },
    },
    {
      layout: 'compact',
      isRolling: true,
      class: { sizer: 'motion-safe:not-forced-colors:hidden' },
    },
    { layout: 'compact', isRolling: false, class: { roller: 'absolute' } },
  ],
  defaultVariants: {
    layout: 'stepper',
    size: 'md',
    isRolling: true,
  },
});

export type NumberFieldStyleProps = VariantProps<typeof numberFieldStyles>;

export type NumberFieldSize = FieldSize;

export type NumberFieldVariant = 'outline' | 'soft';

export type NumberFieldLayout = 'stepper' | 'inline' | 'compact';

type StepperTemplate = LabelTemplate<{ label: string }>;

export interface NumberFieldLabels {
  increase: StepperTemplate;
  decrease: StepperTemplate;
}

export const defaultNumberFieldLabels: NumberFieldLabels = {
  increase: 'Increase {label}',
  decrease: 'Decrease {label}',
};

export interface NumberFieldProps
  extends Omit<AriaNumberFieldProps, 'children' | 'className'>, Omit<FieldBaseProps, 'size'> {
  size?: NumberFieldSize;
  layout?: NumberFieldLayout;
  isAnimated?: boolean;
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
  labels?: Partial<NumberFieldLabels & FieldLabels>;
  className?: AriaNumberFieldProps['className'];
}

interface RollCheck {
  value: number;
  inputValue: string;
  locale: string;
  formatOptions: Intl.NumberFormatOptions | undefined;
}

function canRoll({ value, inputValue, locale, formatOptions }: RollCheck) {
  if (!Number.isFinite(value)) return false;
  return new Intl.NumberFormat(locale, formatOptions).format(value) === inputValue;
}

const passiveKeys = new Set(['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock']);

function useEditing(isTracked: boolean) {
  const [isEditing, setEditing] = useState(false);

  function begin() {
    setEditing(true);
  }

  function end() {
    setEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter' || event.nativeEvent.defaultPrevented) end();
    else if (!passiveKeys.has(event.key)) begin();
  }

  const inputProps = isTracked
    ? {
        onPointerDown: begin,
        onFocus: begin,
        onBlur: end,
        onChange: begin,
        onKeyDown: handleKeyDown,
      }
    : {};

  return { isEditing, inputProps, onStep: isTracked ? end : undefined };
}

interface StepperNameProps {
  id: string;
  template: StepperTemplate;
  fieldName: string | undefined;
  labelIds: string[];
}

function putsLabelFirst(template: StepperTemplate) {
  return formatLabel(template, { label: '{label}' }).trimStart().startsWith('{label}');
}

function stepperName({ id, template, fieldName, labelIds }: StepperNameProps) {
  if (fieldName) return { 'aria-label': formatLabel(template, { label: fieldName }) };
  const action = formatLabel(template, { label: '' }).trim();
  if (labelIds.length === 0) return { 'aria-label': action };
  const names = putsLabelFirst(template) ? [...labelIds, id] : [id, ...labelIds];
  return { id, 'aria-label': action, 'aria-labelledby': names.join(' ') };
}

interface NumberFieldStepperProps {
  slot: 'increment' | 'decrement';
  template: StepperTemplate;
  customLabel: string | undefined;
  fieldName: string | undefined;
  fieldLabelledBy: string | undefined;
  onStep: (() => void) | undefined;
  isMotionReduced: boolean;
  className: string;
  children: ReactNode;
}

function NumberFieldStepper({
  slot,
  template,
  customLabel,
  fieldName,
  fieldLabelledBy,
  onStep,
  isMotionReduced,
  className,
  children,
}: NumberFieldStepperProps) {
  const stepper = useSlottedContext(ButtonContext, slot);
  const id = useId();
  const ownId = stepper?.id;
  const labelIds = (fieldLabelledBy ?? stepper?.['aria-labelledby'] ?? '')
    .split(/\s+/)
    .filter((token) => token && token !== ownId);
  const naming = customLabel
    ? { 'aria-label': customLabel }
    : stepperName({ id, template, fieldName, labelIds });

  return (
    <AriaButton
      {...stepper}
      id={undefined}
      aria-labelledby={undefined}
      {...naming}
      slot={null}
      onPressStart={(event) => {
        stepper?.onPressStart?.(event);
        onStep?.();
      }}
      data-slot={slot}
      data-reduced-motion={isMotionReduced || undefined}
      className={className}
    >
      {children}
    </AriaButton>
  );
}

export function NumberField({
  label,
  isLabelHidden,
  description,
  errorMessage,
  necessityIndicator,
  size = 'md',
  variant = 'outline',
  layout = 'stepper',
  isAnimated: isAnimatedProp,
  placeholder,
  inputRef,
  labels,
  incrementAriaLabel,
  decrementAriaLabel,
  className,
  ...props
}: NumberFieldProps) {
  const t = useLabels('numberField', defaultNumberFieldLabels, labels);
  const icons = useIcons();
  const { locale } = useLocale();
  const { preference } = useMotionPreference();
  const isAnimated = isAnimatedProp ?? layout === 'compact';
  const { isEditing, inputProps, onStep } = useEditing(isAnimated);
  const fieldName = props['aria-label'] || (typeof label === 'string' ? label : undefined);
  const stepperProps = {
    fieldName,
    fieldLabelledBy: props['aria-label'] ? undefined : props['aria-labelledby'],
    onStep,
    isMotionReduced: preference !== 'system',
  };
  const hasSteppersAround = layout !== 'inline';

  return (
    <AriaNumberField
      {...props}
      incrementAriaLabel={incrementAriaLabel}
      decrementAriaLabel={decrementAriaLabel}
      data-slot="number-field"
      data-size={size}
      data-variant={variant}
      data-layout={layout}
      data-animated={isAnimated || undefined}
      className={composeRenderProps(className, (className) =>
        fieldStyles({ size, variant }).root({ className }),
      )}
    >
      {({ state }) => {
        const isRollable =
          isAnimated &&
          preference === 'system' &&
          canRoll({
            value: state.numberValue,
            inputValue: state.inputValue,
            locale,
            formatOptions: props.formatOptions,
          });
        const isRolling = isRollable && !isEditing;
        const styles = numberFieldStyles({ layout: layout, size, isRolling });

        const decrement = (
          <NumberFieldStepper
            {...stepperProps}
            slot="decrement"
            template={t.decrease}
            customLabel={decrementAriaLabel}
            className={styles.stepper()}
          >
            {layout === 'inline' ? <icons.chevronDown /> : <icons.remove />}
          </NumberFieldStepper>
        );
        const increment = (
          <NumberFieldStepper
            {...stepperProps}
            slot="increment"
            template={t.increase}
            customLabel={incrementAriaLabel}
            className={styles.stepper()}
          >
            {layout === 'inline' ? <icons.chevronUp /> : <icons.add />}
          </NumberFieldStepper>
        );

        return (
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
            <FieldGroup isReadOnly={props.isReadOnly} className={styles.container()}>
              {hasSteppersAround ? decrement : null}
              <span data-slot="value" className={styles.value()}>
                {layout === 'compact' ? (
                  <span aria-hidden="true" data-slot="sizer" className={styles.sizer()}>
                    {state.inputValue || placeholder}
                  </span>
                ) : null}
                <FieldInput
                  {...inputProps}
                  ref={inputRef}
                  placeholder={placeholder}
                  data-rolling={isRolling || undefined}
                  className={styles.input()}
                />
                {isRollable ? (
                  <span aria-hidden="true" data-slot="roller" className={styles.roller()}>
                    <RollingNumber value={state.numberValue} formatOptions={props.formatOptions} />
                  </span>
                ) : null}
              </span>
              {hasSteppersAround ? (
                increment
              ) : (
                <span data-slot="steppers" className={styles.steppers()}>
                  {increment}
                  {decrement}
                </span>
              )}
            </FieldGroup>
          </Field>
        );
      }}
    </AriaNumberField>
  );
}
