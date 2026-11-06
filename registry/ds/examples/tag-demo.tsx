import { Tag } from '@/registry/ds/ui/tag';

export default function TagDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Tag tone="success" dot>
        Active
      </Tag>
      <Tag tone="warning" dot>
        Pending
      </Tag>
      <Tag tone="error" dot>
        Failed
      </Tag>
      <Tag>Archived</Tag>
    </div>
  );
}
