import type { Collection } from "tinacms";

export const navigationCollection: Collection = {
  label: "🧭 Navigation",
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
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (optionnel)",
                  description: "Format Tabler, ex. tabler:ticket, tabler:microphone, tabler:heart-handshake",
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
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (optionnel)",
                  description: "Format Tabler, ex. tabler:ticket, tabler:microphone, tabler:heart-handshake",
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
              label: item.mode === 'festival' ? 'Mode Festival' : item.mode === 'community' ? 'Mode Communauté' : 'Mode Personnalisé',
            }),
            max: 1,
            description: "Configuration du bouton principal du header avec toggle intelligent"
          },
          fields: [
            {
              type: "string",
              name: "mode",
              label: "Mode du bouton",
              description: "Choisir l'action principale du header",
              options: [
                { label: "Festival - Prendre votre ticket", value: "festival" },
                { label: "Communauté - Rejoindre la communauté", value: "community" },
                { label: "Personnalisé - Configuration libre", value: "custom" }
              ],
              required: true,
            },
            {
              type: "object",
              name: "festivalButton",
              label: "Configuration Bouton Festival",
              ui: { 
                component: "group", 
                description: "Configuration pour la période du festival (billetterie)" 
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
                  description: "URL vers la billetterie",
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
            {
              type: "object",
              name: "communityButton",
              label: "Configuration Bouton Communauté",
              ui: { 
                component: "group", 
                description: "Configuration pour rejoindre la communauté" 
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
                  description: "Ancre vers la section rejoindre ou autre",
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
            {
              type: "object",
              name: "customButton",
              label: "Configuration Bouton Personnalisé",
              ui: { 
                component: "group", 
                description: "Configuration libre pour un bouton personnalisé" 
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
                  description: "URL ou ancre personnalisée",
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