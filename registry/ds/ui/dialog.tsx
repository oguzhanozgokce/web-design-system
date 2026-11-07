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
  type ReactNode,
  type Ref,
} from 'react';
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  useLocale,
  type ButtonProps as AriaButtonProps,
  type DialogProps as AriaDialogProps,
  type DialogRenderProps,
  type DialogTriggerProps as AriaDialogTriggerProps,
  type HeadingProps,
  type ModalOverlayProps,
} from 'react-aria-components';
import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { ButtonGroupContext } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type DialogIconTone = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'error';

export interface DialogLabels {
  close: string;
}

export const defaultDialogLabels: DialogLabels = {
  close: 'Close',
};

type DialogMotion = 'spatial' | 'fade' | 'none';

const dialogCompactQuery = '(max-width: 599.98px)';

const fade = 'data-[entering]:animate-ds-fade-in data-[exiting]:animate-ds-fade-out';

const reducedFade =
  'motion-reduce:data-[entering]:animate-ds-fade-in motion-reduce:data-[exiting]:animate-ds-fade-out';

function hasContent(node: ReactNode) {
  return node != null && typeof node !== 'boolean' && node !== '';
}

export const dialogStyles = tv({
  slots: {
    overlay:
      'fixed inset-x-0 top-0 z-50 flex h-(--visual-viewport-height) items-end justify-center bg-backdrop p-4 sm:items-center sm:p-10',
    surface: [
      'group/dialog relative flex max-h-full w-full flex-col overflow-hidden bg-surface-overlay text-on-surface outline-none max-sm:[--ds-dialog-rise:0.25rem]',
      'forced-colors:border',
    ],
    dialog: 'flex min-h-0 flex-auto flex-col outline-none',
    header: 'relative flex shrink-0 flex-col items-start gap-4 px-6 pt-6 text-start last:pb-6',
    icon: 'flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-5',
    heading: 'flex min-w-0 flex-col gap-2 self-stretch',
    title: 'text-base font-semibold wrap-break-word text-on-surface',
    description: 'text-sm text-on-surface-variant',
    action: 'flex shrink-0 items-center gap-1',
    close: 'data-[pressed]:scale-[0.93] motion-reduce:data-[pressed]:scale-100',
    body: [
      'focus-ring-inset mt-4 min-h-0 flex-auto overflow-y-auto overscroll-contain border-y border-transparent px-6 text-sm text-on-surface-variant',
      'transition-[border-color] duration-150 ease-out first:mt-0 first:pt-6 last:pb-6',
      'data-[overflow-bottom]:border-b-outline-subtle data-[overflow-top]:border-t-outline-subtle',
    ],
    footer: [
      'flex shrink-0 flex-wrap items-center justify-end gap-2 px-6 pt-5 pb-6',
      'group-has-[[data-slot=dialog-action]]/dialog:hidden',
    ],
  },
  variants: {
    size: {
      sm: { surface: 'max-w-sm' },
      md: { surface: 'max-w-md' },
      lg: { surface: 'max-w-lg' },
      xl: { surface: 'max-w-2xl' },
      full: {},
    },
    motion: {
      spatial: { overlay: fade, surface: reducedFade },
      fade: { overlay: fade, surface: fade },
      none: {},
    },
    iconTone: {
      neutral: { icon: 'bg-neutral-soft text-on-surface' },
      primary: { icon: 'bg-primary-soft text-on-primary-soft' },
      success: { icon: 'bg-success-soft text-on-success-soft' },
      warning: { icon: 'bg-warning-soft text-on-warning-soft' },
      info: { icon: 'bg-info-soft text-on-info-soft' },
      error: { icon: 'bg-error-soft text-on-error-soft' },
    },
    closable: {
      true: { header: 'pe-14' },
    },
    fullScreen: {
      false: { surface: 'rounded-dialog shadow-lg' },
      true: {
        overlay: 'p-0 sm:p-0',
        surface: 'h-full max-w-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
        header: 'min-h-14 flex-row items-start gap-1 p-2 last:pb-2',
        heading: 'flex-1 gap-0.5 self-auto px-1 pt-2',
        title: 'truncate',
        body: 'mt-0 px-4 pt-4 pb-4 first:pt-4 last:pb-4',
        footer: 'px-4 pt-2 pb-4',
      },
    },
  },
  compoundVariants: [
    {
      fullScreen: false,
      motion: 'spatial',
      class: {
        surface: 'data-[entering]:animate-ds-dialog-in data-[exiting]:animate-ds-dialog-out',
      },
    },
    {
      fullScreen: true,
      motion: 'spatial',
      class: {
        surface:
          'data-[entering]:animate-ds-sheet-in-bottom data-[exiting]:animate-ds-sheet-out-bottom',
      },
    },
  ],
  defaultVariants: {
    size: 'md',
    motion: 'spatial',
    iconTone: 'neutral',
    closable: false,
    fullScreen: false,
  },
});

