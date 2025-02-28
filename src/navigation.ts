import { getPermalink, getBlogPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Festival',
      href: getPermalink('/festival'),
      links: [
        {
          text: 'Vue d\'ensemble',
          href: getPermalink('/festival'),
        },
        {
          text: 'Billetterie',
          href: getPermalink('/festival#tickets'),
        },
        {
          text: 'A propos',
          href: getPermalink('/festival#features'),
        },
        {
          text: 'Programme',
          href: getPermalink('/festival#programme'),
        },
        {
          text: 'Thématiques',
          href: getPermalink('/festival#themes'),
        },
        {
          text: 'Informations pratiques',
          href: getPermalink('/festival#accessibility'),
        },
        {
          text: 'Partenaires',
          href: getPermalink('/festival#partenaires'),
        }
      ]
    },
    {
      text: 'Nos contenus',
      href: getBlogPermalink(),
      links: [
        {
          text: 'Tous les contenus',
          href: getBlogPermalink(),
        },
        {
          text: 'Podcasts',
          href: getPermalink('/category/podcast'),
        },
        {
          text: 'Emissions TV',
          href: getPermalink('/category/tv'),
        },
        {
          text: 'Live Facebook',
          href: getPermalink('/category/live'),
        },
        {
          text: 'Fiches pédagogiques',
          href: getPermalink('/category/fiche'),
        },
        {
          text: 'Contenu premium',
          href: getPermalink('/category/premium#category-content'),
        },
      ],
    },
    {
      text: 'Appel à projet',
      href: getPermalink('/appel-a-projets'),
      links: [
        {
          text: 'Vue d\'ensemble',
          href: getPermalink('/appel-a-projets'),
        },
        {
          text: 'Critères',
          href: getPermalink('/appel-a-projets#criteres'),
        },
        {
          text: 'Processus',
          href: getPermalink('/appel-a-projets#processus'),
        },
        {
          text: 'Soumettre un projet',
          href: getPermalink('/appel-a-projets#formulaire'),
        },
      ],
    },
    {
      text: 'À propos',
      href: getPermalink('/a-propos'),
      links: [
        {
          text: 'Vue d\'ensemble',
          href: getPermalink('/a-propos'),
        },
        {
          text: 'Qui sommes-nous',
          href: getPermalink('/a-propos#qui-sommes-nous'),
        },
        {
          text: 'Notre Vision',
          href: getPermalink('/a-propos#vision'),
        },
        {
          text: 'Nos Missions',
          href: getPermalink('/a-propos#missions'),
        },
        {
          text: 'Nos Valeurs',
          href: getPermalink('/a-propos#valeurs'),
        },
        {
          text: 'Notre Équipe',
          href: getPermalink('/a-propos#equipe'),
        },
        {
          text: 'Nos Partenaires',
          href: getPermalink('/a-propos#partenaires'),
        },
      ],
    },
  ],
  mobileLinks: [
    {
      links: [
        { text: 'Accueil', href: '/' },
        { text: 'Festival', href: getPermalink('/festival') },
        { text: 'Podcasts', href: getPermalink('/category/podcast') },
        { text: 'Pédagoscope', href: getPermalink('/category/tv') },
        { text: 'Appel à projet', href: getPermalink('/appel-a-projets') },
        { text: 'À propos', href: getPermalink('/a-propos') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
  ],
  actions: [
    { 
      text: 'Rejoindre la communauté', 
      href: '/#rejoindre',
      variant: 'outline'
    }
  ],
};

export const footerData = {
  mobileLinks: [
    {
      links: [
        { text: 'Accueil', href: '/' },
        { text: 'Festival', href: getPermalink('/festival') },
        { text: 'Podcasts', href: getPermalink('/category/podcast') },
        { text: 'Pédagoscope', href: getPermalink('/category/tv') },
        { text: 'Appel à projet', href: getPermalink('/appel-a-projets') },
        { text: 'À propos', href: getPermalink('/a-propos') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
  ],
  links: [
    {
      title: 'Le festival',
      links: [
        { text: 'Vue d\'ensemble', href: getPermalink('/festival') },
        { text: 'Programme 2024', href: getPermalink('/festival#programme') },
        { text: 'Billetterie', href: getPermalink('/festival#tickets') },
        { text: 'Infos pratiques', href: getPermalink('/festival#accessibility') },
      ],
    },
    {
      title: 'Nos contenus',
      links: [
        { text: 'Tous les contenus', href: getBlogPermalink() },
        { text: 'Podcasts', href: getPermalink('/category/podcast') },
        { text: 'Pédagoscope', href: getPermalink('/category/tv') },
        { text: 'Fiches pédagogiques', href: getPermalink('/category/fiche') },
      ],
    },
    {
      title: 'À propos',
      links: [
        { text: 'Qui sommes-nous', href: getPermalink('/a-propos') },
        { text: 'Notre équipe', href: getPermalink('/a-propos#equipe') },
        { text: 'Nos partenaires', href: getPermalink('/a-propos#partenaires') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
  ],
  legalLinks: [
    { text: 'Mentions légales', href: getPermalink('/terms') },
    { text: 'Politique de confidentialité', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: '#' },
  ],
  footNote: `
    Out of the Books ASBL © ${new Date().getFullYear()}
  `,
  ecoDesignBadge: {
    text: 'Site écoconçu et optimisé',
    icon: 'tabler:leaf',
    details: 'Plus écologique que 90% des sites web testés',
    href: 'https://ecograder.com/report/TrgEqfROsdPhDzYeM8WhdI7y'
  }
};