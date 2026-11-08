'use client';

import { useEffect, useState, type ReactNode } from 'react';
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
import { ActivityBars } from '@/registry/ds/ui/activity-bars';
import { AreaChart } from '@/registry/ds/ui/area-chart';
import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';
import { Badge, BadgeAnchor } from '@/registry/ds/ui/badge';
import { Banner } from '@/registry/ds/ui/banner';
import { Breadcrumb, Breadcrumbs } from '@/registry/ds/ui/breadcrumbs';
import { CookieConsent } from '@/registry/ds/ui/cookie-consent';
import { FunnelChart } from '@/registry/ds/ui/funnel-chart';
import { NotFound } from '@/registry/ds/ui/not-found';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import { Card, CardContent, CardFooter, CardHeader } from '@/registry/ds/ui/card';
import { ChartLegend, ChartTooltip, type ChartSeries } from '@/registry/ds/ui/chart';
import { ChartCard } from '@/registry/ds/ui/chart-card';
import { Checkbox } from '@/registry/ds/ui/checkbox';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ContentState } from '@/registry/ds/ui/content-state';
import { CopyButton } from '@/registry/ds/ui/copy-button';
import { DataTable, type DataTableColumn } from '@/registry/ds/ui/data-table';
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';
import { OrDivider } from '@/registry/ds/ui/divider';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
} from '@/registry/ds/ui/dynamic-island';
import { EmptyState } from '@/registry/ds/ui/empty-state';
import { Fab } from '@/registry/ds/ui/fab';
import { FileDropzone } from '@/registry/ds/ui/file-dropzone';
import { FileList, type FileListEntry } from '@/registry/ds/ui/file-list';
import { FileUpload, type FileUploadItem } from '@/registry/ds/ui/file-upload';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Kbd, KbdCombo } from '@/registry/ds/ui/kbd';
import { LineChart } from '@/registry/ds/ui/line-chart';
import { Link } from '@/registry/ds/ui/link';
import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';
import { NumberField } from '@/registry/ds/ui/number-field';
import { Pagination } from '@/registry/ds/ui/pagination';
import { PasswordField } from '@/registry/ds/ui/password-field';
import { CircularProgress, LinearProgress } from '@/registry/ds/ui/progress';
import { Radio, RadioGroup } from '@/registry/ds/ui/radio-group';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';
import { SearchField } from '@/registry/ds/ui/search-field';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import { Select } from '@/registry/ds/ui/select';
import { Skeleton } from '@/registry/ds/ui/skeleton';
import { Slider } from '@/registry/ds/ui/slider';
import { ReorderableList } from '@/registry/ds/ui/reorderable-list';
import { Sparkline } from '@/registry/ds/ui/sparkline';
import { Spinner } from '@/registry/ds/ui/spinner';
import { StatusTag } from '@/registry/ds/ui/status-tag';
import { Switch } from '@/registry/ds/ui/switch';
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@/registry/ds/ui/table';
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

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface TrafficDay {
  day: number;
  direct: number;
  search: number;
  social: number;
  bounced: number;
}

const traffic: TrafficDay[] = Array.from({ length: 14 }, (_, index) => {
  const wave = 1 + 0.32 * Math.sin(index * 0.85 + 1) + 0.12 * Math.cos(index * 2.1);
  return {
    day: index + 1,
    direct: Math.round(52 * wave),
    search: Math.round(36 * (wave * 0.85 + 0.15)),
    social: Math.round(21 * (1.25 - wave * 0.35)),
    bounced: Math.round(9 * (1.4 - wave * 0.4)),
  };
});

const trafficSeries: ChartSeries<TrafficDay>[] = [
  { id: 'direct', label: 'Direct', value: 'direct' },
  { id: 'search', label: 'Search', value: 'search' },
  { id: 'social', label: 'Social', value: 'social' },
  { id: 'bounced', label: 'Bounced', value: 'bounced', isBelowBaseline: true },
];

const visitsByMonth = [
  { month: 'Jan', thisYear: 98, lastYear: 82 },
  { month: 'Feb', thisYear: 101, lastYear: 85 },
  { month: 'Mar', thisYear: 114, lastYear: 99 },
  { month: 'Apr', thisYear: 110, lastYear: 102 },
  { month: 'May', thisYear: 122, lastYear: 109 },
  { month: 'Jun', thisYear: 127, lastYear: 110 },
  { month: 'Jul', thisYear: 140, lastYear: 118 },
  { month: 'Aug', thisYear: 131, lastYear: 120 },
  { month: 'Sep', thisYear: 142, lastYear: 122 },
];

