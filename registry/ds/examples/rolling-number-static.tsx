'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

export default function RollingNumberStatic() {
  const [members, setMembers] = useState(96);

  return (
    <div className="flex flex-col items-center gap-4">
      <dl className="grid grid-cols-2 gap-8 text-center">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-on-surface-variant">Rolling</dt>
          <dd className="text-3xl font-semibold text-on-surface">
            <RollingNumber value={members} />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-on-surface-variant">Without rolling</dt>
          <dd className="text-3xl font-semibold text-on-surface">
            <RollingNumber value={members} isAnimated={false} />
          </dd>
        </div>
      </dl>
      <Button variant="soft" size="sm" onPress={() => setMembers((current) => current + 3)}>
        Add 3 team members
      </Button>
    </div>
  );
}
