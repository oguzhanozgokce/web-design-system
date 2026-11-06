'use client';

import NumberFlow, { type Format } from '@number-flow/react';
import { calcGeneratorDuration, generateLinearEasing, spring } from 'motion/react';
import {
  useId,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
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
import { spatialSpring, type MotionProfile } from '@/registry/ds/lib/motion';
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

export const numberFieldStyles = tv({
  slots: {
    container: '',
    value: 'relative flex min-w-0 flex-1 self-stretch',
    input: [
      'w-0 tabular-digits',
      'motion-safe:not-forced-colors:data-[rolling]:text-transparent motion-safe:not-forced-colors:data-[rolling]:caret-transparent',
    ],
    roller: [
      'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap tabular-digits',
      'motion-reduce:hidden forced-colors:hidden',
    ],
    steppers: 'flex shrink-0 flex-col self-stretch',
    stepper: [
      'state-layer focus-ring flex shrink-0 cursor-default items-center justify-center text-on-surface-variant',
      'data-[disabled]:text-on-surface/38 [&_svg]:size-(--icon-size)',
    ],
  },
  variants: {
    layout: {
      stepper: {
        container: 'gap-1 px-1',
        input: 'text-center',
        roller: 'justify-center',
        stepper: [
          'rounded-full transition-[scale,background-color,color] duration-150 ease-standard',
          'data-[pressed]:scale-90 motion-reduce:transition-none motion-reduce:data-[pressed]:scale-100',
        ],
      },
      inline: {
        container: 'pe-1',
        input: 'text-start',
        roller: 'justify-start',
        steppers: 'ms-1 py-0.5',
        stepper: 'w-6 flex-1 rounded-xs pointer-coarse:w-9',
      },
    },
    size: {
      sm: { container: 'min-w-32' },
      md: { container: 'min-w-36' },
      lg: { container: 'min-w-44' },
      display: {
        container:
          'h-14 min-w-48 text-headline-sm pointer-fine:text-headline-sm [--icon-size:1.5rem]',
      },
    },
    variant: {
      outlined: {},
      filled: {},
    },
    shape: {
      field: {},
      pill: {},
    },
    isRolling: {
      true: {},
      false: { roller: 'invisible' },
    },
  },
  compoundVariants: [
    { layout: 'stepper', size: 'sm', class: { stepper: 'size-7' } },
    { layout: 'stepper', size: 'md', class: { stepper: 'size-8' } },
    { layout: 'stepper', size: 'lg', class: { stepper: 'size-10' } },
    {
      layout: 'stepper',
      size: 'display',
      class: {
        container: 'px-1.5',
        stepper:
          'size-11 bg-secondary-container text-on-secondary-container data-[disabled]:bg-on-surface/12 data-[disabled]:text-on-surface/38',
      },
    },
    {
      layout: 'stepper',
      size: 'display',
      variant: 'outlined',
      class: { container: 'rounded-full' },
    },
    { layout: 'inline', size: ['sm', 'md'], class: { steppers: '[--icon-size:1rem]' } },
    { layout: 'inline', size: 'lg', class: { steppers: 'py-1 [--icon-size:1.125rem]' } },
    {
      layout: 'inline',
      size: 'display',
      class: { steppers: 'py-1 [--icon-size:1.25rem]', stepper: 'w-8 pointer-coarse:w-10' },
    },
    {
      shape: 'pill',
      class: {
        container: [
          'w-fit min-w-0 gap-0 rounded-full border-0 bg-surface-container-high forced-colors:border',
          'focus-within:ring-2 data-[invalid]:ring-2 data-[invalid]:ring-inset',
          'data-[readonly]:bg-surface-container data-[disabled]:bg-on-surface/4',
        ],
        value: [
          'w-[calc(var(--number-field-chars)*1ch+1rem)] flex-none',
          'transition-[width] duration-(--ds-duration-spatial-fast) ease-spatial-fast motion-reduce:transition-none',
        ],
        input: 'font-medium',
        roller: 'font-medium',
        stepper:
          'bg-surface-container-highest text-on-surface data-[disabled]:bg-on-surface/12 data-[disabled]:text-on-surface/38',
      },
    },
  ],
  defaultVariants: {
    layout: 'stepper',
    size: 'md',
    variant: 'outlined',
    shape: 'field',
    isRolling: true,
  },
});

export type NumberFieldStyleProps = VariantProps<typeof numberFieldStyles>;

export type NumberFieldSize = 'sm' | 'md' | 'lg' | 'display';

export type NumberFieldLayout = 'stepper' | 'inline';

export type NumberFieldShape = 'field' | 'pill';

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
  shape?: NumberFieldShape;
  isAnimated?: boolean;
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
  labels?: Partial<NumberFieldLabels & FieldLabels>;
  className?: AriaNumberFieldProps['className'];
}

