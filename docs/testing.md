# Testing

Test behaviour this library owns. Each scenario should reproduce a distinct consumer failure.

## Environment

- `.test.ts`: pure parsing, formatting, filtering, sorting, scales, geometry and metadata in Node.
- `.test.tsx`: hooks, interaction, focus, layout, CSS and accessibility in Chromium. Use
  `renderWithDS` and `expectNoA11yViolations` from `test/utils.tsx`. Shared setup clears hover.
- `npm run check:registry`: shadcn installation and typechecking in temporary consumers with
  default and custom aliases.

## Coverage

Cover added behaviour, changed wrapper wiring, computed public contracts and reported regressions.
Examples include async repeat suppression, confirmation gating, selection across pages, queue
cancellation, label precedence, locale handling and custom geometry.

Use one representative rich accessibility state per component across light, dark and RTL. For
portals, theme the document root and check `document.body`. Audit generated palette contrast in
Node; rendered axe checks verify CSS wiring without mounting every palette combination.

Avoid tests of unchanged React Aria/browser behaviour, TypeScript guarantees, constant snapshots,
class strings or every style permutation. Retain checks for our own focus repair, disabled
propagation, async handling and generated accessible text. Combine overlapping assertions, use
small fixtures and keep pure helper tests in Node. There is no test-count target.

## Scenario style

- Use one action sequence and assertions for its result. Query by role/name; use slots for parts
  without accessible roles. Keep helpers local unless several suites share the protocol.
- Use English copy; non-English input belongs in explicit locale/script tests with English titles.
- Wait for observable state, not fixed sleeps. Test animation frames only for a specific motion
  regression; ordinary layout tests may disable motion and assert settled geometry.
- Use computed styles for documented visual contracts. Compare each state with its semantic role,
  clear hover before resting-style assertions and use `expect.poll` for transitions. Keep axe
  contrast rules enabled.

## Run and report

Use `npx vitest run <file>` while editing, `npm run test:unit` for Node and
`npm run test:browser` for Chromium. Before delivery, run the checks in `AGENTS.md`. Preserve exit
codes and report failures or verification gaps; do not mask errors or retry arbitrarily.

Vite's cache lives in `.vitest/node_modules/.cache` to isolate worktrees sharing `node_modules`.
CI uses Ubuntu 24.04, Node 24, the npm lockfile and Chromium with system dependencies. It runs
`npm test -- --maxWorkers=2`, without automatic retries, and retains failure screenshots for seven
days. Generation and production builds must leave tracked files unchanged. Dependency/history
scans and their exceptions are documented in `SECURITY.md`.

## Hosting checks

`npm run prepare:hosting` validates registry payloads, local links, canonicals, search and sitemap
coverage after a build. `npm run build:hosting` builds and packages together.

Node tests cover unsafe/incomplete exports and broken links. Deployment tests use local Bash and
rsync with a stubbed HTTP probe to cover replacement, preserved ACME files/browser chunks,
rollback and rejection of uncommitted packages; they never contact Hostinger.

Live HTTP and consumer-installation checks are listed in
[registry hosting](registry-hosting.md#verify-a-live-deployment).
