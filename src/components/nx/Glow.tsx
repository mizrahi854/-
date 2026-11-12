'use client';
import { useLayoutEffect, useRef } from 'react';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';

/**
 * Two wide, soft light fields behind a dark section (smoky indigo #373054 and
 * cool blue #3D4565, low alpha). Pure radial gradients — no blur filter — moved
 * only with `transform` on a scroll scrub, on a layer behind the content.
 * Each variant places the light a little differently so no two sections match.
 * The centre stays clear so photographs and text keep their contrast.
 */
export default function Glow({ variant = 'a' }: { variant?: 'a' | 'b' | 'c' | 'd' }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el || prefersReducedMotion()) return;
    const host = el.parentElement; if (!host) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const [a, b] = el.querySelectorAll('i');
      const st = { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true };
      gsap.fromTo(a, { yPercent: -9 }, { yPercent: 9, ease: 'none', scrollTrigger: st });
      gsap.fromTo(b, { yPercent: 8, xPercent: -3 }, { yPercent: -8, xPercent: 3, ease: 'none', scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);
  return <div ref={ref} className="nx-glow" data-v={variant} aria-hidden="true"><i /><i /></div>;
}
