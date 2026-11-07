# Contributing

Use English for issues, pull requests, documentation, examples and generic test copy. Describe the
consumer problem and include a small reproduction before proposing a new public API. Treat public
names, defaults and behaviour as contracts: several applications may own installed copies.

## Setup

Clone the repository, use Node.js 24 or newer (`nvm install`), then run:

```bash
npm ci
npx playwright install --with-deps chromium
npm run dev
```

Linux browser tests require Playwright's system dependencies; `--with-deps` installs them.
The catalogue needs no application credentials. See [README.md](README.md) for consumer installation.

## Make a change

1. Fork the repository and create a branch from `main`. Open your pull request against upstream
   `main`; there is no separate `develop` branch. Keep one consumer problem per pull request.
2. Read [AGENTS.md](AGENTS.md) and the relevant contracts it links. For component changes, follow
   [.claude/skills/ds-component/SKILL.md](.claude/skills/ds-component/SKILL.md).
3. Keep affected implementation, examples, API documentation and registry metadata together.
   Record adapted source in the item's `credits`; do not copy code with incompatible terms.
4. Follow [docs/testing.md](docs/testing.md): add the smallest regression scenario for behaviour
   this library owns. Do not duplicate React Aria or TypeScript guarantees.
5. Run the verification below and include the results in your pull request. Add screenshots for
   visible changes and describe any remaining limitations.

Do not edit generated tokens, icons, registry JSON, the example index or third-party notices by
hand. Change their source inputs and regenerate. Required licence headers are preserved; other
implementation reasoning belongs in documentation and commit messages.

## Verify

Run focused tests during development, then run the complete checks once before submitting:

```bash
npm run generate
npm run check
npm test
npm run check:registry
npm run build
```

`check` covers TypeScript, ESLint, formatting, design-system contracts and current-file secret
patterns. `check:registry` exercises the shadcn installer and typechecks installed components and
examples in temporary consumers with two alias layouts. `build` exports the catalogue to `out/`.

CI also runs `npm audit --audit-level=moderate` and Gitleaks against the complete Git history.
The existing history allowlist covers one retired password-test fixture only; explain any proposed
allowlist change in the pull request. Dependency overrides and the unresolved low-severity tooling
advisory are documented in [SECURITY.md](SECURITY.md).

Use `npm run format` to apply formatting. Use `npm run registry:build` before testing a local CLI
installation and rebuild it after changing installable files. Check generated output before
committing; CI rejects drift. Do not commit secrets, IDE metadata or build output.

## Review and conduct

Opening a pull request does not grant write or merge access. The repository owner,
[@oguzhanozgokce](https://github.com/oguzhanozgokce), owns review of every path and makes the merge
decision. `main` requires a pull request, resolved review conversations and a successful `Verify`
check against the current base. Direct pushes, force pushes and branch deletion are blocked.

Workflows from external forks need maintainer approval before running. Approval to run CI is not
approval to merge: the maintainer first inspects workflow, dependency and script changes, then
reviews the result. Do not send credentials or request elevated workflow permissions. Automated
merging is disabled. See [publication controls](docs/open-source-readiness.md) for the owner-only
merge rule and how owner-authored pull requests are handled.

Be respectful, discuss concrete behaviour and evidence, and credit contributors and source authors.
Harassment and discriminatory language are not accepted. Maintainers may close disruptive threads
or remove abusive content. Repository access and releases remain the maintainer's responsibility.

Use the bug or feature issue form for ordinary requests; follow [SECURITY.md](SECURITY.md) for
security reports. Contributions are provided under this repository's Apache-2.0 licence; adapted
third-party material retains its original notices. There is no separate contributor agreement.
