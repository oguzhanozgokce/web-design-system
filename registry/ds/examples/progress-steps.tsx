'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { LinearProgress } from '@/registry/ds/ui/progress';

const steps = ['Company details', 'Bank account', 'Tax settings', 'Invite your team'];

export default function ProgressSteps() {
  const [done, setDone] = useState(1);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <LinearProgress
        label={done < steps.length ? `Next: ${steps[done]}` : 'Setup complete'}
        value={done}
        maxValue={steps.length}
        valueLabel={`${done} of ${steps.length} done`}
        showValueLabel
        tone={done === steps.length ? 'success' : 'primary'}
      />
      <div className="flex gap-2">
        <Button
          variant="outlined"
          size="sm"
          isDisabled={done === 0}
          onPress={() => setDone(done - 1)}
        >
          Back
        </Button>
        <Button size="sm" isDisabled={done === steps.length} onPress={() => setDone(done + 1)}>
          Continue
        </Button>
      </div>
    </div>
  );
}
