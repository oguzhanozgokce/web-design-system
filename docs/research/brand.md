# Catalogue identity

Designed 2026-11-08. The owner chose **Highwren UI**, extending their existing Highwren developer
identity. Use that spelling in page titles, navigation, documentation and project notices. The GitHub
repository URL, `@ds` registry namespace and installed component names remain unchanged.

## Direction

The [homepage study](homepage.md) established the reference set. Linear and Radix show how a compact,
single-colour symbol can sit beside a wordmark without competing with the interface. HeroUI's soft
geometry and Astryx's restrained surfaces remain the project's visual references. These are design
observations, not permission to reuse their logos.

Our mark is an abstract bird with a lifted, connected wing and a rounded body. The ascending diagonal
expresses the owner's "high + wren" story; it is a brand metaphor, not a literal dictionary definition
or species illustration. A small eye, pointed beak and one wing cutout distinguish the bird from a
generic geometric mark. The silhouette stays connected and readable when small cutouts soften at
16px. Filled geometry needs no feathers, thin strokes or effects. The path is original and has no
animation, font or image dependency in the page. Keep its orientation in RTL;
a brand symbol is not a directional control.

Use the open symbol in `primary` beside the visible name. It is decorative there and hidden from
assistive technology; the surrounding link supplies its accessible name. Keep at least the built-in
clear space. Do not stretch, add shadows or introduce extra colours.

## Source and exports

- `lib/brand.ts` owns the path. `components/brand-mark.tsx` renders it for navigation and the footer.
- `scripts/generate-brand.ts`, included in `npm run generate`, produces the static assets from the
  same path and the generated `primary-solid` / `on-primary-solid` roles. No independent colour
  values are maintained. Sharp is a build-time dependency only.
- `/favicon.svg` is the scalable mark on a rounded accent tile. `/favicon.png` is the 96px raster
  fallback, also suitable for search results. Both use stable URLs.
- `/brand/mark.svg` is the standalone symbol without a background or wordmark, in the generated
  primary solid colour. `/brand/mark.png` is its transparent 512px raster export for app and design
  assets. These are the plain app-icon source; use the favicon and touch-icon variants for browsers.
- `/apple-touch-icon.png` is 180px with an opaque square background; the operating system applies
  its own mask. Keep the mark inside the safe area.
- `app/layout.tsx` declares the icon links for every route, including the static export.

The [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search)
requires a square, crawlable, representative icon at a stable URL and recommends more than 48px.
The 96px PNG covers that recommendation. Local assets and metadata prepare the site for publication;
they do not make the private project discoverable or guarantee inclusion in search results.

Verify the icon at 16, 24, 32 and 48px on light and dark backgrounds, check mobile navigation, and
inspect the built HTML and exported image dimensions. This static identity needs visual and build
checks, not additional component interaction tests. Refresh README screenshots when the mark is
visible in them.
