// Types de contenu
export type PostCategory = 'actualite' | 'fiche' | 'live' | 'podcast' | 'tv' | 'premium';

// Interface principale du Post
export interface Post {
  // Métadonnées essentielles
  id: string;
  slug: string;
  permalink: string;
  title: string;
  description: string;

  // Dates
  publishDate: Date;
  updateDate?: Date;

  // Catégorisation
  category: {
    title: string;
    slug: PostCategory;
  };
  tags?: Array<Tag>;

  // Média
  image?: string;
  videoUrl?: string;

  // Informations additionnelles
  expert?: string;
  duration?: string;

  // État
  draft?: boolean;
  published: boolean;

  // SEO
  metadata?: {
    title?: string;
    description?: string;
    canonical?: string;
    robots?: {
      index?: boolean;
      follow?: boolean;
    };
  };

  // Rendu
  Content?: import('astro/runtime/server/index.js').AstroComponentFactory;
  readingTime?: number;
}

// Types auxiliaires
export interface Tag {
  slug: string;
  title: string;
}

// Configuration UI (types uniquement)
export interface ContentTypeConfig {
  label: string;
  color: string;
  icon: string;
  badgeClass: string;
} 