# Catalogue homepage

Visual review and redesign, 2026-11-08. This is a catalogue composition, not a new registry
component or a change to the library's visual contracts.

## References inspected

| Reference | Observation | Decision for this catalogue |
| --- | --- | --- |
| [HeroUI](https://heroui.com/) | Short, large headlines introduce working product scenes; theme controls sit beside the thing they affect. | Put a live workspace immediately below the introduction, with an adjacent colour picker. |
| [Astryx](https://astryx.atmeta.com/components) | Quiet surfaces and generous preview frames let controls carry the colour. | Keep semantic neutral surfaces, readable preview sizes and restrained accent placement. |
| [BoardUI](https://www.boardui.com/) | Dense compositions show components working in a recognisable interface. | Combine our chart, tabs, progress, checkboxes and preferences in one coherent scene. |
| [Linear](https://linear.app/) | Large, aligned type, fine separators and full-width product scenes establish a clear section rhythm. | Use a consistent content grid and open sections; reserve enclosed surfaces for actual UI. |
| [Radix](https://www.radix-ui.com/) | Real controls and source examples explain the product through use. | Give the preview real local state, and close with a truthful install command and generated file list. |

These are visual observations and our design inferences. No reference source, images, logos,
testimonials or adoption claims are copied. The landscape is our existing procedural sample;
its provenance is `scripts/generate-samples.ts`.

## Page structure

1. Short introduction with a server-rendered H1, two routes into the catalogue and the real
   component count. Important copy is visible before hydration.
2. Live workspace: colour, period selection, chart, setup checklist and preferences. The selected
   colour also applies to the gallery; neutrals remain neutral. Choices survive switching panels.
3. Three concise principles with links to the relevant foundation pages.
4. Nine selected components. Category and text filtering always search the entire catalogue;
   visitors can expand the full collection. Every tile links to its documentation.
5. An open closing section with a theme-builder link, installation guide and generated file list.
   The terminal explains the prerequisite registry configuration and uses the live public registry.

## Interaction and rendering

No automatic colour cycling, decorative timers, scroll-driven transforms or hidden hero text.
Existing DS controls own focus, keyboard handling and motion preferences. Gallery filtering does
not animate the positions of every component. Only the selected or matching previews mount;
preview fitting observes width and height so taller examples remain inside their frame.

Use a single main landmark supplied by the home layout, normal anchors and a clear heading
hierarchy. Validate the page in light and dark at mobile, tablet and desktop widths. Cover only
the new composition's wiring and full-catalogue discovery in tests; do not duplicate primitive
keyboard or animation tests. Refresh the README overview when the page changes.
