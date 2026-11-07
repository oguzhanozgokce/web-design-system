'use client';

import { useId, useRef, type ReactNode, type Ref } from 'react';
import {
  TextField as AriaTextField,
  composeRenderProps,
  type KeyboardEvent,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';
import {
  Field,
  FieldAdornment,
  FieldButton,
  FieldCounter,
  FieldGroup,
  FieldInput,
  fieldStyles,
  type FieldBaseProps,
  type FieldLabels,
} from '@/registry/ds/ui/field';

const leftToRightTypes = new Set(['email', 'url', 'tel']);

export interface TextFieldLabels {
  clear: string;
}

export const defaultTextFieldLabels: TextFieldLabels = {
  clear: 'Clear',
};

export interface TextFieldProps
  extends
    Omit<AriaTextFieldProps, 'children' | 'value' | 'defaultValue' | 'onChange'>,
    FieldBaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  isClearable?: boolean;
  onClear?: () => void;
  showCounter?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  labels?: Partial<TextFieldLabels & FieldLabels>;
}

export function TextField({
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
  startAdornment,
  endAdornment,
  isClearable = false,
  onClear,
  showCounter = true,
  inputRef,
  labels,
  maxLength,
  onKeyDown,
  className,
  ...props
}: TextFieldProps) {
  const t = useLabels('textField', defaultTextFieldLabels, labels);
  const icons = useIcons();
  const counterId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange);
  const hasCounter = showCounter && maxLength != null;
  const canClear = isClearable && !props.isDisabled && !props.isReadOnly && value !== '';
  const isLeftToRight = props.type != null && leftToRightTypes.has(props.type);
  const describedBy =
    [props['aria-describedby'], hasCounter ? counterId : null].filter(Boolean).join(' ') ||
    undefined;

  function clear() {
    setValue('');
    onClear?.();
    groupRef.current?.querySelector('input')?.focus();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && canClear && !event.nativeEvent.isComposing) {
      event.preventDefault();
      clear();
      return;
    }
    if (onKeyDown) onKeyDown(event);
    else event.continuePropagation();
  }

  return (
    <AriaTextField
      {...props}
      value={value}
      onChange={setValue}
      maxLength={maxLength}
      aria-describedby={describedBy}
      onKeyDown={isClearable ? handleKeyDown : onKeyDown}
      data-slot="text-field"
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
        <FieldGroup
          ref={groupRef}
          isReadOnly={props.isReadOnly}
          dir={isLeftToRight ? 'ltr' : undefined}
        >
          {startAdornment != null ? (
            <FieldAdornment placement="start">{startAdornment}</FieldAdornment>
          ) : null}
          <FieldInput ref={inputRef} placeholder={placeholder} />
          {endAdornment != null ? (
            <FieldAdornment placement="end">{endAdornment}</FieldAdornment>
          ) : null}
          {canClear ? (
            <FieldButton
              aria-label={t.clear}
              excludeFromTabOrder
              preventFocusOnPress
              onPress={clear}
              data-slot="clear-button"
            >
              <icons.close />
            </FieldButton>
          ) : null}
        </FieldGroup>
      </Field>
    </AriaTextField>
  );
}
