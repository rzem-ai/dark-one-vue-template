# dark-one-vue-template — design

**Date:** 2026-09-09
**Status:** implemented 2026-09-09; `pnpm build` and `pnpm test` green

## What this is

A scaffold you clone with one command to start a Vue prototype that already
looks like Atom One Dark and already has every shadcn-vue primitive and every
AI Elements component in it.

```
npx giget@latest gh:<owner>/dark-one-vue-template/template my-app
cd my-app && pnpm install && pnpm dev
```

The trailing `/template` is load-bearing: giget's `gh:owner/repo[/subdir][#ref]`
form extracts only that subdirectory, so a scaffolded project gets the app and
none of this repo's machinery. Verified against giget 3.3.1.

The goal is *time to first prototype*. Nothing in a fresh clone should need
installing, theming, or wiring before you can put a real screen on the screen.

## Why it is mostly assembly, not construction

Two pieces already exist and this project joins them.

**`~/Dev/Work/templates/my-vue-app`** — a kitchen-sink install nobody ever
themed. It carries 65 shadcn-vue primitives, 48 AI Elements components, and
every peer dependency those two sets drag in (vue-flow, shiki, motion-v,
media-chrome, vue-stick-to-bottom, tanstack-table, embla, vaul-vue,
vee-validate, zod). Stack is Vue 3.5.40, Vite 8, Tailwind 4.3.3, reka-ui
2.10.1, `ai` SDK v7. `src/` is 3.6 MB across 899 files. It is on stock neutral
oklch, loads Source Sans 3 from the Google Fonts CDN, and `App.vue` renders
`HelloWorld`.

**`~/Dev/Work/templates/shadcn/themes/one.json`** — the Atom One Dark palette
from the `shadcn-drawio` project, holding `cssVarsV4.light` and
`cssVarsV4.dark`: 31 colour variables each — the full shadcn set plus
`chart-1..5` and `sidebar-*` — and a 32nd, `radius`, which appears only in the
light map because corner radius is geometry and must not change with the theme.

The palette is already in shadcn's own variable vocabulary, so re-skinning all
113 components requires **zero component edits** — they consume `--background`
and `--primary`, never a literal hex. The substantive work is one generated CSS
file, a shell, and the packaging that makes it clonable.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Delivery | Template repo pulled with `giget` | No npm publish, no build, no version discipline. The repo *is* the product. |
| Distribution | GitHub only | Works the day it is pushed. No name to reserve. |
| Fresh-clone content | Bare shell | A layout, the tokens, a theme toggle. No demo chat — see *Non-goals*. |
| Themes | Both, dark default | `one.json` already has both. A toggle costs one composable. |
| Components vendored | All 113 | Stopping mid-prototype to run `shadcn-vue add` defeats the purpose. |
| Palette location | Copied into this repo | Self-contained. Drift from `shadcn-drawio` is caught by a test, not prevented by coupling. |
| Fonts | Self-hosted Geist + Fira Code | What the One Dark design system specifies. Self-hosted so a strict CSP cannot break it. |

## Layout

```
dark-one-vue-template/
├── template/                    # exactly what giget copies
│   ├── src/
│   │   ├── components/ui/            # 65 shadcn-vue primitives
│   │   ├── components/ai-elements/   # 48 AI Elements components
│   │   ├── composables/useTheme.ts
│   │   ├── lib/utils.ts
│   │   ├── style.css                 # GENERATED — do not hand-edit
│   │   ├── App.vue
│   │   └── main.ts
│   ├── components.json
│   ├── index.html                    # <html class="dark">
│   ├── vite.config.ts
│   ├── tsconfig.json · tsconfig.app.json · tsconfig.node.json
│   └── package.json
├── tools/
│   └── build-theme.mjs          # themes/one.json -> template/src/style.css
├── themes/
│   └── one.json                 # vendored copy of the palette
├── tests/
│   └── theme.test.mjs           # drift + generation checks
├── docs/superpowers/specs/
└── README.md
```

`template/` is the payload; everything beside it is machinery that never ships
to a scaffolded project.

## The generated stylesheet

`tools/build-theme.mjs` reads `themes/one.json` and writes `style.css` between
sentinel comments:

```css
/* @generated one-dark:start — edit themes/one.json and run pnpm theme */
:root  { --background: #fafafa; ... }   /* cssVarsV4.light, 32 vars */
.dark  { --background: #282c34; ... }   /* cssVarsV4.dark,  31 vars */
/* @generated one-dark:end */
```

Everything outside the sentinels — the Tailwind imports, `@custom-variant`,
`@theme inline`, base layer — is hand-written and preserved across regeneration.

`my-vue-app` already declares `@custom-variant dark (&:is(.dark *))`, and
`one.json` supplies explicit light *and* dark maps, so the two drop straight
into shadcn's existing `:root` / `.dark` structure. There is no dark-at-`:root`
reconciliation to perform. Dark is the default because `index.html` ships
`class="dark"`; `useTheme` toggles that class and persists the choice.

## Fonts

Add `@fontsource-variable/geist@5.3.0` and `@fontsource-variable/fira-code@5.3.0`,
imported from `main.ts`. Drop the Google Fonts `@import` from `style.css` and
the `"font": "source-sans-3"` key from `components.json`.

