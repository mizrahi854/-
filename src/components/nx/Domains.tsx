'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import { Arrow } from '../Icons';
import { ensureGsap, isSmall, prefersReducedMotion } from '@/lib/motion';
import { nxEase, revealText, whenIn } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './Domains.module.css';

/**
 * Activity domains — after the supplied WHAT WE DO frame: a title row, then a
 * full-bleed run of photographs that touch along shared diagonal seams.
 * Only domains with real content + a real destination are shown.
 * Order is visual right→left (RTL).
 */
const DOMAINS = [
  { label: 'מגורים', href: '/projects', img: '/images/p/maccabi-47/00.jpg', pos: '50% 30%', alt: 'הדמיית פרויקט המגורים מכבי 47 ברעננה' },
  { label: 'התחדשות עירונית', href: '/urban-renewal', img: '/images/p/maccabi-51/00.jpg', pos: '50% 26%', alt: 'הדמיית פרויקט ההתחדשות העירונית מכבי 51 ברעננה' },
  { label: 'מבני ציבור ומסחר', href: '/projects?type=commercial', img: '/images/p/kugel-holon/00.jpg', pos: '50% 50%', alt: 'בית הספר והאודיטוריום קוגל בחולון, שבוצע על ידי בוני בניין' },
];

const SLANT = 6.2; // % of strip width between a seam's top and bottom (≈ the reference angle)

function geometry(n: number) {
  const w = 100 / n;
  const top = (j: number) => (j + 1) * w + SLANT / 2;
  const bot = (j: number) => (j + 1) * w - SLANT / 2;
  // k counts physical panels from the LEFT edge
  return Array.from({ length: n }, (_, k) => {
    const tl = k === 0 ? 0 : top(k - 1), bl = k === 0 ? 0 : bot(k - 1);
    const tr = k === n - 1 ? 100 : top(k), br = k === n - 1 ? 100 : bot(k);
    return { tl, tr, br, bl, boxL: bl, boxW: tr - bl, cx: (tl + tr + br + bl) / 4 };
  });
}
const poly = (g: { tl: number; tr: number; br: number; bl: number }) => `polygon(${g.tl}% 0%, ${g.tr}% 0%, ${g.br}% 100%, ${g.bl}% 100%)`;

export default function Domains({ title = 'תחומי הפעילות', id = 'domains' }: { title?: string; id?: string }) {
  const root = useRef<HTMLElement>(null);
  const geo = geometry(DOMAINS.length);
  // physical left→right = visual reverse of the RTL list
  const panels = [...DOMAINS].reverse().map((d, k) => ({ ...d, g: geo[k] }));

  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      revealText(el.querySelectorAll('[data-fade]'), el, { start: 'top 75%' });
      const strip = el.querySelector('[data-strip]')!;
      const ps = Array.from(el.querySelectorAll<HTMLElement>('[data-panel]')).reverse(); // right-most first
      const small = isSmall();
      ps.forEach((p) => {
        const k = Number(p.dataset.k); const g = geo[k];
        const img = p.querySelector('img'); const lab = p.querySelector('[data-label]');
        if (small) {
          gsap.set(p, { '--rv': 0 });
        } else {
          // collapse onto the panel's right seam, then open leftward through the diagonal
          gsap.set(p, { clipPath: poly({ tl: g.tr, tr: g.tr, br: g.br, bl: g.br }) });
        }
        gsap.set(img, { xPercent: small ? 0 : -8, scale: 1.12 });
        gsap.set(lab, { opacity: 0, y: 16, filter: 'blur(6px)' });
        // gentle parallax of the photograph inside its own window
        gsap.fromTo(p.querySelector('[data-par]'), { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      whenIn(strip, () => {
        const tl = gsap.timeline();
        ps.forEach((p, i) => {
          const g = geo[Number(p.dataset.k)];
          const img = p.querySelector('img'); const lab = p.querySelector('[data-label]');
          if (small) tl.to(p, { '--rv': 1, duration: 1, ease: nxEase.mask }, i * 0.14);
          else tl.to(p, { clipPath: poly(g), duration: 1.25, ease: nxEase.mask, clearProps: 'clipPath' }, i * 0.16);
          tl.to(img, { xPercent: 0, scale: 1, duration: 1.7, ease: nxEase.out, clearProps: 'transform' }, i * 0.16)
            .to(lab, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: nxEase.soft, clearProps: 'filter,transform' }, i * 0.16 + 0.7);
        });
      }, 'top 78%');
    }, el);
    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section ref={root} id={id} className={`nx nx-light ${nxFonts} ${s.sec}`} aria-labelledby={`${id}-title`}>
      <div className={`nx-wrap ${s.head}`}>
        <h2 id={`${id}-title`} className={s.title}>{title}</h2>
        <p className={s.lead} data-fade>יזמות, תכנון וביצוע תחת קורת גג אחת — מבתי מגורים ופרויקטי התחדשות בשרון ועד מבני ציבור ברחבי הארץ.</p>
      </div>
      <ul className={s.strip} data-strip style={{ ['--n' as string]: DOMAINS.length }}>
        {panels.map((d, k) => (
          <li key={d.label} className={s.panel} data-panel data-k={k}
            style={{ ['--clip' as string]: poly(d.g), ['--l' as string]: `${d.g.boxL}%`, ['--w' as string]: `${d.g.boxW}%`, ['--cx' as string]: `${d.g.cx}%`, ['--ord' as string]: DOMAINS.length - 1 - k }}>
            <Link href={d.href} className={s.link}>
              <span className={s.box} aria-hidden="true">
                <span className={s.par} data-par>
                  <Image src={d.img} alt="" fill sizes="(max-width: 767px) 100vw, 40vw" quality={78} className={s.img} style={{ objectPosition: d.pos }} />
                </span>
              </span>
              <span className={s.label} data-label>
                <span className={s.labText}>{d.label}</span>
                <span className={s.enter}>כניסה <Arrow className={s.arr} /></span>
              </span>
              <span className="sr-only">{d.alt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
