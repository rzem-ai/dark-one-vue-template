import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { renderTokenBlock, spliceGenerated, START, END } from '../tools/build-theme.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const theme = JSON.parse(readFileSync(join(repo, 'themes/one.json'), 'utf8'));

// Pull the declarations out of one `selector { ... }` block of generated CSS.
function declarationsOf(css, selector) {
  const body = css.slice(css.indexOf(`${selector} {`));
  const inner = body.slice(body.indexOf('{') + 1, body.indexOf('}'));
  return Object.fromEntries(
    inner
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('--'))
      .map((l) => {
        const [name, ...rest] = l.replace(/;$/, '').split(':');
        return [name.trim().replace(/^--/, ''), rest.join(':').trim()];
      }),
  );
}

test('every light variable reaches :root with its value intact', () => {
  const got = declarationsOf(renderTokenBlock(theme), ':root');
  for (const [name, value] of Object.entries(theme.cssVarsV4.light)) {
    assert.equal(got[name], value, `:root --${name}`);
  }
});

test('every dark variable reaches .dark with its value intact', () => {
  const got = declarationsOf(renderTokenBlock(theme), '.dark');
  for (const [name, value] of Object.entries(theme.cssVarsV4.dark)) {
    assert.equal(got[name], value, `.dark --${name}`);
  }
});

test('radius is declared once, on :root, so .dark inherits it', () => {
  const block = renderTokenBlock(theme);
  assert.ok(declarationsOf(block, ':root').radius, 'radius missing from :root');
  assert.ok(!declarationsOf(block, '.dark').radius, 'radius should not be restated in .dark');
});

test('splicing is idempotent — running the build twice changes nothing', () => {
  const skeleton = `@import "tailwindcss";\n\n${START}\nstale\n${END}\n\nbody { margin: 0; }\n`;
  const once = spliceGenerated(skeleton, renderTokenBlock(theme));
  const twice = spliceGenerated(once, renderTokenBlock(theme));
  assert.equal(once, twice);
});

test('splicing preserves hand-written CSS on both sides of the sentinels', () => {
  const skeleton = `@import "tailwindcss";\n\n${START}\nstale\n${END}\n\nbody { margin: 0; }\n`;
  const out = spliceGenerated(skeleton, renderTokenBlock(theme));
  assert.match(out, /@import "tailwindcss";/);
  assert.match(out, /body \{ margin: 0; \}/);
  assert.ok(!out.includes('stale'), 'previous generated content should be replaced');
});

test('a stylesheet with no sentinels fails loudly rather than silently', () => {
  assert.throws(() => spliceGenerated('body { margin: 0; }', 'x'), /sentinel/i);
});

test('the shipped stylesheet is what the current palette generates', () => {
  const css = readFileSync(join(repo, 'template/src/style.css'), 'utf8');
  assert.equal(css, spliceGenerated(css, renderTokenBlock(theme)), 'run `pnpm theme`');
});

test('the vendored palette has not drifted from shadcn-drawio', (t) => {
  const upstream = join(repo, '../shadcn/themes/one.json');
  if (!existsSync(upstream)) return t.skip('shadcn-drawio not present on this machine');
  assert.deepEqual(theme, JSON.parse(readFileSync(upstream, 'utf8')));
});
