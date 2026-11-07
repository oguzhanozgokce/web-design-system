'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  InputContext,
  Label as AriaLabel,
  Meter,
  TextField as AriaTextField,
  ToggleButton,
  composeRenderProps,
  useContextProps,
  type KeyboardEvent,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';
import {
  Field,
  FieldAdornment,
  FieldGroup,
  FieldInput,
  fieldStyles,
  type FieldBaseProps,
  type FieldInputProps,
  type FieldLabels,
} from '@/registry/ds/ui/field';
import { Tooltip, TooltipTrigger } from '@/registry/ds/ui/tooltip';

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

export interface PasswordFieldLabels {
  showPassword: string;
  hidePassword: string;
  capsLockOn: string;
  strength: string;
  strength0: string;
  strength1: string;
  strength2: string;
  strength3: string;
  strength4: string;
  requirements: string;
  ruleMet: LabelTemplate<{ rule: string }>;
  ruleUnmet: LabelTemplate<{ rule: string }>;
  strengthAnnouncement: LabelTemplate<{ strength: string }>;
}

export const defaultPasswordFieldLabels: PasswordFieldLabels = {
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  capsLockOn: 'Caps Lock is on',
  strength: 'Password strength',
  strength0: 'Too weak',
  strength1: 'Weak',
  strength2: 'Fair',
  strength3: 'Good',
  strength4: 'Strong',
  requirements: 'Password requirements',
  ruleMet: '{rule}: met.',
  ruleUnmet: '{rule}: not met.',
  strengthAnnouncement: 'Password strength: {strength}.',
};

export const passwordFieldStyles = tv({
  slots: {
    reveal: 'data-[selected]:text-on-surface',
    capsLock:
      'flex animate-ds-fade-in items-center gap-1 text-xs text-on-surface-variant motion-reduce:animate-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-warning',
    strength: 'grid gap-1.5 pt-0.5',
    track: 'grid grid-cols-4 gap-1',
    segment:
      'h-1 rounded-control bg-neutral-soft transition-colors duration-200 ease-out motion-reduce:transition-none',
    summary: 'flex items-baseline justify-between gap-3 text-xs',
    strengthLabel: 'text-on-surface-variant',
    strengthValue: 'font-medium',
    rules: 'grid gap-1 text-xs',
    rule: 'flex items-start gap-1.5 text-on-surface-variant data-[met]:text-on-surface [&_svg]:size-4 [&_svg]:shrink-0',
    ruleIcon: 'text-on-surface-variant',
  },
  variants: {
    level: {
      '0': { strengthValue: 'text-error' },
      '1': { segment: 'data-[filled]:bg-error-solid', strengthValue: 'text-error' },
      '2': { segment: 'data-[filled]:bg-warning-solid', strengthValue: 'text-warning' },
      '3': { segment: 'data-[filled]:bg-success-solid', strengthValue: 'text-success' },
      '4': { segment: 'data-[filled]:bg-success-solid', strengthValue: 'text-success' },
    },
    isMet: {
      true: { ruleIcon: 'text-success' },
    },
    isEmpty: {
      true: { strengthValue: 'invisible' },
    },
  },
});

export type PasswordFieldVariant = 'outline' | 'soft';

const segments = [1, 2, 3, 4] as const;

const strengthKeys = ['strength0', 'strength1', 'strength2', 'strength3', 'strength4'] as const;

function evaluateRules(rules: PasswordRule[] | undefined, value: string) {
  return (rules ?? []).map((rule) => rule.test(value));
}

function toKey(results: boolean[]) {
  return results.map((isMet) => (isMet ? '1' : '0')).join('');
}

function toStrength(value: number): PasswordStrength {
  return Math.min(4, Math.max(0, Math.round(value))) as PasswordStrength;
}

function ConcealedInput({ ref, ...props }: FieldInputProps) {
  const [{ value, onChange, ...merged }, inputRef] = useContextProps(props, ref, InputContext);
  const text = value == null ? '' : String(value);
  const committed = useRef(text);

  useLayoutEffect(() => {
    committed.current = text;
    const input = inputRef.current;
    if (input && input.value !== text) input.value = text;
  }, [inputRef, text]);

  function restoreRejectedChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    queueMicrotask(() => {
      const input = inputRef.current;
      if (input && input.value !== committed.current) input.value = committed.current;
    });
  }

  return (
    <InputContext value={null}>
      <FieldInput {...merged} onChange={restoreRejectedChange} ref={inputRef} />
    </InputContext>
  );
}

