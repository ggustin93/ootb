// tina/media/uploadGuard.js

/**
 * Garde-fou de taille d'upload, partagé entre le media store (config.ts) et les
 * tests.
 *
 * Les fonctions Netlify synchrones plafonnent le corps de requête à ~6 Mo, gonflé
 * par le transport base64. Au-delà, Netlify répond « Internal Server Error » en
 * texte brut, que le client next-tinacms-cloudinary tente de parser en JSON, d'où
 * la popup « SyntaxError ... n'est pas valide en JSON ». On refuse donc l'envoi en
 * amont, avec un message clair, plutôt que de laisser la plateforme échouer.
 */

// Marge de sécurité sous la limite Netlify (~6 Mo brut / ~4,4 Mo après base64).
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 Mo

/**
 * Construit le message d'erreur affiché à l'utilisateur (non-technique) quand une
 * image reste trop lourde après compression.
 *
 * @param {{ name?: string, size: number }} file
 * @returns {string}
 */
export function tooLargeMessage(file) {
  const mb = (file.size / 1024 / 1024).toFixed(1);
  const name = file.name || "image";
  return (
    `L'image « ${name} » est trop lourde (${mb} Mo) pour être téléversée. ` +
    `Merci de la réduire sous 4 Mo (par exemple via https://squoosh.app) puis de réessayer.`
  );
}

/**
 * Lève une erreur explicite si le fichier dépasse la limite d'upload.
 * Ne fait rien (retour silencieux) sinon.
 *
 * @param {{ name?: string, size?: number } | null | undefined} file
 * @param {number} [max=MAX_UPLOAD_BYTES]
 */
export function ensureUploadable(file, max = MAX_UPLOAD_BYTES) {
  if (file && typeof file.size === "number" && file.size > max) {
    throw new Error(tooLargeMessage(file));
  }
}
