'use client';

import { useId, type ReactNode, type Ref } from 'react';
import {
  FieldError,
  SwitchButton,
  SwitchField,
  Text,
  composeRenderProps,
  type SwitchButtonRenderProps,
  type SwitchFieldProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useIcons, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const switchStyles = tv({
  slots: {
    root: 'group/switch flex flex-col items-start gap-1',
    target: 'cursor-default text-on-surface select-none data-[disabled]:text-on-surface/38',
    track:
      'focus-ring relative inline-flex h-8 w-13 shrink-0 rounded-full border-2 transition-[background-color,border-color] duration-150 ease-standard motion-reduce:transition-none',
    thumb:
      'absolute inset-y-0 flex w-7 items-center justify-center transition-[inset-inline-start] duration-(--ds-duration-spatial-fast) ease-spatial-fast motion-reduce:transition-none',
    stateLayer: 'state-layer absolute size-10 rounded-full',
    handle:
      'relative grid shrink-0 place-items-center rounded-full transition-[width,height,background-color] duration-[var(--ds-duration-spatial-fast),var(--ds-duration-spatial-fast),var(--ds-duration-effect-fast)] ease-[var(--ds-ease-spatial-fast),var(--ds-ease-spatial-fast),var(--ds-ease-effect-fast)] motion-reduce:transition-none',
    handleIcon:
      'grid animate-ds-fade-in place-items-center motion-reduce:animate-none [&_svg]:size-4',
    icon: 'grid size-6 shrink-0 place-items-center text-on-surface-variant group-data-[disabled]/switch:text-on-surface/38 [&_svg]:size-6',
    content: 'flex min-w-0 flex-col gap-0.5',
    label: 'text-body-lg',
    required: 'ms-0.5 text-error',
    description:
      'text-body-md text-on-surface-variant group-data-[disabled]/switch:text-on-surface/38',
    error: 'text-body-sm text-error',
  },
  variants: {
    variant: {
      default: { target: 'inline-flex max-w-full items-start gap-4', content: 'pt-1' },
      row: {
        target: 'focus-ring-inset flex min-h-14 w-full items-center gap-4 rounded-md px-4 py-3',
        content: 'flex-1',
        error: 'px-4',
      },
    },
    labelPlacement: {
      start: '',
      end: '',
    },
    interactive: {
      true: '',
      false: '',
    },
    selected: {
      true: { thumb: 'inset-s-5', stateLayer: 'text-primary' },
      false: { thumb: 'inset-s-0', stateLayer: 'text-on-surface' },
    },
    trackTone: {
      off: { track: 'border-outline bg-surface-container-highest' },
      offInvalid: { track: 'border-error bg-surface-container-highest' },
      on: { track: 'border-primary bg-primary' },
      offDisabled: { track: 'border-on-surface/12 bg-surface-container-highest/12' },
      onDisabled: { track: 'border-transparent bg-on-surface/12' },
    },
    handleTone: {
      idle: { handle: 'bg-outline text-surface-container-highest' },
      active: { handle: 'bg-on-surface-variant text-surface-container-highest' },
      selected: { handle: 'bg-on-primary text-primary' },
      selectedActive: { handle: 'bg-primary-container text-on-primary-container' },
      disabled: { handle: 'bg-on-surface/38 text-surface-container-highest/38' },
      disabledSelected: { handle: 'bg-surface text-on-surface/38' },
    },
    handleSize: {
      sm: { handle: 'size-4' },
      md: { handle: 'size-6' },
      lg: { handle: 'size-7' },
    },
    instant: {
      true: { track: 'transition-none', thumb: 'transition-none', handle: 'transition-none' },
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'default', labelPlacement: 'end', class: { error: 'ps-17' } },
    { variant: 'row', interactive: true, class: { target: 'state-layer' } },
    { instant: true, class: { handleIcon: 'animate-none' } },
  ],
  defaultVariants: {
    variant: 'default',
    labelPlacement: 'end',
    interactive: true,
    selected: false,
    trackTone: 'off',
    handleTone: 'idle',
    handleSize: 'sm',
    instant: false,
  },
});

export type SwitchStyleProps = Pick<
  VariantProps<typeof switchStyles>,
  'variant' | 'labelPlacement'
>;

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

function trackToneOf({ isSelected, isDisabled, isInvalid }: SwitchButtonRenderProps) {
  if (isDisabled) return isSelected ? 'onDisabled' : 'offDisabled';
  if (isSelected) return 'on';
  return isInvalid ? 'offInvalid' : 'off';
}

function handleToneOf({
  isSelected,
  isDisabled,
  isHovered,
  isPressed,
  isFocusVisible,
}: SwitchButtonRenderProps) {
  if (isDisabled) return isSelected ? 'disabledSelected' : 'disabled';
  const isActive = isHovered || isPressed || isFocusVisible;
  if (isSelected) return isActive ? 'selectedActive' : 'selected';
  return isActive ? 'active' : 'idle';
}

interface SwitchTrackProps {
  state: SwitchButtonRenderProps;
  isRow: boolean;
  instant: boolean;
  selectedIcon: ReactNode;
  unselectedIcon: ReactNode;
}

function SwitchTrack({ state, isRow, instant, selectedIcon, unselectedIcon }: SwitchTrackProps) {
  const glyph = state.isSelected ? selectedIcon : unselectedIcon;
  const isPressed = state.isPressed && !state.isDisabled && !state.isReadOnly;
  const styles = switchStyles({
    selected: state.isSelected,
    trackTone: trackToneOf(state),
    handleTone: handleToneOf(state),
    handleSize: isPressed ? 'lg' : state.isSelected || unselectedIcon != null ? 'md' : 'sm',
    instant,
  });

  return (
    <span
      aria-hidden="true"
      data-slot="track"
      data-focus-visible={(!isRow && state.isFocusVisible) || undefined}
      className={styles.track()}
    >
      <span data-slot="thumb" className={styles.thumb()}>
        {isRow ? null : (
          <span
            data-slot="state-layer"
            data-hovered={state.isHovered || undefined}
            data-pressed={state.isPressed || undefined}
            data-focus-visible={state.isFocusVisible || undefined}
            data-disabled={state.isDisabled || state.isReadOnly || undefined}
            className={styles.stateLayer()}
          />
        )}
        <span data-slot="handle" className={styles.handle()}>
          {glyph != null ? (
            <span
              key={state.isSelected ? 'selected' : 'unselected'}
              data-slot="handle-icon"
              className={styles.handleIcon()}
            >
              {glyph}
            </span>
          ) : null}
        </span>
      </span>
    </span>
  );
}

export interface SwitchProps
  extends Omit<SwitchFieldProps, 'children' | 'className'>, SwitchStyleProps {
  children?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
  icon?: ReactNode;
  selectedIcon?: ReactNode;
  unselectedIcon?: ReactNode;
  className?: SwitchFieldProps['className'];
  ref?: Ref<HTMLDivElement>;
}

export function Switch({
  children,
  description,
  errorMessage,
  variant = 'default',
  labelPlacement = 'end',
  icon,
  selectedIcon,
  unselectedIcon,
  className,
  ...props
}: SwitchProps) {
  const icons = useIcons();
  const labelId = useId();
  const instant = useMotionPreference().preference !== 'system';

  const isRow = variant === 'row';
  const placement = isRow ? 'start' : labelPlacement;
  const hasLabel = children != null;
  const hasDescription = description != null;
  const hasContent = hasLabel || hasDescription;
  const styles = switchStyles({ variant, labelPlacement: placement });
  const resolvedSelectedIcon = selectedIcon === undefined ? <icons.check /> : selectedIcon;

  return (
    <SwitchField
      {...props}
      aria-labelledby={labelledByWithDescription(props, labelId, hasLabel, hasDescription)}
      data-slot="switch"
      data-variant={variant}
      data-label-placement={placement}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      <SwitchButton
        data-slot="target"
        className={({ isReadOnly }) => styles.target({ interactive: !isReadOnly })}
      >
        {(state) => {
          const track = (
            <SwitchTrack
              state={state}
              isRow={isRow}
              instant={instant}
              selectedIcon={resolvedSelectedIcon}
              unselectedIcon={unselectedIcon}
            />
          );
          const content = hasContent ? (
            <span data-slot="content" className={styles.content()}>
              {hasLabel ? (
                <span id={labelId} data-slot="label" className={styles.label()}>
                  {children}
                  {props.isRequired ? (
                    <span aria-hidden="true" data-slot="required" className={styles.required()}>
                      *
                    </span>
                  ) : null}
                </span>
              ) : null}
              {hasDescription ? (
                <Text slot="description" data-slot="description" className={styles.description()}>
                  {description}
                </Text>
              ) : null}
            </span>
          ) : null;

          return (
            <>
              {isRow && icon != null ? (
                <span aria-hidden="true" data-slot="icon" className={styles.icon()}>
                  {icon}
                </span>
              ) : null}
              {placement === 'start' ? content : track}
              {placement === 'start' ? track : content}
            </>
          );
        }}
      </SwitchButton>
      <FieldError data-slot="error" className={styles.error()}>
        {errorMessage}
      </FieldError>
    </SwitchField>
  );
}
