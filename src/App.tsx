import { useState, useEffect } from 'react';
import { ParticleField } from './components/common/ParticleField';
import { ProgressBar } from './components/layout/ProgressBar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Projects } from './components/sections/Projects';
import { Contact } from './components/sections/Contact';
import { Marquee } from './components/ui/Marquee';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { useThemeTransition } from './hooks/useThemeTransition';
import './styles/globals.css';

// Definição dos temas
const darkThemeColors = {
  bg: '10,10,14',
  fg: '235,235,235',
  fgMuted: '0.6',
  fgSubtle: '0.12',
  cardBg: '0.06',
  cardBorder: '0.15',
  cardHover: '0.1',
  buttonPrimaryBg: 'var(--fg)',
  buttonPrimaryColor: 'var(--bg)',
  buttonSecondaryColor: 'var(--fg)',
  buttonSecondaryBorder: '1px solid var(--card-border)',
  divider: 'var(--fg-subtle)',
};

const lightThemeColors = {
  bg: '252,251,248',
  fg: '28,28,28',
  fgMuted: '0.7',
  fgSubtle: '0.2',
  cardBg: '0.04',
  cardBorder: '0.2',
  cardHover: '0.08',
  buttonPrimaryBg: '#000000',
  buttonPrimaryColor: '#FFFFFF',
  buttonSecondaryColor: '#2d2d2d',
  buttonSecondaryBorder: '1px solid rgba(0,0,0,0.2)',
  divider: '#E5E5E5',
};

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  const { isDark, toggleTheme, currentColors, isTransitioning } = useThemeTransition(
    darkThemeColors,
    lightThemeColors,
    400
  );

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sincroniza as CSS vars no :root para que portais (ex: Modal) as herdem
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', `rgb(${currentColors.bg})`);
    root.style.setProperty('--fg', `rgb(${currentColors.fg})`);
    root.style.setProperty('--fg-muted', `rgba(${currentColors.fg}, ${currentColors.fgMuted})`);
    root.style.setProperty('--fg-subtle', `rgba(${currentColors.fg}, ${currentColors.fgSubtle})`);
    root.style.setProperty('--card-bg', `rgba(${currentColors.fg}, ${currentColors.cardBg})`);
    root.style.setProperty('--card-border', `rgba(${currentColors.fg}, ${currentColors.cardBorder})`);
    root.style.setProperty('--card-hover', `rgba(${currentColors.fg}, ${currentColors.cardHover})`);
    root.style.setProperty('--divider', currentColors.divider);
    root.style.setProperty('--bg-rgb', currentColors.bg);
    root.style.setProperty('--fg-rgb', currentColors.fg);
  }, [currentColors]);

  const totalHeight = typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1;
  const scrollProgress = Math.min(scrollY / (totalHeight || 1), 1);
  const navOpacity = Math.min(scrollY / 300, 1);

  // Cores atuais
  const bgColor = `rgb(${currentColors.bg})`;
  const fgColor = `rgb(${currentColors.fg})`;
  const fgMuted = `rgba(${currentColors.fg}, ${currentColors.fgMuted})`;
  const fgSubtle = `rgba(${currentColors.fg}, ${currentColors.fgSubtle})`;
  const cardBg = `rgba(${currentColors.fg}, ${currentColors.cardBg})`;
  const cardBorder = `rgba(${currentColors.fg}, ${currentColors.cardBorder})`;
  const cardHover = `rgba(${currentColors.fg}, ${currentColors.cardHover})`;
  const divider = currentColors.divider;

  const bgRgb = currentColors.bg;
  const fgRgb = currentColors.fg;

  const cssVars = {
    '--bg': bgColor,
    '--fg': fgColor,
    '--fg-muted': fgMuted,
    '--fg-subtle': fgSubtle,
    '--card-bg': cardBg,
    '--card-border': cardBorder,
    '--card-hover': cardHover,
    '--divider': divider,
    '--bg-rgb': bgRgb,
    '--fg-rgb': fgRgb,
  } as React.CSSProperties;

  // Configurações visuais adicionais
  const selection = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(28,28,28,0.12)';
  const selectionColor = isDark ? '#fff' : '#1c1c1c';
  const scrollThumb = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(28,28,28,0.15)';
  const grainOpacity = isDark ? 0.5 : 0.25;
  const statusGlow = isDark ? '#4ade80' : '#16a34a';
  const gridOpacity = isDark ? 0.08 : 0.03;
  const marqueeColor = isDark ? 'rgba(235,235,235,0.3)' : 'rgba(28,28,28,0.25)';

  return (
    <div
      style={{
        ...cssVars,
        background: 'var(--bg)',
        color: 'var(--fg)',
        minHeight: '100vh',
        fontFamily: "'Outfit', sans-serif",
        transition: isTransitioning ? 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)' : 'none',
      }}
    >
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          overflow-x: hidden;
          transition: ${isTransitioning ? 'background-color 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), color 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)' : 'none'};
        }
        ::selection {
          background: ${selection};
          color: ${selectionColor};
        }
        ::-webkit-scrollbar {
          width: 3px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${scrollThumb};
          border-radius: 10px;
        }
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -2%); }
          20% { transform: translate(2%, 2%); }
          30% { transform: translate(-1%, 1%); }
          40% { transform: translate(1%, -1%); }
          50% { transform: translate(-2%, 2%); }
          60% { transform: translate(2%, -2%); }
          70% { transform: translate(-1%, -1%); }
          80% { transform: translate(1%, 1%); }
          90% { transform: translate(-2%, -2%); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        
        /* Transições globais para todos os elementos que mudam de cor */
        .nav-link,
        .skill-card,
        .project-card,
        .btn-primary,
        .btn-secondary,
        footer,
        .status-dot,
        .footer-link,
        .marquee-text,
        h1, h2, h3, h4, p, span,
        div,
        section,
        .bg-grid {
          transition: ${isTransitioning ? 'background-color 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), border-color 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), color 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), box-shadow 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)' : 'none'};
        }
        
        .nav-link {
          position: relative;
          text-decoration: none;
          color: var(--fg);
          font-size: 13px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-weight: 400;
          padding: 4px 0;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--fg);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
        
        .skill-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          padding: 32px;
          border-radius: 16px;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .skill-card:hover {
          background: var(--card-hover);
          transform: translateY(-4px);
        }
        .skill-card::before {
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
        .skill-card:hover::before {
          opacity: 1;
        }
        .skill-card h3 {
          color: var(--fg);
        }
        .skill-card p {
          color: var(--fg-muted);
        }
        
        .project-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 36px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .project-card:hover {
          background: var(--card-hover);
          transform: translateY(-6px);
        }
        .project-card::before {
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
        .project-card:hover::before {
          opacity: 1;
        }
        .project-card h3 {
          color: var(--fg);
        }
        .project-card p {
          color: var(--fg-muted);
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${statusGlow};
          display: inline-block;
          position: relative;
        }
        .status-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1px solid ${statusGlow};
          animation: pulse-ring 2s ease-out infinite;
        }
        
        .footer-link {
          color: var(--fg-muted);
          text-decoration: none;
          font-size: 12px;
          font-family: 'Space Mono', monospace;
          letter-spacing: 1px;
          opacity: 0.7;
        }
        .footer-link:hover {
          opacity: 1;
          color: var(--fg);
        }
        
        .marquee-text {
          color: ${marqueeColor};
        }
        
        .btn-primary {
          text-decoration: none;
          color: ${isDark ? 'var(--bg)' : '#FFFFFF'};
          background: ${isDark ? 'var(--fg)' : '#000000'};
          padding: 14px 36px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1px;
          display: inline-block;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .btn-secondary {
          text-decoration: none;
          color: var(--fg);
          border: 1px solid var(--card-border);
          background: transparent;
          padding: 14px 36px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1px;
          display: inline-block;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 1px 1px, var(--fg) 1px, transparent 0);
          background-size: 40px 40px;
          opacity: ${gridOpacity};
          pointer-events: none;
        }
        
        .italic-highlight {
          font-weight: 200;
          font-style: italic;
          color: ${isDark ? 'var(--fg)' : '#000000'};
        }
        
        footer {
          border-top: 1px solid var(--card-border);
        }
        
        @media (max-width: 768px) {
          .hero-title { font-size: 13vw !important; }
          .hero-sub { font-size: 4.5vw !important; }
          .skills-grid { grid-template-columns: 1fr !important; }
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
          .project-card { min-width: auto !important; max-width: 100% !important; }
          .nav-links-desktop { display: none !important; }
          .footer-inner { grid-template-columns: 1fr !important; text-align: center !important; gap: 32px !important; }
          .footer-links-row { justify-content: center !important; }
          .section-pad { padding: 80px 20px !important; }
        }
        @media (min-width: 769px) {
          .nav-links-mobile { display: none !important; }
          .projects-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
          .projects-scroll { display: none !important; }
        }
      `}</style>

      {/* Grain overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: grainOpacity,
          transition: isTransitioning ? 'opacity 0.4s ease' : 'none',
        }}
      />

      <ParticleField isDark={isDark} />
      <ProgressBar progress={scrollProgress} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Navigation */}
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
            background: `rgba(${bgRgb}, ${navOpacity * 0.88})`,
            backdropFilter: navOpacity > 0.1 ? 'blur(20px) saturate(1.2)' : 'none',
            borderBottom: navOpacity > 0.5 ? `1px solid ${divider}` : '1px solid transparent',
            transition: isTransitioning ? 'background 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), border-bottom 0.4s ease' : 'none',
          }}
        >
          <a
            href="#top"
            style={{
              textDecoration: 'none',
              color: 'var(--fg)',
              fontFamily: "'Space Mono', monospace",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 3,
              transition: isTransitioning ? 'color 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)' : 'none',
            }}
          >
            LCV
          </a>
          <div className="nav-links-desktop" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {['sobre', 'skills', 'projetos', 'contato'].map((item) => (
              <a key={item} href={`#${item}`} className="nav-link">
                {item}
              </a>
            ))}
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          </div>
          <div className="nav-links-mobile" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: 'var(--fg-muted)',
                transition: isTransitioning ? 'color 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)' : 'none',
              }}
            >
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          </div>
        </nav>

        <Hero mounted={mounted} />
        <About isDark={isDark} />
        <Marquee />
        <Skills />
        <Projects />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}

export default App;