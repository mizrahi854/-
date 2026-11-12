'use client';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import ProjectTile from '../nx/ProjectTile';
import Orn from '../nx/Orn';
import Glow from '../nx/Glow';
import { Arrow } from '../Icons';
import { getProject, projects, type Project } from '@/lib/projects';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';
import { revealOrn, revealText, revealTiles } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './MarketingProjects.module.css';

/**
 * 03 · Projects in marketing — first section after the frozen hero.
 * It keeps the hand-over contract of the cloud sequence: id="intro",
 * slides under the sticky hero (negative margin) and its two title lines
 * carry [data-intro-line], which the hero timeline resolves as the clouds clear.
 * Layout follows the supplied OUR PROJECTS grid: row 1 = title + wide + medium,
 * row 2 = three cells of different widths, all images one height per row.
 */
const ROW1 = [
  { id: 'gardenia', pos: '50% 62%', sizes: '(max-width: 767px) 100vw, 40vw' },
  { id: 'beilinson-7', pos: '50% 34%', sizes: '(max-width: 767px) 100vw, 25vw' },
];
const ROW2 = [
  { id: 'mivtza-kadesh', pos: '50% 30%', sizes: '(max-width: 767px) 100vw, 28vw' },
  { id: 'hamaalot-7', pos: '50% 38%', sizes: '(max-width: 767px) 100vw, 25vw' },
  { id: 'beilinson-6', pos: '50% 32%', sizes: '(max-width: 767px) 100vw, 33vw' },
];
const pick = (xs: typeof ROW1) => xs.map((x) => ({ ...x, p: getProject(x.id) as Project })).filter((x) => x.p && x.p.status === 'marketing' && x.p.images.length);

export default function MarketingProjects() {
  const root = useRef<HTMLElement>(null);
  const r1 = pick(ROW1), r2 = pick(ROW2);
  const count = projects.filter((p) => p.status === 'marketing').length;

  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      revealOrn(el, 'top 30%');
      revealText(el.querySelectorAll('[data-fade]'), el.querySelector('[data-head]')!, { start: 'top 40%', delay: 0.2 });
      revealTiles(el, { firstStart: 'top 42%' });
    }, el);
    // Mist hand-over: the cloud cover dissolves into a veil of the clouds' own tone,
    // which clears onto the dusk-ink scene as the hero sequence ends. Pure geometry
    // (section top vs. viewport), so it is exact on every scroll, resize, deep link
    // and back-navigation restore — reversible, and independent of tween state.
    const mist = el.querySelector<HTMLElement>('[data-mist]')!;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const vh = window.innerHeight; const top = el.getBoundingClientRect().top;
      const from = vh * 0.42, to = -vh * 0.06;
      const k = Math.min(1, Math.max(0, (top - to) / (from - to)));
      mist.style.opacity = String(k);
      mist.style.visibility = k === 0 ? 'hidden' : 'visible';
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    const late = window.setTimeout(paint, 450); // after scroll restoration settles
    return () => { ctx.revert(); cancelAnimationFrame(raf); clearTimeout(late); window.removeEventListener('scroll', req); window.removeEventListener('resize', req); };
  }, []);

  return (
    <section ref={root} id="intro" className={`nx ${nxFonts} ${s.sec}`} aria-labelledby="mk-title">
      <Glow variant="a" />
      <div className={s.mist} data-mist aria-hidden="true" />
      <div className={`nx-wrap ${s.grid}`}>
        <div className={s.row1}>
          <header className={s.head} data-head>
            <Orn className={s.orn} end={false} lines="start" />
            <h2 id="mk-title" className={s.title}>
              <span className={`ln ${s.t1}`} data-intro-line><span>פרויקטים</span></span>
              <span className={`ln ${s.t2}`} data-intro-line><span>בשיווק</span></span>
            </h2>
            <p className={s.lead} data-fade><bdi>{count}</bdi> פרויקטים בשיווק ברעננה ובכפר סבא — מגורים בתכנון אדריכלי ייחודי, מהיזם והקבלן המבצע עצמו.</p>
          </header>
          {r1.map((x, i) => (
            <div key={x.id} className={`${s.cell} ${i === 0 ? s.wide : s.mid}`}>
              <ProjectTile p={x.p} pos={x.pos} sizes={x.sizes} />
            </div>
          ))}
        </div>
        <div className={s.row2}>
          {r2.map((x) => (
            <div key={x.id} className={s.cell}>
              <ProjectTile p={x.p} pos={x.pos} sizes={x.sizes} />
            </div>
          ))}
        </div>
        <div className={s.foot}>
          <Link href="/projects" className="nx-btn nx-btn--compact">לכל הפרויקטים <Arrow className="" /></Link>
        </div>
      </div>
    </section>
  );
}
