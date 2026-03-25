/**
 * TEST END-TO-END : Soumission de fiche pédagogique
 *
 * Ce script teste le VRAI flux de soumission avec l'API NocoDB :
 *   1. Vérifie les prérequis (token, connectivité API)
 *   2. Appelle le handler Netlify exactement comme en production
 *   3. Vérifie que l'enregistrement existe dans NocoDB
 *   4. Nettoie : supprime l'enregistrement de test
 *
 * Prérequis : fichier .env avec NOCODB_API_TOKEN à la racine du projet
 *
 * Usage :
 *   node netlify/functions/__tests__/e2e-submit-pedagogical-sheet.js
 *
 * SAFE :
 *   - Toutes les données test sont préfixées "[E2E-TEST]"
 *   - L'enregistrement est TOUJOURS supprimé, même en cas d'erreur
 *   - Le script refuse de tourner si le token est absent
 *   - Timeout de 30s pour éviter de rester bloqué
 */

import { Api } from 'nocodb-sdk';
import dotenv from 'dotenv';
import { handler } from '../submit-pedagogical-sheet.js';

dotenv.config();

// ─── Config ───────────────────────────────────────────
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = process.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = process.env.NOCODB_PROJECT_ID || 'pzafxqd4lr77r0v';
// Table ID réel (pas le View ID !)
const NOCODB_TABLE_ID = process.env.NOCODB_FICHES_TABLE_ID || process.env.NOCODB_BASE_ID || 'mur92i1x276ldbg';

const TEST_PREFIX = '[E2E-TEST]';
const TIMEOUT_MS = 30_000;

// ─── Données test identifiables ───────────────────────
const testFormData = {
  Title: `${TEST_PREFIX} Fiche de test automatisé`,
  Description: `${TEST_PREFIX} Cette fiche a été créée par un test e2e automatisé et sera supprimée immédiatement.`,
  TypeEnseignement: ['Ordinaire'],
  Section: ['Primaire'],
  Destinataire: 'Test automatisé',
  Themes: [],
  Objectifs: `${TEST_PREFIX} Vérifier que le formulaire fonctionne`,
  Competences: `${TEST_PREFIX} Tests automatisés`,
  prenom: 'Test-E2E',
  nom: 'Automatisé',
  email: 'e2e-test@outofthebooks.test',
  telephone: '',
  ecole: `${TEST_PREFIX} École fictive`,
  Declinaisons: '',
  Conseils: '',
  Liens: '',
  LiensVIDEO: ''
};

// ─── Helpers ──────────────────────────────────────────
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

function initApi() {
  return new Api({
    baseURL: NOCODB_BASE_URL,
    headers: { 'xc-token': NOCODB_API_TOKEN }
  });
}

// ─── Nettoyage : supprime tous les enregistrements [E2E-TEST] ───
async function cleanupTestRecords(api) {
  console.log('\n🧹 Nettoyage des enregistrements de test...');
  try {
    const response = await api.dbTableRow.list(
      NOCODB_ORG_ID,
      NOCODB_PROJECT_ID,
      NOCODB_TABLE_ID,
      {
        where: `(Title,like,${TEST_PREFIX})`,
        limit: 50
      }
    );

    const testRecords = response.list || [];
    if (testRecords.length === 0) {
      console.log('  Aucun enregistrement de test à supprimer.');
      return;
    }

    for (const record of testRecords) {
      try {
        await api.dbTableRow.delete(
          NOCODB_ORG_ID,
          NOCODB_PROJECT_ID,
          NOCODB_TABLE_ID,
          record.Id
        );
        console.log(`  🗑️  Supprimé: Id=${record.Id} "${record.Title}"`);
      } catch (err) {
        console.error(`  ⚠️  Échec suppression Id=${record.Id}:`, err.response?.data || err.message);
      }
    }
  } catch (err) {
    console.error('  ⚠️  Erreur lors du nettoyage:', err.response?.data || err.message);
  }
}

// ═══════════════════════════════════════════════════════
//  TESTS
// ═══════════════════════════════════════════════════════

async function testPrerequisites() {
  console.log('\n🧪 TEST A: Prérequis');

  assert(!!NOCODB_API_TOKEN, 'NOCODB_API_TOKEN est défini');
  assert(NOCODB_API_TOKEN && NOCODB_API_TOKEN.length > 10, 'Token a une longueur raisonnable');
  assert(NOCODB_TABLE_ID === 'mur92i1x276ldbg' || !!process.env.NOCODB_FICHES_TABLE_ID || !!process.env.NOCODB_BASE_ID,
    `Table ID résolu: ${NOCODB_TABLE_ID} (pas un View ID)`);
  assert(NOCODB_TABLE_ID !== 'vwp6ybxaurqxfimt',
    'Table ID n\'est PAS le View ID vwp6ybxaurqxfimt');
}

