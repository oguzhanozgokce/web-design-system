'use client';

import {
  createContext,
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Button as AriaButton,
  CheckboxButton,
  CheckboxField,
  CheckboxGroup as AriaCheckboxGroup,
  FieldError,
  Label,
  Link as AriaLink,
  ProgressBar,
  RadioButton,
  RadioField,
  RadioGroup as AriaRadioGroup,
  Text,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
  type CheckboxButtonRenderProps,
  type CheckboxFieldProps,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  type LinkProps as AriaLinkProps,
  type PressEvent,
  type RadioButtonRenderProps,
  type RadioFieldProps,
  type RadioGroupProps as AriaRadioGroupProps,
  type ValidationResult,
} from 'react-aria-components';
import { cn, tv } from '@/registry/ds/lib/utils';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { Spinner } from '@/registry/ds/ui/spinner';

export type CardVariant = 'elevated' | 'filled' | 'outlined';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export type SurfaceLevel =
  | 'surface'
  | 'surface-container-lowest'
  | 'surface-container-low'
  | 'surface-container'
  | 'surface-container-high'
  | 'surface-container-highest';

export interface CardStyleProps {
  variant?: CardVariant;
  padding?: CardPadding;
  surface?: SurfaceLevel;
}

const surfaceLadder: readonly SurfaceLevel[] = [
  'surface',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
];

const restingSurface: Record<CardVariant, SurfaceLevel> = {
  elevated: 'surface-container-low',
  filled: 'surface-container-highest',
  outlined: 'surface',
};

function surfaceRank(level: SurfaceLevel) {
  return level === 'surface-container-lowest' ? 0 : surfaceLadder.indexOf(level);
}

export const SurfaceContext = createContext<SurfaceLevel | null>(null);

export function useSurfaceLevel(): SurfaceLevel {
  return use(SurfaceContext) ?? 'surface';
}

function useCardSurface(variant: CardVariant, override: SurfaceLevel | undefined): SurfaceLevel {
  const parent = use(SurfaceContext);
  if (override) return override;
  const resting = restingSurface[variant];
  if (parent == null || parent === 'surface') return resting;
  const stepped = Math.min(surfaceRank(parent) + 1, surfaceLadder.length - 1);
  return surfaceLadder[Math.max(surfaceRank(resting), stepped)];
}

export const cardStyles = tv({
  slots: {
    root: [
      'relative flex min-w-0 flex-col rounded-(--card-radius) p-(--card-padding) text-start [--card-border:0px] [--card-radius:var(--radius-lg)]',
      'transition-[background-color,border-color,box-shadow,color] duration-150 ease-standard motion-reduce:transition-none',
      'forced-colors:border',
    ],
    body: 'flex min-w-0 flex-col gap-(--card-gap)',
    header: 'flex min-w-0 items-start gap-4',
    leading: 'inline-flex shrink-0 items-center justify-center',
    heading: 'flex min-w-0 flex-1 flex-col gap-1',
    action: '-my-1 flex shrink-0 items-center gap-1',
    title: 'block wrap-break-word',
    description: 'block text-body-md',
    content: 'block min-w-0 text-body-md',
    footer: 'flex flex-wrap items-center justify-end gap-2',
    pending:
      'absolute inset-0 grid animate-ds-fade-in-delayed place-items-center rounded-[inherit] text-primary',
  },
  variants: {
    variant: {
      elevated: { root: 'shadow-elevation-1' },
      filled: '',
      outlined: { root: 'border border-outline-variant [--card-border:1px]' },
    },
    padding: {
      none: { root: '[--card-gap:0px] [--card-padding:0px]', title: 'text-title-md' },
      sm: { root: '[--card-gap:0.5rem] [--card-padding:0.75rem]', title: 'text-title-sm' },
      md: { root: '[--card-gap:0.75rem] [--card-padding:1rem]', title: 'text-title-md' },
      lg: { root: '[--card-gap:1rem] [--card-padding:1.5rem]', title: 'text-title-lg' },
    },
    surface: {
      surface: { root: 'bg-surface' },
      'surface-container-lowest': { root: 'bg-surface-container-lowest' },
      'surface-container-low': { root: 'bg-surface-container-low' },
      'surface-container': { root: 'bg-surface-container' },
      'surface-container-high': { root: 'bg-surface-container-high' },
      'surface-container-highest': { root: 'bg-surface-container-highest' },
    },
    interactive: {
      true: { root: 'state-layer focus-ring cursor-default select-none' },
      false: '',
    },
    selectable: {
      true: '',
      false: '',
    },
    selected: {
      true: '',
      false: '',
    },
    disabled: {
      true: '',
      false: '',
    },
    invalid: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      interactive: true,
      disabled: false,
      variant: 'elevated',
      class: { root: 'data-[hovered]:shadow-elevation-2' },
    },
    {
      interactive: true,
      disabled: false,
      variant: ['filled', 'outlined'],
      class: { root: 'data-[hovered]:shadow-elevation-1' },
    },
    {
      selectable: true,
      variant: ['elevated', 'filled'],
      class: { root: 'border border-transparent [--card-border:1px]' },
    },
    {
      selected: false,
      disabled: false,
      class: { root: 'text-on-surface', description: 'text-on-surface-variant' },
    },
    {
      selected: true,
      disabled: false,
      class: {
        root: 'border-secondary bg-secondary-container text-on-secondary-container',
        description: 'text-on-secondary-container',
      },
    },
    {
      invalid: true,
      disabled: false,
      class: { root: 'border-error' },
    },
    {
      disabled: true,
      class: { root: 'text-on-surface/38 shadow-none', description: 'text-on-surface/38' },
    },
    {
      disabled: true,
      variant: 'outlined',
      class: { root: 'border-on-surface/12' },
    },
    {
      disabled: true,
      selected: true,
      class: { root: 'border-transparent bg-on-surface/12' },
    },
  ],
  defaultVariants: {
    variant: 'filled',
    padding: 'md',
    surface: 'surface-container-highest',
    interactive: false,
    selectable: false,
    selected: false,
    disabled: false,
    invalid: false,
  },
});

