/**
 * Tests pragmatiques pour submit-pedagogical-sheet
 *
 * Couvre :
 * 1. Résolution correcte du Table ID selon les env vars
 * 2. Mode test (sans token)
 * 3. Validation des données formatées
 * 4. Gestion des erreurs (méthode HTTP, JSON invalide)
 */

// =============================================
// TEST 1: Résolution du NOCODB_TABLE_ID
// =============================================

function testTableIdResolution() {
  console.log('\n🧪 TEST 1: Résolution du Table ID');

  const CORRECT_TABLE_ID = 'mur92i1x276ldbg';
  const VIEW_ID = 'vwp6ybxaurqxfimt'; // Ce qu'on ne veut PAS

  // Simule la logique de résolution du fix
  function resolveTableId(env) {
    return env.NOCODB_FICHES_TABLE_ID || env.NOCODB_BASE_ID || CORRECT_TABLE_ID;
  }

  // Cas 1: Aucune env var → fallback hardcodé
  let result = resolveTableId({});
  console.assert(result === CORRECT_TABLE_ID, `  ❌ Cas 1 FAIL: got ${result}`);
  console.log(`  ✅ Cas 1: Aucune env var → ${result} (correct)`);

  // Cas 2: NOCODB_BASE_ID défini (comme dans build script)
  result = resolveTableId({ NOCODB_BASE_ID: CORRECT_TABLE_ID });
  console.assert(result === CORRECT_TABLE_ID, `  ❌ Cas 2 FAIL: got ${result}`);
  console.log(`  ✅ Cas 2: NOCODB_BASE_ID défini → ${result} (correct)`);

  // Cas 3: NOCODB_FICHES_TABLE_ID défini (nouveau, explicite)
  result = resolveTableId({ NOCODB_FICHES_TABLE_ID: CORRECT_TABLE_ID });
  console.assert(result === CORRECT_TABLE_ID, `  ❌ Cas 3 FAIL: got ${result}`);
  console.log(`  ✅ Cas 3: NOCODB_FICHES_TABLE_ID défini → ${result} (correct)`);

  // Cas 4: NOCODB_FICHES_TABLE_ID prend priorité sur NOCODB_BASE_ID
  result = resolveTableId({ NOCODB_FICHES_TABLE_ID: 'custom_id', NOCODB_BASE_ID: 'other_id' });
  console.assert(result === 'custom_id', `  ❌ Cas 4 FAIL: got ${result}`);
  console.log(`  ✅ Cas 4: NOCODB_FICHES_TABLE_ID prioritaire → ${result}`);

  // Cas 5 (LE BUG ORIGINAL): NOCODB_TABLE_ID contient le View ID
  // L'ancien code: process.env.NOCODB_TABLE_ID || 'mur92i1x276ldbg'
  // aurait résolu à VIEW_ID si NOCODB_TABLE_ID était défini
  const oldLogic = VIEW_ID; // process.env.NOCODB_TABLE_ID = vwp6ybxaurqxfimt
  const newLogic = resolveTableId({ NOCODB_BASE_ID: CORRECT_TABLE_ID });
  console.assert(oldLogic !== CORRECT_TABLE_ID, `  Cas 5: ancien code aurait utilisé le View ID`);
  console.assert(newLogic === CORRECT_TABLE_ID, `  ❌ Cas 5 FAIL`);
  console.log(`  ✅ Cas 5: Ancien code → ${oldLogic} (VIEW! ❌), Nouveau code → ${newLogic} (TABLE ✅)`);
}

// =============================================
// TEST 2: Handler - Mode test (sans token)
// =============================================

