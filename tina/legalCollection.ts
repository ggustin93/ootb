import type { Collection } from "tinacms";

export const termsCollection: Collection = {
  label: "Mentions légales",
  name: "terms",
  path: "src/pages",
  format: "md",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  match: {
    include: "terms",
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Titre de la page",
      required: true,
    },
    {
      type: "string",
      name: "layout",
      label: "Layout",
      required: true,
      ui: {
        component: "hidden",
      },
    },
    {
      type: "rich-text",
      name: "body",
      label: "Contenu",
      description: "Contenu principal de la page des mentions légales",
      isBody: true,
    },
  ],
};

export const privacyCollection: Collection = {
  label: "Politique de confidentialité",
  name: "privacy",
  path: "src/pages",
  format: "md",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  match: {
    include: "privacy",
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Titre de la page",
      required: true,
    },
    {
      type: "string",
      name: "layout",
      label: "Layout",
      required: true,
      ui: {
        component: "hidden",
      },
    },
    {
      type: "rich-text",
      name: "body",
      label: "Contenu",
      description: "Contenu principal de la politique de confidentialité",
      isBody: true,
    },
  ],
}; 