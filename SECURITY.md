# Security

## Scope and reporting

This pre-1.0 project maintains the latest `main` source. Installed registry components are copies:
consumer applications must review and apply fixes themselves. There are no maintained older
release branches yet.

Do not post credentials, personal data or exploit details in an issue or pull request. During the
private preparation phase, use an existing private channel to the repository owner,
[@oguzhanozgokce](https://github.com/oguzhanozgokce). This repository does not yet offer a public
confidential reporting channel. Establish a private contact before publication. GitHub private
vulnerability reporting becomes available once the repository is public; enable it during
publication and update this policy with the working reporting link. The final checklist is in
[docs/open-source-readiness.md](docs/open-source-readiness.md).

Include the affected component/tool version, a minimal reproduction, impact and suggested
mitigation. Remove real credentials and user data. The maintainer will coordinate a fix and
disclosure; no response-time guarantee is offered at this stage.

## Automated checks

- `npm run check:secrets` scans current tracked and non-ignored text files without printing values.
- CI scans all Git history with Gitleaks 8.30.1 and redacts findings. The only `.gitleaksignore`
  entry is an exact fingerprint for a retired password-test fixture in the initial commit.
- CI audits the complete npm lockfile at moderate severity and above. Dependabot proposes weekly
  npm and GitHub Actions updates; updates still require review and checks.
- Workflows use read-only repository permissions, immutable action revisions and no application
  secrets. Pull request code is never run through `pull_request_target`.

## Dependency audit exceptions

Reviewed on 2026-11-07. `deepmerge` 4.3.1 has an unpatched low-severity prototype-poisoning advisory,
[GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). It is a transitive dependency
of the development-only shadcn CLI and registry installation checker, not installed component
runtime code. Do not process registry metadata from untrusted sources. Track the upstream fix;
remove this exception when an audited replacement is available. The three low audit entries are
this package and its two dependent development tools.

Overrides select `compression` 1.8.2 or newer for the local static server and `minimatch` 11.0.5
or newer for affected tooling. The old minimatch 3 line is outside the advisory's affected range.
Recheck these overrides when upstream dependencies update; do not use `npm audit fix --force`
to downgrade the toolchain to unrelated old major versions.
