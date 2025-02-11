import { defineConfig } from "tinacms";

const CONTENT_TYPES = {
  actualite: "Actualités",
  fiche: "Fiches", 
  live: "Lives",
  podcast: "Podcasts",
  tv: "TV",
  premium: "Premium",
} as const;

export default defineConfig({
  branch: "main",
  clientId: "local-dev",
  token: "local-dev-token",
  disableImportAliasWarnings: true,

  // Activation du mode preview
  preview: {
    hosts: ['localhost:4321'],
    previewTimeout: 3000,
  },

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      publicFolder: "src/assets",
      mediaRoot: "images",
    },
  },

  search: {
    tina: {
      indexerToken: "",  
      stopwordLanguages: ['fra'],
    },
  },

  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "src/content/post",
        format: "mdx",
        mdx: {
          disableImportAliasWarnings: true,
          resolve: {
            '~/components/mdx': './src/components/mdx'
          }
        },
        ui: {
          itemTable: {
            defaultSort: {
              key: "_values.publishDate",
              direction: "desc"
            },
            tableColumns: [
              {
                key: "_values.published",
                name: "Statut",
                render: (value) => value ? "✅ Publié" : "⚠️ Brouillon"
              },
              {
                key: "_values.publishDate",
                name: "Date de publication",
                render: (value) => {
                  if (!value) return '';
                  return new Date(value).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  });
                }
              },
              {
                key: "_values.title",
                name: "Titre"
              },
              {
                key: "_values.category",
                name: "Type",
                render: (value) => CONTENT_TYPES[value] || value
              }
            ]
          },
          sortable: {
            fields: [
              {
                key: "_values.publishDate",
                name: "Date de publication"
              },
              {
                key: "_values.title",
                name: "Titre"
              },
              {
                key: "_values.category",
                name: "Type de contenu"
              },
              {
                key: "_values.published",
                name: "Statut"
              }
            ]
          },
          allowedActions: {
            create: true,
            delete: true,
            update: true,
            save: true,
          },
          filename: {
            readonly: false,
            slugify: (values) => {
              return `${values?.title
                ?.toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^a-zA-Z0-9-]/g, '')}`;
            },
          },
          // Commenté temporairement pour tester la sauvegarde du MDX
          // beforeSubmit: ({ form, formState }) => {
          //   const content = formState.values.body;
          //   const cleanedContent = content.replace(
          //     /import\s*{[^}]+}\s*from\s*['"]~\/components\/mdx['"];?\n?/g, 
          //     ''
          //   );
          //   form.mutators.setValue('body', cleanedContent);
          //   return formState;
          // }
        },
        fields: [
          {
            type: "boolean",
            name: "published",
            label: "Publié",
            description: "Activer pour rendre le contenu visible sur le site",
            required: true,
            ui: {
              defaultValue: false,
            }
          },
          {
            type: "string",
            name: "title",  
            label: "Titre",
            required: true,
            isTitle: true,
            searchable: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description", 
            required: true,
            ui: {
              component: "textarea",
            },
            searchable: true,
          },
          {
            type: "datetime",
            name: "publishDate",
            label: "Date de publication",
            required: true,
            ui: {
              dateFormat: "DD/MM/YYYY",
            },
          },
          {
            type: "string", 
            name: "category",
            label: "Catégorie",
            required: true,
            options: Object.entries(CONTENT_TYPES).map(([value, label]) => ({
              value,
              label, 
            })),
            searchable: true,
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
            ui: {
              component: "tags",
            },
            searchable: true,
          },
          {
            type: "image",
            name: "image",
            label: "Image principale",
            required: true,
          },
          {
            type: "string",
            name: "videoUrl",
            label: "URL de la vidéo YouTube",
            description: "URL de la vidéo YouTube (format: https://youtu.be/XXXX)",
            ui: {
              validate: (value) => {
                if (value && !value.match(/^https:\/\/(youtu\.be\/|www\.youtube\.com\/)/)) {
                  return "L'URL doit être une URL YouTube valide";
                }
              },
            },
          },
          {
            type: "string",
            name: "tvcomUrl",
            label: "URL TV Com",
            description: "Pour les émissions TV uniquement",
          },
          {
            type: "string", 
            name: "podcastUrl",
            label: "URL du podcast",
            description: "Pour les podcasts uniquement",
          },
          {
            type: "string",
            name: "duration",
            label: "Durée",
            description: "Format: 1h15, 45min, etc.",
          },
          // Champs spécifiques aux fiches pédagogiques
          {
            type: "object",
            name: "pedagogicalSheet",
            label: "Fiche pédagogique",
            description: "Informations spécifiques à la fiche pédagogique",
            ui: {
              // N'afficher que si la catégorie est 'fiche'
              itemProps: (item) => {
                return { className: item.category === 'fiche' ? '' : 'hidden' };
              },
            },
            fields: [
              {
                type: "string",
                name: "enseignement",
                label: "Type d'enseignement",
                required: true,
              },
              {
                type: "string",
                name: "section",
                label: "Section",
                required: true,
              },
              {
                type: "object",
                name: "responsable",
                label: "Responsable du projet",
                fields: [
                  {
                    type: "string",
                    name: "prenom",
                    label: "Prénom",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "nom",
                    label: "Nom",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "email",
                    label: "Email",
                    required: true,
                  },
                ],
              },
              {
                type: "string",
                name: "description",
                label: "Description",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                list: true,
                name: "objectifs",
                label: "Objectifs",
              },
              {
                type: "string",
                list: true,
                name: "competences",
                label: "Compétences développées",
              },
              {
                type: "object",
                list: true,
                name: "references",
                label: "Pour aller plus loin",
                fields: [
                  {
                    type: "string",
                    name: "type",
                    label: "Type",
                    options: [
                      { label: "Site web", value: "site" },
                      { label: "Vidéo", value: "video" },
                      { label: "Document", value: "document" },
                    ],
                  },
                  {
                    type: "string",
                    name: "url",
                    label: "URL",
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Description",
                  },
                ],
              },
              {
                type: "string",
                name: "declinaisons",
                label: "Déclinaisons possibles",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "conseils",
                label: "Conseils du créateur",
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
            searchable: true,
            parser: {
              type: 'mdx',
              skipImports: true
            },
            templates: [
              {
                name: "CalloutBox",
                label: "Bloc d'information",
                fields: [
                  {
                    type: "string",
                    name: "type",
                    label: "Type",
                    options: [
                      { label: "Info", value: "info" },
                      { label: "Attention", value: "warning" },
                      { label: "Astuce", value: "tip" },
                    ],
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Titre",
                  },
                  {
                    type: "rich-text",
                    name: "content",
                    label: "Contenu",
                  },
                ],
              },
              {
                name: "VideoPlayer",
                label: "Vidéo",
                fields: [
                  {
                    type: "string",
                    name: "url",
                    label: "URL de la vidéo", 
                  },
                ],
              },
              {
                name: "Podcast",
                label: "Podcast",
                fields: [
                  {
                    type: "string",
                    name: "url",
                    label: "URL du podcast",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});