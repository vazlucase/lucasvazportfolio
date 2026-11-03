import { createElement, forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { handleSectionNavigation } from '../../utils/sectionNavigation';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  target?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'unstyled';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    href,
    target,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    disabled,
    type = 'button',
    onClick,
    ...props
  },
  ref,
) {
  const external = href?.startsWith('https://') || href?.startsWith('http://');
  const content = (
    <>
      {children}
      {icon && <span className="button-icon">{icon}</span>}
    </>
  );
  const shared = {
    ...props,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      handleSectionNavigation(event);
    },
    className: `button button--${variant} button--${size} ${className}`.trim(),
    'aria-disabled': disabled || undefined,
  };

  if (href && !disabled) {
    return createElement(
      'a',
      {
        ...shared,
        href,
        target: target ?? (external ? '_blank' : undefined),
        rel: external ? 'noopener noreferrer' : undefined,
      },
      content,
    );
  }
  return createElement('button', { ...shared, ref, disabled, type }, content);
});
