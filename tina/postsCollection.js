// postsCollection.js
import { mediaFields, validateMediaByCategory, updateMediaTypeByCategory } from './mediaFields';

const CONTENT_TYPES = {
  actualite: "Actualités",
  fiche: "Fiches",
  live: "Lives",
  podcast: "Podcasts",
  tv: "Emissions TV",
  premium: "Premium",
}

export const postsCollection = {
  name: "post",
  label: "📚 Gestion des contenus",
  path: "src/content/post",
  format: "mdx",
  mdx: {
    disableImportAliasWarnings: true,
    resolve: {
      '~/components/mdx': './src/components/mdx'
    }
  },
  ui: {
    itemTable: {
      defaultSort: {
        key: "_values.publishDate",
        direction: "desc"
      },
      tableColumns: [
        {
          key: "_values.published",
          name: "Statut",
          render: (value) => value ? "✅ Publié" : "⚠️ Brouillon"
        },
        {
          key: "_values.publishDate",
          name: "Date de publication",
        },
        {
          key: "_values.category",
          name: "Catégorie",
          render: (value) => CONTENT_TYPES[value] || value
        },
        {
          key: "_values.title",
          name: "Titre"
        }
      ]
    },
    sortable: {
      fields: [
        {
          key: "_values.publishDate",
          name: "Date de publication"
        },
        {
          key: "_values.title",
          name: "Titre"
        },
        {
          key: "_values.category",
          name: "Type de contenu"
        },
        {
          key: "_values.published",
          name: "Statut"
        }
      ]
    },
    allowedActions: {
      create: true,
      delete: true,
      update: true,
      save: true,
    },
    filename: {
      readonly: false,
      slugify: (values) => {
        return `${values?.title
          ?.toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '')}`;
      },
      description: "Le nom du fichier sera généré automatiquement à partir du titre. Il sera converti en minuscules, les espaces seront remplacés par des tirets et les caractères spéciaux seront supprimés.",
    },
    itemProps: (item) => {
      // Personnaliser l'affichage en fonction du type de média
      let label = `Média: ${item?.type || 'Non défini'}`;
      
      if (item?.type === 'podcast') {
        label = `🎙️ Podcast Ausha`;
      } else if (item?.type === 'youtube') {
        label = `🎬 Vidéo YouTube`;
      } else if (item?.type === 'tv') {
        label = `📺 Émission TV`;
      }
      
      return { label };
    },
    validate: (data) => {
      // Validation des champs média en fonction de la catégorie
      const mediaValidation = validateMediaByCategory(data);
      
      // Si la validation retourne une chaîne, c'est une erreur
      if (typeof mediaValidation === 'string') {
        return mediaValidation;
      }
      
      // Vérifications supplémentaires pour les podcasts
      if (data.category === 'podcast') {
        if (!data.media) {
          return "⚠️ OBLIGATOIRE: Pour un podcast, vous devez configurer le média";
        }
        
        // Les deux champs sont obligatoires pour les podcasts
        if (!data.media.iframeCode) {
          return "⚠️ OBLIGATOIRE: Pour un podcast, le code iframe est requis";
        }
        
        if (!data.media.smartlinkUrl) {
          return "⚠️ OBLIGATOIRE: Pour un podcast, l'URL Smartlink est requise";
        }
        
        // Vérifier le format de l'URL Smartlink
        if (data.media.smartlinkUrl && !data.media.smartlinkUrl.match(/^https:\/\/smartlink\.ausha\.co\//)) {
          return "⚠️ L'URL Smartlink doit être au format https://smartlink.ausha.co/nom-du-podcast/numero-nom-episode";
        }
      }
      
      // Vérifications pour les lives
      if (data.category === 'live') {
        if (!data.media || !data.media.videoUrl) {
          return "⚠️ OBLIGATOIRE: Pour un live, l'URL YouTube est obligatoire";
        }
        
        // Vérifier le format de l'URL YouTube
        if (data.media?.videoUrl && !data.media.videoUrl.match(/^https:\/\/(youtu\.be\/|www\.youtube\.com\/)/)) {
          return "⚠️ L'URL doit être une URL YouTube valide";
        }
      }
      
      // Vérifications pour les émissions TV
      if (data.category === 'tv') {
        if (!data.media || !data.media.tvcomUrl) {
          return "⚠️ OBLIGATOIRE: Pour une émission TV, l'URL TV Com est obligatoire";
        }
        
        // Vérifier le format de l'URL TV Com
        if (data.media?.tvcomUrl && !data.media.tvcomUrl.match(/^https:\/\/www\.tvcom\.be\/video\//)) {
          return "⚠️ L'URL TV Com doit être au format https://www.tvcom.be/video/...";
        }
      }
      
      return true;
    }
  },
  fields: [
    // Placer la catégorie en premier pour une meilleure expérience utilisateur
    {
      type: "string",
      name: "category",
      label: "Catégorie",
      description: "Type de contenu",
      required: true,
      options: Object.entries(CONTENT_TYPES).map(([value, label]) => ({
        value,
        label
      })),
      ui: {
        // Quand la catégorie change, mettre à jour automatiquement le type de média
        onChange: updateMediaTypeByCategory
      }
    },
    {
      type: "boolean",
      name: "published",
      label: "Publié",
      description: "Statut de publication du contenu (par défaut: publié)",
      required: false,
      ui: {
        parse: (value) => value === undefined ? true : value,
        format: (value) => value === undefined ? true : value,
        description: "✅ ACTIVÉ = Le contenu est visible sur le site\n⚠️ DÉSACTIVÉ = Le contenu n'est pas visible"
      },
    },
    {
      type: "boolean",
      name: "draft",
      label: "Brouillon (Déprécié)",
      description: "Champ technique - Ne pas modifier directement",
      required: false,
      ui: {
        parse: (value, data) => !data.published, // Toujours l'inverse de published
        format: (value) => !value,
        component: "hidden", // Caché car géré automatiquement via published
      },
    },
    {
      type: "string",
      name: "title",
      label: "Titre",
      description: "Titre principal du contenu",
      required: true,
      isTitle: true,
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      description: "Résumé court du contenu (150-200 caractères)",
      required: true,
      ui: {
        component: "textarea"
      }
    },
    {
      type: "datetime",
      name: "publishDate",
      label: "Date de publication",
      required: true,
    },
    {
      type: "image",
      name: "image",
      label: "Image principale",
      description: "Image mise en avant (format 16:9 recommandé)",
    },
    // Champs pour la compatibilité avec l'ancienne structure (masqués)
    {
      type: "string",
      name: "videoUrl",
      label: "URL de la vidéo (ancienne structure)",
      description: "URL complète de la vidéo YouTube (utiliser de préférence la nouvelle structure media)",
      ui: {
        component: "hidden"
      }
    },
    {
      type: "string",
      name: "tvcomUrl",
      label: "URL TV Com (ancienne structure)",
      description: "URL complète de l'émission sur TV Com (utiliser de préférence la nouvelle structure media)",
      ui: {
        component: "hidden"
      }
    },
    {
      type: "string",
      name: "podcastUrl",
      label: "URL du podcast (ancienne structure - déprécié)",
      description: "URL complète du podcast (utiliser de préférence la nouvelle structure media)",
      ui: {
        component: "hidden"
      }
    },
    {
      type: "string",
      name: "showId",
      label: "ID du show (ancienne structure)",
      description: "Identifiant du show Ausha (utiliser de préférence la nouvelle structure media)",
      ui: {
        component: "hidden"
      }
    },
    {
      type: "string",
      name: "podcastId",
      label: "ID de l'épisode (ancienne structure)",
      description: "Identifiant de l'épisode Ausha (utiliser de préférence la nouvelle structure media)",
      ui: {
        component: "hidden"
      }
    },
    {
      type: "string",
      name: "expert",
      label: "Expert",
      description: "Nom de l'expert ou intervenant principal",
    },
    {
      type: "string",
      name: "duration",
      label: "Durée",
      description: "Durée du contenu (ex: 45min, 1h30)",
    },
    {
      type: "string",
      name: "tags",
      label: "Tags",
      description: "Mots-clés associés au contenu",
      list: true,
      ui: {
        component: "tags",
      }
    },
    // Utilisation de l'objet mediaFields importé
    mediaFields,
    {
      type: "rich-text",
      name: "body",
      label: "Contenu",
      isBody: true,
    },
  ],
};