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
      label: "Métadonnées",
      ui: {
        itemProps: (_item) => {
          return { label: "Métadonnées SEO" };
        },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre SEO",
          description: "Titre qui apparaît dans les résultats de recherche (50-60 caractères). Ne pas inclure '| Out of the Books' car il sera ajouté automatiquement.",
          required: false,
        },
        {
          type: "string",
          name: "description",
          label: "Description SEO",
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
      label: "Section Hero",
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
          label: "Intro courte (héro)",
          description:
            "Courte phrase affichée sous le sous-titre, dans le héro. Idéalement 1 à 2 lignes.",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "descriptif",
          label: "Descriptif (section « Le projet »)",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "image",
          name: "heroImage",
          label: "Image principale (héro)",
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
      label: "Le projet (thématiques & ambition)",
      fields: [
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
          name: "ambition",
          label: "Ambition commune",
          ui: {
            component: "textarea",
          },
        },
      ],
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
          label: "Lien vers le site (repli si aucun lien ci-dessous)",
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
              "✅ ACTIVÉ = section visible sur le site\n⚠️ DÉSACTIVÉ = section masquée",
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
                  "✅ ACTIVÉ = podcasts visibles\n⚠️ DÉSACTIVÉ = podcasts masqués (même s'il en reste)",
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
                  "✅ ACTIVÉ = vidéos visibles\n⚠️ DÉSACTIVÉ = vidéos masquées (même s'il en reste)",
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
                  "✅ ACTIVÉ = fiches visibles\n⚠️ DÉSACTIVÉ = fiches masquées (même s'il en reste)",
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
                  label: "Cover",
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
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
              "✅ ACTIVÉ = section visible sur le site\n⚠️ DÉSACTIVÉ = section masquée",
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
  ],
};
