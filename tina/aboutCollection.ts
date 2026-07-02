import type { Collection } from "tinacms";

export const aboutCollection: Collection = {
  name: "about",
  label: "📄 Page - À propos",
  path: "src/content/about",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  defaultItem: () => ({
    metadata: {
      title: "À propos | Out of the Books",
      description: "Découvrez l'équipe et la mission d'Out of the Books, une ASBL dédiée à l'innovation pédagogique et au bien-être des enfants en Belgique francophone."
    }
  }),
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
          type: "image",
          name: "logo",
          label: "Logo",
        },
        {
          type: "image",
          name: "heroImage",
          label: "Image d'arrière-plan",
        },
        {
          type: "string",
          name: "quote",
          label: "Citation principale",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "scrollLabel",
          label: "Texte du bouton de défilement",
        },
      ],
    },
    {
      type: "object",
      name: "quiSommesNous",
      label: "Qui sommes-nous",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
        },
        {
          type: "image",
          name: "image",
          label: "Image",
        },
        {
          type: "string",
          name: "imageAlt",
          label: "Texte alternatif de l'image",
        },
        {
          type: "string",
          name: "paragraphs",
          label: "Paragraphes",
          list: true,
        },
      ],
    },
    {
      type: "object",
      name: "vision",
      label: "Notre vision",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
        },
        {
          type: "string",
          name: "quote",
          label: "Citation",
          ui: {
            component: "textarea",
          },
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
          name: "actionsTitle",
          label: "Titre de la liste d'actions",
        },
      ],
    },
    {
      type: "string",
      name: "actions",
      label: "Nos actions",
      list: true,
    },
    {
      type: "string",
      name: "missionsTitle",
      label: "Titre de la section Missions",
    },
    {
      type: "string",
      name: "valeursTitle",
      label: "Titre de la section Valeurs",
    },
    {
      type: "object",
      name: "missions",
      label: "Nos missions",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.title || "Nouvelle mission" };
        },
      },
      fields: [
        {
          type: "string",
          name: "icon",
          label: "Icône (nom Tabler)",
        },
        {
          type: "string",
          name: "title",
          label: "Titre",
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: { component: "textarea" },
        },
      ],
    },
    {
      type: "object",
      name: "valeurs",
      label: "Nos valeurs",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.title || "Nouvelle valeur" };
        },
      },
      fields: [
        {
          type: "string",
          name: "icon",
          label: "Icône (nom Tabler)",
        },
        {
          type: "string",
          name: "title",
          label: "Titre",
        },
        {
          type: "rich-text",
          name: "description",
          label: "Description",
        },
      ],
    },
    {
      type: "object",
      name: "equipe",
      label: "Notre équipe",
      fields: [
        {
          type: "string",
          name: "title",
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
        {
          type: "object",
          name: "membres",
          label: "Membres",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.name || "Nouveau membre" };
            },
          },
          fields: [
            {
              type: "string",
              name: "name",
              label: "Nom",
            },
            {
              type: "string",
              name: "role",
              label: "Rôle",
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
              type: "image",
              name: "photo",
              label: "Photo",
            },
            {
              type: "object",
              name: "contact",
              label: "Contact",
              fields: [
                {
                  type: "string",
                  name: "email",
                  label: "Email",
                },
                {
                  type: "string",
                  name: "phone",
                  label: "Téléphone",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "conseilAdministration",
      label: "Conseil d'Administration",
      fields: [
        {
          type: "string",
          name: "title",
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
        {
          type: "object",
          name: "membres",
          label: "Membres",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.name || "Nouveau membre" };
            },
          },
          fields: [
            {
              type: "image",
              name: "photo",
              label: "Photo",
            },
            {
              type: "string",
              name: "name",
              label: "Nom",
            },
            {
              type: "string",
              name: "role",
              label: "Fonction (optionnel)",
              description: "Ex. Président·e, Trésorier·ère, Secrétaire…",
            },
            {
              type: "string",
              name: "linkedinUrl",
              label: "Lien LinkedIn",
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "partenaires",
      label: "Nos partenaires",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
        },
        {
          type: "object",
          name: "liste",
          label: "Liste des partenaires",
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
              name: "lien",
              label: "Lien",
            },
          ],
        },
      ],
    },
  ],
}; 