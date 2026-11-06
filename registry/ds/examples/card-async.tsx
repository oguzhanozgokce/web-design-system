'use client';

import { useState } from 'react';
import { AddCircleIcon, GroupIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { CardHeader, ClickableCard } from '@/registry/ds/ui/card';

const templates = [
  { id: 'blank', title: 'Blank project', description: 'Start from scratch', icon: AddCircleIcon },
  {
    id: 'personal',
    title: 'Personal',
    description: 'Tasks, notes and reminders',
    icon: PersonIcon,
  },
  { id: 'team', title: 'Team', description: 'Shared boards and roles', icon: GroupIcon },
];

export default function CardAsync() {
  const [created, setCreated] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-3">
        {templates.map((template) => (
          <ClickableCard
            key={template.id}
            variant="elevated"
            onPress={async () => {
              await new Promise((resolve) => setTimeout(resolve, 1500));
              setCreated(template.title);
            }}
          >
            <CardHeader
              leading={<template.icon className="size-6 text-primary" />}
              title={template.title}
              description={template.description}
            />
          </ClickableCard>
        ))}
      </div>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {created ? `Created a project from “${created}”.` : 'Pick a template to create a project.'}
      </p>
    </div>
  );
}
