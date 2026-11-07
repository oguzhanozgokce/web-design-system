'use client';

import {
  createContext,
  use,
  useCallback,
  useMemo,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { tv } from '@/registry/ds/lib/utils';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { Tag, type TagProps, type TagTone } from '@/registry/ds/ui/tag';

export type StatusKey =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'pending'
  | 'inReview'
  | 'scheduled'
  | 'processing'
  | 'live'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'archived'
  | 'expired'
  | 'canceled'
  | 'unknown';

export interface StatusDefinition {
  tone: TagTone;
  dot?: boolean | 'pulse';
  icon?: ReactNode;
  label?: string;
}

export type StatusDefinitions = Record<string, StatusDefinition>;

export type StatusTagLabels = Record<StatusKey, string>;

export const defaultStatusTagLabels: StatusTagLabels = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  pending: 'Pending',
  inReview: 'In review',
  scheduled: 'Scheduled',
  processing: 'Processing',
  live: 'Live',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
  rejected: 'Rejected',
  archived: 'Archived',
  expired: 'Expired',
  canceled: 'Canceled',
  unknown: 'Unknown',
};

export const defaultStatusDefinitions: Record<StatusKey, StatusDefinition> = {
  active: { tone: 'success', dot: true },
  inactive: { tone: 'neutral', dot: true },
  draft: { tone: 'neutral', dot: true },
  pending: { tone: 'warning', dot: true },
  inReview: { tone: 'info', dot: true },
  scheduled: { tone: 'info', dot: true },
  processing: { tone: 'primary', dot: 'pulse' },
  live: { tone: 'success', dot: true },
  paused: { tone: 'warning', dot: true },
  completed: { tone: 'success', dot: true },
  failed: { tone: 'error', dot: true },
  rejected: { tone: 'error', dot: true },
  archived: { tone: 'neutral', dot: true },
  expired: { tone: 'neutral', dot: true },
  canceled: { tone: 'neutral', dot: true },
  unknown: { tone: 'neutral', dot: true },
};

export interface ResolvedStatus {
  key: string;
  tone: TagTone;
  dot: boolean | 'pulse';
  icon?: ReactNode;
  label: string;
  isKnown: boolean;
}

const StatusDefinitionsContext = createContext<StatusDefinitions | null>(null);

export interface StatusTagProviderProps {
  statuses: StatusDefinitions;
  children: ReactNode;
}

export function StatusTagProvider({ statuses, children }: StatusTagProviderProps) {
  const parent = use(StatusDefinitionsContext);
  const value = useMemo(() => (parent ? { ...parent, ...statuses } : statuses), [parent, statuses]);
  return <StatusDefinitionsContext value={value}>{children}</StatusDefinitionsContext>;
}

function isBuiltIn(key: string): key is StatusKey {
  return Object.hasOwn(defaultStatusDefinitions, key);
}

export function useStatusDefinitions() {
  return use(StatusDefinitionsContext);
}

export function resolveStatus(
  status: string,
  definitions: StatusDefinitions | null | undefined,
  labels: StatusTagLabels,
): ResolvedStatus {
  const definition =
    definitions?.[status] ?? (isBuiltIn(status) ? defaultStatusDefinitions[status] : undefined);
  if (!definition) {
    const fallback = defaultStatusDefinitions.unknown;
    return {
      key: status,
      tone: fallback.tone,
      dot: fallback.dot ?? false,
      label: labels.unknown,
      isKnown: false,
    };
  }
  return {
    key: status,
    tone: definition.tone,
    dot: definition.dot ?? false,
    icon: definition.icon,
    label: definition.label ?? (isBuiltIn(status) ? labels[status] : status),
    isKnown: true,
  };
}

export function useStatusTagLabels(labels?: Partial<StatusTagLabels>) {
  return useLabels('statusTag', defaultStatusTagLabels, labels);
}

export function mergeStatusDefinitions(
  shared: StatusDefinitions | null | undefined,
  own: StatusDefinitions | null | undefined,
): StatusDefinitions | null {
  if (shared && own) return { ...shared, ...own };
  return own ?? shared ?? null;
}

export function useStatusResolver(statuses?: StatusDefinitions, labels?: Partial<StatusTagLabels>) {
  const shared = useStatusDefinitions();
  const t = useStatusTagLabels(labels);
  const definitions = useMemo(() => mergeStatusDefinitions(shared, statuses), [shared, statuses]);
  return useCallback((status: string) => resolveStatus(status, definitions, t), [definitions, t]);
}

export interface StatusTagProps extends Omit<TagProps, 'tone' | 'dot' | 'children' | 'labels'> {
  status: StatusKey | (string & {});
  statuses?: StatusDefinitions;
  labels?: Partial<StatusTagLabels>;
  children?: ReactNode;
}

export function StatusTag({
  status,
  statuses,
  labels,
  icon,
  children,
  textValue,
  ...props
}: StatusTagProps) {
  const resolve = useStatusResolver(statuses, labels);
  const resolved = resolve(status);

  return (
    <Tag
      {...props}
      tone={resolved.tone}
      dot={resolved.dot}
      icon={icon ?? resolved.icon}
      textValue={textValue ?? (children == null ? resolved.label : undefined)}
      data-status={status}
      data-status-known={resolved.isKnown || undefined}
    >
      {children ?? resolved.label}
    </Tag>
  );
}

export const statusDotStyles = tv({
  base: 'inline-block size-2 shrink-0 rounded-full',
  variants: {
    tone: {
      neutral: 'bg-on-surface-variant',
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
      info: 'bg-info',
    },
    pulse: {
      true: 'animate-ds-pulse motion-reduce:animate-none',
      false: '',
    },
  },
  defaultVariants: {
    tone: 'neutral',
    pulse: false,
  },
});

export interface StatusDotProps extends Omit<ComponentProps<'span'>, 'children'> {
  status: StatusKey | (string & {});
  statuses?: StatusDefinitions;
}

export function StatusDot({ status, statuses, className, ...props }: StatusDotProps) {
  const resolve = useStatusResolver(statuses);
  const { decorativeEnabled } = useMotionPreference();
  const resolved = resolve(status);

  return (
    <span
      aria-hidden="true"
      {...props}
      data-slot="status-dot"
      data-status={status}
      data-tone={resolved.tone}
      className={statusDotStyles({
        tone: resolved.tone,
        pulse: resolved.dot === 'pulse' && decorativeEnabled,
        className,
      })}
    />
  );
}
