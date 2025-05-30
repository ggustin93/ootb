import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import TicketingModal from './TicketingModal';
import type { TinaMarkdownContent } from 'tinacms/dist/rich-text';

// Define the ticketingConfig structure, same as in TicketingModalProps
interface TicketingConfig {
  modalText: TinaMarkdownContent | string; // Accept both string and rich text
  ifpcButtonLabel: string;
  ifpcButtonUrl: string;
  weezeventButtonLabel: string;
  weezeventButtonUrl: string;
}

interface TicketingButtonProps {
  icon: string;
  label: string;
  variant: 'primary' | 'secondary';
  className?: string;
  _openOnLoad?: boolean;
  ticketingConfig?: TicketingConfig; // <-- Add ticketingConfig prop
}

export default function TicketingButton({ 
  icon, 
  label, 
  variant, 
  className = '', 
  _openOnLoad = false, 
  ticketingConfig // <-- Destructure ticketingConfig
}: TicketingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkHashAndOpenModal = () => {
      const currentHash = window.location.hash;
      // Check for #tickets, /#tickets, #tickets/, /#tickets/
      if (currentHash === '#tickets' || currentHash === '/#tickets' || currentHash === '#tickets/' || currentHash === '/#tickets/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          setIsModalOpen(true);
        }, 100);
      }
    };

    // Check on initial load
    checkHashAndOpenModal();

    // Listen for hash changes
    window.addEventListener('hashchange', checkHashAndOpenModal);

    return () => {
      window.removeEventListener('hashchange', checkHashAndOpenModal);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Open modal directly on click
    setIsModalOpen(true);
    // Also set hash for consistency
    window.location.hash = '#tickets';
  };

  const handleClose = () => {
    setIsModalOpen(false);
    const currentHash = window.location.hash;
    if (currentHash === '#tickets' || currentHash === '/#tickets' || currentHash === '#tickets/' || currentHash === '/#tickets/') {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  const variants = {
    primary: 'bg-white border-2 border-[--ootb-orange] text-[--ootb-orange] hover:bg-[--ootb-orange] hover:text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/20'
  };

  const focusRings = {
    primary: 'focus:ring-[--ootb-orange]',
    secondary: 'focus:ring-white/50'
  };

  const baseClass = [
    'inline-flex items-center justify-center gap-2 font-medium rounded-full',
    'px-6 sm:px-8 py-3 sm:py-4 text-lg',
    variants[variant],
    focusRings[variant],
    'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'hover:-translate-y-0.5',
    'group',
    className
  ].filter(Boolean).join(' ');

  const iconClass = 'w-6 h-6 transition-transform duration-300 group-hover:-translate-x-0.5';

  return (
    <>
      <button
        type="button"
        className={baseClass}
        onClick={handleClick}
      >
        <Icon icon={`tabler:${icon}`} className={iconClass} />
        <span className="font-medium">{label}</span>
      </button>

      <TicketingModal
        id="ticketing-modal"
        isOpen={isModalOpen}
        onClose={handleClose}
        ticketingConfig={ticketingConfig} // <-- Pass ticketingConfig to TicketingModal
      />
    </>
  );
}