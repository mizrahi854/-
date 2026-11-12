'use client';
import { ensureGsap, isSmall, prefersReducedMotion } from './motion';

/**
 * Motion helpers for the post-hero sections. Every helper must be called
 * inside a gsap.context() so a page change reverts tweens + triggers.
 * Rule: content always reaches a readable state — entering mid-page,
 * fast scrolling or a late image never leaves anything hidden.
 */
export const nxEase = { out: 'expo.out', soft: 'power3.out', io: 'power3.inOut', mask: 'expo.inOut' } as const;

/** Run `cb` once when `el` crosses `start` — immediately if it is already past it. */
export function whenIn(el: Element, cb: () => void, start = 'top 85%') {
  const { ScrollTrigger } = ensureGsap();
  let done = false;
  const fire = () => { if (!done) { done = true; cb(); } };
  const st = ScrollTrigger.create({ trigger: el, start, once: true, onEnter: fire });
  // already scrolled past (deep link / back navigation / fast scroll)
  if (st.progress > 0 || el.getBoundingClientRect().bottom < 0) fire();
  return st;
}

/** Masked line reveal for `.nx-ln > span` children. */
export function revealLines(scope: Element, opts: { start?: string; delay?: number; stagger?: number } = {}) {
  const { gsap } = ensureGsap();
  const spans = scope.querySelectorAll<HTMLElement>('.nx-ln > span');
  if (!spans.length) return;
  whenIn(scope, () => {
    gsap.to(spans, { yPercent: 0, y: 0, duration: 1.15, ease: nxEase.out, stagger: opts.stagger ?? 0.09, delay: opts.delay ?? 0, overwrite: true });
  }, opts.start);
}

/** Kapach-style text: blur + rise into focus, word groups staggered. */
export function revealText(els: Element[] | NodeListOf<Element>, trigger: Element, opts: { start?: string; delay?: number } = {}) {
  const { gsap } = ensureGsap();
  const list = Array.from(els);
  if (!list.length) return;
  gsap.set(list, { opacity: 0, y: 18, filter: 'blur(6px)' });
  whenIn(trigger, () => {
    gsap.to(list, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: nxEase.soft, stagger: 0.08, delay: opts.delay ?? 0, clearProps: 'filter' });
  }, opts.start);
}

/**
 * Zentry-style heading entrance (observed on zentry.com: each word of a huge condensed headline
 * flips up out of depth — translate3d + rotateY/rotateX around a deep origin, power-eased, staggered).
 * Words come from `[data-zw]` (see ZTitle); RTL means DOM order already runs right → left.
 */
export function revealTitle(scope: Element, opts: { start?: string; delay?: number; trigger?: Element } = {}) {
  const { gsap } = ensureGsap();
  const words = scope.querySelectorAll<HTMLElement>('[data-zw]');
  if (!words.length) return;
  gsap.set(words, { opacity: 0, y: 46, z: -60, rotationY: 55, rotationX: -36, transformPerspective: 900, transformOrigin: '50% 50% -140px' });
  whenIn(opts.trigger ?? scope, () => {
    gsap.to(words, { opacity: 1, y: 0, z: 0, rotationY: 0, rotationX: 0, duration: 1.2, ease: 'power3.out', stagger: 0.1, delay: opts.delay ?? 0, clearProps: 'transform,opacity,willChange' });
  }, opts.start);
}

/** Short rules draw out from their text. */
export function revealOrn(scope: Element, start?: string) {
  const { gsap } = ensureGsap();
  scope.querySelectorAll('[data-orn]').forEach((o) => {
    const lines = o.querySelectorAll('[data-orn-line]');
    gsap.set(lines, { scaleX: 0 });
    whenIn(o, () => { gsap.to(lines, { scaleX: 1, duration: 1.1, ease: nxEase.mask, delay: 0.1 }); }, start);
  });
}

/**
 * Emerald grid entrance, row by row: the image opens from the strip upward
 * with a short scale settle; the name strip lands a beat later.
 * Cell geometry never changes — only clip/transform/opacity animate.
 */
export function revealTiles(scope: Element, opts: { firstStart?: string } = {}) {
  const { gsap } = ensureGsap();
  const tiles = Array.from(scope.querySelectorAll<HTMLElement>('[data-tile]'));
  if (!tiles.length) return;
  // group by row (same offsetTop)
  const rows = new Map<number, HTMLElement[]>();
  tiles.forEach((t) => { const k = Math.round(t.getBoundingClientRect().top + window.scrollY); rows.set(k, [...(rows.get(k) || []), t]); });
  const small = isSmall();
  let ri = 0;
  rows.forEach((row) => {
    const start = ri++ === 0 && opts.firstStart ? opts.firstStart : 'top 88%';
    const media = row.map((t) => t.querySelector('[data-tile-media]')!);
    const imgs = row.map((t) => t.querySelector('[data-tile-media] img')).filter(Boolean) as Element[];
    const strips = row.map((t) => t.querySelector('[data-tile-strip]')!);
    gsap.set(media, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(imgs, { scale: 1.16, yPercent: 6 });
    gsap.set(strips, { clipPath: 'inset(0% 0% 100% 0%)' });
    whenIn(row[0], () => {
      const tl = gsap.timeline();
      // RTL: the right-most cell leads
      tl.to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: small ? 0.9 : 1.15, ease: nxEase.mask, stagger: 0.12, clearProps: 'clipPath' }, 0)
        .to(imgs, { scale: 1, yPercent: 0, duration: small ? 1.2 : 1.6, ease: nxEase.out, stagger: 0.12, clearProps: 'transform' }, 0.05)
        .to(strips, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: nxEase.io, stagger: 0.12, clearProps: 'clipPath' }, small ? 0.45 : 0.62);
    }, start);
  });
}

export const motionOK = () => !prefersReducedMotion();
