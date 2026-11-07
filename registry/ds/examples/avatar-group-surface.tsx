import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';
import { Card, CardContent, CardHeader } from '@/registry/ds/ui/card';

const assignees = [
  { name: 'Priya Sharma', photo: '/samples/dusk.jpg' },
  { name: 'Noah Fischer', photo: '/samples/lagoon.jpg' },
  { name: 'Layla Haddad', photo: '/samples/moss.jpg' },
];

export default function AvatarGroupSurface() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader title="Website redesign" description="Due 30 September · 12 tasks" />
        <CardContent className="flex items-center justify-between gap-3">
          <AvatarGroup aria-label="Assignees" max={2}>
            {assignees.map(({ name }) => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
          <span className="text-xs font-medium text-on-surface-variant">In review</span>
        </CardContent>
      </Card>
      <div className="relative flex min-h-36 flex-col justify-end overflow-hidden rounded-container bg-[url(/samples/dune.jpg)] bg-cover bg-center p-4">
        <AvatarGroup aria-label="Shared with" max={3} size="md" seam="clip">
          {assignees.map(({ name, photo }) => (
            <Avatar key={name} name={name} src={photo} />
          ))}
        </AvatarGroup>
      </div>
    </div>
  );
}
