# Dark One

A Vue 3 prototype in Atom One Dark, with every shadcn-vue primitive and every
AI Element already installed and themed.

```bash
pnpm install
pnpm dev
```

## What is here

| | |
|---|---|
| Vue 3.5 · Vite 8 · TypeScript | `pnpm dev`, `pnpm build`, `pnpm typecheck` |
| Tailwind 4 | via `@tailwindcss/vite`, no config file |
| 65 shadcn-vue primitives | `src/components/ui/` |
| 48 AI Elements | `src/components/ai-elements/` |
| Atom One Dark | light and dark, dark by default |
| Geist + Fira Code | self-hosted, no CDN |

Nothing needs installing before you start. That is the point — the whole set is
vendored so a prototype never stops to fetch a component.

## Theming

`src/style.css` holds the palette as CSS variables on `:root` (light) and
`.dark` (dark). Every component reads those variables and none contains a
literal colour, so changing a value there re-skins the entire tree.

Dark is the default because `index.html` ships `class="dark"`.
`src/composables/useTheme.ts` toggles it and remembers the choice.

> The `:root` / `.dark` block is generated. If you are working in the template
> repository, edit `themes/one.json` and run `pnpm theme` — do not hand-edit
> between the `@generated` sentinels. In a scaffolded project the file is yours;
> edit it freely.

### Fonts

Declared as `Geist Variable` and `Fira Code Variable` — the exact family names
Fontsource registers. CSS font matching is exact, so `Geist` alone silently
falls back to `system-ui` and looks close enough to miss. If type ever looks
subtly wrong, check that name first.

## Adding components

```bash
pnpm dlx shadcn-vue@latest add <component>
pnpm dlx shadcn-vue@latest add https://registry.ai-elements-vue.com/all.json
```

Both write into `src/components/`, and you own the result — edit the files
directly rather than wrapping them.

## Notes

`noUnusedLocals` and `noUnusedParameters` are off in `tsconfig.app.json`. The
vendored components bind template refs by string (`ref="carouselRef"` against a
`carouselRef` from a composable), which those flags do not count as a usage;
they report live code as dead. See the comment in that file.

AI Elements' conversation components expect the Vercel AI SDK against a
streaming endpoint. `ai` is installed; wiring a provider is yours to do.
