import type { PaginateFunction } from 'astro';
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Post, PostCategory } from '~/types';
import { APP_BLOG } from 'astrowind:config';
import { cleanSlug, trimSlash, BLOG_BASE, POST_PERMALINK_PATTERN, CATEGORY_BASE, TAG_BASE } from './permalinks';

const generatePermalink = async ({
  id,
  slug,
  publishDate,
  category,
}: {
  id: string;
  slug: string;
  publishDate: Date;
  category: string | undefined;
}) => {
  const year = String(publishDate.getFullYear()).padStart(4, '0');
  const month = String(publishDate.getMonth() + 1).padStart(2, '0');
  const day = String(publishDate.getDate()).padStart(2, '0');
  const hour = String(publishDate.getHours()).padStart(2, '0');
  const minute = String(publishDate.getMinutes()).padStart(2, '0');
  const second = String(publishDate.getSeconds()).padStart(2, '0');

  const permalink = POST_PERMALINK_PATTERN.replace('%slug%', slug)
    .replace('%id%', id)
    .replace('%category%', category || '')
    .replace('%year%', year)
    .replace('%month%', month)
    .replace('%day%', day)
    .replace('%hour%', hour)
    .replace('%minute%', minute)
    .replace('%second%', second);

  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
};

const getNormalizedPost = async (post: CollectionEntry<'post'>): Promise<Post> => {
  const { id, data } = post;
  const { Content, remarkPluginFrontmatter } = await render(post);

  const {
    publishDate: rawPublishDate,
    updateDate: rawUpdateDate,
    title,
    description,
    image,
    published = true,
    draft,
    tags: rawTags = [],
    category: rawCategory,
    metadata,
    expert,
    duration,
    videoUrl,
    tvcomUrl,
    podcastUrl,
    showId,
    podcastId,
    pedagogicalSheet,
    media: rawMedia,
  } = data;

  const slug = cleanSlug(id);
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;

  const category = rawCategory
    ? typeof rawCategory === 'string'
      ? {
          slug: rawCategory as PostCategory,
          title: rawCategory,
        }
      : rawCategory
    : {
        slug: 'actualite' as PostCategory,
        title: 'Actualité',
      };

  const tags = rawTags.map((tag: string) => ({
    slug: cleanSlug(tag),
    title: tag,
  }));

  // Extraire les données média avec type non-nullable
  const media = rawMedia ? {
    type: rawMedia.type || (
      category.slug === 'podcast' ? 'podcast' :
      rawMedia.podcastUrl ? 'podcast' : 
      rawMedia.videoUrl ? 'youtube' : 
      rawMedia.tvcomUrl ? 'tv' : 'none'
    ),
    podcastUrl: rawMedia.podcastUrl,
    showId: rawMedia.showId,
    podcastId: rawMedia.podcastId,
    videoUrl: rawMedia.videoUrl,
    tvcomUrl: rawMedia.tvcomUrl,
    iframeCode: rawMedia.iframeCode,
    smartlinkUrl: rawMedia.smartlinkUrl
  } : undefined;

  return {
    id: id,
    slug: slug,
    permalink: await generatePermalink({ id, slug, publishDate, category: category.slug }),

    publishDate: publishDate,
    updateDate: updateDate,

    title: title,
    description: description,
    image: typeof image === 'string' ? image : undefined,
    videoUrl: videoUrl,
    tvcomUrl: tvcomUrl,
    podcastUrl: podcastUrl,
    showId: showId,
    podcastId: podcastId,
    expert: expert,
    duration: duration,
    pedagogicalSheet: pedagogicalSheet,
    media: media,
    
    category: category,
    tags: tags,

    draft: draft !== undefined ? draft : !published,
    published: published !== undefined ? published : !draft,

    metadata,

    Content: Content,

    readingTime: remarkPluginFrontmatter?.readingTime,
  };
};

const load = async function (): Promise<Array<Post>> {
  const posts = await getCollection('post');
  const normalizedPosts = posts.map(async (post) => await getNormalizedPost(post));

  const results = (await Promise.all(normalizedPosts))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((post) => post.published);

  return results;
};

let _posts: Array<Post>;

