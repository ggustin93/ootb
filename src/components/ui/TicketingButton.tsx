import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import TicketingModal from './TicketingModal';

interface TicketingButtonProps {
  icon: string;
  label: string;
  variant: 'primary' | 'secondary';
  className?: string;
  _openOnLoad?: boolean;
}

export default function TicketingButton({ icon, label, variant, className = '', _openOnLoad = false }: TicketingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkHashAndOpenModal = () => {
      const currentHash = window.location.hash;
      // console.log('TicketingButton: currentHash is', currentHash); // Debug log
      // Check for #tickets, /#tickets, #tickets/, /#tickets/
      if (currentHash === '#tickets' || currentHash === '/#tickets' || currentHash === '#tickets/' || currentHash === '/#tickets/') {
        // console.log('TicketingButton: Hash match found, opening modal.'); // Debug log
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          setIsModalOpen(true);
        }, 100);
      } else {
        // console.log('TicketingButton: No hash match for modal.'); // Debug log
      }
    };

    checkHashAndOpenModal();

    window.addEventListener('hashchange', checkHashAndOpenModal);

    return () => {
      window.removeEventListener('hashchange', checkHashAndOpenModal);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Consistently set the hash to /#tickets/ to match the primary case we want to trigger
    window.location.hash = '/#tickets/'; 
    // No need to call setIsModalOpen(true) here, as the hashchange listener will pick it up
    // and call checkHashAndOpenModal, which in turn calls setIsModalOpen(true).
  };

  const handleClose = () => {
    setIsModalOpen(false);
    const currentHash = window.location.hash;
    // console.log('TicketingButton: Closing modal, currentHash is', currentHash); // Debug log
    if (currentHash === '#tickets' || currentHash === '/#tickets' || currentHash === '#tickets/' || currentHash === '/#tickets/') {
      // console.log('TicketingButton: Clearing hash after modal close.'); // Debug log
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
      />
    </>
  );
}