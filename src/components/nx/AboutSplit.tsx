'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { Arrow } from '../Icons';
import { ensureGsap, isSmall, prefersReducedMotion } from '@/lib/motion';
import { nxEase, whenIn } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './AboutSplit.module.css';

/**
 * About Bonei Binyan — live rebuild of the approved mock (1672×941 frame).
 * Break points of the asymmetric cut were sampled from the mock's pixels
 * (x,y in frame px). The photo lives to the right of the cut; a thin glow
 * runs along it. Entrance (Zentry moment): the cut starts as a straight
 * vertical edge, folds into its broken profile while the photograph settles,
 * and lands exactly on the mock frame.
 */
const FW = 1672, FH = 941;
const EDGE: [number, number][] = [
  [531, 0], [584, 70], [683, 120], [698, 140], [723, 200], [772, 280], [737, 350], [705, 460],
  [686, 490], [659, 520], [647, 550], [620, 615], [593, 680], [559, 750], [520, 820], [517, 845], [558, 941],
];
const pct = (x: number, y: number) => `${((x / FW) * 100).toFixed(3)}% ${((y / FH) * 100).toFixed(3)}%`;
const clipFrom = (pts: [number, number][]) => `polygon(${[...pts.map(([x, y]) => pct(x, y)), pct(FW, FH), pct(FW, 0)].join(', ')})`;
const FINAL = clipFrom(EDGE);
const LINE = EDGE.map(([x, y]) => `${x + 4},${y}`).join(' ');

const SLIDES = [
  { src: '/images/about/c46-c48-hadera.jpg', alt: 'שני בנייני C46 ו־C48 בחדרה בשעת דמדומים, בין שדרת דקלים לכביש' },
  { src: '/images/about/c46-c48-twin.jpg', alt: 'שני בנייני C46 ו־C48 בחדרה מהחניה, בשעת ערב עם חלונות מוארים' },
];
// small facts row (founded 1972 and three generations — bonei.co.il; the third slot is verbal: no verified third figure)
const FACTS = [
  { v: '1972', l: 'שנת הקמה' },
  { v: '3 דורות', l: 'של עשייה משפחתית' },
  { v: 'יזמות וביצוע', l: 'תחת קורת גג אחת' },
];

