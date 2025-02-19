// tinacms.config.js

import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";

// Configuration de sécurité avancée
const TinaSecurityConfig = {
  requiredVars: ['TINA_CLIENT_ID', 'TINA_TOKEN'],
  sensitiveVars: ['TINA_TOKEN', 'TINA_SEARCH_TOKEN'],
  
  // Validation robuste des variables d'environnement
  validateConfig: () => {
    const missingVars = TinaSecurityConfig.requiredVars.filter(
      varName => !process.env[varName]?.trim()
    );

    if (missingVars.length > 0) {
      const errorMessage = `🚨 CRITICAL: Missing Tina CMS variables: ${missingVars.join(', ')}`;
      
      // Différenciation strict dev/prod
      if (process.env.NODE_ENV === 'production') {
        console.error(errorMessage);
        throw new Error(errorMessage);
      } else {
        console.warn(`⚠️ DEV MODE: ${errorMessage}`);
      }
    }

    // Log sécurisé avec masquage des tokens sensibles
    TinaSecurityConfig.sensitiveVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`🔐 ${varName}: ${value.slice(0, 4)}...${value.slice(-4)}`);
      }
    });

    return true;
  },

  // Génération sécurisée de l'URL
  generateContentApiUrl: () => {
    const clientId = process.env.TINA_CLIENT_ID?.trim();
    return clientId 
      ? `https://content.tinajs.io/1.8/content/${clientId}/github/main`
      : '';
  }
};

export default defineConfig({
  // Validation et configuration sécurisée
  ...(() => {
    TinaSecurityConfig.validateConfig();
    return {
      branch: "main", 
      clientId: process.env.TINA_CLIENT_ID || '',
      token: process.env.TINA_TOKEN || '',
      
      // URL de contenu générée de manière sécurisée
      contentApiUrlOverride: TinaSecurityConfig.generateContentApiUrl(),
      
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
    };
  })()
});
