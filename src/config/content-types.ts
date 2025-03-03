// Importer les types de contenu depuis le fichier JSON géré par Tina
import blogData from '../content/blog/blog.json';

// Exporter les types de contenu
export const CONTENT_TYPES = blogData.contentTypes;

// Type helper
type ContentTypeConfig = {
  label: string;
  shortLabel: string;
  titlePrefix: string;
  titleSuffix?: string;
  pageTitle?: string;
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeCheck: Record<ContentType, ContentTypeConfig> = CONTENT_TYPES; 