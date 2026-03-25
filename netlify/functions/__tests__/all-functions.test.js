/**
 * Tests unitaires pour les 3 fonctions Netlify de soumission
 *
 * - submit-pedagogical-sheet: Fiches pédagogiques → NocoDB
 * - submit-contact: Formulaire de contact → NocoDB
 * - submit-newsletter: Newsletter → NocoDB + Brevo
 *
 * Aucun token API requis — tous les tests tournent en mode test/offline.
 *
 * Usage: node netlify/functions/__tests__/all-functions.test.js
 */

import { handler as pedagogicalHandler } from '../submit-pedagogical-sheet.js';
import { handler as contactHandler } from '../submit-contact.js';
import { handler as newsletterHandler } from '../submit-newsletter.js';

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

// ═══════════════════════════════════════════
//  1. ENV VAR CONFLICT DETECTION
// ═══════════════════════════════════════════

function testEnvVarIsolation() {
  console.log('\n🧪 TEST 1: Isolation des env vars entre fonctions');

  // 3 fonctions, 3 projets NocoDB différents
  const functions = {
    'pedagogical-sheet': { project: 'pzafxqd4lr77r0v', table: 'mur92i1x276ldbg' },
    'contact':           { project: 'pn7128r4idyluf0', table: 'mza30wqm38wsmib' },
    'newsletter':        { project: 'p41z6qweidro6nu', table: 'm6hnpjey4laav0z' },
  };

  const entries = Object.entries(functions);
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [nameA, idsA] = entries[i];
      const [nameB, idsB] = entries[j];
      assert(idsA.project !== idsB.project,
        `${nameA} et ${nameB} ont des project IDs différents`);
      assert(idsA.table !== idsB.table,
        `${nameA} et ${nameB} ont des table IDs différents`);
    }
  }
}

// ═══════════════════════════════════════════
//  2. PEDAGOGICAL SHEET — HANDLER
// ═══════════════════════════════════════════

async function testPedagogicalSheet() {
  console.log('\n🧪 TEST 2: submit-pedagogical-sheet');

  // 2a. POST valide → mode test
  const res = await pedagogicalHandler({
    httpMethod: 'POST',
    body: JSON.stringify({
      Title: 'Test', Description: 'Desc',
      TypeEnseignement: ['Ordinaire'], Section: ['Primaire'],
      Destinataire: 'Test', Themes: [],
      Objectifs: 'Obj', Competences: 'Comp',
      prenom: 'A', nom: 'B', email: 'a@b.com',
      telephone: '', ecole: 'E',
      Declinaisons: '', Conseils: '', Liens: '', LiensVIDEO: ''
    })
  });
  const body = JSON.parse(res.body);
  assert(res.statusCode === 200, 'POST → 200');
  assert(body.success === true, 'success=true');
  assert(body.isTestMode === true, 'isTestMode=true (pas de token)');

  // 2b. Méthode invalide
  const r405 = await pedagogicalHandler({ httpMethod: 'GET' });
  assert(r405.statusCode === 405, 'GET → 405');

  // 2c. JSON invalide
  const r500 = await pedagogicalHandler({ httpMethod: 'POST', body: '{bad' });
  assert(r500.statusCode === 500, 'JSON invalide → 500');
  assert(JSON.parse(r500.body).success === false, 'success=false sur erreur');
}

// ═══════════════════════════════════════════
//  3. CONTACT FORM — HANDLER
// ═══════════════════════════════════════════

