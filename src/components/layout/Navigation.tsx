import { useState, useEffect } from 'react';

interface NavigationProps {
  bgValue: number;
  navOpacity: number;
}

export function Navigation({ bgValue, navOpacity }: NavigationProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: 'sobre', href: '#sobre' },
    { name: 'skills', href: '#skills' },
    { name: 'projetos', href: '#projetos' },
    { name: 'contato', href: '#contato' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 48px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: `rgba(${bgValue}, ${bgValue}, ${bgValue}, ${navOpacity * 0.85})`,
        backdropFilter: navOpacity > 0.1 ? 'blur(20px) saturate(1.2)' : 'none',
        borderBottom: navOpacity > 0.5 ? '1px solid var(--border-subtle)' : '1px solid transparent',
        transition: 'border-bottom 0.3s ease',
      }}
    >
      <a
        href="#top"
        style={{
          textDecoration: 'none',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 3,
        }}
      >
        LCV
      </a>

      <div
        className="nav-links-desktop"
        style={{
          display: 'flex',
          gap: 36,
          alignItems: 'center',
        }}
      >
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="nav-link"
            style={{
              position: 'relative',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontSize: 13,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              fontWeight: 400,
              padding: '4px 0',
            }}
          >
            {item.name}
            <style>{`
              .nav-link::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 1px;
                background: var(--text-primary);
                transform: scaleX(0);
                transform-origin: right;
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .nav-link:hover::after {
                transform: scaleX(1);
                transform-origin: left;
              }
            `}</style>
          </a>
        ))}
      </div>

      <div
        className="nav-links-mobile"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-links-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .nav-links-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}