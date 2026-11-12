'use client';
import { useLayoutEffect, useRef } from 'react';
import { ensureGsap, M, prefersReducedMotion } from '@/lib/motion';

/**
 * Shared reveal system. Children opt in with data attributes:
 *  data-r="lines" — wraps .ln > span lines, revealed upward in sequence
 *  data-r="fade"  — short rise + fade
 *  data-r="mask"  — image opens from a narrow architectural slit, inner media settles from scale
 *  data-r="count" — numbers count once to data-to
 * data-delay="0.2" offsets an element.
 */
export default function RevealScope({ children, className, as: Tag = 'div', ...rest }: { children: React.ReactNode; className?: string; as?: React.ElementType } & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const { gsap } = ensureGsap();
    if (prefersReducedMotion()) {
      el.querySelectorAll<HTMLElement>('[data-r="count"]').forEach((n) => (n.textContent = format(n)));
      return;
    }
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-r]').forEach((n) => {
        const kind = n.dataset.r; const delay = Number(n.dataset.delay || 0);
        const st = { trigger: n, start: n.dataset.start || 'top 86%', once: true };
        if (kind === 'lines') {
          gsap.to(n.querySelectorAll('.ln > span'), { y: 0, duration: M.dur.enter, ease: M.ease.out, stagger: 0.09, delay, scrollTrigger: st });
        } else if (kind === 'fade') {
          gsap.fromTo(n, { opacity: 0, y: M.distance * 0.6 }, { opacity: 1, y: 0, duration: 0.9, ease: M.ease.soft, delay, scrollTrigger: st });
        } else if (kind === 'mask') {
          const media = n.querySelector('img, .mask-media');
          gsap.fromTo(n, { clipPath: 'inset(0% 42% 0% 42%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', delay, scrollTrigger: st });
          if (media) gsap.fromTo(media, { scale: M.scale.from }, { scale: 1, duration: 1.8, ease: M.ease.out, delay, scrollTrigger: st });
        } else if (kind === 'count') {
          const to = Number(n.dataset.to || 0); const obj = { v: 0 };
          n.textContent = format(n, 0);
          gsap.to(obj, { v: to, duration: 1.6, ease: 'power2.out', delay, scrollTrigger: st, onUpdate: () => { n.textContent = format(n, obj.v); } });
        }
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>;
}

function format(n: HTMLElement, v?: number) {
  const to = Number(n.dataset.to || 0); const val = Math.round(v ?? to);
  return (n.dataset.prefix || '') + val.toLocaleString('en-US') + (n.dataset.suffix || '');
}

/** Renders manual line breaks as masked lines for data-r="lines". */
export function Lines({ lines, className }: { lines: (string | React.ReactNode)[]; className?: string }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className={'ln ' + (className || '')}><span>{l}</span></span>
      ))}
    </>
  );
}
