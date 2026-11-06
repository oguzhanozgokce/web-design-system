import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';

export default function AvatarGroupSurface() {
  return (
    <div className="w-full max-w-sm rounded-lg bg-surface-container-high p-4 text-on-surface [--ds-avatar-ring:var(--surface-container-high)]">
      <p className="text-title-sm">Website redesign</p>
      <p className="mt-1 mb-4 text-body-md text-on-surface-variant">Due 30 September · 12 tasks</p>
      <div className="flex items-center justify-between gap-3">
        <AvatarGroup aria-label="Assignees" max={2}>
          <Avatar name="Priya Sharma" />
          <Avatar name="Noah Fischer" />
          <Avatar name="Layla Haddad" />
        </AvatarGroup>
        <span className="text-label-md text-on-surface-variant">In review</span>
      </div>
    </div>
  );
}
