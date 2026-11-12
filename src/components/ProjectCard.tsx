'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import type { Project } from '@/lib/projects';
import { projectLine } from '@/lib/projects';
import { useProjectTransition } from './Transition';
import { Arrow } from './Icons';
import s from './ProjectCard.module.css';

/**
 * Emerald-derived project card: mask-revealed image, a glass highlight that
 * follows the pointer and sweeps once on enter, a restrained tilt, the
 * brand mark emblem and a short detail line that opens on hover/focus.
 * On click the image expands into the project page hero.
 */
export default function ProjectCard({ p, ratio = '4 / 5', sizes = '(max-width: 767px) 100vw, 40vw', priority = false, index }: { p: Project; ratio?: string; sizes?: string; priority?: boolean; index?: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const { openProject } = useProjectTransition();
  const c = p.images[0];
  const href = `/projects/${p.id}`;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current!; const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    el.style.setProperty('--rx', `${((0.5 - y) * 3).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((x - 0.5) * 4).toFixed(2)}deg`);
  };
  const onLeave = () => { const el = ref.current!; el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
  const onClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault(); openProject(href, img.current);
  };

  return (
    <Link ref={ref} href={href} className={s.card} onPointerMove={onMove} onPointerLeave={onLeave} onClick={onClick} data-index={index}>
      <div className={s.tilt}>
        <div className={`${s.frame} cut`} style={{ aspectRatio: ratio }} data-card-media>
          {c ? (
            <Image ref={img} src={c.src} alt={`${p.title}${p.city ? ', ' + p.city : ''} — הדמיה/צילום הפרויקט`} fill sizes={sizes} className={s.img} priority={priority} quality={78} />
          ) : (
            <div className={s.noimg} aria-hidden="true"><Image src="/images/brand/mark-white.png" alt="" width={84} height={60} /></div>
          )}
          <span className={s.glass} aria-hidden="true" />
          <span className={s.sweep} aria-hidden="true" />
          <span className={s.emblem} aria-hidden="true"><Image src="/images/brand/mark-white.png" alt="" width={46} height={34} /></span>
        </div>
      </div>
      <div className={s.cap} data-card-cap>
        <div className={s.capTop}>
          <h3 className={s.title}>{p.title}</h3>
          <span className="tag" data-status={p.status}>{p.statusLabel}</span>
        </div>
        <p className={s.city}>{p.city ?? 'מבני ציבור ומסחר'}{p.subtitle ? ` · ${p.subtitle}` : ''}</p>
        <p className={s.detail}><span>{projectLine(p)}</span><Arrow className={s.arr} /></p>
      </div>
    </Link>
  );
}
