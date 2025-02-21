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

export default defineConfig({
  branch: "main",
  clientId: import.meta.env.TINA_CLIENT_ID || DEFAULT_CONFIG.CLIENT_ID,
  token: import.meta.env.TINA_TOKEN || DEFAULT_CONFIG.TOKEN,
  
  contentApiUrlOverride: `https://content.tinajs.io/1.8/content/${
    import.meta.env.TINA_CLIENT_ID || DEFAULT_CONFIG.CLIENT_ID
  }/github/main`,
  
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
      indexerToken: import.meta.env.TINA_SEARCH_TOKEN || DEFAULT_CONFIG.SEARCH_TOKEN,
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
