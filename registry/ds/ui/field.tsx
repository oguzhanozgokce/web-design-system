'use client';

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Button as AriaButton,
  FieldError as AriaFieldError,
  FieldErrorContext,
  Group,
  Input,
  Label as AriaLabel,
  Text,
  composeRenderProps,
  useLocale,
  type ButtonProps as AriaButtonProps,
  type FieldErrorProps as AriaFieldErrorProps,
  type GroupProps,
  type InputProps,
  type LabelProps as AriaLabelProps,
  type TextProps,
  type ValidationResult,
} from 'react-aria-components';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';

export const fieldStyles = tv({
  slots: {
    root: 'group/field flex min-w-0 flex-col gap-1',
    label:
      'flex w-fit cursor-default items-baseline gap-0.5 text-sm font-medium text-on-surface group-data-[disabled]/field:opacity-50',
    necessity: '',
    container: [
      'group/control relative flex w-full min-w-0 cursor-text items-center rounded-field text-on-surface',
      'text-base pointer-fine:text-sm',
      'transition-[border-color,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    input: [
      'min-w-0 flex-1 self-stretch bg-transparent caret-primary focus:outline-hidden group-data-[invalid]/control:caret-error',
      'placeholder:text-on-surface-variant disabled:cursor-not-allowed',
      '[&::-webkit-search-cancel-button]:appearance-none',
    ],
    adornment:
      'flex shrink-0 items-center whitespace-nowrap text-on-surface-variant [unicode-bidi:plaintext] select-none [&_svg]:size-(--icon-size)',
    action:
      'focus-ring transition-control ms-1 flex shrink-0 cursor-pointer items-center justify-center rounded-full text-on-surface-variant data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg]:size-(--icon-size)',
    supporting: 'flex items-start gap-3 text-xs',
    description: 'min-w-0 flex-1 text-on-surface-variant',
    error:
      'flex min-w-0 flex-1 animate-ds-fade-in items-start gap-1 text-error motion-reduce:animate-none [&_svg]:size-3.5 [&_svg]:shrink-0',
    counter: 'ms-auto shrink-0 text-on-surface-variant tabular-digits data-[over]:text-error',
  },
  variants: {
    size: {
      sm: {
        container:
          'h-8 gap-0.5 px-(--field-px) [--field-gap:0.375rem] [--field-px:0.625rem] [--field-py:0.375rem] [--icon-size:1rem]',
        action: '-me-1 size-6',
      },
      md: {
        container:
          'h-10 gap-0.5 px-(--field-px) [--field-gap:0.5rem] [--field-px:0.75rem] [--field-py:0.5rem] [--icon-size:1rem]',
        action: '-me-1.5 size-7',
      },
      lg: {
        container:
          'h-12 gap-1 px-(--field-px) [--field-gap:0.625rem] [--field-px:1rem] [--field-py:0.75rem] [--icon-size:1.25rem] pointer-fine:text-base',
        action: '-me-2 size-8',
      },
    },
    variant: {
      outline: {
        container: [
          'border border-outline-variant bg-surface-raised',
          'data-[hovered]:not-focus-within:not-data-[invalid]:not-data-[readonly]:inset-ring-2 data-[hovered]:not-focus-within:not-data-[invalid]:not-data-[readonly]:inset-ring-outline-variant/40',
          'focus-within:not-data-[invalid]:border-primary focus-within:not-data-[invalid]:inset-ring-2 focus-within:not-data-[invalid]:inset-ring-primary/20',
          'data-[invalid]:border-error focus-within:data-[invalid]:inset-ring-2 focus-within:data-[invalid]:inset-ring-error/20',
          'data-[readonly]:bg-neutral-soft',
        ],
      },
      soft: {
        container: [
          'border border-transparent bg-neutral-soft',
          'data-[hovered]:not-focus-within:not-data-[invalid]:not-data-[readonly]:bg-neutral-soft-hover',
          'focus-within:not-data-[invalid]:border-primary focus-within:not-data-[invalid]:bg-surface-raised focus-within:not-data-[invalid]:inset-ring-2 focus-within:not-data-[invalid]:inset-ring-primary/20',
          'data-[invalid]:border-error focus-within:data-[invalid]:inset-ring-2 focus-within:data-[invalid]:inset-ring-error/20',
        ],
      },
    },
    placement: {
      start: { adornment: 'has-[svg]:me-(--field-gap)' },
      end: { adornment: 'has-[svg]:ms-(--field-gap)' },
    },
    multiline: {
      true: {
        container: 'h-auto items-stretch px-0',
        input: 'resize-none px-(--field-px) py-(--field-py)',
      },
    },
    necessityIndicator: {
      icon: { necessity: 'text-error' },
      label: {
        necessity: 'text-sm font-normal text-on-surface-variant',
      },
    },
    isLabelHidden: {
      true: { label: 'sr-only' },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'outline',
    necessityIndicator: 'icon',
  },
});

export type FieldStyleProps = VariantProps<typeof fieldStyles>;

export type FieldSize = 'sm' | 'md' | 'lg';

export type FieldVariant = 'outline' | 'soft';

export type NecessityIndicator = 'icon' | 'label';

export type FieldErrorMessage = ReactNode | ((validation: ValidationResult) => ReactNode);

export interface FieldLabels {
  optional: string;
  characterCount: LabelTemplate<{ count: string; max: string }>;
  characterCountLabel: LabelTemplate<{ count: string; max: string }>;
}

export const defaultFieldLabels: FieldLabels = {
  optional: '(optional)',
  characterCount: '{count}/{max}',
  characterCountLabel: 'Character count: {count} of {max}',
};

export interface FieldBaseProps {
  label?: ReactNode;
  isLabelHidden?: boolean;
  description?: ReactNode;
  errorMessage?: FieldErrorMessage;
  necessityIndicator?: NecessityIndicator;
  size?: FieldSize;
  variant?: FieldVariant;
}

export interface FieldContextValue {
  size: FieldSize;
  variant: FieldVariant;
  necessityIndicator: NecessityIndicator;
  isRequired: boolean;
  isLabelHidden: boolean;
}

export const FieldContext = createContext<FieldContextValue>({
  size: 'md',
  variant: 'outline',
  necessityIndicator: 'icon',
  isRequired: false,
  isLabelHidden: false,
});

export function useFieldContext() {
  return use(FieldContext);
}

export interface LabelProps extends AriaLabelProps {
  isRequired?: boolean;
  necessityIndicator?: NecessityIndicator;
  isHidden?: boolean;
  labels?: Partial<FieldLabels>;
}

export function Label({
  isRequired,
  necessityIndicator,
  isHidden,
  labels,
  className,
  children,
  ...props
}: LabelProps) {
  const field = use(FieldContext);
  const t = useLabels('field', defaultFieldLabels, labels);
  const required = isRequired ?? field.isRequired;
  const indicator = necessityIndicator ?? field.necessityIndicator;
  const styles = fieldStyles({
    necessityIndicator: indicator,
    isLabelHidden: isHidden ?? field.isLabelHidden,
  });

  return (
    <AriaLabel {...props} data-slot="label" className={styles.label({ className })}>
      {children}
      {indicator === 'icon' && required ? (
        <span aria-hidden="true" data-slot="necessity-indicator" className={styles.necessity()}>
          *
        </span>
      ) : null}
      {indicator === 'label' && !required ? (
        <span data-slot="necessity-indicator" className={styles.necessity()}>
          {t.optional}
        </span>
      ) : null}
    </AriaLabel>
  );
}

export type DescriptionProps = TextProps;

export function Description({ className, ...props }: DescriptionProps) {
  return (
    <Text
      {...props}
      slot="description"
      data-slot="description"
      className={fieldStyles().description({ className })}
    />
  );
}

export type FieldErrorProps = AriaFieldErrorProps;

export function FieldError({ className, children, ...props }: FieldErrorProps) {
  const icons = useIcons();

  return (
    <AriaFieldError
      {...props}
      data-slot="error"
      className={composeRenderProps(className, (className) => fieldStyles().error({ className }))}
    >
      {(validation) => (
        <>
          <icons.error />
          <span>
            {typeof children === 'function'
              ? children(validation)
              : (children ?? validation.validationErrors.join(' '))}
          </span>
        </>
      )}
    </AriaFieldError>
  );
}

function hasContent(node: ReactNode) {
  return node != null && node !== false && node !== '';
}

export interface FieldProps extends FieldBaseProps {
  isRequired?: boolean;
  counter?: ReactNode;
  labels?: Partial<FieldLabels>;
  children: ReactNode;
}

export function Field({
  label,
  isLabelHidden = false,
  description,
  errorMessage,
  necessityIndicator = 'icon',
  isRequired = false,
  size = 'md',
  variant = 'outline',
  counter,
  labels,
  children,
}: FieldProps) {
  const validation = use(FieldErrorContext);
  const context = useMemo(
    () => ({ size, variant, necessityIndicator, isRequired, isLabelHidden }),
    [size, variant, necessityIndicator, isRequired, isLabelHidden],
  );

  const errorContent = !validation?.isInvalid
    ? null
    : typeof errorMessage === 'function'
      ? errorMessage(validation)
      : (errorMessage ?? validation.validationErrors.join(' '));
  const showError = hasContent(errorContent);
  const showDescription = !showError && hasContent(description);

  return (
    <FieldContext value={context}>
      {hasContent(label) ? <Label labels={labels}>{label}</Label> : null}
      {children}
      {showError || showDescription || hasContent(counter) ? (
        <div data-slot="supporting" className={fieldStyles().supporting()}>
          {showError ? <FieldError>{errorContent}</FieldError> : null}
          {showDescription ? <Description>{description}</Description> : null}
          {counter}
        </div>
      ) : null}
    </FieldContext>
  );
}

export interface FieldGroupProps extends GroupProps {
  ref?: Ref<HTMLDivElement>;
  size?: FieldSize;
  variant?: FieldVariant;
  multiline?: boolean;
}

export function FieldGroup({
  size,
  variant,
  multiline,
  className,
  onPointerDown,
  ...props
}: FieldGroupProps) {
  const field = use(FieldContext);

  function focusControl(event: PointerEvent<HTMLDivElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest('input, textarea, button, a, [role="button"]')) return;
    const control = event.currentTarget.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      'input:not([type="hidden"]), textarea',
    );
    if (!control || control.disabled) return;
    event.preventDefault();
    control.focus();
  }

  return (
    <Group
      {...props}
      data-slot="container"
      onPointerDown={focusControl}
      className={composeRenderProps(className, (className) =>
        fieldStyles({
          size: size ?? field.size,
          variant: variant ?? field.variant,
          multiline,
        }).container({ className }),
      )}
    />
  );
}

