'use client';

import type { ReactNode } from 'react';
import {
  AddIcon,
  BookmarkIcon,
  CheckIcon,
  CopyIcon,
  DeleteIcon,
  EditIcon,
  FavoriteIcon,
  GridViewIcon,
  InboxIcon,
  ListIcon,
  MailIcon,
  MoreHorizontalIcon,
  NotificationsIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShareIcon,
  StarIcon,
  ViewColumnIcon,
} from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';
import { Badge, BadgeAnchor } from '@/registry/ds/ui/badge';
import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import { Card, CardContent, CardFooter, CardHeader } from '@/registry/ds/ui/card';
import { Checkbox } from '@/registry/ds/ui/checkbox';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ContentState } from '@/registry/ds/ui/content-state';
import { CopyButton } from '@/registry/ds/ui/copy-button';
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';
import { OrDivider } from '@/registry/ds/ui/divider';
import { EmptyState } from '@/registry/ds/ui/empty-state';
import { Fab } from '@/registry/ds/ui/fab';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Kbd, KbdCombo } from '@/registry/ds/ui/kbd';
import { Link } from '@/registry/ds/ui/link';
import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';
import { NumberField } from '@/registry/ds/ui/number-field';
import { PasswordField } from '@/registry/ds/ui/password-field';
import { CircularProgress, LinearProgress } from '@/registry/ds/ui/progress';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';
import { SearchField } from '@/registry/ds/ui/search-field';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import { Select } from '@/registry/ds/ui/select';
import { Skeleton } from '@/registry/ds/ui/skeleton';
import { Slider } from '@/registry/ds/ui/slider';
import { Spinner } from '@/registry/ds/ui/spinner';
import { Switch } from '@/registry/ds/ui/switch';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';
import { Tag } from '@/registry/ds/ui/tag';
import { TextArea } from '@/registry/ds/ui/text-area';
import { TextField } from '@/registry/ds/ui/text-field';
import { ToggleButton } from '@/registry/ds/ui/toggle-button';

const overlay =
  'rounded-overlay border border-outline-subtle bg-surface-overlay text-on-surface shadow-md';

const dialog = 'rounded-dialog bg-surface-overlay text-on-surface shadow-lg';

function Shortcut({ keys }: { keys: string[] }) {
  return <KbdCombo keys={keys} size="sm" />;
}