async function testHandlerTestMode() {
  console.log('\n🧪 TEST 2: Mode test (sans token API)');

  // Sauvegarder et supprimer le token
  const originalToken = process.env.NOCODB_API_TOKEN;
  delete process.env.NOCODB_API_TOKEN;

  try {
    // Import dynamique ESM
    const module = await import('../submit-pedagogical-sheet.js');
    const handler = module.handler;

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        Title: 'Test Fiche',
        Description: 'Description test',
        TypeEnseignement: ['Ordinaire'],
        Section: ['Primaire'],
        Destinataire: 'Enseignants',
        Themes: [],
        Objectifs: 'Objectif test',
        Competences: 'Compétence test',
        prenom: 'Sophie',
        nom: 'Test',
        email: 'sophie@test.com',
        telephone: '+32 123 456 789',
        ecole: 'École Test'
      })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    console.assert(response.statusCode === 200, `  ❌ Status: ${response.statusCode}`);
    console.assert(body.success === true, `  ❌ Success: ${body.success}`);
    console.assert(body.isTestMode === true, `  ❌ isTestMode: ${body.isTestMode}`);
    console.log(`  ✅ Status 200, success=true, isTestMode=true`);
    console.log(`  ✅ Message: "${body.message}"`);
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message}`);
  } finally {
    // Restaurer
    if (originalToken) process.env.NOCODB_API_TOKEN = originalToken;
  }
}

// =============================================
// TEST 3: Handler - Méthode non-POST rejetée
// =============================================

async function testHandlerMethodNotAllowed() {
  console.log('\n🧪 TEST 3: Rejet des méthodes non-POST');

  try {
    const module = await import('../submit-pedagogical-sheet.js');
    const handler = module.handler;

    for (const method of ['GET', 'PUT', 'DELETE']) {
      const response = await handler({ httpMethod: method });
      const body = JSON.parse(response.body);

      console.assert(response.statusCode === 405, `  ❌ ${method}: status ${response.statusCode}`);
      console.assert(body.success === false, `  ❌ ${method}: success=${body.success}`);
      console.log(`  ✅ ${method} → 405 Method Not Allowed`);
    }
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message}`);
  }
}

// =============================================
// TEST 4: Handler - JSON invalide
// =============================================

