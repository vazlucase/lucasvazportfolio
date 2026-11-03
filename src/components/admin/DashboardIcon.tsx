import type { SVGProps } from 'react';

const paths = {
  overview: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  audience: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 4a4 4 0 0 1 0 7M22 21v-2a4 4 0 0 0-3-3.87',
  content: 'M4 4h16v16H4zM4 9h16M9 9v11',
  conversions: 'M3 3v18h18M7 15l5-5 4 3 5-8M17 5h4v4',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3l-1 3-3 1-2 3 2 2-1 3 2 3h3l2 3h3l1-3 3-1 2-3-2-2 1-3-2-3h-3l-2-3Z',
  views: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',
  contact: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z',
  up: 'm7 14 5-5 5 5M12 9v11', down: 'm7 10 5 5 5-5M12 15V4',
  external: 'M15 3h6v6M10 14 21 3M21 14v6H4V3h6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  refresh: 'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 2l1 4M4 12l1 4a8 8 0 0 0 13 2',
  calendar: 'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2',
  link: 'M10 13a5 5 0 0 0 7 .5l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.5l-3 3a5 5 0 0 0 7 7l2-2',
  desktop: 'M3 3h18v13H3zM8 21h8M12 16v5',
  mobile: 'M7 2h10v20H7zM11 18h2',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  check: 'm5 12 4 4L19 6', close: 'm6 6 12 12M18 6 6 18',
  lock: 'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4',
  logout: 'M9 3H4v18h5M9 12h12m-5-5 5 5-5 5',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 11v6M12 7v1',
} as const;
export type DashboardIconName = keyof typeof paths;
export function DashboardIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: DashboardIconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}
