// tinacms.config.js

import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";

// Fonction de validation des variables d'environnement
const validateEnvVar = (varName: string, defaultValue?: string): string => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ Variable d'environnement ${varName} manquante !`);
    if (defaultValue) {
      console.warn(`🔧 Utilisation de la valeur par défaut : ${defaultValue}`);
      return defaultValue;
    }
    throw new Error(`Variable d'environnement ${varName} requise mais non définie`);
  }
  return value;
};

// Récupération sécurisée des variables Tina
const TINA_CLIENT_ID = validateEnvVar('TINA_CLIENT_ID', 'e5043161-7d23-41bf-a7bc-626eef359ef0');
const TINA_TOKEN = validateEnvVar('TINA_TOKEN', 'abe9d5391460078be76f1935613f9055303eff11');
const TINA_SEARCH_TOKEN = validateEnvVar('TINA_SEARCH_TOKEN');

// Logs de débogage pour l'environnement
console.log('🔍 Variables Tina Cloud:');
console.log('TINA_CLIENT_ID:', process.env.TINA_CLIENT_ID ? 'Présent ✅' : 'Manquant ❌');
console.log('TINA_TOKEN:', process.env.TINA_TOKEN ? 'Présent ✅' : 'Manquant ❌');
console.log('TINA_SEARCH_TOKEN:', process.env.TINA_SEARCH_TOKEN ? 'Présent ✅' : 'Manquant ❌');

// Log de tous les environnements pour débogage complet
console.log('🌍 Tous les environnements:');
Object.keys(process.env).forEach(key => {
  if (key.includes('TINA') || key.includes('CLIENT') || key.includes('TOKEN')) {
    console.log(`${key}: ${process.env[key]}`);
  }
});

export default defineConfig({
  // Tina Cloud Credentials
  branch: "main", 
  clientId: TINA_CLIENT_ID,
  token: TINA_TOKEN,
  
  // Configuration de l'URL Tina avec vérification explicite
  contentApiUrlOverride: (() => {
    const version = '1.8';
    const url = `https://content.tinajs.io/${version}/content/${TINA_CLIENT_ID}/github/main`;
    
    console.log('🚀 URL de contenu Tina générée:', url);
    console.log('🔑 Version utilisée:', version);
    console.log('🆔 ClientID utilisé:', TINA_CLIENT_ID);
    
    return url;
  })(),
  
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
      indexerToken: TINA_SEARCH_TOKEN || "", // Optional: Add search token if using Tina's search
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
