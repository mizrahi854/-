'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import type { Project } from '@/lib/projects';
import { projectLine } from '@/lib/projects';
import { useProjectTransition } from '../Transition';
import { Arrow, Pin } from '../Icons';
import s from './ProjectTile.module.css';

/**
 * Project tile — Emerald grid cell + Rachel-Katz text focus.
 * Rest: sharp image, blue-purple strip (name right, city left).
 * Hover / keyboard focus (this tile only): image pushes in and softens,
 * a translucent ink veil and one glass sweep enter, the Bonei logo resolves
 * in the centre, then the project name is "written" right→left word by word
 * from blur to focus. All states are CSS transitions, so leaving mid-way
 * reverses continuously and nothing can get stuck between tiles.
 */
export default function ProjectTile({ p, sizes, pos = '50% 40%', priority = false, img: imgIdx = 0, showStatus = false, detail: detailOverride }: { p: Project; sizes: string; pos?: string; priority?: boolean; img?: number; showStatus?: boolean; detail?: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const { openProject } = useProjectTransition();
  const c = p.images[imgIdx] ?? p.images[0];
  const href = `/projects/${p.id}`;
  const words = p.title.split(/\s+/);
  const detail = detailOverride ?? (p.subtitle || projectLine(p) || (p.renewal ?? ''));

  const onClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault(); openProject(href, imgRef.current);
  };

  return (
    <Link href={href} className={s.tile} onClick={onClick} data-tile>
      <div className={s.media} data-tile-media>
        {c ? (
          <Image ref={imgRef} src={c.src} alt="" fill sizes={sizes} priority={priority} quality={78} className={s.img} style={{ objectPosition: pos }} />
        ) : (
          <div className={s.noimg} aria-hidden="true" />
        )}
        <span className={s.veil} aria-hidden="true" />
        <span className={s.sweep} aria-hidden="true" />
        <span className={s.focus} aria-hidden="true">
          <Image src="/images/brand/logo-white.png" alt="" width={600} height={407} sizes="140px" className={s.logo} />
          <span className={s.write}>
            {words.map((w, i) => <span key={i} className={s.w} style={{ ['--i' as string]: i }}>{w}</span>)}
            <span className={s.go} style={{ ['--i' as string]: words.length }}>לפרויקט<Arrow className={s.goArr} /></span>
          </span>
        </span>
      </div>
      <div className={s.strip} data-tile-strip>
        <div className={s.row}>
          <h3 className={s.name}>{p.title}</h3>
          <span className={s.city}><Pin />{p.city ?? 'מבני ציבור'}</span>
        </div>
        <div className={s.more}>
          <p className={s.detail}>
            {showStatus && <span className={s.status}>{p.statusLabel}</span>}
            <span>{detail}</span>
          </p>
        </div>
        <span className={s.touchGo} aria-hidden="true">לפרויקט <Arrow className={s.goArr} /></span>
      </div>
    </Link>
  );
}
