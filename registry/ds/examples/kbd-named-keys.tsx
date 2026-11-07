import { Kbd } from '@/registry/ds/ui/kbd';

const keys = [
  { key: 'enter', action: 'Open the selected item' },
  { key: 'escape', action: 'Close the panel' },
  { key: 'tab', action: 'Next field' },
  { key: 'space', action: 'Select the row' },
  { key: 'backspace', action: 'Remove the last filter' },
  { key: 'delete', action: 'Delete the draft' },
  { key: 'up', action: 'Previous row' },
  { key: 'down', action: 'Next row' },
];

export default function KbdNamedKeys() {
  return (
    <dl className="grid w-full max-w-md grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2.5 text-sm">
      {keys.map((item) => (
        <div key={item.key} className="contents">
          <dt className="justify-self-start">
            <Kbd>{item.key}</Kbd>
          </dt>
          <dd className="text-on-surface-variant">{item.action}</dd>
        </div>
      ))}
    </dl>
  );
}
