'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import { ensureGsap, M, prefersReducedMotion, isSmall } from '@/lib/motion';
import { Arrow, ArrowDown } from '../Icons';
import s from './HeroSequence.module.css';

/**
 * 01 Approved hero + 02 cloud transition.
 * The hero is sticky inside a tall wrapper; the intro section (#intro) slides
 * underneath it (negative margin). While scrolling, three alpha cloud layers
 * rise at different speeds, fully occlude the seam, the hero dissolves behind
 * them, and the intro headline resolves as they clear. Fully reversible (scrub).
 */
export default function HeroSequence() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current; if (!el) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    const q = gsap.utils.selector(el);
    const reduce = prefersReducedMotion();

    // ---- entrance: image settles, heading in two beats, then support + CTA
    const intro = gsap.context(() => {
      if (reduce) return;
      const tl = gsap.timeline({ defaults: { ease: M.ease.out } });
      tl.fromTo(q('[data-media]'), { scale: 1.08 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, 0)
        .fromTo(q('[data-tint]'), { opacity: 0.55 }, { opacity: 1, duration: 1.6 }, 0)
        .fromTo(q('[data-eyebrow]'), { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 1 }, 0.35)
        .to(q('[data-l1] > span'), { y: 0, duration: 1.25 }, 0.45)
        .to(q('[data-l2] > span'), { y: 0, duration: 1.25 }, 0.62)
        .fromTo(q('[data-sub]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9 }, 1.0)
        .fromTo(q('[data-cta]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9 }, 1.1)
        .fromTo(q('[data-foot]'), { opacity: 0 }, { opacity: 1, duration: 1 }, 1.2)
        .fromTo(q('[data-cloud]'), { yPercent: 14, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 2, stagger: 0.12, ease: 'power2.out' }, 0.2);
    }, el);

    if (reduce) return () => intro.revert();

    // ---- scroll sequence (rebuilt on resize so measurements stay true)
    let seq: gsap.Context | null = null;
    const build = () => {
      seq?.revert();
      seq = gsap.context(() => {
        const vh = window.innerHeight;
        const front = q('[data-cloud="front"]')[0] as HTMLElement;
        const mid = q('[data-cloud="mid"]')[0] as HTMLElement;
        const back = q('[data-cloud="back"]')[0] as HTMLElement;
        const imgH = (front.querySelector('img') as HTMLImageElement).getBoundingClientRect().height;
        const travel = (c: HTMLElement) => c.offsetTop + c.offsetHeight + 40;
        const tf = travel(front), tm = travel(mid);
        // progress at which the front layer fully covers the viewport
        const pCoverIn = Math.min(0.6, (front.offsetTop + imgH * 0.62) / tf);
        const pCoverOut = Math.max(pCoverIn + 0.08, (front.offsetTop + front.offsetHeight - imgH * 0.6 - vh) / tf);
        const introLines = document.querySelectorAll('#intro [data-intro-line] > span');

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: isSmall() ? 0.4 : 0.8, invalidateOnRefresh: true },
        });
        tl.to(q('[data-content]'), { yPercent: -28, opacity: 0, duration: 0.3, ease: 'power1.in' }, 0)
          .to(q('[data-foot]'), { opacity: 0, duration: 0.12 }, 0)
          .to(q('[data-media]'), { scale: 1.07, yPercent: -3, duration: pCoverOut }, 0)
          .to(front, { y: -tf, duration: 1 }, 0)
          .to(mid, { y: -tm * 0.9, duration: 1 }, 0)
          .to(back, { y: -vh * 0.75, duration: pCoverOut }, 0)
          .to(back, { opacity: 0, duration: 0.12 }, pCoverOut - 0.05)
          .to(q('[data-hero]'), { opacity: 0, duration: Math.max(0.04, (pCoverOut - pCoverIn) * 0.6) }, pCoverIn + (pCoverOut - pCoverIn) * 0.2)
          .set(q('[data-hero]'), { visibility: 'hidden' }, pCoverOut)
          .fromTo(introLines, { y: '105%' }, { y: '0%', duration: 0.16, stagger: 0.05, ease: 'power3.out' }, Math.min(0.8, pCoverOut - 0.01));
      }, el);
    };
    build();
    let t: number | undefined;
    const onResize = () => { window.clearTimeout(t); t = window.setTimeout(() => { build(); ScrollTrigger.refresh(); }, 220); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); seq?.revert(); intro.revert(); };
  }, []);

  return (
    <section ref={root} className={s.seq} aria-label="פתיחה">
      <div className={s.sticky}>
        <div className={s.hero} data-hero>
          <div className={s.media} data-media>
            <div className={s.fill} aria-hidden="true">
              <Image src="/images/brand/hero-hashmonaim-1280.jpg" alt="" fill sizes="40vw" quality={70} />
            </div>
            <div className={s.frame}>
              <Image
                src="/images/brand/hero-hashmonaim-2200.jpg"
                alt="הדמיית פרויקט החשמונאים 23 ברעננה בשעת דמדומים — שני נפחי בניין לבנים עם מרפסות ירוקות"
                fill priority sizes="(max-width: 767px) 230vw, 92vw" quality={85}
                className={s.img}
              />
            </div>
          </div>
          <div className={s.tint} data-tint aria-hidden="true" />
          <div className={s.content} data-content>
            <p className={s.eyebrow} data-eyebrow dir="ltr"><span>BONEI BINYAN · SINCE 1972</span></p>
            <h1 className={s.title}>
              <span className={`ln ${s.l1}`} data-l1><span>חושבים</span></span>
              <span className={`ln ${s.l2}`} data-l2><span>אנשים.</span></span>
            </h1>
            <p className={s.sub} data-sub>שלושה דורות של יזמות ובנייה</p>
            <div data-cta className={s.ctaWrap}>
              <Link href="/projects" className={`btn btn--ghost ${s.cta}`}>לפרויקטים שלנו <Arrow /></Link>
            </div>
          </div>
          <div className={s.foot} data-foot>
            <a href="#intro" className={s.cue} aria-label="גלילה לתוכן"><ArrowDown /></a>
            <Link href="/projects/hahashmonaim-23" className={s.caption}>החשמונאים <bdi>23</bdi> <span aria-hidden="true">|</span> רעננה</Link>
          </div>
        </div>

        <div className={s.clouds} aria-hidden="true">
          <div className={`${s.cloud} ${s.back}`} data-cloud="back">
            <img src="/images/clouds/cloud-back.webp" alt="" width={1600} height={700} />
          </div>
          <div className={`${s.cloud} ${s.mid}`} data-cloud="mid">
            <img src="/images/clouds/cloud-mid.webp" alt="" width={1600} height={760} />
          </div>
          <div className={`${s.cloud} ${s.front}`} data-cloud="front">
            <img src="/images/clouds/cloud-front.webp" alt="" width={1600} height={820} />
            <div className={s.tail} />
            <img src="/images/clouds/cloud-front.webp" alt="" width={1600} height={820} className={s.flip} />
          </div>
        </div>
      </div>

      <svg width="0" height="0" className={s.defs} aria-hidden="true" focusable="false">
        {/* one asymmetric quarter-curve at the top-right; every other corner stays square */}
        <clipPath id="heroClip" clipPathUnits="objectBoundingBox">
          <path d="M0,0 H0.79 C0.905,0 0.992,0.215 1,0.5 V1 H0 Z" />
        </clipPath>
        <clipPath id="heroClipM" clipPathUnits="objectBoundingBox">
          <path d="M0,0 H0.64 C0.85,0 0.995,0.05 1,0.2 V1 H0 Z" />
        </clipPath>
      </svg>
    </section>
  );
}
