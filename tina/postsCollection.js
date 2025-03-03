// postsCollection.js
import { mediaFields } from "./mediaFields";

const CONTENT_TYPES = {
  actualite: "Actualités",
  fiche: "Fiches",
  live: "Lives",
  podcast: "Podcasts",
  tv: "Émissions",
  premium: "Premium",
}

export const postsCollection = {
  name: "post",
  label: "📚 Gestion des contenus",
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
  },
  fields: [
    {
      type: "boolean",
      name: "published",
      label: "État de publication",
      description: "Boule bleue = contenu visible sur le site",
      required: true,
      ui: {
        defaultValue: false,
      }
    },
    {
      type: "string",
      name: "category",
      label: "Type de contenu",
      description: "Sélectionnez le type de contenu. Certains champs spécifiques apparaîtront selon votre sélection",
      required: true,
      options: Object.entries(CONTENT_TYPES).map(([value, label]) => ({
        value,
        label,
      })),
      searchable: true,
    },
    {
      type: "string",
      name: "title",
      label: "Titre du contenu",
      description: "Le titre principal qui apparaîtra en haut de la page",
      required: true,
      isTitle: true,
      searchable: true,
    },
    {
      type: "string",
      name: "description",
      label: "Résumé",
      description: "Un bref résumé qui apparaîtra dans les aperçus et en haut de la page",
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
      description: "Date à laquelle le contenu sera/a été publié",
      required: true,
      ui: {
        dateFormat: "DD/MM/YYYY",
      },
    },
    {
      type: "string",
      name: "tags",
      label: "Mots-clés",
      description: "Ajoutez des mots-clés pour faciliter la recherche et le filtrage des contenus",
      list: true,
      ui: {
        component: "tags",
      },
      searchable: true,
    },
    {
      type: "image",
      name: "image",
      label: "Image de couverture",
      description: "L'image principale qui apparaîtra en haut de la page et dans les aperçus",
      required: true,
    },
    {
      type: "object",
      name: "media",
      label: "Média (Youtube, Ausha, lien TV com)",
      description: "Liens vers les différents médias selon le type de contenu",
      fields: mediaFields.fields,
    },
    {
      type: "object",
      name: "pedagogicalSheet",
      label: "Fiche pédagogique",
      description: "Informations spécifiques pour les fiches pédagogiques. Ces champs ne sont pertinents que si la catégorie est 'Fiches'.",
      ui: {
        description: "Ces champs ne s'afficheront que si la catégorie sélectionnée est 'Fiches'",
        itemProps: (item) => {
          return { className: item.category === 'fiche' ? '' : 'hidden' };
        },
      },
      fields: [
        {
          type: "string",
          name: "enseignement",
          label: "Type d'enseignement",
          description: "Le type d'enseignement concerné par cette fiche",
          required: true,
        },
        {
          type: "string",
          name: "section",
          label: "Section",
          description: "La section d'études concernée",
          required: true,
        },
        {
          type: "object",
          name: "responsable",
          label: "Responsable du projet",
          description: "Informations sur la personne responsable de cette fiche pédagogique",
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
              description: "Adresse email de contact",
              required: true,
            },
          ],
        },
        {
          type: "string",
          name: "description",
          label: "Description pédagogique",
          description: "Description détaillée des objectifs et du contenu pédagogique",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          list: true,
          name: "objectifs",
          label: "Objectifs",
          description: "Listez les objectifs pédagogiques de cette fiche",
        },
        {
          type: "string",
          list: true,
          name: "competences",
          label: "Compétences développées",
          description: "Listez les compétences que les élèves développeront grâce à cette fiche",
        },
        {
          type: "object",
          list: true,
          name: "references",
          label: "Pour aller plus loin",
          description: "Ajoutez des ressources supplémentaires pour approfondir les connaissances",
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
              description: "L'adresse URL de la ressource",
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              description: "Une brève description de la ressource",
            },
          ],
        },
        {
          type: "string",
          name: "declinaisons",
          label: "Déclinaisons possibles",
          description: "Décrivez les différentes manières dont cette fiche peut être utilisée ou adaptée",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "string",
          name: "conseils",
          label: "Conseils du créateur",
          description: "Ajoutez des conseils ou des astuces pour les enseignants qui utiliseront cette fiche",
          ui: {
            component: "textarea",
          },
        },
      ],
    },
    {
      type: "rich-text",
      name: "body",
      label: "Contenu additionnel (optionnel)",
      description: "Vous pouvez ajouter ici du contenu supplémentaire de type blog avec du formatage riche (titres, gras, italique, listes, etc.). Les médias (vidéos, podcasts) sont à gérer via la section 'Média' ci-dessus.",
      isBody: true,
    },
  ],
};