'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { Project } from '@/lib/projects';
import { useProjectTransition } from '../Transition';
import { ensureGsap, M, prefersReducedMotion } from '@/lib/motion';
import s from './ProjectHero.module.css';

/** Destination of the card→page transition: same image, same crop, full bleed. */
export default function ProjectHero({ p }: { p: Project }) {
  const { landed } = useProjectTransition();
  const root = useRef<HTMLElement>(null);
  const c = p.images[0];
  useEffect(() => { landed(); }, [landed]);
  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-ph-line] > span', { y: '105%' }, { y: '0%', duration: M.dur.enter, ease: M.ease.out, stagger: 0.08, delay: 0.55 });
      gsap.fromTo('[data-ph-fade]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: M.ease.soft, delay: 0.85, stagger: 0.06 });
      gsap.to('[data-ph-img]', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className={`${s.hero} on-ink`}>
      <div className={s.media}>
        {c ? <Image data-ph-img src={c.src} alt={`${p.title}${p.city ? ', ' + p.city : ''}`} fill priority sizes="100vw" quality={85} className={s.img} /> : <div className={s.empty} />}
        <div className={s.veil} />
      </div>
      <div className={`wrap ${s.inner}`}>
        <nav aria-label="פירורי לחם" className={s.crumbs} data-ph-fade>
          <Link href="/">דף הבית</Link><span aria-hidden="true">/</span>
          <Link href={p.kind === 'commercial' ? '/projects?type=commercial' : '/projects'}>{p.kind === 'commercial' ? 'מבני ציבור ומסחר' : 'פרויקטים'}</Link>
        </nav>
        <h1 className={s.h}>
          <span className="ln" data-ph-line><span>{p.title}</span></span>
          {(p.city || p.subtitle) && <span className={`ln ${s.sub}`} data-ph-line><span>{[p.subtitle, p.city].filter(Boolean).join(' · ')}</span></span>}
        </h1>
        <div className={s.meta} data-ph-fade>
          <span className="tag" data-status={p.status}>{p.statusLabel}</span>
          {p.renewal && <span className={s.chip}>{p.renewal}</span>}
          {p.facts.architect && <span className={s.arch}>אדריכלות: {p.facts.architect}</span>}
        </div>
      </div>
    </section>
  );
}
