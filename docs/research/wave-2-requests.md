# Wave 2 requests: research

Researched on 2026-11-06 for four references the owner wants in the library. For each one this file
records where the source lives and under which license, what it does, what it depends on, a
proposed API in this library's conventions, and whether code may be copied or only ideas used.
Read `README.md` and `libraries.json` in this folder first; this file builds on their verdicts.

Method: `gh api` for licences, file trees, commit history and source of public repositories;
`curl` and a page reader for the public pages and the bencho.dev bundle. Nothing was installed or
run. No Pro source was requested: the Earnings chart card was read from its public page only.

## Visual study and build plan (2026-11-07)

Each page was opened in a browser, in dark mode for Bencho, and used: hovering, dragging a file in,
pressing the stepper, scrolling the table sideways. The source of the MIT blocks was read alongside.
What the eye adds to the earlier notes:

- **Stacked bars.** Every segment is its own capsule (2.5px radius, 2px apart), so the stack reads
  as layers, not one bar cut into colours. Hovering rings the whole column (a 1.5px outline 3px
  outside it), every other column mixes 62% toward the card colour, and one tooltip glides beside
  the column on a spring with the date, the total, the two largest series and the escalated count.
  The negative series hangs below a hairline baseline in red. Data changes ease each segment to its
  new height a beat after its left neighbour, and the headline total re-enters digit by digit.
- **Upload dropzone.** A filled box without a dashed edge. A file held over it makes it grow 2% and
  lifts the arrow tile 4px; dropping makes it gulp (in, past, settle) and then hug a single upload
  row: a file icon whose coloured extension label sticks out of the page, the name, "2.4 MB · 4%"
  with the percentage rolling like an odometer, and a thin bar. A refused file shakes the box and
  turns the line red for 1.8s. The tray of fake files is demo material and is not part of a real
  component.
- **Rolling counter.** A slab with 5px padding holding two soft square keys and the number between
  them. Each column rolls forward through its carry (9 → 10 moves the ones on to 0 and the tens on
  to 1, never back through 8…0), columns start 45ms apart from the right, spinning digits blur, the
  window fades at its top and bottom, and the whole control widens as a digit arrives. Holding a key
  repeats, faster after 0.9s and in tens after 1.5s.
- **Data table.** A toolbar with "Total results / 48 customers" on the left and filter selects plus
  a pill search on the right; a tinted header row; a select-all checkbox that goes indeterminate; an
  avatar and name in the first column; an editable status per row (a select showing a dot and the
  label); a status tag; a sortable date and a price shown as a quiet chip; three bordered icon
  actions, the last opening a menu. Selected rows take a tinted background. Pagination below with
  numbered cells that collapse to ellipses and to icon-only arrows when narrow. A Normal/Compact
  switch changes row height and the size of every control in the rows.
- **Earnings chart card.** There is no floating tooltip: hovering a bar swaps the headline label and
  figure for that bar ("March", "$7,511") and darkens the bar. Every bar stands in a full-height
  light track, which keeps the grid quiet and makes small months readable. A Weekly/Monthly/Yearly
  switch sits top right, and the headline counts up to the new total with a delta tag beside it.

Decisions taken for the build, following the earlier recommendations:

1. `DataTable` is built on React Aria `Table` with no TanStack dependency. Sorting, filtering,
   selection and paging are small pure helpers over RAC's controlled state, and a server mode hands
   the same state to the caller.
2. Charts are hand-written SVG and HTML on a shared `lib/chart.ts`. No Recharts or visx.
3. Chart colour: one series uses `primary` (it stays readable on dark cards, where the vivid solid
   fill measures 2.4:1). Several series use eight fixed categorical roles, `chart-1` to `chart-8`,
   in a validated order: it passes every colour-blindness and separation check against our card
   surfaces in both modes. Three light-mode slots sit under 3:1, so every chart carries a legend, a
   tooltip and a table view. `palette="mono"` gives Bencho's tonal ramp of one role instead.
4. Time axes follow the document direction in RTL; a prop pins them left to right.
5. `DynamicIsland` and `ActivityBars` ship in this wave.
6. The quantity request becomes a compact stepper layout of `NumberField`, using its rolling
   digits; a standalone `RollingNumber` serves chart headlines, upload progress and the island.

## Verdicts at a glance

| Reference                     | Where the source is                                   | Licence and tier           | May we copy code?                     |
| ----------------------------- | ----------------------------------------------------- | -------------------------- | ------------------------------------- |
| Bencho Dynamic island         | `cabralorenzo/bencho` `blocks/dynamic-island/`        | MIT, free block            | Yes, with Lorenzo Cabra's MIT notice  |
| Bencho Stacked bars           | `cabralorenzo/bencho` `blocks/stacked-bars/`          | MIT, free block            | Yes, with Lorenzo Cabra's MIT notice  |
| Bencho Upload dropzone        | `cabralorenzo/bencho` `blocks/upload-dropzone/`       | MIT, free block            | Yes, with Lorenzo Cabra's MIT notice  |
| BoardUI Data table            | `BoardUI/boardui` `components/application/data-table/` | MIT, free tier             | Yes, with the BoardUI MIT notice      |
| BoardUI Earnings chart card   | Not public; Pro registry only                         | BoardUI License, Pro, paid | **No.** Ideas only                    |

Licence checks:

- `gh api repos/cabralorenzo/bencho/license` reports `NOASSERTION` ("Other") because a note is
  appended to the MIT text. The file is the standard MIT licence, "Copyright (c) 2026 Lorenzo
  Cabra", plus a note that the Bencho name, the goat mark and the site photographs are not covered.
  All three block folders were added in commit `4c3d59b` on 2026-10-18 ("Bencho free: 40 blocks…")
  and have not changed since. The repo was last pushed on 2026-11-03.
- `gh api repos/BoardUI/boardui/license` reports `MIT`. The repo was last pushed on 2026-10-02.
  The free registry lists `data-table` (and the free `revenue-chart-card` and `orders-chart-card`).
  `registry-pro.json` lists `earnings-chart-card` as Pro, and its public page says "Earnings Chart
  Card is a Pro component".

## The two Bencho links

Both Bencho URLs have `dynamic-island` in the path and a different `?c=`. That is how bencho.dev
records state, not a combined component. Reading its bundle (`/assets/index-DECdEh_q.js`): opening a
block rewrites only the query string (`?c=<block id>&theme=…`) and leaves the path of the page the
visitor landed on. So `/blocks/dynamic-island?c=stacked-bars` is the **Stacked bars** block, opened
after landing on the Dynamic island page, and `?c=upload-dropzone` is the **Upload dropzone** block.
Reloading either link shows the Dynamic island again, because the path wins.

The Dynamic island itself is also a free MIT block, and its Music activity has a small animated
four-bar equaliser. This file therefore covers three Bencho blocks and proposes the "island with
stacked bars" as a composition: a `DynamicIsland` whose expanded content is a small stacked
`BarChart`, with an equaliser-style `ActivityBars` available for the compact face.

Not to be confused with the separate "Flight island", "Music island" and "Call island" entries in
bencho.dev's `llms.txt`. They are not in the free repo and must not be used.

---

## 1. Dynamic island (Bencho, free)

Source: `blocks/dynamic-island/Island.tsx` (16 KB), `Island.css` (8 KB), `README.md`.

### What it does

- A pill that holds one live activity: `Timer`, `Call`, `Music` or `Flight`. Pressing it toggles
  between a compact pill and an expanded card.
