export interface Post {
  title: string;
  description: string;
  image: string;
  slug: string;
  category?: {
    title: string;
    slug: string;
  };
  tags?: string[];
  expert?: string;
  duration?: string;
  contributors?: string[];
  publishDate: Date;
}

export interface Tag {
  slug: string;
  title: string;
} 