export interface FieldInputProps extends InputProps {
  ref?: Ref<HTMLInputElement>;
}

export function FieldInput({ className, ...props }: FieldInputProps) {
  const field = use(FieldContext);

  return (
    <Input
      {...props}
      data-slot="input"
      className={composeRenderProps(className, (className) =>
        fieldStyles({ size: field.size, variant: field.variant }).input({ className }),
      )}
    />
  );
}

export interface FieldAdornmentProps extends ComponentProps<'span'> {
  placement?: 'start' | 'end';
}

export function FieldAdornment({ placement = 'start', className, ...props }: FieldAdornmentProps) {
  return (
    <span
      {...props}
      data-slot={`${placement}-adornment`}
      className={fieldStyles({ placement }).adornment({ className })}
    />
  );
}

export interface FieldButtonProps extends AriaButtonProps {
  ref?: Ref<HTMLButtonElement>;
  size?: FieldSize;
}

export function FieldButton({ size, className, ...props }: FieldButtonProps) {
  const field = use(FieldContext);

  return (
    <AriaButton
      data-slot="action"
      {...props}
      className={composeRenderProps(className, (className) =>
        fieldStyles({ size: size ?? field.size }).action({ className }),
      )}
    />
  );
}

function isDescribingFocusedElement(id: string | undefined) {
  if (!id) return true;
  const describedBy = document.activeElement?.getAttribute('aria-describedby') ?? '';
  return describedBy.split(/\s+/).includes(id);
}

