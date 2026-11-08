import {
  AddIcon,
  ArrowForwardIcon,
  CheckIcon,
  CloseIcon,
  SearchIcon,
  SettingsIcon,
} from '@/registry/ds/lib/icons';

export interface FoundationFlowProps {
  caption: string;
  steps: { title: string; description: string; code?: string }[];
}

export function FoundationFlow({ caption, steps }: FoundationFlowProps) {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-container border border-outline-subtle bg-surface-raised text-on-surface">
      <ol className="flex flex-col gap-7 p-5 sm:flex-row sm:gap-6 sm:p-6">
        {steps.map((step, index) => (
          <li key={step.title} className="relative min-w-0 flex-1">
            <span
              aria-hidden="true"
              className="mb-4 flex size-7 items-center justify-center rounded-full bg-primary-soft font-mono text-xs text-on-primary-soft"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="text-sm font-semibold">{step.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
              {step.description}
            </p>
            {step.code ? (
              <code className="mt-3 block font-mono text-xs wrap-anywhere text-primary">
                {step.code}
              </code>
            ) : null}
            {index < steps.length - 1 ? (
              <ArrowForwardIcon
                aria-hidden="true"
                className="absolute start-1 -bottom-6 size-4 rotate-90 text-on-surface-variant sm:start-auto sm:-end-5 sm:top-1.5 sm:bottom-auto sm:rotate-0 sm:rtl:rotate-180"
              />
            ) : null}
          </li>
        ))}
      </ol>
      <figcaption className="border-t border-outline-subtle bg-canvas px-5 py-3 text-xs leading-relaxed text-on-surface-variant sm:px-6">
        {caption}
      </figcaption>
    </figure>
  );
}

export function TypeSpecimen() {
  return (
    <figure className="not-prose my-8 rounded-container border border-outline-subtle bg-surface-raised p-6 text-on-surface">
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 font-mono text-xs text-on-surface-variant">Display · 36 / 40 · 600</p>
          <p className="text-4xl font-semibold tracking-tight">Clarity comes first.</p>
        </div>
        <div>
          <p className="mb-2 font-mono text-xs text-on-surface-variant">Heading · 24 / 32 · 600</p>
          <p className="text-2xl font-semibold tracking-tight">A place for every detail.</p>
        </div>
        <div>
          <p className="mb-2 font-mono text-xs text-on-surface-variant">Body · 14 / 20 · 400</p>
          <p className="max-w-sm text-sm text-on-surface-variant">
            Use a clear hierarchy. Let size and weight do the work, and keep supporting text quiet.
          </p>
        </div>
      </div>
      <figcaption className="mt-6 border-t border-outline-subtle pt-4 text-xs text-on-surface-variant">
        Your app supplies the font. Components supply a consistent scale.
      </figcaption>
    </figure>
  );
}

export function ShapeSpecimen() {
  return (
    <figure className="not-prose my-8 text-on-surface">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { name: 'Control', value: 'Full', shape: 'rounded-control' },
          { name: 'Field / item', value: '12px', shape: 'rounded-field' },
          { name: 'Overlay', value: '16px', shape: 'rounded-overlay shadow-md' },
          { name: 'Container', value: '20px', shape: 'rounded-container shadow-sm' },
          { name: 'Dialog', value: '24px', shape: 'rounded-dialog shadow-lg' },
        ].map((item) => (
          <div key={item.name} className="flex flex-col gap-4 rounded-field bg-canvas p-4">
            <div
              aria-hidden="true"
              className={`h-16 border border-outline-variant bg-surface-raised ${item.shape}`}
            />
            <div className="flex flex-wrap justify-between gap-1 text-xs">
              <span className="font-medium">{item.name}</span>
              <span className="text-on-surface-variant">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-4 text-xs text-on-surface-variant">
        One radius family per purpose. Change the token to reshape every matching component.
      </figcaption>
    </figure>
  );
}

export function IconSpecimen() {
  return (
    <figure className="not-prose my-8 rounded-container border border-outline-subtle p-5 text-on-surface">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {[
          { name: 'Add', Icon: AddIcon },
          { name: 'Search', Icon: SearchIcon },
          { name: 'Check', Icon: CheckIcon },
          { name: 'Close', Icon: CloseIcon },
          { name: 'Settings', Icon: SettingsIcon },
          { name: 'Forward', Icon: ArrowForwardIcon },
        ].map(({ name, Icon }) => (
          <div key={name} className="flex flex-col items-center gap-3">
            <Icon className="size-6" />
            <span className="text-xs text-on-surface-variant">{name}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-5 border-t border-outline-subtle pt-3 text-xs text-on-surface-variant">
        Material Symbols Rounded · inline SVG · inherits size and colour
      </figcaption>
    </figure>
  );
}