export const galleryPreviews: Record<string, () => ReactNode> = {
  button: () => (
    <div className="flex items-center justify-center gap-1.5">
      <Button size="sm">Save</Button>
      <Button size="sm" variant="soft">
        Share
      </Button>
      <Button size="sm" variant="outline">
        Edit
      </Button>
      <Button size="sm" variant="ghost" tone="error">
        Delete
      </Button>
    </div>
  ),
  'button-group': () => (
    <ButtonGroup variant="attached" buttonVariant="outline" size="sm" aria-label="Edit">
      <Button startIcon={<CopyIcon />}>Copy</Button>
      <Button>Cut</Button>
      <Button>Paste</Button>
    </ButtonGroup>
  ),
  'toggle-button': () => (
    <div className="flex gap-2">
      <ToggleButton size="sm" defaultSelected startIcon={<FavoriteIcon />}>
        Like
      </ToggleButton>
      <ToggleButton size="sm" startIcon={<BookmarkIcon />}>
        Save
      </ToggleButton>
    </div>
  ),
  'copy-button': () => (
    <div className="flex items-center gap-2 rounded-control border border-outline-subtle bg-surface-raised py-1 ps-4 pe-1 text-on-surface shadow-xs">
      <code className="font-mono text-sm">npm install</code>
      <CopyButton value="npm install" size="sm" aria-label="Copy command" />
    </div>
  ),
  fab: () => (
    <div className="flex items-end gap-4">
      <Fab aria-label="Edit" icon={<EditIcon />} tone="neutral" />
      <Fab aria-label="Create" icon={<AddIcon />} size="lg" />
    </div>
  ),
  'icon-button': () => (
    <div className="flex items-center gap-1">
      <IconButton aria-label="Favourite" icon={<FavoriteIcon />} />
      <IconButton aria-label="Share" icon={<ShareIcon />} variant="soft" />
      <IconButton aria-label="Settings" icon={<SettingsIcon />} variant="outline" />
      <IconButton aria-label="More" icon={<MoreHorizontalIcon />} variant="solid" />
    </div>
  ),
  link: () => (
    <div className="flex flex-col items-center gap-2 text-sm">
      <Link href="#">Documentation</Link>
      <Link href="#" variant="standalone">
        Learn more
      </Link>
    </div>
  ),
  field: () => (
    <TextField
      className="w-60"
      label="Username"
      defaultValue="al"
      isInvalid
      errorMessage="Use at least 3 characters."
    />
  ),
  'text-field': () => (
    <TextField
      className="w-60"
      label="Email"
      placeholder="you@example.com"
      startAdornment={<MailIcon />}
    />
  ),
  'text-area': () => <TextArea className="w-64" label="Message" placeholder="Write something…" />,
  'search-field': () => (
    <SearchField
      className="w-64"
      aria-label="Search"
      placeholder="Search"
      variant="soft"
      shortcut="/"
    />
  ),
  'password-field': () => (
    <PasswordField className="w-60" label="Password" placeholder="Enter your password" />
  ),
  'number-field': () => <NumberField label="Quantity" defaultValue={2} minValue={0} />,
  checkbox: () => (
    <div className="flex flex-col gap-1">
      <Checkbox defaultSelected>Remember me</Checkbox>
      <Checkbox isIndeterminate>Select all</Checkbox>
      <Checkbox>Subscribe</Checkbox>
    </div>
  ),
  'radio-group': () => (
    <RadioGroup aria-label="Size" defaultValue="medium">
      <Radio value="small">Small</Radio>
      <Radio value="medium">Medium</Radio>
      <Radio value="large">Large</Radio>
    </RadioGroup>
  ),
  switch: () => (
    <div className="flex flex-col gap-3">
      <Switch defaultSelected>Wi-Fi</Switch>
      <Switch>Bluetooth</Switch>
    </div>
  ),
  slider: () => <Slider className="w-60" label="Volume" defaultValue={60} />,
  'list-box': () => (
    <ListBox
      aria-label="Folders"
      selectionMode="single"
      defaultSelectedKeys={['inbox']}
      variant="outline"
      className="w-52"
    >
      <ListBoxItem id="inbox" startIcon={<InboxIcon />}>
        Inbox
      </ListBoxItem>
      <ListBoxItem id="starred" startIcon={<StarIcon />}>
        Starred
      </ListBoxItem>
      <ListBoxItem id="sent" startIcon={<SendIcon />}>
        Sent
      </ListBoxItem>
    </ListBox>
  ),
  select: () => (
    <Select className="w-56" label="Size" defaultValue="medium">
      <ListBoxItem id="small">Small</ListBoxItem>
      <ListBoxItem id="medium">Medium</ListBoxItem>
      <ListBoxItem id="large">Large</ListBoxItem>
    </Select>
  ),
  'combo-box': () => (
    <ComboBox className="w-56" label="Country" placeholder="Search countries">
      <ListBoxItem id="br">Brazil</ListBoxItem>
      <ListBoxItem id="jp">Japan</ListBoxItem>
      <ListBoxItem id="ke">Kenya</ListBoxItem>
    </ComboBox>
  ),
  tabs: () => (
    <Tabs className="w-72 gap-3">
      <TabList aria-label="Media">
        <Tab id="photos">Photos</Tab>
        <Tab id="videos">Videos</Tab>
        <Tab id="music">Music</Tab>
      </TabList>
      {[
        ['photos', '128 photos'],
        ['videos', '12 videos'],
        ['music', '40 songs'],
      ].map(([id, label]) => (
        <TabPanel key={id} id={id} className="px-3 text-sm text-on-surface-variant">
          {label}
        </TabPanel>
      ))}
    </Tabs>
  ),
  'segmented-control': () => (
    <SegmentedControl aria-label="View" defaultSelectedKeys={['grid']} size="sm">
      <SegmentedControlItem id="list" icon={<ListIcon />}>
        List
      </SegmentedControlItem>
      <SegmentedControlItem id="grid" icon={<GridViewIcon />}>
        Grid
      </SegmentedControlItem>
      <SegmentedControlItem id="board" icon={<ViewColumnIcon />}>
        Board
      </SegmentedControlItem>
    </SegmentedControl>
  ),
  card: () => (
    <Card variant="outline" className="w-64">
      <CardHeader title="Card title" description="Supporting text" />
      <CardContent className="text-on-surface-variant">
        Cards group related content and actions.
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
  divider: () => (
    <div className="flex w-56 flex-col gap-3">
      <Button size="sm" variant="outline" fullWidth>
        Continue with a passkey
      </Button>
      <OrDivider />
      <Button size="sm" fullWidth>
        Continue with email
      </Button>
    </div>
  ),
  disclosure: () => (
    <Accordion className="w-64" defaultExpandedKeys={['what']}>
      <Disclosure id="what">
        <DisclosureTrigger>What is it?</DisclosureTrigger>
        <DisclosurePanel>A section that opens and closes.</DisclosurePanel>
      </Disclosure>
      <Disclosure id="how">
        <DisclosureTrigger>How does it work?</DisclosureTrigger>
        <DisclosurePanel>Press the header.</DisclosurePanel>
      </Disclosure>
    </Accordion>
  ),
  dialog: () => (
    <div className={cn(dialog, 'flex w-64 flex-col gap-2 p-5')}>
      <p className="text-base font-semibold">Edit profile</p>
      <p className="text-sm text-on-surface-variant">Changes apply everywhere you sign in.</p>
      <div className="mt-2 flex justify-end gap-2">
        <Button size="sm" variant="ghost">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </div>
    </div>
  ),
  'alert-dialog': () => (
    <div className={cn(dialog, 'flex w-64 flex-col items-center gap-2 p-5 text-center')}>
      <span className="grid size-10 place-items-center rounded-full bg-error-soft text-on-error-soft">
        <DeleteIcon className="text-xl" />
      </span>
      <p className="mt-1 text-base font-semibold">Delete file?</p>
      <p className="text-sm text-on-surface-variant">This cannot be undone.</p>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="soft">
          Cancel
        </Button>
        <Button size="sm" tone="error">
          Delete
        </Button>
      </div>
    </div>
  ),
  sheet: () => (
    <div className="flex h-40 w-64 flex-col justify-end overflow-clip rounded-overlay bg-backdrop">
      <div className="flex flex-col gap-2 rounded-t-dialog bg-surface-overlay px-4 pt-2 pb-4 text-on-surface shadow-lg">
        <span className="mx-auto h-1 w-8 rounded-full bg-outline-variant" />
        <p className="text-sm font-semibold">Share</p>
        <div className="flex gap-2">
          {[MailIcon, CopyIcon, ShareIcon].map((Icon, index) => (
            <span
              key={index}
              className="grid size-10 place-items-center rounded-full bg-neutral-soft text-on-surface"
            >
              <Icon />
            </span>
          ))}
        </div>
      </div>
    </div>
  ),
  popover: () => (
    <div className="flex flex-col items-center gap-2">
      <Button size="sm" variant="soft">
        Details
      </Button>
      <div className={cn(overlay, 'w-52 px-4 py-3 text-sm text-on-surface-variant')}>
        <p className="font-semibold text-on-surface">Shortcut</p>
        Rich content anchored to a trigger.
      </div>
    </div>
  ),
  tooltip: () => (
    <div className="flex flex-col items-center gap-1.5">
      <span className="rounded-item bg-inverse-surface px-2.5 py-1.5 text-xs text-inverse-on-surface shadow-md">
        Share
      </span>
      <IconButton aria-label="Share" icon={<ShareIcon />} variant="soft" />
    </div>
  ),
  menu: () => (
    <div className={cn(overlay, 'flex w-52 flex-col p-1 text-sm')}>
      {[
        { label: 'Copy', keys: ['mod', 'C'] },
        { label: 'Cut', keys: ['mod', 'X'] },
        { label: 'Paste', keys: ['mod', 'V'] },
      ].map((item, index) => (
        <span
          key={item.label}
          className={cn(
            'flex min-h-9 items-center justify-between gap-6 rounded-item px-3',
            index === 0 && 'bg-neutral-soft',
          )}
        >
          {item.label}
          <Shortcut keys={item.keys} />
        </span>
      ))}
    </div>
  ),
  toast: () => (
    <div className="flex w-64 items-center justify-between gap-3 rounded-container border border-outline-subtle bg-surface-overlay py-2.5 ps-4 pe-2.5 text-sm text-on-surface shadow-md">
      <span className="flex items-center gap-2.5">
        <span className="grid size-5 place-items-center rounded-full bg-success-solid text-on-success-solid">
          <CheckIcon className="text-sm" />
        </span>
        Message sent
      </span>
      <Button size="sm" variant="soft">
        Undo
      </Button>
    </div>
  ),
  badge: () => (
    <div className="flex items-center gap-6 text-2xl text-on-surface-variant">
      <BadgeAnchor badge={<Badge count={3} label="3 notifications" />}>
        <NotificationsIcon />
      </BadgeAnchor>
      <BadgeAnchor badge={<Badge label="New mail" />}>
        <MailIcon />
      </BadgeAnchor>
      <Badge count={120} label="120 messages" />
    </div>
  ),
  chip: () => (
    <ChipGroup aria-label="Filters" selectionMode="multiple" defaultSelectedKeys={['photos']}>
      <Chip id="photos">Photos</Chip>
      <Chip id="videos">Videos</Chip>
      <Chip id="music">Music</Chip>
    </ChipGroup>
  ),
  banner: () => (
    <Banner
      className="w-72"
      tone="info"
      title="Update available"
      description="A new version is ready to install."
    />
  ),
  'empty-state': () => (
    <EmptyState
      size="sm"
      icon={<SearchIcon />}
      title="No results"
      description="Try a different search."
    />
  ),
  'content-state': () => (
    <ContentState status="error" size="sm" onRetry={() => {}} className="w-64" />
  ),
  progress: () => (
    <div className="flex w-60 items-center gap-5">
      <LinearProgress aria-label="Upload" value={64} className="flex-1" />
      <CircularProgress aria-label="Download" value={72} size="sm" />
    </div>
  ),
  spinner: () => (
    <div className="flex items-center gap-5 text-on-surface-variant">
      <Spinner size="sm" />
      <Spinner size="lg" tone="primary" />
      <Spinner size="xl" />
    </div>
  ),
  skeleton: () => (
    <div className="flex w-60 items-center gap-3">
      <Skeleton shape="circle" className="size-10" />
      <div className="flex-1">
        <Skeleton shape="text" className="w-3/5 text-sm" />
        <Skeleton shape="text" className="w-4/5 text-xs" />
      </div>
    </div>
  ),
  avatar: () => (
    <AvatarGroup aria-label="Team" max={4} size="md">
      {['Alex Kim', 'Sam Rivera', 'Mia Chen', 'Leo Okafor', 'Nora Ali', 'Ivan Petrov'].map(
        (name) => (
          <Avatar key={name} name={name} />
        ),
      )}
    </AvatarGroup>
  ),
  tag: () => (
    <div className="flex flex-wrap justify-center gap-2">
      <Tag tone="success" dot>
        Active
      </Tag>
      <Tag tone="warning" dot>
        Pending
      </Tag>
      <Tag tone="primary" variant="solid">
        New
      </Tag>
      <Tag variant="outline">Archived</Tag>
    </div>
  ),
  kbd: () => (
    <div className="flex items-center gap-4 text-sm text-on-surface-variant">
      <KbdCombo keys={['mod', 'K']} />
      <Kbd>Esc</Kbd>
      <KbdCombo keys={['shift', 'Enter']} />
    </div>
  ),
};
