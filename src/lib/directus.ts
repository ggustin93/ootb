import type { DirectusPost } from '~/types/post';

const DIRECTUS_URL = 'https://ootb-cms.directus.app';

// Fonction utilitaire pour formater la date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
}

async function fetchDirectus<T>(endpoint: string): Promise<T> {
  // Ajouter un timestamp pour éviter le cache
  const timestamp = Date.now();
  const url = `${DIRECTUS_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}_t=${timestamp}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }
  return response.json();
}

// Fonction utilitaire pour obtenir l'URL complète d'une image
function getImageUrl(imageId: string): string {
  if (!imageId) return '';
  return `${DIRECTUS_URL}/assets/${imageId}`;
}

interface DirectusResponse {
  data: Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    description: string;
    image: string;
    published_at: string;
    status: 'published' | 'draft' | 'in_review';
    author: string;
  }>;
}

export async function getDirectusPosts(): Promise<DirectusPost[]> {
  try {
    console.log('🔍 Fetching posts from Directus...');
    const response = await fetchDirectus<DirectusResponse>(
      '/items/posts?filter[status][_eq]=published&sort=-sort'
    );
    
    if (!response.data) {
      console.warn('⚠️ No data property in Directus response');
      return [];
    }
    
    const posts = response.data.map(post => ({
      ...post,
      source: 'directus' as const,
      publishedAt: new Date(post.published_at || Date.now()),
      image: post.image ? getImageUrl(post.image) : undefined,
      permalink: post.slug,
      excerpt: post.description,
      publishDate: formatDate(post.published_at),
      Content: undefined,
    }));

    return posts;
  } catch (error) {
    console.error('❌ Error fetching posts from Directus:', error);
    return [];
  }
}

export async function getDirectusPostBySlug(slug: string): Promise<DirectusPost | null> {
  try {
    const response = await fetchDirectus<DirectusResponse>(
      `/items/posts?filter[slug][_eq]=${slug}&filter[status][_eq]=published`
    );
    
    if (!response.data?.length) return null;
    
    const post = response.data[0];
    return {
      ...post,
      source: 'directus' as const,
      publishedAt: new Date(post.published_at),
      image: post.image ? getImageUrl(post.image) : undefined,
      permalink: post.slug,
      excerpt: post.description,
      publishDate: formatDate(post.published_at),
      Content: undefined,
    };
  } catch (error) {
    console.error('❌ Error fetching post from Directus:', error);
    return null;
  }
} 