import { cn } from '@/lib/cn';

interface Swatch {
  role: string;
  on: string;
  className: string;
}

const groups: { title: string; description: string; swatches: Swatch[] }[] = [
  {
    title: 'Layers',
    description: 'The page, the panels on it and the menus above them.',
    swatches: [
      { role: 'canvas', on: 'on-surface', className: 'bg-canvas text-on-surface' },
      {
        role: 'surface-raised',
        on: 'on-surface',
        className: 'bg-surface-raised text-on-surface',
      },
      {
        role: 'surface-overlay',
        on: 'on-surface',
        className: 'bg-surface-overlay text-on-surface shadow-md',
      },
      {
        role: 'inverse-surface',
        on: 'inverse-on-surface',
        className: 'bg-inverse-surface text-inverse-on-surface',
      },
    ],
  },
  {
    title: 'Solid fills',
    description: 'The main action, checked controls and solid badges. Vivid in both themes.',
    swatches: [
      {
        role: 'primary-solid',
        on: 'on-primary-solid',
        className: 'bg-primary-solid text-on-primary-solid',
      },
      {
        role: 'error-solid',
        on: 'on-error-solid',
        className: 'bg-error-solid text-on-error-solid',
      },
      {
        role: 'success-solid',
        on: 'on-success-solid',
        className: 'bg-success-solid text-on-success-solid',
      },
      {
        role: 'warning-solid',
        on: 'on-warning-solid',
        className: 'bg-warning-solid text-on-warning-solid',
      },
      { role: 'info-solid', on: 'on-info-solid', className: 'bg-info-solid text-on-info-solid' },
    ],
  },
  {
    title: 'Soft fills',
    description: 'Quiet actions, banners and status tags. Translucent, so they work on any layer.',
    swatches: [
      { role: 'neutral-soft', on: 'on-surface', className: 'bg-neutral-soft text-on-surface' },
      {
        role: 'primary-soft',
        on: 'on-primary-soft',
        className: 'bg-primary-soft text-on-primary-soft',
      },
      { role: 'error-soft', on: 'on-error-soft', className: 'bg-error-soft text-on-error-soft' },
      {
        role: 'success-soft',
        on: 'on-success-soft',
        className: 'bg-success-soft text-on-success-soft',
      },
      {
        role: 'warning-soft',
        on: 'on-warning-soft',
        className: 'bg-warning-soft text-on-warning-soft',
      },
      { role: 'info-soft', on: 'on-info-soft', className: 'bg-info-soft text-on-info-soft' },
    ],
  },
  {
    title: 'Text and lines',
    description: 'Body and secondary text, accent text, field borders and hairlines.',
    swatches: [
      { role: 'on-surface', on: 'surface', className: 'bg-on-surface text-surface' },
      {
        role: 'on-surface-variant',
        on: 'surface',
        className: 'bg-on-surface-variant text-surface',
      },
      { role: 'primary', on: 'on-primary', className: 'bg-primary text-on-primary' },
      {
        role: 'outline-variant',
        on: 'on-surface',
        className: 'bg-outline-variant text-on-surface',
      },
      {
        role: 'outline-subtle',
        on: 'on-surface',
        className: 'bg-outline-subtle text-on-surface',
      },
    ],
  },
];

const chartSwatches = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-chart-6',
  'bg-chart-7',
  'bg-chart-8',
];

function ChartSwatches() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-semibold text-on-surface">Chart colours</h3>
        <p className="text-sm text-on-surface-variant">
          Eight categorical series colours in a fixed order. One series uses primary instead.
        </p>
      </div>
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {chartSwatches.map((className, index) => (
          <li
            key={className}
            data-role={`chart-${index + 1}`}
            className="flex flex-col gap-1.5 rounded-field border border-outline-subtle bg-surface-raised p-1.5"
          >
            <span className={cn('h-10 rounded-sm', className)} />
            <span className="px-1 pb-0.5 text-xs font-medium text-on-surface">
              chart-{index + 1}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PaletteSwatches() {
  return (
    <div className="not-prose my-6 flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-on-surface">{group.title}</h3>
            <p className="text-sm text-on-surface-variant">{group.description}</p>
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {group.swatches.map((swatch) => (
              <li
                key={swatch.role}
                data-role={swatch.role}
                className={cn(
                  'flex h-20 flex-col justify-end gap-0.5 rounded-field border border-outline-subtle p-2.5',
                  swatch.className,
                )}
              >
                <span className="text-xs font-medium wrap-anywhere">{swatch.role}</span>
                <span className="font-mono text-[0.6875rem] wrap-anywhere">{swatch.on}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <ChartSwatches />
    </div>
  );
}