interface ModifierSource {
  getModifierState(key: 'CapsLock'): boolean;
}

export interface PasswordFieldProps
  extends
    Omit<
      AriaTextFieldProps,
      'children' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'autoComplete'
    >,
    FieldBaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoComplete?: 'current-password' | 'new-password';
  isRevealed?: boolean;
  defaultRevealed?: boolean;
  onRevealChange?: (isRevealed: boolean) => void;
  showCapsLockWarning?: boolean;
  strength?: PasswordStrength;
  rules?: PasswordRule[];
  startAdornment?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  labels?: Partial<PasswordFieldLabels & FieldLabels>;
}

export function PasswordField({
  label,
  isLabelHidden,
  description,
  errorMessage,
  necessityIndicator,
  size = 'md',
  variant = 'outline',
  value: valueProp,
  defaultValue,
  onChange,
  placeholder,
  autoComplete,
  isRevealed: isRevealedProp,
  defaultRevealed = false,
  onRevealChange,
  showCapsLockWarning = true,
  strength,
  rules,
  startAdornment,
  inputRef,
  labels,
  onKeyDown,
  onKeyUp,
  onBlur,
  className,
  ...props
}: PasswordFieldProps) {
  const t = useLabels('passwordField', defaultPasswordFieldLabels, labels);
  const icons = useIcons();
  const generatedId = useId();
  const rulesId = useId();
  const inputId = props.id ?? generatedId;
  const groupRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setRevealed] = useControllableState(
    isRevealedProp,
    defaultRevealed,
    onRevealChange,
  );
  const [isCapsLockOn, setCapsLockOn] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(() => ({
    isEmpty: !defaultValue,
    results: evaluateRules(rules, defaultValue ?? ''),
  }));
  const [announcement, setAnnouncement] = useState({ message: '', attempt: 0 });

  const isControlled = valueProp !== undefined;
  const results = isControlled ? evaluateRules(rules, valueProp) : uncontrolled.results;
  const isEmpty = isControlled ? valueProp === '' : uncontrolled.isEmpty;
  const hasRules = rules != null && rules.length > 0;
  const metCount = results.filter(Boolean).length;
  const derivedStrength = hasRules ? toStrength((metCount / rules.length) * 4) : undefined;
  const measured = strength === undefined ? derivedStrength : toStrength(strength);
  const hasMeter = measured !== undefined;
  const level: PasswordStrength = isEmpty ? 0 : (measured ?? 0);
  const strengthText = t[strengthKeys[level]];
  const resultsKey = toKey(results);
  const [announced, setAnnounced] = useState({ resultsKey, level });

  const changes: string[] = [];
  rules?.forEach((rule, index) => {
    const wasMet = announced.resultsKey[index] === '1';
    const isMet = resultsKey[index] === '1';
    if (wasMet !== isMet) {
      changes.push(t.format(isMet ? 'ruleMet' : 'ruleUnmet', { rule: rule.label }));
    }
  });
  if (hasMeter && !isEmpty && announced.level !== level) {
    changes.push(t.format('strengthAnnouncement', { strength: strengthText }));
  }
  const change = changes.join(' ');

  useEffect(() => {
    if (announced.resultsKey === resultsKey && announced.level === level) return;
    const timer = setTimeout(() => {
      setAnnounced({ resultsKey, level });
      const container = groupRef.current;
      if (!change || !container?.contains(container.ownerDocument.activeElement)) return;
      setAnnouncement((current) => ({ message: change, attempt: current.attempt + 1 }));
    }, 750);
    return () => clearTimeout(timer);
  }, [announced, resultsKey, level, change]);

  useEffect(() => {
    if (isControlled) return;
    const input = groupRef.current?.querySelector('input');
    if (!input) return;
    const next = evaluateRules(rules, input.value);
    setUncontrolled((current) =>
      toKey(current.results) === toKey(next) ? current : { ...current, results: next },
    );
  }, [rules, isControlled]);

  useEffect(() => {
    const form = groupRef.current?.querySelector('input')?.form;
    if (!form) return;
    const conceal = () => setRevealed(false);
    form.addEventListener('submit', conceal);
    form.addEventListener('reset', conceal);
    return () => {
      form.removeEventListener('submit', conceal);
      form.removeEventListener('reset', conceal);
    };
  }, [setRevealed]);

  function readCapsLock(event: ModifierSource) {
    if (!showCapsLockWarning) return;
    setCapsLockOn(event.getModifierState('CapsLock'));
  }

  function handleKeyDown(event: KeyboardEvent) {
    readCapsLock(event);
    if (onKeyDown) onKeyDown(event);
    else event.continuePropagation();
  }

  function handleKeyUp(event: KeyboardEvent) {
    readCapsLock(event);
    if (onKeyUp) onKeyUp(event);
    else event.continuePropagation();
  }

  function handleChange(next: string) {
    if (!isControlled) {
      setUncontrolled({ isEmpty: next === '', results: evaluateRules(rules, next) });
    }
    onChange?.(next);
  }

  const ruleIds = hasRules ? rules.map((_, index) => `${rulesId}-${index}`) : [];
  const describedBy =
    [props['aria-describedby'], ...ruleIds].filter(Boolean).join(' ') || undefined;
  const styles = passwordFieldStyles({ level: `${level}`, isEmpty });

  return (
    <AriaTextField
      {...props}
      id={inputId}
      value={valueProp}
      defaultValue={defaultValue}
      onChange={handleChange}
      type={isRevealed ? 'text' : 'password'}
      autoComplete={autoComplete ?? (hasMeter ? 'new-password' : 'current-password')}
      aria-describedby={describedBy}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={(event) => {
        setCapsLockOn(false);
        onBlur?.(event);
      }}
      data-slot="password-field"
      data-size={size}
      data-variant={variant}
      data-revealed={isRevealed || undefined}
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
      >
        <FieldGroup ref={groupRef} isReadOnly={props.isReadOnly}>
          {startAdornment != null ? (
            <FieldAdornment placement="start">{startAdornment}</FieldAdornment>
          ) : null}
          <ConcealedInput
            ref={inputRef}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            onPointerDown={readCapsLock}
          />
          <TooltipTrigger>
            <ToggleButton
              isSelected={isRevealed}
              onChange={setRevealed}
              isDisabled={props.isDisabled}
              preventFocusOnPress
              aria-label={t.showPassword}
              aria-controls={inputId}
              data-slot="reveal-button"
              className={fieldStyles({ size }).action({ className: styles.reveal() })}
            >
              {isRevealed ? <icons.visibilityOff /> : <icons.visibility />}
            </ToggleButton>
            <Tooltip>{isRevealed ? t.hidePassword : t.showPassword}</Tooltip>
          </TooltipTrigger>
        </FieldGroup>
        {showCapsLockWarning ? (
          <>
            <span aria-live="polite" data-slot="caps-lock-announcer" className="sr-only">
              {isCapsLockOn ? t.capsLockOn : ''}
            </span>
            {isCapsLockOn ? (
              <p aria-hidden="true" data-slot="caps-lock" className={styles.capsLock()}>
                <icons.warning />
                {t.capsLockOn}
              </p>
            ) : null}
          </>
        ) : null}
      </Field>
      {hasMeter ? (
        <Meter
          value={level}
          minValue={0}
          maxValue={4}
          valueLabel={strengthText}
          data-slot="strength"
          data-level={level}
          className={styles.strength()}
        >
          <div data-slot="strength-track" className={styles.track()}>
            {segments.map((segment) => (
              <span
                key={segment}
                data-slot="strength-segment"
                data-filled={segment <= level || undefined}
                className={styles.segment()}
              />
            ))}
          </div>
          <div className={styles.summary()}>
            <AriaLabel className={styles.strengthLabel()}>{t.strength}</AriaLabel>
            <span data-slot="strength-value" className={styles.strengthValue()}>
              {strengthText}
            </span>
          </div>
        </Meter>
      ) : null}
      {hasRules ? (
        <ul aria-label={t.requirements} data-slot="rules" className={styles.rules()}>
          {rules.map((rule, index) => {
            const isMet = results[index] ?? false;
            const Icon = isMet ? icons.check : icons.remove;
            return (
              <li
                key={rule.label}
                data-slot="rule"
                data-met={isMet || undefined}
                className={styles.rule()}
              >
                <Icon className={passwordFieldStyles({ isMet }).ruleIcon()} />
                <span aria-hidden="true">{rule.label}</span>
                <span id={ruleIds[index]} className="sr-only">
                  {t.format(isMet ? 'ruleMet' : 'ruleUnmet', { rule: rule.label })}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
      {hasMeter || hasRules ? (
        <span aria-live="polite" data-slot="announcer" className="sr-only">
          {announcement.message ? (
            <span key={announcement.attempt}>{announcement.message}</span>
          ) : null}
        </span>
      ) : null}
    </AriaTextField>
  );
}
