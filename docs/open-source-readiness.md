# Publication controls

Highwren UI distributes source through a public registry. Contributors target `main`; the owner
promotes reviewed work to `production`, which deploys the catalogue and registry. The root
package is `private: true` to prevent npm publication. Deployment is configured and enabled.

## Main branch and merge access

The active rulesets are defined in [`.github/rulesets/`](../.github/rulesets/). Editing their JSON
files does not change GitHub settings; apply changes through administration and verify effective rules.

- **Main: verified pull requests** has no bypass. Every update requires a PR, resolved threads
  and a successful `Verify` from GitHub Actions (15368), tested against the latest base. Force
  pushes and deletion are blocked, including for the owner.
- **Main: owner-controlled merges** restricts updates to `@oguzhanozgokce` (123859594), through
  PRs only. It requires code-owner review and dismisses stale approvals.
  [CODEOWNERS](../.github/CODEOWNERS) assigns all paths to that owner.

The owner may bypass only the second ruleset when merging, because a sole maintainer cannot
approve their own PR. The quality ruleset still requires CI and blocks direct pushes. Reviewing a
contributor's PR does not give them merge access. Auto-merge is off; only the owner has write/admin
access. Recheck collaborators, installed apps and bypass actors before delegating access.

## Workflow boundary

External fork workflows need maintainer approval. Inspect workflow, dependency and script changes
before approving each execution. Use GitHub-hosted runners without deployment secrets for PR code.

Workflow tokens are read-only and cannot approve PRs. Only GitHub-owned actions are allowed, with
full SHA pinning. `Verify` checks the source, tests, registry installation and static build;
[testing](testing.md) documents the checks. Dependency/history scans, CodeQL and reporting are
covered by [SECURITY.md](../SECURITY.md).

## Version tags

Create `v*` tags only on `main` commits with successful post-merge CI. The first snapshot is
`v0.1.0-alpha.1`; pre-1.0 APIs may change. Tags identify source and do not deploy.

**Release tags: owner-created** permits only owner creation. **Release tags: immutable** has no
bypass and blocks moving or deleting tags, including for the owner. Correct a release with a new
version. Both definitions are in `.github/rulesets/`.

## Release review

Before a release or branch-visibility change:

1. Review the intended commit, history, metadata, logs and artifacts for credentials/private material.
2. Check source credits, notices and asset provenance. Samples come from
   `scripts/generate-samples.ts`; brand research is a dated preliminary screen.
3. Verify the exact commit's audit/CI, effective rules, private reporting and current access list.
4. Keep README availability and compatibility accurate. Consumers review and apply source updates;
   no older release branches are maintained.

## Production branch and hosting

Release through a `main` → `production` PR with a merge commit. Production accepts only this
repository's `main`; its owner-only and non-bypassable quality rulesets are active.

The `hostinger-production` environment permits only the exact `production` branch, with no tag
rule. The deploy job requires successful `Verify`, the original repository, the owner as actor
and triggering actor, and `HOSTINGER_DEPLOY_ENABLED=true`. It rejects runs whose commit is no
longer the production head. PRs, `main`, tags and forks cannot deploy.

Only deployment receives the dedicated Hostinger SSH key, with strict host verification. It grants
hosting-account commands, not isolated per-site access or GitHub merge access. Keep the activation
flag off during a new hosting setup. Clones contain no deployment credentials.

See [registry hosting](registry-hosting.md) for release steps, verification and recovery.
