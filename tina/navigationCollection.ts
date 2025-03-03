import type { Collection } from "tinacms";

export const navigationCollection: Collection = {
  label: "Navigation",
  name: "navigation",
  path: "src/content/navigation",
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
      name: "header",
      label: "Navigation Header",
      fields: [
        {
          type: "object",
          name: "links",
          label: "Liens principaux (Desktop)",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.text || "Nouveau lien",
            }),
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
              name: "href",
              label: "Lien",
              description: "Utilisez '/page' pour les liens internes ou 'https://...' pour les liens externes",
              required: true,
            },
            {
              type: "object",
              name: "links",
              label: "Sous-liens (Menu déroulant)",
              list: true,
              ui: {
                itemProps: (item) => ({
                  label: item.text || "Nouveau sous-lien",
                }),
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
                  name: "href",
                  label: "Lien",
                  description: "Utilisez '/page' pour les liens internes ou 'https://...' pour les liens externes",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "mobileLinks",
          label: "Liens mobiles",
          list: true,
          fields: [
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              ui: {
                itemProps: (item) => ({
                  label: item.text || "Nouveau lien mobile",
                }),
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
                  name: "href",
                  label: "Lien",
                  description: "Utilisez '/page' pour les liens internes ou 'https://...' pour les liens externes",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "actions",
          label: "Boutons d'action",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.text || "Nouveau bouton",
            }),
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
              name: "href",
              label: "Lien",
              description: "Utilisez '/page' pour les liens internes ou 'https://...' pour les liens externes",
              required: true,
            },
            {
              type: "string",
              name: "variant",
              label: "Variante",
              options: [
                { label: "Primaire", value: "primary" },
                { label: "Secondaire", value: "secondary" },
                { label: "Contour", value: "outline" },
              ],
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "footer",
      label: "Navigation Footer",
      fields: [
        {
          type: "string",
          name: "footerDescription",
          label: "Description du footer",
          description: "Texte descriptif qui apparaît sous le logo dans le footer",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "object",
          name: "links",
          label: "Colonnes de liens",
          description: "Vous pouvez réorganiser ces colonnes par glisser-déposer pour changer leur ordre d'affichage",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.title || "Nouvelle colonne",
            }),
          },
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre de la colonne",
              required: true,
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              ui: {
                itemProps: (item) => ({
                  label: item.text || "Nouveau lien",
                }),
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
                  name: "href",
                  label: "Lien",
                  description: "Utilisez '/page' pour les liens internes ou 'https://...' pour les liens externes",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "mobileLinks",
          label: "Liens mobiles (Footer)",
          list: true,
          fields: [
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              ui: {
                itemProps: (item) => ({
                  label: item.text || "Nouveau lien mobile",
                }),
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
                  name: "href",
                  label: "Lien",
                  description: "Utilisez '/page' pour les liens internes ou 'https://...' pour les liens externes",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "legalLinks",
          label: "Liens légaux",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.text || "Nouveau lien légal",
            }),
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
              name: "href",
              label: "Lien",
              description: "Utilisez '/page' pour les liens internes ou 'https://...' pour les liens externes",
              required: true,
            },
          ],
        },
        {
          type: "object",
          name: "socialLinks",
          label: "Réseaux sociaux",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.ariaLabel || "Nouveau réseau social",
            }),
          },
          fields: [
            {
              type: "string",
              name: "ariaLabel",
              label: "Nom du réseau (pour l'accessibilité)",
              required: true,
            },
            {
              type: "string",
              name: "icon",
              label: "Icône Tabler",
              description: "Format: tabler:brand-facebook, tabler:brand-instagram, etc.",
              required: true,
            },
            {
              type: "string",
              name: "href",
              label: "Lien",
              required: true,
            },
          ],
        },
        {
          type: "string",
          name: "footNote",
          label: "Note de bas de page",
          description: "Copyright et année, ex: Out of the Books ASBL © 2025",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "object",
          name: "ecoDesignBadge",
          label: "Badge éco-conception",
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
              label: "Icône",
              required: true,
            },
            {
              type: "string",
              name: "details",
              label: "Détails",
              required: true,
            },
            {
              type: "string",
              name: "href",
              label: "Lien",
              required: true,
            },
          ],
        },
      ],
    },
  ],
}; 