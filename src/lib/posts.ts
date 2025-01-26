import { getStaticPathsBlogPost } from '~/utils/blog';
import { getDirectusPosts, getDirectusPostBySlug } from './directus';
import type { Post, MarkdownPost } from '~/types/post';

// Flags de configuration
export const FETCH_DIRECTUS = false; // Si true, récupère aussi les posts depuis Directus
export const DEBUG = false; // Si true, affiche les informations de debug

export async function getAllPosts(): Promise<Post[]> {
  try {
    // Récupérer les posts markdown
    const markdownPosts = (await getStaticPathsBlogPost()).map(({ props }) => ({
      ...props.post,
      source: 'markdown' as const,
      publishedAt: new Date(props.post.publishDate),
      description: props.post.excerpt,
      permalink: `blog/${props.post.slug}`,
    })) as MarkdownPost[];

    if (!FETCH_DIRECTUS) {
      return markdownPosts.sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
      );
    }

    // Récupérer les posts Directus si activé
    const directusPosts = await getDirectusPosts();
    const formattedDirectusPosts = directusPosts.map(post => ({
      ...post,
      permalink: `blog/${post.slug}`,
    }));

    // Combiner et trier par date de publication
    return [...markdownPosts, ...formattedDirectusPosts].sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  } catch (error) {
    console.error('💥 Error in getAllPosts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Chercher d'abord dans les posts markdown
  const markdownPosts = await getStaticPathsBlogPost();
  const markdownPost = markdownPosts.find(
    (post) => post.params.blog === slug
  );
  
  if (markdownPost) {
    return {
      ...markdownPost.props.post,
      source: 'markdown',
      publishedAt: new Date(markdownPost.props.post.publishDate),
      description: markdownPost.props.post.excerpt,
      permalink: `blog/${markdownPost.props.post.slug}`,
    } as MarkdownPost;
  }

  // Essayer Directus seulement si activé
  if (FETCH_DIRECTUS) {
    const directusPost = await getDirectusPostBySlug(slug);
    if (directusPost) return directusPost;
  }

  return null;
} 