const uploads = [182, 236, 214, 298, 341, 276, 312].map((count, index) => ({
  day: weekdays[index],
  uploads: count,
}));

const downloads = [1240, 1612, 1498, 1877, 2104, 1320, 1186].map((count, index) => ({
  day: weekdays[index],
  downloads: count,
}));

interface Folder {
  id: string;
  name: string;
  files: number;
  status: string;
}

const folders: Folder[] = [
  { id: 'photos', name: 'Photos', files: 2481, status: 'completed' },
  { id: 'documents', name: 'Documents', files: 312, status: 'processing' },
  { id: 'music', name: 'Music', files: 1045, status: 'paused' },
];

const folderColumns: DataTableColumn<Folder>[] = [
  { id: 'name', header: 'Folder', isRowHeader: true, allowsSorting: true },
  { id: 'files', header: 'Files', type: 'number', allowsSorting: true },
  { id: 'status', header: 'Sync', type: 'status' },
];

const pickedFiles: (FileListEntry & FileUploadItem)[] = [
  {
    id: 'beach',
    file: { name: 'beach-at-sunrise.jpg', size: 3_200_000, type: 'image/jpeg' },
    status: 'complete',
  },
  {
    id: 'interview',
    file: { name: 'team-interview.mp4', size: 48_600_000, type: 'video/mp4' },
    status: 'uploading',
    progress: 0.64,
  },
];

function useSettledValue(from: number, to: number, delay = 600) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    const timer = setTimeout(() => setValue(to), delay);
    return () => clearTimeout(timer);
  }, [to, delay]);
  return value;
}

function RollingPreview() {
  const value = useSettledValue(1279, 1289);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-on-surface-variant">Downloads this week</span>
      <RollingNumber
        value={value}
        className="text-5xl font-semibold tracking-tight text-on-surface"
      />
    </div>
  );
}

function IslandPreview() {
  const hours = traffic.slice(0, 12);
  const total = hours.reduce((sum, hour) => sum + hour.direct + hour.search + hour.social, 0);
  return (
    <div className="w-80">
      <DynamicIsland title="Visits today" defaultExpanded>
        <DynamicIslandCompact
          leading={<ActivityBars count={3} className="text-success" />}
          trailing={<RollingNumber value={total} />}
        />
        <DynamicIslandExpanded className="w-72 gap-2.5 px-4 pt-3.5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant">Visits today</span>
              <RollingNumber value={total} className="text-xl font-semibold tracking-tight" />
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <ActivityBars count={3} size="sm" />
              Live
            </span>
          </div>
          <BarChart
            aria-label="Visits per hour today"
            data={hours}
            category="day"
            series={trafficSeries.slice(0, 3)}
            layout="stacked"
            height={64}
            barGap={4}
            valueAxis={{ isVisible: false }}
            categoryAxis={{ isVisible: false }}
            showGrid={false}
            legend="none"
            tooltip="none"
            className="[--chart-surface:var(--surface-container-lowest)]"
          />
        </DynamicIslandExpanded>
      </DynamicIsland>
    </div>
  );
}

