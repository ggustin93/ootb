import { getPermalink, getBlogPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Festival',
      href: getPermalink('/festival'),
      links: [
        {
          text: 'À propos',
          href: getPermalink('/festival#about'),
        },
        {
          text: 'Thèmes', 
          href: getPermalink('/festival#themes'),
        },
        {
          text: 'Programme',
          href: getPermalink('/festival#programme'),
        },
        {
          text: 'Galerie photos',
          href: getPermalink('/festival#gallery'),
        },
        {
          text: 'Billetterie',
          href: getPermalink('/festival/tickets'),
        }
      ]
    },
    {
      text: 'Nos contenus',
      links: [
        {
          text: 'Tous les contenus',
          href: getBlogPermalink(),
        },
        {
          text: 'Premium',
          href: getPermalink('/category/premium'),
        },
        {
          text: 'Podcasts',
          href: getPermalink('/category/podcast'),
        },
        {
          text: 'Pédagoscope',
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
      ],
    },
    {
      text: 'Appel à projet',
      href: getPermalink('/appel-a-projets'),
      links: [
        {
          text: 'Processus',
          href: getPermalink('/appel-a-projets#processus'),
        },
        {
          text: 'Critères',
          href: getPermalink('/appel-a-projets#criteres'),
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
        {
          text: 'Contact',
          href: getPermalink('/contact'),
        },
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
  links: [
    {
      title: 'À propos',
      links: [
        { text: 'Qui sommes-nous', href: getPermalink('/a-propos#qui-sommes-nous') },
        { text: 'Notre Vision', href: getPermalink('/a-propos#vision') },
        { text: 'Nos Valeurs', href: getPermalink('/a-propos#valeurs') },
        { text: 'Nos Missions', href: getPermalink('/a-propos#missions') },
        { text: 'Notre Équipe', href: getPermalink('/a-propos#equipe') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      title: 'Nos contenus',
      links: [
        { text: 'Tous les contenus', href: getBlogPermalink() },
        { text: 'Premium', href: getPermalink('/category/premium') },
        { text: 'Podcasts', href: getPermalink('/category/podcast') },
        { text: 'Pédagoscope', href: getPermalink('/category/tv') },
        { text: 'Live Facebook', href: getPermalink('/category/live') },
        { text: 'Fiches pédagogiques', href: getPermalink('/category/fiche') },
      ],
    },
    {
      title: 'Le festival',
      links: [
        { text: 'Programme 2024', href: getPermalink('/festival#programme') },
        { text: 'Appel à projets', href: getPermalink('/appel-a-projets') },
        { text: 'Infos pratiques', href: getPermalink('/festival#infos-pratiques') },
        { text: 'Éditions précédentes', href: getPermalink('/festival/archives') },
      ],
    },
    {
      title: 'Légal',
      links: [
        { text: 'Mentions légales', href: getPermalink('/mentions-legales') },
        { text: 'Politique de confidentialité', href: getPermalink('/privacy') },
        { text: 'CGU', href: getPermalink('/cgu') },
      ],
    },
  ],
  socialLinks: [
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: '#' },
  //  { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `
    Out of the Books ASBL · Tous droits réservés ${new Date().getFullYear()}
  `,
};
