import { useCallback, useEffect, useReducer, useRef } from 'react';
import { createPetMind, PET_SIGNAL, petReducer } from './petMind';
import type { Care, Section, SiteSignal } from './petMind';

export function usePetMind(enabled: boolean, dark: boolean) {
  const [mind, dispatch] = useReducer(petReducer, undefined, createPetMind);
  const activityAt = useRef(Date.now());
  const previousTheme = useRef(dark);
  const currentSection = useRef<Section>('top');

  const signal = useCallback((event: SiteSignal) => {
    activityAt.current = Date.now();
    dispatch({ type: 'signal', signal: event, now: Date.now() });
  }, []);
  const care = useCallback((action: Care) => {
    activityAt.current = Date.now();
    dispatch({ type: 'care', care: action, now: Date.now() });
  }, []);
  const dismiss = useCallback(() => dispatch({ type: 'dismiss' }), []);

  useEffect(() => {
    const changed = previousTheme.current !== dark;
    previousTheme.current = dark;
    if (enabled && changed) signal({ type: 'theme', dark });
  }, [dark, enabled, signal]);

  useEffect(() => {
    if (!enabled) return;
    activityAt.current = Date.now();
    dispatch({ type: 'resume', now: Date.now() });
    const touch = () => { activityAt.current = Date.now(); };
    const receive = (event: Event) => signal((event as CustomEvent<SiteSignal>).detail);
    const tick = () => {
      if (!document.hidden) dispatch({ type: 'tick', now: Date.now(), idleFor: Date.now() - activityAt.current });
    };
    const onVisibility = () => {
      if (!document.hidden) {
        touch();
        dispatch({ type: 'resume', now: Date.now() });
        tick();
      }
    };
    const interval = window.setInterval(tick, 4000);
    window.addEventListener(PET_SIGNAL, receive);
    window.addEventListener('pointerdown', touch, { passive: true });
    window.addEventListener('pointermove', touch, { passive: true });
    window.addEventListener('keydown', touch);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener(PET_SIGNAL, receive);
      window.removeEventListener('pointerdown', touch);
      window.removeEventListener('pointermove', touch);
      window.removeEventListener('keydown', touch);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, signal]);

  useEffect(() => {
    const deadlines = [mind.busyUntil, mind.reactionUntil].filter(time => time > 0);
    if (!enabled || !deadlines.length) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'tick', now: Date.now(), idleFor: Date.now() - activityAt.current });
    }, Math.max(0, Math.min(...deadlines) - Date.now()) + 30);
    return () => clearTimeout(timer);
  }, [enabled, mind.busyUntil, mind.reactionUntil]);

  useEffect(() => {
    if (!enabled || !mind.thought.visible) return;
    const timer = window.setTimeout(dismiss, 9000);
    return () => clearTimeout(timer);
  }, [enabled, mind.thought.id, mind.thought.visible, dismiss]);

  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    let lastY = window.scrollY;
    let fastAt = 0;
    const inspect = () => {
      if (document.hidden || document.querySelector('.modal-overlay')) return;
      const point = window.innerHeight * 0.4;
      const sections: Section[] = ['top', 'projetos', 'sobre', 'skills', 'contato'];
      const section = sections.find(id => {
        const bounds = document.getElementById(id)?.getBoundingClientRect();
        return bounds && bounds.top <= point && bounds.bottom >= point;
      });
      if (section && section !== currentSection.current) {
        currentSection.current = section;
        signal({ type: 'section', section });
      }
    };
    const onScroll = () => {
      activityAt.current = Date.now();
      if (Math.abs(window.scrollY - lastY) > window.innerHeight * 0.8 && Date.now() - fastAt > 30000) {
        fastAt = Date.now();
        signal({ type: 'fast-scroll' });
      }
      lastY = window.scrollY;
      clearTimeout(timer);
      timer = window.setTimeout(inspect, 800);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    timer = window.setTimeout(inspect, 800);
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [enabled, signal]);

  return { mind, care, signal, dismiss };
}
