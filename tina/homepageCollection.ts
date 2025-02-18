import type { Collection } from "tinacms";

export const homepageCollection: Collection = {
  label: "Page d'accueil",
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
    }
  ],
}
