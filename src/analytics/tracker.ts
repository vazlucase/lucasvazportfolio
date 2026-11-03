import { useEffect } from 'react';
import { PET_SIGNAL } from '../components/pet/petMind';
import type { SiteSignal } from '../components/pet/petMind';

export const ANALYTICS_EXCLUDE_KEY = 'lv:analytics:exclude';
type EventType = 'view' | 'section' | 'project' | 'contact' | 'scroll' | 'active' | 'skill';
interface TrackedEvent { id: string; at: number; type: EventType; label: string; value: number }
interface VisitSession { id: string; touchedAt: number; source: string }
const queue: TrackedEvent[] = [];
let pageViewRecorded = false, flushing = false;
let temporaryVisitor = '';
let temporarySession: VisitSession | null = null;

export function analyticsExcluded() {
  try { return localStorage.getItem(ANALYTICS_EXCLUDE_KEY) === '1'; } catch { return false; }
}
const privacyOptOut = () => analyticsExcluded() || navigator.doNotTrack === '1' ||
  (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

function source() {
  const campaign = new URLSearchParams(location.search).get('utm_source');
  if (campaign) return campaign.replace(/[^\p{L}\p{N} ._-]/gu, '').slice(0, 80) || 'Direto';
  try {
    const referrer = new URL(document.referrer);
    return referrer.hostname === location.hostname ? 'Direto' : referrer.hostname.replace(/^www\./, '').slice(0, 80);
  } catch { return 'Direto'; }
}
function context() {
  const now = Date.now();
  let visitorId = temporaryVisitor || crypto.randomUUID();
  try { visitorId = localStorage.getItem('lv:analytics:visitor') || visitorId; localStorage.setItem('lv:analytics:visitor', visitorId); } catch { /* Session-only identifier when storage is unavailable. */ }
  temporaryVisitor = visitorId;
  let session = temporarySession;
  try { session = JSON.parse(sessionStorage.getItem('lv:analytics:session') || 'null') as VisitSession | null; } catch { /* Keep the in-memory session. */ }
  if (!session?.id || now - session.touchedAt > 30 * 60000) session = { id: crypto.randomUUID(), touchedAt: now, source: source() };
  session.touchedAt = now; temporarySession = session;
  try { sessionStorage.setItem('lv:analytics:session', JSON.stringify(session)); } catch { /* No persistent storage is required for the site to work. */ }
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Outro';
  const device = /iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'Tablet' : /Mobi|Android/i.test(ua) ? 'Celular' : 'Desktop';
  return { visitorId, sessionId: session.id, source: session.source, page: '/', device, browser };
}
function track(type: EventType, label = '', value = 0) {
  if (privacyOptOut()) return;
  if (queue.length >= 100) {
    const disposable = queue.findIndex(event => event.type === 'active');
    if (disposable >= 0) queue.splice(disposable, 1);
    else return;
  }
  queue.push({ id: crypto.randomUUID(), at: Date.now(), type, label, value });
}
async function flush() {
  if (flushing || !queue.length) return;
  if (privacyOptOut()) { queue.length = 0; return; }
  flushing = true;
  const batch = queue.slice(0, 20);
  try {
    const response = await fetch('/api/analytics/collect', { method: 'POST', credentials: 'same-origin', keepalive: true,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: context(), events: batch }) });
    if (response.ok || response.status === 400) {
      const sent = new Set(batch.map(event => event.id));
      for (let index = queue.length - 1; index >= 0; index--) if (sent.has(queue[index].id)) queue.splice(index, 1);
    }
  } catch { /* Retried by the next flush; telemetry never interrupts navigation. */ }
  finally { flushing = false; }
}

export function useSiteAnalytics() {
  useEffect(() => {
    if (privacyOptOut()) return;
    let lastActive = performance.now(), lastInput = Date.now(), scrollFrame = 0, wasVisible = !document.hidden;
    const seenSections = new Set<string>(), milestones = new Set<number>();
    if (!pageViewRecorded) { track('view'); pageViewRecorded = true; }
    const activeTime = () => {
      const now = performance.now();
      if (wasVisible && Date.now() - lastInput < 60000) {
        const seconds = Math.min(30, (now - lastActive) / 1000);
        if (seconds >= 1) track('active', '', seconds);
      }
      lastActive = now;
      wasVisible = !document.hidden;
    };
    const touch = () => { lastInput = Date.now(); };
    const inspectScroll = () => {
      scrollFrame = 0;
      const available = document.documentElement.scrollHeight - innerHeight;
      const progress = available > 0 ? Math.round(scrollY / available * 100) : 100;
      for (const milestone of [25, 50, 75, 100]) if (progress >= milestone && !milestones.has(milestone)) {
        milestones.add(milestone); track('scroll', '', milestone);
      }
    };
    const scroll = () => { touch(); if (!scrollFrame) scrollFrame = requestAnimationFrame(inspectScroll); };
    const signal = (event: Event) => {
      const detail = (event as CustomEvent<SiteSignal>).detail;
      if (!detail) return;
      if (detail.type === 'project-open') track('project', detail.title);
      if (detail.type === 'contact') { track('contact', detail.channel); void flush(); }
      if (detail.type === 'skill') track('skill', detail.title);
    };
    const observer = new IntersectionObserver(entries => {
      if (document.querySelector('.intro-screen')) return;
      for (const entry of entries) if (entry.isIntersecting && !seenSections.has(entry.target.id)) {
        seenSections.add(entry.target.id); track('section', entry.target.id);
      }
    }, { threshold: 0.1, rootMargin: '-10% 0px -20% 0px' });
    for (const id of ['top', 'projetos', 'sobre', 'skills', 'contato']) {
      const element = document.getElementById(id); if (element) observer.observe(element);
    }
    const introObserver = new MutationObserver(() => {
      if (document.querySelector('.intro-screen')) return;
      observer.disconnect();
      for (const id of ['top', 'projetos', 'sobre', 'skills', 'contato']) {
        const element = document.getElementById(id); if (element) observer.observe(element);
      }
      introObserver.disconnect();
    });
    introObserver.observe(document.body, { childList: true, subtree: true });
    const visibility = () => { activeTime(); void flush(); };
    const pagehide = () => { activeTime(); void flush(); };
    const interval = window.setInterval(() => { activeTime(); void flush(); }, 15000);
    const initialFlush = window.setTimeout(() => void flush(), 500);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('pointerdown', touch, { passive: true });
    window.addEventListener('keydown', touch);
    window.addEventListener(PET_SIGNAL, signal);
    window.addEventListener('pagehide', pagehide);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearInterval(interval); clearTimeout(initialFlush); cancelAnimationFrame(scrollFrame); observer.disconnect(); introObserver.disconnect();
      window.removeEventListener('scroll', scroll); window.removeEventListener('pointerdown', touch);
      window.removeEventListener('keydown', touch); window.removeEventListener(PET_SIGNAL, signal);
      window.removeEventListener('pagehide', pagehide); document.removeEventListener('visibilitychange', visibility);
      void flush();
    };
  }, []);
}