export default function AboutSplit({ id = 'about', compact = false }: { id?: string; compact?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState(0);

  const show = (i: number) => {
    const el = root.current; if (!el || i === slide) return;
    const { gsap } = ensureGsap();
    const slides = el.querySelectorAll<HTMLElement>('[data-slide]');
    const inn = slides[i], out = slides[slide];
    setSlide(i);
    if (prefersReducedMotion()) { gsap.set(inn, { clipPath: 'inset(0% 0% 0% 0%)', zIndex: 2 }); gsap.set(out, { clipPath: 'inset(0% 0% 0% 100%)', zIndex: 1 }); return; }
    gsap.set(inn, { zIndex: 2 }); gsap.set(out, { zIndex: 1 });
    gsap.fromTo(inn, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'expo.inOut', onComplete: () => { gsap.set(out, { clipPath: 'inset(0% 0% 0% 100%)' }); } });
    gsap.fromTo(inn.querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 1.2, ease: 'expo.out' });
  };

  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const photo = el.querySelector<HTMLElement>('[data-photo]')!;
      const img = el.querySelector('[data-frame-img]');
      const glow = el.querySelectorAll<SVGPolylineElement>('[data-glow] polyline');
      const lines = el.querySelectorAll('.nx-ln > span');
      const rest = el.querySelectorAll('[data-in]');
      const small = isSmall();
      // Lusion moment (lusion.co: the hero frame collapses/expands while the next headline travels at its own pace):
      // the About frame opens from an inset, rounded window to the full bleed as it arrives, and the text column
      // rises slightly slower than the page, so photograph and headline never move together.
      gsap.fromTo(el, { clipPath: small ? 'inset(3% 3% 0% 3% round 14px)' : 'inset(9% 5% 0% 5% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 22%', scrub: true } });
      if (!small) gsap.fromTo(el.querySelector('.' + CSS.escape(s.text)), { y: 90 }, { y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 20%', scrub: true } });
      if (!small) {
        const st = { p: 0 };
        const startX = 860; // straight cut, further right
        const draw = () => {
          const pts = EDGE.map(([x, y]) => [startX + (x - startX) * st.p, y] as [number, number]);
          photo.style.clipPath = clipFrom(pts);
        };
        draw();
        glow.forEach((g) => { const L = g.getTotalLength(); gsap.set(g, { strokeDasharray: L, strokeDashoffset: L }); });
        gsap.set(img, { scale: 1.14, xPercent: 3 });
        gsap.set(lines, { yPercent: 108 });
        gsap.set(rest, { opacity: 0, y: 16, filter: 'blur(6px)' });
        whenIn(el, () => {
          gsap.timeline()
            .to(st, { p: 1, duration: 1.6, ease: nxEase.io, onUpdate: draw, onComplete: () => { photo.style.clipPath = ''; } }, 0)
            .to(img, { scale: 1, xPercent: 0, duration: 2, ease: nxEase.out, clearProps: 'transform' }, 0)
            .to(glow, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0.9)
            .to(lines, { yPercent: 0, duration: 1.2, ease: nxEase.out, stagger: 0.1 }, 0.35)
            .to(rest, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.95, ease: nxEase.soft, stagger: 0.09, clearProps: 'filter,transform' }, 0.7);
        }, 'top 72%');
      } else {
        gsap.set(img, { scale: 1.12 });
        gsap.set(lines, { yPercent: 108 });
        gsap.set(rest, { opacity: 0, y: 14 });
        whenIn(el, () => {
          gsap.timeline()
            .to(img, { scale: 1, duration: 1.6, ease: nxEase.out }, 0)
            .to(lines, { yPercent: 0, duration: 1.1, ease: nxEase.out, stagger: 0.1 }, 0.25)
            .to(rest, { opacity: 1, y: 0, duration: 0.8, ease: nxEase.soft, stagger: 0.08 }, 0.5);
        }, 'top 75%');
      }
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id={id} className={`nx ${nxFonts} ${s.sec} ${compact ? s.compact : ''}`} aria-labelledby={`${id}-title`}>
      <div className={s.photo} data-photo style={{ ['--clip' as string]: FINAL }}>
        {/* sharp frame: placed where the mock places it (scale 1.01, origin 564,52 in frame px — solved against the mock) */}
        <div className={s.frame} data-frame-img>
          {SLIDES.map((x, i) => (
            <div key={x.src} className={`${s.slide} ${i > 0 ? s.slideHidden : ''}`} data-slide>
              <Image src={x.src} alt={x.alt} fill sizes="(max-width: 900px) 100vw, 75vw" quality={85} className={s.img} />
            </div>
          ))}
        </div>
      </div>
      <svg className={s.glow} data-glow viewBox={`0 0 ${FW} ${FH}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <polyline points={LINE} className={s.halo} />
        <polyline points={LINE} className={s.core} />
      </svg>
      <p className={s.caption} data-in>חדרה<span aria-hidden="true">|</span><bdi>C46 &amp; C48</bdi></p>
      <div className={s.pager} data-in role="group" aria-label="תמונות מהפרויקט">
        {SLIDES.map((x, i) => <button key={x.src} type="button" className={s.pg} aria-label={`תמונה ${i + 1} מתוך ${SLIDES.length}`} aria-current={slide === i} onClick={() => show(i)} />)}
      </div>

      <div className={s.text}>
        <h2 id={`${id}-title`} className={s.title}><span className="nx-ln"><span>אודות בוני בניין</span></span></h2>
        <p className={s.sub}><span className="nx-ln"><span>חושבים אנשים</span></span></p>
        <span className={s.rule} aria-hidden="true" data-in />
        <p className={s.body} data-in>
          <span>בוני בניין היא חברת יזמות ובנייה</span> <span>משפחתית הפועלת מאז <bdi>1972</bdi>. שלושה</span> <span>דורות של עשייה, מתכנון הפרויקט ועד</span> <span>למסירת המפתח.</span>
        </p>
        <Link href="/about" className={s.cta} data-in><span className={s.ctaText}>הסיפור שלנו</span><Arrow className={s.arr} /></Link>
      </div>
      <dl className={s.facts} data-in>
        {FACTS.map((f) => <div key={f.v} className={s.fact}><dt>{f.v}</dt><dd>{f.l}</dd></div>)}
      </dl>
    </section>
  );
}