const plainNumberParts = new Set<string>(['integer', 'group', 'decimal', 'fraction']);

interface RollCheck {
  value: number;
  inputValue: string;
  locale: string;
  direction: 'ltr' | 'rtl';
  formatOptions: Intl.NumberFormatOptions | undefined;
}

function canRoll({ value, inputValue, locale, direction, formatOptions }: RollCheck) {
  if (!Number.isFinite(value)) return false;
  if (formatOptions?.notation === 'scientific' || formatOptions?.notation === 'engineering') {
    return false;
  }
  const formatter = new Intl.NumberFormat(locale, formatOptions);
  if (formatter.resolvedOptions().numberingSystem !== 'latn') return false;
  if (formatter.format(value) !== inputValue) return false;
  if (direction === 'ltr') return true;
  return formatter.formatToParts(value).every((part) => plainNumberParts.has(part.type));
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

const rollTimings = new Map<MotionProfile, EffectTiming>();

function rollTiming(profile: MotionProfile) {
  const cached = rollTimings.get(profile);
  if (cached) return cached;
  const generator = spring({ keyframes: [0, 1], ...spatialSpring('medium', profile) });
  const duration = calcGeneratorDuration(generator);
  const easing = generateLinearEasing(
    (progress) => generator.next(duration * progress).value,
    duration,
  );
  const timing = { duration, easing };
  rollTimings.set(profile, timing);
  return timing;
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
  variant = 'outlined',
  layout = 'stepper',
  shape = 'field',
  isAnimated = false,
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
  const { locale, direction } = useLocale();
  const { preference, profile } = useMotionPreference();
  const { isEditing, inputProps, onStep } = useEditing(isAnimated);
  const fieldSize: FieldSize = size === 'display' ? 'lg' : size;
  const isPill = shape === 'pill';
  const activeLayout = isPill ? 'stepper' : layout;
  const fieldVariant = isPill ? 'outlined' : variant;
  const fieldName = props['aria-label'] || (typeof label === 'string' ? label : undefined);
  const stepperProps = {
    fieldName,
    fieldLabelledBy: props['aria-label'] ? undefined : props['aria-labelledby'],
    onStep,
  };

  return (
    <AriaNumberField
      {...props}
      incrementAriaLabel={incrementAriaLabel}
      decrementAriaLabel={decrementAriaLabel}
      data-slot="number-field"
      data-size={size}
      data-variant={isPill ? undefined : variant}
      data-layout={activeLayout}
      data-shape={shape}
      data-animated={isAnimated || undefined}
      className={composeRenderProps(className, (className) =>
        fieldStyles({ size: fieldSize, variant: fieldVariant }).root({ className }),
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
            direction,
            formatOptions: props.formatOptions,
          });
        const isRolling = isRollable && !isEditing;
        const styles = numberFieldStyles({
          layout: activeLayout,
          size,
          variant: fieldVariant,
          shape,
          isRolling,
        });
        const valueStyle = isPill
          ? ({
              '--number-field-chars': Math.max(1, (state.inputValue || placeholder || '').length),
            } as CSSProperties)
          : undefined;

        const decrement = (
          <NumberFieldStepper
            {...stepperProps}
            slot="decrement"
            template={t.decrease}
            customLabel={decrementAriaLabel}
            className={styles.stepper()}
          >
            {activeLayout === 'inline' ? <icons.chevronDown /> : <icons.remove />}
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
            {activeLayout === 'inline' ? <icons.chevronUp /> : <icons.add />}
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
            size={fieldSize}
            variant={fieldVariant}
            labels={labels}
          >
            <FieldGroup isReadOnly={props.isReadOnly} className={styles.container()}>
              {activeLayout === 'stepper' ? decrement : null}
              <span data-slot="value" className={styles.value()} style={valueStyle}>
                <FieldInput
                  {...inputProps}
                  ref={inputRef}
                  placeholder={placeholder}
                  data-rolling={isRolling || undefined}
                  className={styles.input()}
                />
                {isRollable ? (
                  <span aria-hidden="true" data-slot="roller" className={styles.roller()}>
                    <NumberFlow
                      value={state.numberValue}
                      locales={locale}
                      format={props.formatOptions as Format | undefined}
                      transformTiming={rollTiming(profile)}
                    />
                  </span>
                ) : null}
              </span>
              {activeLayout === 'stepper' ? (
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
