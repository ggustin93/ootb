/**
 * Prépare le HTML de CHANGELOG-2026.md pour le journal des clientes (/dashboard/journal/).
 *
 * Le fichier sert aussi aux développeurs sur GitHub : on retire ici ce qui ne concerne qu'eux.
 * Fail fast : si un détail technique passe quand même (format du changelog modifié), on lève
 * une erreur, et le build échoue au lieu de l'afficher aux clientes.
 */

const dateFr = new Intl.DateTimeFormat('fr-BE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Indices d'un contenu réservé aux développeurs, interdits sur la page finale. */
const LEAKS = [
  { name: 'liste de fichiers', re: /Fichiers (?:modifiés|ajoutés|supprimés)/ },
  { name: 'numéro de ticket ou de PR', re: /#\d+/ },
  { name: 'chemin de fichier', re: /\b(?:src|tina|netlify|\.github|api|public|tests|memory-bank|claudedocs)\/[\w.[-]/ },
  { name: "version d'en-tête non convertie", re: /<h2[^>]*>\s*\[\d+\.\d+\.\d+\]/ },
];

/**
 * @param {string} html HTML compilé de CHANGELOG-2026.md
 * @returns {string} HTML prêt pour les clientes
 */
export function toClientChangelog(html) {
  const firstVersion = html.indexOf('<h2');
  if (firstVersion === -1) throw new Error('clientChangelog : aucun titre de version (<h2>) trouvé.');

  const out = html
    .slice(firstVersion) // retire le titre et la note de format du fichier
    .replace(/<p><strong>Fichiers [^<]*<\/strong>[\s\S]*?<\/p>/g, '')
    .replace(/ ?\(#\d+\)/g, '')
    .replace(
      /\[(\d+\.\d+\.\d+)\] [—–-] (\d{4}-\d{2}-\d{2})/g,
      (_, version, date) => `${dateFr.format(new Date(date))} · version ${version}`
    );

  const leak = LEAKS.find(({ re }) => re.test(out));
  if (leak) throw new Error(`clientChangelog : ${leak.name} visible pour les clientes (${out.match(leak.re)[0]}).`);
  return out;
}
