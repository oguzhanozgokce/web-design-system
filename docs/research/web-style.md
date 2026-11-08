# Web style specification

Current visual contract: HeroUI shapes and motion on Astryx neutral surfaces, with **40px controls**
by default. Read the shared foundations and the affected component entry. Public APIs, defaults,
labels and examples live in `content/docs`; implementation details live in the component and theme.

Reference research was reviewed on 2026-11-07. Licence decisions and source links are in
[Research](README.md). HeroUI v3 informs patterns only; no HeroUI or paid-tier code is copied.

## 1. Foundations

### 1.1 Radius

| Utility | Value | Use |
| --- | --- | --- |
| `rounded-control` | 9999px | Actions, chips, tags, badges, segmented controls, pill tabs, switches and progress |
| `rounded-field` | 12px | Input frames and select/combo-box triggers |
| `rounded-item` | 12px | Rows inside 16px overlays with 4px padding |
| `rounded-overlay` | 16px | Popovers and lists |
| `rounded-container` | 20px | Cards, banners, toasts and accordion surfaces |
| `rounded-dialog` | 24px | Dialogs, detached drawers and sheet top corners |
| `rounded-xl` | 12px | Tooltips |
| `rounded-md` / `rounded-lg` | 6px / 8px | Checkbox / key caps and small rounded avatars |
| `rounded-sm` | 4px | Skeleton text |

Use concentric corners: inner radius = outer radius minus padding. Tailwind's standard radius
scale keeps its defaults; the six families provide the theme-level shape controls.

### 1.2 Control heights, paddings, gaps

| Size | Height | Inline padding | Gap | Label | Labelled icon | Icon-only icon |
| --- | --- | --- | --- | --- | --- | --- |
| `sm` | 32px | 12px | 6px | 14/20 medium | 16px | 16px |
| `md` | 40px | 16px | 8px | 14/20 medium | 16px | 20px |
| `lg` | 48px | 20px | 8px | 16/24 medium | 20px | 24px |

Labelled icons pull inward by 2px. Text-entry padding is 10/12/16px across these sizes.
Overlay rows are at least 36px. Pill tabs and segmented items sit inside 4px track padding.
Use 4px label-to-field gaps and an 8px inner rhythm. Component-specific sizes are documented below.

### 1.3 Borders versus fills

- Fields: `border-outline-variant bg-surface-raised`.
- Actions: fill only, except `outline`.
- Containers and drawer edges: 1px `outline-subtle`; shadows belong to elevated variants and overlays.
- Separators: 1px fills with `outline-subtle`.
- Checkbox and radio edges: `outline`, providing a visible boundary on small controls.

### 1.4 Shadow scale

| Utility | Use |
| --- | --- |
| `shadow-xs` | Selected segments, switch/slider thumbs and soft-field focus |
| `shadow-sm` | Elevated cards and resting FABs |
| `shadow-md` | Popovers, lists, tooltips and toasts |
| `shadow-lg` | Dialogs, sheets and hovered FABs |

Dark shadows include a subtle rim. Exact layer values are maintained in `registry/ds/styles/theme.css`.

### 1.5 Focus ring

- Controls: 2px `primary` outline with a 2px offset, on keyboard focus only.
- Error-tone controls use an `error` ring.
- Attached groups and overlay rows use a -2px inset offset.
- Fields use `border-primary` plus a 2px `primary/20` inset ring without changing the box size.
  Invalid fields use `border-error` and `error/20`.

### 1.6 Hover, pressed, disabled

- Hover swaps to a computed `-hover` role. Use React Aria `data-hovered` to avoid sticky touch hover.
- Press keeps that fill and scales to 0.98/0.97/0.96 for `sm`/`md`/`lg`; rows use 0.98.
  Attached groups and reduced motion suppress scaling. Close buttons may use 0.93.
- Disabled controls retain their colours at `opacity-50` with `cursor-not-allowed`.
- Pressable controls use a pointer cursor.

