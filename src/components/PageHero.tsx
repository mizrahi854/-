import Image from 'next/image';
import RevealScope, { Lines } from './Reveal';
import s from './PageHero.module.css';

export default function PageHero({ eyebrow, lines, lead, image, imageAlt, children }: { eyebrow: string; lines: (string | React.ReactNode)[]; lead?: string; image?: string; imageAlt?: string; children?: React.ReactNode }) {
  return (
    <RevealScope as="section" className={`${s.hero} on-ink ${image ? s.withImg : ''}`}>
      {image && (
        <div className={s.media} data-r="fade">
          <Image src={image} alt={imageAlt || ''} fill priority sizes="100vw" className={s.img} />
          <div className={s.shade} />
        </div>
      )}
      <div className={`wrap ${s.inner}`}>
        <p className="eyebrow" data-r="fade">{eyebrow}</p>
        <h1 className={s.h} data-r="lines" data-start="top 100%"><Lines lines={lines} /></h1>
        {lead && <p className={s.lead} data-r="fade" data-delay="0.25" data-start="top 100%">{lead}</p>}
        {children}
      </div>
    </RevealScope>
  );
}