export const galleryPreviews: Record<string, () => ReactNode> = {
  breadcrumbs: () => (
    <Breadcrumbs>
      <Breadcrumb href="/">Home</Breadcrumb>
      <Breadcrumb href="/docs">Projects</Breadcrumb>
      <Breadcrumb>Overview</Breadcrumb>
    </Breadcrumbs>
  ),
  'cookie-consent': () => (
    <CookieConsent
      title="Your privacy, your choice."
      description="Choose which cookies work for you."
      onConfirm={() => {}}
      layout="compact"
      className="w-72"
    />
  ),
  'not-found': () => <NotFound size="sm" className="py-4" />,
  lightbox: () => (
    <div className="w-64 overflow-clip rounded-overlay border border-outline-subtle bg-surface-overlay p-2 shadow-sm">
      <div
        aria-hidden
        className="h-32 w-full rounded-item bg-cover bg-center"
        style={{ backgroundImage: 'url(/samples/lagoon.jpg)' }}
      />
      <div className="flex items-center justify-between gap-3 px-1 pt-3 pb-1">
        <span className="text-xs font-medium">A closer look</span>
        <span className="text-xs text-on-surface-variant">1 / 4</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {['lagoon', 'dusk', 'moss', 'dune'].map((name) => (
          <div
            key={name}
            aria-hidden
            className="h-8 w-full rounded-sm bg-cover bg-center"
            style={{ backgroundImage: `url(/samples/${name}.jpg)` }}
          />
        ))}
      </div>
    </div>
  ),
  'funnel-chart': () => (
    <div className="w-full px-2">
      <FunnelChart
        aria-label="Activation funnel"
        className="[&_[data-slot=funnel-flow]]:h-24! [&_ol_p:nth-child(n+3)]:hidden"

        stages={[
          { id: 'visits', label: 'Visits', value: 12400 },
          { id: 'signed-in', label: 'Signed in', value: 8680 },
          { id: 'active', label: 'Active', value: 4340 },
        ]}
      />
    </div>
  ),
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
  'number-field': () => (
    <div className="flex items-end gap-5">
      <NumberField label="Quantity" defaultValue={2} minValue={0} className="w-32" />
      <NumberField label="Guests" layout="compact" defaultValue={4} minValue={1} />
    </div>
  ),
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
  'reorderable-list': () => (
    <ReorderableList
      aria-label="Shortcut order"
      className="w-72"
      defaultValue={[
        { id: 'overview', title: 'Overview', icon: GridViewIcon },
        { id: 'inbox', title: 'Inbox', icon: InboxIcon },
        { id: 'saved', title: 'Saved', icon: BookmarkIcon },
      ]}
      getKey={(item) => item.id}
      getTextValue={(item) => item.title}
    >
      {(item) => (
        <>
          <item.icon className="size-5 text-on-surface-variant" />
          <span className="font-medium">{item.title}</span>
        </>
      )}
    </ReorderableList>
  ),
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
      <CardHeader title="A shared space" description="Everything for your next project." />
      <CardContent className="text-on-surface-variant">
        <AvatarGroup aria-label="Project team" size="sm">
          <Avatar name="Alex Kim" />
          <Avatar name="Sam Rivera" />
          <Avatar name="Mia Chen" />
        </AvatarGroup>
      </CardContent>
      <CardFooter>
        <Button size="sm">Open workspace</Button>
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
  'status-tag': () => (
    <div className="flex w-64 flex-wrap justify-center gap-2">
      <StatusTag status="live" />
      <StatusTag status="inReview" />
      <StatusTag status="scheduled" />
      <StatusTag status="processing" />
      <StatusTag status="rejected" />
    </div>
  ),
  'rolling-number': () => <RollingPreview />,
  table: () => (
    <div className="w-72 rounded-container border border-outline-subtle bg-surface-raised p-1.5 shadow-xs">
      <Table aria-label="Folders" density="sm">
        <TableHeader>
          <Column isRowHeader>Folder</Column>
          <Column align="end">Files</Column>
          <Column>Sync</Column>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => (
            <Row key={folder.id} id={folder.id}>
              <Cell className="font-medium">{folder.name}</Cell>
              <Cell align="end" className="tabular-digits">
                {folder.files.toLocaleString('en')}
              </Cell>
              <Cell>
                <StatusTag status={folder.status} size="sm" />
              </Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
  'data-table': () => (
    <DataTable
      aria-label="Storage"
      className="w-80"
      data={folders}
      columns={folderColumns}
      getRowId={(folder) => folder.id}
      selectionMode="multiple"
      showSearch={false}
      showCount={false}
      paging={false}
      density="sm"
    />
  ),
  pagination: () => (
    <div className="w-80">
      <Pagination aria-label="Gallery pages" size="sm" defaultPage={4} pageCount={9} />
    </div>
  ),
  'file-dropzone': () => <FileDropzone className="w-72" acceptedFileTypes={['image/*']} />,
  'file-list': () => <FileList aria-label="Uploads" className="w-72" items={pickedFiles} />,
  'file-upload': () => (
    <FileUpload
      className="w-72"
      size="sm"
      label="Attachments"
      allowsMultiple
      defaultValue={pickedFiles.slice(1)}
    />
  ),
  'activity-bars': () => (
    <div className="flex w-64 items-center gap-3 rounded-container border border-outline-subtle bg-surface-raised p-3 shadow-xs">
      <span
        aria-hidden
        className="size-10 shrink-0 rounded-item bg-linear-to-br from-tertiary to-primary"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-surface">Morning Light</p>
        <p className="truncate text-xs text-on-surface-variant">Harbor Lines</p>
      </div>
      <ActivityBars className="text-primary" />
    </div>
  ),
  'dynamic-island': () => <IslandPreview />,
  chart: () => (
    <div className="flex flex-col items-center gap-3">
      <ChartTooltip
        title="Thursday"
        total="1,212"
        items={[
          { id: 'direct', label: 'Direct', value: '574', color: 'chart-1' },
          { id: 'search', label: 'Search', value: '402', color: 'chart-2' },
          { id: 'social', label: 'Social', value: '236', color: 'chart-3' },
        ]}
      />
      <ChartLegend
        items={[
          { id: 'direct', label: 'Direct', color: 'chart-1' },
          { id: 'search', label: 'Search', color: 'chart-2' },
          { id: 'social', label: 'Social', color: 'chart-3' },
          { id: 'last-year', label: 'Last year', color: 'neutral', marker: 'dashed' },
        ]}
        className="justify-center"
      />
    </div>
  ),
  'bar-chart': () => (
    <BarChart
      aria-label="Visits by source, last 14 days"
      className="w-72"
      data={traffic}
      category="day"
      series={trafficSeries}
      layout="stacked"
      height={136}
      formatCategory={(day) => `Oct ${day}`}
      valueAxis={{ isVisible: false }}
      categoryAxis={{ ticks: 'ends' }}
      showGrid={false}
      legend="none"
      tooltip="none"
    />
  ),
  'line-chart': () => (
    <LineChart
      aria-label="Visits per month, this year against last year"
      className="w-72"
      data={visitsByMonth}
      category="month"
      series={[
        { id: 'this-year', label: 'This year', value: 'thisYear', color: 'primary' },
        {
          id: 'last-year',
          label: 'Last year',
          value: 'lastYear',
          color: 'neutral',
          lineStyle: 'dashed',
        },
      ]}
      height={128}
      valueAxis={{ isVisible: false }}
      categoryAxis={{ ticks: 'ends' }}
      legend="none"
      tooltip="none"
    />
  ),
  'area-chart': () => (
    <AreaChart
      aria-label="Photo uploads this week"
      className="w-72"
      data={uploads}
      category="day"
      series={[{ id: 'uploads', label: 'Uploads', value: 'uploads' }]}
      height={128}
      valueAxis={{ isVisible: false }}
      categoryAxis={{ ticks: 'ends' }}
      tooltip="none"
    />
  ),
  sparkline: () => (
    <div className="flex w-64 flex-col gap-2">
      {[
        { label: 'Visits', value: '48.2K', data: [31, 34, 33, 38, 41, 39, 44, 47, 46, 52, 55, 58] },
        {
          label: 'Bounce rate',
          value: '38%',
          data: [46, 45, 47, 44, 43, 44, 41, 42, 40, 39, 39, 38],
        },
      ].map((tile) => (
        <div
          key={tile.label}
          className="flex items-end justify-between gap-3 rounded-container border border-outline-subtle bg-surface-raised px-4 py-3 shadow-xs"
        >
          <div className="flex min-w-0 flex-col">
            <span className="text-xs text-on-surface-variant">{tile.label}</span>
            <span className="text-lg font-semibold tracking-tight text-on-surface">
              {tile.value}
            </span>
          </div>
          <Sparkline
            aria-label={`${tile.label}, last 12 weeks`}
            data={tile.data}
            variant="area"
            className="h-9 w-24"
          />
        </div>
      ))}
    </div>
  ),
  'chart-card': () => (
    <ChartCard
      className="w-72 gap-3"
      title="Downloads"
      caption="This week"
      value={10837}
      delta={{ value: 0.124 }}
      readout="headline"
    >
      <BarChart
        data={downloads}
        category="day"
        series={[{ id: 'downloads', label: 'Downloads', value: 'downloads' }]}
        showTrack
        radius="full"
        maxBarSize={18}
        height={88}
        valueAxis={{ isVisible: false }}
        categoryAxis={{ isVisible: false }}
      />
    </ChartCard>
  ),
};
