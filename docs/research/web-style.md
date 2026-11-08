# Web style specification

Researched 2026-11-07. This replaces the style choices in `libraries.json` and `README.md` of this
folder, which were written for a Material 3 look. Their licence verdicts still stand, with one
correction below.

The direction: **HeroUI v3's shapes and liveliness** (pill controls, soft 12–24px corners, a lively
accent, press and slide motion) **on Astryx's neutral surfaces and calm density** (grey canvas, white
raised surfaces, translucent neutral fills, accent only where it means something). Default control
height is **40px**. Colours stay the seed-generated roles; surfaces and outlines already come from
the monochrome scheme since commit `a3e2a9c`.

## Read this first: HeroUI v3 is not MIT

`gh api repos/heroui-inc/heroui/license` returns **Apache-2.0** for the default branch `v3`
(`LICENSE` appendix: "Copyright 2025 NextUI Inc."; `@heroui/styles` 3.2.7 and `@heroui/react` 3.2.7
both declare `"license": "Apache-2.0"`). Only the old `v2` branch is MIT ("Copyright (c) 2020 Next UI
Inc."). Apache-2.0 allows adaptation but §4(b) requires "prominent notices stating that You changed
the files" in modified files, which collides with this repository's no-comments rule. Section 5 gives
the options. Everything below cites HeroUI v3 for **values and patterns** (numbers, durations, which
role goes where) and writes our own class strings in our role names; that is the "patterns only"
verdict `README.md` already recorded.

## How to read the evidence

| Tag      | Source                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------- |
| `H`      | HeroUI v3, `https://github.com/heroui-inc/heroui/blob/v3/packages/styles/` (CSS read on 2026-11-07)       |
| `H-react`| HeroUI v3, `https://github.com/heroui-inc/heroui/blob/v3/packages/react/src/components/`                  |
| `H2`     | HeroUI v2 (MIT), `https://github.com/heroui-inc/heroui/blob/v2/packages/core/theme/src/components/`       |
| `A`      | Astryx core, `https://github.com/meta/astryx/blob/main/packages/core/src/`                                |
| `AN`     | Astryx Neutral theme, `https://github.com/meta/astryx/blob/main/packages/themes/neutral/src/neutralTheme.ts` |
| inferred | A decision of this document, not read in any source                                                       |

Two facts make HeroUI class strings readable as plain Tailwind:

- HeroUI sets `--radius: 0.5rem` and derives `--radius-xs … --radius-4xl` as `radius × 0.25 … × 4`
  (`H themes/shared/theme.css`), which lands exactly on Tailwind v4's defaults: `rounded-sm` 4px,
  `rounded-md` 6px, `rounded-lg` 8px, `rounded-xl` 12px, `rounded-2xl` 16px, `rounded-3xl` 24px.
  **Our `theme.css` overrides that scale with M3 values (`--radius-xl: 1.75rem`, `--radius-3xl: 3rem`),
  so the same class means a different corner here.** Section 4 restores the defaults.
- HeroUI controls are `h-10 … md:h-9`: 40px on touch-sized viewports, 36px from 768px up
  (`H components/button.css`). We keep 40px everywhere; that is the owner's default.

Astryx is StyleX, so its values are token names. Its defaults (`A theme/tokens.stylex.ts`): spacing in
4px steps, `--size-element-sm/md/lg` 28/32/36px, `--radius-inner` 4px, `--radius-element` 8px,
`--radius-container` 12px, `--radius-page` 28px (Neutral: 6/10/12/28px), `--border-width` 1px.

---

## 1. Foundations

### 1.1 Radius

| Reference            | Values read                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HeroUI (`H`)         | buttons, toggle buttons, tabs `rounded-3xl` (24px, a pill at 40px); fields `--field-radius: calc(var(--radius) * 1.5)` = 12px; cards, modals, popovers, toasts, alerts, accordion surface `min(32px, var(--radius-3xl))` = 24px; select, dropdown and combo-box popovers `min(32px, calc(var(--radius-2xl) + var(--spacing) * 1.5))` = 22px; menu and list items `rounded-2xl` 16px; tooltip `rounded-xl` 12px; chip `rounded-2xl`; tag `rounded-xl`; checkbox `rounded-md` 6px; kbd `rounded-lg` 8px; bottom drawer and sheet 16px; skeleton `rounded-sm`; avatar `calc(var(--radius) * 3)` (a circle). |
| Astryx (`A`, `AN`)   | buttons, inputs, tabs, menu items, avatar `rounded` shape: `--radius-element` 8px (Neutral 10px); cards, popovers, dialogs, toasts, tooltips, banners, menus: `--radius-container` 12px; checkbox, kbd, tokens, skeleton text: `--radius-inner` 4px (Neutral 6px); badges, switch, slider, progress: `--radius-full`.                                                     |

HeroUI's dropdown is concentric: 22px popover − `p-1.5` (6px) = 16px items. Astryx states the rule in
code: `CONCENTRIC_RADIUS = max(0px, calc(var(--_segmented-control-radius) - var(--_segmented-control-padding)))`
(`A SegmentedControl/SegmentedControlItem.tsx`).

**Recommended families** (HeroUI shapes, slightly tightened for calm density — inferred where noted):

| Token / utility        | Value          | Used by                                                                                                       | Follows                                  |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `rounded-control`      | `9999px`       | button, icon button, toggle button, FAB, chip, tag, badge, segmented track and items, pill tabs, switch, slider, progress track | HeroUI `rounded-3xl` on 40px controls    |
| `rounded-field`        | 12px           | text field, text area, search, password, number, select trigger, combo-box                                    | HeroUI `--field-radius`                  |
| `rounded-item`         | 12px           | menu, list-box and select items (inside a 16px overlay with 4px padding)                                      | concentric rule; inferred value          |
| `rounded-overlay`      | 16px           | popover, menu, select and combo-box lists                                                                      | inferred: between HeroUI 22–24, Astryx 12 |
| `rounded-container`    | 20px           | card, banner, toast, accordion surface, empty-state frame                                                     | inferred: between HeroUI 24, Astryx 12    |
| `rounded-dialog`       | 24px           | dialog, alert dialog, bottom-sheet top corners, detached drawer                                               | HeroUI modal                              |
| `rounded-xl`           | 12px           | tooltip                                                                                                       | both (HeroUI `rounded-xl`, Astryx container) |
| `rounded-md` / `-lg`   | 6px / 8px      | checkbox (6px on 18px), kbd (8px), avatar `rounded` shape at sm                                               | HeroUI                                   |
| `rounded-sm`           | 4px            | skeleton text lines                                                                                           | HeroUI                                   |

A theme makes the library squarer by changing six variables instead of editing components (HeroUI has
one `--radius` knob; Astryx has four radius tokens).

### 1.2 Control heights, paddings, gaps

| Size | Height | Inline padding | Gap | Label            | Icon (labelled) | Icon-only box |
| ---- | ------ | -------------- | --- | ---------------- | --------------- | ------------- |
| `sm` | 32px `h-8`  | 12px `px-3` | 6px `gap-1.5` | `text-sm` 14/20 medium | 16px | `size-8`, icon 16px |
| `md` | 40px `h-10` | 16px `px-4` | 8px `gap-2`   | `text-sm` 14/20 medium | 16px | `size-10`, icon 20px |
| `lg` | 48px `h-12` | 20px `px-5` | 8px `gap-2`   | `text-base` 16/24 medium | 20px | `size-12`, icon 24px |

- Heights follow HeroUI v2's table exactly (`H2 button.ts`: `sm` `h-8 px-3 text-tiny gap-2`, `md`
  `h-10 px-4 text-small gap-2`, `lg` `h-12 px-6 text-medium gap-3`) and HeroUI v3's touch values
  (`h-9` sm, `h-10` md, `h-11` lg before the `md:` shrink). `lg` padding 20px is inferred, between v3's
  16px and v2's 24px.
- Labelled icons pull in by 2px (`-mx-0.5`, HeroUI `& svg { -mx-0.5 }`) so a leading icon does not
  look over-padded.
- Text-entry controls use the same heights: `sm` 32px with `px-2.5`, `md` 40px with `px-3`, `lg` 48px
  with `px-4` (HeroUI input `px-3 py-2`; Astryx input `paddingInline: --spacing-2`).
- Rows inside overlays (menu, select, list box) are 36px (`min-h-9`, HeroUI `.menu-item`,
  `.list-box-item`); segmented items and pill tabs are the track height − 8px (32px in a 40px track,
  Astryx Neutral `calc(var(--size-element-md) - 8px)`).
- Astryx is 8px denser (32px md, `px-3`); we take its inner rhythm (8px gaps, 4px label-to-field gap,
  12px card padding at `sm`) and HeroUI's outer heights.

### 1.3 Borders versus fills

| Reference | Rule read                                                                                                                                                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HeroUI    | `--border-width: 1px`, but `--field-border-width: 0px` and `--field-border: transparent`: fields are white (`--field-background: var(--white)`) with `--field-shadow` on a grey page; the `secondary` field variant is a grey fill (`--default`) with no shadow. Buttons have no border except `outline`. Cards have no border and `shadow-surface` (none in dark). Separators are 1px fills (`bg-separator`), not borders. |
| Astryx    | Fields always have a 1px `--color-border-emphasized` border on `--color-background-surface` (`A Field/inputStyles.stylex.ts`). The `default` card has a 1px `--color-border` hairline, other card variants none (`A Card/Card.tsx`). Banners are borderless muted fills. Buttons never have a border (only in forced colours). |

**Recommendation:**

- **Fields: border** (Astryx). HeroUI's borderless white field only reads on a grey page; on a white
  card or in a dialog it disappears. `border border-outline-variant bg-surface-raised`.
- **Actions: fill**, except the `outline` variant. No border on solid, soft or ghost.
- **Containers (card, accordion surface, banner `surface` variant, drawer edge): 1px hairline**
  `border-outline-subtle` (Astryx `--color-border`, black 8% / white 10%), plus a shadow only on the
  `elevated` variant and on overlays.
- **Separators** are 1px fills (`h-px bg-outline-subtle`), so they can be inset and rounded (HeroUI).
- **Checkbox, radio boxes: 1px `border-outline`**, not `outline-variant`: an 18px box needs a 3:1 edge
  (WCAG 1.4.11). Both references use their lighter border colour here; this is a deliberate deviation
  (inferred).

### 1.4 Shadow scale

Read values:

| Name                 | Light                                                                                              | Dark                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| HeroUI `--field-shadow`, `--surface-shadow` | `0 2px 4px 0 rgba(0,0,0,.04), 0 1px 2px 0 rgba(0,0,0,.06), 0 0 1px 0 rgba(0,0,0,.06)` | none (`0 0 0 0 transparent inset`)                                             |
| HeroUI `--overlay-shadow` | `0 2px 8px 0 rgba(0,0,0,.06), 0 -6px 12px 0 rgba(0,0,0,.03), 0 14px 28px 0 rgba(0,0,0,.08)`    | `0 0 1px 0 rgba(255,255,255,.3) inset` (a rim, no drop)                         |
| Astryx Neutral `--shadow-low`  | `0 2px 4px 5%, 0 4px 8px 10%`                                                              | `0 2px 4px 25%, 0 4px 8px 40%, inset 0 0 0 1px white 8%`                        |
| Astryx Neutral `--shadow-med`  | `0 2px 4px 5%, 0 4px 12px 10%`                                                             | `0 2px 4px 35%, 0 4px 12px 50%, inset 0 0 0 1px white 12%`                      |
| Astryx Neutral `--shadow-high` | `0 4px 6px 10%, 0 12px 24px 15%`                                                           | `0 4px 6px 50%, 0 12px 24px 70%, inset 0 0 0 1px white 15%`                     |

Astryx uses `low` for popovers (`A Popover/usePopover.tsx`), `med` for toasts, `high` for dialogs,
drawers and bottom sheets; buttons and cards take an `elevation` prop (`none | low | med | high`).

**Recommended scale** (light from the reference named; dark is a deeper drop plus a 1px rim, from
Astryx Neutral, because a drop alone does not read on a dark canvas):

| Utility     | Use                                                        | Light                                        | Dark                                        |
| ----------- | ---------------------------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| `shadow-xs` | segment indicator, switch thumb, slider knob, `soft` field focus | HeroUI field shadow                       | none                                        |
| `shadow-sm` | `elevated` card, FAB at rest                               | Astryx Neutral low                            | Astryx Neutral low dark                     |
| `shadow-md` | popover, menu, select list, tooltip, toast                 | HeroUI overlay shadow                         | Astryx Neutral med dark                     |
| `shadow-lg` | dialog, sheet, drawer, FAB hovered                         | Astryx Neutral high                           | Astryx Neutral high dark                    |

Section 4.3 has the CSS. The five `shadow-elevation-*` M3 levels go.

### 1.5 Focus ring

| Reference | Read                                                                                                                                                                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HeroUI    | `@utility focus-ring { @apply ring-2 ring-focus ring-offset-0 ring-offset-background outline-none; --tw-ring-offset-width: var(--ring-offset-width); }` with `--ring-offset-width: 2px`, `--focus: var(--accent)`. Fields: `focus-field-ring` = `ring-2 ring-focus`, offset 0. Invalid: `outline-1 outline-danger`, focused `ring-2 ring-danger`. Inside attached toggle groups: `ring-inset`, offset 0. |
| Astryx    | `--focus-outline-width: 2px`, `--focus-outline-style: solid`, `--focus-outline-color: var(--color-accent)`, `--focus-outline-offset: 3px`, only on `:focus-visible`. The `destructive` button recolours the ring to `--color-error`. Fields: `borderColor: accent` + `boxShadow: inset 0 0 0 2px var(--color-accent-muted)` on `:focus-within`. |

