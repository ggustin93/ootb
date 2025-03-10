// Script de génération des fiches pédagogiques depuis NocoDB
// Ce script est exécuté uniquement au moment du build

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Api } from 'nocodb-sdk';
import slugify from 'slugify';

// Charger les variables d'environnement
dotenv.config();

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Déterminer si nous sommes en mode production
const IS_NETLIFY = process.env.NETLIFY === 'true';
const FORCE_PRODUCTION = process.env.FORCE_PRODUCTION === 'true';
const NODE_ENV_PRODUCTION = process.env.NODE_ENV === 'production';

// Si nous sommes sur Netlify ou si le mode production est forcé ou si NODE_ENV est production
const IS_PRODUCTION = IS_NETLIFY || FORCE_PRODUCTION || NODE_ENV_PRODUCTION;

console.log(`🔧 Environnement de build des fiches pédagogiques:`);
console.log(`   - Netlify: ${IS_NETLIFY ? 'Oui' : 'Non'}`);
console.log(`   - Force Production: ${FORCE_PRODUCTION ? 'Oui' : 'Non'}`);
console.log(`   - NODE_ENV Production: ${NODE_ENV_PRODUCTION ? 'Oui' : 'Non'}`);
console.log(`   - Mode Production: ${IS_PRODUCTION ? 'Oui' : 'Non'}`);

// Configuration de NocoDB
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;

// IDs NocoDB pour la table des fiches pédagogiques (à remplacer par vos valeurs réelles)
const NOCODB_ORG_ID = process.env.NOCODB_ORG_ID || 'noco';
const NOCODB_PROJECT_ID = process.env.NOCODB_PROJECT_ID || 'pzafxqd4lr77r0v';
const NOCODB_BASE_ID = process.env.NOCODB_BASE_ID || 'mur92i1x276ldbg';
const NOCODB_TABLE_ID = process.env.NOCODB_TABLE_ID || 'vwp6ybxaurqxfimt';

// Chemin de destination pour les fichiers MDX
const FICHES_DIR = path.join(ROOT_DIR, 'src', 'content', 'post', '5_FICHES');

// Répertoire pour sauvegarder les données brutes
const RAW_DATA_DIR = path.join(ROOT_DIR, 'data', 'raw');

// Fichier où seront stockées les données brutes
const RAW_DATA_FILENAME = 'fiches_pedagogiques_raw.json';
const RAW_DATA_PATH = path.join(RAW_DATA_DIR, RAW_DATA_FILENAME);

// Année d'édition (à modifier chaque année)
const EDITION_YEAR = '2024';

/**
 * Nettoie le répertoire des fiches pédagogiques
 */