- Sizes are fixed per activity. Compact is 150×36 with radius 18. Expanded is 300×76 r38 (Timer,
  Call), 300×150 r42 (Music) and 300×116 r40 (Flight). The frame is fixed at 300×182 so nothing
  around it moves while it morphs; the pill is centred and grows evenly from its middle.
- **Shape motion.** One `motion.button` animates `width`, `height` and `borderRadius` on a single
  spring: stiffness 380, damping `34 − 16 × bounce/100`, mass 0.9. At the default bounce of 40 the
  damping is 27.6, a damping ratio of about 0.75. Our `spatialSpring('medium')` (ratio 0.8,
  stiffness 380) is almost the same curve.
- **Content motion.** The compact and expanded layouts never morph into each other. They swap
  through `AnimatePresence mode="popLayout"`, keyed on activity and open state: the old content
  leaves and the new arrives with opacity 0→1, scale 0.92→1 and blur 6px→0, over 220 ms with a
  60 ms delay. For a moment only the shape is moving, which is what makes it read as one object.
- **Nudge.** When the activity changes, an inner wrapper keyed on a counter springs from scale
  1.08 to 1 (stiffness 500, damping 18, a ratio of about 0.40). It sits on its own wrapper so it
  does not fight the size spring. Pressing gives `whileTap` scale 0.97.
- **Live values.** A 1 s interval ticks the timer down, the call duration up, the music position
  and the flight progress. Progress rails transition `width` over 1 s linear.
- **Equaliser.** Four bars, 3 px wide, animate height 4→16 px with `alternate infinite` at 0.9,
  0.7, 1.1 and 0.8 s with negative delays so they never line up. Paused, they lie at 4 px.
- **Tone.** `Black` (the hardware black, `#000`/`#fff`) or `White` (the card surface with a faint
  edge, and darker accent colours tuned for white).
- **Reduced motion.** A `matchMedia` check read once at render turns every transition into
  `{ duration: 0 }` and stops the equaliser at 10 px. It does not react if the setting changes.

Accessibility and responsive behaviour as shipped:

- The pill is a `<button>` with `aria-expanded` and `aria-label` "Open Timer" / "Close Timer".
- Inner controls (pause, end call, play) are `<span role="button" tabIndex={0}>` with only
  `onClick`, nested inside that `<button>`. Enter and Space do nothing on them, and interactive
  content inside a button is invalid. This must not be copied.
- No live region; the ticking numbers are silent, which is right, but discrete events (call ended,
  timer done) are silent too.
- All sizes are fixed pixels. There is no max-width, so at 375 px the 300 px card fits but there is
  no rule for anything wider. Colours are hex; layout uses `left`/`right` and `text-align: left`.

### Dependencies

`framer-motion` (same API as `motion/react`) and `lucide-react` icons. Demo avatars are inline SVG
data URIs; the music cover points at `/lab/mount.jpg`, which is not in the repo.

### Proposed API

The island is generic: it does not know about timers or music. Content is two slots, which keeps
the "one shape, swapped content" rule enforceable.

```tsx
export type DynamicIslandTone = 'inverse' | 'surface';
export type DynamicIslandPlacement = 'inline' | 'top';

export interface DynamicIslandLabels {
  expand: LabelTemplate<{ title: string }>;
  collapse: LabelTemplate<{ title: string }>;
}

export const defaultDynamicIslandLabels: DynamicIslandLabels = {
  expand: 'Show {title}',
  collapse: 'Hide {title}',
};

export interface DynamicIslandProps {
  title: string;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  isDisabled?: boolean;
  tone?: DynamicIslandTone;
  placement?: DynamicIslandPlacement;
  motionProfile?: MotionProfile;
  activityKey?: Key;
  announcement?: string;
  labels?: Partial<DynamicIslandLabels>;
  className?: string;
  children: ReactNode;
}

export interface DynamicIslandCompactProps {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export interface DynamicIslandExpandedProps {
  children: ReactNode;
}

export interface ActivityBarsProps {
  isActive?: boolean;
  count?: 3 | 4 | 5;
  className?: string;
}
```

Behaviour:

- Expansion follows RAC Disclosure naming (`isExpanded`, `defaultExpanded`, `onExpandedChange`).
  `title` is consumer content ("Upload", "Timer") and feeds the toggle's accessible name.
- The pill is a `div`. A RAC `Button` stretched over the pill's background carries
  `aria-expanded` and `aria-controls` and toggles on press; the content sits above it. Controls
  inside the expanded slot are ordinary `Button`/`IconButton`s and siblings of the toggle, never
  descendants, so there is no nested interactive content. Pointer presses on empty parts of the
  pill reach the toggle, as in Bencho.
- Escape collapses when focus is inside the expanded slot and returns focus to the toggle.
- Size: the current slot is measured with a `ResizeObserver` and the pill animates `width`,
  `height` and `borderRadius` on `spatialSpring('medium', motionProfile)`. Radius is `full` when
  compact and `min(height / 2, 28px)` when expanded, so tall content lands on the M3 `xl` shape.
- Content swap: `AnimatePresence mode="popLayout"` with opacity, scale 0.92 and a 6 px blur, using
  `motionDurations.medium` (250 ms) and `ease-standard`. Changing `activityKey` plays the nudge on
  `spatialSpring('fast')`.
- Reduced motion comes from `useMotionPreference()`, live: sizes snap, content fades only, the
  nudge and `ActivityBars` stop.
- `announcement` writes discrete events ("Upload complete") into a polite live region. Ticking
  values are never announced.
- `tone="inverse"` (default) is `bg-inverse-surface text-inverse-on-surface`, the M3 pairing for a
  dark element on a light screen; accents inside it use `text-inverse-primary`. Status colours
  (`success`, `error`) are not guaranteed to contrast with `inverse-surface`, so status inside the
  island uses container pairs (`bg-error-container text-on-error-container`).
  `tone="surface"` is `bg-surface-container-highest text-on-surface`.
- `placement="inline"` reserves the expanded height so content below does not move;
  `placement="top"` is fixed, centred, `inset-block-start: max(8px, env(safe-area-inset-top))`.
  Expanded width is `min(content, 100% − 32px)`, so it keeps a 16 px gutter at 375 px.
- `ActivityBars` is decorative (`aria-hidden`), uses `bg-current`, and keeps Bencho's four
  durations and offsets.

The stacked-bars mode is composition, not a prop:

```tsx
<DynamicIsland title="Visits" activityKey={period}>
  <DynamicIslandCompact leading={<icons.barChart />} trailing={<BarChart size="sm" … />} />
  <DynamicIslandExpanded>
    <BarChart layout="stacked" size="md" aria-label="Visits by source" … />
  </DynamicIslandExpanded>
</DynamicIsland>
```

A `variant="stacked-bars"` prop would tie the island to the chart package. Examples to ship: upload
progress, sync, timer, and the stacked-bars stats island above.

### Copy or ideas

Code may be copied under MIT with the notice. In practice the markup, accessibility, colours and
strings are rewritten; what carries over is the motion recipe: one spring on size and radius, the
`popLayout` crossfade with blur, the separate nudge wrapper, and the equaliser timings. Credit
`blocks/dynamic-island/Island.tsx` and `Island.css`. Do not use the Bencho name, the placeholder art
or `lucide-react`.

---

## 2. Stacked bars (Bencho, free)

Source: `blocks/stacked-bars/StackedBars.tsx` (11 KB), `StackedBars.css` (7 KB), `README.md`.

### What it does

- A 300 px card: title, subtitle "Last 20 days", a Day/Week switch, a headline total, a stacked bar
  plot, and an axis that shows only the first and last date.
