'use client';
import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import Orn from './Orn';
import { Arrow } from '../Icons';
import { ensureGsap, isSmall, prefersReducedMotion } from '@/lib/motion';
import { nxEase, revealOrn } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './NxHero.module.css';

/**
 * The one page hero of the site (taken from urban renewal): full-bleed photograph with a chevron-cut
 * bottom edge, centred kicker + title in masked lines, a short lead and an optional button, a chevron line
 * that draws in. Used by every inner page so they all open the same way.
 */
export default function NxHero({ id, kicker, lines, lead, image, alt, pos = '50% 58%', cta }: {
  id: string; kicker: string; lines: string[]; lead: React.ReactNode; image: string; alt: string; pos?: string; cta?: { href: string; label: string };
}) {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.05 });
      tl.fromTo('[data-img]', { scale: 1.12 }, { scale: 1, duration: 2.2, ease: nxEase.out }, 0)
        .fromTo('[data-hl] > span', { yPercent: 108 }, { yPercent: 0, duration: 1.2, ease: nxEase.out, stagger: 0.1 }, 0.25)
        .fromTo('[data-hp]', { opacity: 0, y: 16, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: nxEase.soft, stagger: 0.1, clearProps: 'filter' }, 0.6)
        .fromTo('[data-chev]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.4);
      revealOrn(el, 'top 100%');
      if (!isSmall()) gsap.to('[data-img]', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className={`nx ${nxFonts} ${s.hero}`} aria-labelledby={id}>
      <div className={s.media}>
        <div className={s.imgWrap} data-img>
          <Image src={image} alt={alt} fill priority sizes="100vw" quality={78} className={s.img} style={{ objectPosition: pos }} />
        </div>
        <div className={s.shade} />
      </div>
      <div className={s.inner}>
        <Orn className={s.orn}><span className={s.latin} lang="en">{kicker}</span></Orn>
        <h1 id={id} className={s.title} aria-label={lines.join(' ')}>
          {lines.map((l) => <span key={l} className="nx-ln" data-hl aria-hidden="true"><span>{l}</span></span>)}
        </h1>
        <p className={s.lead} data-hp>{lead}</p>
        {cta && <div data-hp><a href={cta.href} className="nx-btn">{cta.label} <Arrow className="" /></a></div>}
      </div>
      <svg className={s.chev} viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path data-chev pathLength={1} strokeDasharray="1" d="M0 4 L60 56 H940 L1000 4" />
      </svg>
    </section>
  );
}
