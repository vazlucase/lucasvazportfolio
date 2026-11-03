import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion, useDragControls, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Text } from '../ui/Typography';
import { PetAvatar } from './PetAvatar';
import { moodLabels } from './petMind';
import type { Care } from './petMind';
import { usePetMind } from './usePetMind';
import { usePetNavigation } from './usePetNavigation';
import './virtual-pet.css';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function CareIcon({ care }: { care: 'pet' | 'feed' | 'play' | 'rest' }) {
  const paths = {
    pet: 'M12 20S3 14.5 3 8.5a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1C21 14.5 12 20 12 20Z',
    feed: 'm12 2 3.2 6.8L22 12l-6.8 3.2L12 22l-3.2-6.8L2 12l6.8-3.2L12 2Z',
    play: 'M20 12a8 8 0 1 1-8-8 8 8 0 0 1 8 8ZM5.5 6.5l12 11M7 18c-1-5 3-9 10-11',
    rest: 'M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z',
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[care]} /></svg>;
}

export function VirtualPet({ enabled, isDark }: { enabled: boolean; isDark: boolean }) {
  const [minimized, setMinimized] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [memoriesOpen, setMemoriesOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const [layout, setLayout] = useState({ side: 'right', placement: 'above', room: 440, panelOffset: -216, bubbleOffset: -152 });
  const rootRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const lastDrag = useRef(0);
  const reduced = useReducedMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  const tiltTarget = useMotionValue(0);
  const tilt = useSpring(tiltTarget, { stiffness: 180, damping: 17 });
  const dragControls = useDragControls();
  const { mind, care, signal, dismiss } = usePetMind(enabled && !minimized, isDark);
  const active = enabled && !minimized && !blocked && pageVisible;
  const busy = mind.busyUntil > Date.now();

  const fit = useCallback(() => {
    const element = rootRef.current;
    if (!element) return;
    const computed = getComputedStyle(element);
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const unit = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    // Measure the fixed anchor, not the animated/rotated bounding rectangle.
    const baseLeft = window.innerWidth - parseFloat(computed.right) - width;
    const baseTop = window.innerHeight - parseFloat(computed.bottom) - height;
    const limits = {
      left: 12 - baseLeft, right: window.innerWidth - 12 - baseLeft - width,
      top: 12 - baseTop, bottom: window.innerHeight - 12 - baseTop - height,
    };
    const nextX = clamp(x.get(), limits.left, limits.right);
    const nextY = clamp(y.get(), limits.top, limits.bottom);
    x.set(nextX);
    y.set(nextY);
    setConstraints(limits);
    const left = baseLeft + nextX, top = baseTop + nextY;
    const side = left + width / 2 < window.innerWidth / 2 ? 'left' : 'right';
    const below = window.innerHeight - top - height;
    const placement = top < 420 && below > top ? 'below' : 'above';
    const offset = (units: number) => {
      const size = Math.min(units * unit, window.innerWidth - unit * 2);
      const ideal = side === 'left' ? left : left + width - size;
      return clamp(ideal, unit, window.innerWidth - unit - size) - left;
    };
    setLayout({
      side, placement, room: Math.max(120, (placement === 'above' ? top : below) - unit * 1.5),
      panelOffset: offset(20), bubbleOffset: offset(16),
    });
  }, [x, y]);

  const navigation = usePetNavigation({
    enabled: enabled && !blocked && pageVisible,
    paused: minimized || panelOpen || dragging || busy || mind.mood === 'sleeping' || mind.resting,
    reduced: !!reduced, section: mind.section, curiosity: mind.curiosity, energy: mind.energy,
    rootRef, x, y, onSettle: fit,
  });

  useLayoutEffect(() => {
    if (!enabled) return;
    fit();
    let frame = 0;
    const resize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const observer = new ResizeObserver(resize);
    if (rootRef.current) observer.observe(rootRef.current);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [enabled, minimized, fit]);

  useEffect(() => {
    if (!enabled) { setPanelOpen(false); return; }
    const inspect = () => setBlocked(!!document.querySelector('.modal-overlay'));
    const observer = new MutationObserver(inspect);
    observer.observe(document.body, { childList: true, subtree: true });
    inspect();
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, [enabled]);

  useEffect(() => {
    if (rootRef.current) rootRef.current.inert = blocked;
    if (blocked) setPanelOpen(false);
  }, [blocked]);

  useEffect(() => {
    if (!panelOpen) return;
    const frame = requestAnimationFrame(() => firstActionRef.current?.focus({ preventScroll: true }));
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setPanelOpen(false); avatarRef.current?.focus({ preventScroll: true }); }
    };
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setPanelOpen(false);
    };
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', outside);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('pointerdown', outside);
    };
  }, [panelOpen]);

  const closePanel = () => { setPanelOpen(false); avatarRef.current?.focus({ preventScroll: true }); };
  const minimize = () => {
    setPanelOpen(false); setMinimized(true); dismiss();
    requestAnimationFrame(() => restoreRef.current?.focus({ preventScroll: true }));
  };
  const restore = () => {
    setMinimized(false);
    requestAnimationFrame(() => avatarRef.current?.focus({ preventScroll: true }));
  };
  const togglePanel = () => {
    if (Date.now() < lastDrag.current) return;
    navigation.interrupt();
    fit();
    if (!panelOpen) care(mind.mood === 'sleeping' ? 'wake' : 'pet');
    setPanelOpen(!panelOpen);
  };
  const keyboardMove = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = 24;
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    navigation.moveBy(direction[0], direction[1]);
  };
  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button === 0) { navigation.interrupt(); dragControls.start(event); }
  };
  const actions: { care: Care; icon: 'pet' | 'feed' | 'play' | 'rest'; label: string }[] = [
    { care: 'pet', icon: 'pet', label: 'Carinho' },
    { care: 'feed', icon: 'feed', label: 'Petisco' },
    { care: 'play', icon: 'play', label: 'Brincar' },
    { care: mind.mood === 'sleeping' ? 'wake' : 'rest', icon: 'rest', label: mind.mood === 'sleeping' ? 'Acordar' : 'Descansar' },
  ];

  if (!enabled) return null;

  return <motion.aside
    ref={rootRef} className={`pet-widget ${minimized ? 'pet-widget--minimized' : ''}`}
    aria-label="Nó, companheiro virtual" aria-hidden={blocked || undefined}
    data-blocked={blocked} data-side={layout.side} data-placement={layout.placement} data-paused={!active}
    data-moving={navigation.moving} data-bubble-safe={navigation.bubbleSafe}
    initial={false}
    style={{ x, y, rotate: reduced ? 0 : tilt, ...{
      '--pet-room': `${layout.room}px`, '--pet-panel-offset': `${layout.panelOffset}px`, '--pet-bubble-offset': `${layout.bubbleOffset}px`,
    } as CSSProperties }}
    drag={!minimized} dragControls={dragControls} dragListener={false} dragConstraints={constraints}
    dragElastic={0} dragMomentum={false}
    onDragStart={() => { navigation.interrupt(); setDragging(true); setPanelOpen(false); dismiss(); }}
    onDrag={(_, info) => { navigation.constrainDrag(); if (!reduced) tiltTarget.set(clamp(info.velocity.x / 110, -9, 9)); }}
    onDragEnd={() => {
      lastDrag.current = Date.now() + 250;
      navigation.constrainDrag(); setDragging(false); tiltTarget.set(0); requestAnimationFrame(fit); signal({ type: 'moved' });
    }}
  >
    {minimized ? <Button ref={restoreRef} variant="unstyled" className="pet-restore" onClick={restore} aria-label="Mostrar Nó, companheiro virtual">
      <span className="pet-restore-eyes" aria-hidden="true"><span /><span /></span><span>nó.</span><Icon name="plus" />
    </Button> : <>
      <AnimatePresence>
        {panelOpen ? <motion.div className="pet-panel" key="panel" id="pet-panel" role="region" aria-label="Cuidar do Nó"
          initial={{ opacity: 0, y: reduced ? 0 : 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: reduced ? 0 : 8, scale: 0.97 }} transition={{ duration: reduced ? 0 : 0.25 }}>
          <div className="pet-panel-header">
            <div><Text as="span" className="pet-wordmark">nó.</Text><Text className="pet-kicker">UM FIAPO DE IDEIA</Text></div>
            <div className="pet-panel-controls">
              <Button variant="unstyled" className="pet-icon-button" onClick={minimize} aria-label="Minimizar companheiro" title="Minimizar companheiro"><Icon name="minus" /></Button>
              <Button variant="unstyled" className="pet-icon-button" onClick={closePanel} aria-label="Fechar painel do Nó"><Icon name="close" /></Button>
            </div>
          </div>
          <div className="pet-panel-mood"><span className="pet-mood-dot" /><Text as="span">{moodLabels[mind.mood]}</Text><span className="pet-local-label">SÓ NESTA VISITA</span></div>
          <div className="pet-panel-thought" role="status" aria-live="polite" aria-atomic="true"><span className="pet-kicker">PASSOU PELA MINHA CABEÇA</span><Text key={mind.thought.id}>{mind.thought.text}</Text></div>
          <div className="pet-vitals">
            {([{ label: 'Energia', value: mind.energy }, { label: 'Vínculo', value: mind.bond }, { label: 'Curiosidade', value: mind.curiosity }]).map(stat =>
              <div className="pet-vital" key={stat.label}><Text as="span">{stat.label}</Text><div className="pet-meter" role="meter" aria-label={stat.label} aria-valuenow={stat.value} aria-valuemin={0} aria-valuemax={100}><motion.span animate={{ scaleX: stat.value / 100 }} transition={{ duration: reduced ? 0 : 0.6 }} /></div></div>)}
          </div>
          <div className="pet-actions">{actions.map((action, index) =>
            <Button ref={index === 0 ? firstActionRef : undefined} variant="unstyled" className="pet-care-button" key={action.icon}
              disabled={busy} onClick={() => care(action.care)} aria-label={`${action.label} ${action.care === 'pet' ? 'no Nó' : action.care === 'wake' ? 'o Nó' : action.care === 'rest' ? 'com o Nó' : action.care === 'feed' ? 'para o Nó' : 'com o Nó'}`}>
              <CareIcon care={action.icon} /><span>{action.label}</span>
            </Button>)}</div>
          <Button variant="unstyled" className="pet-memory-trigger" onClick={() => setMemoriesOpen(!memoriesOpen)} aria-expanded={memoriesOpen} aria-controls="pet-memories"><span>Pequenas memórias ({mind.notes.length})</span><Icon name={memoriesOpen ? 'minus' : 'plus'} /></Button>
          <AnimatePresence initial={false}>{memoriesOpen && <motion.div id="pet-memories" className="pet-memories" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}><ul>{mind.notes.map(note => <li key={note}>{note}</li>)}</ul></motion.div>}</AnimatePresence>
          <Text className="pet-footnote">Meu pequeno cérebro usa regras locais. Meus pensamentos e memórias ficam apenas nesta visita.</Text>
        </motion.div> : mind.thought.visible && !dragging && !blocked && <motion.div key="thought" className="pet-thought"
          initial={{ opacity: 0, y: reduced ? 0 : 8, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: reduced ? 0 : 4, scale: 0.97 }} transition={{ duration: reduced ? 0 : 0.35 }}>
          <div className="pet-thought-top"><span className="pet-kicker">NÓ PENSOU…</span><Button variant="unstyled" className="pet-icon-button pet-dismiss" onClick={dismiss} aria-label="Dispensar pensamento"><Icon name="close" /></Button></div>
          <motion.div key={mind.thought.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}><Text role="status" aria-live="polite" aria-atomic="true">{mind.thought.text}</Text></motion.div>
        </motion.div>}
      </AnimatePresence>
      <Button ref={avatarRef} variant="unstyled" className="pet-avatar-button" onPointerDown={startDrag}
        onClick={togglePanel} onKeyDown={keyboardMove} aria-expanded={panelOpen} aria-controls={panelOpen ? 'pet-panel' : undefined}
        aria-label={panelOpen ? 'Nó, fechar painel do companheiro' : 'Nó, abrir painel do companheiro'} aria-describedby="pet-instructions">
        <PetAvatar mood={mind.mood} active={active} dragging={dragging} />
        <span className="pet-name-label"><span>nó.</span><span className="pet-name-state" /><span className="pet-location-label">{dragging ? 'voando' : navigation.moving ? 'explorando' : mind.mood === 'sleeping' ? 'sonhando' : 'por aqui'}</span></span>
      </Button>
      <Text as="span" id="pet-instructions" className="visually-hidden">Clique para cuidar do Nó. Ele explora os espaços livres e pausa quando você interage. Você pode arrastá-lo ou usar as setas do teclado para mudar seu cantinho.</Text>
    </>}
  </motion.aside>;
}