**Recommendation:**

- Controls: **2px solid `primary`, 2px offset, outline-based** (outline needs no offset colour and
  survives forced colours). `error`-tone controls ring in `error` (Astryx).
- Attached groups and items inside overlays: offset `-2px` (inset), so the ring is not clipped.
- Fields: **`border-primary` + 2px inset ring of `primary/20`** on focus-within (Astryx). It never
  changes the field's outer box, and the accent stays a thin line.
- Invalid fields: `border-error`, focused `inset-ring-error/20`.

### 1.6 Hover, pressed, disabled

| Reference | Hover                                                                                                                                                                         | Pressed                                                                                                                         | Disabled                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| HeroUI    | background swaps to a computed role: `--accent-hover: color-mix(in oklab, var(--accent) 90%, var(--accent-foreground) 10%)`, `--default-hover` (4% toward foreground), `--accent-soft-hover` (accent 20% vs 15%). Only under `@media (hover: hover)`. Tabs: `opacity-70`. Links: underline appears. | same background as hover **plus `transform: scale(0.97)`** (sm 0.98, lg 0.96); menu and list items `scale(0.98)`; radio control `scale-95`; close button `scale(0.93)`; groups cancel the scale. | `--disabled-opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`; colours unchanged. |
| Astryx    | an overlay gradient over any fill: `--color-overlay-hover` (default `#0536590C` / `#FFFFFF0C`, Neutral black 5% / white 5%); fields get an inset 2px `border-emphasized 30%` ring; checkbox border mixes 20% of `--color-tint-hover`, checked fill mixes 15%. | overlay `--color-overlay-pressed` (10%), `scale(0.98)` for mouse only (`@media (pointer: coarse)` keeps `scale(1)`); the overlay fades out over `--duration-exit` on release. | `opacity: 0.5`, cursor default. |

**Recommendation:**

- **Hover = background swap to a computed `-hover` role** (HeroUI). It works with borders, isolation
  and rounded clipping, unlike the M3 `state-layer` `::before` overlay, which goes.