- Each column stacks four categories with a 2 px gap between segments and a 2 px minimum segment.
  A second, smaller bar hangs below the baseline for a related count (red in colour mode, hatched
  in mono). The plot is 268 px wide, 104 px above the baseline and 22 px below it.
- Props: `colour` (`Mono` or `Colour`), `bars` 12–30 (default 20), `gap` 2–6 px (default 6). The
  gap gives way before any bar gets thinner than 3 px. Corner radius is `min(2.5, barWidth / 2)`.
- **Grow and regrow.** Segments are absolutely positioned spans. Their `height` and `bottom`
  transition over 600 ms `cubic-bezier(0.22, 1, 0.36, 1)`, delayed 14 ms per column. The first grow
  starts when an `IntersectionObserver` sees 30 % of the card. Switching Day/Week regrows the same
  way.
- **Headline.** The total is split into characters keyed by a generation counter, so a new total
  mounts new elements that rise from 0.18 em below, out of a 2 px blur, 500 ms
  `cubic-bezier(0.34, 1.45, 0.64, 1)`, 70 ms apart. The first paint does not animate.
- **Scrubbing.** The pointer's x position picks a column. Pointer capture on press makes touch
  scrubbing work; lifting a touch clears it, leaving the plot clears it. The active column gets a
  1.5 px ring; every other column's colour is mixed 38 % toward the card colour (mixed, not faded,
  so nothing shows through). Ring and tooltip fade in over 160 ms.
- **Tooltip.** 132 px wide, beside the column: on the right while it fits, otherwise on the left.
  Shows the date, the total, the two largest categories and the below-baseline count. Ring and
  tooltip are placed instantly when they first appear and then glide on a spring (stiffness 380,
  damping 34, mass 1, a ratio of about 0.87).
- Switch: a two-segment control whose thumb slides 220 ms `cubic-bezier(0.22, 1, 0.36, 1)`;
  pressed segments scale to 0.96.
- Colour: six hex categorical colours in colour mode; mono mode mixes the text colour toward the
  card colour at 100/78/60/44/32/22 %.
- Reduced motion turns off only the headline pop; the bars still animate.

Gaps: no keyboard access to the data, no chart role or label, no data table, the tooltip is
`aria-hidden`. The Day/Week control is `role="tablist"` with no tab panel and no arrow keys. Months
are an English array, numbers use `toLocaleString("en-US")`. Width is fixed at 300 px. The code
comments call the data "alerts" and "escalated" while the UI says "visits" and "Bounced"; the data
is generated by a seeded random function.

### Dependencies

`framer-motion` only (`motion.span`, `useMotionValue`, `animate`). Bars are HTML, not SVG, and no
charting library is used.

### Copy or ideas

Code may be copied under MIT with the notice. Worth carrying into `BarChart`: the gap-clamping
geometry, HTML bars positioned in percentages (they render on the server with no measurement),
segment gaps instead of borders to separate stacked tones, the ring plus colour-mix dimming, the
"place first, glide after" tooltip, and pointer-capture scrubbing. Credit
`blocks/stacked-bars/StackedBars.tsx` and `StackedBars.css` in the chart items that adapt them.
The proposed API is in section 6.

---

## 3. Upload dropzone (Bencho, free)

Source: `blocks/upload-dropzone/Upload.tsx` (17 KB), `Upload.css` (7 KB), `README.md`.

### What it does

It is a demo, not a file input. Two pretend files (`mood.png` 2.4 MB, `demo.mp4` 12.6 MB) lie on
a tray under a drop box. A pointer drag inside the block carries a file into the box. Nothing is
read from the computer and nothing is sent anywhere; an OS file drop does nothing.

- Props: `speed` 0–100 (upload duration), `bounce` 0–100 (overshoot of the return spring),
  `corner` 0–24 px.
- **Idle.** A 176 px filled box with no border, an upload glyph on a pale tile, "Drag a file here"
  and "Up to 5 MB".
- **Drag over.** The box scales to 1.02 and the glyph lifts 4 px, both on 420 ms
  `cubic-bezier(0.24, 1.34, 0.38, 1)` (an overshoot). Text changes to "Drop to upload".
- **Accepted drop.** The tile is pulled into the box's centre on an ease-in (380 ms
  `cubic-bezier(0.55, 0, 0.85, 0.3)`), shrinking and stretching along the direction of travel; the
  box "gulps" (scale 1.02 → 0.985 → 1.006 → 1 over 460 ms) and the upload row appears 220 ms in.
- **Uploading.** The box shrinks to hug the row (width and height, never scale, inside a
  fixed-height slot so nothing below moves). The row has a file glyph, name, size, a rolling
  percentage whose digit strips move on 220 ms overshoot, and a 4 px bar. Progress is deliberately
  uneven.
- **Done.** A check pops in (380 ms `cubic-bezier(0.3, 1.6, 0.4, 1)`), and after 1.5 s the box
  returns to idle and the file returns to the tray.
- **Rejected.** A file over 5 MB shakes the box (`x: 0, −7, 6, −4, 2, 0` over 420 ms), shows
  "Too big — up to 5 MB" in red for 1.8 s and springs home. Repeated tries within 8 s show a
  sequence of joke messages.
- **Keyboard.** Each tray file is `role="button"`; Enter or Space uploads it without a drag.
- **Reduced motion.** Read once at render: the upload completes immediately and the pull animation
  is skipped.

Gaps: the whole zone is a polite live region, so every progress change is a candidate announcement,
and the digit strips put ten digits per column in the DOM. Fixed 300 px width. Hex colours, sizes
formatted with `toFixed`, English strings. The file glyph is drawn "after Untitled UI's"
(`untitleduico/react`, MIT); we do not need it.

### Dependencies

`framer-motion` (`useAnimationControls` for the shake) and `lucide-react`. Everything else is CSS
transitions and keyframes.

### What we already have

React Aria Components already provide the hard parts:

- `DropZone` (RAC 1.22): native OS drag and drop, `isDropTarget`/`isFocusVisible`/`isDisabled`
  render props, `getDropOperation` to refuse a drag by type before the drop, a visually hidden
  drop button so keyboard and screen-reader users can drop from RAC draggables, and **paste**:
  `useClipboard` routes Ctrl/Cmd+V into `onDrop`. A `Text slot="label"` names it.
- `FileTrigger`: a hidden `<input type="file">` opened by any pressable child, with
  `acceptedFileTypes`, `allowsMultiple`, `acceptDirectory`, `defaultCamera` and `onSelect`.
  Our `Button` is a RAC Button, so `<FileTrigger><Button>Choose file</Button></FileTrigger>` works
  today.
- `LinearProgress` (tones, flat or wavy), `IconButton`, `Tag`, `Banner` and `toast` cover the rest.

Neither validates size, count or (for drops) type; that is the gap a component fills.

### Proposed API

Three levels, so a form that needs a plain button does not pull in an upload queue.

**Level 1, no new component.** `FileTrigger` + `Button`, shipped as an example on the
`FileDropzone` page ("Choose file" in a settings form).

**Level 2, `FileDropzone`.** `DropZone` + `FileTrigger` + `Button`, with validation. It owns no
file list.

