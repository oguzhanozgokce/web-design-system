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
    label: 'text-sm text-on-surface-variant',
    phrase: 'rounded-md bg-neutral-soft px-1 py-0.5 font-mono font-medium text-on-surface',
    input: [
      'h-10 w-full rounded-field border border-outline-variant bg-surface-raised px-3 font-mono text-base text-on-surface caret-primary pointer-fine:text-sm focus:outline-hidden',
      'transition-[border-color,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none',
      'data-[hovered]:not-data-[focused]:not-read-only:inset-ring-2 data-[hovered]:not-data-[focused]:not-read-only:inset-ring-outline-variant/40',
      'data-[focused]:border-primary data-[focused]:inset-ring-2 data-[focused]:inset-ring-primary/20',
      'read-only:bg-neutral-soft read-only:text-on-surface-variant',
    ],
    error: [
      'mx-6 mt-4 flex shrink-0 items-start gap-2 rounded-item bg-error-soft px-3 py-2.5 text-sm text-[color-mix(in_oklab,var(--error)_70%,var(--on-surface))]',
      '[&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-on-error-soft',
    ],
  },
});

export type AlertDialogStyleProps = VariantProps<typeof alertDialogStyles>;

export type AlertDialogTone = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'error';

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
  tone = 'neutral',
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

interface AlertDialogContentInternalProps extends Omit<AlertDialogContentProps, 'tone'> {
  tone: AlertDialogTone;
  isPending: boolean;
  onPendingChange: (isPending: boolean) => void;
  close: () => void;
}

function AlertDialogContent({
  title,
  description,
  icon,
  children,
  tone,
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
  const styles = alertDialogStyles();
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
    : tone === 'error' || isConfirmDisabled
      ? 'cancel'
      : 'confirm';

  return (
    <>
      <DialogHeader
        title={title}
        description={description}
        iconTone={tone}
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
          variant="soft"
          tone="neutral"
          onPress={cancel}
          isDisabled={isPending}
          autoFocus={focusTarget === 'cancel'}
          data-action="cancel"
        >
          {cancelLabel}
        </Button>
        <Button
          variant="solid"
          tone={tone === 'error' ? 'error' : 'primary'}
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
