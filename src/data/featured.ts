interface FeaturedContent {
  href: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  type: 'podcast' | 'tv' | 'default';
  meta: {
    episode?: string;
    duration: string;
    expert: string;
    contributors?: string;
  };
}

export const featuredContents: FeaturedContent[] = [
  {
    href: "/podcast/ep45",
    title: "L'intelligence émotionnelle à l'école",
    description: "Comment développer l'intelligence émotionnelle des élèves ?",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=640&q=80",
    badge: "Podcast",
    type: "podcast",
    meta: {
      episode: "EP. 45",
      duration: "38 min",
      expert: "Dr. Sophie Martin"
    }
  },
  {
    href: "/tv/neurosciences",
    title: "Les neurosciences en classe",
    description: "Reportage exclusif dans une classe laboratoire",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=640&q=80",
    badge: "TV",
    type: "tv",
    meta: {
      duration: "26 min",
      expert: "Pédagoscope"
    }
  },
  {
    href: "/premium/learning-game",
    title: "L'apprentissage par le jeu",
    description: "Une analyse approfondie avec les meilleurs experts du domaine",
    image: "https://images.unsplash.com/photo-1632571401005-458e9d244591?w=640&q=80",
    badge: "Article",
    type: "default",
    meta: {
      expert: "Dr. Marie Lambert",
      duration: "45 min de lecture",
      contributors: "12 contributeurs"
    }
  }
]; 