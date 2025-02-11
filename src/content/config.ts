import { defineCollection, z } from 'astro:content';
import type { ImageMetadata } from 'astro';

// Schéma pour les fiches pédagogiques
const pedagogicalSheet = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    updateDate: z.date().optional(),
    published: z.boolean(),
    enseignement: z.string(),
    section: z.string(),
    responsable: z.object({
      prenom: z.string(),
      nom: z.string(),
      email: z.string().email()
    }),
    objectifs: z.array(z.string()),
    competences: z.array(z.string()),
    declinaisons: z.string().optional(),
    conseils: z.string().optional(),
    references: z.array(z.object({
      type: z.enum(['site', 'video', 'document']),
      url: z.string().optional(),
      description: z.string().optional()
    })).optional(),
    metadata: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      canonical: z.string().optional(),
      robots: z.object({
        index: z.boolean().optional(),
        follow: z.boolean().optional(),
      }).optional(),
    }).optional(),
  })
});

// Schéma pour les posts normaux
const post = defineCollection({
  type: 'content',
  // Spécifier le dossier en fonction de la catégorie
  getEntrySlug: (entry) => {
    return `${entry.data.category}/${entry.id}`;
  },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    updateDate: z.date().optional(),
    published: z.boolean(),
    category: z.enum(['actualite', 'fiche', 'live', 'podcast', 'tv', 'premium']),
    image: z.string().or(z.custom<ImageMetadata>()).optional(),
    videoUrl: z.string().optional(),
    tvcomUrl: z.string().optional(),
    podcastUrl: z.string().optional(),
    showId: z.string().optional(),
    podcastId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    expert: z.string().optional(),
    duration: z.string().optional(),
    draft: z.boolean().optional().default(false),
    // Champs spécifiques aux fiches pédagogiques
    pedagogicalSheet: z.object({
      enseignement: z.string(),
      section: z.string(),
      responsable: z.object({
        prenom: z.string(),
        nom: z.string(),
        email: z.string().email()
      }),
      description: z.string().optional(),
      objectifs: z.array(z.string()),
      competences: z.array(z.string()),
      declinaisons: z.string().optional(),
      conseils: z.string().optional(),
      references: z.array(z.object({
        type: z.enum(['site', 'video', 'document']),
        url: z.string().optional(),
        description: z.string().optional()
      })).optional()
    }).optional(),
    metadata: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      canonical: z.string().optional(),
      robots: z.object({
        index: z.boolean().optional(),
        follow: z.boolean().optional(),
      }).optional(),
    }).optional(),
  }).refine(
    (data) => {
      // Si c'est un live sans image, il doit avoir une videoUrl
      if (data.category === 'live' && !data.image) {
        return !!data.videoUrl;
      }
      // Pour les émissions TV, tvcomUrl est requis
      if (data.category === 'tv' && !data.tvcomUrl) {
        return false;
      }
      // Pour les fiches pédagogiques, l'image est optionnelle
      if (data.category === 'fiche') {
        return true;
      }
      // Pour les autres types, l'image est requise sauf pour les émissions TV
      if (data.category !== 'live' && data.category !== 'tv') {
        return !!data.image;
      }
      return true;
    },
    {
      message: "Une image est requise sauf pour les lives qui ont une URL vidéo YouTube, les émissions TV, et les fiches pédagogiques. Pour les émissions TV, l'URL TV Com est obligatoire.",
    }
  )
});

export const collections = {
  post: post,
}; 