### 1.7 Typography

| Role | Classes |
| --- | --- |
| Control label | `text-sm font-medium` |
| Small chip, tag, badge or segment | `text-xs font-medium` |
| Large control | `text-base font-medium` |
| Field value | `text-base pointer-fine:text-sm` |
| Field label | `text-sm font-medium text-on-surface` |
| Supporting text | `text-xs text-on-surface-variant` |
| Error | `text-xs text-error` |
| Overlay/card body | `text-sm text-on-surface-variant` |
| Card title | `text-sm font-semibold text-on-surface` |
| Dialog title | `text-base font-semibold` |
| Headings 1–4 | 24/20/18/16px, semibold; tight tracking only at 20px and above |
| Display | `text-4xl` through `text-6xl font-semibold tracking-tight` |

Use weights 400/500/600 and zero letter spacing at 16px and below. Material type utilities are retired.

### 1.8 Motion

| Motion | Timing |
| --- | --- |
| Control scale | 250ms `ease`; colour, border and shadow 100ms `ease-out` |
| Popover/list/tooltip | 150ms enter, 100ms exit; transform and opacity |
| Dialog | 250ms `ease-out-quad` enter from scale 1.05; 100ms exit to 0.95 |
| Sheet/drawer | 250ms enter, 200ms exit, `ease-fluid` |
| Switch thumb | 300ms `ease-fluid`; track colour 250ms |
| Tab/segment indicator | 250ms `ease-fluid` |
| Disclosure | 200ms height/opacity; chevron 250ms |
| Field error | Height 350ms, opacity 150ms |
| Toast | 350ms enter, 250ms exit, `ease-fluid` |
| Spinner / shimmer | 0.75s linear rotation / 2s linear translation |

