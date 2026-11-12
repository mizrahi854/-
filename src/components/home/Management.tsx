'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Orn from '../nx/Orn';
import ZTitle from '../nx/ZTitle';
import { Arrow } from '../Icons';
import { management, story } from '@/data/company';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';
import { revealOrn, revealTitle, whenIn } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './Management.module.css';

/**
 * Management — an interactive gallery instead of a long scroll scene.
 * One big portrait at a time; a strip of round portraits (with laurel branches, after the
 * supplied avatar reference) selects who is in focus — on hover, focus or click. A new portrait
 * snaps in from the side (direction follows the order on the strip) through a slanted mask while
 * the old one is thrown the other way; name and role slide up, a lavender plate behind the photo
 * tilts to a new angle. It also plays by itself every few seconds until the visitor takes over.
 * Names, roles, photographs and bios: bonei.co.il/manegmant (src/data/company.ts).
 */
const FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const SLIM = 'polygon(38% 0%, 62% 0%, 54% 100%, 46% 100%)';
const WIDE = 'polygon(14% 0%, 100% 0%, 86% 100%, 0% 100%)';
const AUTO_MS = 3800;

/** A laurel branch built from a stem curve and paired leaves (viewBox 0 0 44 110). */
function Laurel({ flip = false }: { flip?: boolean }) {
  const P = [[34, 106], [6, 84], [6, 34], [30, 4]] as const; // cubic bezier
  const at = (t: number) => {
    const u = 1 - t; const x = u ** 3 * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t ** 3 * P[3][0];
    const y = u ** 3 * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t ** 3 * P[3][1];
    const dx = 3 * u * u * (P[1][0] - P[0][0]) + 6 * u * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]);
    const dy = 3 * u * u * (P[1][1] - P[0][1]) + 6 * u * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1]);
    return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
  };
  const leaves = Array.from({ length: 8 }, (_, k) => at(0.1 + k * 0.115));
  return (
    <svg className={`${s.laurel} ${flip ? s.flip : ''}`} viewBox="0 0 44 110" aria-hidden="true" focusable="false">
      <path d={`M${P[0]} C${P[1]} ${P[2]} ${P[3]}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {leaves.map((l, k) => (
        <g key={k} transform={`translate(${l.x} ${l.y}) rotate(${l.a})`}>
          <ellipse cx="0" cy="-5.6" rx="2.6" ry="6.4" transform="rotate(-34 0 -5.6)" fill="currentColor" />
          <ellipse cx="0" cy="5.6" rx="2.6" ry="6.4" transform="rotate(34 0 5.6)" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

export default function Management({ showLink = true }: { showLink?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const prev = useRef(0);
  const ready = useRef(false);
  const live = useRef({ inView: false, paused: false, taken: false });
  const m = management[i];

  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      revealOrn(el, 'top 80%');
      revealTitle(el, { trigger: el.querySelector('[data-head]')!, start: 'top 82%' });
      const parts = el.querySelectorAll('[data-rise]');
      gsap.set(parts, { opacity: 0, y: 24 });
      whenIn(el.querySelector('[data-main]')!, () => gsap.to(parts, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }), 'top 85%');
    }, el);
    return () => ctx.revert();
  }, []);

  // portrait swap: fast, from the side, slanted mask
  useLayoutEffect(() => {
    const el = root.current; if (!el) return;
    if (!ready.current) { ready.current = true; return; }
    const from = prev.current; prev.current = i;
    if (from === i || prefersReducedMotion()) {
      el.querySelectorAll<HTMLElement>('[data-f]').forEach((f, k) => { f.style.visibility = k === i ? 'visible' : 'hidden'; });
      return;
    }
    const { gsap } = ensureGsap();
    const frames = el.querySelectorAll<HTMLElement>('[data-f]');
    const inn = frames[i], out = frames[from];
    const dir = i > from ? -1 : 1; // RTL strip: higher index sits further left, so the portrait comes in from the left
    gsap.killTweensOf([inn, out]);
    gsap.set(frames, { zIndex: 1 });
    gsap.set(inn, { visibility: 'visible', zIndex: 3, x: `${dir * 78}%`, y: dir * 6 + '%', clipPath: SLIM, opacity: 1, scale: 1.04 });
    gsap.to(inn, { x: '0%', y: '0%', scale: 1, duration: 0.55, ease: 'power4.out' });
    gsap.to(inn, { clipPath: FULL, duration: 0.5, ease: 'power3.out' });
    gsap.set(out, { zIndex: 2 });
    gsap.to(out, { x: `${-dir * 30}%`, opacity: 0, clipPath: WIDE, duration: 0.4, ease: 'power2.in', onComplete: () => { gsap.set(out, { visibility: 'hidden', x: 0, opacity: 1, clipPath: FULL, zIndex: 1 }); } });
    const shape = el.querySelector('[data-shape]');
    gsap.fromTo(shape, { rotate: gsap.utils.random(-14, 14), scale: 0.88, xPercent: dir * -8 }, { rotate: gsap.utils.random(-5, 5), scale: 1, xPercent: 0, duration: 0.7, ease: 'back.out(2.2)' });
    const bits = el.querySelectorAll('[data-info] [data-b]');
    gsap.fromTo(el.querySelectorAll('[data-info] [data-name] > span'), { yPercent: 115 }, { yPercent: 0, duration: 0.45, ease: 'power4.out' });
    gsap.fromTo(bits, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.05, clearProps: 'transform' });
  }, [i]);

  // autoplay while visible, until the visitor takes over
  useEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => { live.current.inView = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(el);
    const t = window.setInterval(() => { const l = live.current; if (l.inView && !l.paused && !l.taken && !document.hidden) setI((v) => (v + 1) % management.length); }, AUTO_MS);
    return () => { io.disconnect(); window.clearInterval(t); };
  }, []);

  const pick = (k: number, by: 'hover' | 'click' | 'focus') => { live.current.taken = true; if (k !== i) setI(k); void by; };

  return (
    <section ref={root} id="management" className={`nx nx-light ${nxFonts} ${s.sec}`} aria-labelledby="mg-title"
      onPointerEnter={() => (live.current.paused = true)} onPointerLeave={() => (live.current.paused = false)}>
      <div className="nx-wrap">
        <header className={s.head} data-head>
          <div className={s.titleBox}>
            <Orn className={s.orn} end={false} lines="end"><span className={s.kicker} lang="en">MANAGEMENT</span></Orn>
            <ZTitle id="mg-title" lines={['הנהלת', 'בוני בניין']} className={s.title} />
          </div>
          <p className={s.sub} data-rise>{story.team}</p>
        </header>

        <div className={s.main} data-main>
          <div className={s.stage} data-rise>
            <span className={s.shape} data-shape aria-hidden="true" />
            <div className={s.frameBox}>
              {management.map((p, k) => (
                <div key={p.id} className={s.f} data-f style={{ visibility: k === 0 ? 'visible' : 'hidden' }}>
                  <Image src={p.img} alt={k === i ? `${p.name}, ${p.role} בבוני בניין` : ''} fill sizes="(max-width: 767px) 78vw, 30vw" quality={78} className={s.img} priority={k === 0} />
                </div>
              ))}
            </div>
          </div>

          <div className={s.info} data-info aria-live="polite">
            <p className={s.role} data-b>{m.role}</p>
            <h3 className={s.name} data-name><span>{m.name}</span></h3>
            <p className={s.bio} data-b>{m.bio}</p>
            {showLink && <Link href="/about#management" className={s.more} data-b>על ההנהלה והמחלקות <Arrow className={s.arr} /></Link>}
          </div>
        </div>

        <div className={s.strip} data-rise role="group" aria-label="בחירת איש הנהלה">
          <Laurel />
          <ul className={s.avatars}>
            <li><Link href="/about#management" className={s.plus} aria-label="על ההנהלה והמחלקות"><span aria-hidden="true">+</span></Link></li>
            {management.map((p, k) => (
              <li key={p.id}>
                <button type="button" className={s.av} aria-label={`${p.name}, ${p.role}`} aria-pressed={k === i}
                  onPointerEnter={(e) => { if (e.pointerType === 'mouse') pick(k, 'hover'); }} onFocus={() => pick(k, 'focus')} onClick={() => pick(k, 'click')}>
                  <Image src={p.img} alt="" width={120} height={120} sizes="72px" className={s.avImg} quality={78} />
                </button>
              </li>
            ))}
          </ul>
          <Laurel flip />
        </div>
      </div>
    </section>
  );
}
