import { GroupIcon, MailIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ContentState } from '@/registry/ds/ui/content-state';

interface Member {
  id: string;
  name: string;
}

const members: Member[] = [];

export default function ContentStateEmpty() {
  return (
    <ContentState
      data={members}
      headingLevel={3}
      emptyIcon={<GroupIcon />}
      emptyTitle="No team members yet"
      emptyDescription="Invite your accountant or a colleague. They get access to invoices, not billing."
      emptyAction={<Button startIcon={<MailIcon />}>Invite people</Button>}
      className="max-w-lg rounded-lg border border-outline-variant bg-surface"
    >
      {(items) => (
        <ul>
          {items.map((member) => (
            <li key={member.id}>{member.name}</li>
          ))}
        </ul>
      )}
    </ContentState>
  );
}
