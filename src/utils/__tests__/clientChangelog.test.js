/**
 * Journal des clientes : rien de réservé aux développeurs ne doit s'afficher.
 *
 * Usage: npm run test:utils
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toClientChangelog } from '../clientChangelog.js';

const sample = `<h1>Journal</h1><p>Format inspiré de…</p><hr>
<h2>[1.4.2] — 2026-10-29</h2>
<h3>Accès rétabli (#35)</h3>
<ul><li>Le certificat est renouvelé.</li></ul>
<p><strong>Fichiers modifiés</strong> : <code>src/pages/a.astro</code></p>
<p><strong>Fichiers ajoutés</strong> : <code>tina/b.ts</code></p>`;

test('retire en-tête, listes de fichiers et numéros de PR ; date en français', () => {
  const out = toClientChangelog(sample);
  assert.ok(out.startsWith('<h2'));
  assert.ok(out.includes('29 octobre 2026 · version 1.4.2'));
  assert.ok(!out.includes('Fichiers'));
  assert.ok(!out.includes('#35'));
  assert.ok(!out.includes('Format inspiré'));
});

test('échoue si un détail technique passe (fail fast)', () => {
  assert.throws(() => toClientChangelog('<h2>[1.0.0] — 2026-01-01</h2><p>voir #22</p>'), /ticket/);
  assert.throws(() => toClientChangelog('<h2>[1.0.0] — 2026-01-01</h2><p>dans src/utils/x.ts</p>'), /chemin/);
  assert.throws(() => toClientChangelog('<p>pas de version</p>'), /<h2>/);
});
