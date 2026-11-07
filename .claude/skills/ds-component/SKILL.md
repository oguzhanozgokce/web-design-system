---
name: ds-component
description: Add or change registry components with a consistent API, focused tests, examples and docs.
---

# Component workflow

Follow `AGENTS.md` for repository constraints. Visual decisions live in
`docs/research/web-style.md`; test policy lives in `docs/testing.md`. Keep those rules in their
source documents instead of duplicating them here.

## 1. Read the affected contracts

- Read the component, its tests, item, examples and docs before changing it.
- For a new component, use Button as the reference: `registry/ds/ui/button.tsx`,
  `button.test.tsx`, `registry/items/button.json` and
  `content/docs/components/actions/button.mdx`. Read one relevant Button example.
- Read the visual spec's component entry and settled Decisions. Search
  `docs/research/libraries.json` for relevant evidence; historical proposals do not override the
  current spec or implementation contract.
- Check the installed React Aria types or official documentation for the primitive being wrapped.
  Read shared providers, utilities and styles only as needed for the change.

## 2. Ship the affected files together

For `thing` in category `inputs`:

| File                                       | Purpose                                                |
| ------------------------------------------ | ------------------------------------------------------ |
| `registry/ds/ui/thing.tsx`                 | Public components, props and styles                    |
| `registry/ds/ui/thing.test.tsx`            | Browser behaviour and accessibility                    |
| `registry/ds/lib/thing.ts` and `.test.ts`  | Extracted pure logic, when needed                      |
| `registry/ds/examples/thing-demo.tsx`      | Default-export preview; add focused examples as needed |
| `registry/items/thing.json`                | Installable file ownership and credits                 |
| `content/docs/components/inputs/thing.mdx` | Installation, examples, API and accessibility          |

List component-specific helpers in the item's `files`; shared helpers own a registry item. Update
shared infrastructure and category metadata when required by the task. Do not hand-edit generated
files. Dependencies are derived from imports.

## 3. Implement the contract

- Export public props interfaces and `thingStyles`, using `tv` slots for multipart components.
  Forward RAC render-prop `className` through `composeRenderProps`; identify parts with `data-slot`.
- Prefer RAC state and existing shared helpers. Add a helper when it removes repeated behaviour
  or makes a meaningful calculation testable; avoid abstractions for one-line forwarding.
- Add `'use client'` when hooks, context or event handlers require it.
- When a helper shares a basename with a UI component, include its `.ts` import extension so the
  shadcn installer can distinguish the files. Consumer import rewrites remove that extension.
- Components that write text export `ThingLabels` and `defaultThingLabels`, accept
  `labels?: Partial<ThingLabels>` and read `useLabels('thing', defaultThingLabels, labels)`.
  Use `LabelTemplate` for interpolated strings. Parts share one namespace and pass overrides down.
- Follow the visual spec and `content/docs/foundations/conventions.mdx` for styling, interaction,
  motion and API defaults. Preserve existing public behaviour unless the task changes it.

## 4. Test and document

Apply `docs/testing.md`. Use the smallest test that reproduces the failure; use a browser only
when the result depends on the DOM, interaction, layout or accessibility. Keep regression names
specific. Do not retest inherited RAC behaviour or assert implementation class strings.

Docs follow Button: frontmatter matching the item, a default preview, Installation, Usage,
Examples, API tables including labels and data attributes, and Accessibility. Use `align="start"`
or `align="stretch"` for wide previews. Examples demonstrate one idea, with neutral copy and a
layout that fits 375px. Documentation displays consumer imports, not registry source paths.

Items contain `name`, `type`, `title`, `description`, `category` and `files`. Add `credits` only for
adapted code, with source, URL, licence and copyright. The generator supplies dependencies and
alias-aware install targets.

## 5. Verify

Run focused tests and lint while editing. Before delivery, run the final verification commands
in `AGENTS.md`, including a clean-consumer registry check after distribution changes. Read full
TypeScript output and preserve exit codes; never filter errors into a success message. A running
dev page is useful feedback, not a substitute for the production build.
