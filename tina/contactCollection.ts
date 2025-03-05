import type { Collection } from "tinacms";

export const contactCollection: Collection = {
  name: "contact",
  label: "📄 Page - Contact",
  path: "src/content/contact",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  defaultItem: () => ({
    metadata: {
      title: "Contact | Out of the Books",
      description: "Contactez l'équipe d'Out of the Books pour toute question concernant nos événements, nos contenus ou nos partenariats."
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