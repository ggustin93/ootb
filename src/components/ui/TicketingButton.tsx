import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import TicketingModal from './TicketingModal';

interface TicketingButtonProps {
  icon: string;
  label: string;
  variant: 'primary' | 'secondary';
  className?: string;
  openOnLoad?: boolean;
}

export default function TicketingButton({ icon, label, variant, className = '', openOnLoad = false }: TicketingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(openOnLoad);

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

  const handleClick = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (window.location.hash === '#tickets') {
      setIsModalOpen(true);
    }

    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('openTicketingModal', handleOpenModal);
    document.addEventListener('astro:after-swap', () => {
      if (window.location.hash === '#tickets') {
        setIsModalOpen(true);
      }
    });

    return () => {
      window.removeEventListener('openTicketingModal', handleOpenModal);
      document.removeEventListener('astro:after-swap', handleOpenModal);
    };
  }, []);

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
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
