'use client';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectImage } from '@/lib/projects';
import { useLenis } from '../SmoothScroll';
import { Close } from '../Icons';
import s from './Gallery.module.css';

export default function Gallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useLenis();
  const dlg = useRef<HTMLDivElement>(null);
  const last = useRef<HTMLElement | null>(null);
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);
  useEffect(() => {
    if (open === null) { lenis?.start(); document.body.style.overflow = ''; last.current?.focus(); return; }
    lenis?.stop(); document.body.style.overflow = 'hidden';
    dlg.current?.querySelector<HTMLElement>('button')?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowLeft') go(1);   // RTL: left = next
      if (e.key === 'ArrowRight') go(-1);
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [open, go, lenis]);
  if (!images.length) return null;
  return (
    <>
      <ul className={s.grid}>
        {images.map((im, i) => (
          <li key={im.src} className={s.item} data-shape={i % 5}>
            <button className={s.btn} onClick={(e) => { last.current = e.currentTarget; setOpen(i); }} aria-label={`הגדלת תמונה ${i + 1} מתוך ${images.length}`}>
              <Image src={im.src} alt={`${title} — תמונה ${i + 1}`} fill sizes="(max-width: 767px) 100vw, 50vw" className={s.img} />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && (
        <div ref={dlg} className={s.lb} role="dialog" aria-modal="true" aria-label={`גלריה — ${title}`}>
          <button className={s.close} onClick={() => setOpen(null)}><Close /><span className="sr-only">סגירה</span></button>
          <div className={s.stage}>
            <Image key={images[open].src} src={images[open].src} alt={`${title} — תמונה ${open + 1}`} width={images[open].w} height={images[open].h} sizes="92vw" className={s.big} />
          </div>
          <div className={s.nav}>
            <button onClick={() => go(-1)} aria-label="תמונה קודמת">→</button>
            <span><bdi>{open + 1} / {images.length}</bdi></span>
            <button onClick={() => go(1)} aria-label="תמונה הבאה">←</button>
          </div>
        </div>
      )}
    </>
  );
}
