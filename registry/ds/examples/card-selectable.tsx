import { AddCircleIcon, GroupIcon, PersonIcon } from '@/registry/ds/lib/icons';
import {
  CardContent,
  CardHeader,
  SelectableCard,
  SelectableCardGroup,
} from '@/registry/ds/ui/card';

const templates = [
  {
    value: 'blank',
    title: 'Blank ledger',
    description: 'Start with no accounts.',
    detail: 'Best when you are importing from another tool.',
    icon: AddCircleIcon,
  },
  {
    value: 'freelancer',
    title: 'Freelancer',
    description: 'Invoices, expenses and a tax set-aside.',
    detail: '14 accounts · 2 reports',
    icon: PersonIcon,
  },
  {
    value: 'agency',
    title: 'Agency',
    description: 'Clients, retainers and payroll.',
    detail: '32 accounts · 6 reports',
    icon: GroupIcon,
  },
];

export default function CardSelectable() {
  return (
    <SelectableCardGroup
      label="Start from a template"
      description="You can add or remove accounts later."
      orientation="horizontal"
      defaultValue="freelancer"
      className="w-full"
    >
      {templates.map((template) => (
        <SelectableCard key={template.value} value={template.value}>
          <CardHeader
            leading={<template.icon className="size-6" />}
            title={template.title}
            description={template.description}
          />
          <CardContent className="text-body-sm">{template.detail}</CardContent>
        </SelectableCard>
      ))}
    </SelectableCardGroup>
  );
}