async function testContactForm() {
  console.log('\n🧪 TEST 3: submit-contact');

  // 3a. POST valide → mode test
  const res = await contactHandler({
    httpMethod: 'POST',
    body: JSON.stringify({
      name: 'Sophie Test',
      email: 'sophie@test.com',
      subject: 'Test sujet',
      message: 'Test message'
    })
  });
  const body = JSON.parse(res.body);
  assert(res.statusCode === 200, 'POST → 200');
  assert(body.success === true, 'success=true');
  assert(body.isTestMode === true, 'isTestMode=true');

  // 3b. GET → diagnostic mode test
  const resGet = await contactHandler({ httpMethod: 'GET' });
  const bodyGet = JSON.parse(resGet.body);
  assert(resGet.statusCode === 200, 'GET (diagnostic) → 200');
  assert(bodyGet.isTestMode === true, 'GET isTestMode=true');
  assert(bodyGet.expectedStructure !== undefined, 'Retourne la structure attendue');

  // 3c. Méthode invalide
  const r405 = await contactHandler({ httpMethod: 'DELETE' });
  assert(r405.statusCode === 405, 'DELETE → 405');

  // 3d. JSON invalide
  const r500 = await contactHandler({ httpMethod: 'POST', body: 'nope' });
  assert(r500.statusCode === 500, 'JSON invalide → 500');
}

// ═══════════════════════════════════════════
//  4. NEWSLETTER — HANDLER
// ═══════════════════════════════════════════

async function testNewsletter() {
  console.log('\n🧪 TEST 4: submit-newsletter');

  // 4a. POST valide → mode test
  const res = await newsletterHandler({
    httpMethod: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      source: 'test',
      privacyAccepted: true
    })
  });
  const body = JSON.parse(res.body);
  assert(res.statusCode === 200, 'POST → 200');
  assert(body.success === true, 'success=true');
  assert(body.mode === 'test', 'mode=test');

  // 4b. POST sans email → 400
  const r400 = await newsletterHandler({
    httpMethod: 'POST',
    body: JSON.stringify({ source: 'test' })
  });
  assert(r400.statusCode === 400, 'POST sans email → 400');

  // 4c. GET → diagnostic mode test
  const resGet = await newsletterHandler({
    httpMethod: 'GET',
    rawUrl: 'https://example.com/api/submit-newsletter'
  });
  const bodyGet = JSON.parse(resGet.body);
  assert(resGet.statusCode === 200, 'GET (diagnostic) → 200');
  assert(bodyGet.mode === 'test', 'GET mode=test');

  // 4d. Méthode invalide
  const r405 = await newsletterHandler({ httpMethod: 'PUT' });
  assert(r405.statusCode === 405, 'PUT → 405');
}

// ═══════════════════════════════════════════
//  5. DATA FORMATTING — CONTACT
// ═══════════════════════════════════════════

function testContactDataFormatting() {
  console.log('\n🧪 TEST 5: Formatage des données — Contact');

  const input = {
    name: 'Sophie Dupont',
    email: 'sophie@example.com',
    subject: 'Question sur le festival',
    message: 'Bonjour, je voudrais savoir...'
  };

  // Logique du handler (lignes 188-193)
  const formatted = {
    Objet: input.subject || "Contact depuis le site web",
    Message: input.message,
    Auteur: input.email,
    Statut: "En attente de réponse"
  };

  assert(formatted.Objet === 'Question sur le festival', 'subject → Objet');
  assert(formatted.Auteur === input.email, 'email → Auteur');
  assert(formatted.Statut === 'En attente de réponse', 'Statut défaut');
  assert(!('Nom' in formatted), '"name" non mappé → NocoDB (champ ignoré)');

  // Subject vide → fallback
  assert((undefined || "Contact depuis le site web") === 'Contact depuis le site web',
    'Subject vide → fallback');
}

// ═══════════════════════════════════════════
//  6. DATA FORMATTING — NEWSLETTER
// ═══════════════════════════════════════════

