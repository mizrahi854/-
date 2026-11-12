'use client';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ensureGsap, M, prefersReducedMotion } from '@/lib/motion';

/**
 * Shared-element transition for project cards (Emerald-style):
 * the clicked image is lifted into a fixed layer, expands into the
 * destination hero frame while the route changes, then hands over.
 */
type Ctx = { openProject: (href: string, img: HTMLImageElement | null) => void; landed: () => void };
const TCtx = createContext<Ctx>({ openProject: () => {}, landed: () => {} });
export const useProjectTransition = () => useContext(TCtx);

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const cover = useRef<HTMLDivElement | null>(null);
  const pending = useRef<{ busy: boolean; pushed: boolean; timer: number } | null>(null);
  const layer = useRef<HTMLDivElement | null>(null);
  const started = useRef(0);

  const cleanup = useCallback(() => {
    const { gsap } = ensureGsap();
    const l = layer.current; if (!l) return;
    layer.current = null;
    gsap.to(l, { opacity: 0, duration: 0.45, ease: 'power2.out', delay: 0.05, onComplete: () => l.remove() });
  }, []);

  const openProject = useCallback((href: string, img: HTMLImageElement | null) => {
    if (!img || prefersReducedMotion() || layer.current) { router.push(href); return; }
    const { gsap } = ensureGsap();
    const r = img.getBoundingClientRect();
    const l = document.createElement('div');
    l.className = 'pt-layer';
    l.setAttribute('aria-hidden', 'true');
    Object.assign(l.style, { top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px' });
    const im = document.createElement('img');
    im.src = img.currentSrc || img.src; im.alt = '';
    const veil = document.createElement('div'); veil.className = 'pt-veil';
    l.append(im, veil);
    document.body.appendChild(l);
    layer.current = l;
    const vh = window.innerHeight; const vw = document.documentElement.clientWidth;
    const heroH = Math.round(vw < 768 ? vh * 0.78 : vh * 0.92);
    let navigated = false;
    const go = () => { if (!navigated) { navigated = true; router.push(href, { scroll: true }); } };
    gsap.timeline({ defaults: { ease: M.ease.inOut } })
      .to(l, { top: 0, left: 0, width: vw, height: heroH, duration: M.dur.page })
      .to(veil, { opacity: 1, duration: M.dur.page }, 0)
      .add(go, 0.12);
    // safety: never leave the layer on screen
    window.setTimeout(() => cleanup(), 2600);
    started.current = performance.now();
  }, [router, cleanup]);

  const landed = useCallback(() => {
    if (!layer.current) return;
    const wait = started.current + M.dur.page * 1000 + 60 - performance.now();
    window.setTimeout(() => cleanup(), Math.max(0, wait));
  }, [cleanup]);

  /* ---- page-to-page cover (Emerald, from the supplied recording): the page cuts to a dark field with faint
     vertical rules, the route changes underneath, then the new page opens from a thin centre slit to full width. ---- */
  const reveal = useCallback(() => {
    const c = cover.current; const st = pending.current; if (!c || !st) return;
    pending.current = null; window.clearTimeout(st.timer);
    const { gsap } = ensureGsap();
    gsap.timeline({ onComplete: () => { c.style.visibility = 'hidden'; } })
      .to(c.querySelectorAll('.pg-rules i'), { opacity: 0, duration: 0.3 }, 0)
      .to(c.querySelector('.pg-half--l'), { xPercent: -101, duration: 0.95, ease: 'expo.inOut' }, 0.08)
      .to(c.querySelector('.pg-half--r'), { xPercent: 101, duration: 0.95, ease: 'expo.inOut' }, 0.08);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download') || a.origin !== location.origin) return;
      if (a.closest('[data-tile]') || layer.current || pending.current?.busy) return;
      if (a.pathname === location.pathname) return; // same page: hash / filter changes stay instant
      const c = cover.current; if (!c) return;
      e.preventDefault();
      const href = a.pathname + a.search + a.hash;
      const { gsap } = ensureGsap();
      const st = { busy: true, pushed: false, timer: 0 };
      pending.current = st;
      c.style.visibility = 'visible';
      gsap.set(c.querySelectorAll('.pg-half'), { xPercent: 0 });
      gsap.set(c.querySelectorAll('.pg-rules i'), { opacity: 1, scaleY: 0 });
      gsap.set(c, { opacity: 0 });
      gsap.timeline()
        .to(c, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0)
        .to(c.querySelectorAll('.pg-rules i'), { scaleY: 1, duration: 0.5, ease: 'expo.out', stagger: { each: 0.02, from: 'center' } }, 0.1)
        .add(() => { st.pushed = true; router.push(href, { scroll: true }); }, 0.32);
      // safety: never leave the cover on screen if the route is slow
      st.timer = window.setTimeout(reveal, 4200);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [router, reveal]);

  useEffect(() => {
    const st = pending.current; if (!st || !st.pushed) return;
    const t = window.setTimeout(reveal, 160); // let the new page paint under the sheet
    return () => window.clearTimeout(t);
  }, [pathname, reveal]);

  /* ---- first-load screen: Bonei mark + rules, short (~1.5s), then the two halves part from the centre ---- */
  const loader = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const l = loader.current; if (!l || prefersReducedMotion()) return;
    try { if (sessionStorage.getItem('bonei:seen')) { l.style.display = 'none'; return; } sessionStorage.setItem('bonei:seen', '1'); } catch { /* private mode: just play it */ }
    const { gsap } = ensureGsap();
    // The logo and rules play from CSS at first paint (no JS needed), so a slow connection still shows something at once.
    // JS only plays the exit: once hydrated and the intro has had ~0.85s on screen, the halves part from the centre.
    const rules = l.querySelectorAll('.pg-rules i');
    const mark = l.querySelector('.pg-mark img'); const line = l.querySelector('.pg-mark i');
    const wait = Math.max(0, 0.85 - performance.now() / 1000);
    gsap.timeline({ delay: wait, onComplete: () => { l.style.display = 'none'; } })
      .to([mark, line], { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0)
      .to(rules, { opacity: 0, duration: 0.25 }, 0.02)
      .to(l.querySelector('.pg-half--l'), { xPercent: -101, duration: 0.75, ease: 'expo.inOut' }, 0.08)
      .to(l.querySelector('.pg-half--r'), { xPercent: 101, duration: 0.75, ease: 'expo.inOut' }, 0.08);
    return () => { gsap.killTweensOf(l); };
  }, []);

  const halves = (withMark: boolean) => (
    <>
      <div className="pg-half pg-half--l" />
      <div className="pg-half pg-half--r" />
      <div className="pg-rules">{Array.from({ length: 13 }, (_, k) => <i key={k} style={{ ['--k' as string]: Math.abs(k - 6) }} />)}</div>
      {withMark && <div className="pg-mark"><img src="/images/brand/logo-white.png" alt="" width={600} height={407} /><i /></div>}
    </>
  );

  return (
    <TCtx.Provider value={{ openProject, landed }}>
      {children}
      <div ref={cover} className="pg-cover" aria-hidden="true">{halves(false)}</div>
      <div ref={loader} className="pg-loader" aria-hidden="true">{halves(true)}</div>
    </TCtx.Provider>
  );
}
