import { getPermalink, getBlogPermalink } from './utils/permalinks';
import navigationData from './content/navigation/index.json';
import type { AstroGlobal } from 'astro';
import defaultNavigationData from '~/content/navigation/index.json';

// Types pour la navigation
interface NavigationLink {
  text: string;
  href: string;
  links?: NavigationLink[];
  variant?: string;
  ariaLabel?: string;
  icon?: string;
}

interface NavigationGroup {
  title?: string;
  links: NavigationLink[];
}

// Fonction pour traiter les liens et appliquer les fonctions de permalien
function processLinks(links: NavigationLink[]): NavigationLink[] {
  return links.map(link => {
    const processedLink = { ...link };
    
    // Traiter l'attribut href
    if (link.href) {
      if (link.href === '/blog') {
        processedLink.href = getBlogPermalink();
      } else if (link.href.startsWith('/')) {
        processedLink.href = getPermalink(link.href);
      }
    }
    
    // Traiter les sous-liens récursivement si présents
    if (link.links && Array.isArray(link.links)) {
      processedLink.links = processLinks(link.links);
    }
    
    return processedLink;
  });
}

// Traiter les données de navigation
const processedHeaderLinks = navigationData.header.links ? processLinks(navigationData.header.links as NavigationLink[]) : [];
const processedHeaderMobileLinks = navigationData.header.mobileLinks ? 
  navigationData.header.mobileLinks.map(group => ({
    ...group,
    links: group.links ? processLinks(group.links as NavigationLink[]) : []
  })) : [];
const processedHeaderActions = navigationData.header.actions ? processLinks(navigationData.header.actions as NavigationLink[]) : [];

const processedFooterLinks = navigationData.footer.links ? 
  navigationData.footer.links.map(group => ({
    ...group,
    links: group.links ? processLinks(group.links as NavigationLink[]) : []
  })) : [];
const processedFooterMobileLinks = navigationData.footer.mobileLinks ? 
  navigationData.footer.mobileLinks.map(group => ({
    ...group,
    links: group.links ? processLinks(group.links as NavigationLink[]) : []
  })) : [];
const processedLegalLinks = navigationData.footer.legalLinks ? processLinks(navigationData.footer.legalLinks as NavigationLink[]) : [];

// Exporter les données traitées
export const headerData = {
  links: processedHeaderLinks,
  mobileLinks: processedHeaderMobileLinks,
  actions: processedHeaderActions,
};

export const footerData = {
  links: processedFooterLinks,
  mobileLinks: processedFooterMobileLinks,
  legalLinks: processedLegalLinks,
  socialLinks: navigationData.footer.socialLinks || [],
  footNote: navigationData.footer.footNote || `Out of the Books ASBL © ${new Date().getFullYear()}`,
  ecoDesignBadge: navigationData.footer.ecoDesignBadge || {
    text: 'Site écoconçu et optimisé',
    icon: 'tabler:leaf',
    details: 'Plus écologique que 90% des sites web testés',
    href: 'https://ecograder.com/report/TrgEqfROsdPhDzYeM8WhdI7y'
  },
  footerDescription: navigationData.footer.footerDescription || "Out of the Books connecte et inspire les acteurs du changement éducatif en Francophonie. Notre festival et Nos contenus créent des espaces d'échange pour réinventer l'éducation.",
};

export interface Link {
  text?: string;
  href?: string;
  ariaLabel?: string;
  icon?: string;
}

export interface Links {
  title?: string;
  links: Array<Link>;
}

export interface HeaderProps {
  links?: Array<Link>;
  actions?: Array<Link>;
  isSticky?: boolean;
  showToggleTheme?: boolean;
  position?: string;
}

export interface FooterProps {
  links?: Array<Links>;
  socialLinks?: Array<Link>;
  legalLinks?: Array<Link>;
  footNote?: string;
  ecoDesignBadge?: {
    text: string;
    icon: string;
    details: string;
    href: string;
  };
  mobileLinks?: Array<Links>;
  footerDescription?: string;
}

export interface NavigationProps {
  header: HeaderProps;
  footer: FooterProps;
}

const getNavigation = async (): Promise<NavigationProps> => {
  // Essayer de charger les données de navigation depuis l'API
  let navigationData;
  try {
    const response = await fetch('/api/navigation');
    if (response.ok) {
      navigationData = await response.json();
    } else {
      throw new Error('Failed to fetch navigation data');
    }
  } catch (error) {
    // En cas d'erreur, utiliser les données par défaut
    navigationData = defaultNavigationData;
  }

  return {
    header: {
      links: navigationData.header.links || [],
      actions: navigationData.header.actions || [],
      isSticky: true,
      showToggleTheme: false,
      position: 'right',
    },
    footer: {
      links: navigationData.footer.links || [],
      mobileLinks: navigationData.footer.mobileLinks || [],
      legalLinks: navigationData.footer.legalLinks || [],
      socialLinks: navigationData.footer.socialLinks || [],
      footNote: navigationData.footer.footNote || `Out of the Books ASBL © ${new Date().getFullYear()}`,
      footerDescription: navigationData.footer.footerDescription || "Out of the Books connecte et inspire les acteurs du changement éducatif en Francophonie. Notre festival et Nos contenus créent des espaces d'échange pour réinventer l'éducation.",
      ecoDesignBadge: navigationData.footer.ecoDesignBadge || {
        text: "Site écoconçu et optimisé",
        icon: "tabler:leaf",
        details: "Plus écologique que 90% des sites web testés",
        href: "https://ecograder.com"
      },
    },
  };
};

let _navigation: NavigationProps;

export const getNavigationSingleton = async (): Promise<NavigationProps> => {
  if (!_navigation) {
    _navigation = await getNavigation();
  }
  return _navigation;
};

export default getNavigation;