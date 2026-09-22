#!/usr/bin/env node
/**
 * @file Script qui détecte si des PDFs doivent être convertis
 *
 * Ce script vérifie les données NocoDB pour détecter la présence de fichiers PDF
 * avant d'installer Poppler, optimisant ainsi le temps de build Netlify.
 */

import dotenv from 'dotenv';
import { Api } from 'nocodb-sdk';

// Charger les variables d'environnement
dotenv.config();

// Configuration NocoDB (identique à build-festival-data.js)
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://app.nocodb.com';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN || '';

const NOCODB_CONFIG = {
  projectId: 'pocv8knemg3rcok',
  tables: {
    stands: 'mbwhou86e9tzqql',
    ateliers: 'maiiy35ahod5nnu',
    conferences: 'mdf8viczcxywoug',
  },
};

/**
 * Vérifie si une URL pointe vers un PDF
 */
function isPdfUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.toLowerCase().includes('.pdf') || url.includes('application/pdf');
}

/**
 * Scan une réponse NocoDB pour détecter des PDFs
 */
function scanForPdfs(items, itemType) {
  let pdfCount = 0;
  const pdfItems = [];

  for (const item of items) {
    // Vérifier le champ logo principal
    const logo = item['Envoyez votre logo'];
    if (logo && Array.isArray(logo)) {
      for (const file of logo) {
        if (file.signedUrl && isPdfUrl(file.signedUrl)) {
          pdfCount++;
          pdfItems.push({
            type: itemType,
            id: item.ID,
            title: item['Choisissez un titre court'] || `${itemType} ${item.ID}`,
            url: file.signedUrl,
          });
        }
      }
    }

    // Pour les ateliers et conférences, vérifier aussi les photos de conférenciers
    if (itemType !== 'stands') {
      const speakerPhoto = item['Envoyez une photo de vous'];
      if (speakerPhoto && Array.isArray(speakerPhoto)) {
        for (const file of speakerPhoto) {
          if (file.signedUrl && isPdfUrl(file.signedUrl)) {
            pdfCount++;
            pdfItems.push({
              type: `${itemType}-speaker`,
              id: item.ID,
              title: item['Choisissez un titre court'] || `${itemType} ${item.ID}`,
              url: file.signedUrl,
            });
          }
        }
      }
    }
  }

  return { pdfCount, pdfItems };
}

/**
 * Récupère et analyse les données NocoDB
 */
async function checkPdfNeeds() {
  try {
    console.log("🔍 Vérification de la nécessité d'installer Poppler...");

    if (!NOCODB_API_TOKEN) {
      console.log('⚠️ Token NocoDB manquant, installation de Poppler par sécurité');
      process.exit(1); // Code 1 = installer Poppler
    }

    const api = new Api({
      baseURL: NOCODB_BASE_URL,
      headers: {
        'xc-token': NOCODB_API_TOKEN,
      },
    });

    const tables = [
      { name: 'stands', id: NOCODB_CONFIG.tables.stands },
      { name: 'ateliers', id: NOCODB_CONFIG.tables.ateliers },
      { name: 'conferences', id: NOCODB_CONFIG.tables.conferences },
    ];

    let totalPdfs = 0;
    const allPdfItems = [];

    for (const table of tables) {
      try {
        console.log(`📊 Analyse de la table ${table.name}...`);

        const response = await api.dbTableRow.list('noco', NOCODB_CONFIG.projectId, table.id, {
          limit: 100,
          offset: 0,
        });

        const items = response.list || [];
        const { pdfCount, pdfItems } = scanForPdfs(items, table.name);

        totalPdfs += pdfCount;
        allPdfItems.push(...pdfItems);

        if (pdfCount > 0) {
          console.log(`📄 ${pdfCount} PDF(s) détecté(s) dans ${table.name}`);
        }
      } catch (error) {
        console.warn(`⚠️ Erreur lors de l'analyse de ${table.name}:`, error.message);
        // En cas d'erreur, on installe par sécurité
        process.exit(1);
      }
    }

    if (totalPdfs > 0) {
      console.log(`\n✅ ${totalPdfs} PDF(s) détecté(s) au total. Installation de Poppler nécessaire.`);
      console.log('📋 PDFs détectés:');
      allPdfItems.forEach((item) => {
        console.log(`   - ${item.type}: ${item.title}`);
      });
      process.exit(1); // Code 1 = installer Poppler
    } else {
      console.log('\n🚀 Aucun PDF détecté. Poppler non nécessaire, accélération du build !');
      process.exit(0); // Code 0 = ne pas installer Poppler
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.log('⚠️ Installation de Poppler par sécurité');
    process.exit(1); // En cas d'erreur, installer par sécurité
  }
}

checkPdfNeeds();
