import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { MotionValue } from 'framer-motion';
import { canEscapeSegment, chooseJourney, clearSegment, distance, isFree, overlaps } from './petNavigation';
import type { PetScene, Point, Rect, Visit } from './petNavigation';

const protectedContent = 'h1,h2,h3,h4,p,li,dt,dd,button,a,input,textarea,select,img,video,canvas,svg,nav,[role="button"],[data-pet-obstacle],.project-visual,.section-kicker,.hero-eyebrow';

function perceive(root: HTMLElement): { scene: PetScene; anchor: Point } {
  const style = getComputedStyle(root);
  const anchor = {
    x: window.innerWidth - parseFloat(style.right) - root.offsetWidth,
    y: window.innerHeight - parseFloat(style.bottom) - root.offsetHeight,
  };
  const obstacles: Rect[] = [];
  const visible = (element: Element) => {
    if (root.contains(element) || element.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
    const computed = getComputedStyle(element);
    return computed.display !== 'none' && computed.visibility !== 'hidden';
  };
  const add = (rect: DOMRect) => {
    if (!rect.width || !rect.height || rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) return;
    obstacles.push({ left: rect.left - 12, top: rect.top - 12, right: rect.right + 12, bottom: rect.bottom + 12 });
  };
  document.querySelectorAll(protectedContent).forEach(element => {
    if (visible(element)) add(element.getBoundingClientRect());
  });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, parent = node.parentElement;
    if (!node.textContent?.trim() || !parent || parent.closest(`${protectedContent},script,style,.pet-widget`) || !visible(parent)) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) add(rect);
  }
  const unique = obstacles.filter((rect, index) => !obstacles.some((other, otherIndex) =>
    otherIndex !== index && other.left <= rect.left && other.top <= rect.top && other.right >= rect.right && other.bottom >= rect.bottom &&
    (otherIndex < index || other.left < rect.left || other.top < rect.top || other.right > rect.right || other.bottom > rect.bottom)));
  const scene = { width: window.innerWidth, height: window.innerHeight,
    pet: { width: root.offsetWidth, height: root.offsetHeight }, obstacles: unique, margin: 12 };
  return { scene, anchor };
}

interface NavigationOptions {
  enabled: boolean;
  paused: boolean;
  reduced: boolean;
  section: string;
  curiosity: number;
  energy: number;
  rootRef: RefObject<HTMLElement>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  onSettle: () => void;
}

