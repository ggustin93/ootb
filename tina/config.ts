// tinacms.config.js

import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";

// Configuration par défaut sécurisée pour Tina CMS
const DEFAULT_CONFIG = {
  // Client ID par défaut pour les environnements de développement
  CLIENT_ID: 'e5043161-7d23-41bf-a7bc-626eef359ef0',
  TOKEN: 'dummy-token-for-local-dev',
  SEARCH_TOKEN: 'dummy-search-token'
};

// Fonction utilitaire pour récupérer les variables d'environnement avec fallback
const getEnvVar = (varName: string) => {
  // Priorité à import.meta.env, puis process.env, avec un fallback par défaut
  return (import.meta.env && import.meta.env[varName]) || 
         (process.env && process.env[varName]) || 
         DEFAULT_CONFIG[varName.replace('TINA_', '').replace('PUBLIC_', '') as keyof typeof DEFAULT_CONFIG];
};

export default defineConfig({
  // Configuration de base du dépôt
  branch: "main",

  // Résolution du Client ID avec fallback
  clientId: getEnvVar('TINA_CLIENT_ID') || 'e5043161-7d23-41bf-a7bc-626eef359ef0',
  
  // Token d'authentification avec fallback
  token: getEnvVar('TINA_TOKEN') || 'dummy-token',
  
  // URL de contenu Tina CMS hardcodée pour résoudre les problèmes de build Netlify
  contentApiUrlOverride: 'https://content.tinajs.io/1.8/content/e5043161-7d23-41bf-a7bc-626eef359ef0/github/main',
  
  // Configuration de build
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  // Configuration des médias
  media: {
    tina: {
      publicFolder: "src/assets",
      mediaRoot: "images",
    },
  },

  // Configuration de prévisualisation
  preview: {
    hosts: ['localhost:4321'],
    previewTimeout: 3000,
  },

  // Configuration de la recherche
  search: {
    tina: {
      // Token de recherche avec fallback
      indexerToken: getEnvVar('TINA_SEARCH_TOKEN') || 'dummy-search-token',
      stopwordLanguages: ['fra'],
    },
  },

  // Schéma des collections de contenu
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
        
        // Configuration UI pour la génération de noms de fichiers
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
        
        // Définition d'un élément par défaut avec date de publication
        defaultItem: () => ({
          publishDate: new Date().toISOString(),
        }),
      },
    ],
  },

  // Configuration du fournisseur Git
  gitProvider: {
    name: 'github',
    branch: 'main',
    authProvider: 'github',
    autoCommit: true,
    autoMerge: true,
  },
});
