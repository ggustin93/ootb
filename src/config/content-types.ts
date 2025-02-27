export const CONTENT_TYPES = {
  all: {
    label: 'TOUS',
    shortLabel: 'Tous',
    titlePrefix: 'Tous',
    titleSuffix: 'contenus',
    pageTitle: 'Tous nos contenus',
    actionLabel: 'Voir tous les contenus',
    searchPlaceholder: 'Rechercher dans tous les contenus...',
    color: 'var(--gray-800)',
    icon: 'tabler:layout-grid',
    variant: 'default',
    description: "Découvrez nos podcasts, vidéos pédagogiques, fiches pratiques et contenus premium pour transformer l'éducation"
  },
  actualite: {
    label: 'ACTUALITÉS',
    shortLabel: 'Actualités',
    titlePrefix: 'Nos',
    titleSuffix: 'actualités',
    pageTitle: 'Nos actualités',
    actionLabel: 'Voir les actualités',
    color: 'var(--content-actualite)',
    icon: 'tabler:news',
    variant: 'actualite',
    description: "Restez informé des dernières innovations pédagogiques et des actualités du monde de l'éducation"
  },
  fiche: {
    label: 'FICHES PÉDAGOGIQUES',
    shortLabel: 'Fiches',
    titlePrefix: 'Nos',
    actionLabel: 'Voir les fiches',
    color: 'var(--content-fiche)',
    icon: 'tabler:file-text',
    variant: 'appel',
    description: "Des ressources pratiques et détaillées pour enrichir vos cours et activités pédagogiques"
  },
  live: {
    label: 'LIVES FACEBOOK',
    shortLabel: 'Lives',
    titlePrefix: 'Nos',
    actionLabel: 'Voir les lives',
    color: 'var(--content-live)',
    icon: 'tabler:brand-facebook',
    variant: 'live',
    description: "Participez à nos sessions en direct et interagissez avec notre communauté d'enseignants"
  },
  podcast: {
    label: 'PODCASTS',
    shortLabel: 'Podcasts',
    titlePrefix: 'Nos',
    actionLabel: 'Écouter les podcasts',
    color: 'var(--content-podcast)',
    icon: 'tabler:microphone',
    variant: 'podcast',
    description: "Écoutez nos discussions enrichissantes sur les enjeux de l'éducation moderne",
    links: [
      { icon: 'tabler:brand-spotify', label: 'Écoutez sur Spotify', url: 'https://open.spotify.com/show/education-mode-emploi' },
      { icon: 'tabler:brand-apple', label: 'Apple Podcasts', url: 'https://podcasts.apple.com/education-mode-emploi' },
      { icon: 'tabler:brand-youtube', label: 'YouTube', url: 'https://youtube.com/@education-mode-emploi' },
      { icon: 'tabler:microphone', label: 'Ausha', url: 'https://podcast.ausha.co/education-mode-d-emploi' }
    ]
  },
  tv: {
    label: 'ÉMISSIONS TV',
    shortLabel: 'Émissions TV',
    titlePrefix: 'Nos',
    actionLabel: 'Voir les émissions',
    color: 'var(--content-tv)',
    icon: 'tabler:device-tv',
    variant: 'emission',
    description: "Regardez nos émissions pédagogiques pour découvrir de nouvelles approches éducatives",
    links: [
      { icon: 'tabler:brand-facebook', label: 'Suivez-nous sur Facebook', url: 'https://facebook.com/pedagoscope' },
      { icon: 'tabler:mail', label: 'Contactez-nous', url: 'mailto:contact@pedagoscope.be' }
    ]
  },
  premium: {
    label: 'PREMIUM',
    shortLabel: 'Premium',
    titlePrefix: 'Contenu',
    titleSuffix: 'premium',
    pageTitle: 'Contenu hors-série exclusif',
    actionLabel: 'Découvrir le premium',
    color: 'var(--content-premium)',
    icon: 'tabler:crown',
    variant: 'festival',
    description: "Accédez à du contenu hors-série exclusif : interviews approfondies, analyses détaillées et ressources inédites",
    heroDescription: "Explorez notre sélection de contenus hors-série pour approfondir vos connaissances pédagogiques",
    links: [
      { icon: 'tabler:coffee', label: 'Faire un don', url: 'https://buymeacoffee.com/outofthebooks', variant: 'premium-primary' },
      { icon: 'tabler:arrow-left', label: 'Retour aux contenus', url: '/blog#category-content', variant: 'premium-secondary' }
    ],
    qrCode: {
      src: '~/assets/images/bmc_qr.png',
      alt: 'QR Code Buy Me a Coffee',
      caption: 'Scanner pour contribuer'
    }
  }
} as const;

// Type helper mis à jour sans searchPlaceholder
type ContentTypeConfig = {
  label: string;
  shortLabel: string;
  titlePrefix: string;
  titleSuffix: string;
  pageTitle: string;
  actionLabel: string;
  color: string;
  icon: string;
  variant: string;
  description: string;
  heroDescription?: string;
  links?: Array<{
    icon: string;
    label: string;
    url: string;
    variant?: string;
  }>;
  qrCode?: {
    src: string;
    alt: string;
    caption: string;
  };
};

// Vérification du type
export type ContentType = keyof typeof CONTENT_TYPES;
const _typeCheck: Record<ContentType, ContentTypeConfig> = CONTENT_TYPES; 