import { ContentState } from '@/registry/ds/ui/content-state';

const panels = [
  { title: 'Revenue this month', status: 'loading' },
  { title: 'Failed payments', status: 'error' },
  { title: 'Upcoming renewals', status: 'empty' },
] as const;

export default function ContentStateSizes() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      {panels.map((panel) => (
        <section key={panel.title} className="rounded-lg border border-outline-variant bg-surface">
          <h3 className="px-4 pt-3 text-title-sm text-on-surface">{panel.title}</h3>
          <ContentState
            status={panel.status}
            size="compact"
            headingLevel={4}
            onRetry={() => new Promise((resolve) => setTimeout(resolve, 1200))}
          />
        </section>
      ))}
    </div>
  );
}