export type DialogStyleProps = VariantProps<typeof dialogStyles>;

interface DialogLayoutContextValue {
  isFullScreen: boolean;
  registerDescription?: (id: string) => () => void;
  labels?: Partial<DialogLabels>;
}

const DialogLayoutContext = createContext<DialogLayoutContextValue>({ isFullScreen: false });

export function useDialogLayout() {
  const { isFullScreen } = use(DialogLayoutContext);
  return { isFullScreen };
}

function useDialogMotion(): DialogMotion {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (spatialEnabled) return 'spatial';
  return effectsEnabled ? 'fade' : 'none';
}

export type DialogTriggerProps = AriaDialogTriggerProps;

export function DialogTrigger(props: DialogTriggerProps) {
  return <AriaDialogTrigger {...props} />;
}

export interface DialogProps
  extends
    Omit<AriaDialogProps, 'children' | 'className' | 'style'>,
    Pick<
      ModalOverlayProps,
      | 'isOpen'
      | 'defaultOpen'
      | 'onOpenChange'
      | 'isDismissable'
      | 'isKeyboardDismissDisabled'
      | 'shouldCloseOnInteractOutside'
    > {
  size?: DialogSize;
  fullScreenOnMobile?: boolean;
  labels?: Partial<DialogLabels>;
  className?: string;
  overlayClassName?: string;
  children?: ReactNode | ((renderProps: DialogRenderProps) => ReactNode);
}

export function Dialog({
  size = 'md',
  fullScreenOnMobile = false,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  isOpen,
  defaultOpen,
  onOpenChange,
  shouldCloseOnInteractOutside,
  labels,
  className,
  overlayClassName,
  children,
  'aria-describedby': ariaDescribedBy,
  ...props
}: DialogProps) {
  const motion = useDialogMotion();
  const { locale, direction } = useLocale();
  const themeScope = useThemeScopeProps();
  const isCompact = useMediaQuery(dialogCompactQuery);
  const isFullScreen = size === 'full' || (fullScreenOnMobile && isCompact);
  const [descriptionIds, setDescriptionIds] = useState<string[]>([]);
  const styles = dialogStyles({ size, motion, fullScreen: isFullScreen });

  const registerDescription = useCallback((id: string) => {
    setDescriptionIds((current) => (current.includes(id) ? current : [...current, id]));
    return () => setDescriptionIds((current) => current.filter((item) => item !== id));
  }, []);

  const layout = useMemo(
    () => ({ isFullScreen, registerDescription, labels }),
    [isFullScreen, registerDescription, labels],
  );

  return (
    <ModalOverlay
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
      dir={direction}
      lang={locale}
      {...themeScope}
      data-slot="dialog-overlay"
      className={styles.overlay({ className: overlayClassName })}
    >
      <Modal
        data-slot="dialog-surface"
        data-size={size}
        data-fullscreen={isFullScreen || undefined}
        className={styles.surface({ className })}
      >
        <DialogLayoutContext value={layout}>
          <ButtonGroupContext value={null}>
            <AriaDialog
              {...props}
              aria-describedby={
                [ariaDescribedBy, ...descriptionIds].filter(Boolean).join(' ') || undefined
              }
              data-slot="dialog"
              className={styles.dialog()}
            >
              {children}
            </AriaDialog>
          </ButtonGroupContext>
        </DialogLayoutContext>
      </Modal>
    </ModalOverlay>
  );
}

export interface DialogHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  iconTone?: DialogIconTone;
  action?: ReactNode;
  showCloseButton?: boolean;
}

