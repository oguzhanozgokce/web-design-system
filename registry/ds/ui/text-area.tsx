'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type Ref,
  type RefObject,
} from 'react';
import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  composeRenderProps,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import { cn, tv, type VariantProps } from '@/registry/ds/lib/utils';
import {
  Field,
  FieldCounter,
  FieldGroup,
  fieldStyles,
  type FieldBaseProps,
  type FieldLabels,
} from '@/registry/ds/ui/field';

export const textAreaStyles = tv({
  base: [
    'field-sizing-content overflow-y-auto',
    'min-h-[calc(var(--field-min-rows)*1lh+2*var(--field-py))] max-h-[calc(var(--field-max-rows)*1lh+2*var(--field-py))]',
  ],
  variants: {
    resize: {
      none: 'resize-none',
      vertical: 'resize-y',
    },
  },
  defaultVariants: {
    resize: 'none',
  },
});

export type TextAreaStyleProps = VariantProps<typeof textAreaStyles>;

export type TextAreaVariant = 'outline' | 'soft';

function supportsFieldSizing() {
  return typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');
}

function fitToContent(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function useAutoGrow(groupRef: RefObject<HTMLDivElement | null>, value: string) {
  useLayoutEffect(() => {
    if (supportsFieldSizing()) return;
    const textarea = groupRef.current?.querySelector('textarea');
    if (textarea) fitToContent(textarea);
  }, [groupRef, value]);

  useEffect(() => {
    if (supportsFieldSizing() || typeof ResizeObserver === 'undefined') return;
    const textarea = groupRef.current?.querySelector('textarea');
    if (!textarea) return;
    let width = textarea.clientWidth;
    const observer = new ResizeObserver(() => {
      if (textarea.clientWidth === width) return;
      width = textarea.clientWidth;
      fitToContent(textarea);
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [groupRef]);
}

export interface TextAreaProps
  extends
    Omit<AriaTextFieldProps, 'children' | 'value' | 'defaultValue' | 'onChange'>,
    FieldBaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  resize?: 'none' | 'vertical';
  showCounter?: boolean;
  inputRef?: Ref<HTMLTextAreaElement>;
  labels?: Partial<FieldLabels>;
}

export function TextArea({
  label,
  isLabelHidden,
  description,
  errorMessage,
  necessityIndicator,
  size = 'md',
  variant = 'outline',
  value: valueProp,
  defaultValue = '',
  onChange,
  placeholder,
  minRows = 3,
  maxRows = 8,
  resize = 'none',
  showCounter = true,
  inputRef,
  labels,
  maxLength,
  className,
  ...props
}: TextAreaProps) {
  const counterId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange);
  const hasCounter = showCounter && maxLength != null;
  const rows = Math.max(1, minRows);
  const describedBy =
    [props['aria-describedby'], hasCounter ? counterId : null].filter(Boolean).join(' ') ||
    undefined;

  useAutoGrow(groupRef, value);

  return (
    <AriaTextField
      {...props}
      value={value}
      onChange={setValue}
      maxLength={maxLength}
      aria-describedby={describedBy}
      data-slot="text-area"
      data-size={size}
      data-variant={variant}
      className={composeRenderProps(className, (className) =>
        fieldStyles({ size, variant }).root({ className }),
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
        counter={
          hasCounter ? (
            <FieldCounter id={counterId} count={value.length} max={maxLength} labels={labels} />
          ) : null
        }
      >
        <FieldGroup ref={groupRef} isReadOnly={props.isReadOnly} multiline>
          <AriaTextArea
            ref={inputRef}
            rows={rows}
            placeholder={placeholder}
            data-slot="input"
            data-resize={resize}
            style={
              {
                '--field-min-rows': rows,
                '--field-max-rows': Math.max(rows, maxRows),
              } as CSSProperties
            }
            className={cn(
              fieldStyles({ size, variant, multiline: true }).input(),
              textAreaStyles({ resize }),
            )}
          />
        </FieldGroup>
      </Field>
    </AriaTextField>
  );
}
