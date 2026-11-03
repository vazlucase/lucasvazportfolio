import { createElement, forwardRef } from 'react';
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
import { handleSectionNavigation } from '../../utils/sectionNavigation';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function Heading({ as = 'h2', children, ...props }: HeadingProps) {
  return createElement(as, props, children);
}

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'small';
}

export function Text({ as = 'p', children, ...props }: TextProps) {
  return createElement(as, props, children);
}

export const TextLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(function TextLink({ children, href, target, rel, onClick, ...props }, ref) {
  const external = href?.startsWith('https://') || href?.startsWith('http://');
  return createElement(
    'a',
    {
      ...props,
      href,
      ref,
      target: target ?? (external ? '_blank' : undefined),
      rel: rel ?? (external ? 'noopener noreferrer' : undefined),
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        handleSectionNavigation(event);
      },
    },
    children,
  );
});
