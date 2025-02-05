import React from 'react';

interface CalloutBoxProps {
  type?: 'info' | 'warning' | 'tip' | 'important';
  title?: string;
  children?: React.ReactNode;
}

export function CalloutBox({ type = 'info', title, children }: CalloutBoxProps) {
  const config = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      accent: 'text-blue-500',
      icon: 'tabler:info-circle'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      accent: 'text-yellow-500',
      icon: 'tabler:alert-triangle'
    },
    tip: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      accent: 'text-green-500',
      icon: 'tabler:bulb'
    },
    important: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      accent: 'text-red-500',
      icon: 'tabler:alert-circle'
    }
  };

  const styles = config[type];

  return (
    <div className={`${styles.bg} p-4 rounded-lg border ${styles.border} my-6`}>
      <div className="flex items-start gap-3">
        <span className={`${styles.accent} flex-shrink-0 mt-1`}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {type === 'warning' && (
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )}
            {type === 'tip' && (
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            )}
            {type === 'important' && (
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
            {(type === 'info' || !type) && (
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </span>
        <div className={`${styles.text} prose prose-sm max-w-none`}>
          {title && <div className="font-medium mb-1">{title}</div>}
          {children}
        </div>
      </div>
    </div>
  );
} 