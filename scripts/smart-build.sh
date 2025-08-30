#!/bin/bash

# Script de build intelligent pour Netlify
# Installe Poppler uniquement si des PDFs sont détectés dans les données

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du build intelligent..."

# Étape 1: Vérifier si Poppler est nécessaire
echo "🔍 Vérification de la nécessité d'installer Poppler..."

if node scripts/check-pdf-needs.js; then
    echo "✅ Aucun PDF détecté - Build accéléré sans Poppler"
    INSTALL_POPPLER=false
else
    echo "📄 PDFs détectés - Installation de Poppler nécessaire"
    INSTALL_POPPLER=true
fi

# Étape 2: Installation conditionnelle de Poppler
if [ "$INSTALL_POPPLER" = true ]; then
    echo "📦 Installation de Poppler..."
    apt-get update > /dev/null 2>&1
    apt-get install -y poppler-utils > /dev/null 2>&1
    echo "✅ Poppler installé"
else
    echo "⚡ Poppler ignoré - gain de temps de build"
fi

# Étape 3: Build principal
echo "🏗️ Lancement du build principal..."
npm run build:netlify

echo "🎉 Build terminé avec succès !"
