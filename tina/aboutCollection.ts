import type { Collection } from "tinacms";

export const aboutCollection: Collection = {
  name: "about",
  label: "Page - À propos",
  path: "src/content/about",
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
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre de la page",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description SEO",
          ui: {
            component: "textarea",
          },
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
          name: "quoteColor",
          label: "Couleur de la citation",
          ui: {
            component: "color",
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
          type: "string",
          name: "titleColor",
          label: "Couleur du titre",
          ui: {
            component: "color",
          },
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
          name: "titleColor",
          label: "Couleur du titre",
          ui: {
            component: "color",
          },
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
      ],
    },
    {
      type: "string",
      name: "actions",
      label: "Nos actions",
      list: true,
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
          ui: {
            component: "textarea",
          },
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
          name: "titleColor",
          label: "Couleur du titre",
          ui: {
            component: "color",
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
      name: "partenaires",
      label: "Nos partenaires",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
        },
        {
          type: "string",
          name: "titleColor",
          label: "Couleur du titre",
          ui: {
            component: "color",
          },
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