/**
 * SCRIPT DE TEST UNIQUEMENT
 * 
 * Ce script est utilisé pour tester la connexion à l'API NocoDB et la soumission de fiches pédagogiques.
 * Il n'est PAS utilisé dans l'application principale.
 * 
 * La méthode officielle de soumission utilise l'API endpoint Astro (/api/submit-pedagogical-sheet.ts)
 * qui offre une meilleure sécurité et une architecture client-serveur plus robuste.
 * 
 * Voir la documentation dans ./docs/forms/ pour plus d'informations.
 */

import { Api } from 'nocodb-sdk';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de NocoDB
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;

// IDs NocoDB pour la table des fiches pédagogiques (depuis build-fiches-pedagogiques.js)
const NOCODB_ORG_ID = process.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = process.env.NOCODB_PROJECT_ID || 'pzafxqd4lr77r0v';
const NOCODB_TABLE_ID = process.env.NOCODB_BASE_ID || 'mur92i1x276ldbg';

// Données de test
const testData = {
  Title: "Test - Apprentissage des mathématiques par le jeu",
  Description: "Une approche ludique pour enseigner les mathématiques aux élèves de primaire.",
  "Type enseignement": JSON.stringify(["Ordinaire", "Technique"]),
  Section: JSON.stringify(["Primaire", "Secondaire"]),
  Destinataire: "Professeurs de mathématiques du primaire et du secondaire inférieur",
  "Thèmes": JSON.stringify(["La ludopédagogie en classe & à la maison", "Les mathématiques au quotidien"]),
  Objectifs: "- Développer la logique mathématique\n- Renforcer le calcul mental\n- Favoriser l'apprentissage par le jeu\n- Créer des liens entre mathématiques et vie quotidienne",
  Competences: "- Résolution de problèmes\n- Calcul mental\n- Travail collaboratif\n- Créativité et innovation pédagogique",
  "Prénom": "Test",
  "Nom": "Utilisateur",
  "Email": "test@example.com",
  "Téléphone": "+32 123 45 67 89",
  "Ecole": "École Test",
  "Edition": "2025",
  "Liens": "https://example.com/ressources",
  "LiensVIDEO": "https://youtube.com/watch?v=example",
  "Conseils": "- Préparer le matériel à l'avance\n- Adapter les jeux au niveau des élèves\n- Prévoir des variantes pour différents niveaux\n- Encourager la collaboration entre élèves",
  "Déclinaisons": "Cette activité peut être adaptée pour :\n- Les élèves de maternelle en simplifiant les règles et en utilisant du matériel plus concret\n- Les élèves du secondaire en ajoutant des concepts mathématiques plus avancés\n- Les élèves en difficulté en proposant un accompagnement personnalisé\n- Les groupes multiniveaux en organisant des équipes mixtes",
  "Page Projet": "/les-enseignants-ont-du-talent/apprentissage-mathematiques-jeu"
};

/**
 * Initialise l'API NocoDB
 */
function initNocoDBApi() {
  console.log('Initialisation de l\'API NocoDB avec le token:', NOCODB_API_TOKEN ? 'Token présent' : 'Token manquant');
  
  return new Api({
    baseURL: NOCODB_BASE_URL,
    headers: {
      "xc-token": NOCODB_API_TOKEN
    }
  });
}

/**
 * Test de soumission d'une fiche pédagogique
 */
async function testSubmission() {
  console.log('🚀 Début du test de soumission...');
  
  try {
    const api = initNocoDBApi();
    
    console.log('📝 Configuration:', {
      baseURL: NOCODB_BASE_URL,
      orgId: NOCODB_ORG_ID,
      projectId: NOCODB_PROJECT_ID,
      baseId: NOCODB_TABLE_ID,
      tableId: NOCODB_TABLE_ID,
      apiToken: NOCODB_API_TOKEN ? '****' : 'Non défini'
    });
    
    // Créer un nouvel enregistrement dans la table
    const response = await api.dbTableRow.create(
      NOCODB_ORG_ID,
      NOCODB_PROJECT_ID,
      NOCODB_TABLE_ID,
      testData
    );
    
    console.log('✅ Succès:', response);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error);
  }
}

/**
 * Récupère les fiches pédagogiques existantes
 */
async function getFiches() {
  console.log('📥 Récupération des fiches existantes...');
  
  try {
    const api = initNocoDBApi();
    
    const response = await api.dbTableRow.list(
      NOCODB_ORG_ID,
      NOCODB_PROJECT_ID,
      NOCODB_TABLE_ID,
      {
        limit: 100,
        offset: 0
      }
    );
    
    console.log(`✅ Nombre de fiches trouvées: ${response.list.length}`);
    console.log('📊 Analyse des champs:');
    
    // Analyser quelques fiches pour comprendre la structure
    const sampleFiches = response.list.slice(0, 3);
    sampleFiches.forEach((fiche, index) => {
      console.log(`\n📝 Fiche #${index + 1}:`);
      console.log('Type enseignement:', fiche['Type enseignement']);
      console.log('Section:', fiche.Section);
      console.log('Thèmes:', fiche.Thèmes);
      console.log('Edition:', fiche.Edition);
    });
    
    return response;
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error.response?.data || error);
  }
}

// Exécution des tests
async function runTests() {
  await getFiches();
  await testSubmission();
}

runTests(); 