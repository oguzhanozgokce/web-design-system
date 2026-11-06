'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Input, Label, TextField, type KeyboardEvent } from 'react-aria-components';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  type DialogProps,
} from '@/registry/ds/ui/dialog';
import { useIcons, useLabels } from '@/registry/ds/ui/ds-provider';

export const alertDialogStyles = tv({
  slots: {
    icon: 'inline-flex',
    content: 'flex flex-col gap-4',
    confirmation: 'flex flex-col gap-2',
    label: 'text-body-md text-on-surface-variant',
    phrase:
      'rounded-xs bg-surface-container-highest px-1 py-0.5 font-mono font-medium text-on-surface',
    input: [
      'h-12 w-full rounded-sm border border-outline bg-transparent px-4 font-mono text-body-lg text-on-surface caret-primary focus:outline-hidden',
      'transition-[border-color,box-shadow] duration-150 ease-standard motion-reduce:transition-none',
      'data-[hovered]:not-data-[focused]:border-on-surface data-[focused]:border-primary data-[focused]:ring-1 data-[focused]:ring-primary data-[focused]:ring-inset',
      'read-only:bg-on-surface/4 read-only:text-on-surface-variant',
    ],
    error: [
      'mx-6 mt-4 flex shrink-0 items-start gap-3 rounded-md bg-error-container px-4 py-3 text-body-md text-on-error-container',
      '[&_svg]:mt-px [&_svg]:size-[1.125rem] [&_svg]:shrink-0',
    ],
  },
  variants: {
    tone: {
      default: { icon: 'text-secondary' },
      destructive: { icon: 'text-error' },
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});

export type AlertDialogStyleProps = VariantProps<typeof alertDialogStyles>;

export type AlertDialogTone = 'default' | 'destructive';

export type AlertDialogSize = 'sm' | 'md' | 'lg';

export type AlertDialogErrorMessage = ReactNode | ((error: unknown) => ReactNode);

export interface AlertDialogLabels {
  typeToConfirm: LabelTemplate<{ phrase: string }>;
  error: string;
}

export const defaultAlertDialogLabels: AlertDialogLabels = {
  typeToConfirm: 'Type {phrase} to confirm',
  error: 'Something went wrong. Try again.',
};

const phraseToken = '{phrase}';

interface AlertDialogContentProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  tone?: AlertDialogTone;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  isConfirmDisabled?: boolean;
  requireConfirmation?: string;
  errorMessage?: AlertDialogErrorMessage;
  labels?: Partial<AlertDialogLabels>;
}

export interface AlertDialogProps
  extends
    AlertDialogContentProps,
    Pick<
      DialogProps,
      | 'isOpen'
      | 'defaultOpen'
      | 'onOpenChange'
      | 'isDismissable'
      | 'isKeyboardDismissDisabled'
      | 'className'
      | 'overlayClassName'
    > {
  size?: AlertDialogSize;
}

export function AlertDialog({
  size = 'sm',
  isDismissable = false,
  isKeyboardDismissDisabled = false,
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  overlayClassName,
  tone = 'default',
  ...content
}: AlertDialogProps) {
  const [isPending, setPending] = useState(false);

  return (
    <Dialog
      role="alertdialog"
      size={size}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable && !isPending}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled || isPending}
      className={className}
      overlayClassName={overlayClassName}
      data-tone={tone}
      data-pending={isPending || undefined}
    >
      {({ close }) => (
        <AlertDialogContent
          {...content}
          tone={tone}
          isPending={isPending}
          onPendingChange={setPending}
          close={close}
        />
      )}
    </Dialog>
  );
}

function hasContent(node: ReactNode) {
  return node != null && typeof node !== 'boolean' && node !== '';
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value != null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

function describeError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}

interface AlertDialogContentInternalProps extends AlertDialogContentProps {
  isPending: boolean;
  onPendingChange: (isPending: boolean) => void;
  close: () => void;
}

