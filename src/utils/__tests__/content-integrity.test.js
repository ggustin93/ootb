/**
 * Regression guard — no corrupted CMS placeholder anywhere in JSON content.
 *
 * Recursively scans src/content/**\/*.json and fails if ANY string value equals
 * the "[object Object]" placeholder TinaCloud produces when it fails to round-trip
 * a rich-text field nested in a JSON collection. Generic guard: catches this bug
 * class in any collection (about, blog, festival, ...), not just the missions
 * field that has already broken twice.
 *
 * Usage: npm run test:utils
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isBrokenCmsPlaceholder } from '../tinaRichText.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = join(__dirname, '../../content');

function jsonFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...jsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function collectCorruptedPaths(value, path, hits) {
  if (typeof value === 'string') {
    if (isBrokenCmsPlaceholder(value)) hits.push(path);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => collectCorruptedPaths(v, `${path}[${i}]`, hits));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      collectCorruptedPaths(v, path ? `${path}.${k}` : k, hits);
    }
  }
}

describe('content JSON integrity', () => {
  const files = jsonFiles(contentDir);

  it('finds JSON content files to scan', () => {
    assert.ok(files.length > 0, 'no JSON files found under src/content');
  });

  for (const file of files) {
    const rel = relative(contentDir, file);
    it(`has no "[object Object]" placeholder: ${rel}`, () => {
      let data;
      try {
        data = JSON.parse(readFileSync(file, 'utf8'));
      } catch (err) {
        assert.fail(`invalid JSON in ${rel}: ${err.message}`);
      }
      const hits = [];
      collectCorruptedPaths(data, '', hits);
      assert.deepEqual(
        hits,
        [],
        `corrupted CMS placeholder in ${rel} at: ${hits.join(', ')}`
      );
    });
  }
});
