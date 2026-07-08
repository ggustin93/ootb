import type { HTMLAttributes } from 'astro/types';

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
  excerpt?: string;

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
  author?: string;
  contributors?: string[];
  episode?: string | number;
  expert?: string;
  duration?: string;
  icon?: string;

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
  content?: string;
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
  variant?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'blue'
    | 'outline-blue'
    | 'premium-primary'
    | 'premium-secondary'
    | 'card'
    | 'outline-podcast'
    | 'outline-tv';
  icon?: string;
  target?: string;
  classes?: Record<string, string>;
  type?: 'button' | 'submit' | 'reset';
  // Add any other Button props you anticipate using for header actions, e.g.:
  // id?: string;
  // disabled?: boolean;
  // type?: 'button' | 'submit' | 'reset';
}

export interface MetaData {
  title?: string;
  ignoreTitleTemplate?: boolean;
  canonical?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  description?: string;
  openGraph?: {
    url?: string;
    siteName?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
    }>;
    locale?: string;
    type?: string;
  };
  twitter?: {
    handle?: string;
    site?: string;
    cardType?: string;
  };
}

export interface Image {
  src: string;
  alt?: string;
}

export interface Video {
  src: string;
  type?: string;
}

export interface Widget {
  id?: string;
  isDark?: boolean;
  bg?: string;
  classes?: Record<string, string | Record<string, string>>;
}

export interface Headline {
  title?: string;
  subtitle?: string;
  tagline?: string;
  classes?: Record<string, string>;
}

interface TeamMember {
  name?: string;
  job?: string;
  image?: Image;
  socials?: Array<Social>;
  description?: string;
  classes?: Record<string, string>;
}

interface Social {
  icon?: string;
  href?: string;
}

export interface Stat {
  amount?: number | string;
  title?: string;
  icon?: string;
}

export interface Item {
  title?: string;
  description?: string;
  icon?: string;
  classes?: Record<string, string>;
  callToAction?: CallToAction;
  image?: Image;
}

export interface Price {
  title?: string;
  subtitle?: string;
  description?: string;
  price?: number | string;
  period?: string;
  items?: Array<Item>;
  callToAction?: CallToAction;
  hasRibbon?: boolean;
  ribbonTitle?: string;
}

export interface Testimonial {
  title?: string;
  testimonial?: string;
  name?: string;
  job?: string;
  image?: string | unknown;
}

export interface Input {
  type: HTMLAttributes<'input'>['type'];
  name: string;
  label?: string;
  autocomplete?: string;
  placeholder?: string;
}

export interface Textarea {
  label?: string;
  name?: string;
  placeholder?: string;
  rows?: number;
}

export interface Disclaimer {
  label?: string;
}

export interface ItemGrid {
  items?: Array<Item>;
  columns?: number;
  defaultIcon?: string;
  classes?: Record<string, string>;
}

export interface Collapse {
  iconUp?: string;
  iconDown?: string;
  items?: Array<Item>;
  columns?: number;
  classes?: Record<string, string>;
}

export interface Form {
  inputs?: Array<Input>;
  textarea?: Textarea;
  disclaimer?: Disclaimer;
  button?: string;
  description?: string;
}

export interface Hero extends Omit<Headline, 'classes'>, Omit<Widget, 'isDark' | 'classes'> {
  content?: string;
  actions?: string | CallToAction[];
  image?: string | unknown;
}

export interface Team extends Omit<Headline, 'classes'>, Widget {
  team?: Array<TeamMember>;
}

export interface Stats extends Omit<Headline, 'classes'>, Widget {
  stats?: Array<Stat>;
}

export interface Pricing extends Omit<Headline, 'classes'>, Widget {
  prices?: Array<Price>;
}

export interface Testimonials extends Omit<Headline, 'classes'>, Widget {
  testimonials?: Array<Testimonial>;
  callToAction?: CallToAction;
}

export interface Brands extends Omit<Headline, 'classes'>, Widget {
  icons?: Array<string>;
  images?: Array<Image>;
}

export interface Features extends Omit<Headline, 'classes'>, Widget {
  image?: string | unknown;
  video?: Video;
  items?: Array<Item>;
  columns?: number;
  defaultIcon?: string;
  callToAction1?: CallToAction;
  callToAction2?: CallToAction;
  isReversed?: boolean;
  isBeforeContent?: boolean;
  isAfterContent?: boolean;
}

export interface Faqs extends Omit<Headline, 'classes'>, Widget {
  iconUp?: string;
  iconDown?: string;
  items?: Array<Item>;
  columns?: number;
}

export interface Steps extends Omit<Headline, 'classes'>, Widget {
  items: Array<{
    title: string;
    description?: string;
    icon?: string;
    classes?: Record<string, string>;
  }>;
  callToAction?: string | CallToAction;
  image?: string | Image;
  isReversed?: boolean;
}

export interface Content extends Omit<Headline, 'classes'>, Widget {
  content?: string;
  image?: string | unknown;
  items?: Array<Item>;
  columns?: number;
  isReversed?: boolean;
  isAfterContent?: boolean;
  callToAction?: CallToAction;
}

export interface Contact extends Omit<Headline, 'classes'>, Form, Widget {}
