'use client';

import { Meter } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { DynamicTheme } from '@/registry/ds/ui/dynamic-theme';

const teams = [
  { name: 'Design', members: 12, used: 72, seed: '#1565C0' },
  { name: 'Marketing', members: 8, used: 38, seed: '#5E7D2B' },
  { name: 'Engineering', members: 24, used: 91, seed: '#D84315' },
];

export default function DynamicThemeTenants() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {teams.map((team) => (
        <DynamicTheme
          key={team.name}
          seed={team.seed}
          className="flex flex-col gap-4 rounded-lg bg-surface-container-low p-4 text-on-surface"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-container text-title-md text-on-primary-container"
            >
              {team.name[0]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-title-sm">{team.name}</p>
              <p className="text-body-sm text-on-surface-variant">{team.members} members</p>
            </div>
          </div>
          <Meter
            aria-label={`${team.name} storage used`}
            value={team.used}
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
          <Button variant="tonal" size="sm" aria-label={`Open ${team.name}`} className="self-start">
            Open
          </Button>
        </DynamicTheme>
      ))}
    </div>
  );
}
