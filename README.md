# Web Design System

React components for marketing sites, admin panels and signed-in user panels: HeroUI's soft shapes
on neutral surfaces, built on React Aria and themed from a single colour.

- **One web style.** Pill controls at 32, 40 and 48px, one variant vocabulary (`variant` solid,
  soft, outline or ghost; `tone` primary, neutral, error and the status tones), six radius families
  from `rounded-control` to `rounded-dialog`, and Tailwind's type sizes with explicit weights. The
  page is a grey canvas, cards and fields sit on raised surfaces, and the accent paints only the
  main action, checked controls and focus, with solid fills that stay vivid in dark mode.
- **One seed, every role.** `tokens/config.json` holds a brand colour; the generator produces every
  colour role plus success, warning and info, in light and dark, at three contrast levels, with
  neutral surfaces and accents from the seed. The same engine themes a card or the whole page at
  runtime, from a colour or a photo.
- **Source you own.** Components install with the shadcn CLI from the `@ds` registry. Each project
  owns its copy; `--diff` brings upstream changes.
- **Accessible.** Interactive components are built on React Aria Components. Every component is
  tested in a real browser with axe, in light, dark and right-to-left.
- **Data and motion included.** Tables with sorting, filters, selection and paging; hand-written
  bar, line and area charts with a table view for screen readers; file upload with progress;
  rolling numbers and a dynamic island. No chart or table library underneath.
- **Your words.** The library ships no translations. Every string a component writes on its own
  is an English default you replace per component (`labels`) or once for the app
  (`DSProvider labels`). Dates, numbers and calendars follow the locale, and layouts mirror for
  right-to-left.

## Why a registry and not an npm package

Every consuming site customises components a little: a different default size, an extra variant
for one landing page. With an npm package that means overriding classes from outside or forking.
With a registry the component is a file in the project, so the change is an edit, and Tailwind sees
the classes without `@source` tricks. Only what must never fork (tokens, utilities) is shared as-is.

## Why React Aria

Apps built on it run in many locales, including right-to-left ones. React Aria handles
right-to-left keyboard navigation, 13 calendar systems and localised date entry, which other
primitive libraries leave to the app. HeroUI v3 and BoardUI, the two closest reference libraries, made the same choice.

## Why the theme is generated

Hand-picked palettes drift and need a designer for every new brand. A generated scheme keeps every
foreground readable on its background at every contrast level, and the same code builds a tenant's
or a user's theme at runtime.

## Working on the library

```bash
npm install
npx playwright install chromium
npm run dev          # catalogue on http://localhost:3000
npm run check        # tsc, eslint, prettier, check-ds
npm test             # Vitest browser mode with axe
npm run build        # static export to out/
```

`AGENTS.md` has the rules, `.claude/skills/ds-component/SKILL.md` the recipe for a component,
`ROADMAP.md` the plan, and `docs/research/` the reference-library research and license verdicts.

## License

Apache-2.0. Third-party code adapted into components is listed in
`THIRD_PARTY_NOTICES.md`.