export function usePetNavigation(options: NavigationOptions) {
  const { enabled, rootRef, x, y } = options;
  const latest = useRef(options);
  latest.current = options;
  const visits = useRef<Visit[]>([]);
  const [moving, setMoving] = useState(false);
  const [bubbleSafe, setBubbleSafe] = useState(false);
  const controller = useRef({ stop: (_hold: number) => {} });
  const manualPosition = useRef<Point | null>(null);

  const interrupt = useCallback((hold = 10000) => {
    controller.current.stop(hold);
    const root = rootRef.current;
    if (root) {
      const { anchor } = perceive(root);
      manualPosition.current = { x: anchor.x + x.get(), y: anchor.y + y.get() };
    }
  }, [rootRef, x, y]);
  const constrainDrag = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const { scene, anchor } = perceive(root);
    const next = { x: anchor.x + x.get(), y: anchor.y + y.get() };
    if (manualPosition.current && !clearSegment(manualPosition.current, next, scene)) {
      x.set(manualPosition.current.x - anchor.x); y.set(manualPosition.current.y - anchor.y);
    } else if (isFree(next, scene)) manualPosition.current = next;
  }, [rootRef, x, y]);
  const moveBy = useCallback((dx: number, dy: number) => {
    interrupt();
    const root = rootRef.current;
    if (!root) return;
    const { scene, anchor } = perceive(root);
    const start = { x: anchor.x + x.get(), y: anchor.y + y.get() }, end = { x: start.x + dx, y: start.y + dy };
    if (clearSegment(start, end, scene)) { x.set(end.x - anchor.x); y.set(end.y - anchor.y); }
    latest.current.onSettle();
  }, [interrupt, rootRef, x, y]);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    let frame = 0, animation = 0, holdUntil = 0, nextTrip = 0;
    let lastY = window.scrollY, direction = 0, scrollUntil = 0, lastSection = latest.current.section;
    let hovering = false, disposed = false;
    let trip: { points: Point[]; anchor: Point; scene: PetScene; startAt: number; duration: number; length: number; escaping: boolean } | null = null;
    const current = (anchor: Point) => ({ x: anchor.x + x.get(), y: anchor.y + y.get() });
    const stop = (hold = 0) => {
      cancelAnimationFrame(animation); trip = null; setMoving(false);
      holdUntil = Math.max(holdUntil, Date.now() + hold);
    };
    const cadence = () => 4500 + Math.random() * 4500 + (100 - latest.current.energy) * 35 - latest.current.curiosity * 10;
    const settle = (point: Point) => {
      setMoving(false);
      visits.current = [...visits.current, { ...point, section: latest.current.section }].slice(-24);
      nextTrip = Date.now() < scrollUntil ? 0 : Date.now() + cadence();
      latest.current.onSettle();
    };
    const animate = (time: number) => {
      if (!trip || disposed) return;
      if ((!trip.escaping && latest.current.paused) || latest.current.reduced || root.contains(document.activeElement)) { stop(); return; }
      const progress = Math.min(1, (time - trip.startAt) / trip.duration);
      const eased = progress * progress * (3 - 2 * progress);
      let remaining = eased * trip.length;
      let point = trip.points[trip.points.length - 1];
      for (let index = 1; index < trip.points.length; index++) {
        const a = trip.points[index - 1], b = trip.points[index], length = distance(a, b);
        if (remaining <= length) {
          const fraction = length ? remaining / length : 1;
          point = { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
          break;
        }
        remaining -= length;
      }
      const passable = trip.escaping ? canEscapeSegment : clearSegment;
      if (!passable(current(trip.anchor), point, trip.scene)) { stop(); schedule(); return; }
      x.set(point.x - trip.anchor.x); y.set(point.y - trip.anchor.y);
      if (progress < 1) animation = requestAnimationFrame(animate);
      else { trip = null; settle(point); if (Date.now() < scrollUntil) schedule(); }
    };
    const inspect = () => {
      if (disposed || document.hidden) return;
      const now = Date.now(), context = latest.current;
      const { scene, anchor } = perceive(root), start = current(anchor);
      const paused = context.paused || hovering || root.contains(document.activeElement) || now < holdUntil;
      const thought = root.querySelector<HTMLElement>('.pet-thought');
      const rect = thought?.getBoundingClientRect();
      setBubbleSafe(!!rect && !trip && rect.left >= scene.margin && rect.right <= scene.width - scene.margin &&
        rect.top >= scene.margin && rect.bottom <= scene.height - scene.margin &&
        !scene.obstacles.some(obstacle => overlaps(rect, obstacle)));
      if (trip) {
        trip.scene = scene;
        const end = trip.points[trip.points.length - 1];
        const safe = trip.escaping ? canEscapeSegment(start, end, scene) && isFree(end, scene) : isFree(start, scene);
        if ((!trip.escaping && paused) || context.reduced || !safe) stop();
        else return;
      }
      const changed = lastSection !== context.section;
      lastSection = context.section;
      const safe = isFree(start, scene);
      if (root.contains(document.activeElement) || (safe && (paused || context.reduced || (!changed && now >= scrollUntil && now < nextTrip)))) return;
      const journey = chooseJourney({ scene, start, visits: visits.current, section: context.section,
        direction: now < scrollUntil ? direction : 0, curiosity: context.curiosity });
      // Wait visibly if a place is exhausted or disconnected. No opacity,
      // visibility changes, teleporting, or off-screen fallback on scroll.
      if (!journey?.points.length) { nextTrip = now + 1500; return; }
      if (context.reduced) {
        x.set(journey.destination.x - anchor.x); y.set(journey.destination.y - anchor.y);
        settle(journey.destination); return;
      }
      setMoving(true); setBubbleSafe(false);
      trip = { points: journey.points, anchor, scene, startAt: performance.now(), length: journey.length,
        escaping: !!journey.escaping,
        duration: journey.escaping ? Math.max(180, Math.min(600, journey.length * 4))
          : Math.max(1400, Math.min(4200, journey.length / (90 + context.energy * 0.55) * 1000)) };
      animation = requestAnimationFrame(animate);
    };
    function schedule() {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; inspect(); });
    }
    const scroll = () => {
      const delta = window.scrollY - lastY;
      const nextDirection = Math.sign(delta);
      if (nextDirection && nextDirection !== direction && trip && !trip.escaping) stop();
      direction = nextDirection || direction; lastY = window.scrollY;
      scrollUntil = Date.now() + 900;
      nextTrip = 0;
      // Re-evaluate the actual page gaps as they move, keeping the avatar
      // visible and continuing every new journey from its current position.
      schedule();
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') { hovering = true; stop(1000); }
    };
    const leave = () => { hovering = false; holdUntil = Date.now() + 1000; };
    const focus = () => { stop(1000); schedule(); };
    const resize = () => { stop(); latest.current.onSettle(); schedule(); };
    const changes = new MutationObserver(records => {
      if (records.some(record => !root.contains(record.target))) schedule();
    });
    changes.observe(document.body, { childList: true, subtree: true, characterData: true });
    const observer = new ResizeObserver(resize);
    const main = document.querySelector('main');
    if (main) observer.observe(main);
    observer.observe(root);
    const interval = window.setInterval(schedule, 450);
    controller.current = { stop };
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    root.addEventListener('pointerenter', enter); root.addEventListener('pointerleave', leave);
    root.addEventListener('focusin', focus); root.addEventListener('focusout', schedule);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame); cancelAnimationFrame(animation); clearInterval(interval);
      changes.disconnect(); observer.disconnect();
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', resize);
      root.removeEventListener('pointerenter', enter); root.removeEventListener('pointerleave', leave);
      root.removeEventListener('focusin', focus); root.removeEventListener('focusout', schedule);
      setMoving(false); controller.current = { stop: () => {} };
    };
  }, [enabled, rootRef, x, y]);

  return { moving, bubbleSafe, interrupt, constrainDrag, moveBy };
}
