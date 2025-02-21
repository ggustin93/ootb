// tinacms.config.js

import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";

// Débogage des variables d'environnement
const debugEnvVars = () => {
  console.log('🔍 DÉBOGAGE DES VARIABLES TINA CMS');
  console.log('----------------------------------');
  
  const varsToCheck = [
    'TINA_CLIENT_ID', 
    'TINA_TOKEN', 
    'TINA_SEARCH_TOKEN'
  ];

  varsToCheck.forEach(varName => {
    const value = process.env[varName];
    console.log(`🔑 ${varName}: ${value ? '✅ PRÉSENTE' : '❌ MANQUANTE'}`);
    
    if (value && process.env.NODE_ENV !== 'production') {
      console.log(`   Aperçu: ${value.slice(0, 4)}...${value.slice(-4)}`);
    }
  });

  console.log(`🌍 Environnement: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Développement'}`);
};

// Résolution sécurisée des variables d'environnement
const resolveEnvVar = (varName: string, options: {
  required?: boolean;
  defaultValue?: string;
  isSecret?: boolean;
} = {}) => {
  const {
    required = true,
    defaultValue = '',
    isSecret = false
  } = options;

  let value = process.env[varName] || defaultValue;
  value = value?.trim() || '';

  // Gestion des variables non-résolues de Netlify (qui commencent par ${)
  if (value.startsWith('${') && value.endsWith('}')) {
    console.warn(`⚠️ Variable ${varName} non résolue par Netlify`);
    value = defaultValue;
  }

  // En prod, on lance une erreur si la variable est requise et manquante
  if (!value && required && process.env.NODE_ENV === 'production') {
    throw new Error(`🚨 Variable d'environnement requise manquante: ${varName}`);
  }

  // En dev, on affiche un warning si la variable est manquante
  if (!value && required && process.env.NODE_ENV !== 'production') {
    console.warn(`⚠️ Variable d'environnement manquante: ${varName}`);
  }

  // Log sécurisé (uniquement en dev et si ce n'est pas un secret)
  if (process.env.NODE_ENV !== 'production' && !isSecret && value) {
    console.log(`📝 ${varName}: ${value.slice(0, 4)}...${value.slice(-4)}`);
  }

  return value;
};

export default defineConfig({
  branch: "main",
  clientId: resolveEnvVar('TINA_CLIENT_ID', { required: true }),
  token: resolveEnvVar('TINA_TOKEN', { required: true, isSecret: true }),
  
  contentApiUrlOverride: `https://content.tinajs.io/1.8/content/${resolveEnvVar('TINA_CLIENT_ID', { required: true })}/github/main`,
  
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
    hosts: ['localhost:4321'],  // Port Astro par défaut
    previewTimeout: 3000,
  },

  search: {
    tina: {
      indexerToken: resolveEnvVar('TINA_SEARCH_TOKEN', { required: false, isSecret: true }),
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

// Exécuter le débogage au chargement de la configuration
debugEnvVars();
