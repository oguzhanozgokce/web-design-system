# Publication readiness

The repository stays private during preparation. CI does not deploy a catalogue, publish an npm
package or change repository visibility. This checklist records the remaining release decisions;
it does not authorise publication.

## Prepared

- README, consumer installation, contribution guide, test policy and security policy.
- Apache-2.0 project licence, third-party attribution and automatic consumer notice installation.
- Linux CI for generation, static checks, Node/Chromium tests, consumer installation and export.
- Full-history secret scanning and dependency auditing with one documented low tooling advisory.
- Issue forms, pull request template and dependency update configuration.
- Sample-image provenance: `public/samples/{dune,lagoon,moss,dusk}.jpg` are original procedural
  artwork from `scripts/generate-samples.ts`, covered by the project licence. No external images.

## Before making the repository public

1. Confirm the complete Git history is intended for publication. The current Gitleaks audit found
   one dummy password fixture, precisely allowlisted; automated scanning is not a content review.
2. Establish a confidential security contact, enable GitHub private vulnerability reporting and
   update `SECURITY.md` with the working reporting link.
3. Configure a `main` rule requiring the `Verify` CI check and pull request review, block force
   pushes and branch deletion. The current private repository's plan does not support rulesets;
   enabling Actions alone does not enforce review or passing checks.
4. Choose a catalogue host and verify its `/r/button.json` response and a real consumer
   installation. Set the stable `@ds` URL in the installation guide and repository homepage.
   Do not substitute a GitHub HTML repository URL for a registry endpoint.
5. Review dependency alerts, licence/notice output and a green CI run for the publication commit.
   Remove the private-preparation wording from the README when visibility actually changes.

Publishing a public catalogue, making the repository public and announcing a release are separate
maintainer actions. Until then, local installation remains the supported documented route.
