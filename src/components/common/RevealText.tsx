import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealTextProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function RevealText({ children, delay = 0, className }: RevealTextProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