export const cardMediaStyles = tv({
  base: 'block shrink-0 overflow-hidden transition-opacity duration-150 ease-standard motion-reduce:transition-none',
  variants: {
    inset: {
      true: 'w-full rounded-md',
      false: [
        '-mx-(--card-padding) w-[calc(100%+var(--card-padding)*2)] max-w-none',
        'first:-mt-(--card-padding) first:rounded-t-[calc(var(--card-radius)-var(--card-border))]',
        'last:-mb-(--card-padding) last:rounded-b-[calc(var(--card-radius)-var(--card-border))]',
      ],
    },
    image: {
      true: 'bg-surface-container-highest object-cover',
      false: '',
    },
    disabled: {
      true: 'opacity-38',
      false: '',
    },
  },
  defaultVariants: {
    inset: false,
    image: false,
    disabled: false,
  },
});

const selectableCardIndicatorStyles = tv({
  slots: {
    indicator: [
      'pointer-events-none absolute inset-e-[max(var(--card-padding),0.75rem)] top-[max(var(--card-padding),0.75rem)] grid size-6 place-items-center border-2',
      'transition-[background-color,border-color,color] duration-150 ease-standard motion-reduce:transition-none',
    ],
    check:
      'size-4.5 transition-[scale] duration-(--ds-duration-spatial-fast) ease-spatial-fast motion-reduce:transition-none',
  },
  variants: {
    mode: {
      radio: { indicator: 'rounded-full' },
      checkbox: { indicator: 'rounded-xs' },
    },
    selected: {
      true: { check: 'scale-100' },
      false: { check: 'scale-0' },
    },
    disabled: {
      true: '',
      false: '',
    },
    invalid: {
      true: '',
      false: '',
    },
    instant: {
      true: { indicator: 'transition-none', check: 'transition-none' },
      false: '',
    },
  },
  compoundVariants: [
    {
      selected: false,
      disabled: false,
      invalid: false,
      class: { indicator: 'border-on-surface-variant bg-surface' },
    },
    {
      selected: true,
      disabled: false,
      invalid: false,
      class: { indicator: 'border-primary bg-primary text-on-primary' },
    },
    {
      selected: false,
      disabled: false,
      invalid: true,
      class: { indicator: 'border-error bg-surface' },
    },
    {
      selected: true,
      disabled: false,
      invalid: true,
      class: { indicator: 'border-error bg-error text-on-error' },
    },
    {
      selected: false,
      disabled: true,
      class: { indicator: 'border-on-surface/38' },
    },
    {
      selected: true,
      disabled: true,
      class: { indicator: 'border-transparent bg-on-surface/38 text-surface' },
    },
  ],
  defaultVariants: {
    mode: 'checkbox',
    selected: false,
    disabled: false,
    invalid: false,
    instant: false,
  },
});

