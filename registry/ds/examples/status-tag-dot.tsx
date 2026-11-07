import { StatusDot } from '@/registry/ds/ui/status-tag';

const services = [
  { id: 'sync', name: 'Photo sync', status: 'live', detail: 'Up to date' },
  { id: 'backup', name: 'Nightly backup', status: 'processing', detail: 'Uploading 4 of 12' },
  { id: 'share', name: 'Shared albums', status: 'paused', detail: 'Paused on cellular' },
  { id: 'export', name: 'Export to drive', status: 'failed', detail: 'Drive is full' },
];

export default function StatusTagDot() {
  return (
    <ul className="flex w-full max-w-xs flex-col divide-y divide-outline-subtle rounded-container border border-outline-subtle bg-surface-raised">
      {services.map((service) => (
        <li key={service.id} className="flex items-center gap-3 px-4 py-3">
          <StatusDot status={service.status} />
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium text-on-surface">{service.name}</span>
            <span className="text-xs text-on-surface-variant">{service.detail}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
