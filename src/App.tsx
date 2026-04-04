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

/* ─── Paletas de cores ─── */
const darkThemeColors = {
  bg: '10,10,14',
  fg: '235,235,235',
  fgMuted: '0.6',
  fgSubtle: '0.12',
  cardBg: '0.06',
  cardBorder: '0.15',
  cardHover: '0.1',
  divider: 'rgba(235,235,235,0.12)',
};

const lightThemeColors = {
  bg: '255,250,244',
  fg: '28,28,28',
  fgMuted: '0.7',
  fgSubtle: '0.2',
  cardBg: '0.04',
  cardBorder: '0.2',
  cardHover: '0.08',
  divider: '#E5E5E5',
};

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  /* Detecta preferência do sistema para tema inicial */
  const prefersLight =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: light)').matches;

  const { isDark, toggleTheme, currentColors, isTransitioning } = useThemeTransition(
    darkThemeColors,
    lightThemeColors,
    400,
    !prefersLight, // começa escuro a menos que o sistema prefira claro
  );

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Sincroniza CSS vars no :root para que portais (Modal) as herdem */
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
    root.style.setProperty('--status-glow', isDark ? '#4ade80' : '#16a34a');
    root.style.setProperty('--grid-opacity', isDark ? '0.08' : '0.03');
    root.style.setProperty('--selection-bg', isDark ? 'rgba(255,255,255,0.18)' : 'rgba(28,28,28,0.12)');
    root.style.setProperty('--selection-color', isDark ? '#fff' : '#1c1c1c');
  }, [currentColors, isDark]);

  /* Cálculos derivados */
  const totalHeight = typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1;
  const scrollProgress = Math.min(scrollY / (totalHeight || 1), 1);
  const navOpacity = Math.min(scrollY / 300, 1);

  const transitionStyle = isTransitioning ? 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)' : 'none';

  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--fg)',
        minHeight: '100vh',
        fontFamily: "var(--font-sans)",
        transition: transitionStyle,
      }}
    >
      {/* Selection color dinâmica */}
      <style>{`
        ::selection {
          background: var(--selection-bg);
          color: var(--selection-color);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(var(--fg-rgb), 0.12);
        }
      `}</style>

      {/* Grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: isDark ? 0.5 : 0.25,
          transition: isTransitioning ? 'opacity 0.4s ease' : 'none',
        }}
      />

      <ParticleField isDark={isDark} />
      <ProgressBar progress={scrollProgress} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Skip link — acessibilidade */}
        <a href="#conteudo-principal" className="skip-link">
          Pular para conteúdo principal
        </a>

        {/* Navigation */}
        <nav
          aria-label="Navegação principal"
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
            background: `rgba(${currentColors.bg}, ${navOpacity * 0.88})`,
            backdropFilter: navOpacity > 0.1 ? 'blur(20px) saturate(1.2)' : 'none',
            borderBottom: navOpacity > 0.5 ? `1px solid var(--divider)` : '1px solid transparent',
            transition: isTransitioning ? 'background 0.4s var(--ease-spring), border-bottom 0.4s ease' : 'none',
          }}
        >
          <a
            href="#top"
            aria-label="Voltar ao topo — Lucas Costa Vaz"
            style={{
              textDecoration: 'none',
              color: 'var(--fg)',
              fontFamily: 'var(--font-mono)',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            LCV
          </a>

          <div className="nav-links-desktop" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {[
              { label: 'sobre', href: '#sobre' },
              { label: 'skills', href: '#skills' },
              { label: 'projetos', href: '#projetos' },
              { label: 'contato', href: '#contato' },
            ].map((item) => (
              <a key={item.label} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          </div>

          <div className="nav-links-mobile" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              aria-hidden="true"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--fg-muted)',
              }}
            >
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          </div>
        </nav>

        {/* Conteúdo principal — landmark acessível */}
        <main id="conteudo-principal">
          <Hero mounted={mounted} />
          <About isDark={isDark} />
          <Marquee isDark={isDark} />
          <Skills />
          <Projects />
          <Contact />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
