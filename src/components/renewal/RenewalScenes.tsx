'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import Orn from '../nx/Orn';
import NxHero from '../nx/NxHero';
import ProjectTile from '../nx/ProjectTile';
import { Arrow } from '../Icons';
import { departments, keyFigures } from '@/data/company';
import { projects, type Project } from '@/lib/projects';
import { ensureGsap, isSmall, prefersReducedMotion } from '@/lib/motion';
import { nxEase, revealOrn, revealText, revealTiles, whenIn } from '@/lib/nxMotion';
import s from './Renewal.module.css';

/* All copy below is restated from bonei.co.il (about / urban-renewal / FAQ statements). */

/** Hook: run a scene builder inside a reverted gsap context. */
function useScene(build: (el: HTMLElement, gsap: typeof import('gsap').gsap) => void) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => build(el, gsap), el);
    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

/* 1 — hero: the shared page hero */
export function RenewalHero() {
  return (
    <NxHero id="ur-title" kicker="URBAN RENEWAL" lines={['התחדשות עירונית']} image="/images/p/gardenia/00.jpg" alt="הדמיית פרויקט גרדניה ברעננה — הריסה ובנייה מחדש של בניין ותיק"
      lead={<>בוני בניין מובילה פרויקטים של <strong>תמ״א 38 והריסה ובנייה מחדש בשרון</strong> — כיזם וכקבלן המבצע, תחת קורת גג אחת, בשקיפות ובעדכון שוטף של בעלי הדירות.</>}
      cta={{ href: '#renewal-contact', label: 'השאירו פרטים לבדיקת הבניין' }} />
  );
}

/* 2 — story: title block right, rule, body left (Emerald "makeover" row) */
export function RenewalStory() {
  const active = keyFigures.find((f) => f.label.includes('התחדשות'));
  const ref = useScene((el) => {
    revealOrn(el, 'top 80%');
    revealText(el.querySelectorAll('[data-fade]'), el, { start: 'top 75%' });
  });
  return (
    <section ref={ref} className={s.story} aria-labelledby="ur-story">
      <div className={`nx-wrap ${s.storyGrid}`}>
        <div className={s.storyHead}>
          <p className={s.latinBig} lang="en" data-fade>BONEI RENEWAL</p>
          <Orn className={s.storyOrn}><h2 id="ur-story" className={s.storyTitle}>מחדשים את השרון</h2></Orn>
          {active && <p className={s.storyFig} data-fade><span className={s.storyNum}><bdi>{active.value}</bdi></span> {active.label}</p>}
        </div>
        <span className={s.vrule} aria-hidden="true" />
        <div className={s.storyBody}>
          <p data-fade>בוני בניין מתמחה בהתחדשות עירונית <strong>באזורי הביקוש בשרון — רעננה, כפר סבא, רמת השרון והרצליה</strong>, בפרויקטים של חיזוק ותוספת, ושל הריסה ובנייה מחדש.</p>
          <p data-fade>החברה היא <strong>גם היזם וגם הקבלן המבצע</strong>: כל השלבים — מחתימת החוזים ותכנון הפרויקט, דרך הבנייה ועד תקופת הבדק — מתבצעים בתוך החברה.</p>
          <p data-fade>לכל פרויקט ניתן <strong>אופי ייחודי ועיצוב אדריכלי משלו</strong>, תוך שמירה על אופי השכונה שסביבו. הצוות פועל בשיתוף פעולה מלא עם הרשויות, ובעדכון שוטף של בעלי הדירות לאורך הדרך.</p>
        </div>
      </div>
    </section>
  );
}

/* 3 — renewal projects (verified photographs/renders only, with their real status) */
const RENEWAL_PICK = ['maccabi-51', 'mivtza-kadesh', 'hamaalot-6', 'borochov-37', 'maccabi-22', 'bar-ilan-42'];
export function RenewalProjects() {
  const list = RENEWAL_PICK.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => !!p && !!p.images.length && !!p.renewal);
  const ref = useScene((el) => { revealOrn(el, 'top 85%'); revealTiles(el); });
  return (
    <section ref={ref} className={s.projects} aria-labelledby="ur-projects">
      <div className="nx-wrap">
        <Orn className={s.projOrn}><h2 id="ur-projects" className={s.projTitle}>פרויקטים בהתחדשות</h2></Orn>
        <ul className={s.projGrid}>
          {list.map((p) => (
            <li key={p.id}><ProjectTile p={p} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 32vw" showStatus detail={p.renewal ?? undefined} pos="50% 32%" /></li>
          ))}
        </ul>
        <div className={s.projFoot}><Link href="/projects" className="nx-btn">לכל הפרויקטים <Arrow className="" /></Link></div>
      </div>
    </section>
  );
}

