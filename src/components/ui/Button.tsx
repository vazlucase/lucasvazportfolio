import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

const variantStyles = {
  primary: {
    background: 'var(--button-primary-bg, var(--fg))',
    color: 'var(--button-primary-color, var(--bg))',
    border: 'none',
  },
  secondary: {
    background: 'var(--button-secondary-bg, transparent)',
    color: 'var(--button-secondary-color, var(--fg))',
    border: '1px solid var(--card-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--fg-muted)',
    border: 'none',
  },
  outline: {
    background: 'transparent',
    color: 'var(--fg)',
    border: '1px solid var(--fg)',
  },
};

const sizeStyles = {
  sm: { padding: '6px 16px', fontSize: '12px', gap: '6px' },
  md: { padding: '10px 24px', fontSize: '14px', gap: '8px' },
  lg: { padding: '14px 32px', fontSize: '16px', gap: '10px' },
};

export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
}: ButtonProps) {
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizeStyles[size].gap,
    padding: sizeStyles[size].padding,
    fontSize: sizeStyles[size].fontSize,
    fontWeight: 500,
    letterSpacing: '0.5px',
    borderRadius: '100px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    textDecoration: 'none',
    ...variantStyles[variant],
  };

  const content = (
    <>
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={styles}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onClick) onClick();
      }}
      disabled={disabled}
      className={className}
      style={styles}
    >
      {content}
    </button>
  );
}