# dark-one-vue-template

[![CI](https://github.com/rzem-ai/dark-one-vue-template/actions/workflows/ci.yml/badge.svg)](https://github.com/rzem-ai/dark-one-vue-template/actions/workflows/ci.yml)

Scaffold for a Vue 3 prototype in Atom One Dark, with every shadcn-vue primitive and every AI Element pre-installed and themed.

```bash
npx giget@latest gh:rzem-ai/dark-one-vue-template/template my-app
cd my-app && pnpm install && pnpm dev
```

The trailing `/template` matters — giget extracts just that subdirectory, so a scaffolded project gets the app and none of the machinery below.

## Repository layout

```
template/     the payload — what a scaffolded project receives
themes/       one.json: the Atom One Dark palette, light and dark
tools/        build-theme.mjs: palette -> template/src/style.css
tests/        theme generation and drift, font-name exactness
docs/         design.md: the design record
```

## Working on the theme

`themes/one.json` is the single source of truth. `template/src/style.css` is build output between its `@generated` sentinels; everything outside them is hand-written and survives regeneration.

```bash
pnpm theme          # rewrite the token blocks
pnpm theme:check    # fail if they are stale (CI)
pnpm test           # generation, idempotence, drift
```

The palette is shared with [`shadcn-drawio`](../shadcn), which renders draw.io shape libraries from the same file. A test compares the two copies and fails if they diverge, skipping when that repository is not checked out beside this one.

That sharing is the reason this works at all: `one.json` expresses the palette in **shadcn's own variable names**, so it re-skins 113 Vue components and a set of diagram shapes without either knowing about the other.

## Refreshing the vendored components

The components are frozen at the versions they were installed at — that is the shadcn model working as intended, not an oversight. Updating is deliberate:

```bash
cd template
pnpm dlx shadcn-vue@latest add --overwrite <component>
pnpm build          # the only check that proves the tree still coheres
```

`pnpm build` is not optional after an update. It is the only gate that catches peer dependencies drifting out from under 113 vendored files — which is exactly how the AI SDK's `LanguageModelUsage` reshuffle was found.

## Design

[`docs/design.md`](docs/design.md) — what this is, what it deliberately is not, and the hazards worth knowing before changing it.
