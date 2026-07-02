/**
 * Unit tests — Tina rich-text build-time HTML converter
 *
 * Guards against:
 * - AST → HTML regressions (missions À propos)
 * - CMS placeholder strings "[object Object]" re-committed in JSON
 *
 * Usage: npm run test:utils
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isBrokenCmsPlaceholder, richTextToHtml } from '../tinaRichText.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const aboutJsonPath = join(__dirname, '../../content/about/index.json');

const sampleRoot = {
  type: 'root',
  children: [
    {
      type: 'p',
      children: [{ type: 'text', text: 'Au sein de l’ASBL Out of the Books' }],
    },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [{ type: 'lic', children: [{ type: 'text', text: 'La pénurie croissante des enseignants' }] }],
        },
      ],
    },
    {
      type: 'h3',
      children: [{ type: 'text', text: '🎓 1. La pénurie des enseignants' }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'Texte en gras', bold: true }],
    },
  ],
};

describe('richTextToHtml', () => {
  it('renders paragraph text nodes', () => {
    const html = richTextToHtml({
      type: 'root',
      children: [{ type: 'p', children: [{ type: 'text', text: 'Hello' }] }],
    });
    assert.match(html, /<p>Hello<\/p>/);
  });

  it('renders lists with lic nodes (Tina list item content)', () => {
    const html = richTextToHtml(sampleRoot);
    assert.match(html, /<ul><li>La pénurie croissante des enseignants<\/li><\/ul>/);
    assert.match(html, /<h3>🎓 1\. La pénurie des enseignants<\/h3>/);
  });

  it('escapes HTML in text nodes', () => {
    const html = richTextToHtml({
      type: 'root',
      children: [{ type: 'p', children: [{ type: 'text', text: '<script>alert(1)</script>' }] }],
    });
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>/);
  });

  it('renders bold marks', () => {
    const html = richTextToHtml(sampleRoot);
    assert.match(html, /<strong>Texte en gras<\/strong>/);
  });

  it('returns empty string for null/undefined/empty AST', () => {
    assert.equal(richTextToHtml(null), '');
    assert.equal(richTextToHtml(undefined), '');
    assert.equal(richTextToHtml({ type: 'root', children: [] }), '');
  });
});

describe('isBrokenCmsPlaceholder', () => {
  it('detects corrupted CMS strings', () => {
    assert.equal(isBrokenCmsPlaceholder('[object Object]'), true);
    assert.equal(isBrokenCmsPlaceholder('\\[object Object]\n'), true);
    assert.equal(isBrokenCmsPlaceholder('  [object Object]  '), true);
  });

  it('allows real content strings', () => {
    assert.equal(isBrokenCmsPlaceholder('La pénurie croissante des enseignants'), false);
    assert.equal(isBrokenCmsPlaceholder(''), false);
  });
});

describe('about/index.json missions contract', () => {
  it('stores plain strings, not rich-text AST objects', () => {
    const about = JSON.parse(readFileSync(aboutJsonPath, 'utf8'));
    assert.ok(about.missions?.length, 'about.json must define missions');

    for (const mission of about.missions) {
      // Rich-text AST (object) in this nested JSON field is what TinaCloud
      // serializes to "[object Object]" on save — must stay a plain string.
      assert.equal(
        typeof mission.description,
        'string',
        `mission "${mission.title}" must be a plain string, not rich-text AST`
      );
      assert.equal(
        isBrokenCmsPlaceholder(mission.description),
        false,
        `mission "${mission.title}" holds the corrupted "[object Object]" placeholder`
      );
    }
  });

  it('mission descriptions contain real content, not placeholders', () => {
    const about = JSON.parse(readFileSync(aboutJsonPath, 'utf8'));
    assert.match(about.missions[0].description, /pénurie croissante/i);
    assert.doesNotMatch(about.missions[0].description, /\[object Object\]/i);
  });
});
