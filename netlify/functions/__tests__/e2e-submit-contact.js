/**
 * TEST END-TO-END : Formulaire de contact
 *
 * Ce script teste le VRAI flux de soumission du formulaire contact avec NocoDB :
 *   1. Vérifie les prérequis (token, connectivité API)
 *   2. Appelle le handler Netlify exactement comme en production
 *   3. Vérifie que l'enregistrement existe dans NocoDB
 *   4. Nettoie : supprime l'enregistrement de test
 *
 * Prérequis : fichier .env avec NOCODB_API_TOKEN à la racine du projet
 *
 * Usage :
 *   node netlify/functions/__tests__/e2e-submit-contact.js
 *
 * SAFE :
 *   - Toutes les données test contiennent "[E2E-TEST]"
 *   - L'enregistrement est TOUJOURS supprimé, même en cas d'erreur
 *   - Le script refuse de tourner si le token est absent
 *   - Timeout de 30s
 */

import { Api } from 'nocodb-sdk';
import dotenv from 'dotenv';
import { handler } from '../submit-contact.js';

dotenv.config();

// ─── Config ───────────────────────────────────────────
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;
const NOCODB_ORG_ID = process.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = process.env.NOCODB_CONTACT_PROJECT_ID || 'pn7128r4idyluf0';
const NOCODB_TABLE_ID = process.env.NOCODB_CONTACT_TABLE_ID || 'mza30wqm38wsmib';

const TEST_PREFIX = '[E2E-TEST]';
const TIMEOUT_MS = 30_000;

// ─── Données test ─────────────────────────────────────
const testFormData = {
  name: 'Test-E2E Automatisé',
  email: 'e2e-contact@outofthebooks.test',
  subject: `${TEST_PREFIX} Message de test automatisé`,
  message: `${TEST_PREFIX} Ce message a été créé par un test e2e et sera supprimé immédiatement.`
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

async function cleanupTestRecords(api) {
  console.log('\n🧹 Nettoyage des enregistrements de test...');
  try {
    const response = await api.dbTableRow.list(
      NOCODB_ORG_ID, NOCODB_PROJECT_ID, NOCODB_TABLE_ID,
      { where: `(Objet,like,${TEST_PREFIX})`, limit: 50 }
    );
    const testRecords = response.list || [];
    if (testRecords.length === 0) {
      console.log('  Aucun enregistrement de test à supprimer.');
      return;
    }
    for (const record of testRecords) {
      try {
        await api.dbTableRow.delete(NOCODB_ORG_ID, NOCODB_PROJECT_ID, NOCODB_TABLE_ID, record.Id);
        console.log(`  🗑️  Supprimé: Id=${record.Id} "${record.Objet}"`);
      } catch (err) {
        console.error(`  ⚠️  Échec suppression Id=${record.Id}:`, err.response?.data || err.message);
      }
    }
  } catch (err) {
    console.error('  ⚠️  Erreur lors du nettoyage:', err.response?.data || err.message);
  }
}

// ═══════════════════════════════════════════════════════
async function testPrerequisites() {
  console.log('\n🧪 TEST A: Prérequis');
  assert(!!NOCODB_API_TOKEN, 'NOCODB_API_TOKEN est défini');
  assert(NOCODB_API_TOKEN && NOCODB_API_TOKEN.length > 10, 'Token a une longueur raisonnable');
  console.log(`  📋 Project ID: ${NOCODB_PROJECT_ID}`);
  console.log(`  📋 Table ID: ${NOCODB_TABLE_ID}`);
}

async function testApiConnectivity(api) {
  console.log('\n🧪 TEST B: Connectivité API NocoDB (table Contact)');
  try {
    const response = await api.dbTableRow.list(
      NOCODB_ORG_ID, NOCODB_PROJECT_ID, NOCODB_TABLE_ID,
      { limit: 1, offset: 0 }
    );
    assert(response !== null && response !== undefined, 'API répond');
    assert(typeof response.list !== 'undefined', 'Réponse contient une liste');
    console.log(`  📊 Table contient ${response.pageInfo?.totalRows ?? '?'} enregistrements`);

    if (response.list.length > 0) {
      const sample = response.list[0];
      for (const field of ['Objet', 'Message', 'Auteur']) {
        assert(field in sample, `Colonne "${field}" existe dans la table`);
      }
    }
  } catch (err) {
    assert(false, `Connexion API: ${err.response?.status || ''} ${err.response?.data?.msg || err.message}`);
  }
}

async function testHandlerSubmission() {
  console.log('\n🧪 TEST C: Soumission via le handler Netlify');

  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(testFormData)
  };

  const response = await handler(event);
  const body = JSON.parse(response.body);

  assert(response.statusCode === 200, `Status HTTP: ${response.statusCode} (attendu: 200)`);
  assert(body.success === true, `success: ${body.success}`);
  assert(body.isTestMode === false, `isTestMode: ${body.isTestMode} (doit être false)`);

  if (!body.success) {
    console.error(`  💥 Erreur: ${body.message}`);
    console.error(`  💥 Détails: ${body.error}`);
  }
  return body.success;
}

async function testRecordExists(api) {
  console.log('\n🧪 TEST D: Vérification en base NocoDB');
  try {
    const response = await api.dbTableRow.list(
      NOCODB_ORG_ID, NOCODB_PROJECT_ID, NOCODB_TABLE_ID,
      { where: `(Objet,like,${TEST_PREFIX})`, limit: 10 }
    );
    const found = response.list || [];
    assert(found.length > 0, `Enregistrement trouvé en base (${found.length})`);

    if (found.length > 0) {
      const record = found[0];
      assert(record.Objet && record.Objet.includes(TEST_PREFIX), `Objet contient le préfixe test`);
      assert(record.Auteur === 'e2e-contact@outofthebooks.test', `Auteur: "${record.Auteur}"`);
      assert(record.Statut === 'En attente de réponse', `Statut: "${record.Statut}"`);
    }
  } catch (err) {
    assert(false, `Lecture en base: ${err.response?.data?.msg || err.message}`);
  }
}

// ═══════════════════════════════════════════════════════
async function run() {
  console.log('═══════════════════════════════════════════════');
  console.log('  E2E TEST : Formulaire de contact');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Project ID: ${NOCODB_PROJECT_ID}`);
  console.log(`  Table ID:   ${NOCODB_TABLE_ID}`);
  console.log(`  Token:      ${NOCODB_API_TOKEN ? '****' + NOCODB_API_TOKEN.slice(-4) : 'MANQUANT'}`);

  if (!NOCODB_API_TOKEN || NOCODB_API_TOKEN.trim() === '') {
    console.error('\n🛑 NOCODB_API_TOKEN manquant. Créez un fichier .env avec votre token.');
    process.exit(1);
  }

  const api = initApi();

  try {
    await testPrerequisites();
    await testApiConnectivity(api);
    await cleanupTestRecords(api);

    const ok = await testHandlerSubmission();
    if (ok) {
      await new Promise(r => setTimeout(r, 1000));
      await testRecordExists(api);
    }
  } finally {
    await cleanupTestRecords(api);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Résultat: ${passed} passés, ${failed} échoués`);
  console.log(failed === 0 ? '  🎉 TOUS LES TESTS PASSENT' : '  💥 DES TESTS ONT ÉCHOUÉ');
  console.log('═══════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

const timeout = setTimeout(() => { console.error('\n🛑 TIMEOUT'); process.exit(2); }, TIMEOUT_MS);
run().finally(() => clearTimeout(timeout));
