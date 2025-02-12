import { useState } from 'react';
import { Icon } from '@iconify/react';
import TicketingModal from './TicketingModal';

interface TicketingButtonProps {
  icon: string;
  label: string;
  variant: 'primary' | 'secondary';
  className?: string;
}

export default function TicketingButton({ icon, label, variant, className = '' }: TicketingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        onClick={() => setIsModalOpen(true)}
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
