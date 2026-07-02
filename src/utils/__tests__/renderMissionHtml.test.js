/**
 * Unit tests — renderMissionHtml (string → HTML mission formatter)
 *
 * Guards the STRING render path used by missions[].description after
 * converting that field from rich-text (AST, unstable in this nested-JSON
 * position) to a plain string. Zero coverage previously.
 *
 * Usage: npm run test:utils
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { renderMissionHtml } from '../renderMissionHtml.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const aboutJsonPath = join(__dirname, '../../content/about/index.json');

describe('renderMissionHtml', () => {
  it('wraps a plain line in a paragraph', () => {
    assert.match(renderMissionHtml('Bonjour le monde'), /<p class="[^"]*">Bonjour le monde<\/p>/);
  });

  it('converts **bold** to <strong> inside paragraphs', () => {
    assert.match(renderMissionHtml('Voici du **gras** ici'), /Voici du <strong>gras<\/strong> ici/);
  });

  it('renders a numbered 🎓 line as an <h4> heading', () => {
    assert.match(
      renderMissionHtml('🎓 1. La pénurie des enseignants'),
      /<h4[^>]*>🎓 1\. La pénurie des enseignants<\/h4>/
    );
  });

  it('renders a 📚 line as an <h4> heading', () => {
    assert.match(
      renderMissionHtml('📚 2. Les difficultés d’apprentissage'),
      /<h4[^>]*>📚 2\. Les difficultés d’apprentissage<\/h4>/
    );
  });

  it('renders a ✔ line as a green-check row and strips the marker', () => {
    const html = renderMissionHtml('✔ Valoriser le **métier**');
    assert.match(html, /text-green-500">✓<\/span>/);
    assert.match(html, /<span>Valoriser le <strong>métier<\/strong><\/span>/);
    assert.doesNotMatch(html, /✔/);
  });

  it('renders a "* " line as a bulleted row and strips the marker', () => {
    const html = renderMissionHtml('* Faire de l’enseignement une profession choisie');
    assert.match(html, /<span>Faire de l’enseignement une profession choisie<\/span>/);
    assert.doesNotMatch(html, /\* Faire/);
  });

  it('returns empty string for empty input', () => {
    assert.equal(renderMissionHtml(''), '');
  });

  it('skips blank lines and the <!----> marker', () => {
    const html = renderMissionHtml('Ligne un\n\n<!---->\n\nLigne deux');
    assert.doesNotMatch(html, /<!---->/);
    assert.equal((html.match(/<p /g) || []).length, 2);
  });

  it('never emits the corrupted CMS placeholder from real about.json data', () => {
    const about = JSON.parse(readFileSync(aboutJsonPath, 'utf8'));
    for (const mission of about.missions) {
      const html = renderMissionHtml(mission.description);
      assert.doesNotMatch(html, /\[object Object\]/i);
      assert.ok(html.length > 0, `mission "${mission.title}" rendered empty`);
    }
  });
});
