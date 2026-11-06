import { Divider } from '@/registry/ds/ui/divider';

const settings = [
  { title: 'Default currency', value: 'USD, US dollar' },
  { title: 'Fiscal year starts', value: 'January' },
  { title: 'Invoice numbering', value: 'INV-0001, then +1' },
];

export default function DividerDemo() {
  return (
    <div className="flex w-full max-w-md flex-col rounded-lg bg-surface-container-low text-on-surface">
      {settings.map((setting, index) => (
        <div key={setting.title} className="flex flex-col">
          {index > 0 ? <Divider /> : null}
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-body-lg">{setting.title}</span>
            <span className="text-body-md text-on-surface-variant">{setting.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
