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
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  composeRenderProps,
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
import { SurfaceContext } from '@/registry/ds/ui/card';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { useThemeScopeProps } from '@/registry/ds/lib/theme-scope';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

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
      'fixed inset-x-0 top-0 z-50 flex h-(--visual-viewport-height) items-center justify-center bg-scrim/32 p-4 sm:p-8',
    surface: [
      'group/dialog relative flex max-h-full w-full flex-col overflow-hidden rounded-xl bg-surface-container-high text-on-surface shadow-elevation-3 outline-none',
      'forced-colors:border',
    ],
    dialog: 'flex min-h-0 flex-auto flex-col outline-none',
    header: 'relative flex shrink-0 flex-col items-start gap-4 px-6 pt-6 text-start',
    icon: 'inline-flex shrink-0 text-secondary [&_svg]:size-6',
    heading: 'flex min-w-0 flex-col gap-4 self-stretch',
    title: 'text-headline-sm wrap-break-word text-on-surface',
    description: 'text-body-md text-on-surface-variant',
    action: 'flex shrink-0 items-center gap-1',
    close: [
      'state-layer focus-ring inline-flex size-10 shrink-0 cursor-default items-center justify-center rounded-full text-on-surface-variant',
      'transition-colors duration-150 ease-standard data-[disabled]:text-on-surface/38 [&_svg]:size-6',
      'pointer-coarse:after:absolute pointer-coarse:after:-inset-1',
    ],
    body: [
      'focus-ring-inset mt-4 min-h-0 flex-auto overflow-y-auto overscroll-contain border-y border-transparent px-6 text-body-md text-on-surface-variant',
      'transition-[border-color] duration-150 ease-standard first:mt-0 first:pt-6 last:pb-6',
      'data-[overflow-bottom]:border-b-outline-variant data-[overflow-top]:border-t-outline-variant',
    ],
    footer: [
      'flex shrink-0 flex-wrap items-center justify-end gap-2 p-6',
      'group-has-[[data-slot=dialog-action]]/dialog:hidden',
    ],
  },
  variants: {
    size: {
      sm: { surface: 'max-w-96' },
      md: { surface: 'max-w-140' },
      lg: { surface: 'max-w-180' },
      xl: { surface: 'max-w-240' },
      full: {},
    },
    motion: {
      spatial: { overlay: fade, surface: reducedFade },
      fade: { overlay: fade, surface: fade },
      none: {},
    },
    centered: {
      true: { header: 'items-center text-center' },
    },
    closable: {
      true: { header: 'pe-16' },
    },
    fullScreen: {
      true: {
        overlay: 'p-0 sm:p-0',
        surface:
          'h-full max-w-none rounded-none bg-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-none',
        header: 'min-h-14 flex-row items-start gap-1 p-2',
        heading: 'flex-1 gap-0.5 self-auto px-1 pt-1.5',
        title: 'truncate text-title-lg',
        body: 'mt-0 px-4 pt-2 pb-4 first:pt-4 last:pb-4',
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
    {
      centered: true,
      closable: true,
      class: { header: 'ps-16' },
    },
  ],
  defaultVariants: {
    size: 'md',
    motion: 'spatial',
    centered: false,
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
          <SurfaceContext value={isFullScreen ? 'surface' : 'surface-container-high'}>
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
          </SurfaceContext>
        </DialogLayoutContext>
      </Modal>
    </ModalOverlay>
  );
}

export interface DialogHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  showCloseButton?: boolean;
}

export function DialogHeader({
  title,
  description,
  icon,
  action,
  showCloseButton = false,
  className,
  children,
  ...props
}: DialogHeaderProps) {
  const { isFullScreen } = use(DialogLayoutContext);
  const centered = hasContent(icon) && !isFullScreen;
  const closable = showCloseButton && !isFullScreen;
  const styles = dialogStyles({ fullScreen: isFullScreen, centered, closable });

  return (
    <div {...props} data-slot="dialog-header" className={styles.header({ className })}>
      {isFullScreen ? <DialogClose /> : null}
      {centered ? (
        <span data-slot="dialog-icon" className={styles.icon()}>
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
      {closable ? <DialogClose className="absolute inset-e-4 top-5" /> : null}
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
  const { labels } = use(DialogLayoutContext);
  const t = useLabels('dialog', defaultDialogLabels, labels);
  const icons = useIcons();

  return (
    <AriaButton
      slot="close"
      {...props}
      aria-label={ariaLabel ?? t.close}
      data-slot="dialog-close"
      className={composeRenderProps(className, (className) => dialogStyles().close({ className }))}
    >
      {children ?? <icons.close />}
    </AriaButton>
  );
}
