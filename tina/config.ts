import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";
import { termsCollection, privacyCollection } from "./legalCollection";
import { blogCollection } from "./blogCollection";
import { appelProjetCollection } from "./appelProjetCollection";
import { navigationCollection } from "./navigationCollection";
import { aboutCollection } from "./aboutCollection";
import { contactCollection } from "./contactCollection";
import { siteSettingsCollection } from "./siteSettingsCollection";
import { festivalCollection } from "./festivalCollection";

// Branche éditée par Tina, résolue dynamiquement selon le déploiement :
// - sur Netlify, HEAD = la branche du déploiement (ex. "staging" pour staging--site.netlify.app)
// - en production (branche main), HEAD = "main" → comportement inchangé
// - TINA_BRANCH permet de forcer une branche en local / CI
const branch =
  process.env.TINA_BRANCH ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  
  build: {
    outputFolder: "admin",
    publicFolder: "dist",
  },

  media: {
    loadCustomStore: async () => {
      const pack = await import("next-tinacms-cloudinary");
      return pack.TinaCloudCloudinaryMediaStore;
    },
  },

  schema: {
    collections: [
      postsCollection,
      homepageCollection,
      festivalCollection,
      appelProjetCollection,
      blogCollection,
      aboutCollection,
      contactCollection,
      siteSettingsCollection,
      navigationCollection,
      termsCollection,
      privacyCollection,
    ],
  },

  // Configuration de la recherche (nécessite un token TinaCloud)
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN, // À obtenir depuis le tableau de bord TinaCloud
      stopwordLanguages: ['fra', 'eng'], // Langues pour les mots vides (français et anglais)
    },
    indexBatchSize: 100, // Nombre de documents à indexer par requête
    maxSearchIndexFieldLength: 200, // Limite de caractères pour les champs de texte variables
  },

  // Configuration du fournisseur Git
  gitProvider: {
    name: 'github',
    branch,
    authProvider: 'github',
    autoCommit: true,
    autoMerge: false, // jamais de merge auto : les éditions staging ne remontent pas vers main
  }
});