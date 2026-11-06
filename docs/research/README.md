# Research

On 2026-11-06 eight reference libraries and the state of component-library tooling were researched
in parallel. `libraries.json` holds one record per library, with its license verdict, stack, standout
components with API notes, what to borrow and what to avoid. `tooling.json` holds the tooling survey.
Search them for a component name before designing it.

## License verdicts

Checked again against each repository's `LICENSE` with `gh api repos/<repo>/license`.

| Library                                            | License                          | What the library may take                                                       |
| -------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Astryx, `meta/astryx`                              | MIT                              | Code with Meta's notice. Mostly API and behaviour: it is StyleX, not Tailwind.   |
| HeroUI v3, `heroui-inc/heroui`                     | Apache-2.0, Pro is paid          | Patterns only. Copied files would need change notices inside them.              |
| BoardUI, `BoardUI/boardui`                         | MIT free tier, Pro is paid       | Free-tier code with the notice. Never Pro components or templates.              |
| EasyUI, `Surajmaurya1/easyui`                      | MIT                              | Code with the notice, rewritten onto roles and logical properties.              |
| ObsidianUI, `Atharvsinh-codez/ObsidianUI`          | MIT                              | Its own blocks. Not `ClickSpark` (a React Bits port) and not its shadcn copies. |
| Bencho, `cabralorenzo/bencho`                      | MIT for the 46 free blocks       | Free blocks in the repository only. Never the Pro blocks on bencho.dev.         |
| React Bits, `DavidHDev/react-bits`                 | MIT + Commons Clause             | **Nothing.** Redistribution "as a ported version" is forbidden. Ideas only.     |
| 21st.dev                                           | Per component, plus its terms    | **Nothing from 21st.dev itself.** Find the author's repository and check there. |

Code adapted from an MIT source is recorded in the item's `credits` field in `registry/items/*.json`;
`THIRD_PARTY_NOTICES.md` is generated from those fields.

## Tooling decisions

| Topic       | Choice                                                    | Why                                                                                  |
| ----------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Primitives  | React Aria Components 1.22                                 | 18 locales with Arabic and Thai calendars; the closest references (HeroUI, BoardUI) use it |
| Variants    | tailwind-variants 4                                       | Slots, zero dependencies; class-variance-authority has not released since 2024       |
| Colour      | @material/material-color-utilities 0.4, spec 2025, phone  | Same engine and spec as MaterialKolor 6 on mobile                                     |
| Distribution| shadcn registry, `@ds` namespace                          | Source in the project, `--diff` upgrades, shadcn MCP for agents                       |
| Docs        | Fumadocs 16 on Next 16, static export                     | Built-in llms.txt, search and static hosting                                          |
| Tests       | Vitest 5 browser mode on Chromium, axe-core               | Real browser, real CSS, real contrast; Playwright CT was removed in 1.63              |
| Motion      | CSS first, `motion` 14 for physics, NumberFlow for numbers | No client loop for static pages; NumberFlow is MIT and honours reduced motion          |
