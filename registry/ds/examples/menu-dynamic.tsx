'use client';

import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { ArrowDropDownIcon, PersonIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Menu, MenuItem, MenuTrigger } from '@/registry/ds/ui/menu';

interface Member {
  id: string;
  name: string;
  role: string;
}

const members: Member[] = [
  { id: 'ayse', name: 'Ayşe Demir', role: 'Owner' },
  { id: 'mert', name: 'Mert Kaya', role: 'Editor' },
  { id: 'lena', name: 'Lena Fischer', role: 'Editor' },
  { id: 'omar', name: 'Omar Haddad', role: 'Viewer, cannot be assigned' },
];

export default function MenuDynamic() {
  const [assignee, setAssignee] = useState<Selection>(new Set(['mert']));
  const current = members.find((member) => assignee !== 'all' && assignee.has(member.id));

  return (
    <MenuTrigger>
      <Button variant="outline" startIcon={<PersonIcon />} endIcon={<ArrowDropDownIcon />}>
        Assigned to {current?.name}
      </Button>
      <Menu
        items={members}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={assignee}
        onSelectionChange={setAssignee}
        disabledKeys={['omar']}
      >
        {(member) => (
          <MenuItem id={member.id} description={member.role}>
            {member.name}
          </MenuItem>
        )}
      </Menu>
    </MenuTrigger>
  );
}
