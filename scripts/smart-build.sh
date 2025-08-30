#!/bin/bash

# Script de build intelligent pour Netlify
# Gère la conversion PDF avec fallback gracieux

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du build intelligent..."

# Étape 1: Vérifier si Poppler est nécessaire
echo "🔍 Vérification de la nécessité d'installer Poppler..."

if node scripts/check-pdf-needs.js; then
    echo "✅ Aucun PDF détecté - Build accéléré sans Poppler"
    INSTALL_POPPLER=false
else
    echo "📄 PDFs détectés - Tentative d'installation de Poppler"
    INSTALL_POPPLER=true
fi

# Étape 2: Installation conditionnelle de Poppler (avec gestion d'erreur)
if [ "$INSTALL_POPPLER" = true ]; then
    echo "📦 Tentative d'installation de Poppler..."
    
    # Vérifier si on a les permissions pour installer des packages
    if command -v apt-get &> /dev/null && [ "$EUID" -eq 0 ]; then
        # Installation classique avec apt-get (environnement avec root)
        apt-get update > /dev/null 2>&1
        apt-get install -y poppler-utils > /dev/null 2>&1
        echo "✅ Poppler installé via apt-get"
    else
        # Environnement Netlify ou sans privilèges root
        echo "⚠️ Impossible d'installer Poppler (environnement restreint)"
        echo "📋 Les PDFs seront remplacés par des images de remplacement"
        PDF_CONVERSION_DISABLED=true
    fi
else
    echo "⚡ Poppler ignoré - gain de temps de build"
fi

# Étape 3: Build principal
echo "🏗️ Lancement du build principal..."

# Exporter la variable d'environnement pour le processus de build
if [ "$PDF_CONVERSION_DISABLED" = "true" ]; then
    export PDF_CONVERSION_DISABLED=true
    echo "🔧 Variable PDF_CONVERSION_DISABLED exportée"
fi

npm run build:netlify

echo "🎉 Build terminé avec succès !"
