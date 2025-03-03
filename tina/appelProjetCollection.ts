import type { Collection } from "tinacms";

export const appelProjetCollection: Collection = {
  label: "📄 Page - Appel à projets",
  name: "appel_projet",
  path: "src/content/appel_projet",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  defaultItem: () => ({
    metadata: {
      title: "Appel à projets | Out of the Books",
      description: "Partagez votre expérience pédagogique innovante et inspirez vos pairs lors du Festival Out of the Books 2024.",
      canonical: "https://outofthebooks.org/appel-a-projets"
    }
  }),
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
          required: true,
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "canonical",
          label: "URL canonique",
          required: true,
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
          required: true,
        },
        {
          type: "image",
          name: "heroImage",
          label: "Image d'en-tête",
          required: true,
        },
        {
          type: "string",
          name: "quote",
          label: "Citation principale",
          required: true,
          ui: {
            component: "textarea",
          },
        },
        {
          type: "object",
          name: "buttons",
          label: "Boutons",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.label,
            }),
          },
          fields: [
            {
              type: "string",
              name: "href",
              label: "Lien",
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
              name: "label",
              label: "Texte",
              required: true,
            },
            {
              type: "string",
              name: "variant",
              label: "Variante",
              required: true,
              options: [
                {
                  label: "Primaire",
                  value: "primary",
                },
                {
                  label: "Secondaire",
                  value: "secondary",
                },
                {
                  label: "Contour bleu",
                  value: "outline-blue",
                },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "scroll",
          label: "Défilement",
          fields: [
            {
              type: "string",
              name: "targetId",
              label: "ID de la cible",
              required: true,
            },
            {
              type: "string",
              name: "label",
              label: "Texte",
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "criteres",
      label: "Section Critères",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
        },
        {
          type: "image",
          name: "backgroundImage",
          label: "Image d'arrière-plan",
          required: true,
        },
        {
          type: "object",
          name: "items",
          label: "Critères",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.title,
            }),
          },
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre",
              required: true,
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
            },
          ],
        },
        {
          type: "image",
          name: "inspirationImage",
          label: "Image d'inspiration",
          required: true,
        },
      ],
    },
    {
      type: "object",
      name: "processus",
      label: "Section Processus",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          required: true,
        },
        {
          type: "object",
          name: "steps",
          label: "Étapes",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item.title,
            }),
          },
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre",
              required: true,
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
            },
          ],
        },
        {
          type: "string",
          name: "videoUrl",
          label: "URL de la vidéo (Cloudinary)",
          required: true,
          description: "Format: https://res.cloudinary.com/dza0sg4uf/video/upload/f_auto:video,q_auto/v1/OOTB/nom-video",
        },
      ],
    },
    {
      type: "object",
      name: "formulaire",
      label: "Section Formulaire",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre",
          required: true,
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          required: true,
        },
        {
          type: "object",
          name: "personal",
          label: "Informations personnelles",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre de la section",
              required: true,
            },
            {
              type: "string",
              name: "subtitle",
              label: "Sous-titre",
              required: true,
            },
            {
              type: "string",
              name: "firstName",
              label: "Label Prénom",
              required: true,
            },
            {
              type: "string",
              name: "lastName",
              label: "Label Nom",
              required: true,
            },
            {
              type: "string",
              name: "email",
              label: "Label Email",
              required: true,
            },
            {
              type: "string",
              name: "phone",
              label: "Label Téléphone",
              required: true,
            },
          ],
        },
        {
          type: "object",
          name: "project",
          label: "Informations du projet",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre de la section",
              required: true,
            },
            {
              type: "string",
              name: "subtitle",
              label: "Sous-titre",
              required: true,
            },
            {
              type: "string",
              name: "projectTitle",
              label: "Label Titre du projet",
              required: true,
            },
            {
              type: "string",
              name: "projectTitlePlaceholder",
              label: "Placeholder Titre du projet",
              required: true,
            },
            {
              type: "string",
              name: "teachingType",
              label: "Label Type d'enseignement",
              required: true,
            },
            {
              type: "object",
              name: "teachingTypes",
              label: "Types d'enseignement",
              list: true,
              ui: {
                itemProps: (item) => ({
                  label: item.label,
                }),
              },
              fields: [
                {
                  type: "string",
                  name: "id",
                  label: "ID",
                  required: true,
                },
                {
                  type: "string",
                  name: "label",
                  label: "Label",
                  required: true,
                },
              ],
            },
            {
              type: "string",
              name: "section",
              label: "Label Section",
              required: true,
            },
            {
              type: "object",
              name: "sections",
              label: "Sections",
              list: true,
              ui: {
                itemProps: (item) => ({
                  label: item.label,
                }),
              },
              fields: [
                {
                  type: "string",
                  name: "id",
                  label: "ID",
                  required: true,
                },
                {
                  type: "string",
                  name: "label",
                  label: "Label",
                  required: true,
                },
              ],
            },
            {
              type: "string",
              name: "description",
              label: "Label Description",
              required: true,
            },
            {
              type: "string",
              name: "descriptionPlaceholder",
              label: "Placeholder Description",
              required: true,
            },
            {
              type: "string",
              name: "skills",
              label: "Label Compétences",
              required: true,
            },
            {
              type: "string",
              name: "skillsPlaceholder",
              label: "Placeholder Compétences",
              required: true,
            },
            {
              type: "string",
              name: "results",
              label: "Label Résultats",
              required: true,
            },
            {
              type: "string",
              name: "resultsPlaceholder",
              label: "Placeholder Résultats",
              required: true,
            },
            {
              type: "string",
              name: "links",
              label: "Label Liens",
              required: true,
            },
            {
              type: "string",
              name: "linksPlaceholder",
              label: "Placeholder Liens",
              required: true,
            },
            {
              type: "string",
              name: "linksHelp",
              label: "Texte d'aide Liens",
              required: true,
            },
            {
              type: "string",
              name: "submitButton",
              label: "Texte du bouton de soumission",
              required: true,
            },
          ],
        },
      ],
    },
  ],
}; 