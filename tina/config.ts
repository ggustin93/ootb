import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";

export default defineConfig({
  branch: "main",
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
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
