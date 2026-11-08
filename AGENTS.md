# Highwren UI

React components for marketing sites, admin panels and signed-in user panels, distributed as a
shadcn registry under `@ds`. Consumers own the installed source. Public names, defaults and
behaviour are SDK contracts.

## Sources of truth

- `docs/research/web-style.md`: visual specification and settled Decisions. HeroUI shapes and
  liveliness on Astryx neutral surfaces, with 40px controls by default.
- `content/docs/foundations/conventions.mdx`: public API and implementation conventions.
- `docs/testing.md`: test selection, placement and verification.
- `.claude/skills/ds-component/SKILL.md`: component delivery workflow.
- `docs/research/libraries.json` and `wave-2-requests.md`: historical evidence and source references,
  not current API instructions. Use web references when making design decisions.
- `ROADMAP.md`: planned components and delivery status.

Read the shared contracts and only the sections relevant to the task. Use targeted searches in
historical research instead of loading whole surveys. Document each rule in one canonical place;
link to it from other guides. Keep API tables, required examples and operational steps precise.

## Repository

`registry/ds` contains installable `ui`, `lib`, `hooks`, `blocks` and `styles`. Component browser
tests sit beside their implementation; pure helper tests use `.test.ts`. `registry/ds/examples`
contains catalogue-only default exports. Each `registry/items/*.json` owns its installable files.
`content/docs` holds Fumadocs pages. `tokens/config.json` configures generated colours;
`registry/ds/styles/theme.css` is hand-written. Scripts generate tokens, icons, registry metadata
and the example index.

## Required contracts

- Use semantic colour roles with their matching text roles, logical directions and the radius,
  typography and motion rules in the visual specification. No palette colours, painted hex,
  `white`/`black`, `dark:` variants or physical direction utilities. Hex seeds are engine input.
- Build interactive controls on React Aria Components. Keep its prop naming and accessibility
  patterns. Use `variant`, `tone`, `size` and public state data attributes consistently.
- Async actions own their pending state and ignore repeat triggers. Icon-only actions use
  `IconButton` with a required accessible name; built-in glyphs come from `useIcons()`.
- Built-in wording has exported typed English defaults and per-component/provider `labels`
  overrides. Consumer content stays ordinary props. Dates and numbers follow the provider locale.
- Registry imports use `@/registry/ds/...`; no relative imports, `next/*`, `next-intl`, catalogue
  imports or `lucide-react`. Installed files must work outside this repository.
- Keep examples, docs and generic test copy in English, neutral and product-independent. Only required licence headers belong in code; explain decisions
  in docs and commit messages. New behaviour gets a descriptive component name, never `V2`.
- Never copy React Bits, 21st.dev, Aceternity or paid-tier code. Record adapted MIT/ISC source in
  item `credits`; keep licence decisions in `docs/research/README.md`.

## Delivery and verification

Ship implementation, regression coverage, examples, item metadata and docs together when affected.
Shared files may be changed when the task requires it. During explicitly coordinated parallel
work, agree ownership and avoid overwriting another agent's changes.

Run focused tests while editing, then run these once for the final change:

```bash
npm run generate
npm run check
npm test
npm run check:registry
npm run build
```

Report passed and failed checks, plus anything not run. Preserve command exit codes. Do not assume
a dev server or port exists. Commit, merge or push only when asked, including in consuming apps.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