```tsx
export type FileRejectionReason = 'type' | 'too-large' | 'too-small' | 'too-many';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
}

export interface FileDropzoneLabels {
  title: string;
  titleMultiple: string;
  dropTitle: string;
  browse: string;
  browseMultiple: string;
  dropzone: string;
  hintSize: LabelTemplate<{ size: string }>;
  hintTypes: LabelTemplate<{ types: string }>;
  hintTypesAndSize: LabelTemplate<{ types: string; size: string }>;
  rejectedType: LabelTemplate<{ name: string }>;
  rejectedTooLarge: LabelTemplate<{ name: string; size: string }>;
  rejectedTooSmall: LabelTemplate<{ name: string; size: string }>;
  rejectedTooMany: LabelTemplate<{ count: string }>;
}

export const defaultFileDropzoneLabels: FileDropzoneLabels = {
  title: 'Drag a file here',
  titleMultiple: 'Drag files here',
  dropTitle: 'Drop to add',
  browse: 'Choose a file',
  browseMultiple: 'Choose files',
  dropzone: 'Drop files',
  hintSize: 'Up to {size}',
  hintTypes: '{types}',
  hintTypesAndSize: '{types}, up to {size}',
  rejectedType: '{name} is not a supported file type',
  rejectedTooLarge: '{name} is larger than {size}',
  rejectedTooSmall: '{name} is smaller than {size}',
  rejectedTooMany: 'You can add up to {count} files',
};

export interface FileDropzoneProps {
  acceptedFileTypes?: string[];
  allowsMultiple?: boolean;
  acceptDirectory?: boolean;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  isDisabled?: boolean;
  isInvalid?: boolean;
  description?: ReactNode;
  errorMessage?: ReactNode;
  icon?: ReactNode;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  onSelect?: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  labels?: Partial<FileDropzoneLabels>;
  className?: string;
  children?: ReactNode;
}
```

- `onSelect` receives accepted files from a drop, a paste or the picker, matching FileTrigger's
  name. `onReject` receives the rest with a reason. Sizes are formatted with
  `Intl.NumberFormat(locale, { style: 'unit', unit: 'megabyte' | 'kilobyte', maximumFractionDigits: 1 })`.
- `getDropOperation` returns `'cancel'` when no dragged type matches `acceptedFileTypes`, so the
  box never lights up for a file it will refuse. Size and count are only known after the drop.
- States as data attributes: `data-drop-target`, `data-focus-visible`, `data-disabled`,
  `data-invalid`, and `data-rejecting` while the shake plays.
- `variant="outlined"`: dashed `border-outline-variant`, `bg-surface`; drop target is
  `border-primary bg-primary/8`. `variant="filled"`: `bg-surface-container-low`, no border, the
  Bencho look. Error: `border-error`, message in `text-error`.
- Motion: drag over scales to 1.02 and lifts the glyph 4 px on `ease-spatial` over 400 ms; a
  rejection shakes along the inline axis (`0, −7, 6, −4, 2, 0` px, 400 ms; symmetric, so RTL needs
  no flip) and announces the reason. Reduced motion: colour and text change only.
- `size="sm"` is a single-row inline zone for forms; `md` and `lg` are blocks (Bencho uses 176 px).

**Level 3, `FileUpload`.** `FileDropzone` plus a `FileList` and the upload lifecycle. The component
owns pending state, as the library's async rule requires.

```tsx
export type FileUploadStatus = 'queued' | 'uploading' | 'complete' | 'error' | 'canceled';

export interface FileUploadItem {
  id: Key;
  file: File;
  status: FileUploadStatus;
  progress?: number;
  error?: string;
}

export interface FileUploadContext {
  signal: AbortSignal;
  onProgress: (fraction: number) => void;
}

export interface FileUploadLabels {
  remove: LabelTemplate<{ name: string }>;
  retry: LabelTemplate<{ name: string }>;
  cancel: LabelTemplate<{ name: string }>;
  queued: string;
  uploading: string;
  complete: string;
  failed: string;
  canceled: string;
  uploadedAnnouncement: LabelTemplate<{ name: string }>;
  failedAnnouncement: LabelTemplate<{ name: string }>;
  list: string;
}

export interface FileUploadProps extends Omit<FileDropzoneProps, 'onSelect' | 'labels'> {
  value?: FileUploadItem[];
  defaultValue?: FileUploadItem[];
  onChange?: (items: FileUploadItem[]) => void;
  onUpload?: (file: File, context: FileUploadContext) => Promise<void>;
  maxConcurrent?: number;
  layout?: 'list' | 'single';
  labels?: Partial<FileUploadLabels & FileDropzoneLabels>;
}
```

- `onUpload` returns a promise; the component tracks progress, cancels through the `AbortSignal`,
  and offers retry on failure. Without `onUpload` it is a controlled picker that only collects.
- `FileList` is a RAC `GridList` (arrow keys between files, actions inside rows): file glyph with
  an extension `Tag`, name truncated in the middle, formatted size, `LinearProgress` while
  uploading, status text, and Retry/Cancel/Remove `IconButton`s. Exported on its own for forms that
  validate on submit.
- `layout="single"` is the Bencho behaviour: the zone closes around the one file row (width and
  height animate inside a fixed slot, so nothing below moves), the percentage rolls with
  NumberFlow, and a check pops in on completion. `layout="list"` keeps the zone and lists files
  under it.
- Only `uploadedAnnouncement` and `failedAnnouncement` go to the polite live region; progress does
  not. Progress is exposed through `LinearProgress`'s `aria-valuenow`.

### Copy or ideas

Code may be copied under MIT with the notice. Take the timings and keyframes (overshoot curve, lift,
gulp, shake, check pop, hug-the-row sizing in a fixed slot). Do not take the fake tray, the pull
animation (a real OS drop leaves no element to animate), the joke messages, the file glyph or the
live-region placement. Credit `blocks/upload-dropzone/Upload.css` and `Upload.tsx` in
`file-dropzone.json` and `file-upload.json`.

---

## 4. Data table (BoardUI, free)

Source: `components/application/data-table/data-table.tsx` (21.6 KB), with
`components/base/table/table.tsx`, `pagination/pagination.tsx`, `badges/chip.tsx` and
`badges/status-dot.tsx`. Registry item `data-table`, free.

### What it does

It is a recipe, not a reusable component: the only export is `DataTableExample({ showSizeToggle,
pageSize })`, built around 48 generated customer rows.

- **Toolbar.** "Total Results" with a count, three `Select` filters (price bucket, product, region)
  and a search input. Any filter change resets to page 1. Under the `sm` breakpoint the toolbar
  stacks and the filter row scrolls horizontally.
- **Table.** RAC `Table` wrapped only to add a horizontal scroll container and a size flag
  (`md` rows 64 px, `sm` rows 48 px). The table has `min-w-[1000px]`, so on a phone it scrolls.
  Fixed column widths per column id.
- **Columns.** Name (checkbox, avatar, name; the row header), Purchase (an editable `Select` with a
  status dot: Completed, Waiting, Processing), Status (a `Chip`: Shipped lime, Delivery waiting
  yellow, Delivery failed rose, Confirmed cyan), Last updated, Price (a grey chip), Actions.
- **Sorting.** TanStack `getSortedRowModel`. The header renders a plain `<button>` with a chevron
  that rotates 180° (150 ms) and darkens when sorted. RAC's own `allowsSorting` and
  `sortDescriptor` are not used, so React Aria does not set `aria-sort`.
- **Selection.** TanStack `rowSelection`. The RAC table has `selectionMode="none"`; checkboxes are
  placed by hand in the name cell and header, with select-all and indeterminate states. Rows get no
  `aria-selected`; a selected row gets an inline background style.
- **Row actions.** Delete and Edit icon buttons with tooltips (200 ms delay) and a "More" menu
  (View profile, Duplicate row, Download invoice, Archive customer), placement bottom end.
- **Pagination.** 8 rows per page, a numbered pager with ellipses around a sibling window. Below a
  measured width of 420 px the pager drops its Previous/Next text and the sibling window.
