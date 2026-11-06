import { Tag } from '@/registry/ds/ui/tag';

export default function TagSizes() {
  return (
    <div className="flex flex-col items-center gap-3">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center justify-center gap-2">
          <Tag size={size} tone="success" dot>
            Active
          </Tag>
          <Tag size={size} tone="info">
            Beta
          </Tag>
          <Tag size={size}>Read only</Tag>
        </div>
      ))}
    </div>
  );
}
