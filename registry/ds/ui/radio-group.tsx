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
    header: 'flex flex-col gap-1 group-data-[disabled]/radio-group:opacity-50',
    label: 'text-sm font-medium text-on-surface',
    required: 'ms-0.5 text-error',
    description: 'text-xs text-on-surface-variant',
    items: '',
    error: 'text-xs text-error',
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
    target: [
      'group/radio-target no-tap-highlight cursor-pointer text-on-surface select-none',
      'data-[readonly]:cursor-default',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    control:
      "relative grid size-[18px] shrink-0 place-items-center after:absolute after:-inset-[3px] after:content-['']",
    ring: [
      'relative grid size-[18px] place-items-center rounded-full border border-outline bg-surface-raised',
      'transition-[background-color,border-color,scale] duration-200 ease-out motion-reduce:transition-none',
    ],
    dot: 'absolute inset-0 rounded-full bg-surface-raised transition-[scale,background-color] duration-200 ease-out motion-reduce:transition-none',
    icon: 'grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-150 ease-out motion-reduce:transition-none [&_svg]:size-5',
    content: 'flex min-w-0 flex-col gap-0.5',
    label: '',
    description: '',
  },
  variants: {
    variant: {
      default: {
        root: 'items-start',
        target: 'inline-flex max-w-full items-start gap-3 text-sm',
        ring: 'focus-ring',
        description: 'text-xs text-on-surface-variant',
      },
      card: {
        target: [
          'focus-ring relative h-full rounded-container border p-4',
          'transition-[background-color,border-color,box-shadow,scale] duration-150 ease-out motion-reduce:transition-none',
        ],
        label: 'text-sm font-medium',
        description: 'text-sm text-on-surface-variant',
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
    invalid: {
      true: '',
      false: '',
    },
    selected: {
      true: { dot: 'scale-[0.4375]' },
      false: { dot: 'scale-100' },
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
    { hasContent: true, class: { control: 'mt-px' } },
    {
      interactive: true,
      class: {
        ring: 'group-data-[pressed]/radio-target:scale-95 motion-reduce:group-data-[pressed]/radio-target:scale-100',
      },
    },
    {
      interactive: true,
      selected: true,
      class: {
        dot: 'group-data-[pressed]/radio-target:scale-[0.5625] motion-reduce:group-data-[pressed]/radio-target:scale-[0.4375]',
      },
    },
    {
      interactive: true,
      selected: false,
      invalid: false,
      class: { ring: 'group-data-[hovered]/radio-target:border-on-surface-variant' },
    },
    {
      selected: true,
      invalid: false,
      class: { ring: 'border-primary-solid bg-primary-solid', dot: 'bg-on-primary-solid' },
    },
    {
      interactive: true,
      selected: true,
      invalid: false,
      class: {
        ring: 'group-data-[hovered]/radio-target:border-primary-solid-hover group-data-[hovered]/radio-target:bg-primary-solid-hover',
      },
    },
    { invalid: true, class: { ring: 'border-error [--focus-color:var(--error)]' } },
    {
      invalid: true,
      selected: true,
      class: { ring: 'border-error-solid bg-error-solid', dot: 'bg-on-error-solid' },
    },
    {
      variant: 'card',
      layout: 'inline',
      class: { target: 'flex items-start gap-3', content: 'flex-1' },
    },
    {
      variant: 'card',
      layout: 'stacked',
      class: {
        target: 'grid grid-cols-[1fr_auto] content-start items-start gap-x-3 gap-y-3',
        icon: 'col-start-1 row-start-1',
        control: 'col-start-2 row-start-1',
      },
    },
    {
      variant: 'card',
      layout: 'stacked',
      hasIcon: true,
      class: { content: 'col-span-2 row-start-2', control: 'mt-[11px]' },
    },
    {
      variant: 'card',
      layout: 'stacked',
      hasIcon: false,
      class: { content: 'col-start-1 row-start-1' },
    },
    {
      variant: 'card',
      selected: false,
      class: {
        target: 'border-outline-subtle bg-surface-raised',
        icon: 'bg-neutral-soft text-on-surface-variant',
      },
    },
    {
      variant: 'card',
      selected: false,
      interactive: true,
      class: { target: 'data-[hovered]:border-outline-variant' },
    },
    {
      variant: 'card',
      interactive: true,
      class: {
        target: 'data-[pressed]:scale-[0.99] motion-reduce:data-[pressed]:scale-100',
      },
    },
    { variant: 'card', selected: false, invalid: true, class: { target: 'border-error' } },
    {
      variant: 'card',
      selected: true,
      class: {
        target: 'border-primary bg-primary-soft inset-ring-1 inset-ring-primary',
        icon: 'bg-surface-raised text-primary',
      },
    },
    {
      variant: 'card',
      selected: true,
      invalid: true,
      class: {
        target: 'border-error bg-error-soft inset-ring-error [--focus-color:var(--error)]',
        icon: 'text-error',
      },
    },
    {
      interactive: true,
      instant: true,
      class: {
        target: 'data-[pressed]:scale-100',
        ring: 'group-data-[pressed]/radio-target:scale-100',
      },
    },
    {
      interactive: true,
      instant: true,
      selected: true,
      class: { dot: 'group-data-[pressed]/radio-target:scale-[0.4375]' },
    },
  ],
  defaultVariants: {
    variant: 'default',
    layout: 'inline',
    invalid: false,
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
      invalid: state.isInvalid,
      selected: state.isSelected,
      interactive: !state.isReadOnly && !state.isDisabled,
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
              <span
                data-slot="ring"
                data-focus-visible={(variant === 'default' && state.isFocusVisible) || undefined}
                className={styles.ring()}
              >
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
