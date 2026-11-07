<img src="public/favicon.svg" width="48" height="48" alt="" />

# Highwren UI

Highwren UI is a collection of React components for marketing sites, admin panels and signed-in
experiences. It started with a simple goal: bring the interface patterns I enjoy using into one
repository, then build them around a shared standard instead of starting over in every project.

That standard covers more than appearance: consistent APIs, accessible interaction, meaningful
motion, theming, documentation and focused tests. The catalogue is a place to explore those
decisions, try real examples and find components to use in your own projects.

Built on React Aria Components, Highwren UI pairs soft shapes and calm surfaces with semantic
colours generated from one seed. Install the components you need as source through the shadcn
registry, then adapt them in your project. You own the installed copy.

[![The catalogue with a live workspace, activity chart, project list and setup checklist themed from one seed colour](.github/assets/overview.jpg)](content/docs/index.mdx)

- React 19 and Tailwind CSS 4; framework-independent installed components.
- Light and dark themes, three contrast levels, runtime branding and right-to-left layouts.
- English defaults with typed label overrides, locale-aware dates and numbers, reduced motion.
- Forms, navigation, overlays, feedback, data tables and charts.
- Real Chromium interaction and accessibility tests, plus clean-consumer installation checks.

This is an early, pre-1.0 library. Review upstream diffs before updating installed source.
Version tags identify checked snapshots; `alpha` versions may change before a stable release.
There is no public catalogue host yet; the local catalogue includes the installation guide, examples
and API reference. Contributions are welcome through pull requests; the maintainer reviews and
merges changes into `main`.

## Component previews

These are real catalogue examples. Select an image to open its usage guide and API reference.

<details>
<summary>Cookie Consent — privacy choices with inline preferences</summary>

[![Cookie Consent with equally prominent reject and accept actions and an expandable preferences control](.github/assets/cookie-consent.jpg)](content/docs/components/feedback/cookie-consent.mdx)

</details>

<details>
<summary>Funnel Chart — activation stages, conversion rates and a data table</summary>

[![Funnel Chart showing app installs, sign-ins, first actions and upgrades, with period selection and conversion rates](.github/assets/funnel-chart.jpg)](content/docs/components/charts/funnel-chart.mdx)

</details>

## Run the catalogue

Use Node.js 24 or newer, npm and Git. With nvm, `nvm install` selects the checked-in Node version.

```bash
git clone https://github.com/oguzhanozgokce/web-design-system.git
cd web-design-system
npm ci
npx playwright install --with-deps chromium
npm run dev
```

Open the address printed by Next.js, normally [localhost:3000](http://localhost:3000).
Chromium is needed for tests, not for browsing the catalogue. No application secrets or `.env` file
are required. Dependency installation, browser installation and the build's Google Fonts download
need network access.

## Install components in another project

Start with a React 19, TypeScript and Tailwind CSS 4 project with the `@/*` path alias configured.
Follow the [installation guide](content/docs/foundations/installation.mdx) to add the `@ds` registry
to `components.json`, import the theme and wrap your app in `DSProvider`.

To serve the registry locally, run this in the library checkout before starting the catalogue:

```bash
npm run registry:build
npm run dev
```

In the consuming project, use the catalogue's actual origin:

```bash
export DS_REGISTRY_URL=http://localhost:3000
npx shadcn@4.23.0 add @ds/theme @ds/ds-provider @ds/button
```

You can put that origin directly in `components.json` instead of setting an environment variable.
A GitHub repository URL does not serve registry JSON. Rebuild registry JSON after changing
installable source. `npm run build` produces both the static catalogue and `/r/*.json` in `out/`;
publishing that directory is a separate release step.

With the documented aliases, imports look like this:

```tsx
import { Button } from '@/components/ds/button';

export function SaveAction() {
  return <Button onPress={() => console.log('Saved')}>Save</Button>;
}
```

Review an update with `npx shadcn@4.23.0 add @ds/button --diff` before applying it to customised
source. The root package's `private: true` prevents accidental npm publication; distribution is
through the registry.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, change scope and pull request expectations.
[docs/testing.md](docs/testing.md) defines which tests belong here; there is no test-count target.
Fork the repository and open a pull request against `main`. There is no separate `develop` branch.
Public access does not grant permission to push or merge; passing checks and a maintainer's merge
decision are required. See [publication controls](docs/open-source-readiness.md) for the safeguards.

```bash
npm run generate
npm run check
npm test
npm run check:registry
npm run build
```

GitHub Actions runs these checks on Linux, including Chromium, generated-file drift, dependency
auditing and a full-history secret scan. Failed browser screenshots are retained briefly as
workflow artifacts. See [SECURITY.md](SECURITY.md) for reporting and known limitations.

| Location                     | Purpose                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `registry/ds/`               | Installable components, helpers, hooks, blocks and styles; catalogue-only examples |
| `registry/items/`            | Registry metadata and third-party credits                                          |
| `content/docs/`              | Installation, component APIs and examples                                          |
| `tokens/config.json`         | Seed colour and palette configuration                                              |
| `docs/research/web-style.md` | Current visual specification                                                       |
| `AGENTS.md`                  | Repository contracts and verification                                              |
| `ROADMAP.md`                 | Delivery status and planned work                                                   |

## Licence

[Apache-2.0](LICENSE), with project attribution in [NOTICE](NOTICE) and adapted-source attribution
in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Every registry installation also copies the
licence and combined notices to `licenses/ds/` in the consumer project. Preserve those notices
when redistributing source, and identify changes to adapted Apache-licensed files.

The four `public/samples/*.jpg` images are original procedural artwork generated by
[`scripts/generate-samples.ts`](scripts/generate-samples.ts) and covered by the project licence.
They contain no stock photography or external image assets. Regenerate them with
`npx tsx scripts/generate-samples.ts` after installing Playwright Chromium.
