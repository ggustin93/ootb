import type { Collection } from "tinacms";

export const erasmusCollection: Collection = {
  name: "erasmusPlus",
  label: "📄 Page - Erasmus+",
  path: "src/content/erasmus-plus",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      type: "object",
      name: "metadata",
      label: "Référencement & partage",
      ui: {
        itemProps: (_item) => {
          return { label: "Référencement & partage" };
        },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre (SEO)",
          description: "Titre qui apparaît dans les résultats de recherche (50-60 caractères). Ne pas inclure '| Out of the Books' car il sera ajouté automatiquement.",
          required: false,
        },
        {
          type: "string",
          name: "description",
          label: "Description (SEO)",
          description: "Courte description pour les résultats de recherche (150-160 caractères recommandés).",
          ui: {
            component: "textarea",
          },
          required: false,
        },
        {
          type: "image",
          name: "image",
          label: "Image de partage",
          description: "Image utilisée lors du partage sur les réseaux sociaux (1200x630px recommandé).",
          required: false,
        },
      ],
    },
    {
      type: "object",
      name: "hero",
      label: "En-tête de page (hero)",
      fields: [
        {
          type: "string",
          name: "titre",
          label: "Titre",
        },
        {
          type: "string",
          name: "sousTitre",
          label: "Sous-titre",
        },
        {
          type: "string",
          name: "intro",
          label: "Phrase d'accroche",
          description:
            "Courte phrase affichée sous le sous-titre, dans le héro. Idéalement 1 à 2 lignes.",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "descriptif",
          label: "Texte de présentation du projet",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "image",
          name: "heroImage",
          label: "Image principale",
        },
        {
          type: "image",
          name: "logoUE",
          label: "Logo Union européenne",
        },
      ],
    },
    {
      type: "object",
      name: "projet",
      label: "Le projet",
      fields: [
        {
          type: "string",
          name: "titre",
          label: "Titre de section",
          description: "Titre affiché en haut de la section « Le projet » (ex. « Le projet en deux volets »).",
        },
        {
          type: "object",
          name: "thematiques",
          label: "Thématiques",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.titre || "Nouvelle thématique" };
            },
          },
          fields: [
            {
              type: "string",
              name: "titre",
              label: "Titre",
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              ui: {
                component: "textarea",
              },
            },
          ],
        },
        {
          type: "string",
          name: "ambitionTitre",
          label: "Titre du bloc « ambition »",
          description: "Petit titre du bloc mis en avant (ex. « Une ambition commune »).",
        },
        {
          type: "string",
          name: "ambition",
          label: "Ambition commune",
          ui: {
            component: "textarea",
          },
        },
      ],
    },
    {
      type: "string",
      name: "partenairesTitre",
      label: "Titre de la section « Nos partenaires »",
      description: "Titre affiché en haut de la section partenaires (ex. « Deux partenaires européens »).",
    },
    {
      type: "string",
      name: "partenairesIntro",
      label: "Introduction « Nos partenaires »",
      description: "Paragraphe d'introduction affiché sous le titre de la section partenaires.",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "object",
      name: "partenaires",
      label: "Partenaires",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.nom || "Nouveau partenaire" };
        },
      },
      fields: [
        {
          type: "string",
          name: "nom",
          label: "Nom",
        },
        {
          type: "image",
          name: "logo",
          label: "Logo",
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "lien",
          label: "Lien principal du site",
          description: "Utilisé si aucun lien détaillé n'est ajouté dans « Liens » ci-dessous.",
        },
        {
          type: "object",
          name: "liens",
          label: "Liens",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.label || "Nouveau lien" };
            },
          },
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé (ex. Site, Plateforme, Boutique)",
            },
            {
              type: "string",
              name: "url",
              label: "URL",
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "ressources",
      label: "Ressources pédagogiques",
      fields: [
        {
          type: "boolean",
          name: "publie",
          label: "Publier cette section",
          ui: {
            parse: (value) => (value === undefined ? true : value),
            format: (value) => (value === undefined ? true : value),
            description:
              "Affiche cette section sur le site. Désactivé, elle est simplement masquée — votre contenu reste enregistré et réaffichable à tout moment.",
          },
        },
        {
          type: "string",
          name: "titre",
          label: "Titre",
        },
        {
          type: "object",
          name: "volets",
          label: "Volets",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.nom || "Nouveau volet" };
            },
          },
          fields: [
            {
              type: "string",
              name: "nom",
              label: "Nom",
            },
            {
              type: "boolean",
              name: "podcastsPublie",
              label: "Publier les podcasts",
              ui: {
                parse: (value) => (value === undefined ? true : value),
                format: (value) => (value === undefined ? true : value),
                description:
                  "Affiche les podcasts de ce volet sur le site. Désactivé, ils restent enregistrés mais masqués — réaffichables quand vous voulez.",
              },
            },
            {
              type: "boolean",
              name: "videosPublie",
              label: "Publier les vidéos",
              ui: {
                parse: (value) => (value === undefined ? true : value),
                format: (value) => (value === undefined ? true : value),
                description:
                  "Affiche les vidéos de ce volet sur le site. Désactivé, elles restent enregistrées mais masquées — réaffichables quand vous voulez.",
              },
            },
            {
              type: "boolean",
              name: "fichesPublie",
              label: "Publier les fiches pédagogiques",
              ui: {
                parse: (value) => (value === undefined ? true : value),
                format: (value) => (value === undefined ? true : value),
                description:
                  "Affiche les fiches de ce volet sur le site. Désactivé, elles restent enregistrées mais masquées — réaffichables quand vous voulez.",
              },
            },
            {
              type: "object",
              name: "podcasts",
              label: "Podcasts",
              list: true,
              ui: {
                itemProps: (item) => {
                  return { label: item?.titre || "Nouveau podcast" };
                },
              },
              fields: [
                {
                  type: "string",
                  name: "titre",
                  label: "Titre",
                },
                {
                  type: "image",
                  name: "cover",
                  label: "Pochette (cover)",
                },
                {
                  type: "string",
                  name: "url",
                  label: "🎧 Lien d'écoute (smartlink Ausha)",
                  description:
                    "Collez le smartlink de l'épisode (Ausha › Partager › Smartlink, format https://smartlink.ausha.co/…). Fonctionne avec n'importe quel workspace Ausha — y compris celui du projet Erasmus+.",
                },
              ],
            },
            {
              type: "object",
              name: "videos",
              label: "Vidéos",
              list: true,
              ui: {
                itemProps: (item) => {
                  return { label: item?.titre || "Nouvelle vidéo" };
                },
              },
              fields: [
                {
                  type: "string",
                  name: "titre",
                  label: "Titre",
                },
                {
                  type: "string",
                  name: "url",
                  label: "Lien (YouTube/Pédagoscope)",
                },
                {
                  type: "image",
                  name: "miniature",
                  label: "Miniature",
                },
              ],
            },
            {
              type: "object",
              name: "fichesCategories",
              label: "Catégories de fiches",
              list: true,
              ui: {
                itemProps: (item) => {
                  return { label: item?.categorie || "Nouvelle catégorie" };
                },
              },
              fields: [
                {
                  type: "string",
                  name: "categorie",
                  label: "Catégorie",
                },
                {
                  type: "object",
                  name: "fiches",
                  label: "Fiches",
                  list: true,
                  ui: {
                    itemProps: (item) => {
                      return { label: item?.titre || "Nouvelle fiche" };
                    },
                  },
                  fields: [
                    {
                      type: "string",
                      name: "titre",
                      label: "Titre",
                    },
                    {
                      type: "string",
                      name: "lienPdf",
                      label: "Lien PDF (Google Drive)",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "carnetDeBord",
      label: "Carnet de bord",
      fields: [
        {
          type: "boolean",
          name: "publie",
          label: "Publier cette section",
          ui: {
            parse: (value) => (value === undefined ? true : value),
            format: (value) => (value === undefined ? true : value),
            description:
              "Affiche cette section sur le site. Désactivé, elle est simplement masquée — votre contenu reste enregistré et réaffichable à tout moment.",
          },
        },
        {
          type: "string",
          name: "titre",
          label: "Titre",
        },
        {
          type: "string",
          name: "intro",
          label: "Introduction",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "lienGoogleDoc",
          label: "Lien Google Doc",
        },
      ],
    },
    {
      type: "string",
      name: "financementUE",
      label: "Mention de financement (Union européenne)",
      description: "Texte légal de cofinancement Erasmus+. À modifier avec prudence — c'est une mention standard.",
      ui: {
        component: "textarea",
      },
    },
  ],
};
