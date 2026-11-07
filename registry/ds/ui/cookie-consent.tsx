'use client';

import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Disclosure, DisclosurePanel } from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import {
  resolveCookieConsent,
  type CookieConsentAction,
  type CookieConsentCategory,
  type CookieConsentDecision,
  type CookieConsentValue,
} from '@/registry/ds/lib/cookie-consent.ts';
import { fluidTween } from '@/registry/ds/lib/motion';
import { tv } from '@/registry/ds/lib/utils';
import { Button, ButtonGroupContext } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { Link } from '@/registry/ds/ui/link';
import { Switch } from '@/registry/ds/ui/switch';

export type {
  CookieConsentAction,
  CookieConsentCategory,
  CookieConsentDecision,
  CookieConsentValue,
} from '@/registry/ds/lib/cookie-consent.ts';

export type CookieConsentLayout = 'card' | 'banner' | 'compact';
export type CookieConsentPlacement = 'inline' | 'bottom-start' | 'bottom' | 'bottom-end';

export interface CookieConsentLabels {
  acceptAll: string;
  rejectAll: string;
  preferences: string;
  back: string;
  save: string;
  required: string;
  saving: string;
  error: string;
  privacyPolicy: string;
}

export const defaultCookieConsentLabels: CookieConsentLabels = {
  acceptAll: 'Accept all',
  rejectAll: 'Reject optional',
  preferences: 'Preferences',
  back: 'Back',
  save: 'Save choices',
  required: 'Always on',
  saving: 'Saving choices',
  error: "We couldn't save your choices. Please try again.",
  privacyPolicy: 'Privacy policy',
};

export const cookieConsentStyles = tv({
  slots: {
    root: '@container/consent w-full min-w-0 text-start',
    surface:
      'overflow-hidden rounded-container border border-outline-subtle bg-surface-overlay text-on-surface shadow-lg',
    content: 'grid min-w-0 grid-cols-1',
    header: 'flex min-w-0 items-start gap-3 p-5',
    icon: 'grid size-11 shrink-0 place-items-center rounded-full bg-neutral-soft text-on-surface [&_svg]:size-6',
    copy: 'flex min-w-0 flex-1 flex-col gap-1',
    title: 'text-base leading-6 font-semibold wrap-anywhere',
    description: 'text-sm leading-relaxed text-on-surface-variant wrap-anywhere',
    policy: 'self-start text-xs leading-5',
    panel: 'col-span-full h-(--disclosure-panel-height) overflow-clip aria-hidden:opacity-0',
    categories:
      'mx-5 mb-4 overflow-hidden rounded-overlay border border-outline-subtle bg-surface-raised divide-y divide-outline-subtle',
    category: 'relative min-w-0 p-1',
    required:
      'me-3 ms-3 inline-flex items-center gap-1 pb-2 text-xs font-medium text-on-surface-variant [&_svg]:size-3',
    footer: 'flex min-w-0 flex-col gap-2 px-5 pb-5',
    decisions: 'grid min-w-0 grid-cols-2 gap-2',
    action: 'h-auto min-h-10 min-w-0 py-2 whitespace-normal',
    preferences: 'h-auto min-h-10 min-w-0 py-2 whitespace-normal',
    error:
      'col-span-full mx-5 mb-4 rounded-item bg-error-soft px-3 py-2.5 text-sm text-on-error-soft',
  },
  variants: {
    layout: {
      card: { root: 'max-w-sm' },
      banner: {
        root: 'max-w-6xl',
        content: '@2xl/consent:grid-cols-[minmax(0,1fr)_auto] @2xl/consent:items-center',
        footer:
          '@2xl/consent:col-start-2 @2xl/consent:row-start-1 @2xl/consent:flex-row @2xl/consent:items-center @2xl/consent:ps-0 @2xl/consent:pt-5',
      },
      compact: {
        root: 'max-w-5xl',
        surface: '@2xl/consent:rounded-control',
        content: '@2xl/consent:grid-cols-[minmax(0,1fr)_auto] @2xl/consent:items-center',
        header: 'p-4',
        title: 'text-sm leading-5 font-medium',
        description: 'text-xs leading-5',
        footer:
          'px-4 pb-4 @2xl/consent:col-start-2 @2xl/consent:row-start-1 @2xl/consent:flex-row @2xl/consent:items-center @2xl/consent:ps-0 @2xl/consent:pt-4',
      },
    },
    placement: {
      inline: '',
      'bottom-start': { root: 'inset-s-4' },
      bottom: { root: 'inset-x-4 mx-auto' },
      'bottom-end': { root: 'inset-e-4' },
    },
    expanded: {
      true: {
        surface: 'rounded-container @2xl/consent:rounded-container',
        content: '@2xl/consent:grid-cols-1',
        footer:
          '@2xl/consent:col-start-auto @2xl/consent:row-start-auto @2xl/consent:ps-5 @2xl/consent:pt-0 @2xl/consent:justify-end',
      },
      false: '',
    },
    animated: {
      true: {
        panel: 'transition-[height,opacity] duration-250 ease-fluid motion-reduce:transition-none',
        surface: 'transition-[border-radius] duration-250 ease-fluid motion-reduce:transition-none',
      },
      false: '',
    },
  },
  compoundVariants: [
    {
      placement: ['bottom-start', 'bottom', 'bottom-end'],
      class: {
        root: 'fixed bottom-(--cookie-consent-bottom) z-40 w-[calc(100%-2rem)] [--cookie-consent-bottom:max(1rem,env(safe-area-inset-bottom))]',
        surface:
          'max-h-[calc(100dvh-var(--cookie-consent-bottom)-1rem)] overflow-y-auto overscroll-contain',
      },
    },
  ],
  defaultVariants: { layout: 'card', placement: 'inline', expanded: false, animated: true },
});