- **Density.** A Normal/Compact segmented control under the table.
- **Empty.** `renderEmptyState`: "No customers match your filters."
- Missing: loading state, error state, column visibility, column resizing, server-side mode,
  bulk actions, keyboard sort shortcuts. All strings are English, wrapped in a runtime
  `useTemplateCopy` translator. Prices are formatted by hand (`$1.234` for 1234).

### Dependencies

`@tanstack/react-table` ^8.21.3, `react-aria-components` ^1.17, `@remixicon/react`, and BoardUI's
avatar, checkbox, chip, dropdown, icon-button, input, pagination, segmented-control, select,
status-dot, table and tooltip.

TanStack Table's current release is **9.3.1** (MIT). v9 changed the core API (`useTable` with a
`features` object from `tableFeatures()` instead of `useReactTable` with row-model getters), so
BoardUI's v8 code would not carry over as is. Bundlephobia: 31.6 KB gzipped for the whole v9
package; v9 tree-shakes by feature.

### TanStack or not

The roadmap says "DataTable: TanStack Table + Table". The reference shows the cost: TanStack and
React Aria both want to own sorting and selection, and BoardUI resolved the conflict by switching
RAC selection off and losing `aria-selected` and `aria-sort`. What a data table here needs is a
comparator sort, a text filter, a page slice and a column filter: a few small pure functions over
the controlled state RAC already exposes. Server-side mode forwards the same state to the caller.

Recommendation: build `DataTable` on RAC `Table` with no TanStack dependency, and revisit only if
grouping, faceted filters or column pinning are requested. This is a change to the roadmap and is
the owner's call.

### Proposed API

Four pieces, from small to large.

**`StatusTag`** (new, `data-display`). A `Tag` driven by a status key, usable anywhere (tables,
lists, cards). It answers "status labels for every state":

```tsx
export type StatusKey =
  | 'active' | 'inactive' | 'draft' | 'pending' | 'inReview' | 'scheduled' | 'processing'
  | 'live' | 'paused' | 'completed' | 'failed' | 'rejected' | 'archived' | 'expired'
  | 'canceled' | 'unknown';

export interface StatusDefinition {
  tone: TagTone;
  dot?: boolean | 'pulse';
  icon?: ReactNode;
  label?: string;
}

export type StatusLabels = Record<StatusKey, string>;

export const defaultStatusLabels: StatusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  pending: 'Pending',
  inReview: 'In review',
  scheduled: 'Scheduled',
  processing: 'Processing',
  live: 'Live',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
  rejected: 'Rejected',
  archived: 'Archived',
  expired: 'Expired',
  canceled: 'Canceled',
  unknown: 'Unknown',
};

export const defaultStatusDefinitions: Record<StatusKey, StatusDefinition> = {
  active: { tone: 'success', dot: true },
  inactive: { tone: 'neutral', dot: true },
  draft: { tone: 'neutral' },
  pending: { tone: 'warning', dot: true },
  inReview: { tone: 'info', dot: true },
  scheduled: { tone: 'info' },
  processing: { tone: 'primary', dot: 'pulse' },
  live: { tone: 'success', dot: 'pulse' },
  paused: { tone: 'warning' },
  completed: { tone: 'success' },
  failed: { tone: 'error', dot: true },
  rejected: { tone: 'error' },
  archived: { tone: 'neutral' },
  expired: { tone: 'neutral' },
  canceled: { tone: 'neutral' },
  unknown: { tone: 'neutral' },
};

export interface StatusTagProps extends Omit<TagProps, 'tone' | 'dot' | 'children'> {
  status: StatusKey | (string & {});
  statuses?: Record<string, StatusDefinition>;
  labels?: Partial<StatusLabels>;
  children?: ReactNode;
}
```

- The 16 built-in keys have English labels through `labels` (namespace `status`) and a tone per
  key. Apps add their own keys through `statuses` (with a `label`, which is consumer content) or
  override a built-in tone. A key with no definition renders `unknown`.
- Tones are the existing `TagTone` roles (`neutral`, `primary`, `success`, `warning`, `error`,
  `info`). Colour is never the only signal: every status has text, and `dot: 'pulse'` (which Tag
  already supports) marks the ones that are in motion.

**`Table`** (roadmap wave 2). Styled RAC parts: `Table`, `TableHeader`, `Column`, `TableBody`,
`Row`, `Cell`, `ColumnResizer`, `TableLoadMore`. RAC 1.22 lets these be wrapped. Sort indicator on
`Column` when `allowsSorting`; selection through `<Checkbox slot="selection">`; `focus-ring-inset`
on cells and rows; `variant` and `size` from the `DataTable` list below.

**`Pagination`** (roadmap wave 2). `page`/`defaultPage`/`onPageChange`, `pageCount`,
`siblingCount`; compact form under 420 px (BoardUI's ellipsis algorithm is MIT and may be adapted
with credit).

**`DataTable<T>`** (roadmap wave 2). Configured by column definitions:

```tsx
export type DataTableColumnType = 'text' | 'number' | 'date' | 'status' | 'tags' | 'custom';

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  textValue?: string;
  type?: DataTableColumnType;
  accessor?: keyof T | ((row: T) => unknown);
  cell?: (row: T) => ReactNode;
  compare?: (a: T, b: T) => number;
  formatOptions?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
  statuses?: Record<string, StatusDefinition>;
  maxVisibleTags?: number;
  isRowHeader?: boolean;
  allowsSorting?: boolean;
  allowsResizing?: boolean;
  isHideable?: boolean;
  defaultHidden?: boolean;
  align?: 'start' | 'center' | 'end';
  width?: ColumnSize;
  minWidth?: number;
  maxWidth?: number;
}

export interface DataTableAction {
  id: Key;
  label: string;
  icon?: ReactNode;
  tone?: 'default' | 'destructive';
  isDisabled?: boolean;
  onAction: () => void | Promise<void>;
}

export interface DataTableLabels {
  search: string;
  columns: string;
  selectAll: string;
  selectRow: LabelTemplate<{ row: string }>;
  rowActions: LabelTemplate<{ row: string }>;
  selectedCount: LabelTemplate<{ count: string }>;
  clearSelection: string;
  emptyTitle: string;
  noResultsTitle: string;
  noResultsDescription: string;
  loading: string;
  loadingMore: string;
  rowsPerPage: string;
  pageRange: LabelTemplate<{ start: string; end: string; total: string }>;
  previousPage: string;
  nextPage: string;
  moreTags: LabelTemplate<{ count: string }>;
}

export const defaultDataTableLabels: DataTableLabels = {
  search: 'Search',
  columns: 'Columns',
  selectAll: 'Select all',
  selectRow: 'Select {row}',
  rowActions: 'Actions for {row}',
  selectedCount: '{count} selected',
  clearSelection: 'Clear selection',
  emptyTitle: 'Nothing here yet',
  noResultsTitle: 'No results',
  noResultsDescription: 'Try a different search or filter.',
  loading: 'Loading',
  loadingMore: 'Loading more',
  rowsPerPage: 'Rows per page',
  pageRange: '{start}–{end} of {total}',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  moreTags: '+{count}',
};

export interface DataTableProps<T> {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => Key;
  processing?: 'client' | 'server';
  totalCount?: number;

  sortDescriptor?: SortDescriptor;
  defaultSortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;

  selectionMode?: 'none' | 'single' | 'multiple';
  selectionBehavior?: 'toggle' | 'replace';
  selectedKeys?: Selection;
  defaultSelectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  disabledKeys?: Iterable<Key>;

  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
  getSearchText?: (row: T) => string;
  filters?: ReactNode;

  hiddenColumns?: Set<string>;
  defaultHiddenColumns?: Set<string>;
  onHiddenColumnsChange?: (ids: Set<string>) => void;

  paging?: 'pages' | 'infinite' | 'none';
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  onLoadMore?: () => void | Promise<void>;

  onRowAction?: (key: Key) => void;
  rowActions?: (row: T) => DataTableAction[];
  inlineActionCount?: number;
  selectionActions?: (keys: Selection) => DataTableAction[];

  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
  emptyState?: ReactNode;
  noResultsState?: ReactNode;

  title?: ReactNode;
  description?: ReactNode;
  toolbarActions?: ReactNode;
  variant?: 'outlined' | 'filled' | 'elevated' | 'plain';
  size?: 'sm' | 'md';
  stickyHeader?: boolean;
  labels?: Partial<DataTableLabels>;
}
```

