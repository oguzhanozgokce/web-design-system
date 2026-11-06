# Fixtures

`materialkolor-6.0.0.json` holds roles computed by MaterialKolor 6.0.0, the colour library the
Compose design system uses, for four seeds in every style, mode and contrast level. It was dumped
with a small Java program against MaterialKolor's `material-color-utilities` 6.0.0 jar from the
Gradle cache. `registry/ds/lib/color-scheme.test.ts` asserts the web engine produces the same values.

`knownDifferences` lists two schemes where `@material/material-color-utilities` 0.4.0 on npm still
ships an older 2025 colour spec than MaterialKolor: expressive in dark mode, and vibrant with yellow
seeds (its light surfaces). The test fails when they start to match, which is the signal to drop the caveat from the
dynamic colour docs.
