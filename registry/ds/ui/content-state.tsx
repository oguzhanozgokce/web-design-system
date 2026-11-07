'use client';

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from 'react';
import { ProgressBar } from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import {
  EmptyState,
  type EmptyStateHeadingLevel,
  type EmptyStateSize,
} from '@/registry/ds/ui/empty-state';
import { Spinner, type SpinnerSize } from '@/registry/ds/ui/spinner';

export type ContentStatus = 'loading' | 'error' | 'empty' | 'content';

export type ContentStateSize = EmptyStateSize;

const spinnerSizes: Record<ContentStateSize, SpinnerSize> = {
  sm: 'md',
  md: 'lg',
  lg: 'xl',
};

export interface ContentStateLabels {
  loading: string;
  errorTitle: string;
  errorDescription: string;
  retry: string;
  emptyTitle: string;
}

export const defaultContentStateLabels: ContentStateLabels = {
  loading: 'Loading',
  errorTitle: 'Something went wrong',
  errorDescription: 'Please try again in a moment.',
  retry: 'Try again',
  emptyTitle: 'Nothing here yet',
};

export const contentStateStyles = tv({
  slots: {
    root: 'relative w-full outline-none',
    view: 'w-full',
    loading: 'w-full',
    spinner: 'animate-ds-fade-in-delayed',
    refreshError: '',
  },
  variants: {
    size: {
      sm: { refreshError: 'mb-3' },
      md: { refreshError: 'mb-4' },
      lg: { refreshError: 'mb-6' },
    },
    hasCustomLoading: {
      false: { loading: 'flex items-center justify-center text-on-surface-variant' },
    },
    isAnimated: {
      true: { view: 'animate-ds-fade-in' },
    },
  },
  compoundVariants: [
    { size: 'sm', hasCustomLoading: false, class: { loading: 'min-h-24 py-6' } },
    { size: 'md', hasCustomLoading: false, class: { loading: 'min-h-48 py-10' } },
    {
      size: 'lg',
      hasCustomLoading: false,
      class: { loading: 'min-h-[min(32rem,70dvh)] py-16' },
    },
  ],
  defaultVariants: {
    size: 'md',
    hasCustomLoading: false,
    isAnimated: false,
  },
});

type ErrorNode = ReactNode | ((error: unknown) => ReactNode);

type RetryHandler = () => void | Promise<unknown>;

export interface ContentStateProps<T> extends Omit<ComponentProps<'div'>, 'children'> {
  status?: ContentStatus;
  data?: T;
  error?: unknown;
  isEmpty?: (data: T) => boolean;
  isRefreshing?: boolean;
  onRetry?: RetryHandler;
  size?: ContentStateSize;
  headingLevel?: EmptyStateHeadingLevel;
  loadingLabel?: string;
  loadingContent?: ReactNode;
  errorTitle?: ErrorNode;
  errorDescription?: ErrorNode;
  errorContent?: ReactNode | ((error: unknown, retry?: RetryHandler) => ReactNode);
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
  emptyContent?: ReactNode;
  labels?: Partial<ContentStateLabels>;
  children?: ReactNode | ((data: T) => ReactNode);
}

function defaultIsEmpty(data: unknown) {
  return data === null || (Array.isArray(data) && data.length === 0);
}

function hasError(error: unknown) {
  return error !== undefined && error !== null && error !== false;
}

function resolveContentStatus<T>({
  status,
  data,
  error,
  isEmpty = defaultIsEmpty,
}: Pick<ContentStateProps<T>, 'status' | 'data' | 'error' | 'isEmpty'>): ContentStatus {
  if (status) return status;
  if (data === undefined) return hasError(error) ? 'error' : 'loading';
  if (isEmpty(data)) return hasError(error) ? 'error' : 'empty';
  return 'content';
}

function resolveErrorNode(node: ErrorNode, error: unknown) {
  return typeof node === 'function' ? node(error) : node;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

interface StateViewProps extends ComponentProps<'div'> {
  onFocusLost: () => void;
}

function StateView({ onFocusLost, children, ...props }: StateViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    return () => {
      if (node?.contains(node.ownerDocument.activeElement)) onFocusLost();
    };
  }, [onFocusLost]);

  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  );
}

