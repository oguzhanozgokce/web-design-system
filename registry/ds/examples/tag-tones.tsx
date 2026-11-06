import { Tag } from '@/registry/ds/ui/tag';

export default function TagTones() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Tag tone="neutral">Draft</Tag>
      <Tag tone="primary">New</Tag>
      <Tag tone="success">Active</Tag>
      <Tag tone="warning">Pending</Tag>
      <Tag tone="error">Failed</Tag>
      <Tag tone="info">Beta</Tag>
    </div>
  );
}