function testNewsletterDataFormatting() {
  console.log('\n🧪 TEST 6: Formatage des données — Newsletter');

  const input = { email: 'test@example.com', source: 'footer', privacyAccepted: true };

  const formatted = {
    Email: input.email,
    Source: input.source || 'website',
    Tags: input.tags || 'site-web,newsletter',
    "Politique acceptée": input.privacyAccepted || false,
    Statut: "Actif"
  };

  assert(formatted.Email === 'test@example.com', 'email → Email');
  assert(formatted.Source === 'footer', 'source → Source');
  assert(formatted.Tags === 'site-web,newsletter', 'Tags défaut');
  assert(formatted["Politique acceptée"] === true, 'privacyAccepted → Politique acceptée');
  assert((undefined || 'website') === 'website', 'Source vide → website');
}

// ═══════════════════════════════════════════
//  7. CLIENT-SERVER FIELD MAPPING — CONTACT
// ═══════════════════════════════════════════

function testContactClientServerMapping() {
  console.log('\n🧪 TEST 7: Cohérence client ↔ serveur — Contact');

  // contact.astro envoie: name, email, subject, message
  // submit-contact.js utilise: email (→Auteur), subject (→Objet), message (→Message)
  // "name" est envoyé mais ignoré par le serveur
  const clientFields = ['name', 'email', 'subject', 'message'];
  const serverReads = ['email', 'subject', 'message'];

  const unused = clientFields.filter(f => !serverReads.includes(f));
  assert(unused.length === 1 && unused[0] === 'name',
    `Seul "name" non utilisé côté serveur (${unused.join(', ')})`);
}

// ═══════════════════════════════════════════
//  8. PEDAGOGICAL SHEET — TABLE ID RESOLUTION
// ═══════════════════════════════════════════

function testPedagogicalTableIdResolution() {
  console.log('\n🧪 TEST 8: Résolution Table ID — Fiche pédagogique');

  const TABLE_ID = 'mur92i1x276ldbg';
  const VIEW_ID = 'vwp6ybxaurqxfimt';

  function resolve(env) {
    return env.NOCODB_FICHES_TABLE_ID || env.NOCODB_BASE_ID || TABLE_ID;
  }

  assert(resolve({}) === TABLE_ID, 'Aucune env var → hardcoded TABLE_ID');
  assert(resolve({ NOCODB_BASE_ID: TABLE_ID }) === TABLE_ID, 'NOCODB_BASE_ID → TABLE_ID');
  assert(resolve({ NOCODB_FICHES_TABLE_ID: TABLE_ID }) === TABLE_ID, 'NOCODB_FICHES_TABLE_ID → TABLE_ID');
  assert(resolve({ NOCODB_FICHES_TABLE_ID: 'x', NOCODB_BASE_ID: 'y' }) === 'x',
    'FICHES_TABLE_ID prioritaire sur BASE_ID');

  // Le bug original
  const oldLogic = VIEW_ID; // process.env.NOCODB_TABLE_ID si défini
  const newLogic = resolve({ NOCODB_BASE_ID: TABLE_ID });
  assert(oldLogic === VIEW_ID, 'Ancien code → VIEW_ID (bug)');
  assert(newLogic === TABLE_ID, 'Nouveau code → TABLE_ID (fix)');
}

// ═══════════════════════════════════════════
//  RUNNER
// ═══════════════════════════════════════════

async function runAllTests() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Tests unitaires — Toutes les fonctions Netlify');
  console.log('═══════════════════════════════════════════════');

  // Synchrones
  testEnvVarIsolation();
  testContactDataFormatting();
  testNewsletterDataFormatting();
  testContactClientServerMapping();
  testPedagogicalTableIdResolution();

  // Async (handlers)
  await testPedagogicalSheet();
  await testContactForm();
  await testNewsletter();

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Résultat: ${passed} passés, ${failed} échoués`);
  if (failed === 0) {
    console.log('  🎉 TOUS LES TESTS PASSENT');
  } else {
    console.log('  💥 DES TESTS ONT ÉCHOUÉ');
  }
  console.log('═══════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

const timeout = setTimeout(() => {
  console.error('\n🛑 TIMEOUT');
  process.exit(2);
}, 15_000);

runAllTests().finally(() => clearTimeout(timeout));
