import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../ui/Button';
import { Icon, StarMark } from '../ui/Icon';
import { Heading, Text, TextLink } from '../ui/Typography';

interface HeroProps {
  ready: boolean;
}

export function Hero({ ready }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const markRotate = useTransform(scrollYProgress, [0, 1], [0, 110]);

  return (
    <section id="top" ref={ref} className="hero" aria-label="Lucas Costa Vaz — Desenvolvedor e Designer">
      <motion.div
        className="hero-image-wrap"
        style={{ y: reduced ? 0 : imageY }}
        initial={{ scale: reduced ? 1 : 1.14 }}
        animate={{ scale: ready ? 1 : 1.14 }}
        transition={{ duration: reduced ? 0 : 2.2, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <img
          className="hero-image"
          src="/ocean-hero.webp"
          alt=""
          width="1920"
          height="1280"
          fetchPriority="high"
        />
      </motion.div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content page-width">
        <motion.div
          className="hero-eyebrow mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ delay: reduced ? 0 : 0.45, duration: 0.6 }}
        >
          <span><span className="availability-dot" /> DISPONÍVEL PARA NOVOS PROJETOS</span>
          <span className="hero-edition">PORTFÓLIO — VOL. 2026</span>
        </motion.div>
        <div className="hero-title-wrap">
          <Heading as="h1" className="hero-title" aria-label="Ideias fora do óbvio.">
            {['IDEIAS FORA', 'DO ÓBVIO.'].map((line, index) => (
              <span className="hero-line-mask" key={line} aria-hidden="true">
                <motion.span
                  className="hero-title-line"
                  initial={{ y: reduced ? 0 : '110%', rotate: reduced ? 0 : 4 }}
                  animate={{ y: ready ? '0%' : '110%', rotate: ready ? 0 : 4 }}
                  transition={{
                    duration: reduced ? 0 : 1.05,
                    delay: reduced ? 0 : 0.4 + index * 0.13,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </Heading>
          <motion.div
            className="hero-star"
            style={{ rotate: reduced ? 0 : markRotate }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 0.4 }}
            transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 0.8 }}
          >
            <StarMark />
          </motion.div>
        </div>
        <motion.div
          className="hero-bottom"
          initial={{ opacity: 0, y: reduced ? 0 : 30 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 30 }}
          transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : 0.9 }}
        >
          <div className="hero-introduction">
            <Text className="hero-name mono">LUCAS COSTA VAZ</Text>
            <Text className="hero-description">
              Transformo ideias em experiências digitais.<br />
              Código preciso. Design que fica.
            </Text>
          </div>
          <Button href="#projetos" className="hero-explore" variant="unstyled">
            <span>Conheça<br />meu trabalho</span>
            <span className="hero-explore-circle"><Icon name="down" /></span>
          </Button>
        </motion.div>
        <motion.div
          className="hero-baseline mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ delay: reduced ? 0 : 1.15, duration: 0.7 }}
        >
          <span>DO BRASIL, PARA NOVAS POSSIBILIDADES.</span>
          <TextLink href="#projetos">CONTINUE EXPLORANDO <Icon name="down" /></TextLink>
        </motion.div>
      </div>
    </section>
  );
}