/** */
export const isBlogEnabled = APP_BLOG.isEnabled;
export const isRelatedPostsEnabled = APP_BLOG.isRelatedPostsEnabled;
export const isBlogListRouteEnabled = APP_BLOG.list.isEnabled;
export const isBlogPostRouteEnabled = APP_BLOG.post.isEnabled;
export const isBlogCategoryRouteEnabled = APP_BLOG.category.isEnabled;
export const isBlogTagRouteEnabled = APP_BLOG.tag.isEnabled;

export const blogListRobots = APP_BLOG.list.robots;
export const blogPostRobots = APP_BLOG.post.robots;
export const blogCategoryRobots = APP_BLOG.category.robots;
export const blogTagRobots = APP_BLOG.tag.robots;

export const blogPostsPerPage = APP_BLOG?.postsPerPage;

/** */
export const fetchPosts = async (): Promise<Array<Post>> => {
  if (!_posts) {
    _posts = await load();
  }

  return _posts;
};

/** */
export const findPostsBySlugs = async (slugs: Array<string>): Promise<Array<Post>> => {
  if (!Array.isArray(slugs)) return [];

  const posts = await fetchPosts();

  return slugs.reduce(function (r: Array<Post>, slug: string) {
    posts.some(function (post: Post) {
      return slug === post.slug && r.push(post);
    });
    return r;
  }, []);
};

/** */
export const findPostsByIds = async (ids: Array<string>): Promise<Array<Post>> => {
  if (!Array.isArray(ids)) return [];

  const posts = await fetchPosts();

  return ids.reduce(function (r: Array<Post>, id: string) {
    posts.some(function (post: Post) {
      return id === post.id && r.push(post);
    });
    return r;
  }, []);
};

/** */
export const findLatestPosts = async ({ count }: { count?: number }): Promise<Array<Post>> => {
  const _count = count || 4;
  const posts = await fetchPosts();

  return posts ? posts.slice(0, _count) : [];
};

/** */
export const getStaticPathsBlogList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogListRouteEnabled) return [];
  return paginate(await fetchPosts(), {
    params: { blog: BLOG_BASE || undefined },
    pageSize: blogPostsPerPage,
  });
};

/** */
export const getStaticPathsBlogPost = async () => {
  if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];
  return (await fetchPosts()).flatMap((post) => ({
    params: {
      blog: post.permalink,
    },
    props: { post },
  }));
};

/** 
 * Génère les chemins statiques pour les pages de catégories du blog
 * Gère toutes les catégories, y compris premium qui peut être vide initialement
 * mais prêt à recevoir du contenu ultérieurement
 */
export const getStaticPathsBlogCategory = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogCategoryRouteEnabled) return [];
  
  const posts = await fetchPosts();
  
  // Liste exhaustive des catégories possibles, indépendamment du contenu actuel
  const categories = new Set([
    'blog',
    'actualite', 
    'fiche',
    'live',
    'podcast',
    'tv',
    'premium'
  ]);
  
  return Array.from(categories).flatMap((category) => {
    // Pour premium ou toute autre catégorie, on filtre les posts correspondants
    const filteredPosts = posts.filter((post) => 
      post.category?.slug === category
    );

    return paginate(filteredPosts, {
      params: { category, blog: CATEGORY_BASE || undefined },
      pageSize: blogPostsPerPage,
      props: { 
        category: { 
          slug: category, 
          title: category 
        } 
      },
    });
  });
};

// Version alternative avec gestion dynamique des catégories
// À utiliser quand on voudra une gestion plus flexible des catégories
/*
export const getStaticPathsBlogCategory = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogCategoryRouteEnabled) return [];
  
  const posts = await fetchPosts();
  
  // Récupération dynamique des catégories depuis les posts
  const categories = new Set(posts.map(post => post.category?.slug).filter(Boolean));
  
  // Ajout des catégories "fixes" même si pas de contenu
  const requiredCategories = ['blog', 'actualite', 'fiche', 'live', 'podcast', 'tv', 'premium'];
  requiredCategories.forEach(cat => categories.add(cat));
  
  return Array.from(categories).flatMap((category) => {
    const filteredPosts = posts.filter(post => post.category?.slug === category);
    
    return paginate(filteredPosts, {
      params: { category, blog: CATEGORY_BASE || undefined },
      pageSize: blogPostsPerPage,
      props: { 
        category: { 
          slug: category, 
          title: category 
        } 
      },
    });
  });
};
*/

