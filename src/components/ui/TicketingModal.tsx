import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

interface TicketingModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketingModal({ id, isOpen, onClose }: TicketingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

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
            <p className="text-gray-600 mb-4">
              Le Festival Out of the Books fait partie du programme des formations en Interréseaux organisées par l'IFPC.
            </p>
            <p className="text-gray-600">
              Si vous êtes enseignant·e, vous pouvez vous inscrire via la billetterie dédiée de l'IFPC. Sinon, utilisez notre billetterie générale Weezevent.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://ifpc-fwb.be"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex justify-center items-center gap-2 rounded-full bg-[--ootb-orange] px-6 py-3 text-white hover:bg-[--ootb-orange]/90 transition-colors"
            >
              <Icon icon="tabler:school" className="w-5 h-5" />
              <span>Billetterie IFPC</span>
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex justify-center items-center gap-2 rounded-full bg-gray-100 px-6 py-3 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Icon icon="tabler:ticket" className="w-5 h-5" />
              <span>Billetterie générale</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
