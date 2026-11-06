import { KbdCombo, type KbdKey } from '@/registry/ds/ui/kbd';

const shortcuts: { label: string; keys: KbdKey[] }[] = [
  { label: 'Search', keys: ['mod', 'K'] },
  { label: 'Command menu', keys: ['mod', 'shift', 'P'] },
  { label: 'Move line up', keys: ['alt', 'up'] },
];

export default function KbdPlatforms() {
  return (
    <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
      {(
        [
          { platform: 'apple', title: 'macOS and iOS' },
          { platform: 'other', title: 'Windows, Linux and Android' },
        ] as const
      ).map((column) => (
        <section
          key={column.platform}
          aria-label={column.title}
          className="rounded-md bg-surface-container-low p-4 text-on-surface"
        >
          <h3 className="mb-3 text-title-sm">{column.title}</h3>
          <dl className="flex flex-col gap-2.5 text-body-md">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.label} className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">{shortcut.label}</dt>
                <dd>
                  <KbdCombo keys={shortcut.keys} platform={column.platform} size="sm" />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
