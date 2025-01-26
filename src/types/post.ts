export interface Post {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  description?: string;
  publishDate: Date;
  author?: string;
  category?: {
    title: string;
    slug: string;
  };
  image?: string;
  tags?: string[];
  readingTime?: string;
  source?: 'markdown' | 'directus';
  content?: string;
}

export interface MarkdownPost extends Post {
  source: 'markdown';
  publishedAt: Date;
}