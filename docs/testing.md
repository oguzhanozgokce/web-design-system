# Testing

Test behaviour this library owns. Every test should identify a distinct consumer failure; fewer
clear scenarios are better than repeated setup and assertions. There is no test-count target.

## Choose the smallest environment

- `.test.ts` runs in Node: parsing, formatting, filtering, sorting, scales, geometry, generated
  metadata and import/path transformations. Keep pure calculations outside UI components when
  they need independent coverage.
- `.test.tsx` runs in Chromium: hooks, composed interactions, focus, layout, CSS and accessibility.
  Use `renderWithDS` and `expectNoA11yViolations` from `test/utils.tsx`.
  Shared setup moves the pointer outside the viewport before each test so hover cannot leak
  between fixtures.
- `npm run check:registry` copies the generated registry into a clean temporary consumer through
  the shadcn installer and typechecks the result. Do not replace this with catalogue-only tests.

## What deserves a test

- Added behaviour: an async action blocks repeat triggers, a confirmation phrase gates submission,
  selection survives paging correctly, cancellation stops a queue, or state updates accumulate.
- Changed wiring: a wrapper connects provider labels, invalid/disabled state or controlled values
  to a composed interaction. One scenario may exercise controlled and uncontrolled forms when
  the wrapper treats them differently.
- Public contracts our code computes: defaults, naming, label precedence, locale handling and
  custom geometry. Assert only the relevant contract, not every forwarded prop.
- Regressions: name the original failure and reproduce its trigger with the smallest fixture.
- Accessibility: one representative rich state per component, covering light, dark and RTL in
  one sweep. For portals, apply the theme to the document root and check `document.body`.

## What to remove or combine

- React Aria or browser guarantees that the wrapper does not change: generic focusability,
  Enter/Space activation, Escape dismissal, disabled event suppression and ordinary value updates.
- TypeScript guarantees, constant/style-export snapshots, class-string checks and every variant
  or size in a separate test. Use a compact table only when our mapping is the contract.
- Assertions already proved by another scenario. A label-precedence scenario can cover the English
  default, provider override and local override together.
- Large product scenes when two rows, one control or a direct helper call reproduces the issue.
- Pure helper assertions inside a browser suite. Move them to the helper's `.test.ts` file.
- Fixed sleeps, animation-frame sampling and exact coordinates for ordinary controls. Wait for
  observable state. Animation tests are justified only when motion itself is the feature; favour
  its settled result and retain frame checks only for a specific visual regression.

Do not remove useful tests just to reduce the count. Keep checks for behaviour added by a wrapper,
including its own focus repair, disabled propagation, async handling and generated accessible text.

## Keep scenarios readable

Use a small fixture, one action sequence and assertions for its result. Query by role and accessible
name; use slots for visual parts without an accessible role. Keep helper functions short and local
unless several suites use the same protocol. Avoid hidden sequencing and generic test frameworks.
Generic copy is English. Keep non-English input only in tests that explicitly exercise a locale,
script, numbering system or case conversion; use English test titles to explain the behaviour.

Use computed styles only for a documented visual contract or regression. Compare each state to its
own semantic role; editable and read-only controls may intentionally have different resting styles.
Move the pointer before asserting a resting style, and wait for transitions through `expect.poll`
when needed. Do not disable contrast rules or replace behavioural assertions with snapshots.

## Run and report

Use `npx vitest run <file>` while editing, `npm run test:unit` for pure logic and
`npm run test:browser` for UI coverage. Run `npm test` and the checks in `AGENTS.md` before delivery.
Do not turn failed commands into success with pipes, `|| echo`, ignored errors or arbitrary
retries. Report failures and verification gaps explicitly.
