import { GroupIcon, HistoryIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

export default function EmptyStateSizes() {
  return (
    <div className="grid w-full items-start gap-4 md:grid-cols-[1fr_1.4fr]">
      <section className="rounded-lg border border-outline-variant bg-surface">
        <h3 className="border-b border-outline-variant px-4 py-3 text-title-sm text-on-surface">
          Recent activity
        </h3>
        <EmptyState
          size="compact"
          headingLevel={4}
          icon={<HistoryIcon />}
          title="No activity this week"
          description="Changes you and your team make appear here."
          primaryAction={<ButtonLink href="#sizes">View all activity</ButtonLink>}
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
          description="Members can view and edit. Only admins can change settings."
          primaryAction={<Button>Invite people</Button>}
          secondaryAction={<Button>Manage roles</Button>}
        />
      </section>
    </div>
  );
}
