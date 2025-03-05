import type { Collection } from "tinacms";

// Tina Cloud Migration Guide

// PREREQUISITE STEPS:
// 1. Create an account on cloud.tina.io
// 2. Connect your GitHub repository to Tina Cloud
// 3. Retrieve client credentials (clientId and token)
// 4. Create a .env file with the following variables:
//    - TINA_CLIENT_ID=your_client_id
//    - TINA_TOKEN=your_token

// CONFIGURATION NOTES:
// - This configuration is already compatible with Tina Cloud
// - Minimal changes required for migration
// - Ensure you have the latest @tinacms/cli and tinacms packages installed

export const homepageCollection: Collection = {
  label: "📄 Page - Accueil",
  name: "homepage",
  path: "src/content/homepage",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  defaultItem: () => ({
    metadata: {
      title: "Out of the Books | Plateforme collaborative pour l'éducation",
      description: "Contenus experts et événements inspirants pour les acteurs de l'éducation. Rejoignez une communauté de 3000+ innovateurs qui réinventent l'éducation.",
      image: "/images/assets/ootb-social-card.jpg"
    },
    stats: {
      items: [
        { 
          number: "9001", 
          label: "Membres actifs", 
          sublabel: "dans la communauté",
          icon: "tabler:users-group"
        },
        { 
          number: "3000", 
          label: "Participants", 
          sublabel: "au festival annuel",
          icon: "tabler:ticket"
        },
        { 
          number: "80+", 
          label: "Contenus", 
          sublabel: "pédagogiques",
          icon: "tabler:device-tv"
        }
      ]
    },
    featuredContent: {
      title: "Actualités du moment",
      description: "Découvrez nos derniers contenus : articles, podcasts, émissions TV et ressources pédagogiques pour rester à la pointe de l'innovation éducative."
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
          type: "object",
          name: "title",
          label: "Titre",
          fields: [
            {
              type: "string",
              name: "line1",
              label: "Ligne 1",
              required: true,
              default: "La plateforme",
            },
            {
              type: "string",
              name: "line2",
              label: "Ligne 2",
              required: true,
              default: "des pédagogies",
            },
            {
              type: "string",
              name: "line3",
              label: "Ligne 3",
              required: true,
              default: "innovantes !",
            },
          ],
        },
        {
          type: "image",
          name: "image",
          label: "Image mascotte",
          required: true,
        },
        {
          type: "object",
          name: "badges",
          label: "Badges",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.text,
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
              name: "link",
              label: "Lien",
              required: true,
            },
            {
              type: "string",
              name: "variant",
              label: "Variante",
              required: true,
              options: [
                {
                  label: "Festival",
                  value: "festival",
                },
                {
                  label: "Podcast",
                  value: "podcast",
                },
                {
                  label: "Émission",
                  value: "emission",
                },
                {
                  label: "Appel à projets",
                  value: "appel",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "stats",
      label: "Section Statistiques",
      fields: [
        {
          type: "object",
          name: "items",
          label: "Statistiques",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: `${item.number} ${item.label}`,
            }),
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
              label: "Label",
              required: true,
            },
            {
              type: "string",
              name: "sublabel",
              label: "Sous-label",
              required: true,
            },
            {
              type: "string",
              name: "icon",
              label: "Icône",
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "mission",
      label: "Section Mission",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
          default: "Innover pour l'éducation de demain",
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          required: true,
          ui: {
            component: "textarea",
          },
          default: "La mission d'Out of the Books est de connecter et d'inspirer les acteurs du changement éducatif à travers la Francophonie. Nous créons des espaces d'échange et d'apprentissage pour les enseignants, les directions, les parents et tous ceux qui souhaitent réinventer l'éducation.",
        },
        {
          type: "image",
          name: "image",
          label: "Image",
          required: true,
        },
        {
          type: "object",
          name: "features",
          label: "Points clés",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.text,
            }),
          },
          fields: [
            {
              type: "string",
              name: "text",
              label: "Texte",
              required: true,
            },
          ],
        },
        {
          type: "object",
          name: "cta",
          label: "Bouton d'action",
          fields: [
            {
              type: "string",
              name: "text",
              label: "Texte",
              required: true,
              default: "En savoir plus sur notre mission",
            },
            {
              type: "string",
              name: "link",
              label: "Lien",
              required: true,
              default: "/a-propos",
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "featuredContent",
      label: "Section Contenus à la Une",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
          default: "Actualités du moment"
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          required: true,
          default: "Découvrez nos derniers contenus : articles, podcasts, émissions TV et ressources pédagogiques pour rester à la pointe de l'innovation éducative."
        }
      ]
    },
    {
      type: "object",
      name: "premium",
      label: "Section Premium",
      fields: [
        {
          type: "image",
          name: "heroImage",
          label: "Image de la section Premium",
          required: false
        },
        {
          type: "object",
          name: "title",
          label: "Titre principal",
          fields: [
            {
              type: "string",
              name: "firstLine",
              label: "Première ligne",
              required: true,
              default: "Passez au niveau"
            },
            {
              type: "string",
              name: "secondLine",
              label: "Deuxième ligne",
              required: true,
              default: "premium"
            }
          ]
        },
        {
          type: "string",
          name: "intro",
          label: "Introduction",
          required: true,
          ui: {
            component: 'textarea'
          }
        },
        {
          type: "object",
          name: "buttons",
          label: "Boutons",
          fields: [
            {
              type: "object",
              name: "primary",
              label: "Bouton Principal",
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Texte",
                  required: true,
                  default: "Découvrir Premium"
                },
                {
                  type: "string",
                  name: "href",
                  label: "Lien",
                  required: true,
                  default: "/premium"
                },
                {
                  type: "string",
                  name: "icon",
                  label: "Icône",
                  required: true,
                  default: "tabler:crown"
                }
              ]
            },
            {
              type: "object",
              name: "secondary",
              label: "Bouton Secondaire",
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Texte",
                  required: true,
                  default: "Écouter un extrait"
                },
                {
                  type: "string",
                  name: "href",
                  label: "Lien",
                  required: true,
                  default: "/podcast"
                },
                {
                  type: "string",
                  name: "icon",
                  label: "Icône",
                  required: true,
                  default: "tabler:player-play"
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "features",
          label: "Fonctionnalités",
          list: true,
          fields: [
            {
              type: "string",
              name: "text",
              label: "Texte de la fonctionnalité",
              required: true
            }
          ]
        },
        {
          type: "object",
          name: "podcastHighlights",
          label: "Points forts du podcast",
          list: true,
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre",
              required: true
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: 'textarea'
              }
            },
            {
              type: "image",
              name: "image",
              label: "Image du podcast",
              required: false
            },
            {
              type: "string",
              name: "duration",
              label: "Durée",
              required: false
            }
          ]
        }
      ]
    },
    {
      type: "object", 
      name: "newsletter",
      label: "Section Newsletter",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre de la section",
          description: "Titre de la section Newsletter"
        },
        {
          type: "string",
          name: "description",
          label: "Description de la section"
        },
        {
          type: "string",
          name: "placeholder",
          label: "Placeholder de l'input email"
        },
        {
          type: "string",
          name: "buttonText",
          label: "Texte du bouton d'abonnement"
        },
        {
          type: "string",
          name: "badgeText",
          label: "Texte du badge"
        },
        {
          type: "object",
          name: "socialLinks",
          label: "Liens sociaux",
          list: true,
          fields: [
            {
              type: "string",
              name: "name",
              label: "Nom",
              required: true
            },
            {
              type: "string",
              name: "icon",
              label: "Icône",
              required: true
            },
            {
              type: "string",
              name: "href",
              label: "Lien",
              required: true
            },
            {
              type: "string",
              name: "color",
              label: "Couleur",
              required: false,
              default: "text-[--ootb-blue]"
            }
          ]
        }
      ]
    }
  ]
};
