import { getPermalink, getBlogPermalink } from './utils/permalinks';
import navigationData from './content/navigation/index.json';

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
  (navigationData.header.mobileLinks as NavigationGroup[]).map(group => ({
    ...group,
    links: group.links ? processLinks(group.links) : []
  })) : [];
const processedHeaderActions = navigationData.header.actions ? processLinks(navigationData.header.actions as NavigationLink[]) : [];

const processedFooterLinks = navigationData.footer.links ? 
  (navigationData.footer.links as NavigationGroup[]).map(group => ({
    ...group,
    links: group.links ? processLinks(group.links) : []
  })) : [];
const processedFooterMobileLinks = navigationData.footer.mobileLinks ? 
  (navigationData.footer.mobileLinks as NavigationGroup[]).map(group => ({
    ...group,
    links: group.links ? processLinks(group.links) : []
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
  }
};