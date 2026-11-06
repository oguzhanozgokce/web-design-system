import { readFile, writeFile } from 'node:fs/promises';

const glyphs: Record<string, string> = {
  add: 'add',
  addCircle: 'add_circle',
  archive: 'archive',
  arrowBack: 'arrow_back',
  arrowDownward: 'arrow_downward',
  arrowDropDown: 'arrow_drop_down',
  arrowForward: 'arrow_forward',
  arrowRightAlt: 'arrow_right_alt',
  arrowUpward: 'arrow_upward',
  attachFile: 'attach_file',
  barChart: 'bar_chart',
  block: 'block',
  bookmark: 'bookmark',
  calendar: 'calendar_today',
  calendarMonth: 'calendar_month',
  call: 'call',
  cancel: 'cancel-fill',
  chat: 'chat',
  check: 'check',
  checkCircle: 'check_circle-fill',
  checkIndeterminate: 'check_indeterminate_small',
  checkSmall: 'check_small',
  chevronDown: 'keyboard_arrow_down',
  chevronLeft: 'chevron_left',
  chevronRight: 'chevron_right',
  chevronUp: 'keyboard_arrow_up',
  close: 'close',
  cloudUpload: 'cloud_upload',
  colorize: 'colorize',
  contentPaste: 'content_paste',
  contrast: 'contrast',
  copy: 'content_copy',
  darkMode: 'dark_mode',
  dashboard: 'dashboard',
  dateRange: 'date_range',
  delete: 'delete',
  description: 'description',
  doubleChevronLeft: 'keyboard_double_arrow_left',
  doubleChevronRight: 'keyboard_double_arrow_right',
  download: 'download',
  dragHandle: 'drag_handle',
  dragIndicator: 'drag_indicator',
  edit: 'edit',
  error: 'error-fill',
  event: 'event',
  expandContent: 'expand_content',
  favorite: 'favorite',
  favoriteFilled: 'favorite-fill',
  file: 'draft',
  filter: 'filter_list',
  firstPage: 'first_page',
  flag: 'flag',
  folder: 'folder',
  fullscreen: 'fullscreen',
  fullscreenExit: 'fullscreen_exit',
  gridView: 'grid_view',
  group: 'group',
  help: 'help',
  history: 'history',
  home: 'home',
  hourglass: 'hourglass_empty',
  image: 'image',
  inbox: 'inbox',
  info: 'info-fill',
  keyboardReturn: 'keyboard_return',
  language: 'language',
  lastPage: 'last_page',
  lightMode: 'light_mode',
  link: 'link',
  list: 'list',
  locationOn: 'location_on',
  lock: 'lock',
  lockOpen: 'lock_open',
  logout: 'logout',
  mail: 'mail',
  markEmailUnread: 'mark_email_unread',
  menu: 'menu',
  menuOpen: 'menu_open',
  moreHorizontal: 'more_horiz',
  moreVertical: 'more_vert',
  northEast: 'north_east',
  notifications: 'notifications',
  openInNew: 'open_in_new',
  palette: 'palette',
  pause: 'pause',
  person: 'person',
  playArrow: 'play_arrow',
  refresh: 'refresh',
  remove: 'remove',
  schedule: 'schedule',
  search: 'search',
  send: 'send',
  settings: 'settings',
  share: 'share',
  sort: 'sort',
  star: 'star',
  starFilled: 'star-fill',
  swapVertical: 'swap_vert',
  sync: 'sync',
  tableRows: 'table_rows',
  today: 'today',
  trendingDown: 'trending_down',
  trendingUp: 'trending_up',
  tune: 'tune',
  undo: 'undo',
  unfoldLess: 'unfold_less',
  unfoldMore: 'unfold_more',
  upload: 'upload',
  verified: 'verified',
  viewColumn: 'view_column',
  visibility: 'visibility',
  visibilityOff: 'visibility_off',
  warning: 'warning-fill',
  zoomIn: 'zoom_in',
  zoomOut: 'zoom_out',
};

const root = new URL('../', import.meta.url);

function componentName(key: string) {
  return `${key[0].toUpperCase()}${key.slice(1)}Icon`;
}

const sources = await Promise.all(
  Object.entries(glyphs).map(async ([key, file]) => {
    const svg = await readFile(
      new URL(`node_modules/@material-symbols/svg-400/rounded/${file}.svg`, root),
      'utf8',
    );
    const path = svg.match(/<path d="([^"]+)"/)?.[1];
    if (!path) throw new Error(`No path in ${file}.svg`);
    return { key, name: componentName(key), path };
  }),
);

const body = sources
  .map(
    ({ name, path }) =>
      `export function ${name}(props: IconProps) {\n  return (\n    <svg {...iconDefaults} {...props}>\n      <path d="${path}" />\n    </svg>\n  );\n}`,
  )
  .join('\n\n');

const file = `import type { ComponentType, SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;

export type IconComponent = ComponentType<IconProps>;

const iconDefaults = {
  viewBox: '0 -960 960 960',
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  'aria-hidden': true,
  focusable: false,
} as const;

${body}

export const dsIcons = {
${sources.map(({ key, name }) => `  ${key}: ${name},`).join('\n')}
} satisfies Record<string, IconComponent>;

export type DSIconName = keyof typeof dsIcons;

export type DSIcons = Record<DSIconName, IconComponent>;
`;

await writeFile(new URL('registry/ds/lib/icons.tsx', root), file);
console.log(`icons: ${sources.length} Material Symbols Rounded glyphs`);
