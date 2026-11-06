'use client';

import { Meter } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { DynamicTheme } from '@/registry/ds/ui/dynamic-theme';

const tenants = [
  { name: 'Harbor Logistics', plan: 'Business', used: 72, seed: '#1565C0' },
  { name: 'Olive & Oak', plan: 'Starter', used: 38, seed: '#5E7D2B' },
  { name: 'Studio Ember', plan: 'Pro', used: 91, seed: '#D84315' },
];

export default function DynamicThemeTenants() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {tenants.map((tenant) => (
        <DynamicTheme
          key={tenant.name}
          seed={tenant.seed}
          className="flex flex-col gap-4 rounded-lg bg-surface-container-low p-4 text-on-surface"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-container text-title-md text-on-primary-container"
            >
              {tenant.name[0]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-title-sm">{tenant.name}</p>
              <p className="text-body-sm text-on-surface-variant">{tenant.plan} plan</p>
            </div>
          </div>
          <Meter
            aria-label={`${tenant.name} storage used`}
            value={tenant.used}
            formatOptions={{ style: 'percent', maximumFractionDigits: 0 }}
            className="flex flex-col gap-1"
          >
            {({ percentage, valueText }) => (
              <>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-body-sm text-on-surface-variant tabular-digits">
                  Storage {valueText}
                </span>
              </>
            )}
          </Meter>
          <Button
            variant="tonal"
            size="sm"
            aria-label={`Open ${tenant.name}`}
            className="self-start"
          >
            Open
          </Button>
        </DynamicTheme>
      ))}
    </div>
  );
}
