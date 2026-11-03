import { useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import type { Mood } from './petMind';

// The same cubic topology in every pose makes the organic silhouette morph cleanly.
function silhouette(phase: number, amplitude: number) {
  const count = 32;
  const points = Array.from({ length: count }, (_, index) => {
    const angle = index / count * Math.PI * 2;
    const radius = 37 + amplitude * Math.cos(angle * 6 + phase) + 2.2 * Math.sin(angle * 3 + 0.6);
    return { x: 64 + Math.cos(angle) * radius, y: 66 + Math.sin(angle) * radius };
  });
  const at = (index: number) => points[(index + count) % count];
  const format = (value: number) => value.toFixed(2);
  let path = `M ${format(points[0].x)} ${format(points[0].y)}`;
  for (let index = 0; index < count; index++) {
    const a = at(index - 1), b = at(index), c = at(index + 1), d = at(index + 2);
    path += ` C ${format(b.x + (c.x - a.x) / 6)} ${format(b.y + (c.y - a.y) / 6)}, ${format(c.x - (d.x - b.x) / 6)} ${format(c.y - (d.y - b.y) / 6)}, ${format(c.x)} ${format(c.y)}`;
  }
  return `${path} Z`;
}

const shapes = [silhouette(0, 5.5), silhouette(0.65, 6.5), silhouette(-0.35, 5)];

export function PetAvatar({ mood, active, dragging = false, compact = false }: {
  mood: Mood; active: boolean; dragging?: boolean; compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const eyeX = useMotionValue(0), eyeY = useMotionValue(0);
  const lookX = useSpring(eyeX, { stiffness: 130, damping: 18 });
  const lookY = useSpring(eyeY, { stiffness: 130, damping: 18 });
  const sleeping = mood === 'sleeping';
  const happy = mood === 'happy' || mood === 'playful';
  const animate = active && !reduced && !compact;

  useEffect(() => {
    if (!animate || sleeping) { eyeX.set(0); eyeY.set(0); return; }
    const look = (event: PointerEvent) => {
      eyeX.set((event.clientX / window.innerWidth - 0.5) * 7);
      eyeY.set((event.clientY / window.innerHeight - 0.5) * 4);
    };
    window.addEventListener('pointermove', look, { passive: true });
    return () => window.removeEventListener('pointermove', look);
  }, [animate, sleeping, eyeX, eyeY]);

  const bounce = dragging ? [0, -3, 0] : mood === 'playful' ? [0, -16, 0, -9, 0] : [0, -4, 0];

  return <svg className="pet-avatar-art" viewBox="0 0 128 128" fill="none" aria-hidden="true">
    <motion.ellipse className="pet-ground" cx="64" cy="115" rx="25" ry="3.5"
      animate={{ scaleX: animate ? [1, 0.8, 1] : 1, opacity: sleeping ? 0.16 : 0.24 }}
      transition={{ duration: 3.4, repeat: animate ? Infinity : 0 }} />
    <motion.g animate={{
      y: animate ? bounce : 0,
      rotate: animate && (happy || dragging) ? [0, -7, 5, -2, 0] : 0,
      scaleX: animate && mood === 'eating' ? [1, 1.1, 0.96, 1] : 1,
      scaleY: sleeping ? 0.91 : animate && mood === 'eating' ? [1, 0.93, 1.06, 1] : 1,
    }} transition={{ duration: mood === 'playful' || mood === 'eating' ? 1.2 : 3.4, repeat: animate && mood !== 'eating' ? Infinity : 0, ease: 'easeInOut' }}>
      <motion.path className="pet-body" d={shapes[0]}
        animate={{ d: animate && !sleeping ? [...shapes, shapes[0]] : shapes[0] }}
        transition={{ duration: 5.6, ease: 'easeInOut', repeat: animate ? Infinity : 0 }} />
      <path className="pet-signature" d="M37 38c1-8 7-12 13-8 2 7-4 13-13 8Z" />
      <motion.g style={{ x: lookX, y: lookY }}>
        {sleeping ? <g className="pet-face-line"><path d="M49 64q5 5 10 0M68 63q5 5 10 0" /></g> :
          <g className={`pet-eyes ${animate ? 'pet-eyes--alive' : ''}`}>
            <ellipse className="pet-eye" cx="54" cy={happy ? 60 : 61} rx="5.2" ry={mood === 'sleepy' ? 3.5 : happy ? 7.5 : 9} transform="rotate(7 54 61)" />
            <ellipse className="pet-eye" cx="73" cy="59" rx="5.3" ry={mood === 'sleepy' ? 3.5 : happy ? 7 : 8.6} transform="rotate(7 73 59)" />
          </g>}
        {happy && <path className="pet-smile" d="M58 77q6 6 12-1" />}
        {mood === 'eating' && <motion.ellipse className="pet-eye" cx="64" cy="77" rx="4" ry="3" animate={{ ry: animate ? [3, 0.8, 3] : 3 }} transition={{ duration: 0.35, repeat: animate ? 5 : 0 }} />}
      </motion.g>
      {sleeping && <motion.g className="pet-sleep-marks" animate={{ y: animate ? [0, -3, 0] : 0 }} transition={{ duration: 3, repeat: animate ? Infinity : 0 }}><path d="M97 34h7l-7 8h7M105 21h5l-5 6h5" /></motion.g>}
    </motion.g>
    <AnimatePresence>
      {mood === 'eating' && <motion.path key="snack" className="pet-snack" d="m0-6 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z"
        initial={{ x: 111, y: 40, scale: 1, rotate: -30 }}
        animate={{ x: reduced ? 86 : [111, 82, 64], y: reduced ? 75 : [40, 48, 76], scale: reduced ? 1 : [1, 1, 0], rotate: 100 }}
        exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.9 }} />}
      {mood === 'playful' && <motion.circle className="pet-toy" key="toy" cx="0" cy="0" r="6"
        initial={{ x: 110, y: 96, opacity: 0 }}
        animate={{ x: reduced ? 110 : [110, 99, 25, 12, 110], y: reduced ? 96 : [96, 28, 18, 80, 96], opacity: 1 }}
        exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 2.2, ease: 'easeInOut' }} />}
    </AnimatePresence>
  </svg>;
}
