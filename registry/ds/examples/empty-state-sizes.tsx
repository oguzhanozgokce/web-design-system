import { GroupIcon, HistoryIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

export default function EmptyStateSizes() {
  return (
    <div className="grid w-full items-start gap-4 md:grid-cols-[1fr_1.4fr]">
      <section className="rounded-lg border border-outline-variant bg-surface">
        <h3 className="border-b border-outline-variant px-4 py-3 text-title-sm text-on-surface">
          Recent payouts
        </h3>
        <EmptyState
          size="compact"
          headingLevel={4}
          icon={<HistoryIcon />}
          title="No payouts this week"
          description="Payouts run every Monday."
          primaryAction={<ButtonLink href="#payouts">View all payouts</ButtonLink>}
        />
      </section>
      <section className="rounded-lg border border-outline-variant bg-surface">
        <h3 className="border-b border-outline-variant px-4 py-3 text-title-sm text-on-surface">
          Team
        </h3>
        <EmptyState
          headingLevel={4}
          icon={<GroupIcon />}
          title="Invite your team"
          description="Members can draft invoices. Only admins can send them or change billing."
          primaryAction={<Button>Invite people</Button>}
          secondaryAction={<Button>Manage roles</Button>}
        />
      </section>
    </div>
  );
}