function useSettledAnnouncement(count: number, message: string, id: string | undefined) {
  const [announcement, setAnnouncement] = useState({ message: '', attempt: 0 });
  const settled = useRef(count);

  useEffect(() => {
    if (settled.current === count) return;
    const timer = setTimeout(() => {
      settled.current = count;
      if (!isDescribingFocusedElement(id)) return;
      setAnnouncement((current) => ({ message, attempt: current.attempt + 1 }));
    }, 750);
    return () => clearTimeout(timer);
  }, [count, message, id]);

  return announcement;
}

export interface FieldCounterProps extends Omit<ComponentProps<'span'>, 'children'> {
  count: number;
  max: number;
  labels?: Partial<FieldLabels>;
}

export function FieldCounter({ count, max, labels, id, className, ...props }: FieldCounterProps) {
  const t = useLabels('field', defaultFieldLabels, labels);
  const { locale } = useLocale();
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const values = { count: formatter.format(count), max: formatter.format(max) };
  const label = t.format('characterCountLabel', values);
  const announcement = useSettledAnnouncement(count, label, id);

  return (
    <span
      {...props}
      data-slot="counter"
      data-over={count > max || undefined}
      className={fieldStyles().counter({ className })}
    >
      <span aria-hidden="true">{t.format('characterCount', values)}</span>
      <span id={id} className="sr-only">
        {label}
      </span>
      <span aria-live="polite" data-slot="counter-announcer" className="sr-only">
        {announcement.message ? (
          <span key={announcement.attempt}>{announcement.message}</span>
        ) : null}
      </span>
    </span>
  );
}
