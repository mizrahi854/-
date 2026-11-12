'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import Orn from '../nx/Orn';
import Glow from '../nx/Glow';
import { Arrow } from '../Icons';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';
import { revealOrn } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './OurStory.module.css';

/**
 * OUR STORY — one-to-one rebuild of the section in the supplied Emerald recording:
 * a full-bleed photograph, and over its right side a tinted panel with chamfered corners holding
 * the short title (rule + OUR STORY), three paragraphs with bold phrases and a pale button with a thin arrow.
 * Scroll-bound as recorded: the section travels up the screen while the title is written and the text arrives.
 * Content is Bonei's (bonei.co.il / about), colours are Bonei's indigo, photograph is C46 & C48 in Hadera.
 */
export default function OurStory() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      // Everything is bound to scroll position (as in the recording: the section simply travels up the screen while its
      // title is written and its text arrives) — so it plays the same going down, going up, and when entering mid-way.
      // Read from the recording frame by frame: photo and panel are one object travelling up with the page (no relative drift);
      // the panel text arrives faintly while the panel is still entering, "OUR" then "STORY" are written, the body sharpens,
      // the button comes last. Bound to the photo's position, so it plays identically going down, going up and on a deep link.
      const stage = el.querySelector('[data-stage]');
      const letters = el.querySelectorAll('[data-ch]'); const bits = el.querySelectorAll('[data-bit]');
      revealOrn(el, 'top 75%');
      // The photograph is taller than its window and travels DOWN inside it while the page scrolls up, so it seems to come
      // down with you (the picture is lowered as you scroll) instead of just sliding away. Panel stays fixed to the window.
      gsap.fromTo(el.querySelector('[data-par]'), { yPercent: -8.3 }, { yPercent: 8.3, ease: 'none', force3D: true, scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.set(letters, { opacity: 0 });
      gsap.set(bits, { opacity: 0.12 });
      gsap.to(letters, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: stage, start: 'top 82%', end: 'top 30%', scrub: true } });
      gsap.to(bits, { opacity: 1, stagger: 0.18, ease: 'none', scrollTrigger: { trigger: stage, start: 'top 80%', end: 'top 8%', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="our-story" className={`nx ${nxFonts} ${s.sec}`} aria-labelledby="os-title">
      <Glow variant="d" />
      <div className={s.stage} data-stage>
        <div className={s.photo} data-photo>
          <div className={s.imgWrap} data-par>
            <Image src="/images/about/c46-c48-twin.jpg" alt="שני בנייני C46 ו־C48 בחדרה, בשעת ערב עם חלונות מוארים" fill sizes="100vw" quality={85} className={s.img} />
          </div>
        </div>
        <div className={s.panel} data-panel>
          <span className={s.shape} aria-hidden="true" />
          <div className={s.body}>
            <Orn className={s.orn} end={false} lines="start"><h2 id="os-title" className={s.title} lang="en" aria-label="OUR STORY">{Array.from('OUR STORY').map((c, k) => <span key={k} data-ch aria-hidden="true">{c === ' ' ? '\u00a0' : c}</span>)}</h2></Orn>
            <p data-bit>סיפורה של קבוצת בוני בניין מתחיל עם <strong>אליעזר מידניק ושותפו מרדכי</strong>, שייסדו את החברה בשנת <strong><bdi>1972</bdi></strong> מתוך שאיפה להחדיר גישה חדשנית אל נוף הבנייה הישראלי.</p>
            <p data-bit>כעבור למעלה מ־50 שנה, בוני בניין בנתה <strong>למעלה מ־<bdi>500</bdi> פרויקטים ולמעלה מ־<bdi>500,000</bdi> מ״ר</strong> ברחבי הארץ, בדגש על אזורי הביקוש בשרון.</p>
            <p data-bit>כל השלבים — <strong>מחתימת החוזים ותכנון הפרויקט, דרך הבנייה ועד תקופת הבדק</strong> — מתבצעים בתוך החברה.</p>
            <Link href="/about" className={`nx-btn nx-btn--compact ${s.btn}`} data-bit>קראו עוד עלינו <Arrow className="" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
