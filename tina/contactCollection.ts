import type { Collection } from "tinacms";

export const contactCollection: Collection = {
  name: "contact",
  label: "Contact",
  path: "src/content/contact",
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
          type: "string",
          name: "title",
          label: "Titre",
        },
        {
          type: "string",
          name: "subtitle",
          label: "Sous-titre",
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
      name: "form",
      label: "Formulaire",
      fields: [
        {
          type: "object",
          name: "name",
          label: "Champ Nom",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé",
            },
            {
              type: "string",
              name: "placeholder",
              label: "Texte d'exemple",
            },
          ],
        },
        {
          type: "object",
          name: "email",
          label: "Champ Email",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé",
            },
            {
              type: "string",
              name: "placeholder",
              label: "Texte d'exemple",
            },
          ],
        },
        {
          type: "object",
          name: "message",
          label: "Champ Message",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé",
            },
            {
              type: "string",
              name: "placeholder",
              label: "Texte d'exemple",
            },
          ],
        },
        {
          type: "string",
          name: "button",
          label: "Texte du bouton",
        },
      ],
    },
    {
      type: "object",
      name: "contactInfo",
      label: "Informations de contact",
      fields: [
        {
          type: "object",
          name: "phone",
          label: "Téléphone",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre",
            },
            {
              type: "string",
              name: "value",
              label: "Numéro de téléphone",
            },
          ],
        },
        {
          type: "object",
          name: "email",
          label: "Email",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre",
            },
            {
              type: "string",
              name: "value",
              label: "Adresse email",
            },
          ],
        },
        {
          type: "object",
          name: "address",
          label: "Adresse",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre",
            },
            {
              type: "string",
              name: "value",
              label: "Adresse postale",
              ui: {
                component: "textarea",
              },
            },
          ],
        },
      ],
    },
  ],
}; 