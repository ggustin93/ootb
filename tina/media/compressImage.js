// tina/media/compressImage.js

/**
 * Compression / redimensionnement d'image côté navigateur, AVANT l'upload Tina.
 *
 * Pourquoi ce fichier existe :
 * Les fonctions Netlify synchrones plafonnent le corps d'une requête à ~6 Mo
 * (et le transport base64 ajoute encore ~33 %). Une photo de quelques Mo
 * (typiquement une photo de portrait du Conseil d'Administration) dépasse cette
 * limite : Netlify renvoie alors « Internal Server Error » en texte brut, que le
 * client `next-tinacms-cloudinary` essaie de parser en JSON → SyntaxError.
 *
 * On résout la cause racine en réduisant l'image dans le navigateur avant l'envoi.
 * Toute la logique est défensive : en cas d'échec, on renvoie le fichier original
 * (le comportement n'est jamais pire qu'avant le patch).
 */

// On ne compresse que les formats matriciels ré-encodables sans surprise.
// (On laisse passer GIF/SVG/PDF/vidéo tels quels : rasteriser un GIF animé ou
//  un SVG ferait plus de mal que de bien.)
const COMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// En dessous de ce seuil, l'image passe sans problème : on ne la touche pas
// (zéro perte de qualité pour le cas courant).
const SKIP_BELOW_BYTES = 2 * 1024 * 1024; // 2 Mo

// Dimension max du plus grand côté après redimensionnement (largement suffisant
// pour de l'affichage web ; une photo de CA n'a pas besoin de 6000 px).
const MAX_DIMENSION = 2000;

// Qualité de ré-encodage JPEG/WebP.
const QUALITY = 0.82;

/**
 * Charge un File image en bitmap en respectant l'orientation EXIF.
 * Fallback sur <img> si createImageBitmap (ou son option d'orientation)
 * n'est pas disponible.
 */
async function loadBitmap(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch (_) {
      // certains navigateurs ne supportent pas l'option -> on retente sans
      try {
        return await createImageBitmap(file);
      } catch (_) {
        /* on bascule sur le fallback <img> ci-dessous */
      }
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function getDimensions(bitmap) {
  // ImageBitmap expose width/height ; HTMLImageElement aussi (naturalWidth en secours)
  const width = bitmap.width || bitmap.naturalWidth;
  const height = bitmap.height || bitmap.naturalHeight;
  return { width, height };
}

/**
 * Compresse/redimensionne un File image si nécessaire.
 * Renvoie TOUJOURS un File (l'original si rien à faire ou en cas d'erreur).
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressImage(file) {
  try {
    if (
      !file ||
      typeof file.type !== "string" ||
      !COMPRESSIBLE_TYPES.has(file.type) ||
      file.size <= SKIP_BELOW_BYTES ||
      typeof document === "undefined"
    ) {
      return file;
    }

    const bitmap = await loadBitmap(file);
    const { width, height } = getDimensions(bitmap);
    if (!width || !height) return file;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    if (typeof bitmap.close === "function") bitmap.close();

    // On garde le PNG en PNG pour préserver la transparence ; JPEG/WebP -> JPEG.
    const outType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, outType, QUALITY)
    );
    if (!blob) return file;

    // Si la "compression" a paradoxalement grossi le fichier, on garde l'original.
    if (blob.size >= file.size) return file;

    // On conserve le nom d'origine (Tina l'envoie comme champ `filename`),
    // en ajustant l'extension si on a transcodé en JPEG.
    let name = file.name;
    if (outType === "image/jpeg" && !/\.jpe?g$/i.test(name)) {
      name = name.replace(/\.[^.]+$/, "") + ".jpg";
    }

    return new File([blob], name, {
      type: outType,
      lastModified: file.lastModified,
    });
  } catch (e) {
    // Filet de sécurité absolu : en cas de pépin, on renvoie l'original.
    console.warn("[tina-media] compression ignorée, fichier original conservé:", e);
    return file;
  }
}