export interface CookieConsentProps extends Omit<
  ComponentProps<'section'>,
  'children' | 'title' | 'onChange' | 'defaultValue'
> {
  title: ReactNode;
  description?: ReactNode;
  categories?: readonly CookieConsentCategory[];
  value?: CookieConsentValue;
  defaultValue?: CookieConsentValue;
  onChange?: (value: CookieConsentValue) => void;
  onConfirm: (decision: CookieConsentDecision) => void | Promise<unknown>;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isDisabled?: boolean;
  layout?: CookieConsentLayout;
  placement?: CookieConsentPlacement;
  privacyPolicyHref?: string;
  icon?: ReactNode;
  labels?: Partial<CookieConsentLabels>;
}

export function CookieConsent({
  isOpen,
  defaultOpen = true,
  onOpenChange,
  value,
  defaultValue = {},
  onChange,
  ...props
}: CookieConsentProps) {
  const [open, setOpen] = useControllableState(isOpen, defaultOpen, onOpenChange);
  const [draft, setDraft] = useControllableState(value, defaultValue, onChange);

  return (
    <AnimatePresence>
      {open ? (
        <CookieConsentSurface
          key="consent"
          {...props}
          value={draft}
          onChange={setDraft}
          onCommitComplete={() => setOpen(false)}
        />
      ) : null}
    </AnimatePresence>
  );
}

interface CookieConsentSurfaceProps extends Omit<
  CookieConsentProps,
  'isOpen' | 'defaultOpen' | 'onOpenChange' | 'defaultValue'
> {
  value: CookieConsentValue;
  onChange: (value: CookieConsentValue) => void;
  onCommitComplete: () => void;
}

