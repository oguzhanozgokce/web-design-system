import { AddIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

function ProjectsIllustration() {
  return (
    <svg viewBox="0 0 240 180" fill="none">
      <ellipse cx="120" cy="166" rx="92" ry="10" className="fill-neutral-soft" />
      <rect
        x="40"
        y="36"
        width="120"
        height="120"
        rx="20"
        transform="rotate(-6 100 96)"
        className="fill-neutral-soft-hover"
      />
      <rect
        x="68.5"
        y="22.5"
        width="119"
        height="133"
        rx="20"
        className="fill-surface-raised stroke-outline-variant"
      />
      <rect x="88" y="46" width="64" height="10" rx="5" className="fill-on-surface/70" />
      <rect x="88" y="68" width="80" height="8" rx="4" className="fill-neutral-soft-hover" />
      <rect x="88" y="86" width="68" height="8" rx="4" className="fill-neutral-soft-hover" />
      <rect x="88" y="104" width="74" height="8" rx="4" className="fill-neutral-soft-hover" />
      <circle cx="184" cy="134" r="26" className="fill-primary-solid" />
      <path
        d="M184 122v24M172 134h24"
        strokeWidth="5"
        strokeLinecap="round"
        className="stroke-on-primary-solid"
      />
    </svg>
  );
}

export default function EmptyStatePage() {
  return (
    <EmptyState
      size="lg"
      illustration={<ProjectsIllustration />}
      title="Start your first project"
      description="A project keeps the files, tasks and people for one piece of work in one place."
      primaryAction={<Button startIcon={<AddIcon />}>Create project</Button>}
      secondaryAction={<ButtonLink href="#usage">Read the guide</ButtonLink>}
    />
  );
}
