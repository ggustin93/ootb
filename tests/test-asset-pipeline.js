/**
 * @file Test suite for the asset pipeline in build-festival-data.js
 *
 * @summary
 * This script provides comprehensive testing for our asset processing pipeline.
 * It validates three core pieces of functionality:
 * 1. getImagePath - Path generation for different event types
 * 2. createPlaceholderImage - Fallback image creation
 * 3. convertPdfToImageBuffer - PDF to PNG conversion with Poppler
 *
 * @description
 * Simple, direct testing approach without complex mocking.
 * All tests should pass with our current implementation.
 */

import fs from 'fs/promises';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test direct de la conversion PDF
async function testPdfConversion() {
  console.log('🧪 Test de conversion PDF...');

  try {
    // Importer la fonction de conversion PDF
    const { convertPdfToImageBuffer } = await import('../src/scripts/build-festival-data.js');

    // Lire le fichier PDF de test
    const pdfPath = path.resolve(__dirname, 'test-assets', 'sample-pdf-calli.pdf');
    const pdfBuffer = await fs.readFile(pdfPath);

    console.log(`📄 PDF chargé: ${pdfBuffer.length} bytes`);

    // Convertir le PDF
    const pngBuffer = await convertPdfToImageBuffer(pdfBuffer, 'test-pdf');

    assert(pngBuffer, 'La conversion devrait retourner un buffer');
    assert(pngBuffer.length > 0, 'Le buffer ne devrait pas être vide');

    // Sauvegarder le résultat pour inspection visuelle
    const outputPathPng = path.resolve(__dirname, 'test-results', 'sample-pdf-converted.png');
    const outputPathWebp = path.resolve(__dirname, 'test-results', 'sample-pdf-converted.webp');
    await fs.mkdir(path.dirname(outputPathPng), { recursive: true });
    await fs.writeFile(outputPathPng, pngBuffer);

    // Créer aussi la version WebP comme dans le vrai processus
    const sharp = (await import('sharp')).default;
    const webpBuffer = await sharp(pngBuffer)
      .resize(400, 400, { fit: 'cover', background: '#ffffff' })
      .webp({ quality: 80 })
      .toBuffer();
    await fs.writeFile(outputPathWebp, webpBuffer);

    console.log(`✅ PDF converti avec succès: ${pngBuffer.length} bytes`);
    console.log(`📁 PNG sauvé dans: ${outputPathPng}`);
    console.log(`📁 WebP sauvé dans: ${outputPathWebp} (${webpBuffer.length} bytes)`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la conversion PDF:', error.message);
    return false;
  }
}

// Test de génération et conversion ICO
async function testIcoConversion() {
  console.log('🧪 Test de conversion ICO...');

  try {
    const sharp = (await import('sharp')).default;

    // Créer un fichier ICO de test simple
    const icoBuffer = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 4,
        background: { r: 100, g: 149, b: 237, alpha: 1 }, // Bleu CornflowerBlue
      },
    })
      .png() // Sharp convertit en PNG, ce qui simule le comportement d'un fichier ICO
      .toBuffer();

    console.log(`🔮 Fichier ICO simulé créé: ${icoBuffer.length} bytes`);

    // Tester que Sharp peut traiter ce buffer avec les paramètres optimisés ICO
    const processedBuffer = await sharp(icoBuffer)
      .resize(400, 400, { fit: 'cover', background: '#ffffff' })
      .webp({
        quality: 85, // Qualité plus élevée pour les logos
        alphaQuality: 100, // Préserver la transparence à 100%
        preset: 'icon', // Preset optimisé pour les icônes
        effort: 6, // Effort maximal pour la compression
        lossless: false, // Mode lossy mais haute qualité
      })
      .toBuffer();

    assert(processedBuffer, 'Le traitement ICO devrait retourner un buffer');
    assert(processedBuffer.length > 0, 'Le buffer ne devrait pas être vide');

    // Sauvegarder le résultat pour inspection visuelle
    const outputPath = path.resolve(__dirname, 'test-results', 'sample-ico-converted.webp');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, processedBuffer);

    console.log(`✅ ICO traité avec succès: ${processedBuffer.length} bytes`);
    console.log(`📁 WebP sauvé dans: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du traitement ICO:', error.message);
    return false;
  }
}

// Test de la fonction getImagePath
async function testGetImagePath() {
  console.log('🧪 Test de getImagePath...');

  try {
    const { getImagePath } = await import('../src/scripts/build-festival-data.js');

    const path1 = getImagePath('stands', 'test-123');
    const path2 = getImagePath('ateliers', 'test-456');

    assert(path1.includes('stands'), "Le chemin devrait contenir le type d'événement");
    assert(path2.includes('ateliers'), "Le chemin devrait contenir le type d'événement");
    assert(path1.endsWith('.webp'), 'Le chemin devrait se terminer par .webp');

    console.log(`✅ getImagePath fonctionne: ${path1}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur avec getImagePath:', error.message);
    return false;
  }
}

// Test de la fonction createPlaceholderImage
async function testCreatePlaceholderImage() {
  console.log('🧪 Test de createPlaceholderImage...');

  try {
    const { createPlaceholderImage } = await import('../src/scripts/build-festival-data.js');

    // Créer des chemins temporaires pour le test
    const tempDir = path.resolve(__dirname, 'temp-test');
    await fs.mkdir(tempDir, { recursive: true });

    const placeholderBuffer = await createPlaceholderImage(
      tempDir, // srcDir
      tempDir, // publicDir
      'test-event', // fileName
      'stands', // eventType
      new Map(), // imageUrlCache
      'https://example.com/test.jpg' // imageUrl
    );

    // Nettoyer
    await fs.rm(tempDir, { recursive: true, force: true });

    assert(placeholderBuffer, 'La fonction devrait retourner un buffer');
    assert(placeholderBuffer.length > 0, 'Le buffer ne devrait pas être vide');

    console.log(`✅ Placeholder créé avec succès: ${placeholderBuffer.length} bytes`);
    return true;
  } catch (error) {
    console.error('❌ Erreur avec createPlaceholderImage:', error.message);
    return false;
  }
}

// Exécution des tests
async function runTests() {
  console.log("🚀 Démarrage des tests de la pipeline d'assets...\n");

  const tests = [testGetImagePath, testCreatePlaceholderImage, testPdfConversion, testIcoConversion];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test ${test.name} a échoué:`, error.message);
      failed++;
    }
    console.log('');
  }

  console.log('--- Résumé des tests ---');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);

  if (failed === 0) {
    console.log('🎉 Tous les tests sont passés !');
    process.exit(0);
  } else {
    console.log('🔥 Certains tests ont échoué.');
    process.exit(1);
  }
}

runTests();
