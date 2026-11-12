'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ContactForm from '../ContactForm';
import Orn from './Orn';
import Glow from './Glow';
import { company } from '@/data/company';
import { projects } from '@/lib/projects';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';
import { nxEase, whenIn } from '@/lib/nxMotion';
import { nxFonts } from '@/lib/fonts';
import s from './ContactFrame.module.css';

/**
 * Contact — composition from the recording (~2–3s): a double frame with cut
 * corners, a centred title, then one low wide row of fields.
 * The frame is real SVG measured to the box, so its corners stay 45° at any
 * size and it can be drawn in on entry; the form arrives in its own beat.
 */
function octagon(w: number, h: number, inset: number, c: number) {
  const a = inset, b = inset, W = w - inset, H = h - inset, k = Math.max(4, c - inset * 0.4);
  // start at top centre so the line draws outward symmetrically-ish
  return `M ${w / 2} ${b} H ${W - k} L ${W} ${b + k} V ${H - k} L ${W - k} ${H} H ${a + k} L ${a} ${H - k} V ${b + k} L ${a + k} ${b} Z`;
}

export default function ContactFrame({ id = 'contact', title = 'נשמח לשמוע מכם', sub = 'השאירו פרטים ונציג בוני בניין יחזור אליכם בהקדם.', defaultInquiry = 'purchase', kicker = "LET'S TALK" }: { id?: string; title?: string; sub?: string; defaultInquiry?: string; kicker?: string }) {
  const root = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0, c: 56 });
  const marketing = projects.filter((p) => p.status === 'marketing').map((p) => ({ id: p.id, title: p.title }));

  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width, h = e.contentRect.height;
      setSize({ w, h, c: Math.round(Math.min(64, Math.max(26, w * 0.042))) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = root.current; if (!el || prefersReducedMotion() || !size.w) return;
    if (el.dataset.played) return; // draw once; later resizes only update geometry
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const paths = el.querySelectorAll<SVGPathElement>('[data-frame] path');
      const head = el.querySelectorAll('[data-h]');
      const fields = el.querySelectorAll('[data-fields] > *');
      paths.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
      gsap.set(head, { opacity: 0, y: 20, filter: 'blur(6px)' });
      gsap.set(fields, { opacity: 0, y: 14 });
      whenIn(el, () => {
        el.dataset.played = '1';
        gsap.timeline()
          .to(paths, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut', stagger: 0.22, clearProps: 'strokeDasharray,strokeDashoffset' }, 0)
          .to(head, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: nxEase.soft, stagger: 0.1, clearProps: 'filter,transform' }, 0.45)
          .to(fields, { opacity: 1, y: 0, duration: 0.7, ease: nxEase.soft, stagger: 0.06, clearProps: 'transform' }, 1.15);
      }, 'top 78%');
    }, el);
    return () => { if (!el.dataset.played) ctx.revert(); };
  }, [size.w]);

  const { w, h, c } = size;
  return (
    <section ref={root} id={id} className={`nx ${nxFonts} ${s.sec}`} aria-labelledby={`${id}-title`}>
      <Glow variant="d" />
      <div className={`nx-wrap ${s.wrap}`}>
        <div ref={box} className={s.box}>
          {w > 0 && (
            <svg className={s.frame} data-frame width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
              <path d={octagon(w, h, 0.75, c)} />
            </svg>
          )}
          <div className={s.inner}>
            <div className={s.head}>
              <Orn className={s.orn}><span className={s.kicker} lang="en" data-h>{kicker}</span></Orn>
              <h2 id={`${id}-title`} className={s.title} data-h>{title}</h2>
              <p className={s.sub} data-h>{sub}</p>
            </div>
            <ContactForm layout="row" defaultInquiry={defaultInquiry} projects={marketing} />
            <p className={s.direct} data-h>
              או ישירות: <a href={company.phoneShortHref}><bdi dir="ltr">{company.phoneShort}</bdi></a>
              <span aria-hidden="true">·</span><a href={company.phoneOfficeHref}><bdi dir="ltr">{company.phoneOffice}</bdi></a>
              <span aria-hidden="true">·</span><a href={`mailto:${company.email}`}>{company.email}</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
