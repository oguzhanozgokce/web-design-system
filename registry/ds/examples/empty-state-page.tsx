import { AddIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

function ProjectsIllustration() {
  return (
    <svg viewBox="0 0 240 180" fill="none">
      <ellipse cx="120" cy="166" rx="92" ry="10" className="fill-surface-container-high" />
      <rect
        x="40"
        y="36"
        width="120"
        height="120"
        rx="16"
        transform="rotate(-6 100 96)"
        className="fill-surface-container-highest"
      />
      <rect x="68" y="22" width="120" height="134" rx="16" className="fill-primary-container" />
      <rect x="88" y="46" width="64" height="10" rx="5" className="fill-on-primary-container/70" />
      <rect x="88" y="68" width="80" height="8" rx="4" className="fill-on-primary-container/30" />
      <rect x="88" y="86" width="68" height="8" rx="4" className="fill-on-primary-container/30" />
      <rect x="88" y="104" width="74" height="8" rx="4" className="fill-on-primary-container/30" />
      <circle cx="184" cy="134" r="26" className="fill-primary" />
      <path
        d="M184 122v24M172 134h24"
        strokeWidth="5"
        strokeLinecap="round"
        className="stroke-on-primary"
      />
    </svg>
  );
}

export default function EmptyStatePage() {
  return (
    <EmptyState
      size="page"
      illustration={<ProjectsIllustration />}
      title="Start your first project"
      description="A project keeps the files, tasks and people for one piece of work in one place."
      primaryAction={<Button startIcon={<AddIcon />}>Create project</Button>}
      secondaryAction={<ButtonLink href="#usage">Read the guide</ButtonLink>}
    />
  );
}
