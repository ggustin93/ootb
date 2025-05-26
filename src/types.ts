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

  // Média (ancienne structure)
  image?: string;
  videoUrl?: string;
  podcastUrl?: string;
  tvcomUrl?: string;
  showId?: string;
  podcastId?: string;
  
  // Nouvelle structure média
  media?: {
    type: 'none' | 'podcast' | 'youtube' | 'tv';
    // Champs pour les podcasts - nouvelle approche
    iframeCode?: string;
    smartlinkUrl?: string;
    // Champs pour les podcasts - ancienne approche
    podcastUrl?: string;
    showId?: string;
    podcastId?: string;
    // Autres types de médias
    videoUrl?: string;
    tvcomUrl?: string;
  };

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

  // Fiche pédagogique
  pedagogicalSheet?: {
    enseignement: string;
    section: string;
    responsable: {
      prenom: string;
      nom: string;
      email: string;
    };
    description?: string;
    objectifs: string[];
    competences: string[];
    declinaisons?: string;
    conseils?: string;
    references?: Array<{
      type: 'site' | 'video' | 'document';
      url?: string;
      description?: string;
    }>;
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

// Call To Action for buttons
export interface CallToAction {
  text: string; // For the button's visible text
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'blue' | 'outline-blue' | 'premium-primary' | 'premium-secondary' | 'card' | 'outline-podcast' | 'outline-tv';
  icon?: string;
  target?: string;
  // Add any other Button props you anticipate using for header actions, e.g.:
  // id?: string;
  // disabled?: boolean;
  // type?: 'button' | 'submit' | 'reset';
} 