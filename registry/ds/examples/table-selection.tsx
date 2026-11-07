'use client';

import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { Avatar } from '@/registry/ds/ui/avatar';
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@/registry/ds/ui/table';
import { Tag } from '@/registry/ds/ui/tag';

const members = [
  { id: 'amara', name: 'Amara Okafor', role: 'Owner', projects: 12 },
  { id: 'kenji', name: 'Kenji Watanabe', role: 'Editor', projects: 8 },
  { id: 'sofia', name: 'Sofia Rossi', role: 'Editor', projects: 5 },
  { id: 'mateo', name: 'Mateo García', role: 'Viewer', projects: 2 },
];

export default function TableSelection() {
  const [selected, setSelected] = useState<Selection>(new Set(['kenji']));
  const count = selected === 'all' ? members.length : selected.size;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      <div className="rounded-container border border-outline-subtle bg-surface-raised p-2">
        <Table
          aria-label="Team"
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
        >
          <TableHeader>
            <Column id="name" isRowHeader>
              Member
            </Column>
            <Column id="role">Role</Column>
            <Column id="projects" align="end">
              Projects
            </Column>
          </TableHeader>
          <TableBody items={members}>
            {(member) => (
              <Row id={member.id}>
                <Cell textValue={member.name}>
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="sm" aria-hidden />
                    <span className="font-medium">{member.name}</span>
                  </div>
                </Cell>
                <Cell>
                  <Tag>{member.role}</Tag>
                </Cell>
                <Cell align="end" className="tabular-digits">
                  {member.projects}
                </Cell>
              </Row>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="px-2 text-xs text-on-surface-variant" aria-live="polite">
        {count} of {members.length} selected
      </p>
    </div>
  );
}
