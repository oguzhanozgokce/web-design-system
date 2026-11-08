# Research

Current visual rules: [web-style.md](web-style.md). Public APIs: `content/docs`.
Historical surveys in `libraries.json`, `tooling.json` and `wave-2-requests.md` record evidence,
not implementation instructions. Search only the relevant entry; current dependency versions are
in `package.json`.

## License verdicts

Licence snapshot reviewed in November 2026 against repository `LICENSE` files.

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

## Focused studies

- [Cookie consent](cookie-consent.md): notice choices and preference expansion.
- [Homepage](homepage.md): catalogue composition and interaction.
- [Identity](brand.md): mark assets and dated trademark screening.
- [Reorderable list](reorderable-list.md): drag affordances and commit-on-drop.
- [Morph popover](popover-morph.md): surface animation and hover previews.

## Tooling snapshot — November 2026

| Topic       | Choice                                                    | Why                                                                                  |
| ----------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Primitives  | React Aria Components 1.22                                 | Right-to-left, locale-aware dates and numbers, 13 calendar systems; the closest references (HeroUI, BoardUI) use it |
| Variants    | tailwind-variants 4                                       | Slots, zero dependencies; class-variance-authority has not released since 2024       |
| Colour      | @material/material-color-utilities 0.4, spec 2025, phone  | Same engine and spec as MaterialKolor 6 on mobile                                     |
| Distribution| shadcn registry, `@ds` namespace                          | Source in the project, `--diff` upgrades, shadcn MCP for agents                       |
| Docs        | Fumadocs 16 on Next 16, static export                     | Built-in llms.txt, search and static hosting                                          |
| Tests       | Vitest 5 with Node and Chromium projects, axe-core        | Pure logic in Node; DOM, interaction and contrast in Chromium                        |
| Motion      | CSS first, `motion` 14 for gestures, `RollingNumber` for numbers | Own odometer; `@number-flow/react` was removed in wave 2                         |
