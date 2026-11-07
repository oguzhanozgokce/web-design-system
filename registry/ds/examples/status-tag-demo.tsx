import { StatusTag } from '@/registry/ds/ui/status-tag';

export default function StatusTagDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <StatusTag status="live" />
      <StatusTag status="inReview" />
      <StatusTag status="scheduled" />
      <StatusTag status="processing" />
      <StatusTag status="paused" />
      <StatusTag status="rejected" />
      <StatusTag status="draft" />
    </div>
  );
}
