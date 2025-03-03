import type { Collection } from "tinacms";

export const blogCollection: Collection = {
  label: "📄 Page - Blog",
  name: "blog",
  path: "src/content/blog",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  defaultItem: () => ({
    hero: {
      title: "Nos contenus",
      description: "Découvrez nos podcasts, vidéos pédagogiques, fiches pratiques et contenus premium pour transformer l'éducation",
      mascotteImage: "/src/assets/images/ootb-logo.svg",
      filters: {
        orLabel: "ou",
        labels: {
          default: "Filtrer par type de contenu :",
          category: "Autres types de contenus :"
        },
        categoryFilters: {
          allLabel: "Tous",
          mobileSelectLabel: "Tous les contenus"
        }
      },
      contentSection: {
        title: "Tous les contenus"
      },
      search: {
        placeholder: "Ex: programme scolaire, math",
        thematicLabel: "Rechercher par thématique :"
      }
    },
    contentTypes: {
      all: {
        label: "TOUS",
        shortLabel: "Tous",
        titlePrefix: "Tous",
        titleSuffix: "contenus",
        pageTitle: "Tous nos contenus",
        actionLabel: "Voir tous les contenus",
        icon: "tabler:layout-grid",
        variant: "default",
        description: "Découvrez nos podcasts, vidéos pédagogiques, fiches pratiques et contenus premium pour transformer l'éducation"
      },
      actualite: {
        label: "ACTUALITÉS",
        shortLabel: "Actualités",
        titlePrefix: "Nos",
        titleSuffix: "actualités",
        pageTitle: "Nos actualités",
        actionLabel: "Voir les actualités",
        icon: "tabler:news",
        variant: "actualite",
        description: "Restez informé des dernières innovations pédagogiques et des actualités du monde de l'éducation"
      }
    }
  }),
  fields: [
    {
      type: "object",
      name: "hero",
      label: "Section Hero - 'Tous les contenus'",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Titre principal",
          required: true
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          required: true,
          ui: {
            component: "textarea"
          }
        },
        {
          type: "image",
          name: "mascotteImage",
          label: "Image mascotte",
          required: true
        },
        {
          type: "object",
          name: "filters",
          label: "Filtres",
          fields: [
            {
              type: "string",
              name: "orLabel",
              label: "Texte de séparation",
              required: true
            },
            {
              type: "object",
              name: "labels",
              label: "Labels des filtres",
              fields: [
                {
                  type: "string",
                  name: "default",
                  label: "Label par défaut",
                  required: true
                },
                {
                  type: "string",
                  name: "category",
                  label: "Label pour les catégories",
                  required: true
                }
              ]
            },
            {
              type: "object",
              name: "categoryFilters",
              label: "Filtres de catégories",
              fields: [
                {
                  type: "string",
                  name: "allLabel",
                  label: "Label pour 'Tous'",
                  required: true
                },
                {
                  type: "string",
                  name: "mobileSelectLabel",
                  label: "Label pour le menu déroulant mobile",
                  required: true
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "contentSection",
          label: "Section Contenu",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Titre de la section",
              required: true
            }
          ]
        },
        {
          type: "object",
          name: "search",
          label: "Barre de recherche",
          fields: [
            {
              type: "string",
              name: "placeholder",
              label: "Placeholder",
              required: true
            },
            {
              type: "string",
              name: "thematicLabel",
              label: "Label de recherche thématique",
              required: true
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "contentTypes",
      label: "Section Hero - 'Par catégorie'",
      description: "Configuration des différents types de contenu",
      fields: [
        {
          type: "object",
          name: "all",
          label: "Tous les contenus",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé complet",
              required: true
            },
            {
              type: "string",
              name: "shortLabel",
              label: "Libellé court",
              required: true
            },
            {
              type: "string",
              name: "titlePrefix",
              label: "Préfixe du titre",
              required: true
            },
            {
              type: "string",
              name: "titleSuffix",
              label: "Suffixe du titre",
              required: true
            },
            {
              type: "string",
              name: "pageTitle",
              label: "Titre de la page",
              required: true
            },
            {
              type: "string",
              name: "actionLabel",
              label: "Libellé d'action",
              required: true
            },
            {
              type: "string",
              name: "icon",
              label: "Icône (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "variant",
              label: "Variante (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea"
              }
            }
          ]
        },
        {
          type: "object",
          name: "actualite",
          label: "Actualités",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé complet",
              required: true
            },
            {
              type: "string",
              name: "shortLabel",
              label: "Libellé court",
              required: true
            },
            {
              type: "string",
              name: "titlePrefix",
              label: "Préfixe du titre",
              required: true
            },
            {
              type: "string",
              name: "titleSuffix",
              label: "Suffixe du titre",
              required: true
            },
            {
              type: "string",
              name: "pageTitle",
              label: "Titre de la page",
              required: true
            },
            {
              type: "string",
              name: "actionLabel",
              label: "Libellé d'action",
              required: true
            },
            {
              type: "string",
              name: "icon",
              label: "Icône (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "variant",
              label: "Variante (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea"
              }
            }
          ]
        },
        {
          type: "object",
          name: "fiche",
          label: "Fiches pédagogiques",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé complet",
              required: true
            },
            {
              type: "string",
              name: "shortLabel",
              label: "Libellé court",
              required: true
            },
            {
              type: "string",
              name: "titlePrefix",
              label: "Préfixe du titre",
              required: true
            },
            {
              type: "string",
              name: "titleSuffix",
              label: "Suffixe du titre",
              required: true
            },
            {
              type: "string",
              name: "pageTitle",
              label: "Titre de la page",
              required: true
            },
            {
              type: "string",
              name: "actionLabel",
              label: "Libellé d'action",
              required: true
            },
            {
              type: "string",
              name: "icon",
              label: "Icône (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "variant",
              label: "Variante (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea"
              }
            }
          ]
        },
        {
          type: "object",
          name: "live",
          label: "Lives Facebook",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé complet",
              required: true
            },
            {
              type: "string",
              name: "shortLabel",
              label: "Libellé court",
              required: true
            },
            {
              type: "string",
              name: "titlePrefix",
              label: "Préfixe du titre",
              required: true
            },
            {
              type: "string",
              name: "titleSuffix",
              label: "Suffixe du titre",
              required: true
            },
            {
              type: "string",
              name: "pageTitle",
              label: "Titre de la page",
              required: true
            },
            {
              type: "string",
              name: "actionLabel",
              label: "Libellé d'action",
              required: true
            },
            {
              type: "string",
              name: "icon",
              label: "Icône (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "variant",
              label: "Variante (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea"
              }
            }
          ]
        },
        {
          type: "object",
          name: "podcast",
          label: "Podcasts",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé complet",
              required: true
            },
            {
              type: "string",
              name: "shortLabel",
              label: "Libellé court",
              required: true
            },
            {
              type: "string",
              name: "titlePrefix",
              label: "Préfixe du titre",
              required: true
            },
            {
              type: "string",
              name: "titleSuffix",
              label: "Suffixe du titre",
              required: true
            },
            {
              type: "string",
              name: "pageTitle",
              label: "Titre de la page",
              required: true
            },
            {
              type: "string",
              name: "actionLabel",
              label: "Libellé d'action",
              required: true
            },
            {
              type: "string",
              name: "icon",
              label: "Icône (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "variant",
              label: "Variante (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (technique)",
                  required: true,
                  ui: {
                    component: () => null
                  }
                },
                {
                  type: "string",
                  name: "label",
                  label: "Libellé",
                  required: true
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                  required: true
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "tv",
          label: "Émissions TV",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé complet",
              required: true
            },
            {
              type: "string",
              name: "shortLabel",
              label: "Libellé court",
              required: true
            },
            {
              type: "string",
              name: "titlePrefix",
              label: "Préfixe du titre",
              required: true
            },
            {
              type: "string",
              name: "titleSuffix",
              label: "Suffixe du titre",
              required: true
            },
            {
              type: "string",
              name: "pageTitle",
              label: "Titre de la page",
              required: true
            },
            {
              type: "string",
              name: "actionLabel",
              label: "Libellé d'action",
              required: true
            },
            {
              type: "string",
              name: "icon",
              label: "Icône (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "variant",
              label: "Variante (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (technique)",
                  required: true,
                  ui: {
                    component: () => null
                  }
                },
                {
                  type: "string",
                  name: "label",
                  label: "Libellé",
                  required: true
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                  required: true
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "premium",
          label: "Contenu Premium",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Libellé complet",
              required: true
            },
            {
              type: "string",
              name: "shortLabel",
              label: "Libellé court",
              required: true
            },
            {
              type: "string",
              name: "titlePrefix",
              label: "Préfixe du titre",
              required: true
            },
            {
              type: "string",
              name: "titleSuffix",
              label: "Suffixe du titre",
              required: true
            },
            {
              type: "string",
              name: "pageTitle",
              label: "Titre de la page",
              required: true
            },
            {
              type: "string",
              name: "actionLabel",
              label: "Libellé d'action",
              required: true
            },
            {
              type: "string",
              name: "icon",
              label: "Icône (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "variant",
              label: "Variante (technique)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "string",
              name: "heroDescription",
              label: "Description pour le hero",
              required: false,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (technique)",
                  required: true,
                  ui: {
                    component: () => null
                  }
                },
                {
                  type: "string",
                  name: "label",
                  label: "Libellé",
                  required: true
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                  required: true
                },
                {
                  type: "string",
                  name: "variant",
                  label: "Variante (technique)",
                  required: false,
                  ui: {
                    component: () => null
                  }
                }
              ]
            },
            {
              type: "object",
              name: "qrCode",
              label: "QR Code",
              fields: [
                {
                  type: "image",
                  name: "src",
                  label: "Image source",
                  required: true
                },
                {
                  type: "string",
                  name: "alt",
                  label: "Texte alternatif",
                  required: true
                },
                {
                  type: "string",
                  name: "caption",
                  label: "Légende",
                  required: true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "categoryInfo",
      label: "Informations des catégories",
      fields: [
        {
          type: "object",
          name: "tv",
          label: "Émissions TV",
          fields: [
            {
              type: "string",
              name: "colorVariable",
              label: "Variable de couleur CSS (non modifiable)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "logo",
              label: "URL du logo",
              required: true
            },
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
              list: true,
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (technique)",
                  required: true,
                  ui: {
                    component: () => null
                  }
                },
                {
                  type: "string",
                  name: "label",
                  label: "Libellé",
                  required: true
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                  required: true
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "podcast",
          label: "Podcasts",
          fields: [
            {
              type: "string",
              name: "colorVariable",
              label: "Variable de couleur CSS (non modifiable)",
              required: true,
              ui: {
                component: () => null
              }
            },
            {
              type: "string",
              name: "logo",
              label: "URL du logo",
              required: true
            },
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
              list: true,
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (technique)",
                  required: true,
                  ui: {
                    component: () => null
                  }
                },
                {
                  type: "string",
                  name: "label",
                  label: "Libellé",
                  required: true
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                  required: true
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "fiche",
          label: "Fiches pédagogiques",
          fields: [
            {
              type: "string",
              name: "colorVariable",
              label: "Variable de couleur CSS (non modifiable)",
              required: true,
              ui: {
                component: () => null
              }
            },
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
              list: true,
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (technique)",
                  required: true,
                  ui: {
                    component: () => null
                  }
                },
                {
                  type: "string",
                  name: "label",
                  label: "Libellé",
                  required: true
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                  required: true
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "actualite",
          label: "Actualités",
          fields: [
            {
              type: "string",
              name: "colorVariable",
              label: "Variable de couleur CSS (non modifiable)",
              required: true,
              ui: {
                component: () => null
              }
            },
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
              list: true,
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (technique)",
                  required: true,
                  ui: {
                    component: () => null
                  }
                },
                {
                  type: "string",
                  name: "label",
                  label: "Libellé",
                  required: true
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                  required: true
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "live",
          label: "Lives Facebook",
          fields: [
            {
              type: "string",
              name: "colorVariable",
              label: "Variable de couleur CSS (non modifiable)",
              required: true,
              ui: {
                component: () => null
              }
            },
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
              list: true,
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (technique)",
                  required: true,
                  ui: {
                    component: () => null
                  }
                },
                {
                  type: "string",
                  name: "label",
                  label: "Libellé",
                  required: true
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                  required: true
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "premium",
          label: "Contenu Premium",
          fields: [
            {
              type: "string",
              name: "colorVariable",
              label: "Variable de couleur CSS (non modifiable)",
              required: true,
              ui: {
                component: () => null
              }
            },
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
              list: true,
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "links",
              label: "Liens",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "icon",
                  label: "Icône (technique)",
                  required: true,
                  ui: {
                    component: () => null
                  }
                },
                {
                  type: "string",
                  name: "label",
                  label: "Libellé",
                  required: true
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL",
                  required: true
                },
                {
                  type: "string",
                  name: "variant",
                  label: "Variante (technique)",
                  required: false,
                  ui: {
                    component: () => null
                  }
                }
              ]
            },
            {
              type: "object",
              name: "qrCode",
              label: "QR Code",
              fields: [
                {
                  type: "image",
                  name: "src",
                  label: "Image source",
                  required: true
                },
                {
                  type: "string",
                  name: "alt",
                  label: "Texte alternatif",
                  required: true
                },
                {
                  type: "string",
                  name: "caption",
                  label: "Légende",
                  required: true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}; 