Behaviour:

- **Columns.** `type` picks the cell renderer and the default comparator: `number` and `date`
  format with `Intl` and the `DSProvider` locale and align to the end; `status` renders a
  `StatusTag` from the column's `statuses` merged over the defaults; `tags` renders up to
  `maxVisibleTags` `Tag`s and a `+N` tag whose tooltip lists the rest (the "room for extra labels",
  e.g. platform, channel, beta); `custom` uses `cell` and, for sorting, `compare`.
- **Sorting** uses RAC `sortDescriptor`/`onSortChange`, so `aria-sort` is set by React Aria. In
  client mode the table sorts with the column's comparator; in server mode it only reports.
- **Selection** uses RAC selection with `Checkbox slot="selection"`, so rows carry
  `aria-selected`. When keys are selected a bar replaces the toolbar title with
  `selectedCount`, `clearSelection` and `selectionActions`.
- **Row actions.** `rowActions(row)` renders a `Menu` behind an `IconButton` (`moreVertical`)
  labelled `rowActions`; the first `inlineActionCount` actions become inline `IconButton`s with
  tooltips. `tone: 'destructive'` uses the Menu's destructive item. A promise from `onAction`
  shows a pending state on that row and blocks repeats. `onRowAction` makes the whole row
  actionable (RAC), separate from the menu.
- **Column visibility.** A "Columns" `Menu` with `selectionMode="multiple"` lists hideable columns.
  The row-header column cannot be hidden.
- **Paging.** `pages` renders `Pagination` plus a rows-per-page `Select`; `infinite` uses RAC
  `TableLoadMore` with `onLoadMore`; `none` renders everything. In server mode `totalCount`
  drives the page count. Above about 1,000 rendered rows, use RAC `Virtualizer` with
  `TableLayout` (fixed row height).
- **States.** `isLoading` renders `pageSize` skeleton rows (existing `Skeleton`) and sets
  `aria-busy`. `error` renders the existing `ContentState` error view with `onRetry`. Empty data
  shows `emptyState` (default `EmptyState` with `emptyTitle`); data filtered to nothing shows
  `noResultsState`. These are two different messages.
- **Look.** `variant` mirrors `Card`: `filled` is `bg-surface-container-low`, `outlined` adds
  `border-outline-variant`, `elevated` uses `shadow-elevation-1`. Header row
  `bg-surface-container`, `text-on-surface-variant text-label-lg`; rows `text-body-md`, hover
  state layer, selected `bg-secondary-container text-on-secondary-container`. `size="md"` rows
  are 52 px, `sm` 40 px.
- **Responsive.** The table scrolls horizontally inside its container; the row-header column can
  stick to the inline start (`sticky inset-s-0` on a surface background). The toolbar stacks under
  600 px: search goes full width, filters scroll horizontally, the selection bar moves to the bottom
  of the viewport. Columns are not auto-hidden by width: hiding cells with CSS would leave them in
  the grid's keyboard order, and hiding them by measured width differs between server and client.
- **Apps example**, the owner's case: App (icon avatar, name, bundle subtitle; row header),
  Platforms (`tags`: iOS, Android, Web), Version (`text`), Status (`status`: Live, In review,
  Rejected, Draft, Paused), Updated (`date`), actions (Edit, Duplicate, Archive). App names stay
  neutral (Photos, Notes, Weather, Music).

### Copy or ideas

Code may be copied under MIT with the notice "Copyright (c) 2026 Mertcan Dundar Esmergul
(BoardUI)". There is little to copy: the reusable parts are the toolbar's responsive classes and
the pager's ellipsis algorithm. Credit those files where adapted. Do not copy its sorting and
selection approach, its colours or its text.

---

## 5. Earnings chart card (BoardUI, Pro)

### Licence

Pro. Listed in `https://www.boardui.com/r/registry-pro.json` as "Bar chart card with period
switcher, count-up headline, and hover outline." The page says a Pro licence unlocks the component
and its source. Not in the GitHub repo. The BoardUI License forbids redistributing Pro source or a
recognisable derivative. We do not hold a licence and did not look at the source.

### What the public page shows

A headline "Earned so far" with a currency total and a percentage delta chip; a
Weekly/Monthly/Yearly segmented control; a Recharts bar series. The total counts up; the active bar
gets an outline on hover. The page documents no props and says nothing about keyboard,
accessibility or responsive behaviour. Theming follows BoardUI's tokens.

### Dependencies

Recharts (the free chart cards pin `recharts@^3.9.2`).

### What is free and close

- BoardUI's free `orders-chart-card.tsx` (MIT): grouped bars this year against last year,
  count-up headline (`useCountUp`, 320 ms ease-out cubic), a delta chip, a legend, and hovering a
  month swaps the headline for that month. Recharts `BarChart` with colours as
  `var(--color-…)` strings and 450 ms bar animation.
- BoardUI's free `revenue-chart-card.tsx` (MIT): the same header over an area with a gradient, a
  dashed comparison line and a custom active dot.
- Bencho's free Stacked bars (section 2): period switch, headline pop, ring on the active column.

### Copy or ideas

**Ideas only, and only generic ones.** A chart card with a headline, a delta, a period switch and a
highlighted active bar is a common pattern, and every part of it also exists in the MIT sources
above. Build `ChartCard` from those and from our own layout; do not reproduce the Earnings card's
specific composition or styling.

---

## 6. Charts

### Options

| Option                                        | Licence | Size (bundlephobia, whole package, gzipped)                                                                         | Server rendering                                                                                                              | Roles-only theming                                                    | RTL           | Accessibility                                                            | Our work |
| --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------ | -------- |
| Hand-written SVG and HTML                      | ours    | No dependency. Estimated 6–10 KB for scales, ticks, curves and three chart types (an estimate, not measured)        | Full markup on the server; percentage layout needs no measurement                                                            | Tailwind classes: `bg-primary`, `fill-tertiary`, `stroke-outline-variant`; checked by `check:ds` | We flip the scale | We build it: data table, keyboard index, live region                     | Most     |
| `d3-scale` + `d3-shape` with our own React     | ISC     | 17.6 + 8.5 KB; `d3-scale` brings `d3-array`, `d3-format`, `d3-interpolate`, `d3-time`, `d3-time-format`             | Same as above                                                                                                                 | Same as above                                                         | Same          | Same                                                                     | Medium   |
| visx 4.0.0 (released 2026-06-11)               | MIT     | shape 10.7, scale 17.5, axis 15.0, tooltip 3.2, responsive 1.8 KB (overlapping)                                      | Renders SVG on the server; `ParentSize` measures in the browser                                                               | `className` and `fill` props take classes or `var(--color-…)`          | By hand       | None built in                                                            | Medium   |
| Recharts 3.10.1                                | MIT     | 149.9 KB, 11 dependencies including Redux Toolkit, react-redux, immer, reselect and victory-vendor; `react-is` peer | `ResponsiveContainer` and the `responsive` prop measure with `ResizeObserver`; the server renders nothing or an initial size, then the layout shifts | Colours as strings `var(--color-primary)`; tick text styled by props, not Tailwind | `reversed` axis and `orientation` by hand | `accessibilityLayer` on by default: arrow keys move the tooltip. No data table | Least    |

