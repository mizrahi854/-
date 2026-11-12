'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;
export function ensureGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/** Shared motion tokens (mirrors CSS custom properties in globals.css). */
export const M = {
  dur: { short: 0.22, base: 0.6, enter: 1.1, page: 0.85 },
  ease: { out: 'expo.out', soft: 'power3.out', inOut: 'power3.inOut', in: 'power2.in' },
  stagger: 0.08,
  distance: 40,
  scale: { from: 1.14, to: 1 },
} as const;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isSmall = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
