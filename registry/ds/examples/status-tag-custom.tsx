import { ScheduleIcon } from '@/registry/ds/lib/icons';
import { StatusTag, StatusTagProvider, type StatusDefinitions } from '@/registry/ds/ui/status-tag';

const appStatuses: StatusDefinitions = {
  beta: { tone: 'primary', dot: true, label: 'Beta' },
  sunset: { tone: 'warning', icon: <ScheduleIcon />, label: 'Sunsetting' },
  live: { tone: 'success', dot: 'pulse' },
};

export default function StatusTagCustom() {
  return (
    <StatusTagProvider statuses={appStatuses}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <StatusTag status="beta" />
          <StatusTag status="sunset" />
          <StatusTag status="live" />
          <StatusTag status="inReview" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <StatusTag status="live" labels={{ live: 'Published' }} />
          <StatusTag status="nightly" />
          <StatusTag status="nightly" statuses={{ nightly: { tone: 'info', label: 'Nightly' } }} />
        </div>
      </div>
    </StatusTagProvider>
  );
}
