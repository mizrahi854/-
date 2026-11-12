'use client';
import Image from 'next/image';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { projects, type Project } from '@/lib/projects';
import ProjectTile from './nx/ProjectTile';
import Orn from './nx/Orn';
import { Arrow } from './Icons';
import { keyFigures } from '@/data/company';
import { ensureGsap, isSmall, prefersReducedMotion } from '@/lib/motion';
import { nxEase, revealOrn, revealText, revealTiles } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './ProjectsArchive.module.css';

/**
 * /projects — after emeraldltd.co.il/our-projects: centred title between two
 * columns of photographs, a statement row with a rule and an action, then a
 * three-column grid with the strip captions. Filters are Bonei's real
 * statuses/kinds and live in the URL (?status= / ?type= / ?city=), so links,
 * reloads and back navigation restore the same view.
 */
type F = 'all' | 'marketing' | 'planning' | 'occupied' | 'commercial';
const FILTERS: { v: F; l: string }[] = [
  { v: 'all', l: 'כל הפרויקטים' },
  { v: 'marketing', l: 'בשיווק' },
  { v: 'planning', l: 'בתכנון' },
  { v: 'occupied', l: 'מאוכלסים' },
  { v: 'commercial', l: 'מבני ציבור ומסחר' },
];
const SIDE_R = ['har-sinai-8', 'c-collection', 'hamaalot-6'];
const SIDE_L = ['rehovot-library', 'maccabi-51', 'bar-ilan-42'];

export default function ProjectsArchive() {
  const sp = useSearchParams(); const router = useRouter(); const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const f: F = sp.get('type') === 'commercial' ? 'commercial'
    : (['marketing', 'planning', 'occupied'] as F[]).includes(sp.get('status') as F) ? (sp.get('status') as F) : 'all';
  const city = sp.get('city') ?? '';

  const setFilter = (v: F) => {
    const q = new URLSearchParams();
    if (v === 'commercial') q.set('type', 'commercial'); else if (v !== 'all') q.set('status', v);
    router.replace(`${pathname}${q.toString() ? '?' + q : ''}`, { scroll: false });
  };
  const setCity = (c: string) => {
    const q = new URLSearchParams(sp.toString()); if (c) q.set('city', c); else q.delete('city');
    router.replace(`${pathname}${q.toString() ? '?' + q : ''}`, { scroll: false });
  };

  const base = useMemo(() => projects.filter((p) => f === 'all' ? true : f === 'commercial' ? p.kind === 'commercial' : p.kind === 'residential' && p.status === f), [f]);
  const cities = useMemo(() => [...new Set(base.map((p) => p.city).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'he')), [base]);
  const list = base.filter((p) => !city || p.city === city)
    .sort((a, b) => (b.images.length ? 1 : 0) - (a.images.length ? 1 : 0) || rank(a) - rank(b));
  const side = (ids: string[]) => ids.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => !!p && !!p.images.length);
  const total = keyFigures[0];

  // hero + statement: once
  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo('[data-hl] > span', { yPercent: 108 }, { yPercent: 0, duration: 1.2, ease: nxEase.out, stagger: 0.12 })
        .fromTo('[data-hp]', { opacity: 0, y: 16, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: nxEase.soft, stagger: 0.1, clearProps: 'filter' }, 0.5)
        .fromTo('[data-col] [data-ci]', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: nxEase.mask, stagger: 0.12, clearProps: 'clipPath' }, 0.15);
      if (!isSmall()) {
        // the two photo columns drift against each other while the hero leaves (Lusion: one scene, two speeds)
        gsap.to('[data-col="r"]', { yPercent: -16, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('[data-col="l"]', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });
      }
      revealOrn(el.querySelector('[data-bar]')!, 'top 92%');
      revealText(el.querySelectorAll('[data-bar] [data-fade]'), el.querySelector('[data-bar]')!, { start: 'top 92%' });
    }, el);
    return () => ctx.revert();
  }, []);

  // grid: re-run the row reveal whenever the filtered set changes
  const key = list.map((p) => p.id).join(',');
  useLayoutEffect(() => {
    const el = grid.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => revealTiles(el), el);
    return () => ctx.revert();
  }, [key]);

  return (
    <div ref={root} className={`nx nx-atmos ${nxFonts}`}>
      <section className={s.hero} data-hero aria-labelledby="ar-title">
        <div className={`${s.col} ${s.colR}`} data-col="r" aria-hidden="true">
          {side(SIDE_R).map((p, i) => (
            <div key={p.id} className={s.ci} data-ci><Image src={p.images[i === 1 ? 1 : 0].src} alt="" fill sizes="22vw" quality={70} priority={i < 2} className={s.cimg} /></div>
          ))}
        </div>
        <div className={`${s.col} ${s.colL}`} data-col="l" aria-hidden="true">
          {side(SIDE_L).map((p, i) => (
            <div key={p.id} className={s.ci} data-ci><Image src={p.images[i === 0 ? 2 : 0].src} alt="" fill sizes="22vw" quality={70} priority={i < 2} className={s.cimg} /></div>
          ))}
        </div>
        <div className={s.center}>
          <h1 id="ar-title" className={s.title}>
            <span className={s.l1}><span className="nx-ln" data-hl><span>פרויקטים</span></span></span>
            <span className={`nx-ln ${s.l2}`} data-hl><span>מאז <bdi>1972</bdi></span></span>
          </h1>
          <p className={s.p} data-hp>בוני בניין יזמה ובנתה <strong>למעלה מ־{total.value} פרויקטים</strong> — בתי מגורים והתחדשות עירונית בשרון, ומבני ציבור, חינוך ותרבות ברחבי הארץ.</p>
          <p className={s.p} data-hp>כל פרויקט <strong>מתוכנן ומבוצע בתוך החברה</strong>, מהתכנון ועד מסירת המפתח ותקופת הבדק.</p>
        </div>
      </section>

      <section className={s.list} aria-label="רשימת פרויקטים">
        <div className="nx-wrap">
          <div className={s.bar} data-bar>
            <p className={s.statement} data-fade>חמישים שנה של בנייה.</p>
            <Orn className={s.rule} start={false} end={false} lines="start" />
            <a href="/#contact" className="nx-btn" data-fade>לפרויקט הבא שלכם <Arrow className="" /></a>
          </div>

          <div className={s.filters} role="search" aria-label="סינון פרויקטים">
            <div className={s.tabs} role="group" aria-label="סוג וסטטוס">
              {FILTERS.map((o) => (
                <button key={o.v} type="button" className={s.tab} aria-pressed={f === o.v} onClick={() => setFilter(o.v)}>{o.l}</button>
              ))}
            </div>
            <label className={s.sel}>
              <span>עיר</span>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">כל הערים</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <p className={s.count} aria-live="polite"><bdi>{list.length}</bdi> פרויקטים</p>
          </div>

          {list.length ? (
            <ul ref={grid} className={s.grid} key={key}>
              {list.map((p, i) => (
                <li key={p.id} className={s.item}>
                  <ProjectTile p={p} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 32vw" priority={i < 3} showStatus pos="50% 35%" />
                </li>
              ))}
            </ul>
          ) : (
            <div className={s.empty}>
              <p className={s.emptyH}>אין פרויקטים שתואמים לסינון הזה.</p>
              <button type="button" className="nx-btn" onClick={() => router.replace(pathname, { scroll: false })}>הצגת כל הפרויקטים <Arrow className="" /></button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const order = { marketing: 0, planning: 1, occupied: 2, delivered: 3 } as const;
const rank = (p: Project) => order[p.status] ?? 9;
