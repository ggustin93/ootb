// tinacms.config.js

import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";

// Débogage avancé des variables d'environnement
const debugEnvVars = () => {
  console.log('🔍 DÉBOGAGE COMPLET DES VARIABLES TINA CMS 🔍');
  console.log('-------------------------------------------');
  
  // Liste exhaustive des variables à vérifier
  const varsToCheck = [
    'TINA_CLIENT_ID', 
    'TINA_TOKEN', 
    'TINA_SEARCH_TOKEN', 
    'NODE_ENV'
  ];

  varsToCheck.forEach(varName => {
    const rawValue = process.env[varName];
    const value = rawValue || 'NON DÉFINIE';
    
    console.log(`🔑 ${varName}:`);
    console.log(`   - Présence: ${rawValue ? '✅ DÉFINIE' : '❌ ABSENTE'}`);
    
    if (rawValue) {
      console.log(`   - Longueur: ${rawValue.length} caractères`);
      console.log(`   - Début: ${rawValue.slice(0, 4)}...`);
      console.log(`   - Fin: ...${rawValue.slice(-4)}`);
    }
    
    console.log('-------------------------------------------');
  });

  // Vérification de l'environnement
  console.log('🌍 Environnement système :');
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'Non spécifié'}`);
  console.log(`   - NETLIFY: ${process.env.NETLIFY || 'Non défini'}`);
};

// Résolution sécurisée du client ID
const resolveClientId = () => {
  debugEnvVars(); // Appel du débogage avant toute résolution

  const clientId = process.env.TINA_CLIENT_ID?.trim();
  if (!clientId) {
    console.error('🚨 CRITICAL: No Tina Client ID found');
    console.error('Variables complètes:', JSON.stringify(process.env, null, 2));
    throw new Error('Tina Client ID is required');
  }
  
  console.log(`✅ Client ID valide : ${clientId.slice(0, 8)}...`);
  return clientId;
};

export default defineConfig({
  // Configuration basée sur des variables d'environnement résolues
  branch: "main", 
  clientId: resolveClientId(),
  token: process.env.TINA_TOKEN || '',
  
  // URL de contenu avec résolution explicite
  contentApiUrlOverride: `https://content.tinajs.io/1.8/content/${resolveClientId()}/github/main`,
  
  // Désactivation des avertissements d'alias
  disableImportAliasWarnings: true,

  // Configuration de prévisualisation
  preview: {
    hosts: ['localhost:4321'],
    previewTimeout: 3000,
  },

  // Configuration de build
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

  // Configuration de recherche
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN || '', 
      stopwordLanguages: ['fra'],
    },
  },

  // Configurations des collections
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
    ]
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
