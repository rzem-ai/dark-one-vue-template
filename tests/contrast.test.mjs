import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// The palette's text and label pairs reach WCAG AA (4.5:1). The ratios are
// computed from themes/one.json rather than trusted from the notes, so a
// palette edit that drops a pair below AA fails here before it ships.

const here = dirname(fileURLToPath(import.meta.url));
const theme = JSON.parse(readFileSync(join(here, '../themes/one.json'), 'utf8'));
const { light, dark } = theme.cssVarsV4;

// WCAG 2.x relative luminance of a #rrggbb colour.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;

test('the contrast helper agrees with the published extremes and a known pair', () => {
  assert.ok(Math.abs(contrast('#000000', '#ffffff') - 21) < 1e-9);
  assert.ok(Math.abs(contrast('#777777', '#777777') - 1) < 1e-9);
  // WebAIM: #767676 on white is the lightest grey that passes AA, 4.54:1.
  assert.equal(contrast('#767676', '#ffffff').toFixed(2), '4.54');
});

for (const surface of ['background', 'card', 'sidebar', 'popover', 'muted']) {
  test(`dark muted-foreground reads at 4.5:1 or better on ${surface}`, () => {
    const ratio = contrast(dark['muted-foreground'], dark[surface]);
    assert.ok(ratio >= AA, `${dark['muted-foreground']} on ${dark[surface]} is ${ratio.toFixed(2)}:1`);
  });
}

test('the light primary-button label reads at 4.5:1 or better', () => {
  const ratio = contrast(light['primary-foreground'], light.primary);
  assert.ok(ratio >= AA, `${light['primary-foreground']} on ${light.primary} is ${ratio.toFixed(2)}:1`);
});

for (const mode of ['light', 'dark']) {
  test(`the ${mode} sidebar-primary label, the rail's active button, reads at 4.5:1 or better`, () => {
    const palette = theme.cssVarsV4[mode];
    const ratio = contrast(palette['sidebar-primary-foreground'], palette['sidebar-primary']);
    assert.ok(ratio >= AA, `${palette['sidebar-primary-foreground']} on ${palette['sidebar-primary']} is ${ratio.toFixed(2)}:1`);
  });
}

for (const surface of ['background', 'card']) {
  test(`light destructive text reads at 4.5:1 or better on ${surface}`, () => {
    const ratio = contrast(light.destructive, light[surface]);
    assert.ok(ratio >= AA, `${light.destructive} on ${light[surface]} is ${ratio.toFixed(2)}:1`);
  });

  test(`light success text (chart-4) reads at 4.5:1 or better on ${surface}`, () => {
    const ratio = contrast(light['chart-4'], light[surface]);
    assert.ok(ratio >= AA, `${light['chart-4']} on ${light[surface]} is ${ratio.toFixed(2)}:1`);
  });
}

test('the light destructive button label, which shadcn writes as white, reads at 4.5:1 or better', () => {
  const ratio = contrast('#ffffff', light.destructive);
  assert.ok(ratio >= AA, `#ffffff on ${light.destructive} is ${ratio.toFixed(2)}:1`);
});
