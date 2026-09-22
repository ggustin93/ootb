// mediaFields.js

/**
 * Configuration des champs média pour les contenus
 * Ce fichier centralise toute la logique de gestion des médias (podcasts, vidéos, TV)
 */

export const mediaFields = {
  type: 'object',
  name: 'media',
  label: 'Gestion du média (Youtube, Ausha, ou lien TV com)',
  description: 'Liens vers les différents médias selon le type de contenu',
  // Ne pas rendre le champ obligatoire pour permettre la navigation
  required: false,
  // Initialiser avec des valeurs par défaut pour éviter les erreurs de validation
  defaultItem: {
    type: 'none',
    iframeCode: '',
    smartlinkUrl: '',
    videoUrl: '',
    tvcomUrl: '',
  },
  fields: [
    {
      type: 'string',
      name: 'type',
      label: 'Type de média',
      description: 'Ce champ est automatiquement défini en fonction de la catégorie sélectionnée',
      options: [
        { label: 'Aucun', value: 'none' },
        { label: 'Podcast', value: 'podcast' },
        { label: 'Vidéo YouTube', value: 'youtube' },
        { label: 'Émission TV', value: 'tv' },
      ],
      ui: {
        component: 'hidden', // Masquer ce champ car il est défini automatiquement
      },
    },
    // Champs pour les podcasts - Méthode recommandée
    {
      type: 'string',
      name: 'iframeCode',
      label: 'Code iframe Ausha 🎙️',
      description: 'Copier-coller le code iframe depuis Ausha > Partager > Smartplayer',
      // Ne pas rendre obligatoire directement pour permettre la validation conditionnelle
      required: false,
      ui: {
        component: 'textarea',
        description: '👉 OBLIGATOIRE: Allez sur Ausha > Épisode > Partager > Smartplayer > Copier le code',
        validate: (value, data) => {
          // Vérifier si la catégorie est podcast
          if (data.category === 'podcast') {
            // Le code iframe est obligatoire pour les podcasts
            if (!value) {
              return '⚠️ OBLIGATOIRE: Le code iframe est requis pour les podcasts';
            }
          }
          return undefined; // Pas d'erreur si ce n'est pas un podcast
        },
      },
    },
    {
      type: 'string',
      name: 'smartlinkUrl',
      label: 'URL Smartlink Ausha 🎙️',
      description: "Copier-coller l'URL du smartlink depuis Ausha > Partager > Smartlink",
      // Ne pas rendre obligatoire directement pour permettre la validation conditionnelle
      required: false,
      ui: {
        description: '👉 OBLIGATOIRE: Format: https://smartlink.ausha.co/nom-du-podcast/numero-nom-episode',
        validate: (value, data) => {
          // Vérifier si la catégorie est podcast
          if (data.category === 'podcast') {
            // L'URL smartlink est obligatoire pour les podcasts
            if (!value) {
              return "⚠️ OBLIGATOIRE: L'URL Smartlink est requise pour les podcasts";
            }

            // Vérifier le format si une valeur est fournie
            if (value && !value.match(/^https:\/\/smartlink\.ausha\.co\//)) {
              return "⚠️ L'URL doit être un smartlink Ausha valide (format: https://smartlink.ausha.co/nom-du-podcast/numero-nom-episode)";
            }
          }
          return undefined; // Pas d'erreur si ce n'est pas un podcast
        },
      },
    },
    // Champs pour YouTube
    {
      type: 'string',
      name: 'videoUrl',
      label: 'URL de la vidéo YouTube 🎬',
      description:
        "URL de la vidéo YouTube (format: https://youtu.be/XXXX). À utiliser pour les contenus de type 'Lives'",
      // Ne pas rendre obligatoire directement pour permettre la validation conditionnelle
      required: false,
      ui: {
        description: '👉 Format: https://www.youtube.com/watch?v=XXXX ou https://youtu.be/XXXX',
        validate: (value, data) => {
          // Vérifier si la catégorie est live
          if (data.category === 'live') {
            if (!value) {
              return "⚠️ OBLIGATOIRE: Pour une vidéo YouTube, l'URL est obligatoire";
            } else if (!value.match(/^https:\/\/(youtu\.be\/|www\.youtube\.com\/)/)) {
              return "⚠️ L'URL doit être une URL YouTube valide";
            }
          }
          return undefined; // Pas d'erreur si ce n'est pas un live
        },
      },
    },
    // Champs pour TV
    {
      type: 'string',
      name: 'tvcomUrl',
      label: 'URL TV Com 📺',
      description: "Lien vers l'émission sur TV Com. À utiliser uniquement pour les contenus de type 'Émissions'",
      // Ne pas rendre obligatoire directement pour permettre la validation conditionnelle
      required: false,
      ui: {
        description: '👉 Format: https://www.tvcom.be/emission/pedagoscope/...',
        validate: (value, data) => {
          // Vérifier si la catégorie est tv
          if (data.category === 'tv') {
            if (!value) {
              return "⚠️ OBLIGATOIRE: Pour une émission TV, l'URL est obligatoire";
            } else if (!value.match(/^https:\/\/www\.tvcom\.be\/emission\//)) {
              return "⚠️ L'URL doit être une URL TV Com valide (format: https://www.tvcom.be/emission/...)";
            }
          }
          return undefined; // Pas d'erreur si ce n'est pas une émission TV
        },
      },
    },
  ],
  ui: {
    // Afficher/masquer les champs en fonction du type de média
    itemProps: (item) => {
      // Personnaliser l'affichage en fonction du type de média
      let label = '';

      if (item?.type === 'podcast') {
        label = `🎙️ Configuration du podcast (champs requis)`;
      } else if (item?.type === 'youtube') {
        label = `🎬 Configuration de la vidéo YouTube (champ requis)`;
      } else if (item?.type === 'tv') {
        label = `📺 Configuration de l'émission TV (champ requis)`;
      } else {
        label = `⚠️ Aucun média (sélectionnez une catégorie appropriée)`;
      }

      return { label };
    },
  },
};

/**
 * Fonction de validation pour les médias en fonction de la catégorie
 * À utiliser dans la fonction validate du postsCollection
 */
export const validateMediaByCategory = (data) => {
  // Vérifier si le type de contenu nécessite un média spécifique
  const category = data?.category;

  // Si pas de catégorie, on ne peut pas valider
  if (!category) return true;

  // Pour les podcasts
  if (category === 'podcast') {
    // Vérifier si les champs obligatoires sont présents
    if (!data.media) {
      return '⚠️ OBLIGATOIRE: Pour un podcast, vous devez configurer le média';
    }

    // Les deux champs sont obligatoires pour les podcasts
    const hasIframeCode = !!data.media.iframeCode;
    const hasSmartlink = !!data.media.smartlinkUrl;

    if (!hasIframeCode) {
      return '⚠️ OBLIGATOIRE: Pour un podcast, le code iframe est requis';
    }

    if (!hasSmartlink) {
      return "⚠️ OBLIGATOIRE: Pour un podcast, l'URL Smartlink est requise";
    }

    // Vérifier le format de l'URL Smartlink
    if (data.media.smartlinkUrl && !data.media.smartlinkUrl.match(/^https:\/\/smartlink\.ausha\.co\//)) {
      return "⚠️ L'URL Smartlink doit être au format https://smartlink.ausha.co/nom-du-podcast/numero-nom-episode";
    }
  }

  // Pour les lives
  if (category === 'live') {
    // Vérifier si l'URL YouTube est présente
    if (!data.media || !data.media.videoUrl) {
      return "⚠️ OBLIGATOIRE: Pour un live, l'URL YouTube est obligatoire";
    }

    // Vérifier le format de l'URL YouTube
    if (data.media?.videoUrl && !data.media.videoUrl.match(/^https:\/\/(youtu\.be\/|www\.youtube\.com\/)/)) {
      return "⚠️ L'URL doit être une URL YouTube valide";
    }
  }

  // Pour les émissions TV
  if (category === 'tv') {
    // Vérifier si l'URL TV Com est présente
    if (!data.media || !data.media.tvcomUrl) {
      return "⚠️ OBLIGATOIRE: Pour une émission TV, l'URL TV Com est obligatoire";
    }

    // Vérifier le format de l'URL TV Com
    if (data.media?.tvcomUrl && !data.media.tvcomUrl.match(/^https:\/\/www\.tvcom\.be\/emission\//)) {
      return "⚠️ L'URL TV Com doit être au format https://www.tvcom.be/emission/...";
    }
  }

  return true;
};

/**
 * Fonction pour mettre à jour le type de média en fonction de la catégorie
 * À utiliser dans la fonction onChange du champ category
 */
export const updateMediaTypeByCategory = (value, data) => {
  // Définir le type de média en fonction de la catégorie
  let mediaType = 'none';

  if (value === 'podcast') {
    mediaType = 'podcast';
  } else if (value === 'live') {
    mediaType = 'youtube';
  } else if (value === 'tv') {
    mediaType = 'tv';
  }

  return {
    ...data,
    media: {
      ...data.media,
      type: mediaType,
    },
  };
};
