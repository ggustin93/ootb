/**
 * Utilitaires média pour la page Erasmus+.
 *
 * Objectif UX éditeur : un rédacteur colle simplement un lien YouTube et la
 * miniature s'affiche automatiquement, sans avoir à uploader une image.
 * Les liens Pédagoscope / non-YouTube tombent sur un fallback générique.
 */

/** Formats d'URL YouTube reconnus (watch?v=, youtu.be/, /embed/, /shorts/, /live/). */
const YOUTUBE_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/,
  /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/(?:embed|shorts|live|v)\/)([A-Za-z0-9_-]{11})/,
];

/**
 * Extrait l'identifiant d'une vidéo YouTube depuis ses différents formats d'URL.
 */
export function getYouTubeId(url?: string): string | null {
  if (!url) return null;

  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * Retourne l'URL de la miniature YouTube pour une URL de vidéo, ou null.
 * `hqdefault` (480x360) est toujours disponible, contrairement à `maxresdefault`.
 */
export function getYouTubeThumbnail(
  url?: string,
  quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'
): string | null {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/${quality}.jpg` : null;
}

/**
 * Vrai si l'URL est exploitable. Le sentinelle `'#'` sert de « lien non encore
 * défini » dans le contenu Erasmus+ (placeholder éditeur).
 */
export const hasLink = (url?: string): boolean => Boolean(url && url !== '#');

/** Forme minimale d'une vidéo telle que stockée dans le contenu Erasmus+. */
interface VideoLike {
  url?: string;
  miniature?: string;
}

/**
 * Détermine la miniature à afficher pour une vidéo :
 * 1. miniature explicite (override éditeur)
 * 2. miniature YouTube dérivée du lien
 * 3. null → la carte affiche le fallback générique (fond dégradé + icône)
 */
export function resolveVideoThumbnail(video: VideoLike): string | null {
  if (video.miniature) return video.miniature;
  return getYouTubeThumbnail(video.url);
}
