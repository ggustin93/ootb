import { getPermalink, getBlogPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Le festival',
      href: getPermalink('/festival'),
      links: [
        {
          text: 'Infos pratiques',
          href: getPermalink('/festival#infos-pratiques'),
        },
        {
          text: 'Programme', 
          href: getPermalink('/festival#programme'),
        },
        {
          text: 'Tickets',
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
          href: getBlogPermalink() + '?category=premium',
        },
        {
          text: 'Podcasts',
          href: getBlogPermalink() + '?category=podcasts',
        },
        {
          text: 'Pédagoscope',
          href: getBlogPermalink() + '?category=tv',
        },
        {
          text: 'Live Facebook',
          href: getBlogPermalink() + '?category=live',
        },
        {
          text: 'Fiches pédagogiques',
          href: getBlogPermalink() + '?category=fiches',
        },
      ],
    },
    {
      text: 'Appel à projet',
      href: getPermalink('/appel-a-projets'),
    },
    {
      text: 'À propos',
      href: getPermalink('/a-propos'),
      links: [
        {
          text: 'Nos Missions',
          href: getPermalink('/a-propos#nos-missions'),
        },
        {
          text: 'Notre Équipe',
          href: getPermalink('/a-propos#notre-equipe'),
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
        { text: 'Notre Vision', href: getPermalink('/a-propos#notre-vision') },
        { text: 'Nos Valeurs', href: getPermalink('/a-propos#nos-valeurs') },
        { text: 'Nos Missions', href: getPermalink('/a-propos#nos-missions') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      title: 'Nos contenus',
      links: [
        { text: 'Tous les contenus', href: getBlogPermalink() },
        { text: 'Premium', href: getBlogPermalink() + '?category=premium' },
        { text: 'Podcasts', href: getBlogPermalink() + '?category=podcasts' },
        { text: 'Pédagoscope', href: getBlogPermalink() + '?category=tv' },
        { text: 'Live Facebook', href: getBlogPermalink() + '?category=live' },
        { text: 'Fiches pédagogiques', href: getBlogPermalink() + '?category=fiches' },
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
    Out of the Books ASBL · Tous droits réservés © ${new Date().getFullYear()}
  `,
};
