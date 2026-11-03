import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Icon, StarMark } from '../ui/Icon';
import { Text } from '../ui/Typography';

interface StudioIntroProps {
  onReveal: () => void;
  onComplete: () => void;
}

export function StudioIntro({ onReveal, onComplete }: StudioIntroProps) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const exiting = useRef(false);
  const callbacks = useRef({ onReveal, onComplete });
  callbacks.current = { onReveal, onComplete };
  const reduced = useReducedMotion();
  const skipRef = useRef<HTMLButtonElement>(null);

  const reveal = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    setProgress(100);
    setLeaving(true);
    callbacks.current.onReveal();
  }, []);

  useEffect(() => {
    if (reduced) {
      callbacks.current.onReveal();
      callbacks.current.onComplete();
      return;
    }

    let frame = 0;
    let assetsReady = false;
    let disposed = false;
    const start = performance.now();
    const image = new Image();
    const imageReady = new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = '/ocean-hero.webp';
    });

    Promise.allSettled([document.fonts.ready, imageReady]).then(() => {
      if (!disposed) assetsReady = true;
    });

    const tick = (now: number) => {
      if (exiting.current) return;
      const elapsed = now - start;
      setProgress(Math.min(99, Math.round((elapsed / 2300) * 94)));
      // The maximum duration also lets the site open on slow or offline connections.
      if ((elapsed >= 2300 && assetsReady) || elapsed >= 4300) {
        reveal();
      } else {
        frame = requestAnimationFrame(tick);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') reveal();
    };
    window.addEventListener('keydown', handleKey);
    skipRef.current?.focus({ preventScroll: true });
    frame = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      image.onload = null;
      image.onerror = null;
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKey);
    };
  }, [reduced, reveal]);

  return (
    <motion.div
      className="intro-screen"
      role="dialog"
      aria-modal="true"
      aria-label="Abertura do portfólio de Lucas Vaz"
      initial={false}
      animate={{ y: leaving ? '-101%' : '0%' }}
      transition={{
        duration: reduced ? 0 : 1,
        delay: leaving && !reduced ? 0.2 : 0,
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={() => {
        if (exiting.current) callbacks.current.onComplete();
      }}
    >
      <div className="intro-top mono">
        <span>PORTFÓLIO INDEPENDENTE</span>
        <Button
          ref={skipRef}
          variant="unstyled"
          className="intro-skip"
          onClick={reveal}
          aria-label="Pular abertura"
        >
          Pular <span className="intro-esc">[ESC]</span>
          <Icon name="arrow" />
        </Button>
      </div>
      <motion.div
        className="intro-identity"
        animate={{
          opacity: leaving ? 0 : 1,
          scale: leaving ? 0.65 : 1,
          y: leaving ? -32 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="intro-mark"
          initial={{ scale: 0, rotate: -135 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 16, delay: 0.2 }}
        >
          <StarMark />
        </motion.div>
        <div className="intro-wordmark" aria-label="Lucas Vaz">
          {'lucas vaz.'.split('').map((letter, index) => (
            <motion.span
              key={index}
              aria-hidden="true"
              initial={{ x: 38 + index * 7, opacity: 0, rotate: 7 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 230,
                damping: 18,
                delay: 0.25 + index * 0.045,
              }}
            >
              {letter === ' ' ? '\u00a0' : letter}
            </motion.span>
          ))}
        </div>
        <Text className="intro-tagline mono">CÓDIGO. DESIGN. NOVAS POSSIBILIDADES.</Text>
      </motion.div>
      <div className="intro-bottom">
        <div className="intro-bottom-label mono">
          <span>FEITO DE IDEIAS.</span>
          <span>CONSTRUÍDO COM PROPÓSITO.</span>
        </div>
        <div className="intro-progress-track" aria-hidden="true">
          <motion.div
            className="intro-progress-fill"
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.12, ease: 'linear' }}
          />
        </div>
        <span className="intro-counter" aria-hidden="true">
          {String(progress).padStart(3, '0')}<span>%</span>
        </span>
      </div>
    </motion.div>
  );
}
