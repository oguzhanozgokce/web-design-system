import { GroupIcon, HistoryIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

export default function EmptyStateSizes() {
  return (
    <div className="grid w-full items-start gap-4 md:grid-cols-[1fr_1.4fr]">
      <section className="rounded-container border border-outline-subtle bg-surface-raised">
        <h3 className="border-b border-outline-subtle px-4 py-3 text-sm font-semibold text-on-surface">
          Recent activity
        </h3>
        <EmptyState
          size="sm"
          headingLevel={4}
          icon={<HistoryIcon />}
          title="No activity this week"
          description="Changes you and your team make appear here."
          primaryAction={<ButtonLink href="#sizes">View all activity</ButtonLink>}
        />
      </section>
      <section className="rounded-container border border-outline-subtle bg-surface-raised">
        <h3 className="border-b border-outline-subtle px-4 py-3 text-sm font-semibold text-on-surface">
          Team
        </h3>
        <EmptyState
          headingLevel={4}
          icon={<GroupIcon />}
          title="Invite your team"
          description="Members can view and edit. Only admins can change settings."
          primaryAction={<Button>Invite people</Button>}
          secondaryAction={<Button>Manage roles</Button>}
        />
      </section>
    </div>
  );
}