function AlertDialogContent({
  title,
  description,
  icon,
  children,
  tone = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isConfirmDisabled = false,
  requireConfirmation,
  errorMessage,
  labels,
  isPending,
  onPendingChange,
  close,
}: AlertDialogContentInternalProps) {
  const t = useLabels('alertDialog', defaultAlertDialogLabels, labels);
  const icons = useIcons();
  const styles = alertDialogStyles({ tone });
  const [typed, setTyped] = useState('');
  const [failure, setFailure] = useState<{ error: unknown } | null>(null);
  const isMounted = useRef(false);
  const isRunning = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      onPendingChange(false);
    };
  }, [onPendingChange]);

  const phrase = requireConfirmation ?? '';
  const needsPhrase = phrase !== '';
  const isPhraseMatched = !needsPhrase || typed.trim() === phrase;
  const canConfirm = isPhraseMatched && !isConfirmDisabled;

  function confirm() {
    if (!canConfirm || isPending || isRunning.current) return;
    setFailure(null);

    let result: void | Promise<unknown> | undefined;
    try {
      result = onConfirm?.();
    } catch (error) {
      setFailure({ error });
      return;
    }

    if (!isPromiseLike(result)) {
      close();
      return;
    }

    isRunning.current = true;
    onPendingChange(true);
    result.then(
      () => {
        isRunning.current = false;
        if (!isMounted.current) return;
        onPendingChange(false);
        close();
      },
      (error: unknown) => {
        isRunning.current = false;
        if (!isMounted.current) return;
        onPendingChange(false);
        setFailure({ error });
      },
    );
  }

  function cancel() {
    onCancel?.();
    close();
  }

  function handleConfirmationKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      event.continuePropagation();
      return;
    }
    event.preventDefault();
    confirm();
  }

  const errorContent = failure
    ? typeof errorMessage === 'function'
      ? errorMessage(failure.error)
      : (errorMessage ?? describeError(failure.error, t.error))
    : null;

  const [phraseBefore, ...phraseRest] = t
    .format('typeToConfirm', { phrase: phraseToken })
    .split(phraseToken);
  const focusTarget = needsPhrase
    ? 'phrase'
    : tone === 'destructive' || isConfirmDisabled
      ? 'cancel'
      : 'confirm';

  return (
    <>
      <DialogHeader
        title={title}
        description={description}
        icon={
          hasContent(icon) ? (
            <span data-slot="alert-dialog-icon" className={styles.icon()}>
              {icon}
            </span>
          ) : undefined
        }
      />
      {hasContent(children) || needsPhrase ? (
        <DialogBody>
          <div data-slot="alert-dialog-content" className={styles.content()}>
            {children}
            {needsPhrase ? (
              <TextField
                value={typed}
                onChange={setTyped}
                onKeyDown={handleConfirmationKeyDown}
                isReadOnly={isPending}
                autoFocus={focusTarget === 'phrase'}
                data-slot="alert-dialog-confirmation"
                className={styles.confirmation()}
              >
                <Label data-slot="alert-dialog-label" className={styles.label()}>
                  {phraseRest.length ? (
                    <>
                      {phraseBefore}
                      <span data-slot="alert-dialog-phrase" className={styles.phrase()}>
                        {phrase}
                      </span>
                      {phraseRest.join(phrase)}
                    </>
                  ) : (
                    t.format('typeToConfirm', { phrase })
                  )}
                </Label>
                <Input
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-slot="alert-dialog-input"
                  className={styles.input()}
                />
              </TextField>
            ) : null}
          </div>
        </DialogBody>
      ) : null}
      {errorContent != null ? (
        <div role="alert" data-slot="alert-dialog-error" className={styles.error()}>
          <icons.error />
          <div className="min-w-0 flex-1">{errorContent}</div>
        </div>
      ) : null}
      <DialogFooter>
        <Button
          variant="text"
          onPress={cancel}
          isDisabled={isPending}
          autoFocus={focusTarget === 'cancel'}
          data-action="cancel"
        >
          {cancelLabel}
        </Button>
        <Button
          variant="filled"
          tone={tone}
          onPress={confirm}
          isPending={isPending}
          isDisabled={!canConfirm}
          autoFocus={focusTarget === 'confirm'}
          data-action="confirm"
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
