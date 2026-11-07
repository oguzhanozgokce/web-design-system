---
name: ds-component
description: Recipe for adding or changing a component in the web design system — files, API, styling, accessibility, labels, motion, tests, docs and the registry item.
---

# Adding a component

The reference implementation is Button. Before writing anything, read:

- `registry/ds/ui/button.tsx`, `button.test.tsx`
- `registry/ds/examples/button-*.tsx`
- `registry/items/button.json`
- `content/docs/components/actions/button.mdx`
- `registry/ds/ui/ds-provider.tsx`, `registry/ds/lib/utils.ts`, `registry/ds/styles/theme.css`

## 1. Design the API first

1. Search `docs/research/libraries.json` for the component (and close synonyms). Read every
   `standout`, `apiNotes`, `borrow` and `avoid` entry that mentions it.
2. Read the React Aria Components docs page for the primitive you build on
   (`https://react-aria.adobe.com/<Component>` or `node_modules/react-aria-components/dist/types.d.ts`).
3. Read `docs/research/web-style.md`: section 1 (foundations), section 3 (variant API), section 4
   (tokens), its section 2 entry for the component, and the Decisions list at the end, which is
   settled.
4. Free-tier MIT sources (BoardUI, Astryx, EasyUI, ObsidianUI's own blocks, Bencho's free blocks,
   shadcn/ui) may be read with `gh api repos/<owner>/<repo>/contents/<path>` and adapted. Record each
   adapted source in the item's `credits`. Never copy from React Bits, 21st.dev, Aceternity or a paid
   tier; ideas from them are fine, code is not.

## 2. Files you own

For a component named `thing` in category `inputs`:

| File                                       | Purpose                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `registry/ds/ui/thing.tsx`                 | The component(s) and the exported `thingStyles`                               |
| `registry/ds/ui/thing.test.tsx`            | Browser tests                                                                 |
| `registry/ds/examples/thing-demo.tsx`      | The first preview on the page; plus `thing-<case>.tsx` for each example       |
| `registry/items/thing.json`                | The registry item                                                             |
| `content/docs/components/inputs/thing.mdx` | The docs page                                                                 |
| `registry/ds/hooks/use-thing-*.ts`         | Only if the hook is specific to this component; list it in the item's `files` |

Never edit files you do not own: `theme.css`, `utils.ts`, `ds-provider.tsx`, `labels.ts`, `icons.tsx`,
`motion.ts`, scripts, other components, `meta.json` files. Import other components instead. If a
shared file blocks you, say so in your final report instead of editing it.

## 3. Component code

- First line `'use client';` if the file uses hooks, context or event handlers.
- Build on React Aria Components. Style with `tv()` from `@/registry/ds/lib/utils` and pass RAC's
  render-prop `className` through `composeRenderProps`, as Button does. Export the `tv` result as
  `thingStyles` (or a `slots` object for multi-part components).
- Multi-part components use `tv({ slots: {...} })` and export each part as its own component
  (`Card`, `CardHeader`, `CardTitle`...). Every part gets `data-slot="<part>"`.
- Variants: `variant` is how much ink (`solid | soft | outline | ghost`, or the component's own set
  from the spec), `tone` is which role paints it (`primary | neutral | error`, plus
  `success | warning | info` on status components), `size` is `sm | md | lg` at 32/40/48px. Use
  `tv` `compoundVariants` for variant × tone, as Button does. `solid` defaults to `primary`, the
  quieter variants to `neutral`.
- Put `data-variant`, `data-tone`, `data-size` and other variant values on the root. Read RAC state
  from its data attributes in classes: `data-[selected]:`, `data-[disabled]:`,
  `data-[focus-visible]:`, `data-[pressed]:`, `data-[invalid]:`,
  `data-[open]:`/`data-[entering]:`/`data-[exiting]:`.
- Interaction: hover swaps the fill to its `-hover` role (`data-[hovered]:bg-neutral-soft`,
  `data-[hovered]:bg-primary-solid-hover`), press keeps it and scales (0.98 sm, 0.97 md, 0.96 lg),
  `transition-control` times both. Disabled is `opacity-50` plus `cursor-not-allowed` on the root,
  never per-part colours. Focus is `focus-ring` (or `focus-ring-inset` inside lists and menus);
  error-tone controls set `[--focus-color:var(--error)]`.
