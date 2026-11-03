import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { StudioIntro } from './components/common/StudioIntro';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Projects } from './components/sections/Projects';
import { Contact } from './components/sections/Contact';
import { Marquee } from './components/ui/Marquee';
import { TextLink } from './components/ui/Typography';
import { VirtualPet } from './components/pet/VirtualPet';
import { useBodyLock } from './hooks/useBodyLock';
import { useSiteAnalytics } from './analytics/tracker';
import './styles/globals.css';

function App() {
  useSiteAnalytics();
  const [entered, setEntered] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [introKey, setIntroKey] = useState(0);
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const siteRef = useRef<HTMLDivElement>(null);
  useBodyLock(introVisible);

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  }, [isDark]);

  useEffect(() => {
    if (siteRef.current) siteRef.current.inert = introVisible;
  }, [introVisible]);

  const handleReveal = useCallback(() => setEntered(true), []);
  const handleComplete = useCallback(() => {
    setIntroVisible(false);
    setEntered(true);
  }, []);
  const handleReplay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setEntered(false);
    setIntroVisible(true);
    setIntroKey((value) => value + 1);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="portfolio">
        <div className="site-grain" aria-hidden="true" />
        {introVisible && (
          <StudioIntro
            key={introKey}
            onReveal={handleReveal}
            onComplete={handleComplete}
          />
        )}
        <div ref={siteRef} aria-hidden={introVisible || undefined}>
          <TextLink href="#conteudo-principal" className="skip-link">
            Pular para o conteúdo
          </TextLink>
          <Navbar
            ready={entered}
            isDark={isDark}
            toggleTheme={() => setIsDark((value) => !value)}
          />
          <main id="conteudo-principal">
            <Hero ready={entered} />
            <Projects />
            <About />
            <Skills />
            <Marquee />
            <Contact />
          </main>
          <Footer onReplayIntro={handleReplay} />
        </div>
        <VirtualPet enabled={!introVisible} isDark={isDark} />
      </div>
    </MotionConfig>
  );
}

export default App;
