import hero from '~/assets/images/ootb-logo.svg';
import team from '~/assets/images/ootb_team.webp';

export const metadata = {
  title: "Out of the Books | Plateforme collaborative pour l'éducation",
  description: "Contenus experts et événements inspirants pour les acteurs de l'éducation. Rejoignez une communauté de 3000+ innovateurs qui réinventent l'éducation.",
};

export const heroContent = {
  title: {
    line1: 'La plateforme',
    line2: 'des pédagogies',
    line3: 'innovantes !'
  },
  subtitle: "La plateforme des pédagogies innovantes !",
  image: hero,
  primaryCTA: {
    text: "Découvrir Nos contenus",
    href: "/contenus"
  },
  secondaryCTA: {
    text: "Notre festival 2025",
    href: "/festival"
  },
  badge: {
    text: 'OUT of the books'
  }
};

export const stats = [
  { number: '3000+', label: 'Membres actifs' },
  { number: '450+', label: 'Participants Festival' },
  { number: '24+', label: 'Lives par an' },
  { number: '70+', label: 'Ressources pédagogiques' }
];

export const upcomingEvents = [
  {
    title: 'Festival 2025',
    date: '2025-05-25',
    description: "3 jours d'innovation pédagogique avec plus de 50 experts",
    badge: 'Festival 2025',
    badgeColor: 'primary',
    link: '/festival',
    cols: 2,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'
  },
  {
    title: 'La pédagogie active',
    date: '2024-04-20',
    description: 'Live Facebook avec Dr. Marie Durant',
    badge: 'Live Facebook',
    badgeColor: 'secondary',
    link: 'https://facebook.com/outofthebooks',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80'
  }
];

export const featuredPodcasts = [
  {
    title: "Les neurosciences en classe",
    description: "Découvrez les dernières avancées en neurosciences appliquées à l'éducation",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800",
    duration: "1h 12min"
  },
  {
    title: "La pédagogie active",
    description: "Guide complet et pratique pour une classe dynamique",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    duration: "58min"
  }
];

export const featuredCards = [
  {
    href: "/premium/learning-game",
    title: "L'apprentissage par le jeu",
    description: "Une analyse approfondie avec les meilleurs experts du domaine",
    image: "https://images.unsplash.com/photo-1632571401005-458e9d244591",
    badge: "Premium",
    type: "default",
    meta: {
      expert: "Dr. Marie Lambert",
      duration: "45 min de lecture",
      contributors: "12 contributeurs"
    }
  },
  {
    href: "/podcast/ep45",
    title: "L'intelligence émotionnelle à l'école",
    description: "Comment développer l'intelligence émotionnelle des élèves ?",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136",
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
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc",
    badge: "TV",
    type: "tv",
    meta: {
      duration: "26 min",
      expert: "Pédagoscope"
    }
  }
];

export const images = {
  hero: hero,
  about: team,
  featured: {
    main: hero,
    podcast1: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2940&auto=format&fit=crop",
    podcast2: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2940&auto=format&fit=crop",
  },
  premium: {
    neurosciences: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop&q=80",
    pedagogie: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
  }
};

export const aboutFeatures = [
  "Un festival annuel qui rassemble les acteurs du changement éducatif",
  "Un podcast et une émission TV qui mettent en lumière les bonnes pratiques éducatives.",
  "Un appel à projets qui valorise le métier d'enseignant et qui soutient le partage de pratiques innovantes."
];

export const premiumFeatures = [
  "Accès illimité à tous Nos contenus experts",
  "Participation privilégiée aux événements",
  "Ressources pédagogiques exclusives",
  "Networking avec la communauté"
];