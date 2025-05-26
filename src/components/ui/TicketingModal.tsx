import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

interface TicketingModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  ticketingConfig?: {
    modalText: string;
    ifpcButtonLabel: string;
    ifpcButtonUrl: string;
    weezeventButtonLabel: string;
    weezeventButtonUrl: string;
  };
}

// Valeurs par défaut qui correspondent à la structure dans festival.ticketing
const DEFAULT_CONFIG = {
  modalText: "Le Festival Out of the Books est en attente de la reconnaissance de l'IFPC. Si vous êtes enseignant-e, nous vous invitons à consulter cette page ultérieurement. Merci pour votre compréhension.\n\nSinon, utilisez notre billetterie générale Weezevent en cliquant ci-dessous.",
  ifpcButtonLabel: "Billetterie IFPC",
  ifpcButtonUrl: "https://ifpc-fwb.be",
  weezeventButtonLabel: "Billetterie générale",
  weezeventButtonUrl: "https://widget.weezevent.com/ticket/E1310259/?code=56689&locale=fr-FR&width_auto=1&color_primary=00AEEF"
};

export default function TicketingModal({ 
  id, 
  isOpen, 
  onClose, 
  ticketingConfig = DEFAULT_CONFIG
}: TicketingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // Handle navigation clicks to close modal
    const handleNavigationClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && isOpen) {
        const href = link.getAttribute('href');
        // Close modal if navigating to a different page (not just anchors)
        if (href && !href.startsWith('#') && !href.includes('#tickets')) {
          onClose();
        }
      }
    };

    // Handle browser navigation (back/forward buttons)
    const handlePopState = () => {
      if (isOpen && !window.location.hash.includes('tickets')) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleNavigationClick);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleNavigationClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const openWeezeventModal = (e: React.MouseEvent) => {
    e.preventDefault();
    const w = window.open(
      ticketingConfig.weezeventButtonUrl,
      'Billetterie_weezevent',
      'width=650, height=600, top=100, left=100, toolbar=no, resizable=yes, scrollbars=yes, status=no'
    );
    if (w) w.focus();
    return false;
  };

  // Séparer le texte en paragraphes
  const paragraphs = ticketingConfig.modalText.split('\n\n');

  return (
    <div
      ref={modalRef}
      id={id}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-medium text-gray-900">Réserver mes tickets</h2>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 transition-colors"
              onClick={onClose}
            >
              <span className="sr-only">Fermer</span>
              <Icon icon="tabler:x" className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-8">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className={`text-gray-600 ${index < paragraphs.length - 1 ? 'mb-4' : ''}`}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={ticketingConfig.ifpcButtonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex justify-center items-center gap-2 rounded-full bg-gray-100 px-6 py-3 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Icon icon="tabler:school" className="w-5 h-5" />
              <span>{ticketingConfig.ifpcButtonLabel}</span>
            </a>
            <a
              href={ticketingConfig.weezeventButtonUrl}
              onClick={openWeezeventModal}
              className="flex-1 inline-flex justify-center items-center gap-2 rounded-full bg-[--ootb-orange] px-6 py-3 text-white hover:bg-[--ootb-orange]/90 transition-colors"
            >
              <Icon icon="tabler:ticket" className="w-5 h-5" />
              <span>{ticketingConfig.weezeventButtonLabel}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
