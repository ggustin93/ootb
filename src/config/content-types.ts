export const CONTENT_TYPES = {
  actualite: {
    label: 'ACTUALITÉ',
    color: 'var(--content-actualite)',
    icon: 'tabler:news',
    variant: 'actualite'
  },
  fiche: {
    label: 'FICHE PÉDAGOGIQUE',
    color: 'var(--content-fiche)',
    icon: 'tabler:file-text',
    variant: 'appel'
  },
  live: {
    label: 'LIVE FACEBOOK',
    color: 'var(--content-live)',
    icon: 'tabler:brand-facebook',
    variant: 'live'
  },
  podcast: {
    label: 'PODCAST',
    color: 'var(--content-podcast)',
    icon: 'tabler:microphone',
    variant: 'podcast'
  },
  tv: {
    label: 'TV',
    color: 'var(--content-tv)',
    icon: 'tabler:device-tv',
    variant: 'emission'
  },
  premium: {
    label: 'PREMIUM',
    color: 'var(--content-premium)',
    icon: 'tabler:crown',
    variant: 'festival'
  }
} as const; 