`ease-fluid` = `cubic-bezier(0.32, 0.72, 0, 1)`;
`ease-out-quad` = `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
Use shared motion helpers. Springs are for gestures that carry velocity.
`DSProvider` reduced motion removes spatial changes; disabled motion is immediate. Preserve OS preferences.

### 1.9 Neutral surfaces and sparing accent

Page: `canvas`; cards/fields: `surface-raised`; overlays: `surface-overlay`.
Raised surfaces become lighter in dark mode. Quiet fills use `neutral-soft`; hairlines use
`outline-subtle`. Pair every fill with its matching text role.

Use accent for primary actions, checked controls, slider/progress fills, selected tab underlines,
focus indicators, accent links and selected rows. Unselected tabs and segments use neutral text.
Status fills express meaning; shape and motion supply liveliness without extra colour.

## 2. Components

These entries define visual decisions. Consult the matching `content/docs/components` page for
props, defaults, state attributes and integration. Shared fields use the field frame, actions use
`transition-control`, and overlay panels use the shared motion and surface roles above.

### 2.1 Button

Pill shape at the shared 32/40/48px sizes, without a fixed minimum width. Solid fills use
`*-solid` with matching on-colours; soft fills use their soft pairs. Outline and ghost keep the
surface quiet. Async feedback appears after 300ms and retains focus.

### 2.2 Button group

Attached buttons share outer pill corners, separators and size; suppress individual press scaling.
Raise keyboard-focused buttons above neighbours. Outline borders overlap. Detached groups have
8px gaps and wrap; vertical groups round only the outer top and bottom edges.

### 2.3 Toggle button

Soft neutral or ghost at rest, primary soft when selected. Use Button's size and motion rules;
attached groups use an inset focus ring. Icon-only actions use `IconToggleButton`.

### 2.4 Icon button

Circular 28/32/40/48px boxes with 16/16/20/24px icons. The 28px size serves inline and close actions;
small touch targets expand without changing layout. Default treatment is ghost neutral.

### 2.5 Copy button

Icon-only ghost neutral or labelled soft neutral, small by default. Cross-fade/scale the copy glyph
to a success check over 150ms, then restore it after 2s. Failures use an error glyph and announcement.

### 2.6 FAB

Floating circular 48/56px action with 20/24px icons; `ExtendedFab` adds a pill label. Resting
`shadow-sm` rises to `shadow-lg` on hover; press scale is 0.96. Enter from scale 0.9 over 150ms.
Primary uses the solid pair; neutral uses the overlay surface.

### 2.7 Link

Neutral by default. Inline links stay underlined; standalone links reveal the underline on hover.
Use a 1.5px underline and 4px offset, a small rounded focus ring and a muted trailing external icon.

### 2.8 Field parts (label, description, error, necessity)

Stack with 4px gaps. Label: 14px medium; supporting text, errors and counters: 12px.
Only frame and error text turn error-coloured. Required markers follow the label; counters use tabular numbers.

### 2.9 Text field

12px frame corners, raised surface and 1px border; soft uses a neutral tint. Keep values at 16px
for coarse pointers and 14px for fine pointers. Prefix/suffix content is secondary; focus uses the shared frame.

### 2.10 Text area

Shares the field frame and typography; supporting counters sit below the text. Auto-grow and resize
limits follow the component's documented contract.

### 2.11 Search field

Shared field frame, leading 16px search glyph and trailing clear IconButton. Soft treatment fits
header search. Empty fields hide the clear action without shifting the input.

### 2.12 Password field

Shared text field with a trailing ghost-neutral IconButton. The eye glyph cross-fades between
visibility states; its accessible name changes with the action.

### 2.13 Number field

Shared field frame with full-height steppers, subtle logical-edge separators, centred tabular values
and outline/soft treatments. The compact layout and rolling digits follow the NumberField documentation.

### 2.14 Checkbox

16/18px boxes with 6px corners, visible outline edges and a raised resting surface. The selected
fill scales from 0.7 over 100ms and fades over 200ms; the check draws over 150ms after a 15ms delay.
Keep a 12px label gap and align supporting text with the label.

### 2.15 Radio group

18px circular controls. Selection fills the control and shrinks the inner disc to about 0.43;
press expands it to about 0.57. Colour and scale transitions take 200ms.

### 2.16 Switch

Tracks are 48×24px (`md`) or 40×20px (`sm`), with pill thumbs. Off uses an opaque neutral track
and `surface-thumb`; on uses the solid primary pair. Slide logically over 300ms and widen the thumb
by 4px while pressed. Reduced motion changes position immediately.

### 2.17 Slider

Use the settled thin rail: 4px with 16/20px thumbs for small/default sizes; large uses a 6px rail
and 24px thumb. Fill uses solid primary; thumbs use `surface-thumb` and a small shadow.
Keep labels and tabular output above the rail. The bubble appears on drag or keyboard focus.

### 2.18 List box

12px item corners inside a 16px overlay, 4px padding and 2px row gaps. Rows are at least 36px,
with neutral focus fills and a primary trailing check. Standalone outline lists also tint selected rows.

### 2.19 Select

Shared field trigger; keep its focused frame while open. Rotate the 16px chevron over 150ms.
The list shares overlay geometry and is at least the trigger width.

### 2.20 Combo box

Text-field frame with a trailing ghost IconButton and the Select list surface. Empty/loading rows
use 14px supporting text and normal item padding.

### 2.21 Tabs

Underline is the default: neutral labels, 2px primary indicator and subtle baseline. Pill tabs use
a neutral track with 4px padding and a raised segment indicator. Indicators slide over 250ms;
scroll buttons handle overflow. Reserve label width when weight changes.

### 2.22 Segmented control

32/40/48px pill tracks with 4px padding. Selected segments use `surface-segment`, neutral text and
`shadow-xs`; slide the indicator over 250ms. Small labels are 12px; default labels 14px.

### 2.23 Card

20px corners and 12/16/24px padding. Outline uses a subtle border, elevated a small shadow, soft a
neutral tint and transparent no fill. Titles are 14px semibold; body text is secondary. Pressable
cards scale to 0.99 and use the shared focus ring.

### 2.24 Divider

1px fills: `outline-subtle` for subtle and `outline-variant` for strong. Vertical lines stretch to
the container. Labels use 12px secondary text with 12px inline padding.

### 2.25 Disclosure and accordion

Plain dividers or a 20px raised, bordered surface. Triggers are at least 48px, with 16px inline
padding and a 16px chevron. Animate panel height/opacity over 200ms and chevron rotation over 250ms.

### 2.26 Dialog

24px corners, overlay surface, 24px padding and `shadow-lg`. Widths are 384/448/512/672px or full.
Use a 16px semibold title, 14px body, 8px body gap and 20px footer gap. The close action sits at the
logical end. Backdrop fades in/out over 150/100ms; panel motion follows section 1.8.

### 2.27 Alert dialog

Small Dialog with a 40px soft-tone icon well and 20px glyph. Destructive confirmation uses solid
error; cancellation uses soft neutral. Async handling and confirmation gating follow the public API.

### 2.28 Sheet and drawer

Overlay surface, 24px padding and `shadow-lg`. Bottom sheets have 24px top corners and at most
85dvh height; side sheets have a subtle inner-edge border. Detached sheets have 8px outer spacing
and 24px corners. Handles are 36×4px. Slide in/out over 250/200ms; drag dismissal thresholds are
96px or 500px/s.

### 2.29 Popover

16px overlay corners, 12/16px padding, 14px semibold headings and a matching arrow. Default enter
scales from 0.9. Morph animation unfolds a separate surface from the resolved anchor over 250ms,
closing over 150ms; content does not scale. Hover previews remain non-modal and retain focus.
See [the popover study](popover-morph.md) for animation lifecycle constraints.

### 2.30 Tooltip

Inverted surface, 12px corners, 12px text, 10px inline and 6px block padding, matching arrow and
`shadow-md`. Use shared overlay motion and React Aria's 1500/500ms open/close delays.

### 2.31 Menu and dropdown

16px overlay corners, 4px padding and 2px row gaps. Items share ListBox geometry. Error actions
use error text and a soft focus fill. Put selection at the logical start; shortcut/submenu cues
at the end. Separators are inset 1px neutral fills.

### 2.32 Toast

20px corners, overlay surface, `shadow-md`, 16px inline and 12px block padding. Width is at most
400px with viewport gutters. Keep title neutral and colour the status icon. Three visible toasts
stack at 12px offsets and 5% scale steps, expanding on hover/focus. Enter/exit take 350/250ms.
Default timeout is 5000ms; actionable toasts follow the documented persistence rules.

### 2.33 Badge (count and status dot)

16/20px count pills with tabular 10/12px text, or an 8px dot. Anchored badges extend a quarter of
their box beyond the logical corner and use a canvas seam. Count changes use RollingNumber.

### 2.34 Chip (interactive: filter, input, assist)

24/32px pills, soft-neutral or outlined at rest and primary-soft when selected. Keep a 6px inner
gap, a 150ms appearing check and a separately named remove action with an expanded touch target.
Group chips with 6px wrapping gaps. Static labels belong to Tag.

### 2.35 Banner and alert

20px corners, 16px inline and 12px block padding, 12px gaps. Soft uses matching status pairs;
surface uses a raised fill and subtle border, colouring only the icon. Titles are 14px semibold,
body 14px, with small actions and an inline close button.

### 2.36 Empty state (and content state)

Centred layout with 16px gaps, 24px inline/32px block padding and a 48px neutral icon well.
Title: 18px semibold; description: 14px, at most 360px wide. Compact uses 8px gaps, 16px padding
and 14/12px type. ContentState composes this layout for loading, empty and error states.

### 2.37 Progress

Rounded neutral tracks with solid-tone fills. Linear sizes use 4/8/12px tracks; circular sizes
20/28/36px. Determinate changes take 300ms. Keep label and tabular value distinct; retain a static
indicator under reduced motion.

### 2.38 Spinner

16/24/32/40px rings with proportional strokes, a 20% track and quarter-circle arc in current text
colour. Rotate every 0.75s, slowing under reduced motion; provider-disabled motion stops it.

### 2.39 Skeleton

Neutral soft fill with 4px text corners, container block corners or circles. Shimmer translates
over 2s; pulse varies opacity. Reduced motion uses a static fill.

### 2.40 Avatar and avatar group

24/32/40/48/64px sizes; circular or rounded. Rounded corners are 8px at small sizes and 12px above.
Neutral or soft-tone fallbacks, with a 250ms image fade. Groups overlap by 25%, using a 2px canvas
seam or a transparent clip mask over images. Overflow is a `+N` avatar; hover lift is opt-in.

### 2.41 Tag (static label)

20/24px pills with 12px medium labels, 4px inner gaps and optional 6px dots. Soft, solid and outline
treatments use semantic pairs. Selection/removal behaviour is documented on TagGroup; action chips use Chip.

### 2.42 Kbd

20/24px key caps with 6/8px corners, 12px secondary text, neutral-soft fill and no bottom border.
Ghost is transparent. Keep shortcut descriptions available to assistive technology.

### 2.43 Cookie consent

Card, banner or compact layout on a subtly bordered overlay surface. Card is at most 384px;
compact uses pill corners when wide and container corners while editing. Actions are 40px pills:
accept/reject share soft-neutral styling; saving edited preferences uses solid primary.

Keep preferences inside the same non-modal region. Required categories stay on; consumer code owns
persistence. Arrival/exit and measured expansion use 250ms fluid motion; reduced motion removes
spatial changes. See [the consent study](cookie-consent.md) for references.

### 2.44 Recovery, media and conversion flow

- Breadcrumbs: wrapping ordered links, quiet ancestors, text-only current page and directional
  chevrons. Structured data belongs to the application's route model.
- NotFound: EmptyState with original page/search artwork, one 300ms entrance and recovery links.
  Server-render meaningful copy; routing owns HTTP status and `noindex`.
- Lightbox: full-screen Dialog, thumbnail Tabs, native zoom overflow, named controls and retryable
  image errors. Use existing surfaces and keep panning unanimated.
- FunnelChart: mono by default, chart roles for categorical stages, visible counts/rate denominators
  and a semantic table. Compose period controls with ChartCard; avoid pointer-move geometry.
- Onboarding: a Card example with Checkbox, Disclosure and LinearProgress. Completion comes from
  application data; it has no separate registry state contract.

### 2.45 Reorderable list

Outline uses raised 20px rows, subtle borders and 8px gaps; plain uses dividers and neutral hover.
Keep 40px drag controls and consumer-owned content. Dim the source and show a primary insertion
line during drag; commit order only on completed drops. Animate committed positions with a 250ms
fluid transform, suppressed under reduced motion. See [the study](reorderable-list.md).

## 3. Variant API for actions and the rest of the library

Use `variant` for treatment, `tone` for semantic intent and `size` for density. Shared vocabulary:
`solid | soft | outline | ghost`; action tones `primary | neutral | error`; status components may
also use `success | warning | info`. Component-specific sets are documented in their public APIs.

Solid actions default to primary; quieter variants to neutral. Button, ToggleButton and ButtonGroup
use `sm | md | lg`; IconButton also has `xs`. Retired Material names have no compatibility aliases.
Use role name `error`, not `danger` or `destructive`. Secondary/tertiary roles remain available to
applications without becoming built-in component tones.

## 4. Token layer

`registry/ds/styles/theme.css` owns hand-written families and computed roles; `tokens/config.json`
and the colour generator own seed-derived values. Use semantic roles rather than literal colours.

| Layer | Light neutral tone | Dark neutral tone |
| --- | --- | --- |
| `canvas` | 96 | 6 |
| `surface-raised` | 100 | 12 |
| `surface-overlay` | 100 | 17 |
| `surface-segment` | 100 | 30 |
| `surface-thumb` | 100 | 90 |

- Solid roles retain saturated fills in dark mode; accent text/focus uses the readable `primary` role.
- Soft roles are translucent, with matched on-colours adjusted for contrast. Neutral soft uses
  6%/10% fill and 10%/14% hover; subtle outlines use 8%/10%.
- Radius, shadow, typography and motion contracts are defined in section 1 and implemented in the theme.
- Charts use the eight generated categorical roles; components choose semantic roles instead of
  introducing per-component colour tokens.
- Pair each fill with its on-colour. Contrast checks cover generated schemes and rendered components.

## 5. Credits for adapted recipes

Source references: [HeroUI](https://github.com/heroui-inc/heroui),
[Astryx](https://github.com/meta/astryx), [Bencho](https://github.com/cabralorenzo/bencho),
[EasyUI](https://github.com/Surajmaurya1/easyui) and [BoardUI](https://github.com/BoardUI/boardui).
HeroUI and paid demos inform patterns only. Adapted MIT/ISC source requires item `credits` and
preserved notices; generated `THIRD_PARTY_NOTICES.md` records the distributed attributions.
See [Research](README.md) for the licence verdicts and the focused studies for later references.

## Decisions

Settled by the owner on 2026-11-07:

1. **HeroUI v3 licence**: patterns only. No HeroUI code is copied; nothing needs an Apache notice.
2. **Destructive tone name**: `tone="error"`, matching the role name.
3. **Button default**: `solid · primary`.
4. **Button sizes**: `sm`, `md`, `lg` (32, 40, 48px) on Button, ToggleButton and ButtonGroup; `xs`
   stays on IconButton only.
5. **Container radius**: 20px for cards and toasts.
6. **Slider**: the thin rail (Astryx), not the 20px track.
7. **Tooltip**: inverted, dark in light mode.
8. **Type scale**: Tailwind sizes (`text-sm font-medium`), replacing the Material type utilities.
9. **Default link tone**: neutral.
10. **Visual language**: a mix. HeroUI's shapes and liveliness on Astryx's neutral surfaces and calm
    density.
11. **Solid fills in dark mode**: vivid. Filled buttons, checked controls, slider ranges, progress
    and solid badges use the `*-solid` roles, which keep the saturated light colour in dark mode
    with its light on-colour. Text-coloured accents (links, ghost and outline labels, the focus
    ring) keep `primary`, which is lighter in dark mode and stays readable on dark surfaces.
12. **Tabs overflow**: scroll buttons at the ends.
13. **FAB and avatar group**: follow the reference libraries, not Material.


## Sidebar — 2026-11-08

Original implementation informed by the public [shadcn sidebar](https://ui.shadcn.com/docs/components/base/sidebar)
and [HeroUI Pro sidebar demos](https://heroui.pro/docs/react/components/sidebar). Patterns only;
no reference source was copied, including paid Pro code.

- Composable navigation links with normal Tab order, not tree/menu keyboard semantics.
- 256px expanded, 72px icon rail; 40px rows with item radii. Primary soft current-page fill,
  neutral resting surface and secondary text. Standard edge border or floating raised container.
- Header/footer stay visible while the content scrolls. Rail labels stay accessible and gain
  keyboard/hover tooltips. Required icons avoid empty collapsed links.
- Below 48rem use the existing modal Sheet with full labels, focus restoration and navigation dismissal.
  Mobile opening and desktop collapse are independent controlled/uncontrolled states.
- Logical start/end placement, shared English labels and provider routing. Persistence belongs to
  the consuming app; no global shortcut or automatic cookie side effect.
- Width changes use 250ms ease-fluid and stop under reduced/disabled motion. No per-frame React state.
