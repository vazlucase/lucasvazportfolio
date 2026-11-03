import type { MouseEvent } from 'react';

export function handleSectionNavigation(event: MouseEvent<HTMLElement>) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) return;

  const link = event.currentTarget;
  if (
    !(link instanceof HTMLAnchorElement) ||
    link.hasAttribute('download') ||
    (link.target && link.target !== '_self')
  ) return;

  const href = link.getAttribute('href');
  if (!href?.startsWith('#') || href.length === 1) return;

  let id: string;
  try {
    id = decodeURIComponent(href.slice(1));
  } catch {
    return;
  }
  const section = document.getElementById(id);
  if (!section) return;

  // Keep section links inside the page instead of triggering preview navigation.
  event.preventDefault();
  // Let a menu's close handler release its scroll lock and restore focus first.
  requestAnimationFrame(() => {
    const temporaryTabIndex = !section.hasAttribute('tabindex');
    if (temporaryTabIndex) {
      section.setAttribute('tabindex', '-1');
      section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
    }
    section.focus({ preventScroll: true });
    section.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  });
}
