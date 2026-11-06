import { Tag } from '@/registry/ds/ui/tag';

export default function TagDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Tag tone="success" dot>
        Paid
      </Tag>
      <Tag tone="warning" dot>
        Due in 3 days
      </Tag>
      <Tag tone="error" dot>
        Overdue
      </Tag>
      <Tag>Draft</Tag>
    </div>
  );
}
