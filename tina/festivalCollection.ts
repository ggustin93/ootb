import type { Collection } from "tinacms";

export const festivalCollection: Collection = {
  name: "festival",
  label: "📄 Page - Festival",
  path: "src/content/festival/tina/",
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
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description SEO",
          description: "Courte description pour les résultats de recherche (150-160 caractères recommandés).",
          ui: {
            component: "textarea",
          },
          required: true,
        },
        {
          type: "image",
          name: "image",
          label: "Image de partage",
          description: "Image utilisée lors du partage sur les réseaux sociaux (1200x630px recommandé).",
        },
      ],
    },
    {
      type: "object",
      name: "hero",
      label: "Section Hero",
      ui: {
        itemProps: (_item) => {
          return { label: "Section d'en-tête" };
        },
      },
      fields: [
        {
          type: "image",
          name: "logo",
          label: "Logo du festival",
          required: true,
        },
        {
          type: "image",
          name: "heroImage",
          label: "Image d'arrière-plan",
          required: true,
        },
        {
          type: "string",
          name: "date",
          label: "Date du festival",
          required: true,
        },
        {
          type: "string",
          name: "location",
          label: "Lieu du festival",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description courte",
          ui: {
            component: "textarea",
          },
          required: true,
        },
      ],
    },
    {
      type: "object",
      name: "about",
      label: "Section À propos",
      ui: {
        itemProps: (_item) => {
          return { label: "Section de présentation" };
        },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: {
            component: "textarea",
          },
          required: true,
        },
        {
          type: "string",
          name: "videoId",
          label: "ID de la vidéo YouTube",
          required: true,
        },
        {
          type: "string",
          name: "videoTitle",
          label: "Titre de la vidéo",
          required: true,
        },
        {
          type: "string",
          name: "paragraphs",
          label: "Paragraphes",
          list: true,
          ui: {
            component: "textarea",
          },
          required: true,
        },
      ],
    },
    {
      type: "object",
      name: "gallery",
      label: "Galerie photos",
      ui: {
        itemProps: (_item) => {
          return { label: "Galerie d'images" };
        },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: {
            component: "textarea",
          },
          required: true,
        },
        {
          type: "object",
          name: "photos",
          label: "Photos",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.title || "Photo" };
            },
          },
          fields: [
            {
              type: "image",
              name: "src",
              label: "Image",
              required: true,
            },
            {
              type: "string",
              name: "alt",
              label: "Texte alternatif",
              required: true,
            },
            {
              type: "string",
              name: "title",
              label: "Titre",
              required: true,
            }
          ],
        },
      ],
    },
    {
      type: "object",
      name: "stats",
      label: "Statistiques",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.label || "Statistique" };
        },
      },
      fields: [
        {
          type: "string",
          name: "number",
          label: "Nombre",
          required: true,
        },
        {
          type: "string",
          name: "label",
          label: "Libellé",
          required: true,
        },
        {
          type: "string",
          name: "icon",
          label: "Icône (format tabler:nom-icone)",
          required: true,
        },
      ],
    },
    {
      type: "object",
      name: "programme",
      label: "Programme",
      ui: {
        itemProps: (_item) => {
          return { label: "Section programme" };
        },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: {
            component: "textarea",
          },
          required: true,
        }
      ],
    },
    {
      type: "object",
      name: "themes",
      label: "Thèmes",
      ui: {
        itemProps: (_item) => {
          return { label: "Thématiques du festival" };
        },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: {
            component: "textarea",
          },
          required: true,
        },
        {
          type: "object",
          name: "liste",
          label: "Liste des thèmes",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.title || "Thème" };
            },
          },
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre",
              required: true,
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              ui: {
                component: "textarea",
              },
              required: true,
            },
            {
              type: "string",
              name: "icon",
              label: "Icône (format tabler:nom-icone)",
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "accessibility",
      label: "Accessibilité",
      ui: {
        itemProps: (_item) => {
          return { label: "Informations pratiques" };
        },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: {
            component: "textarea",
          },
          required: true,
        },
        {
          type: "object",
          name: "sections",
          label: "Sections d'informations",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.title || "Section" };
            },
          },
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre",
              required: true,
            },
            {
              type: "string",
              name: "icon",
              label: "Icône (format tabler:nom-icone)",
              required: true,
            },
            {
              type: "string",
              name: "lieu",
              label: "Nom du lieu",
            },
            {
              type: "string",
              name: "adresse",
              label: "Adresse",
            },
            {
              type: "string",
              name: "mapLink",
              label: "Lien Google Maps",
            },
            {
              type: "object",
              name: "infos",
              label: "Informations",
              list: true,
              ui: {
                itemProps: (item) => {
                  return { label: item?.text || "Information" };
                },
              },
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Texte",
                  required: true,
                },
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (format tabler:nom-icone)",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "contact",
          label: "Contact",
          fields: [
            {
              type: "string",
              name: "text",
              label: "Texte",
              required: true,
            },
            {
              type: "string",
              name: "email",
              label: "Email de contact",
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "partenaires",
      label: "Partenaires",
      ui: {
        itemProps: (_item) => {
          return { label: "Section partenaires" };
        },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: {
            component: "textarea",
          },
          required: true,
        },
        {
          type: "object",
          name: "liste",
          label: "Liste des partenaires",
          list: true,
          ui: {
            itemProps: (_item) => {
              return { label: "Partenaire" };
            },
          },
          fields: [
            {
              type: "image",
              name: "logo",
              label: "Logo",
              required: true,
            },
          ],
        },
      ],
    },
  ],
}; 