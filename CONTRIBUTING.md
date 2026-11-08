# Contributing

Use English for issues, pull requests, docs, examples and generic test copy. Describe one consumer
problem per PR and include a minimal reproduction when proposing a public API change.

## Setup

Fork and clone the repository. Use Node.js 24 or newer (`nvm install`), then run:

```bash
npm ci
npx playwright install --with-deps chromium
npm run dev
```

The catalogue needs no application credentials. Consumer installation is in [README.md](README.md).

## Make a change

1. Create a branch from `main` and target upstream `main` in your PR.
2. Read [AGENTS.md](AGENTS.md) and the affected contracts. For component work, follow
   [.claude/skills/ds-component/SKILL.md](.claude/skills/ds-component/SKILL.md).
3. Ship affected implementation, regression coverage, examples, docs and registry metadata together.
   Record adapted source in item `credits` and preserve required licence headers.
4. Change generator inputs rather than generated tokens, icons, registry JSON, example indexes or
   third-party notices. Rebuild local registry payloads with `npm run registry:build` after source changes.
5. Include verification results and screenshots for visible changes in the PR. Report remaining gaps.

## Verify

Follow [docs/testing.md](docs/testing.md) for focused test selection, then run:

```bash
npm run generate
npm run check
npm test
npm run check:registry
npm run build
```

Use `npm run format` for formatting. CI rejects generated-file drift and also audits dependencies
and scans Git history. Exceptions are documented in [SECURITY.md](SECURITY.md). Keep secrets,
IDE metadata and build output out of commits.

## Review and conduct

The repository owner reviews and merges changes. `main` requires a PR, resolved review threads
and successful `Verify` against the current base. External fork workflows need approval before
running; that approval does not authorize merging. See
[publication controls](docs/open-source-readiness.md) for access and release rules.

Discuss concrete behaviour respectfully and credit source authors. Maintainers may close abusive
or disruptive contributions. Use issue forms for bugs/features and [SECURITY.md](SECURITY.md) for
vulnerabilities. Contributions use Apache-2.0; adapted material retains its notices. There is no
separate contributor agreement.
