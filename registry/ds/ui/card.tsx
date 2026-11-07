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

export type CardVariant = 'outline' | 'elevated' | 'soft' | 'transparent';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardStyleProps {
  variant?: CardVariant;
  padding?: CardPadding;
}

export const cardStyles = tv({
  slots: {
    root: [
      'relative flex min-w-0 flex-col rounded-(--card-radius) p-(--card-padding) text-start text-on-surface [--card-border:0px] [--card-radius:var(--radius-container)]',
      'transition-[background-color,border-color,box-shadow,color,scale] duration-150 ease-out motion-reduce:transition-none',
      'forced-colors:border',
    ],
    body: 'flex min-w-0 flex-col gap-(--card-gap)',
    header: 'flex min-w-0 items-start gap-3',
    leading: 'inline-flex shrink-0 items-center justify-center',
    heading: 'flex min-w-0 flex-1 flex-col gap-1',
    action: '-my-1 flex shrink-0 items-center gap-1',
    title: 'block font-semibold wrap-break-word text-on-surface',
    description: 'block text-sm text-on-surface-variant',
    content: 'block min-w-0 text-sm',
    footer: 'flex flex-wrap items-center justify-end gap-2',
    pending:
      'absolute inset-0 grid animate-ds-fade-in-delayed place-items-center rounded-[inherit] text-primary',
  },
  variants: {
    variant: {
      outline: {
        root: 'border border-outline-subtle bg-surface-raised [--card-border:1px] [--ds-avatar-ring:var(--surface-raised)]',
      },
      elevated: { root: 'bg-surface-raised shadow-sm [--ds-avatar-ring:var(--surface-raised)]' },
      soft: { root: 'bg-neutral-soft' },
      transparent: { root: 'bg-transparent' },
    },
    padding: {
      none: {
        root: '[--card-gap:0px] [--card-leading:1.25rem] [--card-padding:0px]',
        title: 'text-sm',
      },
      sm: {
        root: '[--card-gap:0.5rem] [--card-leading:1.25rem] [--card-padding:0.75rem]',
        title: 'text-sm',
      },
      md: {
        root: '[--card-gap:0.75rem] [--card-leading:1.25rem] [--card-padding:1rem]',
        title: 'text-sm',
      },
      lg: {
        root: '[--card-gap:1rem] [--card-leading:1.5rem] [--card-padding:1.5rem]',
        title: 'text-base',
      },
    },
    interactive: {
      true: {
        root: 'focus-ring no-tap-highlight cursor-pointer select-none data-[pressed]:scale-[0.99] motion-reduce:data-[pressed]:scale-100',
      },
      false: '',
    },
    selectable: {
      true: { root: 'group/selectable-card' },
      false: '',
    },
    selected: {
      true: '',
      false: '',
    },
    disabled: {
      true: { root: 'cursor-not-allowed opacity-50' },
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
      variant: ['outline', 'elevated'],
      class: { root: 'data-[hovered]:shadow-md' },
    },
    {
      interactive: true,
      variant: 'soft',
      class: { root: 'data-[hovered]:bg-neutral-soft-hover data-[pressed]:bg-neutral-soft-hover' },
    },
    {
      interactive: true,
      variant: 'transparent',
      class: { root: 'data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover' },
    },
    {
      selectable: true,
      variant: ['elevated', 'soft', 'transparent'],
      class: { root: 'border border-transparent [--card-border:1px]' },
    },
    {
      selectable: true,
      selected: true,
      class: { root: 'border-primary inset-ring-1 inset-ring-primary' },
    },
    {
      selectable: true,
      invalid: true,
      class: { root: 'border-error [--focus-color:var(--error)]' },
    },
    {
      selectable: true,
      selected: true,
      invalid: true,
      class: { root: 'inset-ring-error' },
    },
  ],
  defaultVariants: {
    variant: 'outline',
    padding: 'md',
    interactive: false,
    selectable: false,
    selected: false,
    disabled: false,
    invalid: false,
  },
});

export const cardMediaStyles = tv({
  base: 'block shrink-0 overflow-hidden',
  variants: {
    inset: {
      true: 'w-full rounded-[max(0.5rem,calc(var(--card-radius)-var(--card-padding)))]',
      false: [
        '-mx-(--card-padding) w-[calc(100%+var(--card-padding)*2)] max-w-none',
        'first:-mt-(--card-padding) first:rounded-t-[calc(var(--card-radius)-var(--card-border))]',
        'last:-mb-(--card-padding) last:rounded-b-[calc(var(--card-radius)-var(--card-border))]',
      ],
    },
    image: {
      true: 'bg-neutral-soft object-cover',
      false: '',
    },
  },
  defaultVariants: {
    inset: false,
    image: false,
  },
});

