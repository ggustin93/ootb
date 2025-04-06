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
    beforeSubmit: async ({ values }) => {
      if (values.system?.triggerDeployment) {
        values.system.deploymentTimestamp = new Date().toISOString();
        values.system.triggerDeployment = false;
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
    festival: {
      showUnpublishedEvents: false,
      ticketing: {
        modalText: "Le Festival Out of the Books est en attente de la reconnaissance de l'IFPC. Si vous êtes enseignant-e, nous vous invitons à consulter cette page ultérieurement. Merci pour votre compréhension.\n\nSinon, utilisez notre billetterie générale Weezevent en cliquant ci-dessous.",
        ifpcButtonLabel: "Billetterie IFPC",
        ifpcButtonUrl: "https://ifpc-fwb.be",
        weezeventButtonLabel: "Billetterie générale",
        weezeventButtonUrl: "https://widget.weezevent.com/ticket/E1310259/?code=56689&locale=fr-FR&width_auto=1&color_primary=00AEEF"
      },
      programLink: {
        enabled: false,
        text: "Voir le programme complet",
        url: "#"
      }
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
      name: "festival",
      label: "Paramètres du Festival",
      description: "Configuration spécifique au festival",
      fields: [
        {
          type: "boolean",
          name: "showUnpublishedEvents",
          label: "Afficher les événements non publiés",
          description: "⚠️ ATTENTION : Uniquement pour les tests ! Activez cette option pour afficher temporairement les événements en cours de validation (statut différent de 'Publié').",
          ui: {
            description: "Cette option permet de prévisualiser les événements avant publication. Désactivez-la avant la mise en ligne officielle du programme."
          }
        },
        {
          type: "object",
          name: "ticketing",
          label: "Billetterie",
          description: "Configuration de la billetterie du festival",
          fields: [
            {
              type: "string",
              name: "modalText",
              label: "Texte du modal de billetterie",
              description: "Texte affiché dans la fenêtre de réservation des tickets",
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "string",
              name: "ifpcButtonLabel",
              label: "Texte du bouton IFPC",
              description: "Libellé du bouton pour la billetterie IFPC",
              required: true,
            },
            {
              type: "string",
              name: "ifpcButtonUrl",
              label: "URL du bouton IFPC",
              description: "Lien pour la billetterie IFPC",
              required: true,
            },
            {
              type: "string",
              name: "weezeventButtonLabel",
              label: "Texte du bouton Weezevent",
              description: "Libellé du bouton pour la billetterie Weezevent",
              required: true,
            },
            {
              type: "string",
              name: "weezeventButtonUrl",
              label: "URL du bouton Weezevent",
              description: "Lien pour la billetterie Weezevent",
              required: true,
            }
          ],
        },
        {
          type: "object",
          name: "programLink",
          label: "Lien vers le programme complet",
          description: "Configuration du bouton pour accéder au programme complet",
          fields: [
            {
              type: "boolean",
              name: "enabled",
              label: "Activer le bouton",
              description: "Activer ou désactiver l'affichage du bouton 'Voir le programme complet'",
            },
            {
              type: "string",
              name: "text",
              label: "Texte du bouton",
              description: "Texte affiché sur le bouton (ex: Voir le programme complet)",
            },
            {
              type: "string",
              name: "url",
              label: "URL du programme",
              description: "Lien vers le programme complet (PDF, page web, etc.)",
            },
          ],
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