> **Hazard.** Fontsource declares these families as **`Geist Variable`** and
> **`Fira Code Variable`**, not `Geist` / `Fira Code`. CSS font matching is
> exact: the wrong name fails silently to `system-ui` and looks approximately
> right. This precise bug survived nine build steps undetected in the `stencil`
> project. The font test below exists specifically to catch it.

Declared in the Tailwind theme block as:

```css
@theme inline {
  --font-sans: 'Geist Variable', system-ui, sans-serif;
  --font-mono: 'Fira Code Variable', ui-monospace, monospace;
}
```

## The shell

`App.vue` is deliberately close to empty: a full-height flex column, a header
carrying the template name and the theme toggle, and a `<main>` with a single
centred card saying what to do next. It exists to prove the tokens resolve and
the toggle works, and to be deleted.

It must import at least one shadcn-vue primitive (`Button`) and one AI Element
(`Conversation`), so a broken alias or a missing peer dep fails at
`pnpm build` in a fresh clone rather than an hour into a prototype.

## Tests

Node's built-in test runner. Three checks, all cheap:

1. **Generation is faithful** — running `build-theme.mjs` produces a
   `style.css` whose `:root` and `.dark` blocks contain every variable from the
   corresponding side of `one.json`, with matching values — and `radius` on
   `:root` alone, so `.dark` inherits rather than restates it.
2. **Generation is idempotent** — running it twice yields a byte-identical
   file. Guards the sentinel splice against duplicating or eating content.
3. **Palette has not drifted** — `themes/one.json` matches
   `../shadcn/themes/one.json` when that path exists; skip cleanly when it does
   not, so the repo stands alone on another machine.

A fourth check belongs to CI rather than the unit suite: `pnpm build` inside a
freshly copied `template/` must typecheck and bundle. That is the only thing
that actually proves 113 vendored components and their peer deps are coherent.

## What the build gate found

The inherited app had never been typechecked. `pnpm build` on the first assembled
copy produced eight errors in four classes, and every one was a real defect
rather than a strictness artefact. Recorded here because a future refresh of the
vendored components will surface the same shapes.

**Missing peer dependencies.** `calendar` imports `@internationalized/date` and
`chart` imports `@unovis/vue`; neither was installed. Added, along with
`@unovis/ts`. `@unovis` pulls `maplibre-gl` transitively — install weight only,
since nothing imports its map renderers.

**pnpm 11 fails, rather than warns, on undecided build scripts.** `vue-demi` and
`maplibre-gl` both need a decision. `my-vue-app` carried an unresolved
placeholder (`vue-demi: set this to true or false`), which would have broken
`pnpm install` in every scaffolded project. Both are now explicit in
`pnpm-workspace.yaml`.

**The AI SDK reshaped `LanguageModelUsage`.** The vendored `context` components
read `usage.cachedInputTokens` and `usage.reasoningTokens`; `ai@7.0.48` moved
these to `usage.inputTokenDetails.cacheReadTokens` and
`usage.outputTokenDetails.reasoningTokens`. Fixed in place — we own the vendored
files. This is the clearest illustration of why `pnpm build` gates any refresh:
nothing else would have caught it.

**`noUnusedLocals` misreads Vue template refs.** It flagged `formRef`,
`fileInputRef` and `carouselRef` as dead. All three are bound by string in the
template (`ref="carouselRef"`) against a value destructured from a composable,
which the flag does not count as a usage — deleting them breaks the component at
runtime. The flag is off, with the reasoning recorded in `tsconfig.app.json`.

**`TS2589` in `Canvas.vue`.** `useForwardPropsEmits` returns
`ComputedRef<WithOptionalBooleans<T> & EmitAsProps<Fn>>`, and instantiating that
over vue-flow's `FlowProps` and `FlowEmits` exceeds TypeScript's depth limit. The
same helper is used uninstrumented in five other components; only vue-flow's
types are large enough to trip it. Fixed by widening both arguments at the call
site — annotating the *result* does not work, because the depth is exceeded while
inferring the generic, before the cast applies.

Two smaller ones fixed on the way past: `baseUrl` is deprecated in TypeScript 6
(and redundant, since `paths` now resolves relative to the tsconfig), and
`vite.config.ts` used `__dirname`, which Vite's forthcoming native config loader
cannot read.

## Non-goals

- **No demo chat.** AI Elements' conversation components expect the Vercel AI
  SDK against a live streaming endpoint. A scaffold that boots to a dead chat
  box is worse than one that boots to nothing. Wiring a provider is the first
  thing you do *after* scaffolding, not part of it.
- **No `create-` CLI, no npm publish.** `giget` covers the one-command story.
  Revisit only if prompted options are wanted.
- **No shadcn registry output.** Worth doing to retrofit One Dark onto existing
  apps, but it is a separate deliverable with its own hosting question.
- **No router.** Prototypes that need one can add it; ones that do not should
  not carry it.

## Risks

**Size.** 113 vendored components and ~40 runtime dependencies make for a
408 MB `node_modules` and a slow cold install. Accepted deliberately: it is the
cost of never interrupting a prototype. `src/` at 3.6 MB is a reasonable repo.

**Upstream drift.** Vendored components are frozen at the version
`my-vue-app` installed. That is the shadcn model working as designed — you own
the files — but it means the template ages. Refreshing it is a manual
`shadcn-vue add --overwrite` pass, and should be an explicit maintenance task,
not an assumption.

**Palette drift.** Two copies of `one.json` now exist. Test 3 makes divergence
loud instead of silent.