export function DialogHeader({
  title,
  description,
  icon,
  iconTone = 'neutral',
  action,
  showCloseButton = false,
  className,
  children,
  ...props
}: DialogHeaderProps) {
  const { isFullScreen } = use(DialogLayoutContext);
  const showIcon = hasContent(icon) && !isFullScreen;
  const closable = showCloseButton && !isFullScreen;
  const styles = dialogStyles({ fullScreen: isFullScreen, iconTone, closable });

  return (
    <div {...props} data-slot="dialog-header" className={styles.header({ className })}>
      {isFullScreen ? <DialogClose /> : null}
      {showIcon ? (
        <span data-slot="dialog-icon" data-tone={iconTone} className={styles.icon()}>
          {icon}
        </span>
      ) : null}
      <div data-slot="dialog-heading" className={styles.heading()}>
        {hasContent(title) ? <DialogTitle>{title}</DialogTitle> : null}
        {hasContent(description) ? <DialogDescription>{description}</DialogDescription> : null}
        {children}
      </div>
      {isFullScreen && hasContent(action) ? (
        <div data-slot="dialog-action" className={styles.action()}>
          {action}
        </div>
      ) : null}
      {closable ? <DialogClose className="absolute inset-e-4 top-4" /> : null}
    </div>
  );
}

export type DialogTitleProps = HeadingProps;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  const { isFullScreen } = use(DialogLayoutContext);

  return (
    <Heading
      slot="title"
      {...props}
      data-slot="dialog-title"
      className={dialogStyles({ fullScreen: isFullScreen }).title({ className })}
    />
  );
}

export type DialogDescriptionProps = ComponentProps<'p'>;

export function DialogDescription({ id: idProp, className, ...props }: DialogDescriptionProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const { registerDescription } = use(DialogLayoutContext);

  useLayoutEffect(() => registerDescription?.(id), [id, registerDescription]);

  return (
    <p
      {...props}
      id={id}
      data-slot="dialog-description"
      className={dialogStyles().description({ className })}
    />
  );
}

interface ScrollEdges {
  top: boolean;
  bottom: boolean;
}

const noScrollEdges: ScrollEdges = { top: false, bottom: false };

function useScrollEdges() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [edges, setEdges] = useState<ScrollEdges>(noScrollEdges);

  useLayoutEffect(() => {
    if (!element) return;
    const target = element;

    function update() {
      const top = target.scrollTop > 1;
      const bottom = target.scrollHeight - target.clientHeight - target.scrollTop > 1;
      setEdges((current) =>
        current.top === top && current.bottom === bottom ? current : { top, bottom },
      );
    }

    const resizeObserver = new ResizeObserver(update);
    const observeChildren = () => {
      for (const child of Array.from(target.children)) resizeObserver.observe(child);
    };
    const mutationObserver = new MutationObserver(() => {
      observeChildren();
      update();
    });

    resizeObserver.observe(target);
    observeChildren();
    mutationObserver.observe(target, { childList: true });
    target.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      target.removeEventListener('scroll', update);
    };
  }, [element]);

  return [setElement, edges] as const;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

export type DialogBodyProps = ComponentProps<'div'>;

export function DialogBody({ className, ref, ...props }: DialogBodyProps) {
  const { isFullScreen } = use(DialogLayoutContext);
  const [setElement, edges] = useScrollEdges();
  const isScrollable = edges.top || edges.bottom;

  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      setElement(element);
      assignRef(ref, element);
    },
    [ref, setElement],
  );

  return (
    <div
      tabIndex={isScrollable ? 0 : undefined}
      {...props}
      ref={setRefs}
      data-slot="dialog-body"
      data-overflow-top={edges.top || undefined}
      data-overflow-bottom={edges.bottom || undefined}
      className={dialogStyles({ fullScreen: isFullScreen }).body({ className })}
    />
  );
}

export type DialogFooterProps = ComponentProps<'div'>;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  const { isFullScreen } = use(DialogLayoutContext);

  return (
    <div
      {...props}
      data-slot="dialog-footer"
      className={dialogStyles({ fullScreen: isFullScreen }).footer({ className })}
    />
  );
}

export interface DialogCloseProps extends Omit<AriaButtonProps, 'children'> {
  children?: ReactNode;
}

export function DialogClose({
  'aria-label': ariaLabel,
  children,
  className,
  ...props
}: DialogCloseProps) {
  const { isFullScreen, labels } = use(DialogLayoutContext);
  const t = useLabels('dialog', defaultDialogLabels, labels);
  const icons = useIcons();
  const close = dialogStyles().close();

  return (
    <IconButton
      slot="close"
      {...props}
      aria-label={ariaLabel ?? t.close}
      icon={children ?? <icons.close />}
      variant="ghost"
      tone="neutral"
      size={isFullScreen ? 'md' : 'sm'}
      className={
        typeof className === 'function'
          ? (renderProps) => `${close} ${className(renderProps)}`
          : `${close} ${className ?? ''}`
      }
    />
  );
}
