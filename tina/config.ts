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