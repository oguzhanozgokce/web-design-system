# Wave 2 reference decisions

Research from 6–7 November 2026. This records source provenance and the decisions used for the
build. Current APIs and examples live in `content/docs`; delivery status is in `ROADMAP.md`.

## Sources and licence boundaries

| Reference | Source | Use |
| --- | --- | --- |
| Bencho Dynamic island | [dynamic-island](https://github.com/cabralorenzo/bencho/tree/main/blocks/dynamic-island) | Free MIT block; size/radius continuity and activity bars |
| Bencho Stacked bars | [stacked-bars](https://github.com/cabralorenzo/bencho/tree/main/blocks/stacked-bars) | Free MIT block; capsule segments, active-column ring, gliding tooltip and mono palette |
| Bencho Upload dropzone | [upload-dropzone](https://github.com/cabralorenzo/bencho/tree/main/blocks/upload-dropzone) | Free MIT block; lift, drop feedback and upload-row transitions |
| BoardUI Data table | [data-table.tsx](https://github.com/BoardUI/boardui/blob/main/components/application/data-table/data-table.tsx) | Free MIT source; responsive toolbar and pagination patterns |
| BoardUI Earnings chart card | [Public demo](https://www.boardui.com/components/earnings-chart-card) | Pro: generic visual ideas only; source was not accessed or copied |

Adapted MIT source requires notices and item `credits`. Bencho's name, mark and photographs are
outside its code licence. Paid Bencho islands and BoardUI Pro code are excluded. The full verdicts
are in [Research](README.md); distributed attributions come from `registry/items/*.json`.

## Build decisions

- **DataTable:** React Aria `Table` plus pure sorting/filtering/paging helpers; no TanStack.
  Server mode forwards controlled state to the application. See the
  [DataTable contract](../../content/docs/components/data-display/data-table.mdx).
- **Charts:** shared `lib/chart.ts`, hand-written SVG/HTML and percentage geometry for server
  rendering; no Recharts or visx. The monotone curve is adapted from d3-shape (ISC).
  Single-series charts use `primary`; categorical charts use eight fixed `chart-*` roles.
  Legends, keyboard readouts and tables supplement colour. See
  [Chart](../../content/docs/components/charts/chart.mdx) and
  [ChartCard](../../content/docs/components/charts/chart-card.mdx).
- **Files:** keep real file validation, upload progress, cancellation and retry; exclude fake
  file trays and demo-only copy. See [FileUpload](../../content/docs/components/inputs/file-upload.mdx).
- **Numbers:** compact [NumberField](../../content/docs/components/inputs/number-field.mdx) uses
  [RollingNumber](../../content/docs/components/data-display/rolling-number.mdx), also shared by
  chart headlines and progress values.
- **Activity:** compose [DynamicIsland](../../content/docs/components/feedback/dynamic-island.mdx),
  ActivityBars and a small BarChart; the stats island is an example, not a separate public prop.

Reference markup with nested interactive elements, missing keyboard/table alternatives, fixed
English formatting, literal colours or physical directions was not carried over. Built components
follow React Aria, semantic roles, provider locale/labels and motion preferences.
