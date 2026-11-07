'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { Separator, type SeparatorProps } from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { useLabels } from '@/registry/ds/ui/ds-provider';

export type DividerInset = 'none' | 'start' | 'middle';

export type DividerLabelPosition = 'center' | 'start' | 'end';

export type DividerVariant = 'subtle' | 'strong';

export const dividerStyles = tv({
  slots: {
    root: 'shrink-0 self-stretch border-0',
    line: 'shrink grow forced-color-adjust-none forced-colors:bg-[CanvasText]',
    label: 'shrink-0 text-xs text-on-surface-variant',
  },
  variants: {
    variant: {
      subtle: { line: 'bg-outline-subtle' },
      strong: { line: 'bg-outline-variant' },
    },
    orientation: {
      horizontal: { line: 'h-px min-w-4' },
      vertical: { line: 'min-h-2 w-px' },
    },
    inset: {
      none: '',
      start: '',
      middle: '',
    },
    labelled: {
      true: { root: 'flex items-center' },
      false: '',
    },
  },
  compoundVariants: [
    { labelled: false, variant: 'subtle', class: { root: 'bg-outline-subtle' } },
    { labelled: false, variant: 'strong', class: { root: 'bg-outline-variant' } },
    {
      labelled: false,
      class: { root: 'forced-color-adjust-none forced-colors:bg-[CanvasText]' },
    },
    { labelled: false, orientation: 'horizontal', class: { root: 'h-px' } },
    { labelled: false, orientation: 'vertical', class: { root: 'w-px' } },
    { labelled: true, orientation: 'horizontal', class: { root: 'flex-row', label: 'px-3' } },
    { labelled: true, orientation: 'vertical', class: { root: 'flex-col', label: 'py-2' } },
    {
      orientation: 'horizontal',
      inset: 'start',
      class: { root: 'ms-[var(--divider-inset,1rem)]' },
    },
    {
      orientation: 'horizontal',
      inset: 'middle',
      class: { root: 'mx-[var(--divider-inset,1rem)]' },
    },
    {
      orientation: 'vertical',
      inset: 'start',
      class: { root: 'mt-[var(--divider-inset,0.5rem)]' },
    },
    {
      orientation: 'vertical',
      inset: 'middle',
      class: { root: 'my-[var(--divider-inset,0.5rem)]' },
    },
  ],
  defaultVariants: {
    variant: 'subtle',
    orientation: 'horizontal',
    inset: 'none',
    labelled: false,
  },
});

export interface DividerProps extends Omit<
  SeparatorProps,
  'className' | 'elementType' | 'render' | 'children'
> {
  variant?: DividerVariant;
  inset?: DividerInset;
  labelPosition?: DividerLabelPosition;
  children?: ReactNode;
  className?: string;
}

export function Divider({
  variant = 'subtle',
  orientation = 'horizontal',
  inset = 'none',
  labelPosition = 'center',
  children,
  className,
  ...props
}: DividerProps) {
  const labelId = useId();
  const labelled = children != null && children !== false;
  const styles = dividerStyles({ variant, orientation, inset, labelled });
  const rootProps = {
    'data-slot': 'divider',
    'data-variant': variant,
    'data-orientation': orientation,
    'data-inset': inset,
    className: styles.root({ className }),
  };

  if (!labelled) {
    return <Separator {...props} {...rootProps} orientation={orientation} />;
  }

  return (
    <Separator
      {...props}
      {...rootProps}
      data-label-position={labelPosition}
      orientation={orientation}
      elementType="div"
      aria-labelledby={props['aria-label'] ? undefined : (props['aria-labelledby'] ?? labelId)}
      render={(domProps) => (
        <div {...(domProps as ComponentProps<'div'>)}>
          {labelPosition !== 'start' ? (
            <span aria-hidden="true" data-slot="divider-line" className={styles.line()} />
          ) : null}
          <span id={labelId} data-slot="divider-label" className={styles.label()}>
            {children}
          </span>
          {labelPosition !== 'end' ? (
            <span aria-hidden="true" data-slot="divider-line" className={styles.line()} />
          ) : null}
        </div>
      )}
    />
  );
}

export interface DividerLabels {
  or: string;
}

export const defaultDividerLabels: DividerLabels = {
  or: 'or',
};

export interface OrDividerProps extends Omit<DividerProps, 'children'> {
  labels?: Partial<DividerLabels>;
}

export function OrDivider({ labels, ...props }: OrDividerProps) {
  const t = useLabels('divider', defaultDividerLabels, labels);
  return <Divider {...props}>{t.or}</Divider>;
}
