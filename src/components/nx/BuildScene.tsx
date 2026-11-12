'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import Orn from './Orn';
import ZTitle from './ZTitle';
import Glow from './Glow';
import { Arrow } from '../Icons';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';
import { nxEase, revealOrn, revealTitle, whenIn } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './BuildScene.module.css';

/**
 * "From frame to home" — one scroll-driven scene shared by the home page and
 * urban renewal. Every instance owns its ref, its matchMedia and its own
 * ScrollTrigger (all queries are scoped to this section), so scrolling one page
 * can never drive another. Desktop: the section pins; the steps travel along a
 * baseline while the building redraws from its line drawing (the skeleton, the
 * real render run through an SVG edge filter — no second asset) into the finished
 * render, floor by floor, forward and backward. Mobile: short, un-pinned scrub.
 * Reduced motion: no pin — skeleton and finished house shown side by side.
 */
export type BuildStage = { n: string; title: string; text: string };
export type BuildCta = { title: string; text: string; label: string; href: string };

export default function BuildScene({ id, kicker, titleLines, stages, cta, image = '/images/p/hamaalot-6/00.jpg', glow = 'c', plainTitle, large }: {
  id: string; large?: boolean; kicker: string; titleLines?: string[]; plainTitle?: string; stages: BuildStage[]; cta: BuildCta; image?: string; glow?: 'a' | 'b' | 'c' | 'd';
}) {
  const root = useRef<HTMLElement>(null);
  const filterId = `${id}-lines`;

  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      revealOrn(el, 'top 80%');
      revealTitle(el, { trigger: el.querySelector('[data-head]')!, start: 'top 80%' });
      const color = el.querySelector('[data-color]');
      const stA = el.querySelector('[data-state-a]'); const stB = el.querySelector('[data-state-b]');
      mm.add('(min-width: 1024px)', () => {
        const track = el.querySelector<HTMLElement>('[data-track]')!;
        const viewport = el.querySelector<HTMLElement>('[data-vp]')!;
        const steps = gsap.utils.toArray<HTMLElement>('[data-step]');
        const dist = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        gsap.set(color, { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.set(steps, { opacity: 0.28 });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + (dist() + window.innerHeight * 0.9), pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1 },
        });
        // RTL: content starts on the right, so the track travels toward +x
        tl.to(track, { x: () => dist(), duration: 1 }, 0)
          .to(color, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.92 }, 0.04)
          .to(stA, { opacity: 0, duration: 0.1 }, 0.3)
          .to(stB, { opacity: 1, duration: 0.1 }, 0.82);
        steps.forEach((st, i) => {
          const at = 0.04 + (i / Math.max(1, steps.length - 1)) * 0.78;
          tl.to(st, { opacity: 1, duration: 0.08 }, Math.max(0, at - 0.06));
          const dot = st.querySelector('[data-dot]');
          if (dot) tl.fromTo(dot, { scaleX: 0.3 }, { scaleX: 1, duration: 0.06 }, Math.max(0, at - 0.04));
        });
        return () => { ScrollTrigger.refresh(); };
      });
      mm.add('(max-width: 1023px)', () => {
        const items = el.querySelectorAll('[data-step]');
        gsap.set(items, { opacity: 0, y: 24 });
        items.forEach((it) => whenIn(it, () => gsap.to(it, { opacity: 1, y: 0, duration: 0.9, ease: nxEase.soft }), 'top 88%'));
        // short, comfortable progression: the whole transformation plays across ~one screen of scrolling
        gsap.fromTo(color, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el.querySelector('[data-building]'), start: 'top 78%', end: 'top 22%', scrub: true } });
      });
    }, el);
    return () => { mm.revert(); ctx.revert(); };
  }, []);

  return (
    <section ref={root} id={id} className={`nx ${nxFonts} ${s.process} ${large ? s.large : ''}`} aria-labelledby={`${id}-title`}>
      <Glow variant={glow} />
      <svg width="0" height="0" className={s.defs} aria-hidden="true" focusable="false">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" />
          <feComponentTransfer><feFuncR type="linear" slope="5" /><feFuncG type="linear" slope="5" /><feFuncB type="linear" slope="5" /></feComponentTransfer>
          <feColorMatrix type="matrix" values="0 0 0 0 0.89  0 0 0 0 0.88  0 0 0 0 0.95  0.33 0.33 0.33 0 -0.06" />
        </filter>
      </svg>
      <div className={s.procStage}>
        <div className={s.procHead} data-head>
          <div className={s.procBox}>
            <Orn className={s.procOrn} lines="end"><span className={s.latin} lang="en">{kicker}</span></Orn>
            {titleLines
              ? <ZTitle id={`${id}-title`} lines={titleLines} className={s.procTitle} />
              : <h2 id={`${id}-title`} className={s.procTitle}>{plainTitle}</h2>}
          </div>
        </div>
        <div className={s.building} data-building aria-hidden="true" style={{ ['--lines' as string]: `url(#${filterId})` }}>
          <div className={s.bLines}><Image src={image} alt="" fill sizes="(max-width: 1023px) 80vw, 30vw" quality={78} className={s.bImg} /></div>
          <div className={s.bColor} data-color><Image src={image} alt="" fill sizes="(max-width: 1023px) 80vw, 30vw" quality={78} className={s.bImg} /></div>
          <p className={s.state}><span data-state-a>שלד</span><span className={s.stateB} data-state-b>בית גמור</span></p>
        </div>
        <div className={s.procVp} data-vp>
          <ol className={s.track} data-track>
            {stages.map((st) => (
              <li key={st.n} className={s.step} data-step>
                <span className={s.stepN} lang="en"><bdi>{st.n}</bdi></span>
                <h3 className={s.stepT}>{st.title}</h3>
                <p className={s.stepX}>{st.text}</p>
                <span className={s.stem} aria-hidden="true"><i data-dot /></span>
              </li>
            ))}
            <li className={`${s.step} ${s.stepCta}`} data-step>
              <h3 className={s.stepT}>{cta.title}</h3>
              <p className={s.stepX}>{cta.text}</p>
              {cta.href.startsWith('#')
                ? <a href={cta.href} className="nx-btn">{cta.label} <Arrow className="" /></a>
                : <Link href={cta.href} className="nx-btn">{cta.label} <Arrow className="" /></Link>}
            </li>
          </ol>
          <span className={s.baseline} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