- Colours: layers `bg-canvas`, `bg-surface-raised`, `bg-surface-overlay`, `bg-surface-segment`,
  `bg-surface-thumb`; solid fills `bg-{tone}-solid text-on-{tone}-solid` for every filled accent;
  soft fills `bg-{tone}-soft text-on-{tone}-soft` and `bg-neutral-soft text-on-surface`; hairlines
  `border-outline-subtle`, field borders `border-outline-variant`. Text-coloured accents keep
  `text-primary`. The full list is the `@theme inline` block of `theme.css`.
- Type: Tailwind sizes with explicit weights. Control labels `text-sm font-medium`, small controls
  `text-xs font-medium`, descriptions `text-xs text-on-surface-variant`, card titles
  `text-sm font-semibold`, dialog titles `text-base font-semibold`.
- Corners: the radius families `rounded-control` (pills), `rounded-field`, `rounded-item`,
  `rounded-overlay`, `rounded-container`, `rounded-dialog`. Tailwind's `rounded-sm` (4px),
  `-md` (6px), `-lg` (8px) and `-xl` (12px) are for small parts such as checkboxes and key caps.
  Shadows: `shadow-xs`…`shadow-lg`, only for raised and floating things.
- Directions: logical utilities only (`ms-`, `pe-`, `inset-s-`, `rounded-e-`, `border-s`,
  `text-start`). Directional glyphs (arrows, chevrons pointing forward/back) get
  `rtl:-scale-x-100`.
- Icons: `const icons = useIcons();` then `<icons.chevronDown />`. Accept consumer icons as
  `ReactNode` props and size them with the `--icon-size` pattern from Button.
- Built-in text: the library ships no translations; the consumer supplies text. In `thing.tsx`:

  ```tsx
  export interface ThingLabels {
    close: string;
    pageOf: LabelTemplate<{ page: string; total: string }>;
  }

  export const defaultThingLabels: ThingLabels = {
    close: 'Close',
    pageOf: 'Page {page} of {total}',
  };
  ```

  (`LabelTemplate` comes from `@/registry/ds/lib/labels`.) Every public component that writes text
  takes `labels?: Partial<ThingLabels>` and reads it with
  `const t = useLabels('thing', defaultThingLabels, labels);` (from `ds-provider`), then `t.close`
  or `t.format('pageOf', { page, total })`. A template is a string with `{placeholders}` or a
  function of the values, so a consumer can plug in an i18n library with plurals. Format numbers
  with `Intl` and the locale from `useLocale()` before passing them in. Parts of one component share
  its labels: pass `labels` down rather than giving each part its own. Content the consumer always
  supplies (titles, descriptions, button text) stays an ordinary prop, not a label. The namespace is
  the component name in camelCase (`thing`, `comboBox`); DSProvider's `labels` uses the same key.

- Formatting: numbers, dates and currencies go through `Intl` or React Aria with the locale from
  `useLocale()`. Never `toFixed` for display.
- Motion: CSS transitions with `ease-fluid` (sliding indicators, thumbs, sheets), `ease-out-quad`
  (dialogs, disclosure height) or `ease-out` (colours), over 100–350ms. `motion/react` only for
  physics, drag and layout, with `spatialSpring()`/`effectSpring()` or `fluidTween()` from
  `@/registry/ds/lib/motion`, gated by `useMotionPreference()`. Every animation has
  `motion-reduce:` handling.
- Overlays animate with RAC's state attributes and the keyframes in `theme.css`:
  `data-[entering]:animate-ds-popover-in data-[exiting]:animate-ds-popover-out` for popovers, menus
  and tooltips (set `[--ds-popover-scale:0.9]` for the larger grow of popovers and tooltips); `animate-ds-dialog-in/out` for dialogs; `animate-ds-sheet-in-{bottom,top,start,end}`
  and `-out-` for sheets (start/end follow `dir`); `animate-ds-fade-in/out` for scrims;
  `animate-ds-toast-in/out` for toasts. Reduced motion turns all of them into fades globally.
- Async: callbacks that start work (`onPress`, `onConfirm`, `onSubmit`, `onAction`) may return a
  promise; the component shows its own pending state and ignores repeat triggers.
- Controlled and uncontrolled: `value`/`defaultValue`/`onChange` (RAC does this for you).
  `useControllableState` from `@/registry/ds/hooks/use-controllable-state` when RAC does not.
- Imports between registry files use `@/registry/ds/...` only. No relative imports, no `next/*`,
  no `next-intl`, no `lucide-react`.
- No comments anywhere: not in TSX, not in JSX, not in CSS strings. Name things instead.
- Types: export the props interface (`ThingProps`) for every public component.

## 4. Tests (`*.test.tsx`)

