import { Collection } from "tinacms";

export const siteSettingsCollection: Collection = {
  label: "⚙️ Paramètres généraux",
  name: "siteSettings",
  path: "src/content/site",
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
      name: "announcement",
      label: "Annonce",
      description: "Configuration de l'annonce en haut de page",
      fields: [
        {
          type: "boolean",
          name: "enabled",
          label: "Activer l'annonce",
          description: "Activer ou désactiver l'affichage de l'annonce",
        },
        {
          type: "string",
          name: "color",
          label: "Couleur de l'annonce",
          description: "Choisissez la couleur de fond de l'annonce",
          options: [
            { label: "Orange (Festival)", value: "#e7461c" },
            { label: "Violet", value: "#921e6d" },
            { label: "Vert", value: "#40ad50" },
            { label: "Bleu", value: "#0890bd" },
            { label: "Turquoise", value: "#69b29e" },
            { label: "Jaune", value: "#f9b004" },
            { label: "Gris (Actualité)", value: "#4B5563" },
            { label: "Bleu Facebook (Live)", value: "#1877F2" }
          ],
        },
        {
          type: "object",
          name: "content",
          label: "Contenu de l'annonce",
          fields: [
            {
              type: "string",
              name: "badge",
              label: "Badge",
              description: "Texte court affiché dans le badge (ex: NOUVEAU)",
            },
            {
              type: "string",
              name: "text",
              label: "Texte",
              description: "Texte principal de l'annonce",
            },
            {
              type: "object",
              name: "link",
              label: "Lien",
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Texte du lien",
                },
                {
                  type: "string",
                  name: "href",
                  label: "URL du lien",
                },
              ],
            },
          ],
        },
        {
          type: "string",
          name: "showOnPages",
          label: "Afficher sur les pages",
          description: "Liste des pages où l'annonce sera affichée. Utilisez 'all' pour toutes les pages. Exemples: home, about, contact, festival",
          list: true,
        },
        {
          type: "string",
          name: "hideOnPages",
          label: "Masquer sur les pages",
          description: "Liste des pages où l'annonce ne sera PAS affichée (prioritaire sur showOnPages). Exemples: festival, contact",
          list: true,
        },
      ],
    },
  ],
}; 