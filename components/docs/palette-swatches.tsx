const groups: { title: string; pairs: [string, string][] }[] = [
  {
    title: 'Accent',
    pairs: [
      ['primary', 'on-primary'],
      ['primary-container', 'on-primary-container'],
      ['secondary', 'on-secondary'],
      ['secondary-container', 'on-secondary-container'],
      ['tertiary', 'on-tertiary'],
      ['tertiary-container', 'on-tertiary-container'],
    ],
  },
  {
    title: 'Feedback',
    pairs: [
      ['error', 'on-error'],
      ['error-container', 'on-error-container'],
      ['success', 'on-success'],
      ['success-container', 'on-success-container'],
      ['warning', 'on-warning'],
      ['warning-container', 'on-warning-container'],
      ['info', 'on-info'],
      ['info-container', 'on-info-container'],
    ],
  },
  {
    title: 'Surfaces',
    pairs: [
      ['surface-container-lowest', 'on-surface'],
      ['surface-container-low', 'on-surface'],
      ['surface-container', 'on-surface'],
      ['surface-container-high', 'on-surface'],
      ['surface-container-highest', 'on-surface'],
      ['surface-variant', 'on-surface-variant'],
      ['inverse-surface', 'inverse-on-surface'],
      ['outline', 'surface'],
    ],
  },
];

export function PaletteSwatches() {
  return (
    <div className="not-prose flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-2">
          <h3 className="text-title-sm text-on-surface">{group.title}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {group.pairs.map(([background, foreground]) => (
              <div
                key={background}
                className="flex h-20 flex-col justify-end rounded-md border border-outline-variant p-2"
                style={{ background: `var(--${background})`, color: `var(--${foreground})` }}
              >
                <span className="text-label-md">{background}</span>
                <span className="text-label-sm opacity-80">{foreground}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
