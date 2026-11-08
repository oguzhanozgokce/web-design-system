import { GroupIcon } from '@/registry/ds/lib/icons';
import { Avatar } from '@/registry/ds/ui/avatar';

const cases = [
  {
    caption: 'Photo',
    avatar: (
      <Avatar
        name="Travel album"
        shape="rounded"
        src="https://picsum.photos/seed/travel-album/112"
      />
    ),
  },
  {
    caption: 'Photo failed',
    avatar: <Avatar name="Kenji Watanabe" src="data:image/png;base64,AA==" />,
  },
  { caption: 'No photo', avatar: <Avatar name="Sofia Rossi" /> },
  { caption: 'No name', avatar: <Avatar alt="Unassigned" /> },
  { caption: 'Custom icon', avatar: <Avatar alt="Design team" fallbackIcon={<GroupIcon />} /> },
];

export default function AvatarFallbacks() {
  return (
    <ul className="flex flex-wrap justify-center gap-6">
      {cases.map(({ caption, avatar }) => (
        <li key={caption} className="flex w-20 flex-col items-center gap-2 text-center">
          {avatar}
          <span className="text-xs text-on-surface-variant">{caption}</span>
        </li>
      ))}
    </ul>
  );
}
