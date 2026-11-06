# Changelog

## Unreleased

### Foundations

- Material 3 tokens generated from one seed colour with `@material/material-color-utilities` 0.4
  (spec 2025, phone), matching MaterialKolor 6 in the Compose library: 49 scheme roles plus
  success, warning and info, light and dark, standard, medium and high contrast. Each role is a
  `light-dark()` pair, so the nearest `.light`, `.dark` or `[data-theme]` decides the mode; older
  browsers get per-mode blocks. Without `data-contrast`, the tokens follow `prefers-contrast: more`.
- Dynamic colour: `DynamicTheme` themes a subtree or the whole page from a seed at runtime, follows
  the nearest mode and the page's contrast, keeps its scheme in overlays, and caches a user's
  choice for a boot script that paints it before hydration. `useImageSeed` ranks seeds from an image
  with Material's content-based quantizer and score. `useThemeTransition` cross-fades a switch.
- `useLocalStorageState`, shared across components and tabs.
- A parity test against MaterialKolor 6.0.0 output.
- Motion tokens: the Compose library's spatial and effect springs as CSS `linear()` easings with
  settle times, and as `motion` transitions.
- `theme.css`: role utilities, M3 type scale, shape scale, elevation, state layer, focus ring,
  overlay keyframes and a global reduced-motion fallback.
- `DSProvider` with locale, router, message overrides, icons and motion preference.
- 115 Material Symbols Rounded glyphs as `em`-sized inline SVG components.
- `Button` and `ButtonLink` as the reference implementation.
- Catalogue on Fumadocs with live previews, LTR/RTL and locale switches, static export.
- `check-ds`: no hex, palette colours, physical directions or `dark:`; message parity across 18
  locales; every item has a test, an example and a docs page.

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