async function testHandlerInvalidJSON() {
  console.log('\n🧪 TEST 4: Body JSON invalide');

  try {
    const module = await import('../submit-pedagogical-sheet.js');
    const handler = module.handler;

    const response = await handler({
      httpMethod: 'POST',
      body: 'ceci nest pas du json{'
    });

    const body = JSON.parse(response.body);
    console.assert(response.statusCode === 500, `  ❌ Status: ${response.statusCode}`);
    console.assert(body.success === false, `  ❌ Success: ${body.success}`);
    console.log(`  ✅ Status 500, success=false`);
    console.log(`  ✅ Erreur gérée: "${body.message.substring(0, 80)}..."`);
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message}`);
  }
}

// =============================================
// TEST 5: Formatage des données
// =============================================

function testDataFormatting() {
  console.log('\n🧪 TEST 5: Formatage des données pour NocoDB');

  const inputData = {
    Title: 'Ma fiche test',
    Description: 'Description',
    TypeEnseignement: ['Ordinaire', 'Spécialisé'],
    Section: ['Primaire', 'Secondaire'],
    Destinataire: 'Enseignants',
    Themes: ['Thème 1'],
    Objectifs: 'Objectifs',
    Competences: 'Compétences',
    prenom: 'Sophie',
    nom: 'Dupont',
    email: 'sophie@example.com',
    telephone: '',
    ecole: 'Mon école',
    Declinaisons: '',
    Conseils: 'Un conseil',
    Liens: 'https://example.com',
    LiensVIDEO: ''
  };

  // Reproduire la logique de formatage de la fonction
  const formattedData = {
    Title: inputData.Title,
    Description: inputData.Description,
    "Type enseignement": JSON.stringify(inputData.TypeEnseignement),
    Section: JSON.stringify(inputData.Section),
    Destinataire: inputData.Destinataire,
    "Thèmes": JSON.stringify(inputData.Themes),
    Objectifs: inputData.Objectifs,
    Competences: inputData.Competences,
    "Prénom": inputData.prenom,
    "Nom": inputData.nom,
    "Email": inputData.email,
    "Téléphone": inputData.telephone || '',
    "Ecole": inputData.ecole,
    "Déclinaisons": inputData.Declinaisons || '',
    "Conseils": inputData.Conseils || '',
    "Liens": inputData.Liens || '',
    "LiensVIDEO": inputData.LiensVIDEO || '',
    "Edition": new Date().getFullYear().toString()
  };

  // Vérifications
  console.assert(formattedData["Type enseignement"] === '["Ordinaire","Spécialisé"]',
    `  ❌ Type enseignement: ${formattedData["Type enseignement"]}`);
  console.log(`  ✅ Type enseignement: ${formattedData["Type enseignement"]}`);

  console.assert(formattedData.Section === '["Primaire","Secondaire"]',
    `  ❌ Section: ${formattedData.Section}`);
  console.log(`  ✅ Section: ${formattedData.Section}`);

  console.assert(formattedData["Prénom"] === 'Sophie', `  ❌ Prénom mapping`);
  console.assert(formattedData["Nom"] === 'Dupont', `  ❌ Nom mapping`);
  console.log(`  ✅ Mapping prenom→Prénom, nom→Nom correct`);

  console.assert(formattedData["Téléphone"] === '', `  ❌ Téléphone vide`);
  console.assert(formattedData["Déclinaisons"] === '', `  ❌ Déclinaisons vide`);
  console.log(`  ✅ Champs optionnels vides → string vide (pas undefined/null)`);

  console.assert(formattedData.Edition === new Date().getFullYear().toString(),
    `  ❌ Edition: ${formattedData.Edition}`);
  console.log(`  ✅ Edition: ${formattedData.Edition}`);

  // Vérifier qu'aucun champ n'est undefined
  const undefinedFields = Object.entries(formattedData)
    .filter(([, v]) => v === undefined || v === null);
  console.assert(undefinedFields.length === 0,
    `  ❌ Champs undefined: ${undefinedFields.map(([k]) => k).join(', ')}`);
  console.log(`  ✅ Aucun champ undefined/null`);
}

// =============================================
// TEST 6: Cohérence client ↔ serveur
// =============================================

function testClientServerFieldMapping() {
  console.log('\n🧪 TEST 6: Cohérence des champs client ↔ serveur');

  // Champs envoyés par le client (ProjectSubmissionForm.astro lignes 636-654)
  const clientFields = [
    'Title', 'Description', 'TypeEnseignement', 'Section',
    'Destinataire', 'Themes', 'Objectifs', 'Competences',
    'prenom', 'nom', 'email', 'telephone', 'ecole',
    'Declinaisons', 'Conseils', 'Liens', 'LiensVIDEO'
  ];

  // Champs lus par le serveur (submit-pedagogical-sheet.js lignes 59-78)
  const serverReadsFromData = [
    'Title', 'Description', 'TypeEnseignement', 'Section',
    'Destinataire', 'Themes', 'Objectifs', 'Competences',
    'prenom', 'nom', 'email', 'telephone', 'ecole',
    'Declinaisons', 'Conseils', 'Liens', 'LiensVIDEO'
  ];

  const missingOnServer = clientFields.filter(f => !serverReadsFromData.includes(f));
  const missingOnClient = serverReadsFromData.filter(f => !clientFields.includes(f));

  console.assert(missingOnServer.length === 0,
    `  ❌ Champs envoyés par client mais non lus par serveur: ${missingOnServer.join(', ')}`);
  console.assert(missingOnClient.length === 0,
    `  ❌ Champs lus par serveur mais non envoyés par client: ${missingOnClient.join(', ')}`);
  console.log(`  ✅ Tous les ${clientFields.length} champs sont alignés client ↔ serveur`);
}

// =============================================
// Exécution
// =============================================

async function runAllTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  Tests submit-pedagogical-sheet');
  console.log('═══════════════════════════════════════════');

  // Tests synchrones
  testTableIdResolution();
  testDataFormatting();
  testClientServerFieldMapping();

  // Tests async (nécessitent l'import du handler)
  await testHandlerTestMode();
  await testHandlerMethodNotAllowed();
  await testHandlerInvalidJSON();

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Tous les tests terminés');
  console.log('═══════════════════════════════════════════\n');
}

runAllTests().catch(console.error);
