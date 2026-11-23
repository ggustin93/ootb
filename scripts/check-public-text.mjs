#!/usr/bin/env node
/**
 * Vérifie un texte avant publication sur GitHub (issue, PR, commentaire).
 * Le dépôt est public : aucune adresse e-mail, aucun chemin de notes internes,
 * aucun terme de la liste locale (noms à ne pas publier).
 *
 * Usage : node scripts/check-public-text.mjs < corps.md   (code de sortie 1 si refus)
 * Liste locale facultative, une expression par ligne : memory-bank/public-denylist.txt
 */
import { existsSync, readFileSync } from 'node:fs';

const text = readFileSync(0, 'utf8');
const rules = [
  { name: 'adresse e-mail', re: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  { name: 'chemin de notes internes', re: /\b(?:memory-bank|claudedocs)\/[\w./-]*/g },
];

const denylist = 'memory-bank/public-denylist.txt';
if (existsSync(denylist)) {
  for (const term of readFileSync(denylist, 'utf8')
    .split('\n')
    .map((l) => l.trim())) {
    if (!term || term.startsWith('#')) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    rules.push({ name: 'terme de la liste locale', re: new RegExp(`\\b${escaped}\\b`, 'gi') });
  }
}

const hits = rules.flatMap(({ name, re }) => [...text.matchAll(re)].map((m) => `${name} : ${m[0]}`));
if (hits.length) {
  console.error(`Publication refusée (${hits.length}) :\n- ${[...new Set(hits)].join('\n- ')}`);
  process.exit(1);
}
console.log('Texte publiable.');
