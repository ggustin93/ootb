import { defineCollection, z } from 'astro:content';

const post = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    updateDate: z.date().optional(),
    published: z.boolean(),
    category: z.enum(['actualite', 'fiche', 'live', 'podcast', 'tv', 'premium']),
    image: z.string().optional(),
    videoUrl: z.string().optional(),
    tags: z.array(z.string()).optional(),
    expert: z.string().optional(),
    duration: z.string().optional(),
    draft: z.boolean().optional().default(false),
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
      // Pour les autres types, l'image est requise
      if (data.category !== 'live') {
        return !!data.image;
      }
      return true;
    },
    {
      message: "Une image est requise sauf pour les lives qui ont une URL vidéo YouTube",
    }
  ),
});

export const collections = {
  post: post,
}; 