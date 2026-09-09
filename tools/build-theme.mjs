#!/usr/bin/env node
/**
 * Generates the One Dark token blocks in `template/src/style.css` from
 * `themes/one.json`.
 *
 * The palette is the single source of truth; the stylesheet is build output.
 * Only the region between the sentinels below is touched, so everything a
 * human wrote around it survives regeneration.
 *
 *   pnpm theme          rewrite the blocks
 *   pnpm theme --check  fail if they are stale (for CI)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const START = '/* @generated one-dark:start — edit themes/one.json and run `pnpm theme` */';
export const END = '/* @generated one-dark:end */';

const declare = (vars) =>
  Object.entries(vars)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join('\n');

/**
 * Render the generated region: light on `:root`, dark on `.dark`.
 *
 * `radius` lives only in the light map — it is a geometry token, not a colour,
 * and must not change between themes. Emitting it on `:root` alone lets `.dark`
 * inherit it, which is why the dark map is colours only.
 */
export function renderTokenBlock(theme) {
  const { light, dark } = theme.cssVarsV4;
  return [
    START,
    ':root {',
    declare(light),
    '}',
    '',
    '.dark {',
    declare(dark),
    '}',
    END,
  ].join('\n');
}

/** Replace the region between the sentinels, leaving the rest of `css` alone. */
export function spliceGenerated(css, block) {
  const from = css.indexOf(START);
  const to = css.indexOf(END);
  if (from === -1 || to === -1 || to < from) {
    throw new Error(
      'style.css is missing the @generated one-dark sentinel comments; ' +
        'restore them before running the theme build.',
    );
  }
  return css.slice(0, from) + block + css.slice(to + END.length);
}

function main() {
  const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
  const cssPath = join(repo, 'template/src/style.css');
  const theme = JSON.parse(readFileSync(join(repo, 'themes/one.json'), 'utf8'));
  const current = readFileSync(cssPath, 'utf8');
  const next = spliceGenerated(current, renderTokenBlock(theme));

  if (process.argv.includes('--check')) {
    if (next !== current) {
      console.error('style.css is stale — run `pnpm theme`.');
      process.exit(1);
    }
    console.log('style.css is up to date with themes/one.json.');
    return;
  }

  if (next === current) {
    console.log('style.css already up to date.');
    return;
  }
  writeFileSync(cssPath, next);
  const { light, dark } = theme.cssVarsV4;
  console.log(
    `style.css updated — ${Object.keys(light).length} light, ${Object.keys(dark).length} dark.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