- Solid fills: `bg-{tone}-hover` = `color-mix(in oklab, var(--{tone}) 90%, var(--on-{tone}))`.
  Soft fills: `{tone}-soft` 12% → `{tone}-soft-hover` 16%. Neutral soft: 6% → 10% of `on-surface`
  (Astryx's translucent `--color-neutral`, light 6% / dark 10%).
- **Pressed = hover background + scale**: `md` 0.97, `sm` 0.98, `lg` 0.96, rows 0.98; never inside
  attached groups. Optionally skip the scale under `pointer-coarse` (Astryx; inferred as optional).
- **Disabled = `opacity-50` + `cursor-not-allowed`**, colours unchanged (both references). This
  replaces the M3 `on-surface/38` text and `on-surface/12` container recipe.
- **Cursor: `pointer`** on every pressable control (HeroUI `--cursor-interactive: pointer`, Astryx
  `cursor: pointer`), not RAC's `default`.
- Only under `@media (hover: hover)`, which `data-[hovered]` already guarantees in React Aria.

### 1.7 Typography

Read values:

- HeroUI: every control label `text-sm font-medium` (14/20, 500); field labels `text-sm font-medium
  text-foreground`; descriptions and errors `text-xs` (12/16); inputs `text-base sm:text-sm` (16px on
  phones to stop iOS zoom, 14px from 640px); card title `text-sm leading-6 font-medium`; modal heading
  `text-base font-medium`; modal body `text-sm leading-[1.43] text-muted`; prose headings
  `text-4xl/3xl/2xl/xl/lg/base font-semibold tracking-tight` (`H components/typography.css`).
- Astryx: base 14px, ratio 1.2 (`--font-size-sm` 12, `base` 14, `lg` 17, `xl` 20, `2xl` 24, `3xl` 29,
  `4xl` 35, `5xl` 42); `--text-label` 14 medium, `--text-body` 14 regular, `--text-supporting` 12
  regular, headings 1–6 = 24/20/17/14/12/10 semibold, display 1–3 = 42/35/29 regular; weights
  400/500/600/700. Neutral: Figtree, h3/h4 bold, and on `pointer: coarse` below `lg` the base becomes
  16px (`adaptations` in `AN`). Field labels are `text-secondary`.

**Recommendation:**

| Role                                   | Classes                                         | Size / line  | Weight | Follows                          |
| -------------------------------------- | ----------------------------------------------- | ------------ | ------ | -------------------------------- |
| Control label (button, tab, menu item) | `text-sm font-medium`                           | 14/20        | 500    | both                             |
| Small control (chip, tag, badge, sm segmented) | `text-xs font-medium`                   | 12/16        | 500    | both                             |
| Large control                          | `text-base font-medium`                         | 16/24        | 500    | HeroUI                           |
| Field value                            | `text-base pointer-fine:text-sm`                | 16 → 14      | 400    | HeroUI intent, Astryx's pointer rule |
| Field label                            | `text-sm font-medium text-on-surface`           | 14/20        | 500    | HeroUI (Astryx greys it)         |
| Description, helper                    | `text-xs text-on-surface-variant`               | 12/16        | 400    | both                             |
| Error                                  | `text-xs text-error`                            | 12/16        | 400    | both                             |
| Body in overlays and cards             | `text-sm text-on-surface-variant`               | 14/20        | 400    | both                             |
| Card title                             | `text-sm font-semibold text-on-surface`         | 14/20        | 600    | Astryx heading-4 size, HeroUI size |
| Dialog title                           | `text-base font-semibold`                       | 16/24        | 600    | HeroUI size, Astryx weight        |
| Headings 1–4                           | `text-2xl` / `text-xl` / `text-lg` / `text-base` `font-semibold tracking-tight` (tight only ≥ 20px) | 24/20/18/16 | 600 | Astryx scale, HeroUI tracking |
| Display                                | `text-4xl` … `text-6xl font-semibold tracking-tight` | 36–60    | 600    | HeroUI prose                      |

- Letter spacing 0 at 16px and below. The M3 tracking values (`0.0313em` on body-lg and so on) go.
- Weights 400/500/600 only; 700 is not used by either reference's controls.

### 1.8 Motion

What HeroUI does (`H`):

- **Press:** `transition: transform 250ms var(--ease-smooth), background-color 100ms var(--ease-out),
  box-shadow 100ms var(--ease-out)` with `--ease-smooth: ease`; pressed `scale(0.97)`.
- **Popovers, tooltips, menus:** enter `heroui-overlay-enter-90` 150ms `ease`: from `opacity: 0;
  transform: translate3d(0, ±0.25rem, 0) scale(0.9)` with the offset taken from `data-placement`;
  select, dropdown and combo-box use `-95` (scale 0.95). Exit `heroui-overlay-exit` 100ms: to
  `opacity: 0; scale(0.95)`. Opacity and transform only, no `filter` (`H base/overlay-motion.css`
  explains why). Origin `origin-(--trigger-anchor-point)`.
- **Modal:** backdrop fades in 150ms `ease-out`, out 100ms; dialog enters 250ms `--ease-out-quad`
  (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`) from `scale(1.05)` (desktop) or `translateY(0.25rem)
  scale(1.05)` (phones); exits 100ms to `scale(0.95)`.
- **Drawer:** 250ms in, 200ms out, `cubic-bezier(0.32, 0.72, 0, 1)` (`--ease-out-fluid`, "Apple
  style"); the backdrop uses the same curve.
- **Toggles:** switch track colour 250ms `ease`; thumb slides `inset-inline-start 300ms
  var(--ease-out-fluid)`. Checkbox: a `::before` fill scales `0.7 → 1` (100ms linear) and fades in
  (200ms); the checkmark draws with `stroke-dashoffset 150ms linear 15ms`. Radio: the inner disc
  shrinks from full size to `scale: 0.4286` (200ms `ease-out`), to `0.5714` while pressed.
- **Selection indicators:** tab and segment indicators slide `translate, width, height` over 250ms
  `--ease-out-fluid`.
- **Disclosure:** `height: var(--disclosure-panel-height)` + opacity, 200ms `--ease-out-quad` /
  `ease-out`; chevron rotates `-180deg` over 250ms. Field errors grow `height 350ms`, fade 150ms.
- **Toast:** enter from `-100%` of its own height 350ms `--ease-out-fluid`, exit 250ms; stacked
  toasts scale `1 - index × 0.05`.
- **Loops:** spinner `spin 0.75s linear`; skeleton shimmer `translateX(200%)` 2s linear; indeterminate
  progress `translateX(-100%) → 350%` 1.5s `cubic-bezier(0.65, 0, 0.35, 1)`.

What Astryx does (`A theme/tokens.stylex.ts`, `AN`): durations `fast` 175ms (Neutral 125ms), `fast-max`
230 (165), `medium` 410 (300), `medium-max` 550 (400); `--ease-standard: cubic-bezier(0.24, 1, 0.4, 1)`
for arrivals, `--ease-exit: cubic-bezier(0.3, 0, 0.6, 0.6)` for departures; popovers enter from
`translateY(∓8px) scale(0.95)` over `fast-max`; dialogs from `translate(0, 16px) scale(0.95)` over
`medium-max`; under reduced motion, transforms go and only an opacity fade remains on touch devices.

**Recommendation:**

| Token                | Value                                   | Use                                                              |
| -------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| `--ease-fluid`       | `cubic-bezier(0.32, 0.72, 0, 1)`        | sliding indicators, switch thumb, drawer, sheet, toast           |
| `--ease-out-quad`    | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`  | dialog enter, disclosure height                                  |
| `ease-out` (Tailwind)| `cubic-bezier(0, 0, 0.2, 1)`            | colour, border, shadow, background                               |
| `ease` (CSS keyword) | —                                       | press scale, popover enter and exit                              |
| Durations            | 100 / 150 / 200 / 250 / 300 / 350 ms    | colour · popover in, chevron · exit, accordion · press, dialog, indicators, drawer in · switch thumb, progress · toast in, field error |

The M3 `ease-standard`, `ease-emphasized-*` curves and the 300–350ms emphasized entrances go. Springs
from `lib/motion` stay only for gestures (sheet drag, toast swipe, avatar lift).

### 1.9 Neutral surfaces and sparing accent (Astryx)

How Astryx keeps it calm (`A theme/tokens.stylex.ts`, `AN`):

- **Four surface roles, all neutral.** `--color-background-body` (page: `#F1F4F7`; Neutral
  `neutral.light[95]` / `neutral.dark[10]`), `--color-background-surface` and `--color-background-card`
  (white; dark `#1F1F22`), `--color-background-popover` (white; dark `#28292C`, a step lighter than
  cards). White things sit on a grey page; in dark mode, raised things get **lighter**.
- **Translucent neutral fills** for every non-accent fill: `--color-neutral` (Neutral: black 6% /
  white 10%) for secondary buttons, badges, tokens, kbd, avatar fallback and segmented tracks;
  `--color-overlay-hover` 5% and `-pressed` 10% for interaction. They work on any surface.
- **Translucent borders**: `--color-border` black 8% / white 10% for hairlines,
  `--color-border-emphasized` (opaque, Neutral `neutral.light[85]` / `dark[35]`) for inputs and
  checkboxes.
- **Text hierarchy in grey**: `text-primary`, `text-secondary` (labels, descriptions, unselected tabs),
  `text-disabled`.
- **Status as pale fills**: `--color-<status>-muted` + `--color-on-<status>-muted` for banners and
  field status; strong fills only for badges and the destructive button. Neutral even turns the
  destructive button into a pale fill (`button: {'variant:destructive': {backgroundColor:
  'var(--color-error-muted)'}}`).
- **Accent appears only** on: the primary button, checked checkbox/radio/switch, slider fill and
  thumb, progress fill, the selected tab underline, the focus ring and the focused field border,
  accent links, selected list rows (`--color-accent-muted`, accent 20%). Unselected tabs and segments
  are grey text, not accent. (Neutral goes further and makes the accent itself near-black; we keep the
  seed colour.)

**For us:** page `bg-canvas`, cards and fields `bg-surface-raised`, overlays `bg-surface-overlay`;
neutral fills are `bg-neutral-soft`; the accent list above is the complete list of places where
`primary` paints something. HeroUI's liveliness comes from shape and motion, not from more colour.

---

## 2. Components

Each entry: what the references call their variants, the recommendation, sizes and radii, colours in
our roles (including the new roles from section 4), states and motion, and which reference it follows.
Shared pieces used below:

- `focus-ring`: 2px `outline-primary`, offset 2px, on `data-[focus-visible]`.
- `transition-control`: `scale 250ms ease, background-color 100ms ease-out, color 100ms ease-out,
  border-color 100ms ease-out, box-shadow 100ms ease-out` (HeroUI `.button`).
- `field-frame`: `rounded-field border border-outline-variant bg-surface-raised
  transition-[border-color,box-shadow,background-color] duration-150 ease-out
  data-[hovered]:inset-ring-2 data-[hovered]:inset-ring-outline-variant/30
  data-[focus-within]:border-primary data-[focus-within]:inset-ring-2 data-[focus-within]:inset-ring-primary/20
  data-[invalid]:border-error data-[invalid]:data-[focus-within]:inset-ring-error/20
  data-[disabled]:opacity-50` (Astryx `inputWrapperStyles`, translated).
- `overlay-panel`: `rounded-overlay bg-surface-overlay text-sm text-on-surface shadow-md outline-none
  origin-(--trigger-anchor-point)` + enter 150ms `ease` from `scale(0.95)` and a 4px placement offset,
  exit 100ms to `scale(0.95) opacity-0`.

### 2.1 Button

- **References:** HeroUI v3 `variant: primary | secondary | tertiary | outline | ghost | danger |
  danger-soft`, `size: sm | md | lg`, `isIconOnly`, `fullWidth` (`H src/components/button/button.styles.ts`).
  HeroUI v2 `variant: solid | bordered | light | flat | faded | shadow | ghost` × `color: default |
  primary | secondary | success | warning | danger`, `radius` (`H2 button.ts`). Astryx `variant: primary
  | secondary (default) | ghost | destructive`, `size: sm | md | lg`, `elevation: none | low | med |
  high`, `isIconOnly` (`A Button/Button.tsx`).
- **Recommended:** `variant: solid | soft | outline | ghost` × `tone: primary | neutral | error`,
  `size: sm | md | lg`, `fullWidth`. Default `solid`; `tone` defaults to `primary` for `solid` and to
  `neutral` for the others (section 3).
- **Sizes and radius:** table 1.2; `rounded-control` (pill). `min-w` not set.
- **Base:** `focus-ring transition-control no-tap-highlight relative inline-flex shrink-0
  cursor-pointer items-center justify-center rounded-control font-medium whitespace-nowrap select-none
  data-[pressed]:scale-[0.97] motion-reduce:data-[pressed]:scale-100
  data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50`.
- **Colours:**

  | variant × tone    | Classes                                                                                                                 |
  | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
  | solid · primary   | `bg-primary text-on-primary data-[hovered]:bg-primary-hover data-[pressed]:bg-primary-hover`                            |
  | solid · neutral   | `bg-inverse-surface text-inverse-on-surface data-[hovered]:bg-inverse-surface-hover`                                    |
  | solid · error     | `bg-error text-on-error data-[hovered]:bg-error-hover`, ring `outline-error`                                            |
  | soft · primary    | `bg-primary-soft text-on-primary-soft data-[hovered]:bg-primary-soft-hover`                                             |
  | soft · neutral    | `bg-neutral-soft text-on-surface data-[hovered]:bg-neutral-soft-hover`                                                  |
  | soft · error      | `bg-error-soft text-on-error-soft data-[hovered]:bg-error-soft-hover`, ring `outline-error`                             |
  | outline · neutral | `border border-outline-variant text-on-surface data-[hovered]:bg-neutral-soft`                                          |
  | outline · primary | `border border-primary/40 text-primary data-[hovered]:bg-primary-soft`                                                  |
  | outline · error   | `border border-error/40 text-error data-[hovered]:bg-error-soft`                                                        |
  | ghost · neutral   | `text-on-surface data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover`                                   |
  | ghost · primary   | `text-primary data-[hovered]:bg-primary-soft`                                                                           |
  | ghost · error     | `text-error data-[hovered]:bg-error-soft`                                                                               |

- **States:** pressed `scale-[0.98]` at `sm`, `0.97` at `md`, `0.96` at `lg`, colour 100ms, scale 250ms
  `ease`. Pending keeps today's behaviour (content fades out after 300ms, spinner in `currentColor`).
- **Follows:** HeroUI v3 recipe and motion; Astryx variant model and error-coloured ring; HeroUI v2
  heights.

### 2.2 Button group

- **References:** HeroUI `ButtonGroup` `horizontal | vertical`, `fullWidth`; buttons inside lose their
  radius except the outer corners (`rounded-s-3xl` / `rounded-e-3xl`), press scale is cancelled, the
  focused button gets `z-10`, `outline` buttons collapse the shared border (`border-e-0` / `border-s-0`
  / `border-x-0`), and a separator sits between items: `absolute inset-inline-start: -1px; top: 25%;
  width: 1px; height: 50%; rounded-sm bg-current opacity-15` (`H components/button-group.css`). Astryx
  has `ButtonGroup` (`A ButtonGroup/ButtonGroup.tsx`, not read for style).
- **Recommended:** `orientation`, `attached` (default) or `detached` (`gap-1`, every button keeps
  `rounded-control`, from HeroUI's `toggle-button-group--detached`); variant, tone and size flow down
  through context as today.
- **Classes:** group `inline-flex`; attached children `rounded-none data-[pressed]:scale-100
  first:rounded-s-control last:rounded-e-control data-[focus-visible]:z-10`; vertical uses
  `first:rounded-t-control last:rounded-b-control`. Separator element `pointer-events-none absolute
  inset-s-[-1px] top-1/4 h-1/2 w-px rounded-sm bg-current opacity-15`, hidden next to a selected or
  outline item.
- **Follows:** HeroUI.

### 2.3 Toggle button

- **References:** HeroUI `variant: default | ghost`, same sizes and press as Button; rest
  `--toggle-button-bg: var(--default)`, selected `bg-accent-soft text-accent-soft-foreground`, selected
  hover `accent-soft-hover` (`H components/toggle-button.css`). `ToggleButtonGroup` attached or
  `detached`, focus ring `ring-inset` in attached groups. Astryx `ToggleButton`: pressed state paints
  `--color-overlay-pressed` and turns the label semibold, with a hidden semibold copy reserving width
  so nothing shifts (`A ToggleButton/ToggleButton.tsx`).
- **Recommended:** `variant: soft | ghost`, `size: sm | md | lg`, `isIconOnly`.
- **Colours:** soft rest `bg-neutral-soft text-on-surface data-[hovered]:bg-neutral-soft-hover`; ghost
  rest `text-on-surface data-[hovered]:bg-neutral-soft`; both selected `data-[selected]:bg-primary-soft
  data-[selected]:text-on-primary-soft data-[selected]:data-[hovered]:bg-primary-soft-hover`.
- **States:** as Button; in an attached group `focus-ring` offset `-2px`.
- **Follows:** HeroUI. Astryx's neutral selected state (`bg-on-surface/10 font-semibold` with width
  reservation) is the calm alternative if accent-tinted toggles feel loud in toolbars.

### 2.4 Icon button

- **References:** HeroUI uses Button with `isIconOnly` (`w-10 p-0`, sm `w-9`, lg `w-11` on touch) and
  a separate `CloseButton`: `size-6 rounded-xl p-1 bg-default text-muted`, hover `bg-default-hover`,
  pressed `scale(0.93)`, icon `size-4` (`H components/close-button.css`). Astryx `IconButton` = Button
  `isIconOnly` with `aspectRatio: 1 / 1` (`A Button/Button.tsx`).
- **Recommended:** Button's `variant × tone`, default `ghost · neutral`; `size: xs | sm | md | lg` =
  28 / 32 / 40 / 48px (`size-7 … size-12`), icons 16 / 16 / 20 / 24px. `xs` exists for dense toolbars,
  table rows and inline close buttons (Astryx `sm` is 28px). Always circular; the `shape` prop goes.
- **Close buttons** (dialog, toast, tag, banner) are `IconButton ghost neutral xs` with
  `data-[pressed]:scale-[0.93]` (HeroUI `CloseButton`).
- **Follows:** HeroUI shape and press, Astryx's 28px size.

### 2.5 Copy button

- **References:** neither HeroUI nor Astryx has one.
- **Recommended (inferred):** `IconButton ghost neutral` (`sm` default), or a `soft · neutral sm`
  Button when it shows a label. On success the copy glyph cross-fades to a check: outgoing
  `scale-50 opacity-0`, incoming from `scale-50 opacity-0` to `scale-100 opacity-100`, 150ms `ease-out`;
  the check is `text-success`; it reverts after 2s. Announce through the existing labels.
- **Follows:** inferred, built from HeroUI press and Astryx's 150ms micro-transition band.

### 2.6 FAB

- **References:** HeroUI has none. Astryx gives Button an `elevation` prop "for floating buttons (e.g.
  a FAB)" mapping to `--shadow-low/med/high` (`A Button/Button.tsx`, `elevationStyles`). EasyUI's
  `FloatingActionDock` (MIT) floats on `rounded-2xl`, `backdrop-blur-md` and
  `shadow-[0_12px_32px_rgba(0,0,0,0.5)]` with hard-coded hex colours, so only the idea transfers.
- **Recommended:** `tone: primary | neutral`, `size: md | lg` = 48 / 56px (`size-12` / `size-14`,
  icon 20 / 24px), `extended` with a label (`h-12 px-5 gap-2 text-sm` / `h-14 px-6 gap-2 text-base`),
  `rounded-control`. The M3 `secondary | tertiary | surface` colours and squircle corners go.
- **Colours:** primary `bg-primary text-on-primary data-[hovered]:bg-primary-hover`; neutral
  `bg-surface-overlay text-on-surface data-[hovered]:bg-surface-overlay-hover`.
- **States:** `shadow-sm`, hovered `shadow-lg`, pressed `scale-[0.96]`; enter `scale-90 opacity-0 →
  1` over 150ms `ease` (inferred, the popover enter).
- **Follows:** Astryx elevation, HeroUI shape and press.

### 2.7 Link

- **References:** HeroUI `.link`: `font-medium text-link no-underline decoration-[1.5px]
  underline-offset-4`, where `--link: var(--foreground)` (links are **neutral**); hover `underline
  decoration-muted/50`, pressed `decoration-muted`; trailing icon `size-[0.75em] opacity-60`, 100 on
  hover; `rounded-xl` so the focus ring is soft (`H components/link.css`). Astryx `Link` colours
  `primary | secondary | accent | inherit | disabled | placeholder`, inherits size unless `standalone`
  (14px body), transitions colour over `--duration-fast` (`A Link/Link.tsx`).
- **Recommended:** `tone: neutral | primary | inherit` (default `neutral`, as both references),
  `standalone` (body size, no underline until hover). Inline links stay underlined at rest for
  WCAG 1.4.1 (inferred): `underline decoration-outline-variant decoration-[1.5px] underline-offset-4
  data-[hovered]:decoration-current`. Standalone: `no-underline data-[hovered]:underline`.
- **Colours:** neutral `text-on-surface`, primary `text-primary`; external icon
  `text-on-surface-variant` 60% → 100%.
- **States:** `focus-ring rounded-sm`, `transition-[color,text-decoration-color] duration-100`,
  disabled `opacity-50`.
- **Follows:** HeroUI (neutral default), Astryx tones.

### 2.8 Field parts (label, description, error, necessity)

- **References:** HeroUI `.label` `text-sm font-medium text-foreground`, required
  `after:ms-0.5 after:text-danger after:content-['*']`, invalid label `text-danger`; `.description`
  `text-xs text-muted`; `.field-error` `text-xs text-danger` that grows `height 350ms` and fades
  `opacity 150ms`; the description hides while the field is invalid; parts stack with `gap-1`
  (`H components/label.css`, `description.css`, `field-error.css`, `textfield.css`). Astryx
  `FieldLabel` 14px medium `text-secondary`, optional/required marker 12px regular, description 12px
  secondary; `FieldStatus` 12px in `--color-on-<status>-muted`, `Field` gap `--spacing-1`
  (`A Field/FieldLabel.tsx`, `FieldStatus/FieldStatus.tsx`, `Field/Field.tsx`).
- **Recommended:** label `text-sm font-medium text-on-surface`; required asterisk `ms-0.5 text-error`;
  description `text-xs text-on-surface-variant`; error `text-xs text-error` with the HeroUI height and
  fade; counter `text-xs text-on-surface-variant tabular-nums`; stack `flex flex-col gap-1`; the label
  does not turn red (only the frame and the message do; inferred, calmer than HeroUI).
- **Follows:** HeroUI sizes, Astryx spacing.

### 2.9 Text field

- **References:** HeroUI `variant: primary | secondary`: primary `rounded-field bg-field px-3 py-2
  text-base sm:text-sm shadow-field`, no border, hover `bg-field-hover` + border mix, focus
  `ring-2 ring-focus` + `--field-border-focus`, invalid `outline-1 outline-danger`; secondary is
  `bg-default` with no shadow (`H components/input.css`, `input-group.css`). Astryx one look: 1px
  `border-emphasized`, `bg-surface`, `--radius-element`, padding 4px × 8px, hover inset 2px ring, focus
  `border-accent` + inset 2px `accent-muted`, status borders `warning | error | success`
  (`A Field/inputStyles.stylex.ts`).
- **Recommended:** `variant: outline (default) | soft`, `size: sm | md | lg` (32/40/48px).
- **Classes:** group `field-frame flex h-10 items-center gap-2 px-3 text-on-surface`; input `min-w-0
  flex-1 bg-transparent text-base outline-none placeholder:text-on-surface-variant
  pointer-fine:text-sm`; prefix/suffix `text-on-surface-variant [&_svg]:size-4`. `soft`: `border-transparent
  bg-neutral-soft data-[hovered]:bg-neutral-soft-hover`, same focus border.
- **Status:** `invalid` uses `error`; a `success`/`warning` status border is Astryx-only and not
  recommended until a component needs it.
- **Follows:** Astryx frame and focus, HeroUI padding, radius and type.

### 2.10 Text area

- **References:** HeroUI `.textarea` = input recipe with `min-height: 38px`, `resize: vertical`
  (`H components/textarea.css`); Astryx `TextArea` shares `inputWrapperStyles`.
- **Recommended:** `field-frame min-h-20 px-3 py-2 text-base pointer-fine:text-sm resize-y`; counter
  inside the description row.
- **Follows:** both.

### 2.11 Search field

- **References:** HeroUI `.search-field__group` `h-9 rounded-field`, search icon `ms-3 size-4
  text-field-placeholder`, input `ps-2`, clear button `me-2 size-5` with a `size-3` glyph, hidden while
  empty (`pointer-events-none opacity-0`) (`H components/search-field.css`).
- **Recommended:** `field-frame h-10 gap-2 px-3`; leading icon `size-4 text-on-surface-variant`;
  clear `IconButton ghost neutral` at `size-6` with a 14px glyph, `group-data-[empty]:pointer-events-none
  group-data-[empty]:opacity-0 transition-opacity duration-150`; `soft` variant for search bars in
  headers.
- **Follows:** HeroUI.

### 2.12 Password field

- **References:** neither has a dedicated component; HeroUI's `InputGroup` suffix pattern
  (`.input-group__suffix` `px-3 text-field-placeholder`) is how it is built.
- **Recommended:** text field with `pe-1` and a trailing `IconButton ghost neutral xs` that swaps the
  eye glyph (same cross-fade as the copy button); the button's accessible name toggles through labels.
- **Follows:** HeroUI input-group pattern; inferred details.

### 2.13 Number field

- **References:** HeroUI `.number-field__group` `grid h-9 rounded-field`, columns `40px 1fr 40px` when
  both steppers exist; steppers `h-full w-10`, separated by `border-s` / `border-e
  border-field-placeholder/15`, pressed `bg-field-foreground/10 scale(0.97)`, icon `size-4`; input
  `tabular-nums` (`H components/number-field.css`). BoardUI's `NumberField` (MIT) uses RAC steppers
  with `slot="decrement" | "increment"` (`libraries.json`).
- **Recommended:** `field-frame grid h-10 grid-cols-[2.5rem_1fr_2.5rem] overflow-hidden`; steppers
  `flex h-full w-10 cursor-pointer items-center justify-center text-on-surface
  data-[hovered]:bg-neutral-soft data-[pressed]:bg-neutral-soft-hover` with `border-e
  border-outline-subtle` / `border-s border-outline-subtle`; input `px-3 text-center tabular-nums`
  (centred: inferred). `variant: outline | soft` as the text field; the M3 `shape: field | pill` goes.
- **Follows:** HeroUI.

### 2.14 Checkbox

- **References:** HeroUI `.checkbox__control` `size-4 rounded-md border bg-field shadow-field`, the
  `::before` fill `scale-70 opacity-0 bg-accent` → selected `scale-100 opacity-100`, hover
  `border-field-border-hover` and `bg-accent-hover`, checkmark `size-2.5 stroke-[2.5px]`, label row
  `gap-3 text-sm font-medium`, description `ps-7 text-xs text-muted` (`H components/checkbox.css`).
  Astryx `CheckboxIndicator` box sm 20 / md 24px, `--radius-inner`, 1px `border-emphasized` on
  `background-surface`; checked `bg-accent border-accent`; hover mixes 20% (border) / 15% (fill) of
  `--color-tint-hover`; disabled `opacity-0.5`, unchecked disabled `bg-muted`
  (`A Indicator/CheckboxIndicator.tsx`).
- **Recommended:** `size: sm | md` = 16 / 18px boxes (18px is inferred, between the two references),
  `rounded-md`.
- **Classes:** box `relative flex size-[18px] shrink-0 items-center justify-center rounded-md border
  border-outline bg-surface-raised text-on-primary transition-[border-color] duration-200 ease-out
  before:absolute before:inset-[-1px] before:rounded-[inherit] before:bg-primary before:opacity-0
  before:scale-70 before:transition-[scale,opacity] before:duration-[100ms,200ms]
  group-data-[selected]:border-primary group-data-[selected]:before:scale-100
  group-data-[selected]:before:opacity-100` (the same three classes again under
  `group-data-[indeterminate]:`) `group-data-[hovered]:border-on-surface-variant group-data-[hovered]:before:bg-primary-hover
  group-data-[pressed]:scale-95 group-data-[invalid]:border-error
  group-data-[invalid]:before:bg-error`; glyph `relative size-3` drawn with `stroke-dashoffset` 150ms
  linear 15ms. Row `group flex items-start gap-3 text-sm text-on-surface`; description
  `ps-[30px] text-xs text-on-surface-variant`.
- **Follows:** HeroUI motion, Astryx border model.

### 2.15 Radio group

- **References:** HeroUI `.radio__control` `size-4 rounded-lg` (a circle) with the inner
  `::before` covering it in `bg-field`; selected control `bg-accent` and the disc becomes
  `bg-accent-foreground` at `scale: 0.4286`, `0.5714` while pressed, control `scale-95` while pressed
  (`H components/radio.css`). Astryx `RadioIndicator` 20 / 24px circle, 1px `border-emphasized`, dot
  8 / 10px (`A Indicator/RadioIndicator.tsx`).
- **Recommended:** 18px circle (inferred), `orientation` as today.
- **Classes:** control `relative size-[18px] rounded-full border border-outline bg-surface-raised
  transition-[background-color,border-color,scale] duration-200 ease-out group-data-[hovered]:border-on-surface-variant
  group-data-[pressed]:scale-95 group-data-[selected]:border-primary group-data-[selected]:bg-primary`;
  disc `before:absolute before:inset-0 before:rounded-full before:bg-surface-raised
  before:transition-[scale,background-color] before:duration-200 before:ease-out
  group-data-[selected]:before:bg-on-primary group-data-[selected]:before:scale-[0.43]
  group-data-[selected]:group-data-[pressed]:before:scale-[0.57]`.
- **Follows:** HeroUI (the shrinking disc is its liveliest detail).

### 2.16 Switch

- **References:** HeroUI `size: sm | md | lg`: tracks 32×16, 40×20, 48×24px; thumbs 16.5×12,
  22×16, 27.5×20px (wider than tall), `ms-0.5`, `rounded-xl`; off `bg-default`, hover 20% more
  transparent, on `bg-accent`, on-hover `accent-hover`; thumb `bg-white` off, `bg-accent-foreground` on
  with `0 0 5px rgb(0 0 0 / .02), 0 2px 10px rgb(0 0 0 / .06), 0 0 1px rgb(0 0 0 / .3)`; thumb moves
  `inset-inline-start 300ms --ease-out-fluid`, track colour 250ms; disabled on-thumb `opacity: 0.4`
  (`H components/switch.css`). Astryx `size: sm | md`: tracks 32×20, 40×24px, round thumbs 14→16 and
  16→20px that **grow** when on; off `background-gray` (Neutral: `border-emphasized`), on accent
  (`A Switch/Switch.tsx`, `AN`).
- **Recommended:** our `md` = HeroUI `lg` geometry (track `h-6 w-12`, thumb `h-5 w-7`), `sm` = HeroUI
  `md` (track `h-5 w-10`, thumb `h-4 w-[22px]`). 40px rows want the 24px track.
- **Classes:** track `relative flex shrink-0 items-center rounded-full bg-outline-variant
  transition-colors duration-250 group-data-[hovered]:bg-outline-variant/80
  group-data-[selected]:bg-primary group-data-[selected]:group-data-[hovered]:bg-primary-hover
  group-data-[focus-visible]:outline-2 group-data-[focus-visible]:outline-offset-2
  group-data-[focus-visible]:outline-primary`; thumb `ms-0.5 h-5 w-7 rounded-full bg-surface-thumb
  shadow-xs transition-[margin-inline-start,background-color] duration-300 ease-fluid
  group-data-[selected]:ms-[calc(100%-1.75rem-0.125rem)] group-data-[selected]:bg-on-primary
  group-data-[selected]:shadow-sm`. Label row `gap-3 text-sm`; description `ps-[calc(3rem+0.75rem)]`.
- **Follows:** HeroUI. Off-track colour follows Astryx Neutral (an opaque mid-grey, not a 6% tint, so
  the off state is visible).

### 2.17 Slider

- **References:** HeroUI: track `h-5 rounded-xl bg-default` with `border-x-[0.75rem]
  border-x-transparent` so the thumb centre reaches both ends; fill `bg-accent`; thumb `w-7` (28px)
  `h-full rounded-xl bg-accent` holding a `24×16px rounded-lg bg-accent-foreground shadow-field` knob
  that shrinks to `scale-[0.9]` while dragging; label and output `text-sm font-medium tabular-nums`;
  step dots `size-[3px] bg-muted/25` (`H components/slider.css`). Astryx: 4px `--color-track` rail, 20px
  round `bg-accent` thumb, `--radius-full` everywhere (`A Slider/Slider.tsx`).
- **Recommended:** HeroUI geometry, because the fat track and pill knob are HeroUI's signature shape:
  track `relative h-5 rounded-full bg-neutral-soft border-x-[0.75rem] border-x-transparent`; fill
  `absolute h-full bg-primary` (and `border-s-primary` on the start cap); thumb `absolute top-1/2 flex
  h-5 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-primary
  after:h-4 after:w-6 after:rounded-full after:bg-on-primary after:shadow-xs after:transition-[scale]
  data-[dragging]:after:scale-[0.9] data-[focus-visible]:focus-ring`. Header grid `label | output`,
  `text-sm font-medium`, output `tabular-nums text-on-surface-variant`.
- **Alternative:** Astryx's 4px rail with a 20px thumb is calmer; worth a look in a dense admin form
  before committing.
- **Follows:** HeroUI.

### 2.18 List box

- **References:** HeroUI `.list-box` `p-1`, items `mt-1` apart; `.list-box-item` `min-h-9 gap-3
  rounded-2xl px-2 py-1.5`, hover `bg-default`, pressed `scale(0.98)`, selected shows a checkmark
  (`end-2 size-4`) and no fill, `--danger` items `text-danger` (`H components/list-box.css`,
  `list-box-item.css`). Astryx `Item`: `--radius-element`, inline inset 8–12px, block padding 4/8/12px,
  hover `--color-overlay-hover`, selected `--color-accent-muted`, label 14px, description 12px secondary
  (`A Item/Item.tsx`).
- **Recommended:** `variant: plain | outline` (outline = standalone container `rounded-container
  border border-outline-subtle bg-surface-raised p-1`); items `relative flex min-h-9 cursor-pointer
  items-center gap-2.5 rounded-item px-2.5 py-1.5 text-sm text-on-surface outline-none
  transition-[background-color,scale] duration-100 data-[focused]:bg-neutral-soft
  data-[pressed]:scale-[0.98] data-[disabled]:opacity-50`; selected: trailing check `size-4
  text-primary`; in the standalone variant also `data-[selected]:bg-primary-soft` (Astryx accent-muted).
  Description `text-xs text-on-surface-variant`. Items `gap-0.5` apart (Astryx 2px; HeroUI 4px).
- **Follows:** HeroUI shape and press, Astryx selection fill.

### 2.19 Select

- **References:** HeroUI `variant: primary | secondary`; trigger = field recipe `min-h-9 px-3 py-2
  pe-7`, chevron `absolute end-2 size-4 text-field-placeholder` rotating `180deg` (150ms) when open,
  placeholder `text-field-placeholder`; popover `min-w-(--trigger-width) bg-overlay` 22px radius,
  `shadow-overlay`, list `p-1.5`, enter `scale(0.95)` 150ms `ease` from the placement side, exit 100ms
  (`H components/select.css`). Astryx `Selector` (`A Selector/Selector.tsx`).
- **Recommended:** `variant: outline | soft`, `size: sm | md | lg`. Trigger `field-frame flex h-10
  w-full cursor-pointer items-center gap-2 ps-3 pe-9 text-start text-base pointer-fine:text-sm`,
  which also takes the focused frame while `data-[open]`; value placeholder `text-on-surface-variant`;
  chevron `pointer-events-none absolute inset-e-3 size-4 text-on-surface-variant transition-transform
  duration-150 group-data-[open]:rotate-180`. Popover `overlay-panel min-w-(--trigger-width) p-1`,
  items as List box.
- **Follows:** HeroUI.

### 2.20 Combo box

- **References:** HeroUI `.combo-box`: input field with `pe-7`, trigger `absolute end-0 h-full pe-2
  text-field-placeholder`, hover `text-field-foreground`; popover as Select (22px)
  (`H components/combo-box.css`). Astryx `Typeahead` (`A Typeahead/Typeahead.tsx`).
- **Recommended:** text-field frame with `pe-1`; trigger `IconButton ghost neutral xs`
  (`text-on-surface-variant data-[hovered]:text-on-surface`), chevron rotates when open; popover as
  Select; empty and loading rows `px-2.5 py-2 text-sm text-on-surface-variant`.
- **Follows:** HeroUI.

### 2.21 Tabs

- **References:** HeroUI `variant: primary | secondary`, `align: start | center | end`. Primary is a
  pill strip: container `bg-default` radius `calc(var(--radius) * 2.5)` (20px), list `p-1`, tab `h-8
  rounded-3xl px-4 text-sm font-medium text-muted`, selected `text-segment-foreground`, unselected hover
  `opacity-70`, indicator `absolute inset-0 rounded-3xl bg-segment shadow-surface` sliding `translate,
  width, height` over 250ms `--ease-out-fluid`, 1px separators `bg-muted/25` between unselected tabs.
  Secondary is an underline: list `border-b border-border`, indicator `h-0.5 bg-accent`
  (`H components/tabs.css`). Astryx `TabList` is underline only: tab height `--size-element-*`, `px-3`,
  label 14px regular `text-secondary` → selected `text-primary` semibold (with a hidden semibold sizer),
  hover background in `--radius-element`, indicator `2px` `--radius-full` `bg-accent`, list gap 2px,
  `border-bottom 1px` (`A TabList/Tab.tsx`, `TabList.tsx`).
- **Recommended:** `variant: underline (default) | pill`; segmented value-switching belongs to
  SegmentedControl. Underline: list `relative flex gap-0.5 border-b border-outline-subtle`; tab `relative
  flex h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium
  text-on-surface-variant transition-colors duration-150 data-[hovered]:bg-neutral-soft
  data-[selected]:text-on-surface`; indicator `absolute -bottom-px h-0.5 rounded-full bg-primary`
  sliding over 250ms `ease-fluid`. Pill: list `inline-flex h-10 rounded-control bg-neutral-soft p-1`;
  tab `h-8 rounded-control px-4`; indicator `bg-surface-segment shadow-xs`.
- **Follows:** Astryx for the default (calm, accent only on the 2px line), HeroUI for the pill and the
  sliding indicator.

### 2.22 Segmented control

- **References:** HeroUI has none; its primary Tabs and `ToggleButtonGroup` cover it. Astryx
  `SegmentedControl`: track `bg-neutral` (translucent), padding 2px (Neutral 4px), gap 2px, radius
  `--radius-element`, concentric item radius; items `--size-element-* - 4px` (Neutral `- 8px`), `px-3`
  (`sm` `px-2` and 12px text), 14px medium `text-secondary`; selected `text-primary` semibold,
  `bg-surface`, `shadow-low` (Neutral: no shadow, "the selected item stays flat against the tinted
  track"); icons 14/16/18px (`A SegmentedControl/*.tsx`, `AN`).
- **Recommended:** `size: sm | md | lg` = tracks 32 / 40 / 48px; track `relative inline-flex h-10
  items-center gap-0.5 rounded-control bg-neutral-soft p-1`; item `relative z-[1] h-8 cursor-pointer
  rounded-control px-3 text-sm font-medium text-on-surface-variant transition-colors duration-150
  data-[selected]:text-on-surface`; indicator `absolute rounded-control bg-surface-segment shadow-xs`
  sliding `translate, width` over 250ms `ease-fluid`; `sm` items `h-6 px-2.5 text-xs`, `lg` `h-10
  text-base`.
- **Follows:** Astryx structure and colours, HeroUI pill shape and sliding indicator.

### 2.23 Card

- **References:** HeroUI `variant: transparent | default | secondary | tertiary` (`bg-surface`,
  `bg-surface-secondary`, `bg-surface-tertiary`), `p-4 gap-3`, radius 24px, `shadow-surface` (none in
  dark), title `text-sm leading-6 font-medium`, description `text-sm leading-5 text-muted`
  (`H components/card.css`). Astryx `variant: default | transparent | muted | <colour>`: only `default`
  draws a 1px `--color-border`, `elevation: none | low | med | high`, radius `--radius-container`,
  padding 16px (Neutral 12px) (`A Card/Card.tsx`, `AN`).
- **Recommended:** `variant: outline (default) | elevated | soft | transparent`, `padding: sm | md |
  lg` = 12 / 16 / 24px.
- **Classes:** `flex flex-col gap-3 rounded-container bg-surface-raised p-4 text-on-surface`; outline
  `border border-outline-subtle`; elevated `shadow-sm`; soft `bg-neutral-soft`; transparent `bg-transparent`.
  Pressable cards add `focus-ring cursor-pointer transition-[box-shadow,scale] duration-150
  data-[hovered]:shadow-md data-[pressed]:scale-[0.99]` (scale inferred). Title `text-sm
  font-semibold`, description `text-sm text-on-surface-variant`, footer `flex items-center gap-2`.
- **Follows:** Astryx variants and border, HeroUI padding, gap and title sizes; radius is the 20px
  family.

### 2.24 Divider

- **References:** HeroUI `.separator` `h-px w-full bg-separator` (vertical `w-px self-stretch`),
  `variant: default | secondary | tertiary` getting stronger (`H components/separator.css`). Astryx
  `Divider` `subtle` (`--color-border`) or `strong` (`--color-border-emphasized`), optional label
  `px-3` 12px `text-secondary`, full-bleed option (`A Divider/Divider.tsx`).
- **Recommended:** `variant: subtle (default) | strong` = `bg-outline-subtle` / `bg-outline-variant`;
  `h-px w-full` or `w-px self-stretch`; label `px-3 text-xs text-on-surface-variant`.
- **Follows:** Astryx.

### 2.25 Disclosure and accordion

- **References:** HeroUI `.accordion` items separated by a 1px `::after` line (`bg-separator`), trigger
  `px-4 py-4 text-sm font-medium`, hover `color-mix(in oklab, var(--foreground) 3%, transparent)`,
  chevron `size-4 text-muted` `-rotate-180` over 250ms, panel `height: var(--disclosure-panel-height)`
  200ms `--ease-out-quad` + opacity 200ms, body `px-4 pb-4 text-muted`; `surface` variant `bg-surface`
  24px with separators inset to 94% (`H components/accordion.css`, `disclosure.css`). Astryx
  `Collapsible`: chevron rotates over `--duration-fast` `--ease-standard` (`A Collapsible/Collapsible.tsx`).
- **Recommended:** `variant: plain | surface`. Item `border-b border-outline-subtle last:border-b-0`;
  trigger `flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-start
  text-sm font-medium transition-colors duration-150 data-[hovered]:bg-neutral-soft
  data-[focus-visible]:focus-ring` (offset −2px); chevron `size-4 text-on-surface-variant
  transition-transform duration-250 group-data-[expanded]:-rotate-180`; panel
  `h-(--disclosure-panel-height) overflow-clip opacity-0 transition-[height,opacity] duration-200
  ease-out-quad data-[expanded]:opacity-100`; body `px-4 pb-4 text-sm text-on-surface-variant`.
  Surface: `rounded-container border border-outline-subtle bg-surface-raised`, separators `mx-4`.
- **Follows:** HeroUI.

### 2.26 Dialog

- **References:** HeroUI modal: backdrop `bg-backdrop` (`rgba(0,0,0,.5)`, dark `.6`) or `blur`
  (`backdrop-blur-md`, turned off on coarse pointers) or `transparent`; container `p-4 sm:p-10`;
  dialog `bg-overlay shadow-overlay p-6` radius 24px; `size: xs | sm | md | lg | cover | full` =
  `max-w-xs … max-w-lg`; placement `auto` (bottom on phones, centred from `sm`); heading `text-base
  font-medium`; body `text-sm leading-[1.43] text-muted`; footer `flex justify-end gap-2`; spacing
  header→body `mt-2`, →footer `mt-5`; close `absolute end-4 top-4`; motion in 1.8
  (`H components/modal.css`). Astryx `Dialog`: `bg-surface`, `--radius-container`, `shadow-high`,
  backdrop `--color-overlay` (`#01122866` / `#11111299`), enter from `translate(0, 16px) scale(0.95)`
  over `--duration-medium-max`, full screen on phones (`A Dialog/Dialog.tsx`).
- **Recommended:** `size: sm | md (default) | lg | xl | full` = 384 / 448 / 512 / 672px / viewport
  (`xl` inferred). Backdrop `fixed inset-0 z-50 flex items-end justify-center bg-backdrop p-4
  sm:items-center sm:p-10`, fade 150 / 100ms. Panel `relative flex w-full max-w-md flex-col
  rounded-dialog bg-surface-overlay p-6 text-on-surface shadow-lg outline-none`; title `text-base
  font-semibold`; body `mt-2 text-sm text-on-surface-variant`; footer `mt-5 flex justify-end gap-2`;
  close `IconButton ghost neutral sm` at `absolute inset-e-4 top-4`. Enter 250ms `ease-out-quad` from
  `scale(1.05) opacity-0` (plus `translate-y-1` below `sm`), exit 100ms to `scale(0.95) opacity-0`.
- **Follows:** HeroUI.

### 2.27 Alert dialog

- **References:** HeroUI alert dialog = modal recipe plus an icon `size-10 rounded-3xl` with
  `status: default | accent | success | warning | danger` → `bg-default text-foreground`,
  `bg-accent-soft text-accent-soft-foreground`, and so on; icon glyph `size-5`
  (`H components/alert-dialog.css`). Astryx `AlertDialog` (`A AlertDialog/AlertDialog.tsx`).
- **Recommended:** Dialog at `size sm`, plus `tone: neutral | primary | success | warning | error`
  for the icon: `flex size-10 items-center justify-center rounded-full bg-{tone}-soft
  text-on-{tone}-soft [&_svg]:size-5` (neutral `bg-neutral-soft text-on-surface`). A destructive
  confirm is `Button solid error`; cancel is `soft neutral`.
- **Follows:** HeroUI.

### 2.28 Sheet and drawer

- **References:** HeroUI `Drawer` `placement: bottom | top | left | right`: bottom `max-h-[85vh]`
  top corners 16px, sides `h-full w-80 max-w-[85vw] sm:w-96` square, `p-6`, handle `h-1 w-9 rounded-xs
  bg-separator` with `pb-2`, motion 250 / 200ms `cubic-bezier(0.32, 0.72, 0, 1)`
  (`H components/drawer.css`); `Sheet` adds `detached` (`m-2 rounded-2xl`) and snap points, sides
  `w-[min(24rem,96vw)]` (`H components/sheet.css`). Astryx `BottomSheet`: `max-w 640`, `bg-surface`,
  1px border on top and sides, top corners `--radius-container`, `shadow-high`, handle
  `--size-element-lg` × 4px (36×4) `rounded-full bg-border`; `Drawer`: full height, 1px border on the
  inner edge, `shadow-high`, slides over `--duration-medium` (`A BottomSheet/BottomSheetPanel.tsx`,
  `Drawer/Drawer.tsx`). EasyUI `Sheet` (MIT) dismisses a drag past 96px or 500px/s
  (`libraries.json`).
- **Recommended:** keep `side` and `modal | standard`; bottom `max-h-[85dvh] w-full rounded-t-dialog
  bg-surface-overlay p-6 shadow-lg sm:mx-auto sm:max-w-xl`, handle `mx-auto mb-2 h-1 w-9
  rounded-full bg-outline-variant`; sides `h-dvh w-80 max-w-[85vw] sm:w-96 bg-surface-overlay p-6
  shadow-lg` with `border-s border-outline-subtle` (end) or `border-e` (start); `detached` `m-2
  h-[calc(100dvh-1rem)] rounded-dialog`. Motion 250 / 200ms `ease-fluid`, backdrop on the same curve;
  drag thresholds from EasyUI (96px, 500px/s).
- **Follows:** HeroUI motion and detached option, Astryx edges; the 24px top corner (so a dialog that
  turns into a sheet on a phone keeps its corners) is inferred.

### 2.29 Popover

- **References:** HeroUI `.popover` `bg-overlay text-sm shadow-overlay` radius 24px, body `p-4`,
  heading `font-medium`, arrow `fill: var(--overlay)`, enter `scale(0.9)` 150ms, exit 100ms
  (`H components/popover.css`). Astryx `bg-popover`, `--radius-container`, `shadow-low`, padding prop
  default 12px, enter `translateY(∓8px) scale(0.95)` over `--duration-fast-max`
  (`A Popover/usePopover.tsx`, `Layer/layerAnimations.stylex.ts`).
- **Recommended:** `overlay-panel` + `p-4` (`padding: sm | md` = 12 / 16px); title `text-sm
  font-semibold`; arrow `fill-surface-overlay`; enter `scale(0.9)` like HeroUI for popovers (lists use
  0.95).
- **Follows:** HeroUI motion, our 16px overlay radius.
- **Morph option (2026-11-08):** `animation="morph"` unfolds a separate surface from React Aria's
  resolved trigger anchor in 250ms and closes in 150ms. Content fades and translates without
  scaling. Reduced motion fades the whole panel; disabled motion is immediate. The default
  `scale` option is unchanged. `PopoverPreviewTrigger` provides non-modal hover/focus/long-press
  previews with 300ms open and 200ms close delays; content must not steal focus on hover.
  See the [morph popover study](popover-morph.md) for references and implementation decisions.

### 2.30 Tooltip

- **References:** HeroUI tooltip is **light**: `max-w-xs bg-overlay p-2 text-xs` radius 12px,
  `shadow-overlay`, enter `scale(0.9)` 150ms, delays `--tooltip-delay: 1500ms`,
  `--tooltip-close-delay: 500ms` (`H components/tooltip.css`, `themes/default/variables.css`). Astryx
  tooltip is **inverted**: `backgroundColor: --color-text-primary`, `color: --color-background-surface`,
  `--radius-container`, body 14px, padding 4px × 8px, `maxWidth: 300` (`A Tooltip/useTooltip.tsx`).
- **Recommended:** inverted (Astryx; it reads on white overlays and cards): `max-w-xs rounded-xl
  bg-inverse-surface px-2.5 py-1.5 text-xs text-inverse-on-surface shadow-md`, arrow
  `fill-inverse-surface`; HeroUI enter and exit. Keep RAC's default delays (the same 1500 / 500ms
  HeroUI ships); shorten only if the owner wants.
- **Follows:** Astryx colour, HeroUI motion.

### 2.31 Menu and dropdown

- **References:** HeroUI `.dropdown__popover` `min-width: min(calc(var(--spacing) * 55), 100%,
  calc(100svw - 2rem))` (220px), radius 22px, `shadow-overlay`, enter `scale(0.9)`; `.menu` `flex
  flex-col gap-1 p-1`; `.menu-item` `min-h-9 gap-3 rounded-2xl px-2 py-1.5`, hover `bg-default`,
  pressed `scale(0.98)`, selection indicator at `start-2` with the item padded `ps-7`, submenu chevron
  `end-2 size-3`, `danger` items `text-danger`; separators `ms-[3%] w-[94%]` (`H components/dropdown.css`,
  `menu.css`, `menu-item.css`). Astryx `DropdownMenu` padding 4px, gap 2px, `--radius-container`;
  items are `Item` (`A DropdownMenu/DropdownMenu.tsx`).
- **Recommended:** popover `overlay-panel min-w-56 max-w-[calc(100vw-2rem)] p-1`; menu `flex flex-col
  gap-0.5 outline-none`; item as List box item plus `tone: neutral | error` (`text-error
  data-[focused]:bg-error-soft`), selection indicator `inset-s-2.5 size-4 text-primary` with `ps-8`,
  shortcut `ms-auto text-xs text-on-surface-variant`, submenu chevron `ms-auto size-3.5
  text-on-surface-variant rtl:-scale-x-100`; section header `px-2.5 pt-2 pb-1 text-xs font-medium
  text-on-surface-variant`; separator `mx-2 my-1 h-px bg-outline-subtle`.
- **Follows:** HeroUI.

### 2.32 Toast

- **References:** HeroUI `variant: default | accent | success | warning | danger`, `placement: bottom |
  top` (and start/end): `bg-surface px-4 py-3 shadow-overlay` radius 24px, grid `[auto_1fr_auto]`,
  icon `size-4` coloured, title `text-sm font-medium` coloured, description `text-sm text-muted`,
  close button appears on hover at `-end-1 -top-1 size-5`; stack of 3 visible, 12px gap, each behind
  scaled `1 - i × 0.05`, expanding on hover; width 460px; timeout 4000ms; enter 350ms / exit 250ms
  `--ease-out-fluid` (`H components/toast.css`, `H-react toast/constants.ts`). Astryx: `width: 400`,
  `p-4`, `--radius-container`, `shadow-med`, `default` **inverted** background, `error` on
  `--color-background-error-inverted`; a list with 8px gaps, no overlap, entering via `@starting-style`
  (`A Toast/Toast.tsx`, `ToastViewport.tsx`). Bencho `ToastStack` (MIT): `peek` 14px, `gap` 10px,
  `scale: 1 - d * 0.05`, spring `{stiffness: 380, damping: 34, mass: 1}`, opens on hover or focus
  (`blocks/toast-stack/ToastStack.tsx`). BoardUI's `Toaster` defaults `position: 'bottom-end'`,
  `limit: 3`, `duration: 5000` (`libraries.json`).
- **Recommended:** `tone: neutral | success | warning | error | info`; region `fixed bottom-4 inset-e-4
  z-[60] w-[min(400px,calc(100vw-2rem))]`; toast `grid grid-cols-[auto_1fr_auto] items-start gap-x-3
  gap-y-1 rounded-container bg-surface-overlay px-4 py-3 text-on-surface shadow-md`; icon `mt-0.5
  size-4 text-{tone}`; title `text-sm font-medium` (not coloured: accent sparingly, inferred);
  description `text-sm text-on-surface-variant`; action `Button soft neutral sm`; close `IconButton
  ghost neutral xs`, visible on hover or focus. Stack: 3 visible, collapsed offset 12px, scale
  `1 - i × 0.05`, expand on hover/focus; enter from the edge 350ms `ease-fluid`, exit 250ms; 5000ms
  timeout (BoardUI) unless the toast has an action.
- **Follows:** HeroUI stack and motion, Astryx width.

### 2.33 Badge (count and status dot)

- **References:** HeroUI `.badge` `variant: primary | secondary | soft` × `color: accent | default |
  success | warning | danger`, `size: sm | md | lg` (`min-h-4` / `min-h-7` / `min-h-8`, `text-[10px]` /
  `text-xs` / `text-sm`), `rounded-3xl`, a 1px border in `var(--background)` with
  `background-clip: padding-box`, placements `top-right | top-left | bottom-right | bottom-left`
  translated 25% outward (`H components/badge.css`). Astryx `Badge` `variant: neutral | info | success
  | warning | error | <categorical colour>`: `height: --spacing-5` (20px), `px-2`, `--radius-full`, 12px
  medium; status variants are strong fills, categorical ones 20% tints (`A Badge/Badge.tsx`).
- **Recommended:** keep ours as the small anchored count or dot; `variant: solid | soft`, `tone:
  error (default) | primary | neutral | success | warning`, `size: sm | md` = 16 / 20px. Classes
  `inline-flex h-5 min-w-5 items-center justify-center rounded-control px-1.5 text-xs font-medium
  tabular-nums` (`sm` `h-4 min-w-4 px-1 text-[10px]`), solid `bg-{tone} text-on-{tone}`, soft
  `bg-{tone}-soft text-on-{tone}-soft`; dot `size-2 rounded-full bg-{tone}`; anchored `absolute
  top-0 inset-e-0 translate-x-1/4 -translate-y-1/4 rtl:-translate-x-1/4 ring-2 ring-canvas`
  (the ring stands in for HeroUI's background-coloured border). Count changes use `RollingNumber`.
- **Follows:** Astryx size, HeroUI anchoring and seam.

### 2.34 Chip (interactive: filter, input, assist)

Our **Chip** is HeroUI's **Tag** (pressable, selectable, removable) and our **Tag** is HeroUI's
**Chip** (a static label). Map recipes across, not by name.

- **References:** HeroUI `.tag` `gap-1 rounded-xl px-2 py-1 text-xs font-medium` (24px), `sm` `py-0.5`,
  `lg` `rounded-2xl px-2.5 py-1.5 text-sm` (32px); `variant: default | surface`; selected `bg-accent-soft
  text-accent-soft-foreground`, selected hover `accent-soft-hover`; transitions on colour, `scale`,
  opacity and background at 100ms; remove button `touch-target size-3` (`H components/tag.css`,
  `tag-group.css` `gap-1.5`). Astryx `Token`: `--radius-inner`, height `--size-element-* - 8px`, `px-2`,
  12px medium, `bg-neutral` or categorical tint, remove button `16px` round (`A Token/Token.tsx`).
- **Recommended:** `variant: soft (default) | outline`, `size: sm | md` = 24 / 32px, `rounded-control`.
  Base `focus-ring transition-control inline-flex cursor-pointer items-center gap-1.5 rounded-control
  font-medium data-[pressed]:scale-[0.97] data-[disabled]:opacity-50`; `sm` `h-6 px-2.5 text-xs`, `md`
  `h-8 px-3 text-sm`. Soft `bg-neutral-soft text-on-surface data-[hovered]:bg-neutral-soft-hover`;
  outline `border border-outline-variant data-[hovered]:bg-neutral-soft`; both selected
  `data-[selected]:border-transparent data-[selected]:bg-primary-soft data-[selected]:text-on-primary-soft`
  with a leading check that grows in (`w-0 → w-4`, 150ms, inferred). Remove `touch-target relative
  -me-1 size-4 rounded-full data-[hovered]:bg-neutral-soft-hover` (HeroUI `touch-target` keeps the hit
  area at 24px, WCAG 2.5.8). Group `flex flex-wrap gap-1.5`.
- **Follows:** HeroUI.

### 2.35 Banner and alert

- **References:** HeroUI `.alert` `status: default | accent | success | warning | danger`: `flex
  items-start gap-4 bg-surface px-4 py-3 shadow-surface` radius 24px, indicator `p-1` with a `size-4`
  glyph, title `text-sm leading-6 font-medium` and indicator coloured `*-soft-foreground`, description
  `text-sm text-muted` (`H components/alert.css`). Astryx `Banner` `status: info | warning | error |
  success` on `--color-<status>-muted` with `--color-on-<status>-muted` text, header `px-4 py-3 gap-x-2`,
  title 14px semibold, description 12px secondary, an optional content area on `bg-card` with a 1px
  border, chevron for collapsible banners, `elevation`, `--radius-container` (`A Banner/Banner.tsx`).
- **Recommended:** `variant: soft (default) | surface`, `tone: info | success | warning | error |
  neutral`. Soft `flex items-start gap-3 rounded-container bg-{tone}-soft px-4 py-3 text-on-{tone}-soft`;
  surface `bg-surface-raised border border-outline-subtle text-on-surface` with only the icon in
  `text-{tone}`. Icon `mt-0.5 size-4`; title `text-sm font-semibold`; description `text-sm`
  (`text-on-surface-variant` in `surface`); actions `ms-auto flex gap-2` with `Button soft/ghost sm`;
  dismiss `IconButton ghost xs`.
- **Follows:** Astryx (pale status fills); HeroUI for the `surface` variant.

### 2.36 Empty state (and content state)

- **References:** HeroUI `.empty-state` is only `p-2 text-sm text-muted` (`H components/empty-state.css`).
  Astryx `EmptyState`: `gap: --spacing-4`, `paddingBlock: --spacing-8`, `paddingInline: --spacing-6`,
  title `--text-large` (17px) semibold primary, description 14px secondary, text column `maxWidth:
  360px`, actions `gap: --spacing-2`; compact `gap 8px, padding 16px`, title 14px, description 12px
  (`A EmptyState/EmptyState.tsx`).
- **Recommended:** `size: md | sm`. `flex flex-col items-center gap-4 px-6 py-8 text-center`; icon
  well `flex size-12 items-center justify-center rounded-full bg-neutral-soft text-on-surface-variant
  [&_svg]:size-6` (inferred); title `text-lg font-semibold`; description `max-w-[360px] text-sm
  text-on-surface-variant`; actions `flex gap-2`. `sm`: `gap-2 p-4`, title `text-sm`, description
  `text-xs`. ContentState reuses it with Spinner for loading.
- **Follows:** Astryx.

### 2.37 Progress

- **References:** HeroUI `.progress-bar` `color: default | accent | success | warning | danger`, `size:
  sm | md | lg` = track `h-1` / `h-2` / `h-3`, `rounded-sm` (a pill at 8px), `bg-default`, fill width
  300ms `ease-out`, indeterminate `w-2/5` 1.5s `cubic-bezier(0.65, 0, 0.35, 1)`; label and output `text-sm
  font-medium tabular-nums`. `.progress-circle` `size-7` (sm `size-5`, lg `size-9`), track
  `stroke: var(--default)`, `stroke-dashoffset 300ms` (`H components/progress-bar.css`,
  `progress-circle.css`). Astryx `ProgressBar`: 8px track `--radius-full`, `bg-muted` (Neutral:
  `border-emphasized`), label 14px medium, value 14px regular secondary, indeterminate slide
  `-100% → 250%` (`A ProgressBar/ProgressBar.tsx`, `AN`).
- **Recommended:** `tone: primary | success | warning | error | neutral`, `size: sm | md | lg`. Track
  `h-2 overflow-hidden rounded-full bg-neutral-soft`; fill `h-full rounded-full bg-{tone}
  transition-[width] duration-300 ease-out` (`neutral` = `bg-on-surface`); indeterminate HeroUI's
  keyframes. Header `flex justify-between`, label `text-sm font-medium`, value `text-sm
  text-on-surface-variant tabular-nums`. Circular `size-7` (sm 20, lg 36px), track
  `stroke-neutral-soft`, arc `stroke-{tone}`. The M3 `wavy` variant goes.
- **Follows:** HeroUI sizes, Astryx label colours and opaque track idea.

### 2.38 Spinner

- **References:** HeroUI `.spinner` `size-6` (sm `size-4`, lg `size-8`, xl `size-10`),
  `animate-spin-fast` 0.75s linear, `color: current | accent | danger | success | warning`
  (`H components/spinner.css`). Astryx `Spinner` diameters 10 / 14 / 18 / 28px with strokes 2 / 3 / 3 /
  4px and a faint track, `shade: default | subtle | onMedia | inherit` (`A Spinner/Spinner.tsx`).
- **Recommended:** `size: sm | md | lg | xl` = 16 / 24 / 32 / 40px, stroke 2 / 2.5 / 3 / 3.5px
  (inferred from Astryx's ratio); a ring with `stroke-current opacity-20` track and a 25% arc in
  `currentColor`; `tone: current (default) | primary`; `animate-[spin_0.75s_linear_infinite]
  motion-reduce:animate-[spin_1.5s_linear_infinite]`.
- **Follows:** HeroUI sizes and speed, Astryx track.

### 2.39 Skeleton

- **References:** HeroUI `.skeleton` `rounded-sm bg-surface-tertiary/70`, animation set by
  `--skeleton-animation: shimmer | pulse | none`; shimmer is an `::after` gradient `from-transparent
  via-surface-tertiary to-transparent` moving `translateX(200%)` over 2s linear
  (`H components/skeleton.css`). Astryx `Skeleton`: `--color-skeleton`, opacity stepped `0.25 → 0.925`
  in ten holds, `alternate`, linear, over `--duration-medium-max`, staggered per index; radius levels
  `none | inner | element | container | rounded` (`A Skeleton/Skeleton.tsx`).
- **Recommended:** `animation: shimmer (default) | pulse | none`, `shape: text | block | circle` =
  `rounded-sm` / `rounded-container` / `rounded-full`; base `relative overflow-hidden bg-neutral-soft`;
  shimmer `after:absolute after:inset-0 after:-translate-x-full after:bg-linear-to-r
  after:from-transparent after:via-on-surface/6 after:to-transparent
  after:animate-[ds-shimmer_2s_linear_infinite]` (a `translate` keyframe, not `background-position`);
  pulse = Astryx's stepped opacity. Reduced motion: `none`.
- **Follows:** HeroUI default, Astryx pulse as the option.

### 2.40 Avatar and avatar group

- **References:** HeroUI `.avatar` `size: sm | md | lg` = 32 / 40 / 48px, a circle, image fades in over
  250ms, fallback `bg-default text-sm font-medium`, `variant: default | soft` × `color: accent | default
  | success | warning | danger`; `.avatar-group` `overlap: ring | clip`, `--avatar-group-overlap:
  0.5rem`, `--avatar-group-seam: 2px`; `ring` = `box-shadow: 0 0 0 2px var(--background)`, `clip` = a CSS
  `mask` cut-out that leaves a transparent seam on any background; `isGrid` `flex-wrap gap-3`
  (`H components/avatar.css`, `avatar-group.css`). Astryx `Avatar` sizes `xsm` 20, `sm` 24, `md` 36,
  `lg` 48, `xl` 128px, `shape: circle | rounded | square` (rounded = `--radius-element`), initials
  `size × 0.4`, fallback `bg-neutral`; `AvatarGroup` overlap `round(size × 0.25)`, each member a 2px
  `background-surface` border (`A Avatar/Avatar.tsx`, `AvatarGroup/AvatarGroup.tsx`). BoardUI avatar
  20 / 24 / 32 / 36px, always round (`components/base/avatar/avatar.tsx`). EasyUI `AvatarStack`
  overlaps `-ml-2 / -ml-3 / -ml-4` at 28 / 36 / 44px with `border-2 border-background`, and lifts the
  hovered avatar `scale: 1.25, y: -6` on a spring `{stiffness: 400, damping: 25}`
  (`src/components/ui/AvatarStack.tsx`).
- **Recommended:** `size: xs | sm | md | lg | xl` = 24 / 32 / 40 / 48 / 64px (`xl` inferred), `shape:
  circle | rounded` (rounded = `rounded-lg` at ≤ 32px, `rounded-xl` above; inferred), fallback
  `bg-neutral-soft text-on-surface font-medium` with `text-xs` / `text-xs` / `text-sm` / `text-base` /
  `text-xl`, toned fallbacks `bg-{tone}-soft text-on-{tone}-soft`, image `transition-opacity
  duration-250`. Group: overlap 25% of the size (md `-ms-2.5`), seam `ring-2 ring-canvas` by default
  and HeroUI's `clip` mask as `seam="clip"` for avatars over images; overflow `+N` as an avatar with
  `bg-neutral-soft text-xs font-medium`; optional EasyUI hover lift for marketing pages only.
- **Follows:** HeroUI sizes and seam modes, Astryx overlap ratio.

### 2.41 Tag (static label)

- **References:** HeroUI `.chip` `variant: primary | secondary | tertiary | soft` × `color: accent |
  default | success | warning | danger`, `size: sm | md | lg`; `inline-flex gap-0.5 rounded-2xl px-2
  py-0.5 text-xs leading-5 font-medium` (24px), `sm` `px-1 py-0`, `lg` `px-3 py-1 text-sm`; primary =
  strong fill, soft = 15% tint, tertiary = transparent (`H components/chip.css`). Astryx `Badge`
  categorical colours are 20% tints in 20px pills (`A Badge/Badge.tsx`).
- **Recommended:** `variant: soft (default) | solid | outline`, `tone: neutral | primary | success |
  warning | error | info`, `size: sm | md` = 20 / 24px. `inline-flex items-center gap-1 rounded-control
  px-2 text-xs font-medium` with `h-6` (`sm` `h-5 px-1.5`); soft `bg-{tone}-soft text-on-{tone}-soft`
  (neutral `bg-neutral-soft text-on-surface`), solid `bg-{tone} text-on-{tone}`, outline `border
  border-outline-variant text-on-surface`; optional dot `size-1.5 rounded-full bg-current`. The M3
  names `tonal | outlined | filled` map to `soft | outline | solid`.
- **Follows:** HeroUI.

### 2.42 Kbd

- **References:** HeroUI `.kbd` `inline-flex h-6 items-center gap-0.5 rounded-lg bg-default px-2
  font-sans text-sm font-medium text-muted`, `variant: default | light` (light = transparent)
  (`H components/kbd.css`). Astryx `Kbd` `min-width` and `height` 20px, `px-1`, `--radius-inner`,
  `bg-neutral`, `border-bottom: 2px solid --color-border-emphasized` (a key cap), 12px medium
  (`A Kbd/Kbd.tsx`). BoardUI `Kbd` `rounded-full px-1 py-0.5` 12/16 semibold on a neutral pill
  (`components/base/kbd/kbd.tsx`, MIT).
- **Recommended:** `variant: soft (default) | ghost`, `size: sm | md` = 20 / 24px; `inline-flex h-6
  min-w-6 items-center justify-center gap-0.5 rounded-lg bg-neutral-soft px-1.5 font-sans text-xs
  font-medium text-on-surface-variant` (`sm` `h-5 min-w-5 rounded-md px-1 text-[11px]`); ghost
  `bg-transparent`. Astryx's 2px bottom border is a nice key-cap cue; leave it out unless the owner
  wants it.
- **Follows:** HeroUI shape, Astryx size steps.

### 2.43 Cookie consent

- **References:** Astryx neutral overlay surfaces and clear action groups; HeroUI control shapes
  and short transitions; Bencho's compact-to-expanded continuity; CookieConsent's first-layer
  decisions and read-only required categories. See `cookie-consent.md` for the visual study.
  No upstream source is copied.
- **Layouts:** `card` (default, at most 384px), `banner` (wide copy and actions), `compact`
  (a capsule when wide). All stack in narrow containers. `placement` is `inline` by default, or
  fixed at `bottom-start`, `bottom`, `bottom-end` with logical edges and safe-area spacing.
- **Surface:** `bg-surface-overlay text-on-surface`, a subtle border, `rounded-container` and
  `shadow-lg`. Compact uses `rounded-control` at wide sizes and returns to container corners
  while editing. Actions are 40px pills; accept and reject share neutral soft styling. Saving
  edited preferences is the primary solid action.
- **Behaviour:** a non-modal named region; no focus stealing, backdrop, implicit dismissal or
  timer. RAC Disclosure reveals category Switch rows inside the same surface. Required categories
  stay on. Draft edits never confirm consent; `onConfirm` owns persistence and applies the result.
  Promises block competing choices, close after success and show a retryable error after failure.
- **Motion:** 250ms fluid opacity/vertical arrival and exit, measured disclosure height and a
  short corner transition. Reduced motion removes spatial changes; disabled motion is instant.
  No continuous animations, blur or gesture springs.

### Shared recipes

All overlays (popover, menu, select list, combo-box list, tooltip, toast) share `overlay-panel` motion;
all fields share `field-frame`; all actions share `transition-control`, the press scale and
`opacity-50` disabled. Changing one of those changes the library consistently.

---

### 2.44 Recovery, media and conversion flow

- **References:** [BoardUI Breadcrumb](https://www.boardui.com/components/breadcrumb) uses quiet
  ancestor links and a non-interactive current item. [BoardUI Funnel Chart Card](https://www.boardui.com/components/funnel-chart-card)
  shows a horizontal narrowing flow; it is Pro, so only the public visual preview informs our
  original geometry. Astryx's EmptyState and Lightbox inventory informs recovery and modal media
  patterns; existing Dialog and EmptyState remain the foundation here.
- **Breadcrumbs:** wrapping ordered links inside a named navigation landmark, neutral hover fills,
  a text-only current page and directional chevrons. Real URLs remain crawlable. Schema.org data
  belongs to the application's server route model, not a client component parsing arbitrary children.
- **NotFound:** EmptyState with original page/search artwork, one 300ms entrance and explicit
  recovery links. Server-render the meaningful copy and heading. HTTP status and `noindex` belong
  to the application's routing layer; see [Next](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
  and [Google](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- **Lightbox:** full-screen Dialog, React Aria thumbnail Tabs, native overflow for zoomed images,
  named controls and recoverable loading errors. Reuse the site's calm canvas and overlay roles;
  do not introduce a separate hard-coded dark viewer theme or animate panning.
- **FunnelChart:** mono by default, generated chart roles for categorical stages, counts and named
  rate denominators outside the ribbon. A semantic table mirrors every observation. No hover-only
  information or pointer-move geometry. Compose period controls and table switching with ChartCard.
- **Onboarding:** a Card example composing Checkbox, Disclosure and LinearProgress. Keep it a
  prototype until an application needs a distinct reusable state contract; actual completion
  comes from account data rather than link clicks.

### 2.45 Reorderable list

- **References:** [beUI Sortable Stack](https://beui.dev/components/motion/sortable-stack) for
  visible grips and readable row hierarchy; HeroUI shapes and Astryx's restrained placement
  motion. See `reorderable-list.md` for the study and original-code provenance.
- **Surface:** `outline` uses separate `rounded-container` raised rows, subtle borders and 8px
  gaps. `plain` uses dividers and neutral hover fills. Both keep 40px drag buttons, logical
  spacing and flexible consumer-owned content. Icon tiles and thumbnails use inner corners.
- **Behaviour:** React Aria GridList supplies internal reordering and keyboard/screen-reader
  interaction. Stable keys identify items; controlled and uncontrolled order share one API.
  Order changes only on a completed drop, and no-op drops do not notify consumers.
- **Motion:** dim the source and show a primary insertion line during drag. Animate committed
  row positions with a 250ms fluid transform tween, without changing consumer state on every
  pointer move. Reduced and disabled motion remove spatial transitions.

## 3. Variant API for actions and the rest of the library

### 3.1 Comparison

| Concept                                | Ours today (M3)      | HeroUI v3                  | HeroUI v2           | Astryx                  |
| -------------------------------------- | -------------------- | -------------------------- | ------------------- | ----------------------- |
| Strong accent fill                     | `filled`             | `primary`                  | `solid` + `color`   | `primary`               |
| Pale fill                              | `tonal` (secondary-container) | `secondary` (grey + accent text), `tertiary` (grey), `danger-soft` | `flat` + `color` | `secondary` (translucent neutral) |
| Border only                            | `outlined`           | `outline`                  | `bordered`          | —                       |
| No fill until hover                    | `text`               | `ghost`                    | `light`             | `ghost`                 |
| Shadowed                               | `elevated`           | —                          | `shadow`            | `elevation` prop        |
| Border + fill                          | —                    | —                          | `faded`             | —                       |
| Outline that fills on hover            | —                    | —                          | `ghost`             | —                       |
| Destructive                            | `tone: destructive`  | `danger`, `danger-soft` (in `variant`) | `color: danger` | `destructive` (in `variant`) |
| Status colours on badges/chips/alerts  | `tone: error | primary | success | warning | info | neutral` | `color: accent | default | success | warning | danger`, `status:` on alerts | `color:` | `variant: neutral | info | success | warning | error | <hue>` |

Both modern references fold intent into one `variant` axis for buttons (`primary`, `secondary`,
`danger`) and use a separate colour axis everywhere else (`color` in HeroUI, `variant` names in
Astryx). That leaves them with two vocabularies. Ours already has `tone` with role names on Badge,
Banner, Progress and Tag.

### 3.2 Recommendation: one vocabulary, two axes

```ts
variant: 'solid' | 'soft' | 'outline' | 'ghost';
tone: 'primary' | 'neutral' | 'error';                                    // actions
tone: 'primary' | 'neutral' | 'info' | 'success' | 'warning' | 'error';   // display and status
size: 'sm' | 'md' | 'lg';                                                 // plus 'xs' on IconButton
```

- `variant` says **how much ink** (treatment); `tone` says **which role** paints it. Every component
  that has either axis uses these words and no others: Button, IconButton, ToggleButton, ButtonGroup,
  CopyButton, FAB (`tone` only), Link (`tone` only), Chip, Tag, Badge, Banner, Toast, Alert dialog
  icon, Progress, Spinner, Avatar fallback, Kbd, Card (`variant` only), Text field, Select, Number
  field, List box.
- `tone` values are role names, so `tone="error"` paints `bg-error` / `bg-error-soft`, the same way the
  rest of the library reads. HeroUI says `danger`, Astryx `destructive`/`error`; picking `error` keeps
  one word for one role (owner decision, 3.4).
- `tone` defaults: `primary` for `solid`, `neutral` for `soft`, `outline` and `ghost`. That is how both
  references behave: only the filled main action carries the accent, every quieter action is grey.
- `elevated` is gone as a variant. A raised action is a FAB; a raised card is `Card variant="elevated"`.
- No `secondary` or `tertiary` tone: the seed's secondary and tertiary roles stay available to
  apps, but no component chooses them.

### 3.3 Mapping

| From                         | To                                 |
| ---------------------------- | ---------------------------------- |
| M3 `filled`                  | `solid` (tone `primary`)           |
| M3 `tonal`                   | `soft` + `tone="primary"` (accent tint) or `tone="neutral"` (HeroUI tertiary) |
| M3 `outlined`                | `outline` (`neutral`; text was `primary` before) |
| M3 `text`                    | `ghost`                            |
| M3 `elevated`                | removed                            |
| M3 `tone: destructive`       | `tone: error`                      |
| IconButton `standard`        | `ghost` · `neutral`                |
| Tag `tonal / outlined / filled` | `soft / outline / solid`        |
| Chip `outlined / elevated / tonal` | `outline / — / soft`         |
| List box `outlined`          | `outline`                          |
| Number field `outlined / filled`, `shape` | `outline / soft`, shape removed |
| Banner `tonal`               | `soft`                             |
| HeroUI v3 `primary / secondary / tertiary / outline / ghost / danger / danger-soft` | `solid·primary / soft·neutral (+primary text) / soft·neutral / outline·neutral / ghost·neutral / solid·error / soft·error` |
| Astryx `primary / secondary / ghost / destructive` | `solid·primary / soft·neutral / ghost·neutral / solid·error` |
| HeroUI v2 `solid / flat / bordered / light` | `solid / soft / outline / ghost`; `faded`, `shadow`, `ghost` have no equivalent |

### 3.4 Owner decisions in the API

1. `tone="error"` (role name) versus `"danger"` (HeroUI) versus keeping `"destructive"` (today).
2. Button default: `solid · primary` (HeroUI, today) or `soft · neutral` (Astryx, which forces the
   accent to be opt-in).
3. Sizes: drop `xs` and `xl` from Button, ToggleButton and ButtonGroup (neither reference has five
   sizes), keeping `xs` on IconButton only.

---

## 4. Token layer

All of this lives in `registry/ds/styles/theme.css` (hand-written) and, for the surface roles, in the
colour generator. No hex is introduced: every new role is either a tone of the existing monochrome
palette or a `color-mix` of existing roles.

### 4.1 Neutral surfaces

Done in `a3e2a9c`: `brandColors({ surfaces: 'neutral' })` takes every role in `neutralRoleNames`
(surfaces, outlines, inverse, shadow, scrim) from the monochrome scheme, and `tokens/config.json` and
`DynamicTheme` default to it. The generated values are now, light / dark: `surface` `#f9f9f9 /
#131313`, `surface-container-lowest` `#ffffff / #0e0e0e`, `-low` `#f3f3f3 / #1b1b1b`, `-container`
`#eeeeee / #1f1f1f`, `-high` `#e8e8e8 / #2a2a2a`, `-highest` `#e2e2e2 / #353535`, `outline` `#777777 /
#919191`, `outline-variant` `#c6c6c6 / #474747`.

What is missing is the **direction of lift**. In both references a raised surface is white on a grey
page in light mode and **lighter** than the page in dark mode (HeroUI `--background` oklch 0.97 /
0.12, `--surface` white / 0.21; Astryx body `#F1F4F7 / #111112`, card `#FFFFFF / #1F1F22`, popover
`#FFFFFF / #28292C`). No single M3 role does that: `surface-container-lowest` is white in light but the
darkest step in dark. Add five roles, generated from the monochrome scheme's neutral palette so
dynamic colour keeps working:

| Role                | Light (tone) | Dark (tone) | Equals today, light / dark                                  | Used for                                      |
| ------------------- | ------------ | ----------- | ------------------------------------------------------------ | --------------------------------------------- |
| `canvas`            | 96           | 6           | `surface-container-low` / `surface`                          | page background                                |
| `surface-raised`    | 100          | 12          | `surface-container-lowest` / `surface-container`             | cards, fields, accordion surface, raised banners |
| `surface-overlay`   | 100          | 17          | `surface-container-lowest` / `surface-container-high`        | popover, menu, select, dialog, sheet, toast    |
| `surface-segment`   | 100          | 30          | `surface-container-lowest` / `outline-variant`               | selected segment and pill-tab indicator (HeroUI `--segment`: white / oklch 0.396) |
| `surface-thumb`     | 100          | 90          | `surface-container-lowest` / `on-surface`                    | switch thumb when off (HeroUI: white in both modes; 90 is inferred to cut glare) |

Tones are read off the current output; `canvas` 96 is between HeroUI (97) and Astryx Neutral (95).

### 4.2 Extra computed roles

In `@theme inline`, derived with `color-mix` so they follow any seed and contrast level:

| Role (utility suffix)                         | Definition                                                                                   | Source                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `primary-hover`, `error-hover`, `inverse-surface-hover` | `color-mix(in oklab, var(--X) 90%, var(--on-X))` (`inverse-surface` mixes with `inverse-on-surface`) | HeroUI `--accent-hover`                    |
| `surface-overlay-hover`                       | `color-mix(in oklab, var(--surface-overlay) 94%, var(--on-surface))`                         | HeroUI `--surface-hover` (8%); 6% inferred |
| `primary-soft`, `error-soft`, `success-soft`, `warning-soft`, `info-soft` | `color-mix(in oklab, var(--X) 12%, transparent)`                                     | HeroUI `--accent-soft` (15% light, 12% dark) |
| `*-soft-hover`                                | same at 16%                                                                                  | HeroUI `--accent-soft-hover` (20% / 16%)   |
| `on-primary-soft`, `on-error-soft`, …         | `var(--X)` to start; the axe contrast tests decide whether to mix toward `on-surface` as HeroUI does (`color-mix(in oklab, var(--accent) 70%, var(--foreground) 30%)`) | HeroUI `--accent-soft-foreground`          |
| `neutral-soft`                                | `light-dark(color-mix(in srgb, var(--on-surface) 6%, transparent), color-mix(in srgb, var(--on-surface) 10%, transparent))` | Astryx Neutral `--color-neutral` (black 6% / white 10%) |
| `neutral-soft-hover`                          | same at 10% / 14%                                                                            | Astryx `--color-overlay-pressed` step      |
| `outline-subtle`                              | `light-dark(color-mix(in srgb, var(--on-surface) 8%, transparent), color-mix(in srgb, var(--on-surface) 10%, transparent))` | Astryx Neutral `--color-border`            |
| `backdrop`                                    | `light-dark(color-mix(in srgb, var(--scrim) 40%, transparent), color-mix(in srgb, var(--scrim) 60%, transparent))` | Astryx `--color-overlay`, HeroUI `--backdrop` 0.5 / 0.6 |

Why not the M3 containers for "soft": with the 2025 spec and the `vibrant` style the containers are
saturated (`primary-container` `#9a94ff` in both modes, `error-container` `#f74b6d`), so they read as
a second strong fill, not a tint. A translucent tint of the role is what both references use, and it
works on any surface.

These pairs replace the M3 rule "roles in matching pairs" with a web one: every fill has its `on-`
partner (`primary-soft` / `on-primary-soft`, `neutral-soft` / `on-surface`). `check-ds` can enforce
that `bg-*-soft` never appears without `text-on-*-soft` (inferred rule).

### 4.3 Shadow tokens

`light-dark()` only accepts colours, so a shadow cannot switch as a whole value; each layer's colour
is a `light-dark()` pair instead (the form Astryx Neutral ships). Written out:

| Token       | Layers (`offset-x offset-y blur spread colour`)                                                                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--shadow-xs` | `0 2px 4px 0 L(shadow 4%, transparent)`, `0 1px 2px 0 L(shadow 6%, transparent)`, `0 0 1px 0 L(shadow 6%, transparent)`                                                                            |
| `--shadow-sm` | `0 2px 4px 0 L(shadow 5%, shadow 25%)`, `0 4px 8px 0 L(shadow 10%, shadow 40%)`, `inset 0 0 0 1px L(transparent, on-surface 8%)`                                                                  |
| `--shadow-md` | `0 2px 8px 0 L(shadow 6%, shadow 35%)`, `0 -6px 12px 0 L(shadow 3%, transparent)`, `0 14px 28px 0 L(shadow 8%, shadow 50%)`, `inset 0 0 0 1px L(transparent, on-surface 12%)`                      |
| `--shadow-lg` | `0 4px 6px 0 L(shadow 10%, shadow 50%)`, `0 12px 24px 0 L(shadow 15%, shadow 70%)`, `inset 0 0 0 1px L(transparent, on-surface 15%)`                                                               |

`L(a, b)` = `light-dark(color-mix(in srgb, var(--a) N%, transparent), …)`. Light columns: `xs` HeroUI
`--field-shadow`, `sm` Astryx Neutral low, `md` HeroUI `--overlay-shadow`, `lg` Astryx Neutral high.
Dark columns: Astryx Neutral, including its white rim (as `on-surface`, never `white`); for `md` the
dark opacities of Astryx `med` sit on HeroUI's offsets (inferred). Example of one layer:
`0 2px 4px 0 light-dark(color-mix(in srgb, var(--shadow) 5%, transparent), color-mix(in srgb,
var(--shadow) 25%, transparent))`. Remove `--shadow-elevation-1 … -5`.

### 4.4 Radius tokens

Delete the M3 overrides of `--radius-xs … --radius-3xl` so Tailwind's defaults return (2 / 4 / 6 / 8 /
12 / 16 / 24 / 32px, identical to HeroUI's), and add the families from 1.1:

| Token                 | Value       |
| --------------------- | ----------- |
| `--radius-control`    | `9999px`    |
| `--radius-field`      | `0.75rem`   |
| `--radius-item`       | `0.75rem`   |
| `--radius-overlay`    | `1rem`      |
| `--radius-container`  | `1.25rem`   |
| `--radius-dialog`     | `1.5rem`    |

Tailwind generates `rounded-control`, `rounded-field` and so on, including logical sides
(`rounded-s-control`).

### 4.5 Type scale: switch to web names

Recommendation: **drop the M3 utilities** (`text-display-*`, `text-headline-*`, `text-title-*`,
`text-body-*`, `text-label-*`) and use Tailwind's size scale with explicit weights, as both references
do (HeroUI writes `text-sm font-medium`; Astryx's Tailwind bridge maps its scale to `text-xs … text-5xl`,
`A tailwind-theme.css`). Keeping the M3 names with new values would make `text-label-lg` mean
something M3 does not, and every HeroUI recipe would need translating.

| M3 utility today     | Replace with                          |
| -------------------- | ------------------------------------- |
| `text-label-lg`      | `text-sm font-medium`                 |
| `text-label-md`, `-sm` | `text-xs font-medium`               |
| `text-body-lg`       | `text-base`                           |
| `text-body-md`       | `text-sm`                             |
| `text-body-sm`       | `text-xs`                             |
| `text-title-sm`      | `text-sm font-semibold`               |
| `text-title-md`      | `text-base font-semibold`             |
| `text-title-lg`      | `text-xl font-semibold`               |
| `text-headline-sm`, `-md`, `-lg` | `text-2xl`, `text-3xl`, `text-3xl` `font-semibold tracking-tight` |
| `text-display-sm`, `-md`, `-lg`  | `text-4xl`, `text-5xl`, `text-6xl` `font-semibold tracking-tight` |

Optionally add four semantic heading utilities (`text-heading-1 … -4` = 24 / 20 / 18 / 16px semibold)
for docs and blocks, after Astryx's `--text-heading-*` (inferred, not required).

### 4.6 Motion tokens and utilities

- Add `--ease-fluid: cubic-bezier(0.32, 0.72, 0, 1)` and `--ease-out-quad: cubic-bezier(0.25, 0.46,
  0.45, 0.94)`; keep Tailwind's `ease-out`; remove `--ease-standard`, `--ease-emphasized-*` and the
  `--ease-spatial-*` / `--ease-effect-*` M3 bridges.
- Retime the existing keyframes: `ds-popover-in` 150ms `ease` from `scale(0.95)` (popovers 0.9) with a
  4px placement offset; `ds-popover-out` 100ms to `scale(0.95)`; `ds-dialog-in` 250ms `ease-out-quad`
  from `scale(1.05)`; `ds-dialog-out` 100ms to `scale(0.95)`; sheet in 250ms / out 200ms `ease-fluid`;
  `ds-toast-in` 350ms `ease-fluid`; `ds-spin` 0.75s; `ds-shimmer` 2s linear as a `translate`.
- Utilities: add `transition-control` (1.6), `touch-target` (HeroUI: a centred 24px `::after` for
  controls under 24px, WCAG 2.5.8), `no-tap-highlight`; change `focus-ring` to 2px `--primary` with a
  2px offset and `focus-ring-inset` to a −2px offset; remove `state-layer`.

### 4.7 What the token layer does not need

- No new status hues: `info`, `success`, `warning`, `error` and their containers already exist.
- No categorical palette (Astryx's red … pink): nothing in the 43 components needs it; add it when a
  data-heavy component does.
- No per-component colour tokens (HeroUI `--switch-control-bg` etc.): our components take roles in
  classes.

---

## 5. Credits for adapted recipes

| Source                              | URL                                                    | Licence                                  | Copyright line                                      | What we would adapt                                                                                         |
| ----------------------------------- | ------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| HeroUI v3 `@heroui/styles` 3.2.7    | https://github.com/heroui-inc/heroui/tree/v3/packages/styles | **Apache-2.0**                     | Copyright 2025 NextUI Inc.                          | control geometry, press scales, overlay keyframes and timings, switch/checkbox/radio/slider geometry and motion, toast stack, `-hover`/`-soft` colour-mix formulas, avatar-group `clip` mask, `touch-target` |
| HeroUI v2 theme                     | https://github.com/heroui-inc/heroui/blob/v2/packages/core/theme/src/components/button.ts | MIT        | Copyright (c) 2020 Next UI Inc.                     | button size table, variant vocabulary comparison                                                            |
| Astryx core and Neutral theme       | https://github.com/meta/astryx                         | MIT                                      | Copyright (c) 2026 Meta Platforms, Inc.             | field frame and focus, shadow values, focus ring, neutral fill and border values, segmented control, tabs, badge, kbd, avatar overlap ratio, empty state, banner, toast width |
| Bencho (free blocks only)           | https://github.com/cabralorenzo/bencho/blob/main/blocks/toast-stack/ToastStack.tsx | MIT       | Copyright (c) 2026 Lorenzo Cabra                    | only if the fanned toast stack uses its spring (380/34) and peek geometry                                    |
| EasyUI                              | https://github.com/Surajmaurya1/easyui/blob/main/src/components/ui/AvatarStack.tsx | MIT       | Copyright (c) 2026 Suraj Maurya                     | only if the avatar hover lift (spring 400/25, scale 1.25, y −6) and sheet drag thresholds are used           |
| BoardUI (free tier only)            | https://github.com/BoardUI/boardui                     | MIT (free tier); Pro is proprietary      | Copyright (c) 2026 Mertcan Dundar Esmergul (BoardUI) | nothing adopted in this spec; toast defaults cited for comparison                                          |
| ObsidianUI                          | https://github.com/Atharvsinh-codez/ObsidianUI         | MIT                                      | Copyright (c) 2026 ObsidianUI                       | nothing: its `kbd`, `avatar`, `sheet`, `drawer` and `sonner` are shadcn copies (see `libraries.json`)        |
| React Bits                          | —                                                      | MIT + Commons Clause                     | —                                                   | nothing                                                                                                      |

How to carry them: MIT sources go in the item's `credits` field and from there into
`THIRD_PARTY_NOTICES.md`, as today. **HeroUI v3 needs a decision**: Apache-2.0 §4 asks for the licence
text, the copyright notice and, in each modified file, a notice that it was changed. The options are
(a) take only values and patterns and write our own classes (this spec is written that way; a credit
line is courtesy, not obligation), (b) adapt recipes closely and ship the Apache licence plus a
change notice, which means an exception to the no-comments rule or a per-file header the generator
writes, or (c) take the v2 (MIT) recipe where one exists.

---

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