/* 4 — full support: five chamfered cards, each with its icon badge (Emerald "100% support") */
const SUPPORT = ['מחלקת מכרזים', 'מחלקת תכנון', 'הנדסה וביצוע', 'שינויי דיירים', 'מחלקת בדק'];
const ICONS: Record<string, React.ReactNode> = {
  'מחלקת מכרזים': <><path d="M7 3.5h7l4 4V20.5H7z" /><path d="M14 3.5v4h4M9.5 12h6M9.5 15h6M9.5 18h3.5" /></>,
  'מחלקת תכנון': <><path d="M4 20 20 4M4 20V9M4 20h11" /><path d="M7 17v-2.5M10 17v-1.5M13 17v-2.5" /><circle cx="17" cy="17" r="2.6" /></>,
  'הנדסה וביצוע': <><path d="M6 21V5h1.5L20 7.5M6 5 4 7.5M7.5 5v16M6 9l1.5-1.5M6 13l1.5-1.5M6 17l1.5-1.5" /><path d="M17 7.2V12M15.5 12h3v2.5h-3z" /><path d="M3.5 21h7" /></>,
  'שינויי דיירים': <><path d="M5 6h14M5 12h14M5 18h14" /><circle cx="9" cy="6" r="1.8" /><circle cx="15" cy="12" r="1.8" /><circle cx="8" cy="18" r="1.8" /></>,
  'מחלקת בדק': <><path d="M14.5 6.2a4 4 0 0 0-5.3 5.3L4 16.7 7.3 20l5.2-5.2a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.6-.5-.5-2.6z" /></>,
};
export function RenewalSupport() {
  const items = SUPPORT.map((n) => departments.find((d) => d.name === n)).filter(Boolean) as typeof departments;
  const ref = useScene((el, gsap) => {
    revealOrn(el, 'top 85%');
    revealText(el.querySelectorAll('[data-fade]'), el, { start: 'top 80%' });
    const cards = el.querySelectorAll('[data-card]'); const badges = el.querySelectorAll('[data-badge]');
    gsap.set(cards, { opacity: 0, y: 46 }); gsap.set(badges, { scale: 0 });
    whenIn(el.querySelector('[data-cards]')!, () => {
      gsap.to(cards, { opacity: 1, y: 0, duration: 1.05, ease: nxEase.out, stagger: { each: 0.09, from: 'start' }, clearProps: 'transform' });
      gsap.to(badges, { scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.8)', stagger: 0.09, delay: 0.3 });
    }, 'top 82%');
  });
  return (
    <section ref={ref} className={s.support} aria-labelledby="ur-support">
      <div className="nx-wrap">
        <div className={s.supHead}>
          <h2 id="ur-support" className={s.supTitle}><span className={s.latin} lang="en">FULL SUPPORT</span><span className={s.supHe}>מעטפת מלאה</span></h2>
          <p className={s.supLead} data-fade>הדיירים מלווים לאורך כל הדרך על ידי מחלקות החברה עצמה — בלי קבלני משנה לניהול, ובאחריות אחת.</p>
        </div>
        <ul className={s.cards} data-cards>
          {items.map((d) => (
            <li key={d.name} className={s.card} data-card>
              <span className={s.badge} data-badge aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">{ICONS[d.name]}</svg>
              </span>
              <h3 className={s.cardTitle}>{d.name}</h3>
              <p className={s.cardText}>{d.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* 6 — FAQ */
const FAQ = [
  { q: 'מי מבצע את הבנייה בפועל?', a: 'בוני בניין עצמה. החברה היא גם היזם וגם הקבלן המבצע, וכל השלבים — מחתימת החוזים ותכנון הפרויקט, דרך הבנייה ועד תקופת הבדק — מתבצעים בתוך החברה.' },
  { q: 'באילו אזורים החברה פועלת?', a: 'החברה מתמחה בהתחדשות עירונית באזורי הביקוש בשרון — רעננה, כפר סבא, רמת השרון והרצליה.' },
  { q: 'איך מתעדכנים לאורך התהליך?', a: 'צוות החברה פועל בשיתוף פעולה מלא עם הרשויות המקומיות ותוך עדכון שוטף של בעלי הדירות. בעלי דירות בפרויקטים פעילים יכולים להיעזר גם בפורטל הדיירים.' },
  { q: 'האם אפשר לבצע שינויים בדירה החדשה?', a: 'כן. מחלקת שינויי דיירים מלווה את התאמת הדירה — מבניית קירות והזזת נקודות חשמל, דרך שינוי חדרים, ועד בחירת ריצוף וכלים סניטריים.' },
  { q: 'מה קורה אחרי הכניסה לדירה?', a: 'מחלקת הבדק של החברה מגיעה לטיפול מהיר בכל קריאות הבדק, בדגש על איכות הביצוע ושירותיות.' },
];
export function RenewalFaq() {
  const ref = useScene((el) => { revealOrn(el, 'top 85%'); revealText(el.querySelectorAll('[data-fade]'), el, { start: 'top 80%' }); });
  return (
    <section ref={ref} className={s.faq} aria-labelledby="ur-faq">
      <div className={`nx-wrap ${s.faqGrid}`}>
        <div className={s.faqHead}>
          <Orn className={s.faqOrn} end={false} lines="end"><span className={s.latinSm} lang="en">QUESTIONS</span></Orn>
          <h2 id="ur-faq" className={s.faqTitle} data-fade>שאלות נפוצות</h2>
        </div>
        <div className={s.qs}>
          {FAQ.map((f) => (
            <details key={f.q} className={s.q} data-fade>
              <summary>{f.q}<span aria-hidden="true" className={s.plus} /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 7 — bar leading into the story (Emerald: rule · button · rule) */
export function StoryBar() {
  const ref = useScene((el) => revealOrn(el, 'top 92%'));
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`nx-wrap ${s.storyBar}`}>
      <Orn className={s.sbOrn}><Link href="/about" className="nx-btn">הסיפור של בוני בניין <Arrow className="" /></Link></Orn>
    </div>
  );
}
