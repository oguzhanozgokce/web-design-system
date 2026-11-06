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
3. Read the Compose counterpart if one exists:
   `~/AndroidStudioProjects/mobile-design-system/designsystem-core/src/commonMain/kotlin/app/oguzhanozgokce/designsystem/component/DS<Name>.kt`.
   Keep its variant names, sizes and behaviours where they make sense on the web.
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
- Put `data-variant`, `data-size` and other variant values on the root. Read RAC state from its data
  attributes in classes: `data-[selected]:`, `data-[disabled]:`, `data-[focus-visible]:`,
  `data-[pressed]:`, `data-[invalid]:`, `data-[open]:`/`data-[entering]:`/`data-[exiting]:`.
- Interactive surfaces use `state-layer` (hover, press and focus overlay in `currentColor`) and
  `focus-ring` (or `focus-ring-inset` inside lists and tables).
- Colours: only Material 3 roles. Containers pair with their `on-` role. Disabled is
  `text-on-surface/38` and `bg-on-surface/12`.
- Type: `text-body-md`, `text-label-lg`, `text-title-md` and the rest of the M3 scale.
- Corners: `rounded-xs` 4, `-sm` 8, `-md` 12, `-lg` 16, `-xl` 28, `-full`. Elevation:
  `shadow-elevation-1`…`5` only for floating surfaces.
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
- Motion: CSS transitions with `ease-standard`, `ease-emphasized-decelerate`, `ease-spatial` (spring
  as `linear()`), durations 150/250/400ms. `motion/react` only for physics, drag and layout, with
  `spatialSpring()`/`effectSpring()` from `@/registry/ds/lib/motion`, gated by
  `useMotionPreference()`. Every animation has `motion-reduce:` handling.
- Overlays animate with RAC's state attributes and the keyframes in `theme.css`:
  `data-[entering]:animate-ds-popover-in data-[exiting]:animate-ds-popover-out` for popovers, menus
  and tooltips; `animate-ds-dialog-in/out` for dialogs; `animate-ds-sheet-in-{bottom,top,start,end}`
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

Use `renderWithDS` and `expectNoA11yViolations` from `@/test/utils`. Vitest globals are on. Cover:

- Rendering with the right role and accessible name.
- The main interactions with `await locator.click()`, `userEvent.keyboard('{ArrowDown}')` from
  `vitest/browser` (`import { userEvent } from 'vitest/browser'`), and callbacks via `vi.fn()`.
- Controlled and uncontrolled value where relevant.
- Disabled and invalid states.
- If the component has labels: the English defaults, a `labels` prop override and a
  `DSProvider labels` override (`renderWithDS(ui, { provider: { labels: { thing: {...} } } })`).
- `expectNoA11yViolations` in light, `{ dark: true }` and `{ locale: 'ar' }`. Axe checks real
  colour contrast against the real theme, so a failure here is a real defect. Fix the colours, never
  disable the rule.
- Overlays render in a portal: query them from `page` (`import { page } from 'vitest/browser'`) and
  check axe on `document.body`.

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
