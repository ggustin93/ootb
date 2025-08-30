#!/usr/bin/env node
/**
 * @file Image Processing Failure Analysis Script
 * 
 * Analyzes NocoDB data to identify why certain images cannot be processed by Sharp.
 * Automatically detects failed images (placeholder size = 346 bytes) and diagnoses
 * the root causes such as expired URLs, unsupported formats, or network issues.
 * 
 * Usage: node scripts/analyze-image-failures.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Api } from 'nocodb-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Charger les variables d'environnement
dotenv.config();

// Configuration NocoDB
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || "https://app.nocodb.com";
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN || "";

const NOCODB_CONFIG = {
  projectId: "pocv8knemg3rcok",
  tables: {
    stands: "mbwhou86e9tzqql",
    ateliers: "maiiy35ahod5nnu", 
    conferences: "mdf8viczcxywoug"
  }
};

// Function to detect failed images automatically
async function detectFailedImages() {
  const failedImages = [];
  const publicDir = path.resolve(ROOT_DIR, 'public', 'images', 'events');
  
  // Find all 346-byte images (placeholders)
  const types = ['stands', 'ateliers', 'conferences'];
  
  for (const type of types) {
    const typeDir = path.join(publicDir, type);
    if (!fs.existsSync(typeDir)) continue;
    
    const files = fs.readdirSync(typeDir);
    for (const file of files) {
      const filePath = path.join(typeDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.size === 346) { // Placeholder size
        const id = file.replace(`${type.slice(0, -1)}-`, '').replace('.webp', '');
        failedImages.push({ type, id });
      }
    }
  }
  
  return failedImages;
}

/**
 * Analyse une image pour détecter les problèmes potentiels
 */
async function analyzeImageUrl(url, eventId, eventType) {
  try {
    console.log(`\n🔍 Analyse de ${eventType}-${eventId}:`);
    console.log(`   URL: ${url}`);
    
    // Vérifier l'URL
    if (!url) {
      console.log(`   ❌ URL manquante`);
      return { issue: 'missing_url', url };
    }
    
    // Analyser l'extension
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath).toLowerCase();
    console.log(`   Extension détectée: ${extension || 'aucune'}`);
    
    // Tenter de récupérer les headers
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type') || 'unknown';
      const contentLength = response.headers.get('content-length') || 'unknown';
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Content-Length: ${contentLength} bytes`);
      
      // Détecter les problèmes potentiels
      if (!response.ok) {
        return { issue: 'http_error', status: response.status, url };
      }
      
      if (contentType.includes('text/html')) {
        return { issue: 'html_instead_of_image', contentType, url };
      }
      
      if (contentType.includes('application/') && !contentType.includes('pdf')) {
        return { issue: 'unsupported_mime_type', contentType, url };
      }
      
      if (contentLength === '0') {
        return { issue: 'empty_file', url };
      }
      
      return { issue: 'none', contentType, contentLength, url };
      
    } catch (fetchError) {
      console.log(`   ❌ Erreur réseau: ${fetchError.message}`);
      return { issue: 'network_error', error: fetchError.message, url };
    }
    
  } catch (error) {
    console.log(`   ❌ Erreur d'analyse: ${error.message}`);
    return { issue: 'analysis_error', error: error.message, url };
  }
}

/**
 * Récupère les données d'un élément spécifique
 */
async function getItemData(api, tableId, itemId) {
  try {
    const response = await api.dbTableRow.list(
      "noco",
      NOCODB_CONFIG.projectId,
      tableId,
      { 
        limit: 100, 
        offset: 0,
        where: `(ID,eq,${itemId})`
      }
    );
    
    return response.list[0] || null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'item ${itemId}:`, error.message);
    return null;
  }
}

/**
 * Main analysis function
 */
async function analyzeFailures() {
  try {
    console.log('🔍 Analyzing image processing failures...\n');
    
    if (!NOCODB_API_TOKEN) {
      console.log('❌ NocoDB token missing');
      process.exit(1);
    }

    const api = new Api({
      baseURL: NOCODB_BASE_URL,
      headers: {
        "xc-token": NOCODB_API_TOKEN
      }
    });

    // Automatically detect failed images
    console.log('🔍 Auto-detecting failed images...');
    const failedIds = await detectFailedImages();
    
    if (failedIds.length === 0) {
      console.log('✅ No failed images detected! All images processed successfully.');
      return;
    }
    
    console.log(`Found ${failedIds.length} failed images to analyze.\n`);

    const results = [];

    for (const failed of failedIds) {
      const tableId = NOCODB_CONFIG.tables[failed.type];
      const item = await getItemData(api, tableId, failed.id);
      
      if (!item) {
        console.log(`❌ Item ${failed.type}-${failed.id} non trouvé`);
        continue;
      }
      
      // Extraire les URLs d'images selon le type
      let logoUrl = null;
      let speakerImageUrl = null;
      
      if (item["Envoyez votre logo"] && Array.isArray(item["Envoyez votre logo"])) {
        logoUrl = item["Envoyez votre logo"][0]?.signedUrl;
      }
      
      if (failed.type !== 'stands' && item["Envoyez une photo de vous"] && Array.isArray(item["Envoyez une photo de vous"])) {
        speakerImageUrl = item["Envoyez une photo de vous"][0]?.signedUrl;
      }
      
      console.log(`\n📋 ${failed.type.toUpperCase()}-${failed.id}: "${item["Choisissez un titre court"] || 'Sans titre'}"`);
      
      // Analyser le logo
      if (logoUrl) {
        const logoAnalysis = await analyzeImageUrl(logoUrl, failed.id, failed.type);
        results.push({
          id: `${failed.type}-${failed.id}`,
          type: 'logo',
          analysis: logoAnalysis
        });
      } else {
        console.log(`   ⚠️ Pas de logo défini`);
      }
      
      // Analyser la photo du conférencier si applicable
      if (speakerImageUrl) {
        const speakerAnalysis = await analyzeImageUrl(speakerImageUrl, failed.id, failed.type);
        results.push({
          id: `${failed.type}-${failed.id}`,
          type: 'speaker',
          analysis: speakerAnalysis
        });
      }
    }
    
    // Résumé des problèmes
    console.log('\n\n📊 RÉSUMÉ DES PROBLÈMES:\n');
    
    const issueStats = {};
    results.forEach(result => {
      const issue = result.analysis.issue;
      issueStats[issue] = (issueStats[issue] || 0) + 1;
    });
    
    Object.entries(issueStats).forEach(([issue, count]) => {
      console.log(`   ${issue}: ${count} cas`);
    });
    
    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:\n');
    
    if (issueStats.html_instead_of_image) {
      console.log('🔧 HTML détecté au lieu d\'image:');
      console.log('   → Certaines URLs pointent vers des pages web au lieu d\'images');
      console.log('   → Vérifier les données NocoDB pour ces entrées');
    }
    
    if (issueStats.unsupported_mime_type) {
      console.log('🔧 Type MIME non supporté:');
      console.log('   → Formats non reconnus par Sharp');
      console.log('   → Considérer l\'ajout de conversions supplémentaires');
    }
    
    if (issueStats.network_error || issueStats.http_error) {
      console.log('🔧 Erreurs réseau/HTTP:');
      console.log('   → URLs invalides ou fichiers supprimés');
      console.log('   → Nettoyer les données NocoDB');
    }
    
    if (issueStats.empty_file) {
      console.log('🔧 Fichiers vides:');
      console.log('   → Upload incomplet ou fichier corrompu');
      console.log('   → Re-uploader les fichiers concernés');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
    process.exit(1);
  }
}

analyzeFailures();
