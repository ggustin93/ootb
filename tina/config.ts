import { defineConfig } from "tinacms";
import { postsCollection } from "./postsCollection";
import { homepageCollection } from "./homepageCollection";
import { termsCollection, privacyCollection } from "./legalCollection";
import { blogCollection } from "./blogCollection";
import { appelProjetCollection } from "./appelProjetCollection";
import { navigationCollection } from "./navigationCollection";
import { aboutCollection } from "./aboutCollection";
import { erasmusCollection } from "./erasmusCollection";
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
    // "public" (et non "dist") pour que l'admin soit servi par `astro dev` à /admin
    // en local. En build, l'ordre `tinacms build && astro build` recopie public/admin → dist/admin.
    publicFolder: "public",
  },

  media: {
    loadCustomStore: async () => {
      const pack = await import("next-tinacms-cloudinary");
      const { compressImage } = await import("./media/compressImage");

      const Base = pack.TinaCloudCloudinaryMediaStore;

      // Limite pratique au-delà de laquelle l'upload échoue côté Netlify
      // (corps de fonction synchrone ~6 Mo, gonflé par le transport base64).
      // On garde une marge : au-dessus, on affiche un message clair plutôt que
      // de laisser la requête se faire rejeter par la plateforme (ce qui
      // produisait un "Internal Server Error" non-JSON et une popup illisible).
      const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 Mo

      // Sous-classe : on compresse les images trop lourdes AVANT l'envoi, puis
      // on délègue tout le reste (list/delete/preview...) au store d'origine.
      return class CompressingCloudinaryMediaStore extends Base {
        async persist(media: any[]) {
          const processed = await Promise.all(
            media.map(async (item) => {
              if (item?.file) {
                const file = await compressImage(item.file);
                return { ...item, file };
              }
              return item;
            })
          );

          for (const item of processed) {
            if (item?.file && item.file.size > MAX_UPLOAD_BYTES) {
              const mb = (item.file.size / 1024 / 1024).toFixed(1);
              throw new Error(
                `L'image « ${item.file.name} » est trop lourde (${mb} Mo) pour être ` +
                  `téléversée. Merci de la réduire sous 4 Mo (par exemple via ` +
                  `https://squoosh.app) puis de réessayer.`
              );
            }
          }

          return super.persist(processed);
        }
      };
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
      erasmusCollection,
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