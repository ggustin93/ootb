import { readNavigationFile, writeNavigationFile } from '../registerNavigation';

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

interface NavigationData {
  header: {
    links: NavigationLink[];
    mobileLinks: { links: NavigationLink[] }[];
    actions: NavigationLink[];
  };
  footer: {
    links: NavigationGroup[];
    mobileLinks: { links: NavigationLink[] }[];
    legalLinks: NavigationLink[];
    socialLinks: NavigationLink[];
    footNote: string;
    ecoDesignBadge: {
      text: string;
      icon: string;
      details: string;
      href: string;
    };
  };
}

// API pour la navigation
export default {
  // Récupérer les données de navigation
  getNavigation: async (): Promise<NavigationData | null> => {
    return readNavigationFile();
  },
  
  // Mettre à jour les données de navigation
  updateNavigation: async (data: NavigationData): Promise<boolean> => {
    return writeNavigationFile(data);
  }
}; 