export const selectableCardGroupStyles = tv({
  slots: {
    root: 'group/selectable-card-group flex flex-col gap-3',
    header: 'flex flex-col gap-0.5',
    label:
      'text-title-sm text-on-surface group-data-[disabled]/selectable-card-group:text-on-surface/38',
    required: 'ms-0.5 text-error',
    description:
      'text-body-sm text-on-surface-variant group-data-[disabled]/selectable-card-group:text-on-surface/38',
    items: 'grid gap-3',
    error: 'text-body-sm text-error',
  },
  variants: {
    orientation: {
      vertical: '',
      horizontal: { items: 'grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))]' },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

type RegisterId = (id: string) => () => void;

interface CardContextValue {
  inline: boolean;
  padding: CardPadding;
  selected: boolean;
  disabled: boolean;
  registerTitle?: RegisterId;
  registerDescription?: RegisterId;
}

const CardContext = createContext<CardContextValue>({
  inline: false,
  padding: 'md',
  selected: false,
  disabled: false,
});

function useCardPart() {
  const card = use(CardContext);
  const styles = cardStyles({
    padding: card.padding,
    selected: card.selected,
    disabled: card.disabled,
  });
  const Element = (card.inline ? 'span' : 'div') as 'div';
  return { card, styles, Element };
}

function useIdRegistry() {
  const [id, setId] = useState<string>();
  const register = useCallback<RegisterId>((next) => {
    setId(next);
    return () => setId((current) => (current === next ? undefined : current));
  }, []);
  return [id, register] as const;
}

interface LabellingProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

function useCardLabelling(props: LabellingProps) {
  const [titleId, registerTitle] = useIdRegistry();
  const [descriptionId, registerDescription] = useIdRegistry();
  const isNamedApart = Boolean(titleId || props['aria-label'] || props['aria-labelledby']);
  const describedBy = [props['aria-describedby'], isNamedApart ? descriptionId : undefined]
    .filter(Boolean)
    .join(' ');

  return {
    registerTitle,
    registerDescription,
    ariaProps: {
      'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : titleId),
      'aria-describedby': describedBy || undefined,
    },
  };
}

export interface CardProps extends ComponentProps<'div'>, CardStyleProps {}

export function Card({
  variant = 'filled',
  padding = 'md',
  surface,
  className,
  children,
  ...props
}: CardProps) {
  const parent = use(CardContext);
  const level = useCardSurface(variant, surface);
  const context = useMemo<CardContextValue>(
    () => ({ inline: parent.inline, padding, selected: false, disabled: false }),
    [parent.inline, padding],
  );
  const Element = (parent.inline ? 'span' : 'div') as 'div';

  return (
    <Element
      {...props}
      data-slot="card"
      data-variant={variant}
      data-padding={padding}
      data-surface={level}
      className={cardStyles({ variant, padding, surface: level }).root({
        className: cn('gap-(--card-gap)', className),
      })}
    >
      <SurfaceContext value={level}>
        <CardContext value={context}>{children}</CardContext>
      </SurfaceContext>
    </Element>
  );
}

export interface CardHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  title,
  description,
  leading,
  action,
  className,
  children,
  ...props
}: CardHeaderProps) {
  const { styles, Element } = useCardPart();

  return (
    <Element {...props} data-slot="card-header" className={styles.header({ className })}>
      {leading != null ? (
        <Element data-slot="card-leading" className={styles.leading()}>
          {leading}
        </Element>
      ) : null}
      <Element data-slot="card-heading" className={styles.heading()}>
        {title != null ? <CardTitle>{title}</CardTitle> : null}
        {description != null ? <CardDescription>{description}</CardDescription> : null}
        {children}
      </Element>
      {action != null ? (
        <Element data-slot="card-action" className={styles.action()}>
          {action}
        </Element>
      ) : null}
    </Element>
  );
}

export type CardTitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface CardTitleProps extends ComponentProps<'h3'> {
  level?: CardTitleLevel;
}

export function CardTitle({ level = 3, id: idProp, className, ...props }: CardTitleProps) {
  const { card, styles } = useCardPart();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const { registerTitle } = card;

  useLayoutEffect(() => registerTitle?.(id), [id, registerTitle]);

  const Element = (card.inline ? 'span' : `h${level}`) as 'h3';

  return (
    <Element {...props} id={id} data-slot="card-title" className={styles.title({ className })} />
  );
}

export type CardDescriptionProps = ComponentProps<'p'>;

export function CardDescription({ id: idProp, className, ...props }: CardDescriptionProps) {
  const { card, styles } = useCardPart();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const { registerDescription } = card;

  useLayoutEffect(() => registerDescription?.(id), [id, registerDescription]);

  const Element = (card.inline ? 'span' : 'p') as 'p';

  return (
    <Element
      {...props}
      id={id}
      data-slot="card-description"
      className={styles.description({ className })}
    />
  );
}

export type CardContentProps = ComponentProps<'div'>;

export function CardContent({ className, ...props }: CardContentProps) {
  const { styles, Element } = useCardPart();
  return <Element {...props} data-slot="card-content" className={styles.content({ className })} />;
}

export type CardFooterProps = ComponentProps<'div'>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  const { styles, Element } = useCardPart();
  return <Element {...props} data-slot="card-footer" className={styles.footer({ className })} />;
}

interface CardMediaOwnProps {
  inset?: boolean;
}

export interface CardMediaImageProps
  extends CardMediaOwnProps, Omit<ComponentProps<'img'>, 'src' | 'alt' | 'children'> {
  src: string;
  alt: string;
  children?: never;
}

export interface CardMediaContentProps
  extends CardMediaOwnProps, Omit<ComponentProps<'div'>, 'children'> {
  children: ReactNode;
  src?: never;
  alt?: never;
}

export type CardMediaProps = CardMediaImageProps | CardMediaContentProps;

function isImageMedia(props: CardMediaProps): props is CardMediaImageProps {
  return props.src != null;
}

export function CardMedia(props: CardMediaProps) {
  const { card, Element } = useCardPart();

  if (isImageMedia(props)) {
    const { inset = false, alt, className, ...imageProps } = props;
    return (
      <img
        loading="lazy"
        decoding="async"
        {...imageProps}
        alt={alt}
        data-slot="card-media"
        data-inset={inset || undefined}
        className={cardMediaStyles({ inset, image: true, disabled: card.disabled, className })}
      />
    );
  }

  const { inset = false, className, ...contentProps } = props;
  return (
    <Element
      {...contentProps}
      data-slot="card-media"
      data-inset={inset || undefined}
      className={cardMediaStyles({ inset, disabled: card.disabled, className })}
    />
  );
}

export interface CardLabels {
  pending: string;
}

export const defaultCardLabels: CardLabels = {
  pending: 'Loading',
};

interface ClickableCardOwnProps extends CardStyleProps {
  children?: ReactNode;
  labels?: Partial<CardLabels>;
}

export interface ClickableCardLinkProps
  extends ClickableCardOwnProps, Omit<AriaLinkProps, 'children'> {
  href: string;
}

export interface ClickableCardButtonProps
  extends ClickableCardOwnProps, Omit<AriaButtonProps, 'children' | 'onPress'> {
  href?: undefined;
  onPress?: (event: PressEvent) => void | Promise<unknown>;
}

export type ClickableCardProps = ClickableCardLinkProps | ClickableCardButtonProps;

type ClickableCardSharedKeys = keyof ClickableCardOwnProps | 'href' | 'isDisabled';
type ClickableCardLinkElementProps = Omit<ClickableCardLinkProps, ClickableCardSharedKeys>;
type ClickableCardButtonElementProps = Omit<ClickableCardButtonProps, ClickableCardSharedKeys>;

const clickableBodyClassName =
  'flex-1 transition-opacity duration-150 ease-standard group-data-[pending]/clickable-card:opacity-38 group-data-[pending]/clickable-card:delay-300 motion-reduce:transition-none';

export function ClickableCard({
  variant = 'filled',
  padding = 'md',
  surface,
  href,
  isDisabled = false,
  children,
  labels,
  ...props
}: ClickableCardProps) {
  const t = useLabels('card', defaultCardLabels, labels);
  const level = useCardSurface(variant, surface);
  const [isRunning, setRunning] = useState(false);
  const isLink = href != null;
  const context = useMemo<CardContextValue>(
    () => ({ inline: !isLink, padding, selected: false, disabled: isDisabled }),
    [isLink, padding, isDisabled],
  );
  const styles = cardStyles({
    variant,
    padding,
    surface: level,
    interactive: true,
    disabled: isDisabled,
  });
  const rootProps = {
    'data-slot': 'clickable-card',
    'data-variant': variant,
    'data-padding': padding,
    'data-surface': level,
  };
  const Body = (isLink ? 'div' : 'span') as 'div';
  const body = (
    <SurfaceContext value={level}>
      <CardContext value={context}>
        <Body data-slot="card-body" className={styles.body({ className: clickableBodyClassName })}>
          {children}
        </Body>
      </CardContext>
    </SurfaceContext>
  );

  if (isLink) {
    const { className, ...linkProps } = props as ClickableCardLinkElementProps;
    return (
      <AriaLink
        {...linkProps}
        {...rootProps}
        href={href}
        isDisabled={isDisabled}
        className={composeRenderProps(className, (className) =>
          styles.root({ className: cn('group/clickable-card', className) }),
        )}
      >
        {body}
      </AriaLink>
    );
  }

  const { className, onPress, ...buttonProps } = props as ClickableCardButtonElementProps;
  const isPending = buttonProps.isPending ?? isRunning;

  function handlePress(event: PressEvent) {
    const result = onPress?.(event);
    if (result && typeof result.then === 'function') {
      setRunning(true);
      result.then(
        () => setRunning(false),
        () => setRunning(false),
      );
    }
  }

  return (
    <AriaButton
      {...buttonProps}
      {...rootProps}
      isDisabled={isDisabled}
      className={composeRenderProps(className, (className) =>
        styles.root({ className: cn('group/clickable-card w-full', className) }),
      )}
      onPress={handlePress}
      isPending={isPending}
    >
      {body}
      {isPending ? (
        <ProgressBar
          isIndeterminate
          aria-label={t.pending}
          data-slot="card-pending"
          className={styles.pending()}
        >
          <Spinner className="text-[1.5rem]" />
        </ProgressBar>
      ) : null}
    </AriaButton>
  );
}

type ErrorMessage = ReactNode | ((validation: ValidationResult) => ReactNode);

type SelectionMode = 'single' | 'multiple';

interface SelectableCardGroupContextValue {
  selectionMode: SelectionMode;
  variant?: CardVariant;
  padding?: CardPadding;
}

const SelectableCardGroupContext = createContext<SelectableCardGroupContextValue | null>(null);

export interface SelectableCardProps
  extends
    Omit<CheckboxFieldProps, 'children' | 'className' | 'style' | 'isIndeterminate'>,
    CardStyleProps {
  children?: ReactNode;
  errorMessage?: ErrorMessage;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

const checkboxOnlyKeys = [
  'isSelected',
  'defaultSelected',
  'onChange',
  'isReadOnly',
  'isRequired',
  'isInvalid',
  'validate',
  'validationBehavior',
  'name',
  'value',
] as const;

function toRadioFieldProps(props: Omit<SelectableCardProps, keyof CardStyleProps>) {
  const radioProps: Record<string, unknown> = { ...props };
  for (const key of checkboxOnlyKeys) delete radioProps[key];
  return radioProps as Omit<RadioFieldProps, 'value'>;
}

type SelectableTargetState = CheckboxButtonRenderProps | RadioButtonRenderProps;

export function SelectableCard({
  variant,
  padding,
  surface,
  errorMessage,
  children,
  className,
  ...props
}: SelectableCardProps) {
  const group = use(SelectableCardGroupContext);
  const icons = useIcons();
  const instant = useMotionPreference().preference !== 'system';
  const resolvedVariant = variant ?? group?.variant ?? 'outlined';
  const resolvedPadding = padding ?? group?.padding ?? 'md';
  const level = useCardSurface(resolvedVariant, surface);
  const { registerTitle, registerDescription, ariaProps } = useCardLabelling(props);
  const mode = group?.selectionMode === 'single' ? 'radio' : 'checkbox';

  function stylesFor(state: SelectableTargetState) {
    return cardStyles({
      variant: resolvedVariant,
      padding: resolvedPadding,
      surface: level,
      interactive: true,
      selectable: true,
      selected: state.isSelected,
      disabled: state.isDisabled,
      invalid: state.isInvalid,
    });
  }

  function targetClassName(state: SelectableTargetState) {
    return stylesFor(state).root({ className: 'flex-1' });
  }

  function renderTarget(state: SelectableTargetState) {
    const context: CardContextValue = {
      inline: true,
      padding: resolvedPadding,
      selected: state.isSelected,
      disabled: state.isDisabled,
      registerTitle,
      registerDescription,
    };
    const indicator = selectableCardIndicatorStyles({
      mode,
      selected: state.isSelected,
      disabled: state.isDisabled,
      invalid: state.isInvalid,
      instant,
    });

    return (
      <SurfaceContext value={level}>
        <CardContext value={context}>
          <span
            data-slot="card-body"
            className={stylesFor(state).body({
              className:
                'flex-1 [&>:first-child:not([data-slot=card-media])]:pe-[calc(max(var(--card-padding),0.75rem)-var(--card-padding)+2rem)]',
            })}
          >
            {children}
          </span>
        </CardContext>
        <span
          aria-hidden="true"
          data-slot="selectable-card-indicator"
          className={indicator.indicator()}
        >
          <icons.check className={indicator.check()} />
        </span>
      </SurfaceContext>
    );
  }

  const rootProps = {
    'data-slot': 'selectable-card',
    'data-variant': resolvedVariant,
    'data-padding': resolvedPadding,
    'data-surface': level,
    className: cn('flex min-w-0 flex-col gap-1', className),
  };

  if (group && props.value == null) {
    throw new Error('SelectableCard needs a value inside a SelectableCardGroup.');
  }

  if (mode === 'radio' && props.value != null) {
    return (
      <RadioField {...toRadioFieldProps(props)} {...ariaProps} {...rootProps} value={props.value}>
        <RadioButton data-slot="selectable-card-target" className={targetClassName}>
          {renderTarget}
        </RadioButton>
      </RadioField>
    );
  }

  return (
    <CheckboxField {...props} {...ariaProps} {...rootProps}>
      <CheckboxButton data-slot="selectable-card-target" className={targetClassName}>
        {renderTarget}
      </CheckboxButton>
      <FieldError data-slot="error" className="text-body-sm text-error">
        {errorMessage}
      </FieldError>
    </CheckboxField>
  );
}

interface SelectableCardGroupOwnProps extends Pick<CardStyleProps, 'variant' | 'padding'> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ErrorMessage;
  orientation?: 'vertical' | 'horizontal';
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export interface SingleSelectableCardGroupProps
  extends
    SelectableCardGroupOwnProps,
    Omit<AriaRadioGroupProps, 'children' | 'className' | 'orientation'> {
  selectionMode?: 'single';
}

export interface MultipleSelectableCardGroupProps
  extends SelectableCardGroupOwnProps, Omit<AriaCheckboxGroupProps, 'children' | 'className'> {
  selectionMode: 'multiple';
}

export type SelectableCardGroupProps =
  SingleSelectableCardGroupProps | MultipleSelectableCardGroupProps;

export function SelectableCardGroup({
  label,
  description,
  errorMessage,
  orientation = 'vertical',
  variant,
  padding,
  children,
  className,
  selectionMode = 'single',
  ...props
}: SelectableCardGroupProps) {
  const styles = selectableCardGroupStyles({ orientation });
  const context = useMemo<SelectableCardGroupContextValue>(
    () => ({ selectionMode, variant, padding }),
    [selectionMode, variant, padding],
  );
  const rootProps = {
    'data-slot': 'selectable-card-group',
    'data-selection-mode': selectionMode,
    'data-orientation': orientation,
    className: styles.root({ className }),
  };
  const content = (
    <SelectableCardGroupContext value={context}>
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
    </SelectableCardGroupContext>
  );

  if (selectionMode === 'multiple') {
    return (
      <AriaCheckboxGroup {...(props as Omit<AriaCheckboxGroupProps, 'children'>)} {...rootProps}>
        {content}
      </AriaCheckboxGroup>
    );
  }

  return (
    <AriaRadioGroup
      {...(props as Omit<AriaRadioGroupProps, 'children'>)}
      {...rootProps}
      orientation={orientation}
    >
      {content}
    </AriaRadioGroup>
  );
}