function CookieConsentSurface({
  title,
  description,
  categories = [],
  value,
  onChange,
  onConfirm,
  onCommitComplete,
  layout = 'card',
  placement = 'inline',
  privacyPolicyHref,
  icon,
  labels,
  isDisabled = false,
  className,
  ...props
}: CookieConsentSurfaceProps) {
  const t = useLabels('cookieConsent', defaultCookieConsentLabels, labels);
  const icons = useIcons();
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  const isPresent = useIsPresent();
  const [expanded, setExpanded] = useState(false);
  const [pending, setPending] = useState<CookieConsentAction | null>(null);
  const [hasError, setError] = useState(false);
  const mounted = useRef(false);
  const running = useRef(false);
  const attempt = useRef(0);
  const titleId = useId();
  const descriptionId = useId();
  const current = resolveCookieConsent(categories, value);
  const styles = cookieConsentStyles({
    layout,
    placement,
    expanded: expanded || hasError,
    animated: spatialEnabled,
  });
  const disabled = isDisabled || pending !== null;
  const glyph = icon === undefined ? <icons.cookie /> : icon;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!isPresent) attempt.current += 1;
  }, [isPresent]);

  async function confirm(action: CookieConsentAction) {
    if (disabled || running.current || !isPresent) return;
    running.current = true;
    const request = ++attempt.current;
    const decision = { action, value: resolveCookieConsent(categories, current, action) };
    setPending(action);
    setError(false);
    try {
      await onConfirm(decision);
      if (!mounted.current || request !== attempt.current) return;
      onChange(decision.value);
      onCommitComplete();
    } catch {
      if (mounted.current && request === attempt.current) setError(true);
    } finally {
      running.current = false;
      if (mounted.current) setPending(null);
    }
  }

  const primaryAction = expanded ? 'save-preferences' : 'accept-all';

  return (
    <section
      {...props}
      role="region"
      aria-labelledby={props['aria-labelledby'] ?? (props['aria-label'] ? undefined : titleId)}
      aria-describedby={
        props['aria-describedby'] ?? (description != null ? descriptionId : undefined)
      }
      aria-busy={pending !== null || undefined}
      aria-hidden={!isPresent || undefined}
      inert={!isPresent}
      data-slot="cookie-consent"
      data-layout={layout}
      data-placement={placement}
      data-expanded={expanded || undefined}
      data-pending={pending !== null || undefined}
      data-invalid={hasError || undefined}
      className={styles.root({ className })}
    >
      <motion.div
        data-slot="cookie-consent-surface"
        className={styles.surface()}
        initial={effectsEnabled ? { opacity: 0, y: spatialEnabled ? 16 : 0 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: effectsEnabled ? 0 : 1, y: spatialEnabled ? 10 : 0 }}
        transition={effectsEnabled ? fluidTween(250) : { duration: 0 }}
      >
        <ButtonGroupContext value={null}>
          <Disclosure
            isExpanded={expanded}
            onExpandedChange={setExpanded}
            isDisabled={disabled}
            className={styles.content()}
          >
            <header data-slot="cookie-consent-header" className={styles.header()}>
              {glyph != null ? (
                <span aria-hidden="true" data-slot="icon" className={styles.icon()}>
                  {glyph}
                </span>
              ) : null}
              <div className={styles.copy()}>
                <h2 id={titleId} data-slot="title" className={styles.title()}>
                  {title}
                </h2>
                {description != null ? (
                  <div id={descriptionId} data-slot="description" className={styles.description()}>
                    {description}
                  </div>
                ) : null}
                {privacyPolicyHref ? (
                  <Link href={privacyPolicyHref} className={styles.policy()}>
                    {t.privacyPolicy}
                  </Link>
                ) : null}
              </div>
            </header>
            {categories.length ? (
              <DisclosurePanel data-slot="cookie-consent-preferences" className={styles.panel()}>
                <div className={styles.categories()}>
                  {categories.map((category) => (
                    <div key={category.id} className={styles.category()}>
                      <Switch
                        variant="row"
                        isSelected={current[category.id]}
                        isReadOnly={category.isRequired}
                        isDisabled={disabled}
                        description={category.description}
                        onChange={(selected) => onChange({ ...current, [category.id]: selected })}
                      >
                        {category.label}
                      </Switch>
                      {category.isRequired ? (
                        <span data-slot="required" className={styles.required()}>
                          <icons.lock />
                          {t.required}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </DisclosurePanel>
            ) : null}
            {hasError ? (
              <p role="alert" className={styles.error()}>
                {t.error}
              </p>
            ) : null}
            <div data-slot="cookie-consent-actions" className={styles.footer()}>
              <div className={styles.decisions()}>
                <Button
                  variant="soft"
                  tone="neutral"
                  className={styles.action()}
                  isDisabled={isDisabled || (pending !== null && pending !== 'reject-all')}
                  isPending={pending === 'reject-all'}
                  labels={{ pending: t.saving }}
                  onPress={() => confirm('reject-all')}
                >
                  {t.rejectAll}
                </Button>
                <Button
                  variant={expanded ? 'solid' : 'soft'}
                  tone={expanded ? 'primary' : 'neutral'}
                  className={styles.action()}
                  isDisabled={isDisabled || (pending !== null && pending !== primaryAction)}
                  isPending={pending === primaryAction}
                  labels={{ pending: t.saving }}
                  onPress={() => confirm(primaryAction)}
                >
                  {expanded ? t.save : t.acceptAll}
                </Button>
              </div>
              {categories.length ? (
                <Button
                  slot="trigger"
                  variant="ghost"
                  isDisabled={disabled}
                  className={styles.preferences()}
                  startIcon={expanded ? <icons.chevronUp /> : <icons.tune />}
                >
                  {expanded ? t.back : t.preferences}
                </Button>
              ) : null}
            </div>
          </Disclosure>
        </ButtonGroupContext>
      </motion.div>
    </section>
  );
}
