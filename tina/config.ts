// tinacms.config.js

import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";

// Validation stricte des variables sensibles
const validateTinaConfig = () => {
  const requiredVars = ['TINA_CLIENT_ID', 'TINA_TOKEN'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`🚨 ERREUR CRITIQUE : Variables Tina CMS manquantes : ${missingVars.join(', ')}`);
    
    // En développement, on log un avertissement
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Mode développement : Configuration incomplète');
      return false;
    }
    
    // En production, on bloque
    throw new Error(`Variables Tina CMS manquantes : ${missingVars.join(', ')}`);
  }

  // Log sécurisé : masquage partiel des tokens
  console.log('🔐 Configuration Tina CMS validée');
  console.log(`🆔 Client ID (partial): ${process.env.TINA_CLIENT_ID?.slice(0, 8)}...`);
  
  return true;
};

// Génération sécurisée de l'URL de contenu
const getContentApiUrl = () => {
  validateTinaConfig();
  return `https://content.tinajs.io/1.8/content/${process.env.TINA_CLIENT_ID}/github/main`;
};

export default defineConfig({
  // Tina Cloud Credentials - Strictement depuis les variables d'environnement
  branch: "main", 
  clientId: process.env.TINA_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',
  
  // Configuration de l'URL Tina
  contentApiUrlOverride: getContentApiUrl(),
  
  // Optional: Disable import alias warnings
  disableImportAliasWarnings: true,

  // Preview Configuration
  preview: {
    hosts: ['localhost:4321'],
    previewTimeout: 3000,
  },

  // Build Output Configuration
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  // Media Management
  media: {
    // Option 1: Tina's Default Media Management
    tina: {
      publicFolder: "src/assets",
      mediaRoot: "images",
    },
    
    // Option 2: Cloudinary Integration (Recommended)
    // Uncomment and configure if you want to use Cloudinary
    /*
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: "out-of-the-books", // Optional: specify a folder in your Cloudinary account
    },
    */
  },

  // Search Configuration
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN || '', 
      stopwordLanguages: ['fra'],
    },
  },

  // Schema Configuration
  schema: {
    collections: [
      {
        ...homepageCollection,
      },
      {
        ...postsCollection,
        label: "Gestion des contenus",
        name: "post",
        path: "src/content/post",
        format: "mdx",
        description: "Gérez ici tous vos contenus (Actualités, Fiches, Lives, Podcasts, Émissions, Premium). Chaque type de contenu a ses propres champs spécifiques qui s'afficheront selon la catégorie sélectionnée.",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => {
              return `${values.category}-${values.title
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^a-zA-Z0-9-]/g, '')}`;
            },
          },
        },
        defaultItem: () => ({
          publishDate: new Date().toISOString(),
        }),
      },
    ],
  },

  // Configuration automatique des modifications
  gitProvider: {
    name: 'github',
    branch: 'main',
    authProvider: 'github',
    autoCommit: true,   // Commits automatiques
    autoMerge: true     // Merge automatique des changements
  },
  
  // Options de commit personnalisées
  commitMessages: {
    createNew: 'Création de {{collection.label}} : {{document.title}}',
    update: 'Mise à jour de {{collection.label}} : {{document.title}}',
    delete: 'Suppression de {{collection.label}} : {{document.title}}'
  }
});
