'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import Orn from '../nx/Orn';
import ZTitle from '../nx/ZTitle';
import Glow from '../nx/Glow';
import { Arrow } from '../Icons';
import { credentials, departments, generations, keyFigures, story } from '@/data/company';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';
import { nxEase, revealOrn, revealText, revealTitle, whenIn } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './AboutScenes.module.css';

/** Run a scene builder inside a reverted gsap context (content is always readable without JS / with reduced motion). */
function useScene<T extends HTMLElement>(build: (el: T, gsap: typeof import('gsap').gsap) => void) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => build(el, gsap), el);
    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

/* 2 — three generations: statement, a timeline that draws, figures that count */
export function AboutStory() {
  const ref = useScene<HTMLElement>((el, gsap) => {
    revealOrn(el, 'top 80%');
    revealTitle(el, { trigger: el.querySelector('[data-head]')!, start: 'top 82%' });
    revealText(el.querySelectorAll('[data-fade]'), el, { start: 'top 78%' });
    const line = el.querySelector('[data-tline]'); const gens = el.querySelectorAll('[data-gen]');
    gsap.set(line, { scaleX: 0 }); gsap.set(gens, { opacity: 0, y: 28 });
    whenIn(el.querySelector('[data-gens]')!, () => {
      gsap.to(line, { scaleX: 1, duration: 1.6, ease: nxEase.mask });
      gsap.to(gens, { opacity: 1, y: 0, duration: 0.9, ease: nxEase.soft, stagger: 0.16, delay: 0.2, clearProps: 'transform' });
    }, 'top 82%');
    el.querySelectorAll<HTMLElement>('[data-count]').forEach((n) => {
      const to = Number(n.dataset.to); const obj = { v: 0 };
      n.textContent = (n.dataset.prefix || '') + '0';
      whenIn(n, () => gsap.to(obj, { v: to, duration: 1.8, ease: 'power2.out', onUpdate: () => { n.textContent = (n.dataset.prefix || '') + Math.round(obj.v).toLocaleString('en-US'); } }), 'top 90%');
    });
  });
  return (
    <section ref={ref} className={`nx nx-light ${nxFonts} ${s.story}`} aria-labelledby="st-title">
      <div className="nx-wrap">
        <div className={s.storyGrid} data-head>
          <div className={s.storyHead}>
            <Orn className={s.orn} end={false} lines="end"><span className={s.kicker} lang="en">OUR STORY</span></Orn>
            <ZTitle id="st-title" lines={['שלושה דורות.', 'משפחה אחת.']} className={s.h2} />
          </div>
          <div className={s.storyText}>
            <p className={s.statement} data-fade>{story.founding}</p>
            <p className={s.muted} data-fade>{story.generations}</p>
          </div>
        </div>
        <ol className={s.gens} data-gens>
          <span className={s.tline} aria-hidden="true" data-tline />
          {generations.map((g) => (
            <li key={g.title} className={s.gen} data-gen>
              <span className={s.era}><bdi>{g.era}</bdi></span>
              <h3 className={s.genT}>{g.title}</h3>
              <p className={s.muted}>{g.text}</p>
            </li>
          ))}
        </ol>
        <dl className={s.figs}>
          {keyFigures.map((f) => (
            <div key={f.label} className={s.fig}>
              <dd className={s.figV}><span data-count data-to={f.value} data-prefix={f.prefix}>{f.prefix}{f.value.toLocaleString('en-US')}</span></dd>
              <dt className={s.figL}>{f.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* 3 — wide photograph band: the home-page hero buildings, opening through a mask while the picture travels slower than the page (Lusion) */
export function AboutBand() {
  const ref = useScene<HTMLElement>((el, gsap) => {
    const frame = el.querySelector('[data-frame]'); const img = el.querySelector('[data-frame] img');
    gsap.fromTo(frame, { clipPath: 'inset(14% 10% 14% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 20%', scrub: true } });
    gsap.fromTo(img, { yPercent: -9, scale: 1.14 }, { yPercent: 9, scale: 1.14, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    revealText(el.querySelectorAll('[data-fade]'), el, { start: 'top 55%' });
  });
  return (
    <section ref={ref} className={`nx ${nxFonts} ${s.band}`} aria-label="בוני בניין — חושבים אנשים">
      <div className={s.bandFrame} data-frame>
        <Image src="/images/brand/hero-hashmonaim-1280.jpg" alt="בניין מגורים של בוני בניין ברחוב החשמונאים, בשעת דמדומים" fill sizes="100vw" quality={78} className={s.bandImg} />
        <div className={s.bandShade} />
        <p className={s.bandText} data-fade><strong>חושבים אנשים.</strong> שלושה דורות של יזמות ובנייה — מתכנון הפרויקט ועד מסירת המפתח.</p>
      </div>
    </section>
  );
}

/* 4 — why Bonei + credentials */
export function AboutWhy() {
  const ref = useScene<HTMLElement>((el, gsap) => {
    revealOrn(el, 'top 80%');
    revealTitle(el, { trigger: el.querySelector('[data-head]')!, start: 'top 82%' });
    revealText(el.querySelectorAll('[data-fade]'), el, { start: 'top 78%' });
    const rows = el.querySelectorAll('[data-cred]');
    gsap.set(rows, { opacity: 0, y: 18 });
    whenIn(el.querySelector('[data-creds]')!, () => gsap.to(rows, { opacity: 1, y: 0, duration: 0.8, ease: nxEase.soft, stagger: 0.1, clearProps: 'transform' }), 'top 84%');
  });
  return (
    <section ref={ref} className={`nx ${nxFonts} ${s.why}`} aria-labelledby="why-title">
      <Glow variant="c" />
      <div className={`nx-wrap ${s.whyGrid}`}>
        <div data-head>
          <Orn className={s.orn} end={false} lines="end"><span className={s.kicker} lang="en">WHY BONEI BINYAN</span></Orn>
          <ZTitle id="why-title" lines={['בית הוא יותר', 'מארבעה קירות.']} className={s.h2} />
          <p className={`${s.statement} ${s.whyLead}`} data-fade>החברה פועלת מתוך חזון ליצור מרחבי מגורים מעוררי השראה שמטפחים קהילות, ומלווה כל לקוח לאורך כל הדרך — משלב התכנון ועד מסירת המפתח — ביחס אישי ומקצועי.</p>
        </div>
        <div>
          <p className={s.credH} data-fade>הסמכות והכרה</p>
          <ul className={s.creds} data-creds>{credentials.map((c, i) => <li key={c} data-cred><span className={s.credN} aria-hidden="true"><bdi>{String(i + 1).padStart(2, '0')}</bdi></span>{c}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

/* 5 — departments grid */
export function AboutDepartments() {
  const ref = useScene<HTMLElement>((el, gsap) => {
    revealOrn(el, 'top 80%');
    revealTitle(el, { trigger: el.querySelector('[data-head]')!, start: 'top 82%' });
    revealText(el.querySelectorAll('[data-fade]'), el, { start: 'top 78%' });
    const cells = Array.from(el.querySelectorAll<HTMLElement>('[data-dep]'));
    gsap.set(cells, { opacity: 0, y: 26 });
    whenIn(el.querySelector('[data-deps]')!, () => gsap.to(cells, { opacity: 1, y: 0, duration: 0.85, ease: nxEase.soft, stagger: { each: 0.06, from: 'start' }, clearProps: 'transform' }), 'top 84%');
  });
  return (
    <section ref={ref} className={`nx nx-light ${nxFonts} ${s.deps}`} aria-labelledby="dep-title">
      <div className="nx-wrap">
        <div className={s.depHead} data-head>
          <div>
            <Orn className={s.orn} end={false} lines="end"><span className={s.kicker} lang="en">DEPARTMENTS</span></Orn>
            <ZTitle id="dep-title" lines={['מתכנון ועד מפתח.', 'כל השלבים בבית.']} className={s.h2} />
          </div>
          <p className={s.muted} data-fade>משלב התכנון ועד מסירת המפתח, מחלקות החברה פועלות יחד כדי לייצר לדיירים ולרוכשי הדירות שקט נפשי וביטחון לאורך כל הדרך.</p>
        </div>
        <ul className={s.depList} data-deps>
          {departments.map((d, i) => (
            <li key={d.name} className={s.dep} data-dep>
              <span className={s.depN}><bdi>{String(i + 1).padStart(2, '0')}</bdi></span>
              <h3 className={s.depT}>{d.name}</h3>
              <p className={s.muted}>{d.text}</p>
            </li>
          ))}
        </ul>
        <div className={s.cta}><Link href="/projects" className="nx-btn nx-btn--compact">לפרויקטים שלנו <Arrow className="" /></Link></div>
      </div>
    </section>
  );
}
