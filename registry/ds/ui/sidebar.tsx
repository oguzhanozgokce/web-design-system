'use client';

import {
  createContext,
  use,
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type Ref,
} from 'react';
import { Link as AriaLink, composeRenderProps, type LinkProps } from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import { useMediaQuery } from '@/registry/ds/hooks/use-media-query';
import { tv } from '@/registry/ds/lib/utils';
import {
  useDirection,
  useIcons,
  useLabels,
  useMotionPreference,
} from '@/registry/ds/ui/ds-provider';
import { IconButton, type IconButtonProps } from '@/registry/ds/ui/icon-button';
import { Sheet } from '@/registry/ds/ui/sheet';
import { Tooltip, TooltipTrigger } from '@/registry/ds/ui/tooltip';

export interface SidebarLabels {
  navigation: string;
  expand: string;
  collapse: string;
  open: string;
  close: string;
}

export const defaultSidebarLabels: SidebarLabels = {
  navigation: 'Main navigation',
  expand: 'Expand sidebar',
  collapse: 'Collapse sidebar',
  open: 'Open navigation',
  close: 'Close navigation',
};

interface SidebarContextValue {
  id: string;
  isMobile: boolean;
  isCollapsed: boolean;
  setCollapsed: (value: boolean) => void;
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  labels: SidebarLabels;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = use(SidebarContext);
  if (!context) throw new Error('Sidebar parts must be inside SidebarProvider.');
  return context;
}

export interface SidebarProviderProps extends ComponentPropsWithRef<'div'> {
  isCollapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  labels?: Partial<SidebarLabels>;
}

export const sidebarStyles = tv({
  slots: {
    layout: 'flex min-h-0 w-full',
    base: 'group/sidebar flex min-h-0 shrink-0 flex-col overflow-hidden bg-canvas text-on-surface',
    header: 'flex shrink-0 flex-col gap-3 p-3',
    content: 'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-2',
    footer: 'flex shrink-0 flex-col gap-2 border-t border-outline-subtle p-3',
    group: 'flex flex-col gap-1 not-first:mt-6',
    groupLabel:
      'mb-1 px-3 text-xs font-medium text-on-surface-variant group-data-[collapsed]/sidebar:sr-only',
    link: [
      'focus-ring-inset transition-control no-tap-highlight relative flex h-10 w-full shrink-0 cursor-pointer items-center gap-3 rounded-item px-3 text-sm font-medium whitespace-nowrap text-on-surface-variant no-underline outline-none',
      'data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover data-[pressed]:scale-[0.98] motion-reduce:data-[pressed]:scale-100',
      'data-[current]:bg-primary-soft data-[current]:text-on-primary-soft data-[current]:data-[hovered]:bg-primary-soft-hover',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ],
    icon: 'flex size-5 shrink-0 items-center justify-center text-xl [&_svg]:size-[1em]',
    label: 'min-w-0 flex-1 truncate group-data-[collapsed]/sidebar:sr-only',
    badge: 'shrink-0 text-xs tabular-nums group-data-[collapsed]/sidebar:sr-only',
  },
  variants: {
    variant: {
      standard: { base: 'border-e border-outline-subtle' },
      floating: {
        base: 'rounded-container border border-outline-subtle bg-surface-raised shadow-sm',
      },
    },
    isCollapsed: { true: { base: 'w-[4.5rem]' }, false: { base: 'w-64' } },
    motion: {
      true: { base: 'transition-[width] duration-250 ease-fluid motion-reduce:transition-none' },
    },
  },
});

export function SidebarProvider({
  isCollapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  isOpen: openProp,
  defaultOpen = false,
  onOpenChange,
  labels,
  className,
  children,
  ...props
}: SidebarProviderProps) {
  const id = useId();
  const isMobile = useMediaQuery('(width < 48rem)');
  const [isCollapsed, setCollapsed] = useControllableState(
    collapsedProp,
    defaultCollapsed,
    onCollapsedChange,
  );
  const [isOpen, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const t = useLabels('sidebar', defaultSidebarLabels, labels);
  const wasMobile = useRef(isMobile);
  useEffect(() => {
    if (wasMobile.current && !isMobile) setOpen(false);
    wasMobile.current = isMobile;
  }, [isMobile, setOpen]);

  return (
    <SidebarContext value={{ id, isMobile, isCollapsed, setCollapsed, isOpen, setOpen, labels: t }}>
      <div {...props} data-slot="sidebar-layout" className={sidebarStyles().layout({ className })}>
        {children}
      </div>
    </SidebarContext>
  );
}

export interface SidebarProps extends Omit<ComponentPropsWithRef<'nav'>, 'id'> {
  variant?: 'standard' | 'floating';
  side?: 'start' | 'end';
}

export function Sidebar({
  variant = 'standard',
  side = 'start',
  className,
  children,
  ...props
}: SidebarProps) {
  const { id, isMobile, isCollapsed, isOpen, setOpen, labels } = useSidebar();
  const { spatialEnabled } = useMotionPreference();
  const { close: Close } = useIcons();
  const collapsed = !isMobile && isCollapsed;
  const styles = sidebarStyles({ variant, isCollapsed: collapsed, motion: spatialEnabled });
  const content = (
    <nav
      aria-label={labels.navigation}
      {...props}
      id={isMobile ? undefined : id}
      data-slot="sidebar"
      data-variant={variant}
      data-side={side}
      data-collapsed={collapsed || undefined}
      data-mobile={isMobile || undefined}
      className={styles.base({
        className: [
          side === 'end' && 'order-last border-s border-e-0',
          isMobile ? 'h-full w-full rounded-none border-0 shadow-none' : 'max-md:hidden',
          className,
        ],
      })}
    >
      {isMobile ? (
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <span className="text-sm font-semibold">{props['aria-label'] ?? labels.navigation}</span>
          <IconButton aria-label={labels.close} icon={<Close />} onPress={() => setOpen(false)} />
        </div>
      ) : null}
      {children}
    </nav>
  );
  return isMobile ? (
    <Sheet
      id={id}
      side={side}
      size="sm"
      isOpen={isOpen}
      onOpenChange={setOpen}
      aria-label={props['aria-label'] ?? labels.navigation}
    >
      {content}
    </Sheet>
  ) : (
    content
  );
}

export type SidebarHeaderProps = ComponentPropsWithRef<'div'>;
export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div {...props} data-slot="sidebar-header" className={sidebarStyles().header({ className })} />
  );
}

