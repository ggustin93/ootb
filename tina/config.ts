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

export default defineConfig({
  branch: "main",
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

  // Configuration du fournisseur Git
  gitProvider: {
    name: 'github',
    branch: 'main',
    authProvider: 'github',
    autoCommit: true,
    autoMerge: true,
  },
});