async function testApiConnectivity(api) {
  console.log('\n🧪 TEST B: Connectivité API NocoDB');

  try {
    const response = await api.dbTableRow.list(
      NOCODB_ORG_ID,
      NOCODB_PROJECT_ID,
      NOCODB_TABLE_ID,
      { limit: 1, offset: 0 }
    );

    assert(response !== null && response !== undefined, 'API répond');
    assert(typeof response.list !== 'undefined', 'Réponse contient une liste');
    assert(typeof response.pageInfo !== 'undefined', 'Réponse contient pageInfo');
    console.log(`  📊 Table contient ${response.pageInfo?.totalRows ?? '?'} enregistrements`);

    // Vérifier la structure des colonnes via un enregistrement existant
    if (response.list.length > 0) {
      const sample = response.list[0];
      const expectedFields = ['Title', 'Description', 'Prénom', 'Nom', 'Email', 'Ecole', 'Edition'];
      for (const field of expectedFields) {
        assert(field in sample, `Colonne "${field}" existe dans la table`);
      }
    } else {
      console.log('  ⚠️  Table vide, impossible de vérifier les colonnes');
    }
  } catch (err) {
    assert(false, `Connexion API: ${err.response?.status || ''} ${err.response?.data?.msg || err.message}`);
  }
}

async function testHandlerSubmission() {
  console.log('\n🧪 TEST C: Soumission via le handler Netlify (flux réel)');

  // Simuler l'appel exactement comme le frontend le fait
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(testFormData)
  };

  const response = await handler(event);
  const body = JSON.parse(response.body);

  assert(response.statusCode === 200, `Status HTTP: ${response.statusCode} (attendu: 200)`);
  assert(body.success === true, `success: ${body.success}`);
  assert(body.isTestMode === false, `isTestMode: ${body.isTestMode} (doit être false = vrai appel API)`);

  if (!body.success) {
    console.error(`  💥 Erreur du handler: ${body.message}`);
    console.error(`  💥 Détails: ${body.error}`);
  }

  return body.success;
}

async function testRecordExists(api) {
  console.log('\n🧪 TEST D: Vérification en base NocoDB');

  try {
    const response = await api.dbTableRow.list(
      NOCODB_ORG_ID,
      NOCODB_PROJECT_ID,
      NOCODB_TABLE_ID,
      {
        where: `(Title,like,${TEST_PREFIX})`,
        limit: 10
      }
    );

    const found = response.list || [];
    assert(found.length > 0, `Enregistrement trouvé en base (${found.length} résultat(s))`);

    if (found.length > 0) {
      const record = found[0];
      assert(record.Title.includes(TEST_PREFIX), `Title contient le préfixe test`);
      assert(record['Prénom'] === 'Test-E2E', `Prénom: "${record['Prénom']}"`);
      assert(record.Nom === 'Automatisé', `Nom: "${record.Nom}"`);
      assert(record.Email === 'e2e-test@outofthebooks.test', `Email: "${record.Email}"`);
      assert(record.Edition === new Date().getFullYear().toString(), `Edition: "${record.Edition}"`);

      // Vérifier les champs array (stockés en JSON stringifié)
      const typeEns = record['Type enseignement'];
      assert(typeEns && typeEns.includes('Ordinaire'),
        `Type enseignement: ${typeEns}`);

      const section = record.Section;
      assert(section && section.includes('Primaire'),
        `Section: ${section}`);
    }
  } catch (err) {
    assert(false, `Lecture en base: ${err.response?.data?.msg || err.message}`);
  }
}

// ═══════════════════════════════════════════════════════
//  RUNNER
// ═══════════════════════════════════════════════════════

async function run() {
  console.log('═══════════════════════════════════════════════');
  console.log('  E2E TEST : Soumission fiche pédagogique');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Table ID: ${NOCODB_TABLE_ID}`);
  console.log(`  API URL:  ${NOCODB_BASE_URL}`);
  console.log(`  Token:    ${NOCODB_API_TOKEN ? '****' + NOCODB_API_TOKEN.slice(-4) : 'MANQUANT'}`);

  // Garde-fou : pas de token = pas de test
  if (!NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '') {
    console.error('\n🛑 NOCODB_API_TOKEN manquant. Créez un fichier .env avec votre token.');
    console.error('   echo "NOCODB_API_TOKEN=votre_token" > .env');
    process.exit(1);
  }

  const api = initApi();

  try {
    // A. Prérequis
    await testPrerequisites();

    // B. Connectivité
    await testApiConnectivity(api);

    // Nettoyage préventif (au cas où un test précédent a crashé)
    await cleanupTestRecords(api);

    // C. Soumission via handler
    const submissionOk = await testHandlerSubmission();

    // D. Vérification en base (seulement si soumission OK)
    if (submissionOk) {
      // Petit délai pour propagation éventuelle
      await new Promise(r => setTimeout(r, 1000));
      await testRecordExists(api);
    }
  } finally {
    // TOUJOURS nettoyer, même en cas d'erreur
    await cleanupTestRecords(api);
  }

  // Rapport
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

// Timeout global de sécurité
const timeout = setTimeout(() => {
  console.error('\n🛑 TIMEOUT: le test a dépassé 30s. Abandon.');
  process.exit(2);
}, TIMEOUT_MS);

run().finally(() => clearTimeout(timeout));
