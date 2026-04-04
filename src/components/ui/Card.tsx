import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  link?: string;
}

const paddingMap = {
  sm: '20px',
  md: '24px',
  lg: '32px',
  xl: '36px',
};

export function Card({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'lg',
  onClick,
  link
}: CardProps) {
  const handleClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (onClick) {
      onClick();
    }
  };

  const isClickable = !!(link || onClick);

  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      onClick={handleClick}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '20px',
        padding: paddingMap[padding],
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, border-color 0.3s ease',
        cursor: isClickable ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.background = 'var(--card-hover)';
          e.currentTarget.style.transform = 'translateY(-6px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.background = 'var(--card-bg)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
      <style>{`
        .card-hover {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--fg-muted), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .card-hover:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}