const selectableCardIndicatorStyles = tv({
  slots: {
    indicator: [
      'pointer-events-none absolute inset-e-[max(var(--card-padding),0.75rem)] top-[calc(max(var(--card-padding),0.75rem)+(var(--card-leading)-1.25rem)/2)] grid size-5 place-items-center border',
      'transition-[background-color,border-color] duration-150 ease-out motion-reduce:transition-none',
    ],
    check:
      'size-3.5 transition-[scale,opacity] duration-200 ease-out motion-reduce:transition-none',
  },
  variants: {
    mode: {
      radio: { indicator: 'rounded-full' },
      checkbox: { indicator: 'rounded-md' },
    },
    selected: {
      true: { check: 'scale-100 opacity-100' },
      false: { check: 'scale-50 opacity-0' },
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
      invalid: false,
      class: {
        indicator:
          'border-outline bg-surface-raised group-data-[hovered]/selectable-card:border-on-surface-variant',
      },
    },
    {
      selected: true,
      invalid: false,
      class: {
        indicator:
          'border-primary-solid bg-primary-solid text-on-primary-solid group-data-[hovered]/selectable-card:border-primary-solid-hover group-data-[hovered]/selectable-card:bg-primary-solid-hover',
      },
    },
    {
      selected: false,
      invalid: true,
      class: { indicator: 'border-error bg-surface-raised' },
    },
    {
      selected: true,
      invalid: true,
      class: {
        indicator:
          'border-error-solid bg-error-solid text-on-error-solid group-data-[hovered]/selectable-card:border-error-solid-hover group-data-[hovered]/selectable-card:bg-error-solid-hover',
      },
    },
  ],
  defaultVariants: {
    mode: 'checkbox',
    selected: false,
    invalid: false,
    instant: false,
  },
});

export const selectableCardGroupStyles = tv({
  slots: {
    root: 'group/selectable-card-group flex flex-col gap-3',
    header: 'flex flex-col gap-0.5 group-data-[disabled]/selectable-card-group:opacity-50',
    label: 'text-sm font-medium text-on-surface',
    required: 'ms-0.5 text-error',
    description: 'text-xs text-on-surface-variant',
    items: 'grid gap-3',
    error: 'text-xs text-error',
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
  registerTitle?: RegisterId;
  registerDescription?: RegisterId;
}

const CardContext = createContext<CardContextValue>({
  inline: false,
  padding: 'md',
});

function useCardPart() {
  const card = use(CardContext);
  const styles = cardStyles({ padding: card.padding });
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
  variant = 'outline',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  const parent = use(CardContext);
  const context = useMemo<CardContextValue>(
    () => ({ inline: parent.inline, padding }),
    [parent.inline, padding],
  );
  const Element = (parent.inline ? 'span' : 'div') as 'div';

  return (
    <Element
      {...props}
      data-slot="card"
      data-variant={variant}
      data-padding={padding}
      className={cardStyles({ variant, padding }).root({
        className: cn('gap-(--card-gap)', className),
      })}
    >
      <CardContext value={context}>{children}</CardContext>
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
  const { Element } = useCardPart();

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
        className={cardMediaStyles({ inset, image: true, className })}
      />
    );
  }

  const { inset = false, className, ...contentProps } = props;
  return (
    <Element
      {...contentProps}
      data-slot="card-media"
      data-inset={inset || undefined}
      className={cardMediaStyles({ inset, className })}
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
  'flex-1 transition-opacity duration-150 ease-out group-data-[pending]/clickable-card:opacity-50 group-data-[pending]/clickable-card:delay-300 motion-reduce:transition-none';

export function ClickableCard({
  variant = 'outline',
  padding = 'md',
  href,
  isDisabled = false,
  children,
  labels,
  ...props
}: ClickableCardProps) {
  const t = useLabels('card', defaultCardLabels, labels);
  const [isRunning, setRunning] = useState(false);
  const isLink = href != null;
  const context = useMemo<CardContextValue>(
    () => ({ inline: !isLink, padding }),
    [isLink, padding],
  );
  const styles = cardStyles({
    variant,
    padding,
    interactive: true,
    disabled: isDisabled,
  });
  const rootProps = {
    'data-slot': 'clickable-card',
    'data-variant': variant,
    'data-padding': padding,
  };
  const Body = (isLink ? 'div' : 'span') as 'div';
  const body = (
    <CardContext value={context}>
      <Body data-slot="card-body" className={styles.body({ className: clickableBodyClassName })}>
        {children}
      </Body>
    </CardContext>
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
  errorMessage,
  children,
  className,
  ...props
}: SelectableCardProps) {
  const group = use(SelectableCardGroupContext);
  const icons = useIcons();
  const instant = useMotionPreference().preference !== 'system';
  const resolvedVariant = variant ?? group?.variant ?? 'outline';
  const resolvedPadding = padding ?? group?.padding ?? 'md';
  const { registerTitle, registerDescription, ariaProps } = useCardLabelling(props);
  const mode = group?.selectionMode === 'single' ? 'radio' : 'checkbox';

  function stylesFor(state: SelectableTargetState) {
    return cardStyles({
      variant: resolvedVariant,
      padding: resolvedPadding,
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
      registerTitle,
      registerDescription,
    };
    const indicator = selectableCardIndicatorStyles({
      mode,
      selected: state.isSelected,
      invalid: state.isInvalid,
      instant,
    });

    return (
      <>
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
      </>
    );
  }

  const rootProps = {
    'data-slot': 'selectable-card',
    'data-variant': resolvedVariant,
    'data-padding': resolvedPadding,
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
      <FieldError data-slot="error" className="text-xs text-error">
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