export function ContentState<T>({
  status,
  data,
  error,
  isEmpty = defaultIsEmpty,
  isRefreshing = false,
  onRetry,
  size = 'md',
  headingLevel = 2,
  loadingLabel,
  loadingContent,
  errorTitle,
  errorDescription,
  errorContent,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  emptyContent,
  labels,
  children,
  className,
  ref,
  ...props
}: ContentStateProps<T>) {
  const t = useLabels('contentState', defaultContentStateLabels, labels);
  const icons = useIcons();
  const { effectsEnabled } = useMotionPreference();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const focusLost = useRef(false);
  const resolved = resolveContentStatus({ status, data, error, isEmpty });
  const showRefreshError = resolved === 'content' && hasError(error);
  const [shownStatus, setShownStatus] = useState(resolved);
  const [hasChanged, setChanged] = useState(false);

  if (shownStatus !== resolved) {
    setShownStatus(resolved);
    setChanged(true);
  }

  const markFocusLost = useCallback(() => {
    focusLost.current = true;
  }, []);

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  useLayoutEffect(() => {
    if (!focusLost.current) return;
    focusLost.current = false;
    const node = rootRef.current;
    if (!node) return;
    const active = node.ownerDocument.activeElement;
    if (active && active !== node.ownerDocument.body) return;
    node.tabIndex = -1;
    node.addEventListener('blur', () => node.removeAttribute('tabindex'), { once: true });
    node.focus({ preventScroll: true });
  }, [resolved, showRefreshError]);

  const styles = contentStateStyles({
    size,
    hasCustomLoading: loadingContent != null,
    isAnimated: hasChanged && effectsEnabled,
  });
  const title = errorTitle === undefined ? t.errorTitle : resolveErrorNode(errorTitle, error);
  const description =
    errorDescription === undefined ? t.errorDescription : resolveErrorNode(errorDescription, error);
  const retryButton = onRetry ? <Button onPress={onRetry}>{t.retry}</Button> : undefined;

  function renderView() {
    switch (resolved) {
      case 'loading':
        return (
          <StateView
            key="loading"
            data-slot="loading-view"
            className={styles.view()}
            onFocusLost={markFocusLost}
          >
            <ProgressBar
              isIndeterminate
              aria-label={loadingLabel ?? t.loading}
              data-slot="loading"
              className={styles.loading()}
            >
              {loadingContent ?? <Spinner size={spinnerSizes[size]} className={styles.spinner()} />}
            </ProgressBar>
          </StateView>
        );
      case 'error':
        return (
          <StateView
            key="error"
            role="alert"
            data-slot="error-view"
            className={styles.view()}
            onFocusLost={markFocusLost}
          >
            {errorContent !== undefined ? (
              typeof errorContent === 'function' ? (
                errorContent(error, onRetry)
              ) : (
                errorContent
              )
            ) : (
              <EmptyState
                size={size}
                headingLevel={headingLevel}
                icon={<icons.error className="text-on-surface-variant" />}
                title={title}
                description={description}
                primaryAction={retryButton}
              />
            )}
          </StateView>
        );
      case 'empty':
        return (
          <StateView
            key="empty"
            role="status"
            data-slot="empty-view"
            className={styles.view()}
            onFocusLost={markFocusLost}
          >
            {emptyContent ?? (
              <EmptyState
                size={size}
                headingLevel={headingLevel}
                icon={emptyIcon ?? <icons.inbox />}
                title={emptyTitle ?? t.emptyTitle}
                description={emptyDescription}
                primaryAction={emptyAction}
              />
            )}
          </StateView>
        );
      default:
        return (
          <>
            {showRefreshError ? (
              <StateView
                key="refresh-error"
                data-slot="refresh-error"
                className={styles.refreshError()}
                onFocusLost={markFocusLost}
              >
                <Banner
                  tone="error"
                  announce
                  title={title}
                  description={description}
                  actions={retryButton}
                />
              </StateView>
            ) : null}
            <StateView
              key="content"
              data-slot="content-view"
              className={styles.view()}
              onFocusLost={markFocusLost}
            >
              {typeof children === 'function' ? children(data as T) : children}
            </StateView>
          </>
        );
    }
  }

  return (
    <div
      {...props}
      ref={setRootRef}
      data-slot="content-state"
      data-status={resolved}
      data-size={size}
      data-refreshing={isRefreshing || undefined}
      aria-busy={resolved === 'loading' || isRefreshing || undefined}
      className={styles.root({ className })}
    >
      {renderView()}
    </div>
  );
}