Use `renderWithDS` and `expectNoA11yViolations` from `@/test/utils`. Vitest globals are on.

A test earns its place only if it can fail for a reason nobody would catch otherwise. Every test
runs in a real browser and costs time on every run, so fewer, stronger tests beat many small ones.

Write a test for:

- Behaviour this component adds: what it does on press, on keys, on change; controlled and
  uncontrolled value where both exist; what disabled and invalid change in _our_ code.
- Contracts a consumer relies on: the accessible name and role, the `data-*` attributes and props
  that are public API, the labels contract (one test: English defaults, `DSProvider labels`, then
  the `labels` prop winning).
- Accessibility: one axe test per component that renders its richest state (open, selected,
  invalid) and loops over light, `{ dark: true }` and `{ locale: 'ar' }`. Axe checks real contrast,
  so a failure is a real defect: fix the colours, never disable the rule. Overlays render in a
  portal: query them from `page` and check axe on `document.body`.
- A bug that happened: name the bug in the test title so nobody deletes it as noise.

Do not write a test for:

- React Aria, motion or the browser doing their job (a RAC button is focusable, Escape closes a
  RAC dialog, a disabled RAC button ignores presses) unless our code wires or changes it.
- What TypeScript already enforces, constants, or class strings. Assert computed styles or data
  attributes, and only when the value is the contract (the size scale, a colour role on a state).
- Each variant or size on its own when one table-driven test, or one render of them all, proves
  the same thing.
- The same assertion twice: if test B repeats a check of test A on the way to its own point, cut
  the repeat or fold the two into one scenario.
- Axe once per variant or per mode: one sweep covers them.
- Timing, pixel offsets or animation frames unless the motion is the product (a rolling carry, a
  morph that must not jump), and then assert the end state, not the frames.

Prefer one scenario that walks through a real use (open, pick, close, the value is set) over five
tests that each set up the same render to check one line. Keep test copy neutral, like examples.

Run only your files: `npx vitest run registry/ds/ui/thing.test.tsx`.

## 5. Examples and docs

- Examples are tiny default-export components that show one idea each and use neutral copy that
  fits any product, in the style of HeroUI and Astryx: Save, Search, Settings, Profile,
  Notifications, Photos / Videos / Music, Copy / Cut / Paste, Day / Week / Month. No domain of one
  app (no ledgers, invoices, payouts, company names), never lorem ipsum, never fake testimonials.
  Show the component itself; compose a scene only when the example is about composition. They look
  good centred in a 56rem-wide frame and at 375px.
- The docs page follows `button.mdx`: frontmatter `title` and `description` (same as the item),
  a `<ComponentPreview name="thing-demo" />`, `## Installation` with `<InstallCommand name="thing" />`,
  `## Usage`, `## Examples` (one `###` per example with one or two sentences of guidance), `## API`
  (props table per exported component including `labels`, data attributes, and a `### Labels`
  table of key, English default and what it is used for, as in `button.mdx`),
  `## Accessibility`. Use `align="start"` or `align="stretch"` on previews of wide components.
- Docs language is short, plain English.

## 6. Registry item

```json
{
  "name": "thing",
  "type": "registry:ui",
  "title": "Thing",
  "description": "One sentence, same as the docs page.",
  "category": "inputs",
  "files": ["ui/thing.tsx"],
  "credits": [
    {
      "source": "BoardUI",
      "url": "https://github.com/BoardUI/boardui/blob/main/...",
      "license": "MIT",
      "copyright": "Copyright (c) 2026 Mertcan Dundar Esmergul (BoardUI)"
    }
  ]
}
```

`dependencies` and `registryDependencies` are derived from imports. Omit `credits` when nothing was
adapted.

## 7. Verify your files

```bash
npx tsx scripts/build-registry.ts
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "registry/ds/(ui|examples|hooks)/thing" || echo "types clean"
npx eslint registry/ds/ui/thing* registry/ds/examples/thing-* content/docs/components/*/thing.mdx --no-warn-ignored
npx prettier --write registry/ds/ui/thing* registry/ds/examples/thing-* registry/items/thing.json content/docs/components/*/thing.mdx
npx tsx scripts/check-ds.ts registry/ds/ui/thing.tsx registry/ds/examples/thing-demo.tsx
npx vitest run registry/ds/ui/thing.test.tsx
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4310/docs/components/inputs/thing
```

Other agents may be editing other components at the same time. Ignore type or lint errors in files
you do not own. Do not run `npm run build`, `npm run dev` or `npm run generate`. The dev server on
port 4310 is already running; a 200 from it means the page compiled.
