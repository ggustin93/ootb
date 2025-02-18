// tinacms.config.js

import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
// Importez d'autres collections ici
// import { homepageCollection } from "./homepageCollection";
// import { legalPagesCollection } from "./legalPagesCollection";

export default defineConfig({
  branch: "main",
  clientId: "local-dev",
  token: "local-dev-token",
  disableImportAliasWarnings: true,

  // Activation du mode preview
  preview: {
    hosts: ['localhost:4321'],
    previewTimeout: 3000,
  },

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

  search: {
    tina: {
      indexerToken: "",
      stopwordLanguages: ['fra'],
    },
  },

  schema: {
    collections: [
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
});
