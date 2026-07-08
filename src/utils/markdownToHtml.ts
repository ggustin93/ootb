import { marked } from 'marked';

/**
 * Convertit une chaîne Markdown (telle que produite par l'éditeur rich-text de
 * TinaCMS et stockée dans les fichiers JSON) en HTML.
 *
 * Exécuté au build (pages SSG `prerender`) : aucun JS n'est envoyé au client.
 * Le contenu provient du CMS de confiance, aucune désinfection n'est appliquée.
 *
 * @param md - Contenu Markdown à convertir (peut être vide/nul).
 * @returns Le HTML correspondant, ou une chaîne vide si l'entrée est vide.
 */
export function markdownToHtml(md: string | null | undefined): string {
  if (!md || typeof md !== 'string') return '';
  return marked.parse(md, { async: false, gfm: true, breaks: false }) as string;
}
