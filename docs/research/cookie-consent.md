# Cookie consent study

Reviewed on 2026-11-07 for a web privacy notice. The current visual specification remains
`web-style.md`; no upstream implementation was copied.

- [Astryx components](https://astryx.atmeta.com/components): neutral overlay surfaces, restrained
  type hierarchy, thin borders and clear action groups.
- [HeroUI](https://heroui.com/): soft control shapes and short, responsive overlay transitions.
  Shapes and interaction patterns only, consistent with the existing licence verdict.
- [Bencho dynamic island](https://bencho.dev/blocks/dynamic-island): a compact surface can become
  a larger one while retaining a clear identity. Use that continuity for preferences, with a
  fluid tween rather than copying the island or its spring implementation.
- [CookieConsent playground](https://playground.cookieconsent.orestbida.com/): visible first-layer
  accept/reject actions, read-only required categories, optional categories and distinct save
  semantics. Its storage and script-management engine is outside this component's scope.
- The supplied [21st.dev](https://21st.dev/), [React Bits](https://reactbits.dev/),
  [BoardUI](https://www.boardui.com/), [ObsidianUI](https://www.obsidianui.dev/components) and
  [EasyUI](https://easyui.site/components/page/2) galleries were also reviewed for visual context.
  No marketplace, restricted, paid or gallery source code was used.

These references provide visual and interaction evidence. Current decisions live in section 2.43
of `web-style.md`; installation and application ownership are documented in the catalogue.