Tremor (Apache-2.0) and shadcn's charts are Recharts underneath and share its trade-offs.

### Recommendation

Hand-written, with a small shared `registry/ds/lib/chart.ts` (linear and band scales, nice ticks,
stacking, a monotone curve path, colour classes). Reasons:

- **Roles only.** Every mark is a Tailwind class on a role, so `check:ds` keeps checking it, dark
  mode and dynamic colour work with no extra code, and there is no string `var()` plumbing.
- **Server rendering without layout shift.** Bars are HTML elements with heights and positions in
  percent of the plot, as in Bencho's Stacked bars. Lines and areas are one SVG with
  `viewBox="0 0 1000 100"`, `preserveAspectRatio="none"` and `vector-effect: non-scaling-stroke`;
  dots, axis labels and the tooltip are HTML positioned in percent, so text never stretches. The
  server output is the final chart, and cosum-web, a static export, gets charts in its HTML.
- **No dependency** for any app that installs a chart. Recharts would add about 150 KB gzipped of
  code to a page that shows one bar chart.
- **Scope is small.** Bar (grouped, stacked, percent), line, area and sparkline cover the
  references. If scatter, sankey or geographic charts are ever needed, visx is the fallback, not
  Recharts.

The monotone curve can be written from Fritsch–Carlson or adapted from `d3-shape`'s `monotoneX`
(ISC, credit Mike Bostock). If time or locale-aware date ticks become hard, adding `d3-scale` alone
is acceptable (ISC, about 18 KB).

### Colour

Material 3 roles give three accent hues (`primary`, `secondary`, `tertiary`) plus status roles
that carry meaning. Rules:

- One or two series: `primary`, then `tertiary`. A comparison series (last year) is `outline` or
  dashed `on-surface-variant`.
- Three to six series of one kind (stacked categories): a tonal ramp of one role, mixed toward the
  surface (`color-mix(in oklab, var(--color-primary) 100|72|52|36%, var(--color-surface-container-low))`),
  separated by a 2 px gap rather than by hue, Bencho's mono technique. Then `tertiary` for a second
  group.
- Status roles (`success`, `warning`, `error`, `info`) only when the series means that state.
- Dimming inactive marks mixes them 38 % toward the surface instead of lowering opacity.
- Never colour alone: a legend, the tooltip and the data table carry the names. Light ramp steps
  may fall under 3:1 against the surface, so axe and a manual look in both themes decide the
  floor.

If more distinct hues are needed later, the token script could generate `chart-1…5` roles from the
seed with hue-rotated HCT palettes. That changes `theme.css` and the Compose port, so it is a
separate decision.

### Shared chart API

```tsx
export type ChartColor =
  | 'primary' | 'secondary' | 'tertiary' | 'outline'
  | 'success' | 'warning' | 'error' | 'info';

export interface ChartSeries<T> {
  id: string;
  label: string;
  value: keyof T | ((datum: T) => number | null);
  color?: ChartColor;
  shade?: 1 | 2 | 3 | 4;
  lineStyle?: 'solid' | 'dashed';
  formatOptions?: Intl.NumberFormatOptions;
}

export interface ChartAxis {
  isVisible?: boolean;
  tickCount?: number;
  formatOptions?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
  domain?: [number | 'auto', number | 'auto'];
}

export interface ChartPoint<T> {
  index: number;
  datum: T;
  category: string;
  values: { series: ChartSeries<T>; value: number | null; formatted: string }[];
}

export interface ChartLabels {
  dataTable: LabelTemplate<{ title: string }>;
  category: string;
  total: string;
  noData: string;
  pointAnnouncement: LabelTemplate<{ category: string; values: string }>;
}

export const defaultChartLabels: ChartLabels = {
  dataTable: 'Data for {title}',
  category: 'Category',
  total: 'Total',
  noData: 'No data',
  pointAnnouncement: '{category}: {values}',
};

export interface CartesianChartProps<T> {
  'aria-label': string;
  data: T[];
  category: keyof T | ((datum: T) => string | Date);
  series: ChartSeries<T>[];
  categoryAxis?: ChartAxis & { ticks?: 'all' | 'ends' | 'auto' };
  valueAxis?: ChartAxis;
  categoryDirection?: 'auto' | 'ltr';
  showGrid?: boolean;
  showLegend?: boolean;
  tooltip?: 'default' | 'none' | ((point: ChartPoint<T>) => ReactNode);
  activeIndex?: number | null;
  defaultActiveIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onAction?: (point: ChartPoint<T>) => void;
  size?: 'sm' | 'md' | 'lg';
  height?: number | string;
  isAnimated?: boolean;
  labels?: Partial<ChartLabels>;
  className?: string;
}

export interface BarChartProps<T> extends CartesianChartProps<T> {
  layout?: 'grouped' | 'stacked' | 'percent';
  orientation?: 'vertical' | 'horizontal';
  belowBaseline?: ChartSeries<T>;
  barGap?: number;
  radius?: 'none' | 'xs' | 'sm';
}

export interface LineChartProps<T> extends CartesianChartProps<T> {
  curve?: 'linear' | 'monotone' | 'step';
  dots?: 'none' | 'active' | 'all';
}

export interface AreaChartProps<T> extends LineChartProps<T> {
  layout?: 'overlap' | 'stacked' | 'percent';
  fill?: 'gradient' | 'solid';
}
```

Behaviour common to all three:

- `size="sm"` hides axes, grid, legend and tooltip: a sparkline or sparkbar for a stat tile or the
  island's compact face. `md` is the card default (about 240 px tall).
- **Pointer.** Moving over the plot sets the active index from the pointer's x (pointer capture on
  press, so touch can scrub); leaving clears it. The active category gets a ring (bars) or a
  vertical guide and dot (lines); other marks are dimmed by mixing.
- **Tooltip.** Beside the active category, on the inline-end side while it fits and the start side
  otherwise. It is placed instantly when it appears and then glides on `spatialSpring('medium')`.
  Fades over 150 ms.
- **Keyboard.** The plot is one tab stop (`role="group"`, `aria-roledescription="chart"`,
  `aria-label`). Arrow keys move the active index (mirrored in RTL), Home and End jump to the ends,
  Enter calls `onAction`, Escape clears. Each move writes `pointAnnouncement` into a polite live
  region.
- **Data table.** A visually hidden `<table>` with the categories and series values, captioned
  with `dataTable`. The drawn marks are `aria-hidden`.
- **Motion.** Bars grow from the baseline on first view (an `IntersectionObserver`) and regrow on
  data change: `height` and `translate` over 400 ms `ease-emphasized-decelerate`, delayed
  `min(index × 14 ms, 300 ms)`. Lines draw with `stroke-dashoffset` over 400 ms; areas fade in.
  Everything is off under `motion-reduce:` and `useMotionPreference()`.
- **Numbers and dates** use `Intl` with the `DSProvider` locale; axis ticks default to
  `notation: 'compact'`, tooltips to the full value.
- **RTL.** `categoryDirection="auto"` runs categories from the inline start, so time runs right to
  left in Arabic. `ltr` keeps left to right for apps that prefer it.
