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
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const switchStyles = tv({
  slots: {
    root: 'group/switch flex flex-col items-start gap-1',
    target: [
      'group/switch-target no-tap-highlight cursor-pointer text-sm text-on-surface select-none',
      'data-[readonly]:cursor-default',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    track: [
      'focus-ring relative inline-flex h-(--switch-track-height) w-(--switch-track-width) shrink-0 rounded-control',
      'transition-[background-color,box-shadow] duration-250 ease-out motion-reduce:transition-none',
    ],
    thumb: [
      'absolute inset-y-0.5 grid w-(--switch-thumb-width) place-items-center rounded-control bg-surface-thumb shadow-xs [--switch-thumb-width:var(--switch-thumb-rest)]',
      'transition-[inset-inline-start,width] duration-300 ease-fluid motion-reduce:transition-none',
    ],
    thumbIcon:
      'grid animate-ds-fade-in place-items-center motion-reduce:animate-none [&_svg]:size-(--switch-icon)',
    icon: 'grid size-5 shrink-0 place-items-center text-on-surface-variant [&_svg]:size-5',
    content: 'flex min-w-0 flex-col gap-0.5',
    label: '',
    required: 'ms-0.5 text-error',
    description: 'text-xs text-on-surface-variant',
    error: 'text-xs text-error',
  },
  variants: {
    variant: {
      default: {
        target: 'inline-flex max-w-full items-start gap-3',
        content: 'pt-(--switch-label-offset)',
      },
      row: {
        target: [
          'focus-ring-inset flex min-h-12 w-full items-center gap-3 rounded-item px-3 py-2.5',
          'transition-[background-color] duration-100 ease-out motion-reduce:transition-none',
        ],
        content: 'flex-1',
        label: 'font-medium',
        error: 'px-3',
      },
    },
    size: {
      sm: {
        root: '[--switch-icon:0.625rem] [--switch-label-offset:0px] [--switch-thumb-rest:1.375rem] [--switch-track-height:1.25rem] [--switch-track-width:2.5rem]',
      },
      md: {
        root: '[--switch-icon:0.75rem] [--switch-label-offset:0.125rem] [--switch-thumb-rest:1.75rem] [--switch-track-height:1.5rem] [--switch-track-width:3rem]',
      },
    },
    labelPlacement: {
      start: '',
      end: '',
    },
    interactive: {
      true: {
        thumb:
          'group-data-[pressed]/switch-target:[--switch-thumb-width:calc(var(--switch-thumb-rest)+0.25rem)]',
      },
      false: '',
    },
    selected: {
      true: {
        track: 'bg-primary-solid',
        thumb: 'inset-s-[calc(100%-var(--switch-thumb-width)-0.125rem)]',
        thumbIcon: 'text-primary-solid',
      },
      false: {
        track: 'bg-outline-variant',
        thumb: 'inset-s-0.5',
        thumbIcon: 'text-[color:light-dark(var(--on-surface-variant),var(--inverse-on-surface))]',
      },
    },
    invalid: {
      true: '',
      false: '',
    },
    instant: {
      true: { track: 'transition-none', thumb: 'transition-none', thumbIcon: 'animate-none' },
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'default',
      labelPlacement: 'end',
      class: { error: 'ps-[calc(var(--switch-track-width)+0.75rem)]' },
    },
    {
      variant: 'row',
      interactive: true,
      class: { target: 'data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover' },
    },
    {
      interactive: true,
      selected: true,
      class: { track: 'group-data-[hovered]/switch-target:bg-primary-solid-hover' },
    },
    {
      interactive: true,
      selected: false,
      class: {
        track:
          'group-data-[hovered]/switch-target:bg-[color-mix(in_oklab,var(--outline-variant)_82%,var(--on-surface))]',
      },
    },
    {
      invalid: true,
      selected: false,
      class: { track: 'inset-ring-2 inset-ring-error [--focus-color:var(--error)]' },
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'md',
    labelPlacement: 'end',
    interactive: true,
    selected: false,
    invalid: false,
    instant: false,
  },
});

export type SwitchSize = 'sm' | 'md';

export type SwitchStyleProps = Pick<
  VariantProps<typeof switchStyles>,
  'variant' | 'labelPlacement' | 'size'
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

interface SwitchTrackProps {
  state: SwitchButtonRenderProps;
  isRow: boolean;
  instant: boolean;
  selectedIcon: ReactNode;
  unselectedIcon: ReactNode;
}

function SwitchTrack({ state, isRow, instant, selectedIcon, unselectedIcon }: SwitchTrackProps) {
  const glyph = state.isSelected ? selectedIcon : unselectedIcon;
  const styles = switchStyles({
    selected: state.isSelected,
    invalid: state.isInvalid,
    interactive: !state.isDisabled && !state.isReadOnly,
    instant,
  });

  return (
    <span
      aria-hidden="true"
      data-slot="track"
      data-selected={state.isSelected || undefined}
      data-focus-visible={(!isRow && state.isFocusVisible) || undefined}
      className={styles.track()}
    >
      <span data-slot="thumb" className={styles.thumb()}>
        {glyph != null ? (
          <span
            key={state.isSelected ? 'selected' : 'unselected'}
            data-slot="thumb-icon"
            className={styles.thumbIcon()}
          >
            {glyph}
          </span>
        ) : null}
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
  size = 'md',
  labelPlacement = 'end',
  icon,
  selectedIcon,
  unselectedIcon,
  className,
  ...props
}: SwitchProps) {
  const labelId = useId();
  const instant = useMotionPreference().preference !== 'system';

  const isRow = variant === 'row';
  const placement = isRow ? 'start' : labelPlacement;
  const hasLabel = children != null;
  const hasDescription = description != null;
  const hasContent = hasLabel || hasDescription;
  const styles = switchStyles({ variant, size, labelPlacement: placement });

  return (
    <SwitchField
      {...props}
      aria-labelledby={labelledByWithDescription(props, labelId, hasLabel, hasDescription)}
      data-slot="switch"
      data-variant={variant}
      data-size={size}
      data-label-placement={placement}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      <SwitchButton
        data-slot="target"
        className={({ isReadOnly, isDisabled }) =>
          styles.target({ interactive: !isReadOnly && !isDisabled })
        }
      >
        {(state) => {
          const track = (
            <SwitchTrack
              state={state}
              isRow={isRow}
              instant={instant}
              selectedIcon={selectedIcon}
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