export type SidebarContentProps = ComponentPropsWithRef<'div'>;
export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div
      {...props}
      data-slot="sidebar-content"
      className={sidebarStyles().content({ className })}
    />
  );
}

export type SidebarFooterProps = ComponentPropsWithRef<'div'>;
export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div {...props} data-slot="sidebar-footer" className={sidebarStyles().footer({ className })} />
  );
}

export interface SidebarGroupProps extends ComponentPropsWithRef<'div'> {
  label?: string;
}
export function SidebarGroup({ label, className, children, ...props }: SidebarGroupProps) {
  const id = useId();
  const styles = sidebarStyles();
  return (
    <div
      role="group"
      aria-labelledby={label ? id : undefined}
      {...props}
      data-slot="sidebar-group"
      className={styles.group({ className })}
    >
      {label ? (
        <div id={id} data-slot="sidebar-group-label" className={styles.groupLabel()}>
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export interface SidebarLinkProps extends Omit<LinkProps, 'children'> {
  ref?: Ref<HTMLAnchorElement>;
  children: string;
  icon: ReactNode;
  badge?: ReactNode;
  isCurrent?: boolean;
  closeOnNavigate?: boolean;
}

export function SidebarLink({
  children,
  icon,
  badge,
  isCurrent,
  closeOnNavigate = true,
  className,
  onPress,
  ...props
}: SidebarLinkProps) {
  const { isCollapsed, isMobile, setOpen } = useSidebar();
  const direction = useDirection();
  const styles = sidebarStyles();
  return (
    <TooltipTrigger isDisabled={!isCollapsed || isMobile}>
      <AriaLink
        {...props}
        aria-current={isCurrent ? 'page' : props['aria-current']}
        data-slot="sidebar-link"
        data-current={isCurrent || undefined}
        onPress={(event) => {
          onPress?.(event);
          if (isMobile && closeOnNavigate) setOpen(false);
        }}
        className={composeRenderProps(className, (className) => styles.link({ className }))}
      >
        <span data-slot="sidebar-icon" aria-hidden="true" className={styles.icon()}>
          {icon}
        </span>
        <span data-slot="sidebar-label" className={styles.label()}>
          {children}
        </span>
        {badge != null ? (
          <span data-slot="sidebar-badge" className={styles.badge()}>
            {badge}
          </span>
        ) : null}
      </AriaLink>
      <Tooltip placement={direction === 'rtl' ? 'left' : 'right'}>{children}</Tooltip>
    </TooltipTrigger>
  );
}

export type SidebarTriggerProps = Omit<
  IconButtonProps,
  'icon' | 'onPress' | 'aria-label' | 'labels'
> & { 'aria-label'?: string };
export function SidebarTrigger(props: SidebarTriggerProps) {
  const { id, isMobile, isCollapsed, setCollapsed, isOpen, setOpen, labels } = useSidebar();
  const { menu: Menu, menuOpen: MenuOpen } = useIcons();
  return (
    <IconButton
      aria-label={
        isMobile
          ? isOpen
            ? labels.close
            : labels.open
          : isCollapsed
            ? labels.expand
            : labels.collapse
      }
      {...props}
      data-sidebar-trigger=""
      aria-controls={!isMobile || isOpen ? id : undefined}
      aria-expanded={isMobile ? isOpen : !isCollapsed}
      icon={isMobile || isCollapsed ? <Menu /> : <MenuOpen className="rtl:-scale-x-100" />}
      onPress={() => (isMobile ? setOpen(!isOpen) : setCollapsed(!isCollapsed))}
    />
  );
}