/** */
export const getStaticPathsBlogTag = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogTagRouteEnabled) return [];

  const posts = await fetchPosts();
  const tags: Record<string, { slug: string; title: string }> = {};
  
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        if (tag?.slug) {
          tags[tag.slug] = tag;
        }
      });
    }
  });

  return Array.from(Object.keys(tags)).flatMap((tagSlug) =>
    paginate(
      posts.filter((post) => Array.isArray(post.tags) && post.tags.find((elem) => elem.slug === tagSlug)),
      {
        params: { tag: tagSlug, blog: TAG_BASE || undefined },
        pageSize: blogPostsPerPage,
        props: { tag: tags[tagSlug] },
      }
    )
  );
};

/** */
export async function getRelatedPosts(originalPost: Post, maxResults: number = 4): Promise<Post[]> {
  const allPosts = await fetchPosts();
  const originalTagsSet = new Set(originalPost.tags ? originalPost.tags.map((tag) => tag.slug) : []);

  const postsWithScores = allPosts.reduce((acc: { post: Post; score: number }[], iteratedPost: Post) => {
    if (iteratedPost.slug === originalPost.slug) return acc;

    let score = 0;
    if (iteratedPost.category && originalPost.category && iteratedPost.category.slug === originalPost.category.slug) {
      score += 5;
    }

    if (iteratedPost.tags) {
      iteratedPost.tags.forEach((tag) => {
        if (originalTagsSet.has(tag.slug)) {
          score += 1;
        }
      });
    }

    acc.push({ post: iteratedPost, score });
    return acc;
  }, []);

  postsWithScores.sort((a, b) => b.score - a.score);

  const selectedPosts: Post[] = [];
  let i = 0;
  while (selectedPosts.length < maxResults && i < postsWithScores.length) {
    selectedPosts.push(postsWithScores[i].post);
    i++;
  }

  return selectedPosts;
}

interface Taxonomy {
  slug: string;
  title: string;
}

export async function findCategories(): Promise<Taxonomy[]> {
  const posts = await fetchPosts();
  const categories = new Set<Taxonomy>();
  
  posts.forEach((post) => {
    if (post.category) {
      categories.add(post.category);
    }
  });
  
  return Array.from(categories);
}

export async function findTags(): Promise<Taxonomy[]> {
  const posts = await fetchPosts();
  const uniqueTags = new Map<string, Taxonomy>();
  
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        if (!uniqueTags.has(tag.slug)) {
          uniqueTags.set(tag.slug, tag);
        }
      });
    }
  });
  
  return Array.from(uniqueTags.values());
}

export const findDiverseLatestPosts = async ({ count = 3 }: { count?: number } = {}): Promise<Post[]> => {
  const allPosts = await getCollection('post', (post) => 
    post.data.published && post.data.category !== 'fiche'
  );

  // Convert to normalized posts
  const normalizedPosts = await Promise.all(
    allPosts.map(post => getNormalizedPost(post))
  );

  // Sort by publish date
  const sortedPosts = normalizedPosts
    .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

  // Prioritize diversity of content types
  const contentTypes = ['actualite', 'podcast', 'tv', 'live', 'premium'];
  const diversePosts: Post[] = [];
  const usedTypes = new Set<string>();

  for (const post of sortedPosts) {
    if (
      !usedTypes.has(post.category.slug) && 
      contentTypes.includes(post.category.slug)
    ) {
      diversePosts.push(post);
      usedTypes.add(post.category.slug);
    }

    // If we have at least 3 different types, fill the rest with latest posts
    if (diversePosts.length >= count) {
      break;
    }
  }

  // If we don't have enough diverse posts, fill with latest
  while (diversePosts.length < count) {
    const nextPost = sortedPosts.find(
      post => !diversePosts.some(p => p.id === post.id)
    );
    
    if (nextPost) {
      diversePosts.push(nextPost);
    } else {
      break;
    }
  }

  return diversePosts.slice(0, count);
};
