import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const read = (p) => readFileSync(join(repo, p), 'utf8');

const css = read('template/src/style.css');
const main = read('template/src/main.ts');
const pkg = JSON.parse(read('template/package.json'));

// Every `--font-*` the stylesheet declares, reduced to the family it asks for
// first. The rest of each stack is fallback and is meant to match. Aliases
// (`--font-heading: var(--font-sans)`) carry no family of their own.
function requestedFamilies() {
  return [...css.matchAll(/--font-([a-z-]+):\s*([^;]+);/g)]
    .map(([, name, stack]) => [name, stack.split(',')[0].trim()])
    .filter(([, first]) => !first.startsWith('var('))
    .map(([name, first]) => [name, first.replace(/^['"]|['"]$/g, ''), first]);
}

const fontsourcePackages = [...main.matchAll(/@fontsource(?:-variable)?\/([a-z0-9-]+)/g)].map(
  (m) => m[1],
);

test('the fonts are self-hosted, not pulled from a CDN at runtime', () => {
  assert.ok(fontsourcePackages.length > 0, 'main.ts imports no @fontsource package');
  assert.doesNotMatch(css, /@import\s+url\(/, 'style.css still has a remote @import');
  assert.doesNotMatch(css, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
});

test('every font package main.ts imports is a declared dependency', () => {
  for (const name of fontsourcePackages) {
    const dep = Object.keys(pkg.dependencies).find((d) => d.endsWith(`/${name}`));
    assert.ok(dep, `main.ts imports ${name} but package.json does not depend on it`);
  }
});

test('no --font-* stack has silently fallen back to a generic', () => {
  const generic = /^(system-ui|ui-sans-serif|ui-monospace|ui-serif|sans-serif|serif|monospace)$/;
  for (const [name, family, raw] of requestedFamilies()) {
    assert.doesNotMatch(family, generic, `--font-${name} leads with the generic ${family}`);
    assert.match(raw, /^['"]/, `--font-${name} leads with an unquoted family: ${raw}`);
  }
});

// The hazard this file exists for. Fontsource declares Geist as `Geist Variable`,
// not `Geist`. CSS family matching is exact and a miss is not an error — the page
// just renders in system-ui and looks approximately right. So the expected string
// is read back out of the package rather than written down here, which means a
// future upstream rename fails this test instead of failing silently in a browser.
test('style.css names the families exactly as the installed packages declare them', (t) => {
  const declared = new Map();
  for (const name of fontsourcePackages) {
    const index = join(repo, 'template/node_modules/@fontsource-variable', name, 'index.css');
    if (!existsSync(index)) return t.skip('template dependencies are not installed');
    const found = readFileSync(index, 'utf8').match(/font-family:\s*['"]([^'"]+)['"]/);
    assert.ok(found, `${name} ships no font-family declaration to compare against`);
    declared.set(name, found[1]);
  }

  const requested = requestedFamilies().map(([, family]) => family);
  for (const [name, family] of declared) {
    assert.ok(
      requested.includes(family),
      `${name} declares '${family}', which no --font-* stack asks for. ` +
        `The stylesheet asks for: ${requested.join(', ')}`,
    );
  }
  for (const family of requested) {
    assert.ok(
      [...declared.values()].includes(family),
      `--font-* asks for '${family}', which no installed package declares`,
    );
  }
});
