import { useCallback, useEffect, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { Button } from '../ui/Button';
import { Icon, StarMark } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { Text, TextLink } from '../ui/Typography';
import { ThemeToggle } from '../ui/ThemeToggle';
import { socialLinks } from '../../data/social';
import { projectsData } from '../../data/projects';

interface NavbarProps {
  ready: boolean;
  isDark: boolean;
  toggleTheme: () => void;
}

const items = [
  { id: 'projetos', label: 'Projetos', code: '01' },
  { id: 'sobre', label: 'Sobre mim', code: '02' },
  { id: 'skills', label: 'O que eu faço', code: '03' },
  { id: 'contato', label: 'Contato', code: '04' },
];

export function Navbar({ ready, isDark, toggleTheme }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const { scrollY, scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const close = useCallback(() => setOpen(false), []);
  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 60));

  useEffect(() => {
    const elements = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current) setActive(current.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );
    elements.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.header
        className={`site-header ${scrolled ? 'is-scrolled' : ''}`}
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : -24 }}
        transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.35 }}
      >
        <div className="header-inner">
          <TextLink href="#top" className="wordmark" aria-label="Lucas Vaz — voltar ao início">
            <span>lucas vaz<span className="wordmark-registered">®</span></span>
            <StarMark />
          </TextLink>
          <Text className="header-description mono">
            DESENVOLVEDOR & DESIGNER<br />
            INDEPENDENTE · BRASIL
          </Text>
          <nav className="header-links" aria-label="Navegação principal">
            <TextLink
              href="#projetos"
              className={`header-link ${active === 'projetos' ? 'is-active' : ''}`}
              aria-current={active === 'projetos' ? 'location' : undefined}
            >
              Projetos <sup>({String(projectsData.length).padStart(2, '0')})</sup>
            </TextLink>
            <TextLink
              href="#sobre"
              className={`header-link ${active === 'sobre' ? 'is-active' : ''}`}
              aria-current={active === 'sobre' ? 'location' : undefined}
            >
              Sobre mim
            </TextLink>
            <Button href="#contato" variant="outline" size="sm" className="header-contact" icon={<Icon name="arrow" />}>
              Vamos conversar
            </Button>
          </nav>
          <Button
            variant="unstyled"
            className="menu-trigger circle-button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu de navegação"
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            <Icon name="menu" />
          </Button>
        </div>
        <motion.div className="nav-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      </motion.header>

      <Modal isOpen={open} onClose={close} title="Vamos explorar." variant="menu">
        <nav className="menu-links" aria-label="Todas as seções">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: reduced ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.1 + index * 0.06, duration: 0.5 }}
            >
              <TextLink href={`#${item.id}`} onClick={close} className="menu-link">
                <span className="menu-link-index mono">/{item.code}</span>
                <span>{item.label}</span>
                <Icon name="arrow" />
              </TextLink>
            </motion.div>
          ))}
        </nav>
        <div className="menu-footer">
          <div className="menu-socials">
            {socialLinks.map((social) => (
              <TextLink key={social.name} href={social.url} className="text-link">
                {social.name}<Icon name="arrow" />
              </TextLink>
            ))}
          </div>
          <ThemeToggle isDark={isDark} toggle={toggleTheme} />
        </div>
      </Modal>
    </>
  );
}
