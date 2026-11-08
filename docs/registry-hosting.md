# Catalogue and registry hosting

The complete static catalogue and registry target **https://ui.highwren.com** on Hostinger Premium.
No Node.js process or database runs on the server. The canonical `@ds` namespace is
`https://ui.highwren.com/r/{name}.json`; `lib/site.ts` owns the origin.

**Preparation status:** the domain and SSL exist. The application has not been deployed, the
`production` branch/protections and GitHub environment have not been created, and no deployment
secrets or activation variable have been set. The workflow is inert until setup is complete.

## Release flow

```text
feature PR → main → release PR → production → Verify → Hostinger
             │                      │
             checks only            owner merges; deployment enabled explicitly
```

Contributors target `main`. Only the owner can merge. Promote selected work through a PR from
this repository's `main` to `production`, using **Create a merge commit** to preserve ancestry.
CI rejects production PRs from another branch or fork. Do not develop directly on `production`.
Tags identify source snapshots; they do not deploy.

`Verify` scans history, audits dependencies, generates source, runs checks/tests, checks consumer
installation, builds and packages the site. Only production uploads that artifact. Deployment uses
that exact run's package and checksum; it does not rebuild. Older runs cannot deploy after the
production branch advances. Production workflows are serialized and an active deployment is not
cancelled when a newer commit arrives. The GitHub token stays read-only.

## Prepare a package locally

```bash
npm run build:hosting
```

Outputs, all ignored by Git:

- `.hostinger/public_html/`: full catalogue, search, Markdown, fonts/images, `r/*.json`, sitemap,
  robots, 404 page, server configuration and `version.json`.
- `.hostinger/highwren-ui.tar.gz`: the **contents** of the document root, including `.htaccess`.
- `.hostinger/manifest.json`: SHA-256, source commit, dirty state and file/page/item counts.

Validation rejects missing source payloads, broken local links, incorrect canonical URLs, symlinks,
hidden export files and executable server files. Uncommitted packages are for local review; deploy
refuses them. CI creates a clean package from the verified commit. Never upload the repository,
`.env`, `node_modules` or `.next`.

Directory exports support direct visits to deep routes. `.htaccess` enforces HTTPS, disables
listing, serves the real 404 with a 404 status and marks the extensionless search endpoint as JSON.
Hashed `_next/static` assets cache for a year; HTML, registry, search and version metadata revalidate.
There is no SPA fallback to `index.html`.

## One-time setup — only when publication is authorized

1. Merge and verify preparation on `main`. Create `production` from that reviewed commit while
   `HOSTINGER_DEPLOY_ENABLED` is unset. Apply both `.github/rulesets/production-*.json` definitions
   and verify effective rules. The quality ruleset has no bypass; the owner-only ruleset lets the
   owner merge PRs without approving their own work. Neither permits direct pushes or force pushes.
   Keep existing `main` rules unchanged.
2. Create GitHub environment **hostinger-production**. Select deployment branches/tags, add the
   exact **Branch: production**, and add no tag rule. Automatic publication needs no additional
   reviewer after the owner's merge. An optional owner approval adds a second gate; leave
   self-review allowed for a sole maintainer, otherwise their own releases would be blocked.
3. Confirm SSH access in hPanel and the displayed username, host and port. The script expects
   `/home/<SSH user>/domains/ui.highwren.com/public_html`; verify the actual path before enabling
   it. Other domains' files are outside the deployment target.
4. Generate a **dedicated deployment SSH key** outside the repository. Put the public half in
   `authorized_keys`, with `restrict` to disable forwarding and PTY access. Put the private half
   only in the GitHub environment secret. This still permits account commands; it is not an
   isolated per-site login. Rotate it if exposed and do not reuse a personal key.
5. Independently verify the server SSH host-key fingerprint through a trusted Hostinger channel
   and save the matching `known_hosts` entry. The workflow never accepts unknown host keys or
   trusts a fresh `ssh-keyscan` result by itself.
6. Add these **environment secrets**, not repository files or frontend environment variables:

   | Secret                  | Value                                                |
   | ----------------------- | ---------------------------------------------------- |
   | `HOSTINGER_SSH_HOST`    | SSH hostname or IP from hPanel                       |
   | `HOSTINGER_SSH_USER`    | Hosting SSH username                                 |
   | `HOSTINGER_SSH_PORT`    | SSH port from hPanel                                 |
   | `HOSTINGER_SSH_KEY`     | Dedicated private key, including header/footer       |
   | `HOSTINGER_KNOWN_HOSTS` | Verified entry; `[host]:port` for a nonstandard port |

7. Confirm the owner remains the only write/admin collaborator, auto-merge is off and Actions
   cannot approve PRs. CODEOWNERS covers workflows, scripts and all other files.
8. Only after publication approval, set the **repository variable** `HOSTINGER_DEPLOY_ENABLED`
   to `true`. Run CI manually on `production` for the initial release. Later owner merges into
   `production` deploy after verification. An unset/false flag skips deployment.

Cloning on another computer needs none of these credentials. Builds/tests work without secrets;
deployment runs on GitHub-hosted runners. Never paste private keys into issues, PRs, workflows,
chat or screenshots. Editing these files does not apply live account settings.

## Transfer and recovery

The job uploads to a unique `.deploy/<commit>-<run>-<attempt>/site` directory outside `public_html`.
The server checks the revision and clean state, acquires a lock, backs up the site to `previous/`,
then rsyncs with delayed updates/deletions. ACME files and older hashed chunks are preserved, so
open tabs can finish loading. A failed transfer or HTTPS revision probe restores the previous
site and fails the job. This **is not an atomic directory switch**; a short mixed-revision window
can occur during the final rsync.

Backups and old chunks are not pruned automatically. After a verified release, retain the latest
known-good backup and remove older release directories deliberately to stay within storage limits.
A forced termination or server outage can prevent automatic recovery. Inspect the live revision,
staging and backup before removing a leftover `.deploy/lock` directory or retrying.

For a product regression, revert through a reviewed `main` PR, then another `main` → `production`
PR. Do not force-reset production or relax protections. For an incomplete transfer, restore this
site's document root from `previous/` through the hosting account, preserving `.well-known`, then
re-run CI for the current production commit after diagnosis.

## Verify the first live deployment

- Open the homepage, a deep component link and theme builder anonymously. Check search, client
  navigation, reload, Markdown download, mobile layout and a nonexistent page's 404 status.
- Check HTTPS/redirects, JSON content types, HTML/JSON revalidation and immutable asset headers.
- Compare `/version.json` to the clean source commit. Inspect `/r/button.json`, `/r/sidebar.json`
  and `/r/license.json` for embedded source.
- In a separate React 19 / Tailwind 4 app, use the production namespace and run
  `npx shadcn@4.23.0 add @ds/theme @ds/ds-provider @ds/button @ds/sidebar`, then typecheck/build.
- Remove the pending-first-deployment notice from README/installation only after these checks pass.
  The registry follows production; installed consumer files never auto-update.

Hostinger supports [SSH/SFTP and rsync on Premium](https://www.hostinger.com/support/which-file-transfer-and-server-access-options-are-supported-at-hostinger/).
GitHub documents [environment secrets and branch restrictions](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).
