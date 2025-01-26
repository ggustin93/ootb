export const CONTENT_TYPES = {
  actualite: {
    label: 'ACTUALITÉ',
    color: '#4B5563', // Gris neutre
    icon: 'tabler:news',
    badgeClass: 'bg-gray-600'
  },
  fiche: {
    label: 'FICHE PÉDAGOGIQUE',
    color: '#2091BC', // OOTB Blue
    icon: 'tabler:file-text',
    badgeClass: 'bg-[#2091BC]'
  },
  live: {
    label: 'LIVE FACEBOOK',
    color: '#1877F2', // Facebook Blue
    icon: 'tabler:brand-facebook',
    badgeClass: 'bg-[#1877F2]'
  },
  podcast: {
    label: 'PODCAST',
    color: '#8D216D', // Purple
    icon: 'tabler:microphone',
    badgeClass: 'bg-[#8D216D]'
  },
  tv: {
    label: 'TV',
    color: '#2EBF4D', // Green
    icon: 'tabler:device-tv',
    badgeClass: 'bg-[#2EBF4D]'
  },
  premium: {
    label: 'PREMIUM',
    color: '#E4451E', // Orange/Red
    icon: 'tabler:crown',
    badgeClass: 'bg-[#E4451E]'
  }
} as const; 