- `activeIndex` is controllable so `ChartCard` can follow it.

### ChartCard

```tsx
export interface ChartCardLabels {
  increase: LabelTemplate<{ value: string }>;
  decrease: LabelTemplate<{ value: string }>;
  noChange: string;
  period: string;
  loading: string;
  emptyTitle: string;
}

export const defaultChartCardLabels: ChartCardLabels = {
  increase: 'Up {value}',
  decrease: 'Down {value}',
  noChange: 'No change',
  period: 'Period',
  loading: 'Loading',
  emptyTitle: 'No data for this period',
};

export interface ChartCardDelta {
  value: number;
  formatOptions?: Intl.NumberFormatOptions;
  polarity?: 'increase-is-good' | 'decrease-is-good' | 'neutral';
}

export interface ChartCardPeriod {
  id: Key;
  label: string;
}

export interface ChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  value?: number;
  valueFormatOptions?: Intl.NumberFormatOptions;
  unit?: ReactNode;
  delta?: ChartCardDelta;
  comparison?: ReactNode;
  periods?: ChartCardPeriod[];
  period?: Key;
  defaultPeriod?: Key;
  onPeriodChange?: (period: Key) => void;
  headline?: 'total' | 'follows-active';
  legend?: 'header' | 'footer' | 'none';
  actions?: ReactNode;
  status?: 'loading' | 'empty' | 'error' | 'content';
  onRetry?: () => void | Promise<void>;
  variant?: 'filled' | 'outlined' | 'elevated';
  labels?: Partial<ChartCardLabels>;
  className?: string;
  children: ReactNode;
}
```

- Built on `Card`. Header: `title` and `description`, `actions` (a `Menu`), and the period switch as
  the existing `SegmentedControl` (`size="sm"`, single selection).
- Headline: `value` through NumberFlow (the planned `AnimatedNumber`), in `text-headline-md` with
  tabular numbers. With `headline="follows-active"` it shows the hovered or focused category's
  value, as BoardUI's free Orders card and Bencho's tooltip do.
- Delta: a `Tag` with an `arrowUpward`/`arrowDownward` glyph; `polarity` decides whether up is
  `success` or `error`. Its accessible text is `increase`/`decrease`, not a bare "+14.8%".
- `status` delegates to `ContentState`; loading keeps the card's height with a `Skeleton` plot.
- `legend="header"` reads the child chart's series through context.
- At 375 px the header stacks: title row, headline, then the period switch at full width.

---

## 7. Proposed components

| Component                                    | Category     | Built on                                                    | New dependency | Credits                                     | Roadmap                    |
| -------------------------------------------- | ------------ | ----------------------------------------------------------- | -------------- | ------------------------------------------- | -------------------------- |
| `StatusTag`                                  | data-display | `Tag`                                                       | none           | none                                        | new                        |
| `Table` parts                                | data-display | RAC `Table`, `ResizableTableContainer`, `TableLoadMoreItem` | none           | none                                        | wave 2, as planned         |
| `Pagination`                                 | navigation   | `Button`, `IconButton`, `Select`                            | none           | BoardUI pagination if the algorithm is adapted | wave 2, as planned       |
| `DataTable`                                  | data-display | `Table`, `StatusTag`, `Pagination`, `Menu`, `SearchField`, `Skeleton`, `ContentState` | none (TanStack dropped, pending decision) | BoardUI data-table if toolbar classes are adapted | wave 2, changed |
| `FileDropzone`                               | inputs       | RAC `DropZone`, `FileTrigger`, `Button`                     | none           | Bencho upload-dropzone                       | wave 2, as planned         |
| `FileList`                                   | inputs       | RAC `GridList`, `LinearProgress`, `IconButton`, `Tag`        | none           | none                                        | wave 2, as planned         |
| `FileUpload`                                 | inputs       | `FileDropzone`, `FileList`                                  | none           | Bencho upload-dropzone                       | new                        |
| `lib/chart`                                  | lib          | none                                                        | none           | `d3-shape` (ISC) if `monotoneX` is adapted   | new                        |
| `BarChart`, `LineChart`, `AreaChart`         | charts       | `lib/chart`, `motion`                                       | none           | Bencho stacked-bars                          | new category               |
| `ChartCard`                                  | charts       | `Card`, `SegmentedControl`, `Tag`, `ContentState`, NumberFlow | none          | Bencho stacked-bars                          | new                        |
| `DynamicIsland`, `ActivityBars`              | expressive   | RAC `Button`, `motion`                                      | none           | Bencho dynamic-island                        | wave 3 in the roadmap      |

Credit text for Bencho items: source "Bencho", URL of the block folder, licence "MIT", copyright
"Copyright (c) 2026 Lorenzo Cabra". For BoardUI items: "Copyright (c) 2026 Mertcan Dundar
Esmergul (BoardUI)".

## 8. Decisions for the owner

1. Drop TanStack Table from `DataTable` (section 4), or keep it and accept the state duplication
   and the v8→v9 migration.
2. Hand-written charts (recommended) or visx. Recharts is not recommended.
3. Chart colours from existing roles only, or new generated `chart-*` roles in tokens and in the
   Compose library.
4. In RTL, should time axes run right to left by default (`categoryDirection="auto"`)?
5. `DynamicIsland` stays in wave 3 with the other expressive components, or moves into wave 2.
6. The 16 built-in status keys: add or remove any before they become API.

`libraries.json` still describes Bencho's fit in terms of Radix, cva and next-intl; the library
has since chosen React Aria, tailwind-variants and the `labels` prop. The verdicts in it are
unaffected.

## Sources

- `gh api repos/cabralorenzo/bencho/license`, `…/contents/LICENSE`, `…/contents/THIRD_PARTY.md`
- `gh api repos/cabralorenzo/bencho/contents/blocks/{dynamic-island,stacked-bars,upload-dropzone}/*`
- `gh api "repos/cabralorenzo/bencho/commits?path=blocks/…"` (commit `4c3d59b`, 2026-10-18)
- `https://bencho.dev/llms.txt`; `https://bencho.dev/assets/index-DECdEh_q.js` (URL state:
  functions writing `?c=` with `URLSearchParams` and keeping `location.pathname`)
- `gh api repos/BoardUI/boardui/license`; `…/contents/components/application/data-table/data-table.tsx`,
  `components/base/table/table.tsx`, `components/base/pagination/pagination.tsx`,
  `components/application/dashboard/orders-chart-card.tsx`, `revenue-chart-card.tsx`,
  `hooks/use-count-up.ts`
- `https://www.boardui.com/r/registry.json`, `https://www.boardui.com/r/registry-pro.json`
  (listing metadata only), `https://www.boardui.com/components/earnings-chart-card` (public page)
- `gh api repos/{recharts/recharts,airbnb/visx,d3/d3-shape,d3/d3-scale,TanStack/table,untitleduico/react}/license`
- `recharts/recharts` `src/chart/CartesianChart.tsx` (`accessibilityLayer: true`,
  `responsive: false`) and `src/component/ResponsiveContainer.tsx` (`ResizeObserver`,
  `initialDimension`)
- `TanStack/table` `docs/guide/tables.md` (v9 `useTable` and `tableFeatures`)
- `https://bundlephobia.com/api/size` for `recharts@3.10.1`, `@visx/*@4.0.0`, `d3-shape`,
  `d3-scale`, `@tanstack/react-table@9.3.1`; `npm view` for dependency lists
- `node_modules/react-aria-components` 1.22.1: `DropZone` (drop button, `useClipboard`, label
  slot), `FileTrigger`, `Table` types
