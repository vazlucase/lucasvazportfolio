import type { SVGProps } from 'react';

const paths = {
  arrow: 'M5 19 19 5M5 5h14v14',
  down: 'M12 4v16m-7-7 7 7 7-7',
  right: 'M4 12h16m-7-7 7 7-7 7',
  close: 'm6 6 12 12M18 6 6 18',
  menu: 'M4 8h16M4 16h16',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  play: 'm8 5 11 7-11 7V5Z',
  copy: 'M9 9h11v11H9zM15 9V4H4v11h5',
  check: 'm5 12 4 4L19 6',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z',
};

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function StarMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" {...props}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="44"
          y="1"
          width="12"
          height="49"
          rx="1"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
    </svg>
  );
}
