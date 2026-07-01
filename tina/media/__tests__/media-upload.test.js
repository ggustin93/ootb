/**
 * Tests unitaires — pipeline média Tina (compression + garde-fou d'upload)
 *
 * Couvre la logique PURE et déterministe autour du fix du bug d'upload
 * "SyntaxError ... n'est pas valide en JSON" (photos trop lourdes rejetées par
 * la limite ~6 Mo des fonctions Netlify) :
 *   - shouldCompress()  : quand faut-il compresser ?
 *   - ensureUploadable(): garde-fou + message clair au-delà de 4 Mo
 *   - compressImage()   : contrat de repli (jamais d'exception, no-op hors navigateur)
 *
 * Le rendu canvas lui-même n'est PAS testé ici : il dépend du navigateur et
 * n'apporterait qu'un test fragile. On teste les décisions, pas les pixels.
 *
 * Aucune dépendance externe. Usage :
 *   node tina/media/__tests__/media-upload.test.js
 */

import {
  shouldCompress,
  compressImage,
  SKIP_BELOW_BYTES,
} from "../compressImage.js";
import {
  ensureUploadable,
  tooLargeMessage,
  MAX_UPLOAD_BYTES,
} from "../uploadGuard.js";

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

function assertThrows(fn, label) {
  try {
    fn();
    assert(false, `${label} (aucune exception levée)`);
    return null;
  } catch (e) {
    assert(true, label);
    return e;
  }
}

// Faux File suffisant pour la logique pure (name/type/size). En Node, le vrai
// `File` n'existe pas et compressImage court-circuite via `typeof document`.
function fakeFile({ name = "photo.jpg", type = "image/jpeg", size = 0 } = {}) {
  return { name, type, size };
}

const MB = 1024 * 1024;

// ═══════════════════════════════════════════
//  1. shouldCompress — décision de compression
// ═══════════════════════════════════════════
function testShouldCompress() {
  console.log("\n🧪 TEST 1: shouldCompress()");

  // Cas nominal : image matricielle plus lourde que le seuil → on compresse
  assert(shouldCompress(fakeFile({ type: "image/jpeg", size: 5 * MB })), "JPEG 5 Mo → true");
  assert(shouldCompress(fakeFile({ type: "image/png", size: 3 * MB })), "PNG 3 Mo → true");
  assert(shouldCompress(fakeFile({ type: "image/webp", size: 4 * MB })), "WebP 4 Mo → true");

  // Sous le seuil → on ne touche pas (zéro perte de qualité)
  assert(!shouldCompress(fakeFile({ type: "image/jpeg", size: 1 * MB })), "JPEG 1 Mo → false (sous le seuil)");
  assert(!shouldCompress(fakeFile({ type: "image/jpeg", size: SKIP_BELOW_BYTES })), "JPEG pile au seuil → false (strictement >)");

  // Formats non ré-encodables → laissés tels quels
  assert(!shouldCompress(fakeFile({ type: "image/gif", size: 5 * MB })), "GIF 5 Mo → false (animé, non rasterisé)");
  assert(!shouldCompress(fakeFile({ type: "image/svg+xml", size: 5 * MB })), "SVG 5 Mo → false");
  assert(!shouldCompress(fakeFile({ type: "application/pdf", size: 5 * MB })), "PDF 5 Mo → false");

  // Entrées dégénérées → false sans planter
  assert(!shouldCompress(null), "null → false");
  assert(!shouldCompress(undefined), "undefined → false");
  assert(!shouldCompress({ name: "x", size: 5 * MB }), "type manquant → false");
  assert(!shouldCompress({ type: "image/jpeg" }), "size manquant → false");
}

