'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Orn from '../nx/Orn';
import Glow from '../nx/Glow';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';
import { nxEase, revealOrn, whenIn } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './QualityMark.module.css';

/**
 * Bonei quality mark — composition from the start of the supplied recording:
 * a dark, airy field with thin vertical rules, a small centred heading between
 * diamonds, a large wordmark and one value with a short line beneath it.
 * Values are Bonei facts (bonei.co.il: about / credentials), not Emerald copy.
 * Value change is our adaptation: the recording shows a single value, so the
 * swap (short rise + blur-to-focus, masked) is documented as ours.
 */
const VALUES = [
  { en: 'THREE GENERATIONS', he: 'שלושה דורות', text: 'משפחה אחת מאז 1972 — דור המייסדים, הדור השני, והדור השלישי שמוביל את החברה היום.' },
  { en: 'DEVELOP & BUILD', he: 'יזמות וביצוע', text: 'החברה היא היזם והקבלן המבצע: מתכנון הפרויקט, דרך הבנייה ועד תקופת הבדק — הכול בתוך הבית.' },
  { en: 'BY YOUR SIDE', he: 'ליווי דיירים', text: 'מחלקת שינויי דיירים מלווה את התאמת הדירה, וסיירת הבדק מגיעה לכל קריאה גם אחרי המסירה.' },
  { en: 'CERTIFIED', he: 'איכות מוכחת', text: 'סיווג קבלני ג׳5 בלתי מוגבל, תו תקן ISO 9001 ושלושה כוכבי בטיחות מטעם בוני הארץ.' },
];
const WORD = 'BONEI BINYAN';
const HOLD = 3600;

export default function QualityMark() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const prev = useRef(0);
  const live = useRef({ inView: false, paused: false });

  // entrance: rules, ornament, wordmark letters
  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      revealOrn(el, 'top 65%');
      const letters = el.querySelectorAll('[data-ch]');
      const rules = el.querySelectorAll('[data-rule]');
      gsap.set(letters, { opacity: 0, yPercent: 40, filter: 'blur(10px)' });
      gsap.set(rules, { scaleY: 0 });
      gsap.set('[data-stage]', { opacity: 0, y: 20 });
      whenIn(el, () => {
        gsap.to(rules, { scaleY: 1, duration: 1.6, ease: nxEase.io, stagger: { each: 0.05, from: 'center' } });
        gsap.to(letters, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.1, ease: nxEase.out, stagger: { each: 0.045, from: 'center' }, delay: 0.25, clearProps: 'filter' });
        gsap.to('[data-sheen]', { backgroundPosition: '0% 0', duration: 2.4, ease: 'power2.inOut', delay: 0.7 });
        gsap.to('[data-stage]', { opacity: 1, y: 0, duration: 1, ease: nxEase.soft, delay: 0.9 });
      }, 'top 62%');
    }, el);
    return () => ctx.revert();
  }, []);

  // cycle only while visible, pause on hover / focus
  useEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => { live.current.inView = e.isIntersecting; }, { threshold: 0.35 });
    io.observe(el);
    const t = window.setInterval(() => { if (live.current.inView && !live.current.paused && !document.hidden) setI((v) => (v + 1) % VALUES.length); }, HOLD);
    return () => { io.disconnect(); window.clearInterval(t); };
  }, []);

  // value swap
  useLayoutEffect(() => {
    const st = stage.current; if (!st || prev.current === i) return;
    const { gsap } = ensureGsap();
    const out = st.querySelector(`[data-v="${prev.current}"]`); const inn = st.querySelector(`[data-v="${i}"]`);
    prev.current = i;
    if (!out || !inn) return;
    gsap.killTweensOf([out, inn, ...out.children, ...inn.children]);
    gsap.timeline()
      .to(out.children, { yPercent: -60, opacity: 0, filter: 'blur(8px)', duration: 0.45, ease: 'power2.in', stagger: 0.05 })
      .set(out, { visibility: 'hidden' })
      .set(inn, { visibility: 'visible' })
      .fromTo(inn.children, { yPercent: 70, opacity: 0, filter: 'blur(8px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: nxEase.out, stagger: 0.08, clearProps: 'filter' });
  }, [i]);

  return (
    <section ref={root} className={`nx ${nxFonts} ${s.sec}`} aria-labelledby="qm-title"
      onPointerEnter={() => (live.current.paused = true)} onPointerLeave={() => (live.current.paused = false)}
      onFocus={() => (live.current.paused = true)} onBlur={() => (live.current.paused = false)}>
      <Glow variant="b" />
      <div className={s.rules} aria-hidden="true">{Array.from({ length: 13 }, (_, k) => <span key={k} data-rule />)}</div>
      <div className={s.inner}>
        <Orn className={s.orn}><h2 id="qm-title" className={s.kicker}>תו האיכות של</h2></Orn>
        <p className={s.word} lang="en" aria-label="Bonei Binyan">
          <span className={s.sheen} data-sheen aria-hidden="true">
            {WORD.split('').map((c, k) => <span key={k} data-ch className={c === ' ' ? s.sp : undefined}>{c}</span>)}
          </span>
        </p>
        <div className={s.stage} ref={stage} data-stage aria-hidden="true">
          {VALUES.map((v, k) => (
            <div key={v.en} className={s.value} data-v={k} style={{ visibility: k === 0 ? 'visible' : 'hidden' }}>
              <p className={s.pair}><span className={s.he}>{v.he}</span><span className={s.dot} /><span className={s.en} lang="en">{v.en}</span></p>
              <p className={s.text}>{v.text}</p>
            </div>
          ))}
        </div>
        <ul className={s.static}>
          {VALUES.map((v) => <li key={v.en}><strong>{v.he}</strong> — {v.text}</li>)}
        </ul>
        <p className={s.count} aria-hidden="true"><bdi>{String(i + 1).padStart(2, '0')}</bdi><span /><bdi>{String(VALUES.length).padStart(2, '0')}</bdi></p>
      </div>
    </section>
  );
}
