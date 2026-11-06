# Web Design System

Material 3 components for React: marketing sites, admin panels and signed-in user panels. The web
twin of the Compose Multiplatform [mobile design system](https://github.com/oguzhanozgokce/mobile-design-system).

- **One seed, every role.** `tokens/config.json` holds a brand colour; the generator produces all
  Material 3 roles plus success, warning and info, in light and dark, at three contrast levels. It
  runs the same algorithm and colour spec (2025, phone) as MaterialKolor 6 on mobile, so the same
  seed gives the same hex values on Android, iOS and the web.
- **Source you own.** Components install with the shadcn CLI from the `@ds` registry. Each project
  owns its copy; `--diff` brings upstream changes.
- **Accessible.** Interactive components are built on React Aria Components. Every component is
  tested in a real browser with axe, in light, dark and right-to-left.
- **Localised.** Built-in strings ship in 18 languages; dates, numbers and calendars follow the
  locale; layout uses logical properties only.

## Why a registry and not an npm package

Every consuming site customises components a little: a different default size, an extra variant
for one landing page. With an npm package that means overriding classes from outside or forking.
With a registry the component is a file in the project, so the change is an edit, and Tailwind sees
the classes without `@source` tricks. Only what must never fork (tokens, utilities) is shared as-is.

## Why React Aria

The apps ship 18 locales including Arabic and Thai. React Aria handles right-to-left keyboard
navigation, 13 calendar systems and localised date entry, which other primitive libraries leave to
the app. HeroUI v3 and BoardUI, the two closest reference libraries, made the same choice.

## Why the theme is generated

The Compose library already builds its `ColorScheme` from one brand colour with MaterialKolor.
Hand-copying hex values into CSS drifts. Generating both sides from the same seed, style, spec and
platform cannot drift.

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

Apache-2.0, like the mobile library. Third-party code adapted into components is listed in
`THIRD_PARTY_NOTICES.md`.
