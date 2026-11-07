import { Divider } from '@/registry/ds/ui/divider';

const settings = [
  { title: 'Language', value: 'English' },
  { title: 'Time zone', value: 'Set automatically' },
  { title: 'Theme', value: 'Same as device' },
];

export default function DividerDemo() {
  return (
    <div className="flex w-full max-w-md flex-col rounded-container border border-outline-subtle bg-surface-raised text-on-surface">
      {settings.map((setting, index) => (
        <div key={setting.title} className="flex flex-col">
          {index > 0 ? <Divider /> : null}
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm font-medium">{setting.title}</span>
            <span className="text-sm text-on-surface-variant">{setting.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
