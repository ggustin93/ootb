// tinacms.config.js

import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";

// Configuration par défaut sécurisée
const DEFAULT_CONFIG = {
  CLIENT_ID: 'e5043161-7d23-41bf-a7bc-626eef359ef0',
  TOKEN: 'dummy-token-for-netlify-resolution',
  SEARCH_TOKEN: 'dummy-search-token'
};

// Fonction utilitaire pour récupérer les variables d'environnement
const getEnvVar = (varName: string) => {
  // Utilisation prioritaire de process.env pour Netlify
  const value = process.env[varName] || 
                (import.meta.env && import.meta.env[varName]) || 
                DEFAULT_CONFIG[varName.replace('TINA_', '').replace('PUBLIC_', '') as keyof typeof DEFAULT_CONFIG];
  
  console.log(`🔍 Résolution de ${varName}:`);
  console.log(`   - Valeur résolue: ${value}`);
  
  return value;
};

// Fonction de validation et de construction de l'URL de contenu
const buildContentApiUrl = (clientId: string) => {
  console.log('🔍 Construction de l\'URL de contenu Tina CMS');
  console.log(`   - Client ID source: ${clientId}`);

  // Validation du Client ID
  if (!clientId || clientId.trim() === '') {
    console.error('🚨 ERREUR : Client ID invalide');
    throw new Error('Client ID est requis pour construire l\'URL de contenu');
  }

  // Construction de l'URL
  const contentApiUrl = `https://content.tinajs.io/1.8/content/${clientId.trim()}/github/main`;
  
  console.log(`   - URL de contenu générée: ${contentApiUrl}`);
  return contentApiUrl;
};

export default defineConfig({
  branch: "main",
  clientId: getEnvVar('TINA_CLIENT_ID'),
  token: getEnvVar('TINA_TOKEN'),
  
  contentApiUrlOverride: buildContentApiUrl(getEnvVar('TINA_CLIENT_ID')),
  
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      publicFolder: "src/assets",
      mediaRoot: "images",
    },
  },

  preview: {
    hosts: ['localhost:4321'],
    previewTimeout: 3000,
  },

  search: {
    tina: {
      indexerToken: getEnvVar('TINA_SEARCH_TOKEN'),
      stopwordLanguages: ['fra'],
    },
  },

  schema: {
    collections: [
      homepageCollection,
      {
        ...postsCollection,
        label: "Gestion des contenus",
        name: "post",
        path: "src/content/post",
        format: "mdx",
        description: "Gérez ici tous vos contenus (Actualités, Fiches, Lives, Podcasts, Émissions, Premium).",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => {
              if (!values?.title) return '';
              return `${values.category || 'post'}-${values.title
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

  gitProvider: {
    name: 'github',
    branch: 'main',
    authProvider: 'github',
    autoCommit: true,
    autoMerge: true,
  },
});
