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
    title: 'Blank project',
    description: 'Start with nothing.',
    detail: 'Best when you are importing from another tool.',
    icon: AddCircleIcon,
  },
  {
    value: 'personal',
    title: 'Personal',
    description: 'Tasks, notes and reminders.',
    detail: '3 lists · 12 sample tasks',
    icon: PersonIcon,
  },
  {
    value: 'team',
    title: 'Team',
    description: 'Shared boards and roles.',
    detail: '5 boards · 3 roles',
    icon: GroupIcon,
  },
];

export default function CardSelectable() {
  return (
    <SelectableCardGroup
      label="Start from a template"
      description="You can change everything later."
      orientation="horizontal"
      defaultValue="personal"
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
