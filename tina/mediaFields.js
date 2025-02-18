// mediaFields.js

export const mediaFields = {
    type: "object",
    label: "Gestion du média (Youtube, Ausha, ou lien TV com) ",
    description: "Liens vers les différents médias selon le type de contenu",
    fields: [
      {
        type: "string",
        name: "videoUrl",
        label: "URL de la vidéo YouTube",
        description: "URL de la vidéo YouTube (format: https://youtu.be/XXXX). À utiliser pour les contenus de type 'Lives'",
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
        description: "Lien vers l'émission sur TV Com. À utiliser uniquement pour les contenus de type 'Émissions'",
      },
      {
        type: "string",
        name: "podcastUrl",
        label: "URL du podcast",
        description: "Lien vers le podcast. À utiliser uniquement pour les contenus de type 'Podcasts'",
      },
    ],
  };