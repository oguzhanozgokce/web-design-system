'use client';

import { createContext, use, useId, useMemo, type ReactNode, type Ref } from 'react';
import {
  FieldError,
  Label,
  RadioButton,
  RadioField,
  RadioGroup as AriaRadioGroup,
  Text,
  composeRenderProps,
  type RadioButtonRenderProps,
  type RadioFieldProps,
  type RadioGroupProps as AriaRadioGroupProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const radioGroupStyles = tv({
  slots: {
    root: 'group/radio-group flex flex-col gap-3',
    header: 'flex flex-col gap-0.5',
    label: 'text-title-sm text-on-surface group-data-[disabled]/radio-group:text-on-surface/38',
    required: 'ms-0.5 text-error',
    description:
      'text-body-sm text-on-surface-variant group-data-[disabled]/radio-group:text-on-surface/38',
    items: '',
    error: 'text-body-sm text-error',
  },
  variants: {
    variant: {
      default: { items: 'flex' },
      card: { items: 'grid gap-3' },
    },
    orientation: {
      vertical: '',
      horizontal: '',
    },
  },
  compoundVariants: [
    { variant: 'default', orientation: 'vertical', class: { items: 'flex-col gap-3' } },
    {
      variant: 'default',
      orientation: 'horizontal',
      class: { items: 'flex-row flex-wrap gap-x-6 gap-y-3' },
    },
    {
      variant: 'card',
      orientation: 'horizontal',
      class: { items: 'grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))]' },
    },
  ],
  defaultVariants: {
    variant: 'default',
    orientation: 'vertical',
  },
});

export const radioStyles = tv({
  slots: {
    root: 'group/radio flex flex-col',
    target: 'cursor-default select-none',
    control: 'relative grid size-5 shrink-0 place-items-center',
    stateLayer: 'state-layer focus-ring absolute -inset-2.5 rounded-full',
    ring: 'relative grid size-5 place-items-center rounded-full border-2 border-current transition-colors duration-150 ease-standard motion-reduce:transition-none',
    dot: 'size-2.5 rounded-full bg-current transition-[scale] duration-(--ds-duration-spatial-fast) ease-spatial-fast motion-reduce:transition-none',
    icon: 'grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-150 ease-standard motion-reduce:transition-none [&_svg]:size-6',
    content: 'flex min-w-0 flex-col gap-0.5',
    label: '',
    description: 'text-body-md',
  },
  variants: {
    variant: {
      default: {
        root: 'items-start',
        target:
          'inline-flex max-w-full items-start gap-3 text-on-surface data-[disabled]:text-on-surface/38',
        label: 'text-body-lg',
      },
      card: {
        target:
          'focus-ring relative h-full rounded-md border p-4 transition-[background-color,border-color,color] duration-150 ease-standard motion-reduce:transition-none',
        label: 'text-title-md',
      },
    },
    interactive: {
      true: '',
      false: '',
    },
    layout: {
      inline: '',
      stacked: '',
    },
    hasIcon: {
      true: '',
      false: '',
    },
    tone: {
      default: '',
      invalid: '',
      disabled: '',
    },
    selected: {
      true: { dot: 'scale-100' },
      false: { dot: 'scale-0' },
    },
    hasContent: {
      true: '',
      false: '',
    },
    instant: {
      true: { target: 'transition-none', ring: 'transition-none', dot: 'transition-none' },
      false: '',
    },
  },
  compoundVariants: [
    { hasContent: true, class: { control: 'mt-0.5' } },
    { variant: 'card', interactive: true, class: { target: 'state-layer' } },
    {
      variant: 'card',
      layout: 'inline',
      class: { target: 'flex items-start gap-4', content: 'flex-1' },
    },
    {
      variant: 'card',
      layout: 'stacked',
      class: {
        target: 'grid grid-cols-[1fr_auto] content-start items-start gap-x-4 gap-y-3',
        icon: 'col-start-1 row-start-1',
        control: 'col-start-2 row-start-1',
      },
    },
    {
      variant: 'card',
      layout: 'stacked',
      hasIcon: true,
      class: { content: 'col-span-2 row-start-2', control: 'mt-2.5' },
    },
    {
      variant: 'card',
      layout: 'stacked',
      hasIcon: false,
      class: { content: 'col-start-1 row-start-1' },
    },
    {
      tone: 'default',
      selected: false,
      class: { ring: 'text-on-surface-variant', stateLayer: 'text-on-surface' },
    },
    {
      tone: 'default',
      selected: true,
      class: { ring: 'text-primary', stateLayer: 'text-primary' },
    },
    { tone: 'invalid', class: { ring: 'text-error', stateLayer: 'text-error' } },
    { tone: 'disabled', class: { ring: 'text-on-surface/38' } },
    {
      variant: 'default',
      tone: ['default', 'invalid'],
      class: { description: 'text-on-surface-variant' },
    },
    { variant: 'default', tone: 'disabled', class: { description: 'text-on-surface/38' } },
    {
      variant: 'card',
      tone: ['default', 'invalid'],
      selected: false,
      class: {
        target: 'border-outline-variant bg-surface-container-low text-on-surface',
        description: 'text-on-surface-variant',
        icon: 'bg-surface-container-highest text-on-surface-variant',
      },
    },
    { variant: 'card', tone: 'invalid', selected: false, class: { target: 'border-error' } },
    {
      variant: 'card',
      tone: ['default', 'invalid'],
      selected: true,
      class: {
        target: 'border-secondary bg-secondary-container text-on-secondary-container',
        description: 'text-on-secondary-container',
        icon: 'bg-primary text-on-primary',
      },
    },
    {
      variant: 'card',
      tone: 'disabled',
      class: {
        target: 'border-on-surface/12 bg-transparent text-on-surface/38',
        description: 'text-on-surface/38',
        icon: 'bg-on-surface/12 text-on-surface/38',
      },
    },
  ],
  defaultVariants: {
    variant: 'default',
    layout: 'inline',
    tone: 'default',
    selected: false,
    hasContent: true,
    hasIcon: false,
    interactive: true,
    instant: false,
  },
});

export type RadioGroupStyleProps = VariantProps<typeof radioGroupStyles>;

interface RadioGroupLayout {
  variant: NonNullable<RadioGroupStyleProps['variant']>;
  orientation: NonNullable<RadioGroupStyleProps['orientation']>;
}

type RadioTone = 'default' | 'invalid' | 'disabled';

const RadioGroupLayoutContext = createContext<RadioGroupLayout>({
  variant: 'default',
  orientation: 'vertical',
});

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

function radioTone({ isDisabled, isInvalid }: RadioButtonRenderProps): RadioTone {
  if (isDisabled) return 'disabled';
  return isInvalid ? 'invalid' : 'default';
}

export interface RadioGroupProps
  extends Omit<AriaRadioGroupProps, 'children' | 'className'>, RadioGroupStyleProps {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  children?: ReactNode;
  className?: AriaRadioGroupProps['className'];
  ref?: Ref<HTMLDivElement>;
}

export function RadioGroup({
  label,
  description,
  errorMessage,
  variant,
  orientation,
  children,
  className,
  ...props
}: RadioGroupProps) {
  const styles = radioGroupStyles({ variant, orientation });
  const layout = useMemo<RadioGroupLayout>(
    () => ({ variant: variant ?? 'default', orientation: orientation ?? 'vertical' }),
    [variant, orientation],
  );

  return (
    <AriaRadioGroup
      {...props}
      orientation={orientation ?? 'vertical'}
      data-slot="radio-group"
      data-variant={variant ?? 'default'}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      <RadioGroupLayoutContext value={layout}>
        {label != null || description != null ? (
          <span data-slot="header" className={styles.header()}>
            {label != null ? (
              <Label data-slot="label" className={styles.label()}>
                {label}
                {props.isRequired ? (
                  <span aria-hidden="true" data-slot="required" className={styles.required()}>
                    *
                  </span>
                ) : null}
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
      </RadioGroupLayoutContext>
    </AriaRadioGroup>
  );
}

export interface RadioProps extends Omit<RadioFieldProps, 'children' | 'className'> {
  children?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  className?: RadioFieldProps['className'];
  ref?: Ref<HTMLDivElement>;
}

export function Radio({ children, description, icon, className, ...props }: RadioProps) {
  const { variant, orientation } = use(RadioGroupLayoutContext);
  const labelId = useId();
  const instant = useMotionPreference().preference !== 'system';

  const hasLabel = children != null;
  const hasDescription = description != null;
  const hasContent = hasLabel || hasDescription;
  const rootStyles = radioStyles({ variant });

  function stylesFor(state: RadioButtonRenderProps) {
    return radioStyles({
      variant,
      layout: variant === 'card' && orientation === 'horizontal' ? 'stacked' : 'inline',
      hasIcon: variant === 'card' && icon != null,
      tone: radioTone(state),
      selected: state.isSelected,
      interactive: !state.isReadOnly,
      hasContent,
      instant,
    });
  }

  return (
    <RadioField
      {...props}
      aria-labelledby={labelledByWithDescription(props, labelId, hasLabel, hasDescription)}
      data-slot="radio"
      data-variant={variant}
      className={composeRenderProps(className, (className) => rootStyles.root({ className }))}
    >
      <RadioButton data-slot="target" className={(state) => stylesFor(state).target()}>
        {(state) => {
          const styles = stylesFor(state);
          const indicator = (
            <span data-slot="control" className={styles.control()}>
              {variant === 'default' ? (
                <span
                  aria-hidden="true"
                  data-slot="state-layer"
                  data-hovered={state.isHovered || undefined}
                  data-pressed={state.isPressed || undefined}
                  data-focus-visible={state.isFocusVisible || undefined}
                  data-disabled={state.isDisabled || state.isReadOnly || undefined}
                  className={styles.stateLayer()}
                />
              ) : null}
              <span data-slot="ring" className={styles.ring()}>
                <span data-slot="dot" className={styles.dot()} />
              </span>
            </span>
          );

          return (
            <>
              {variant === 'default' ? indicator : null}
              {variant === 'card' && icon != null ? (
                <span aria-hidden="true" data-slot="icon" className={styles.icon()}>
                  {icon}
                </span>
              ) : null}
              {hasContent ? (
                <span data-slot="content" className={styles.content()}>
                  {hasLabel ? (
                    <span id={labelId} data-slot="label" className={styles.label()}>
                      {children}
                    </span>
                  ) : null}
                  {hasDescription ? (
                    <Text
                      slot="description"
                      data-slot="description"
                      className={styles.description()}
                    >
                      {description}
                    </Text>
                  ) : null}
                </span>
              ) : null}
              {variant === 'card' ? indicator : null}
            </>
          );
        }}
      </RadioButton>
    </RadioField>
  );
}
