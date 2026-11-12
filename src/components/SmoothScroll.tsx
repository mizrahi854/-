'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const popRef = useRef(false);

  useEffect(() => {
    const { gsap, ScrollTrigger } = ensureGsap();
    const root = document.documentElement;
    const reduce = prefersReducedMotion();
    if (!reduce) root.classList.add('motion');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    let l: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;
    if (!reduce) {
      // lerp mode: the page glides toward the wheel target and settles softly, with no fixed-duration tween to fight scrubbed timelines.
      // Touch stays native (smoothest on phones).
      l = new Lenis({ lerp: 0.072, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false, anchors: false });
      l.on('scroll', ScrollTrigger.update);
      tick = (t: number) => l!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(l);
    }
    const onPop = () => { popRef.current = true; };
    window.addEventListener('popstate', onPop);
    // refresh measurements once fonts are ready
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      window.removeEventListener('popstate', onPop);
      if (tick) gsap.ticker.remove(tick);
      l?.destroy();
    };
  }, []);

  // Save the position of the page being left (capture phase, before any navigation work runs).
  useEffect(() => {
    const save = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.origin !== location.origin) return;
      sessionStorage.setItem('scroll:' + location.pathname + location.search, String(window.scrollY));
    };
    document.addEventListener('click', save, true);
    return () => document.removeEventListener('click', save, true);
  }, []);

  // Top on forward navigation; restored position on back/forward.
  useEffect(() => {
    const { ScrollTrigger } = ensureGsap();
    const to = (y: number) => (lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
    let raf = 0; let t = 0;
    if (popRef.current) {
      popRef.current = false;
      const y = Number(sessionStorage.getItem('scroll:' + location.pathname + location.search) || 0);
      // wait for layout (pins/spacers) before restoring
      raf = requestAnimationFrame(() => { ScrollTrigger.refresh(); to(y); t = window.setTimeout(() => { ScrollTrigger.refresh(); to(y); }, 250); });
    } else if (!window.location.hash) {
      to(0);
    }
    const r = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); clearTimeout(r); };
  }, [pathname, lenis]);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}
