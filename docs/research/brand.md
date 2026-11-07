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

## Preliminary trademark and logo screen — 2026-11-08

This is a dated research record, not legal clearance or a claim that the name or symbol is unique.
Independent authorship of the SVG does not establish freedom to use it as a trademark. The review
covered public web use, the Turkish and US search interfaces, and EUIPO's TMview aggregation.

### Name searches

| Source | Query and scope | Observed result |
| --- | --- | --- |
| [TÜRKPATENT](https://www.turkpatent.gov.tr/arastirma-yap) | `Highwren`, then `High Wren`; contains; all mark types and classes | No results for either query |
| [USPTO](https://tmsearch.uspto.gov/) | `CM:(highwren OR "high wren" OR "high-wren" OR hiwren OR hywren OR highren)`; no class or status restriction | No results |
| [TMview](https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&basicSearch=Highwren) | `Highwren`; contains; no office, class or status restriction | No rows found |
| [TMview fuzzy search](https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=F&basicSearch=Highwren) | `Highwren`; fuzzy; no office, class or status restriction | One result: Highpren, German application 1171201, class 17, shown as expired |

These negative results are limited to those queries and the data available at the time. They do not
rule out unregistered use, spelling or pronunciation variants outside the search, delayed records,
or conflicts in other jurisdictions. TMview itself states that it is not an official register.

The shared word `Wren` is already used in software, including [Wren AI](https://www.getwren.ai/),
its documented [Wren UI application](https://docs.getwren.ai/oss/overview/how_wrenai_works), and the
[Wren programming language](https://wren.io/). Keep the full Highwren identity rather than shortening
it to Wren UI. This is a naming recommendation, not a finding of infringement.

### Logo screening and specific records

The existing transparent `public/brand/mark.png` was submitted to TMview's EUIPO Image Search with
the full image selected, no word query, colour matching off and OCR off. The service returned a
999-result candidate set. Filtering to Nice classes 9 or 42 returned 166 candidates; additionally
selecting Filed or Registered returned 106. The first 30 of that filtered set were visually reviewed;
not every candidate or jurisdiction was examined. These counts are search-engine candidates, not
counts of infringements or proof that the search is exhaustive. Some records had no image available.

| Record | Verified scope and status | Relevance to this mark |
| --- | --- | --- |
| [Copilot Systems Inc., US serial 97368047](https://tmsearch.uspto.gov/search/search-results/97368047) | Registration 7589429; registered 2024-12-03; live and registered in USPTO; classes 9 and 41, fitness software and training | The upward-left wing, internal wing cutout and right-facing head merit comparison. Highwren has a fuller body, separate round eye and different tail/head geometry. The marks are not identical. |
| [WRENAI, US serial 98878463](https://tmsearch.uspto.gov/search/search-results/98878463) | Canner Inc.; registration 7925919; registered 2025-09-02; live and registered in USPTO; classes 35 and 42, including software development and SaaS | A bird plus a Wren-based name in software is relevant to the combined brand impression. Its outlined, perched bird differs from Highwren's filled flying silhouette. |
| [Nomad Insurance, EU application 019420253](https://www.tmdn.org/tmview/#/tmview/detail/EM500000019420253) | TMview showed application published on 2026-10-14, not a completed registration; classes include 9 and 42 | Another filled bird with a round eye and wing cutouts. Its wing direction and overall proportions differ. The class 9 description includes insurance and assistance applications. |
| [iNaturalist, US serial 88875415](https://www.tmdn.org/tmview/#/tmview/detail/US500000088875415) | TMview showed registered; class 9, citizen-science mobile software | A right-facing flying bird with an eye and several extended wings. Multiple wings and a narrower body distinguish it from Highwren. |

The [Wren climate platform](https://www.wren.co/) also uses a rounded bird with an eye and wing
cutout. Its site was inspected visually; its trademark registration status was not established.

### Decision and limits

The screen did not identify a direct Highwren name match that warrants an immediate rename. The
logo's silhouette warrants further differentiation before public release, particularly its raised
wing and internal cutout. Prefer a distinctive overall construction over a colour-only change.
The current assets were not changed by this research.

This recommendation is visual and technical judgment. A shared class, bird motif or word fragment
alone does not decide a legal conflict. The [USPTO's confusion guidance](https://www.uspto.gov/trademarks/search/likelihood-confusion)
considers overall similarity and related goods/services; its [search guidance](https://www.uspto.gov/trademarks/search/federal-trademark-searching)
also requires going beyond exact matches. Before a commercial filing or launch, a qualified trademark
professional should assess the final word mark and device in the intended markets, including
unregistered rights and the actual goods/services description. No application, opposition or contact
with another rights holder was made. Recheck current records before relying on this dated screen.
