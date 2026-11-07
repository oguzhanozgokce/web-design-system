'use client';

import { useState } from 'react';
import { CheckCircleIcon } from '@/registry/ds/lib/icons';
import { Card, CardContent, CardHeader } from '@/registry/ds/ui/card';
import { Checkbox } from '@/registry/ds/ui/checkbox';
import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/registry/ds/ui/disclosure';
import { LinearProgress } from '@/registry/ds/ui/progress';

const tasks = [
  {
    id: 'workspace',
    title: 'Create your workspace',
    description: 'Give your team a place to work together.',
  },
  {
    id: 'invite',
    title: 'Invite a teammate',
    description: 'Good work starts with the right people.',
  },
  {
    id: 'project',
    title: 'Publish your first project',
    description: 'Share something you are proud of.',
  },
];

export default function CardOnboarding() {
  const [completed, setCompleted] = useState(['workspace']);
  const done = completed.length === tasks.length;
  return (
    <Card className="w-full max-w-md" padding="lg">
      <CardHeader
        title={done ? 'You are all set' : 'Make yourself at home'}
        description={
          done
            ? 'Your workspace is ready for what comes next.'
            : 'A few small steps to get your workspace ready.'
        }
        leading={done ? <CheckCircleIcon className="size-6 text-success" /> : undefined}
      />
      <CardContent className="mt-5 space-y-4">
        <LinearProgress
          label="Getting started"
          value={completed.length}
          maxValue={tasks.length}
          valueLabel={`${completed.length} of ${tasks.length} complete`}
          showValueLabel
          tone={done ? 'success' : 'primary'}
        />
        <Disclosure defaultExpanded variant="plain">
          <DisclosureTrigger>Setup checklist</DisclosureTrigger>
          <DisclosurePanel>
            <div className="space-y-5 pt-2">
              {tasks.map((task) => (
                <Checkbox
                  key={task.id}
                  isSelected={completed.includes(task.id)}
                  onChange={(selected) =>
                    setCompleted((current) =>
                      selected ? [...current, task.id] : current.filter((id) => id !== task.id),
                    )
                  }
                  description={task.description}
                >
                  {task.title}
                </Checkbox>
              ))}
            </div>
          </DisclosurePanel>
        </Disclosure>
        <p className="text-xs text-on-surface-variant" role="status">
          {done
            ? 'All steps complete. You can revisit them anytime.'
            : 'Demo: check a step to see the progress update.'}
        </p>
      </CardContent>
    </Card>
  );
}
