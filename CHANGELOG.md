# Changelog

## Unreleased

### Web style

- The library has its own web look: HeroUI's shapes and liveliness on Astryx's neutral surfaces and
  calm density, specified in `docs/research/web-style.md`.
- One variant vocabulary across components: `variant` `solid | soft | outline | ghost` (or the
  component's own set), `tone` `primary | neutral | error` plus `success | warning | info` on status
  components, `size` `sm | md | lg` at 32, 40 and 48px. The earlier variant, tone, size and shape
  names are gone, with no aliases.
- New roles: layers (`canvas`, `surface-raised`, `surface-overlay`, `surface-segment`,
  `surface-thumb`), solid fills that stay vivid in dark mode (`primary-solid` and the status
  tones), translucent soft fills, `neutral-soft`, `outline-subtle` and `backdrop`.
- Six radius families (`rounded-control`, `-field`, `-item`, `-overlay`, `-container`, `-dialog`);
  Tailwind's own radius scale is back to its defaults. `cn()` and `tv()` merge the families.
- Tailwind's type sizes with explicit weights replace the named type scale; `shadow-xs`…`shadow-lg`
  replace the elevation levels; hover and press swap to `-hover` fills and scale the control
  instead of drawing a tinted overlay; disabled is `opacity-50` with a not-allowed cursor.
- Motion: `ease-fluid` and `ease-out-quad`, overlay keyframes retimed (popovers 150ms, dialogs
  250ms, sheets 250/200ms, toasts 350ms), `ds-shimmer` is a translate sweep and `ds-spin` turns in
  0.75s. `lib/motion` exports `fluidTween()` and web easings.

### Foundations

- Colour tokens generated from one seed colour with `@material/material-color-utilities` 0.4:
  every role plus success, warning and info, light and dark, standard, medium and high contrast,
  with surfaces and outlines from a neutral palette. Each role is declared per mode, so the nearest
  `.light`, `.dark` or `[data-theme]` decides the mode. Without `data-contrast`, the tokens follow
  `prefers-contrast: more`.
- Dynamic colour: `DynamicTheme` themes a subtree or the whole page from a seed at runtime, follows
  the nearest mode and the page's contrast, keeps its scheme in overlays, and caches a user's
  choice for a boot script that paints it before hydration. `useImageSeed` ranks seeds from an image
  with Material's content-based quantizer and score. `useThemeTransition` cross-fades a switch.
- `useLocalStorageState`, shared across components and tabs.
- Motion tokens: spatial and effect springs for gestures as CSS `linear()` easings with settle
  times, and as `motion` transitions.
- `theme.css`: role utilities, radius families, shadows, focus ring, overlay keyframes and a
  global reduced-motion fallback.
- `DSProvider` with locale, router, message overrides, icons and motion preference.
- 115 Material Symbols Rounded glyphs as `em`-sized inline SVG components.
- `Button` and `ButtonLink` as the reference implementation.
- Catalogue on Fumadocs with live previews, LTR/RTL and locale switches, static export.
- `check-ds`: no hex, palette colours, physical directions or `dark:`; no translation catalogues;
  every item has a test, an example and a docs page.

### Text

- The library ships no translations. Every string a component writes on its own has an English
  default exported as `default<Name>Labels` and is replaced with the component's `labels` prop or
  app-wide with `DSProvider labels`. Templates take `{placeholders}` or a function, so an i18n
  library with plurals plugs in. The per-component `*.messages.ts` catalogues are gone.
- Example and docs copy is neutral, so nothing hints at one product.

### Catalogue

- Home page rebuilt as a showcase: a live hero that re-themes a set of components from a colour or a
  photo, feature tiles with working demos, and a gallery of every component with category filters,
  search and a preview colour picker.
- An All components page grouped by category, and a preview colour picker on every example.
- The site's surfaces come from a monochrome scheme so only accents carry the seed colour.

### Components

- Actions: `IconButton`, `IconToggleButton`, `Fab`, `ExtendedFab`, `FabMenu`, `ButtonGroup`,
  `ToggleButton`, `ToggleButtonGroup`, `Link`, `CopyButton`.
- Inputs: field parts, `TextField`, `TextArea`, `SearchField`, `PasswordField`, `NumberField`,
  `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `Slider`, `ListBox`, `Select`, `ComboBox`.
- Navigation and layout: `Tabs`, `SegmentedControl`, `Card` with clickable and selectable variants,
  `Divider`, `Disclosure` and accordions.
- Overlays: `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Tooltip`, `RichTooltip`, `Menu`.
- Feedback and data display: `Toast`, `Badge`, `Chip`, `Banner`, `EmptyState`, `ContentState`,
  `LinearProgress`, `CircularProgress`, `Spinner`, `Skeleton`, `Avatar`, `AvatarGroup`, `Tag`,
  `TagGroup`, `Kbd`, `KbdCombo`.
- Theme builder page at `/theme`.

### Fixes

- `DSProvider` read the reduced-motion setting through `motion`, which disagrees between server and
  client and never updates; every component that picks classes by motion preference failed to
  hydrate for users who prefer reduced motion. It now uses a hydration-safe media query.
