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
 * @returns {Object} - { hasChanges, changedItems, removedItems, addedItems }
 */
function checkIfDataChanged(newData) {
  try {
    // Vérifier si le fichier de données existe
    if (!fs.existsSync(RAW_DATA_PATH)) {
      console.log(`📝 Aucun fichier de données précédent trouvé. Génération complète requise.`);
      return { 
        hasChanges: true, 
        changedItems: newData, 
        removedItems: [], 
        addedItems: newData 
      };
    }
    
    // Lire les anciennes données
    const oldDataRaw = fs.readFileSync(RAW_DATA_PATH, 'utf8');
    const oldData = JSON.parse(oldDataRaw);
    const oldItems = oldData.list || [];
    
    // Comparaison simple par nombre d'éléments
    if (oldItems.length !== newData.length) {
      console.log(`📊 Différence de nombre d'éléments détectée (${oldItems.length} vs ${newData.length}).`);
    }
    
    // Créer des maps pour faciliter la comparaison
    const oldItemsMap = new Map(oldItems.map(item => [item.Id, item]));
    const newItemsMap = new Map(newData.map(item => [item.Id, item]));
    
    // Identifier les éléments modifiés, supprimés et ajoutés
    const changedItems = [];
    const removedItems = [];
    const addedItems = [];
    
    // Vérifier les éléments modifiés et supprimés
    for (const oldItem of oldItems) {
      if (!oldItem.Id) continue;
      
      if (!newItemsMap.has(oldItem.Id)) {
        // Élément supprimé
        removedItems.push(oldItem);
      } else {
        // Vérifier si l'élément a été modifié
        const newItem = newItemsMap.get(oldItem.Id);
        if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          changedItems.push(newItem);
        }
      }
    }
    
    // Vérifier les éléments ajoutés
    for (const newItem of newData) {
      if (!newItem.Id) continue;
      
      if (!oldItemsMap.has(newItem.Id)) {
        addedItems.push(newItem);
      }
    }
    
    const hasChanges = changedItems.length > 0 || removedItems.length > 0 || addedItems.length > 0;
    
    if (hasChanges) {
      console.log(`🔄 Modifications détectées:`);
      console.log(`   - ${changedItems.length} fiches modifiées`);
      console.log(`   - ${addedItems.length} fiches ajoutées`);
      console.log(`   - ${removedItems.length} fiches supprimées`);
    } else {
      console.log(`✅ Aucune modification détectée dans les données. Génération non nécessaire.`);
    }
    
    return { hasChanges, changedItems, removedItems, addedItems };
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification des données:`, error);
    // En cas d'erreur, on génère tout par sécurité
    return { 
      hasChanges: true, 
      changedItems: newData, 
      removedItems: [], 
      addedItems: newData 
    };
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
 * Collecte les publishDates existantes de tous les fichiers MDX du répertoire des fiches.
 * Doit être appelée AVANT la suppression des fichiers pour conserver les dates.
 * @returns {Map<string, string>} - Map slug -> publishDate
 */
function collectExistingPublishDates() {
  const dateMap = new Map();
  try {
    if (!fs.existsSync(FICHES_DIR)) return dateMap;

    const files = fs.readdirSync(FICHES_DIR).filter(f => f.endsWith('.mdx'));
    for (const file of files) {
      const slug = file.replace('.mdx', '');
      const filePath = path.join(FICHES_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(/publishDate:\s*(.+)/);
      if (match) {
        const dateStr = match[1].trim().replace(/^["']|["']$/g, '');
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          dateMap.set(slug, dateStr);
        }
      }
    }
    console.log(`📅 ${dateMap.size} dates existantes collectées avant régénération.`);
  } catch (error) {
    console.error('❌ Erreur lors de la collecte des dates existantes:', error);
  }
  return dateMap;
}

/**
 * Convertit les fiches au format MDX
 */
function convertFichesToMDX(fiches, existingDates = new Map()) {
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

      // Déterminer la date de publication en fonction de l'édition
      // D'abord, vérifier si une date existante a été collectée avant suppression
      const existingDate = existingDates.get(slug);
      let publishDate;

      if (existingDate) {
        // Conserver la date existante pour ne pas perturber l'ordre de la homepage
        publishDate = existingDate;
        console.log(`📅 Fiche "${fiche.Title || 'sans titre'}" (édition ${edition}): date existante conservée: ${publishDate}`);
      } else if (parseInt(edition) >= 2025 || !fiche.Edition) {
        // Nouvelle fiche 2025+ : utiliser la date courante (première génération uniquement)
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        publishDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.001Z`;

        console.log(`📅 Fiche "${fiche.Title || 'sans titre'}" (édition ${edition}): nouvelle fiche, date courante utilisée: ${publishDate}`);
      } else {
        // Pour les éditions 2024 et antérieures, conserver le système de date aléatoire
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

        publishDate = `${publishYear}-${paddedMonth}-${paddedDay}T${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:${randomSecond.toString().padStart(2, '0')}.001Z`;

        console.log(`📅 Fiche "${fiche.Title || 'sans titre'}" (édition ${edition}): date aléatoire générée: ${publishDate}`);
      }
      
      // Construction des tags (incluant la section et le type d'enseignement)
      const tags = [];
      
      // Ajouter l'édition comme tag
      if (fiche.Edition) {
        tags.push(fiche.Edition);
      }
      
      // Ajouter les thèmes aux tags
      if (fiche.Thèmes) {
        try {
          // Vérifier si le thème est au format JSON
          const themes = JSON.parse(fiche.Thèmes);
          
          // Fonction pour vérifier si un thème doit être ignoré (format "thème X" où X est un chiffre)
          const shouldIgnoreTheme = (theme) => /^thème \d+$/i.test(theme);
          
          if (Array.isArray(themes)) {
            // Si c'est un tableau de thèmes, traiter chaque thème
            themes.forEach(theme => {
              if (!shouldIgnoreTheme(theme)) {
                console.log(`🏷️ Ajout du thème "${theme}" aux tags pour la fiche "${fiche.Title || 'sans titre'}"`);
                tags.push(theme.toLowerCase());
              } else {
                console.log(`⏭️ Ignoré le thème "${theme}" (format 'thème X') pour la fiche "${fiche.Title || 'sans titre'}"`);
              }
            });
          } else if (typeof themes === 'string') {
            // Si c'est une seule chaîne de caractères
            if (!shouldIgnoreTheme(themes)) {
              console.log(`🏷️ Ajout du thème "${themes}" aux tags pour la fiche "${fiche.Title || 'sans titre'}"`);
              tags.push(themes.toLowerCase());
            } else {
              console.log(`⏭️ Ignoré le thème "${themes}" (format 'thème X') pour la fiche "${fiche.Title || 'sans titre'}"`);
            }
          }
        } catch {
          // Si ce n'est pas un JSON valide, traiter comme une chaîne simple
          if (!/^thème \d+$/i.test(fiche.Thèmes)) {
            console.log(`🏷️ Ajout du thème "${fiche.Thèmes}" (format non-JSON) aux tags pour la fiche "${fiche.Title || 'sans titre'}"`);
            tags.push(fiche.Thèmes.toLowerCase());
          } else {
            console.log(`⏭️ Ignoré le thème "${fiche.Thèmes}" (format 'thème X') pour la fiche "${fiche.Title || 'sans titre'}"`);
          }
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
 * Nettoie uniquement les fiches spécifiées du répertoire
 * @param {Array} fichesToRemove - Liste des fiches à supprimer
 */
function cleanSpecificFiches(fichesToRemove) {
  try {
    if (!fs.existsSync(FICHES_DIR)) {
      fs.mkdirSync(FICHES_DIR, { recursive: true });
      console.log(`📁 Répertoire créé: ${FICHES_DIR}`);
      return;
    }
    
    if (fichesToRemove.length === 0) {
      console.log(`ℹ️ Aucune fiche à supprimer.`);
      return;
    }
    
    console.log(`🧹 Suppression de ${fichesToRemove.length} fiches spécifiques...`);
    
    // Créer un ensemble de slugs à supprimer pour une recherche plus rapide
    const slugsToRemove = new Set(fichesToRemove.map(fiche => {
      const baseSlug = slugify(fiche.Title || 'fiche-pedagogique', {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      
      const edition = fiche.Edition || EDITION_YEAR;
      return `${edition}-${baseSlug}-${fiche.Id}`;
    }));
    
    // Lire tous les fichiers MDX dans le répertoire
    const files = fs.readdirSync(FICHES_DIR)
      .filter(file => file.endsWith('.mdx') && file !== 'README.md');
    
    let removedCount = 0;
    
    // Supprimer les fichiers correspondant aux slugs à supprimer
    for (const file of files) {
      // Extraire le slug du nom de fichier (sans l'extension .mdx)
      const fileSlug = file.replace('.mdx', '');
      
      // Vérifier si ce fichier correspond à une fiche à supprimer
      for (const slugToRemove of slugsToRemove) {
        if (fileSlug.includes(slugToRemove) || fileSlug.includes(`-${slugToRemove.split('-').pop()}.mdx`)) {
          const filePath = path.join(FICHES_DIR, file);
          fs.unlinkSync(filePath);
          removedCount++;
          break;
        }
      }
    }
    
    console.log(`✅ ${removedCount} fiches supprimées.`);
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression des fiches spécifiques:`, error);
  }
}

/**
 * Sauvegarde les fiches MDX dans des fichiers
 */
async function saveFichesToFiles(fiches) {
  console.log(`💾 Sauvegarde de ${fiches.length} fiches pédagogiques...`);
  
  // Créer le répertoire s'il n'existe pas
  if (!fs.existsSync(FICHES_DIR)) {
    fs.mkdirSync(FICHES_DIR, { recursive: true });
  }
  
  for (const fiche of fiches) {
    try {
      const filePath = path.join(FICHES_DIR, `${fiche.slug}.mdx`);
      fs.writeFileSync(filePath, fiche.content, 'utf8');
      console.log(`✅ Fiche sauvegardée: ${filePath}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde de la fiche "${fiche.title}":`, error);
    }
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage de la génération des fiches pédagogiques...');
  
  try {
    // Récupérer les fiches depuis NocoDB
    const response = await fetchFichesPedagogiques();
    const fiches = response.list || [];
    
    // Vérifier si les données ont changé
    const { hasChanges, changedItems, removedItems, addedItems } = checkIfDataChanged(fiches);
    
    // Sauvegarder les données brutes
    saveRawData(response, RAW_DATA_FILENAME);
    
    if (!hasChanges) {
      console.log('✅ Aucune modification détectée. Aucune action nécessaire.');
      return;
    }
    
    console.log('🔄 Des modifications ont été détectées, mise à jour des fiches en cours...');

    // Collecter les dates existantes AVANT de supprimer les fichiers
    const existingDates = collectExistingPublishDates();

    // Supprimer uniquement les fiches qui ont été modifiées ou supprimées
    const fichesToRemove = [...changedItems, ...removedItems];
    cleanSpecificFiches(fichesToRemove);

    // Convertir uniquement les fiches modifiées ou ajoutées, en préservant les dates existantes
    const fichesToGenerate = [...changedItems, ...addedItems];
    const mdxFiches = convertFichesToMDX(fichesToGenerate, existingDates);
    
    // Sauvegarder les fiches
    await saveFichesToFiles(mdxFiches);
    
    console.log('✨ Génération des fiches pédagogiques terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la génération des fiches pédagogiques:', error);
  }
}

// Exécution du script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 