// ═══════════════════════════════════════════
//  2. ensureUploadable — garde-fou de taille
// ═══════════════════════════════════════════
function testEnsureUploadable() {
  console.log("\n🧪 TEST 2: ensureUploadable()");

  // Sous / à la limite → passe silencieusement
  assert(ensureUploadable(fakeFile({ size: 1 * MB })) === undefined, "1 Mo → OK (pas d'exception)");
  assert(ensureUploadable(fakeFile({ size: MAX_UPLOAD_BYTES })) === undefined, "pile à 4 Mo → OK (limite inclusive)");

  // Au-dessus de la limite → exception explicite
  const err = assertThrows(
    () => ensureUploadable(fakeFile({ name: "Kevin Peeters.jpg", size: MAX_UPLOAD_BYTES + 1 })),
    "4 Mo + 1 octet → exception"
  );

  // Le message doit être exploitable par une utilisatrice non-technique
  if (err) {
    assert(/Kevin Peeters\.jpg/.test(err.message), "message contient le nom du fichier");
    assert(/trop lourde/i.test(err.message), "message explique le problème (trop lourde)");
    assert(/squoosh/i.test(err.message), "message propose une solution (squoosh)");
    // Surtout : ce n'est PAS le crash JSON d'origine
    assert(!/JSON|SyntaxError/i.test(err.message), "message n'est pas le crash JSON d'origine");
  }

  // Entrées dégénérées → ne plante pas
  assert(ensureUploadable(null) === undefined, "null → OK (pas d'exception)");
  assert(ensureUploadable({ name: "x" }) === undefined, "size manquant → OK (pas d'exception)");
}

// ═══════════════════════════════════════════
//  3. tooLargeMessage — formatage de la taille
// ═══════════════════════════════════════════
function testTooLargeMessage() {
  console.log("\n🧪 TEST 3: tooLargeMessage()");

  assert(/8\.0 Mo/.test(tooLargeMessage(fakeFile({ size: 8 * MB }))), "8 Mo formaté en '8.0 Mo'");
  assert(/4\.5 Mo/.test(tooLargeMessage(fakeFile({ size: 4.5 * MB }))), "4,5 Mo formaté en '4.5 Mo'");
  assert(/« image »/.test(tooLargeMessage({ size: 8 * MB })), "nom manquant → repli sur « image »");
}

// ═══════════════════════════════════════════
//  4. compressImage — contrat de repli (Node/SSR)
// ═══════════════════════════════════════════
async function testCompressImageFallback() {
  console.log("\n🧪 TEST 4: compressImage() — repli sans navigateur");

  // Hors navigateur (pas de `document`), compressImage doit renvoyer l'ORIGINAL
  // tel quel, sans jamais throw : garantit la sûreté au build/SSR et l'absence
  // de régression si le canvas échoue.
  const big = fakeFile({ type: "image/jpeg", size: 9 * MB });
  const out = await compressImage(big);
  assert(out === big, "grosse image en Node → fichier original renvoyé (no-op)");

  // Types non compressibles / entrées dégénérées → original, sans exception
  const gif = fakeFile({ type: "image/gif", size: 9 * MB });
  assert((await compressImage(gif)) === gif, "GIF → original renvoyé");
  assert((await compressImage(null)) === null, "null → renvoyé tel quel, sans planter");

  // Petite image → original
  const small = fakeFile({ type: "image/png", size: 100 * 1024 });
  assert((await compressImage(small)) === small, "petite image → original renvoyé");
}

// ═══════════════════════════════════════════
//  RUN
// ═══════════════════════════════════════════
async function run() {
  console.log("═══════════════════════════════════════════");
  console.log("  Tests — pipeline média Tina (upload/compression)");
  console.log("═══════════════════════════════════════════");

  testShouldCompress();
  testEnsureUploadable();
  testTooLargeMessage();
  await testCompressImageFallback();

  console.log("\n═══════════════════════════════════════════");
  console.log(`  Résultat : ${passed} ✅   ${failed} ❌`);
  console.log("═══════════════════════════════════════════");

  process.exit(failed > 0 ? 1 : 0);
}

run();
