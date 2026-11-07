'use client';

import { useEffect, useState } from 'react';
import { ActivityBars } from '@/registry/ds/ui/activity-bars';
import { Avatar } from '@/registry/ds/ui/avatar';

const team = ['Mara Lind', 'Kenji Watanabe', 'Amara Okafor', 'Lucas Moreau'];

export default function ActivityBarsLabelled() {
  const [speaker, setSpeaker] = useState(0);

  useEffect(() => {
    const turn = setInterval(() => setSpeaker((index) => (index + 1) % team.length), 2600);
    return () => clearInterval(turn);
  }, []);

  return (
    <ul aria-label="Call participants" className="flex w-full max-w-xs flex-col gap-1">
      {team.map((name, index) => (
        <li key={name} className="flex items-center gap-3 rounded-item px-2 py-1.5">
          <Avatar name={name} alt="" size="sm" />
          <span className="min-w-0 flex-1 truncate text-sm text-on-surface">{name}</span>
          {index === speaker ? (
            <ActivityBars aria-label="Speaking" size="sm" className="text-success" />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
