import { Collection } from "tinacms";

interface SystemValues {
  triggerDeployment?: boolean;
  deploymentTimestamp?: string;
}

interface MinimalSiteSettingsValues {
  system?: SystemValues;
  [key: string]: unknown; // Index signature with unknown
}

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
    beforeSubmit: async ({ values }: { values: MinimalSiteSettingsValues }) => {
      if (values.system && typeof values.system.triggerDeployment === 'boolean') {
        if (values.system.triggerDeployment) {
          values.system.deploymentTimestamp = new Date().toISOString();
          values.system.triggerDeployment = false;
        }
      }
      return values;
    }
  },
  defaultItem: () => ({
    seo: {
      siteName: "Out of the Books",
      titleTemplate: "%s | Out of the Books",
      defaultTitle: "Out of the Books | Plateforme collaborative pour l'éducation",
      defaultDescription: "Out of the Books ASBL : l'éducation et le bien-être de l'enfant au cœur des priorités. Une plateforme collaborative pour transformer l'éducation en Belgique francophone.",
      language: "fr",
      defaultSocialImage: "/images/assets/ootb-social-card.jpg"
    },
    system: {
      deploymentTimestamp: new Date().toISOString()
    },
    announcement: {
      enabled: true,
      color: "#e7461c",
      content: {
        badge: "NOUVEAU",
        text: "Le Festival Out of the Books revient en 2025 !",
        link: {
          text: "En savoir plus »",
          href: "/festival"
        }
      },
      showOnPages: ["all"],
      hideOnPages: ["festival"]
    }
  }),
  fields: [
    {
      type: "object",
      name: "seo",
      label: "Paramètres SEO globaux",
      description: "Configuration SEO globale pour tout le site",
      fields: [
        {
          type: "string",
          name: "siteName",
          label: "Nom du site",
          description: "Nom utilisé dans les balises meta et le titre des pages",
          required: true,
        },
        {
          type: "string",
          name: "titleTemplate",
          label: "Template de titre",
          description: "Format du titre des pages. Utilisez %s pour l'emplacement du titre spécifique de la page",
          required: true,
        },
        {
          type: "string",
          name: "defaultTitle",
          label: "Titre par défaut",
          description: "Titre utilisé quand aucun titre spécifique n'est fourni",
          required: true,
        },
        {
          type: "string",
          name: "defaultDescription",
          label: "Description par défaut",
          description: "Description utilisée quand aucune description spécifique n'est fournie",
          required: true,
          ui: {
            component: "textarea"
          }
        },
        {
          type: "string",
          name: "language",
          label: "Langue principale",
          description: "Code de langue principal du site (ex: fr, en)",
          required: true,
        },
        {
          type: "image",
          name: "defaultSocialImage",
          label: "Image sociale par défaut",
          description: "Image utilisée pour les partages sociaux quand aucune image spécifique n'est fournie (1200x630px recommandé)",
          required: false,
        }
      ]
    },
    {
      type: "object",
      name: "system",
      label: "Actions système",
      description: "Options de maintenance du site",
      fields: [
        {
          type: "boolean",
          name: "triggerDeployment",
          label: "Forcer le redéploiement du site",
          description: "⚡ Activation = mise à jour complète du site",
          ui: {
            description: "Activez cette option et sauvegardez pour forcer un redéploiement complet du site. Utilisez en cas de problème d'affichage ou pour appliquer plusieurs modifications récentes.",
          }
        },
        {
          type: "string",
          name: "deploymentTimestamp",
          label: "Horodatage technique",
          ui: {
            component: "hidden"
          }
        }
      ]
    },
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
    }
  ],
}; 