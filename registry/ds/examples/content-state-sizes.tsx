import { ContentState } from '@/registry/ds/ui/content-state';

const panels = [
  { title: 'Recent files', status: 'loading' },
  { title: 'Messages', status: 'error' },
  { title: 'Upcoming events', status: 'empty' },
] as const;

export default function ContentStateSizes() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      {panels.map((panel) => (
        <section
          key={panel.title}
          className="rounded-container border border-outline-subtle bg-surface-raised"
        >
          <h3 className="px-4 pt-3 text-sm font-semibold text-on-surface">{panel.title}</h3>
          <ContentState
            status={panel.status}
            size="sm"
            headingLevel={4}
            onRetry={() => new Promise((resolve) => setTimeout(resolve, 1200))}
          />
        </section>
      ))}
    </div>
  );
}
