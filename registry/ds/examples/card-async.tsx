'use client';

import { useState } from 'react';
import { AddCircleIcon, GroupIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { CardHeader, ClickableCard } from '@/registry/ds/ui/card';

const templates = [
  {
    id: 'blank',
    title: 'Blank ledger',
    description: 'No accounts, no categories',
    icon: AddCircleIcon,
  },
  {
    id: 'freelancer',
    title: 'Freelancer',
    description: 'Invoices, expenses and tax set-aside',
    icon: PersonIcon,
  },
  { id: 'agency', title: 'Agency', description: 'Clients, retainers and payroll', icon: GroupIcon },
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
        {created ? `Created a ledger from “${created}”.` : 'Pick a template to create a ledger.'}
      </p>
    </div>
  );
}
