# Web design system

React component library for every web project: marketing sites, admin panels and signed-in user
panels. It is the web twin of the Compose Multiplatform library in
`~/AndroidStudioProjects/mobile-design-system`: same Material 3 roles, same seed-generated colours,
same motion springs, same rule that a decision reads the same on both platforms. Treat it as an SDK:
every public name, default and behaviour is a promise to several apps.

Components ship as a shadcn registry (`@ds` namespace). A project installs a component and owns the
copy, so the source in `registry/ds` must work after the shadcn CLI copies it somewhere else.

## Layout

| Path                    | Contains                                                                |
| ----------------------- | ----------------------------------------------------------------------- |
| `registry/ds/ui/`       | Components and their `*.test.tsx` tests                                 |
| `registry/ds/lib/`      | `utils`, `labels`, `icons` (generated), `motion`, `color-scheme`        |
| `registry/ds/hooks/`    | Shared hooks                                                            |
| `registry/ds/blocks/`   | Whole sections: app shell, settings page, sign-in                       |
| `registry/ds/styles/`   | `theme.css` (hand-written) and `tokens.css` (generated)                 |
| `registry/ds/examples/` | Docs examples, one default export each; never installed                 |
| `registry/items/*.json` | One registry item each; `registry.json` is generated from them          |
| `content/docs/`         | The catalogue (Fumadocs MDX)                                            |
| `tokens/config.json`    | Seed colour and palette style                                           |
| `scripts/`              | Generators and `check-ds`                                               |
| `docs/research/`        | Reference-library research and license verdicts. Read before designing. |
| `ROADMAP.md`            | Every planned component, its wave and its references                    |

## How to work

1. Read `.claude/skills/ds-component/SKILL.md` before writing or changing a component.
2. Read `registry/ds/ui/button.tsx`, its test, examples, item and docs page. Match their shape.
3. Search `docs/research/libraries.json` for the component and read the references it names.
4. Ship the change whole: component, labels, test, examples, item, docs page.
5. Verify with the commands below. Report what ran, what passed and what was not checked.

## Rules for every change

- Material 3 roles only (`bg-surface-container-low`, `text-on-primary`), in matching pairs. No hex,
  no Tailwind palette colours, no `white`/`black`, no `dark:`. `check:ds` enforces this. The one
  hex literal allowed is a seed handed to the colour engine (`seed: '#0B8F6A'`, `seed="#0B8F6A"`):
  it is input to a scheme, not a colour anything is painted with.
- Logical directions only: `ms-`/`me-`, `ps-`/`pe-`, `inset-s-`/`inset-e-`, `rounded-s-`, `border-e`,
  `text-start`. Flip directional glyphs with `rtl:-scale-x-100`.
- Interactive components are built on React Aria Components. Never hand-roll focus management,
  keyboard handling or ARIA patterns that RAC provides.
- Props follow React Aria naming (`isDisabled`, `onPress`, `value`/`defaultValue`/`onChange`).
  Variants follow Material 3 (`filled`, `tonal`, `outlined`, `text`, `elevated`; sizes `xs`–`xl`;
  `tone: 'default' | 'destructive'`). A new behaviour is a new component, never `V2`.
- Async actions are promises: the component owns the pending state.
- Icon-only actions are `IconButton`, with a required `aria-label`. Glyphs come from `useIcons()`.
- The library ships no translations. Every string a component writes on its own (an accessible
  name, a placeholder, "Close", "3 selected") has an English default in the component's exported
  `default<Name>Labels`, typed by `<Name>Labels`, and is replaced through the component's `labels`
  prop or app-wide through `<DSProvider labels={{ <namespace>: {...} }}>`. Content the consumer
  always supplies (titles, descriptions, button text) stays an ordinary prop. Dates, numbers and
  right-to-left layout still follow `DSProvider locale` through React Aria.
- Animation respects `useMotionPreference()` and `motion-reduce:`. Springs come from `lib/motion`.
- Registry files import each other only through `@/registry/ds/...`. No relative imports, no
  `next/*`, `next-intl` or `lucide-react` in `registry/`.
- Example and docs copy is neutral and fits any product (Save, Search, Settings, Photos). Nothing
  hints at one app: no ledgers, invoices, payouts or company names.
- No comments in code. Reasoning goes in commit messages, this file and the docs.
- Copy no code from React Bits, 21st.dev, Aceternity or any paid tier. Code adapted from an MIT
  source is credited in the item's `credits`.

## Verify

```bash
npm run generate     # tokens, icons, registry.json and the docs example index
npm run check        # tsc, eslint, prettier, check-ds
npm test             # Vitest browser mode with axe, on Chromium
npm run build        # static export of the catalogue
```

## Delivery

- Commit, merge or push only when the user asks. Commit messages say why, in prose, and what was
  verified.
- Never commit to a consuming app (cosum-web and the others) unless asked.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