function cleanFichesDirectory() {
  try {
    if (fs.existsSync(FICHES_DIR)) {
      // Lire tous les fichiers MDX dans le répertoire (sauf README.md)
      const files = fs.readdirSync(FICHES_DIR)
        .filter(file => file.endsWith('.mdx') && file !== 'README.md');
      
      console.log(`🧹 Nettoyage du répertoire des fiches: ${files.length} fichiers à supprimer...`);
      
      // Supprimer chaque fichier
      files.forEach(file => {
        const filePath = path.join(FICHES_DIR, file);
        fs.unlinkSync(filePath);
      });
      
      console.log(`✅ Répertoire nettoyé avec succès.`);
    } else {
      // Si le répertoire n'existe pas, le créer
      fs.mkdirSync(FICHES_DIR, { recursive: true });
      console.log(`📁 Répertoire créé: ${FICHES_DIR}`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage du répertoire:`, error);
  }
}

/**
 * Sauvegarde les données brutes dans un fichier JSON
 */
function saveRawData(data, filename) {
  try {
    // Création du répertoire s'il n'existe pas
    if (!fs.existsSync(RAW_DATA_DIR)) {
      fs.mkdirSync(RAW_DATA_DIR, { recursive: true });
      console.log(`📁 Répertoire créé: ${RAW_DATA_DIR}`);
    }
    
    const filePath = path.join(RAW_DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Données brutes sauvegardées dans ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la sauvegarde des données brutes:`, error);
  }
}

/**
 * Vérifie si les données ont changé par rapport aux données précédemment sauvegardées
 * @param {Array} newData - Les nouvelles données récupérées de l'API
 * @returns {boolean} - True si les données ont changé, false sinon
 */
function checkIfDataChanged(newData) {
  try {
    // Vérifier si le fichier de données existe
    if (!fs.existsSync(RAW_DATA_PATH)) {
      console.log(`📝 Aucun fichier de données précédent trouvé. Génération requise.`);
      return true;
    }
    
    // Lire les anciennes données
    const oldDataRaw = fs.readFileSync(RAW_DATA_PATH, 'utf8');
    const oldData = JSON.parse(oldDataRaw);
    
    // Comparaison simple par nombre d'éléments
    if (!oldData.list || oldData.list.length !== newData.length) {
      console.log(`📊 Différence de nombre d'éléments détectée (${oldData.list ? oldData.list.length : 0} vs ${newData.length}). Génération requise.`);
      return true;
    }
    
    // Vérifier si les identifiants et dates de mise à jour sont identiques
    const newDataMap = new Map(newData.map(item => [item.Id, JSON.stringify(item)]));
    let hasChanges = false;
    
    for (const oldItem of oldData.list) {
      if (!oldItem.Id) continue;
      
      // Si l'élément n'existe plus ou a été modifié
      if (!newDataMap.has(oldItem.Id) || newDataMap.get(oldItem.Id) !== JSON.stringify(oldItem)) {
        hasChanges = true;
        break;
      }
    }
    
    if (hasChanges) {
      console.log(`🔄 Modifications détectées dans les données. Génération requise.`);
    } else {
      console.log(`✅ Aucune modification détectée dans les données. Génération non nécessaire.`);
    }
    
    return hasChanges;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification des données:`, error);
    // En cas d'erreur, on génère par sécurité
    return true;
  }
}

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
 * Récupère les fiches pédagogiques depuis NocoDB
 */
async function fetchFichesPedagogiques() {
  try {
    console.log('📥 Récupération des fiches pédagogiques depuis NocoDB...');
    
    const api = initNocoDBApi();
    
    const response = await api.dbViewRow.list(
      NOCODB_ORG_ID,
      NOCODB_PROJECT_ID,
      NOCODB_BASE_ID,
      NOCODB_TABLE_ID, {
      "offset": 0,
      "limit": 100, // Augmenter si nécessaire
      "where": ""
    });
    
    console.log(`✅ ${response.list.length} fiches pédagogiques récupérées.`);
    
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des fiches pédagogiques:', error);
    return { list: [] };
  }
}

/**
 * Convertit les fiches au format MDX
 */
function convertFichesToMDX(fiches) {
  console.log('🔄 Conversion des fiches au format MDX...');
  
  return fiches.map((fiche, index) => {
    try {
      // Création du slug à partir du titre avec un ID unique pour éviter les collisions
      const baseSlug = slugify(fiche.Title || 'fiche-pedagogique', {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      
      // Récupérer l'édition depuis les données ou utiliser l'année par défaut
      const edition = fiche.Edition || EDITION_YEAR;
      
      // Ajouter l'édition et l'ID pour garantir l'unicité
      const slug = fiche.Id ? 
        `${edition}-${baseSlug}-${fiche.Id}` : 
        `${edition}-${baseSlug}-${index + 1}`;
      
      // Construction de la date de publication en fonction de l'année d'édition avec date aléatoire
      const publishYear = parseInt(edition) || new Date().getFullYear();
      
      // Génération d'une date aléatoire dans l'année d'édition
      const randomMonth = Math.floor(Math.random() * 12) + 1; // Mois entre 1 et 12
      const maxDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][randomMonth - 1]; // Jours par mois
      const randomDay = Math.floor(Math.random() * maxDay) + 1; // Jour entre 1 et max pour le mois
      
      // Format de la date avec padding pour mois et jours à 2 chiffres
      const paddedMonth = randomMonth.toString().padStart(2, '0');
      const paddedDay = randomDay.toString().padStart(2, '0');
      
      // Construction de la date ISO avec heure aléatoire 
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      const randomSecond = Math.floor(Math.random() * 60);
      
      const publishDate = `${publishYear}-${paddedMonth}-${paddedDay}T${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:${randomSecond.toString().padStart(2, '0')}.001Z`;
      
      // Construction des tags (incluant la section et le type d'enseignement)
      const tags = [];
      
      // Ajouter l'édition comme tag
      if (fiche.Edition) {
        tags.push(fiche.Edition);
      }
      
      // Ajouter les thèmes aux tags
      if (fiche.Thèmes) {
        try {
          const themes = JSON.parse(fiche.Thèmes);
          if (Array.isArray(themes)) {
            themes.forEach(theme => {
              // Ignorer les thèmes au format "thème X" où X est un chiffre
              if (!(/^thème \d+$/i.test(theme))) {
                tags.push(theme.toLowerCase());
              }
            });
          } else {
            // Ignorer les thèmes au format "thème X" où X est un chiffre
            if (!(/^thème \d+$/i.test(themes))) {
              tags.push(themes.toLowerCase());
            }
          }
        } catch {
          // Si ce n'est pas un JSON valide, l'ajouter tel quel si ce n'est pas "thème X"
          if (!(/^thème \d+$/i.test(fiche.Thèmes))) {
            tags.push(fiche.Thèmes.toLowerCase());
          }
        }
      }
      
      // Traiter "Type enseignement" qui peut être au format JSON string
      if (fiche["Type enseignement"]) {
        try {
          const typeEnseignement = JSON.parse(fiche["Type enseignement"]);
          if (Array.isArray(typeEnseignement)) {
            typeEnseignement.forEach(type => tags.push(type.toLowerCase()));
          } else {
            tags.push(typeEnseignement.toLowerCase());
          }
        } catch {
          // Si ce n'est pas un JSON valide, l'ajouter tel quel
          tags.push(fiche["Type enseignement"].toLowerCase());
        }
      }
      
      // Traiter "Section" qui peut être au format JSON string
      if (fiche.Section) {
        try {
          const section = JSON.parse(fiche.Section);
          if (Array.isArray(section)) {
            section.forEach(s => tags.push(s.toLowerCase()));
          } else {
            tags.push(section.toLowerCase());
          }
        } catch {
          // Si ce n'est pas un JSON valide, l'ajouter tel quel
          tags.push(fiche.Section.toLowerCase());
        }
      }
      
      // Construire les objectifs sous forme de tableau
      const objectifs = fiche.Objectifs 
        ? fiche.Objectifs.split('\n').filter(item => item.trim() !== '')
        : [];
      
      // Construire les compétences sous forme de tableau
      const competences = fiche.Competences 
        ? fiche.Competences.split('\n').filter(item => item.trim() !== '')
        : [];
      
      // Construire les références sous forme de tableau d'objets
      const references = [];
      
      // Ajouter les liens textuels
      if (fiche.Liens) {
        const liens = fiche.Liens.split('\n').filter(item => item.trim() !== '');
        liens.forEach(lien => {
          // Extraire les URLs si présentes
          const urlMatch = lien.match(/(https?:\/\/[^\s]+)/g);
          if (urlMatch) {
            references.push({
              type: 'site',
              description: lien.trim(),
              url: urlMatch[0]
            });
          } else {
            references.push({
              type: 'document',
              description: lien.trim()
            });
          }
        });
      }
      
      // Ajouter les liens vidéo
      if (fiche.LiensVIDEO) {
        references.push({
          type: 'video',
          description: 'Vidéo de présentation',
          url: fiche.LiensVIDEO.trim()
        });
      }
      
      // Déterminer le type d'enseignement à partir du champ "Type enseignement"
      let typeEnseignement = 'Ordinaire';
      if (fiche["Type enseignement"]) {
        try {
          const typeArray = JSON.parse(fiche["Type enseignement"]);
          typeEnseignement = Array.isArray(typeArray) ? typeArray[0] : typeArray;
        } catch {
          typeEnseignement = fiche["Type enseignement"];
        }
      }
      
      // Déterminer la section à partir du champ "Section"
      let section = 'Primaire';
      if (fiche.Section) {
        try {
          const sectionArray = JSON.parse(fiche.Section);
          section = Array.isArray(sectionArray) ? sectionArray[0] : sectionArray;
        } catch {
          section = fiche.Section;
        }
      }
      
      // Construction du contenu MDX
      const frontmatter = {
        published: true,
        title: fiche.Title || 'Fiche pédagogique',
        description: fiche.Description ? fiche.Description.substring(0, 160) : '',
        publishDate: publishDate,
        category: 'fiche',
        image: null,
        tags,
        pedagogicalSheet: {
          enseignement: typeEnseignement,
          section: section,
          responsable: {
            prenom: fiche.Prénom || '',
            nom: fiche.Nom || '',
            email: fiche.Email || ''
          },
          description: fiche.Description || '',
          destinataire: fiche.Destinataire || '',
          objectifs,
          competences,
          references,
          declinaisons: fiche.Déclinaisons || '',
          conseils: fiche.Conseils || ''
        }
      };
      
      // Construction du contenu complet
      const mdxContent = `---
${Object.entries(frontmatter).map(([key, value]) => {
  if (typeof value === 'object') {
    return `${key}: ${JSON.stringify(value, null, 2)}`;
  } else if (key === 'published') {
    // Gérer spécifiquement le booléen published
    return `${key}: ${value}`;
  } else if (key === 'publishDate') {
    // Gérer spécifiquement la date
    return `${key}: ${value}`;
  } else if (typeof value === 'string' && (value.includes('\n') || value.includes(':'))) {
    // Pour les chaînes multilignes ou contenant des caractères spéciaux, utiliser le format bloc
    return `${key}: >-\n  ${value.replace(/\n/g, '\n  ')}`;
  } else {
    // Pour les chaînes simples, les mettre entre guillemets pour éviter les problèmes
    return `${key}: "${value.toString().replace(/"/g, '\\"')}"`;
  }
}).join('\n')}
---

`;
      
      return {
        slug,
        content: mdxContent
      };
    } catch (error) {
      console.error(`❌ Erreur lors de la conversion de la fiche "${fiche.Title || 'sans titre'}":`, error);
      return null;
    }
  }).filter(Boolean); // Filtrer les fiches nulles en cas d'erreur
}

/**
 * Sauvegarde les fiches en fichiers MDX
 */
async function saveFichesToFiles(fiches) {
  console.log(`💾 Sauvegarde de ${fiches.length} fiches pédagogiques...`);
  
  // Création du répertoire des fiches s'il n'existe pas
  if (!fs.existsSync(FICHES_DIR)) {
    fs.mkdirSync(FICHES_DIR, { recursive: true });
    console.log(`📁 Répertoire créé: ${FICHES_DIR}`);
  }
  
  for (const fiche of fiches) {
    const filePath = path.join(FICHES_DIR, `${fiche.slug}.mdx`);
    
    try {
      fs.writeFileSync(filePath, fiche.content, 'utf8');
      console.log(`✅ Fiche sauvegardée: ${filePath}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde de la fiche ${fiche.slug}:`, error);
    }
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage de la génération des fiches pédagogiques...');
  
  try {
    // 1. Récupération des fiches depuis NocoDB
    const response = await fetchFichesPedagogiques();
    const fiches = response.list || [];
    
    if (fiches.length === 0) {
      console.log('⚠️ Aucune fiche pédagogique trouvée, fin du processus.');
      return;
    }
    
    // 2. Vérifier si les données ont changé
    const dataChanged = checkIfDataChanged(fiches);
    
    // Sauvegarder les nouvelles données brutes dans tous les cas pour comparaison future
    saveRawData(response, RAW_DATA_FILENAME);
    
    // N'exécuter les étapes suivantes que si les données ont changé
    if (dataChanged) {
      console.log('🔄 Des modifications ont été détectées, mise à jour des fiches en cours...');
      
      // 3. Nettoyer le répertoire des fiches
      cleanFichesDirectory();
      
      // 4. Conversion des fiches au format MDX
      const fichesConverties = convertFichesToMDX(fiches);
      
      // 5. Sauvegarde des fiches en fichiers MDX
      await saveFichesToFiles(fichesConverties);
      
      console.log('✨ Génération des fiches pédagogiques terminée avec succès!');
    } else {
      console.log('💤 Aucune modification détectée, aucune action nécessaire.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la génération des fiches pédagogiques:', error);
    process.exit(1);
  }
}

// Exécution du script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 