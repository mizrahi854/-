import Link from 'next/link';
import Image from 'next/image';
import { company } from '@/data/company';
import { projects } from '@/lib/projects';
import { External, Pin, Phone, Social } from './Icons';
import { nxFonts } from '@/lib/fonts';
import Glow from './nx/Glow';
import s from './Footer.module.css';

/** Footer — proportions from the recording: brand + direct contact on the right, link columns on the left, legal line beneath. */
export default function Footer() {
  const marketing = projects.filter((p) => p.status === 'marketing' && p.images.length).slice(0, 6);
  return (
    <footer className={`nx ${nxFonts} ${s.footer} on-ink`}>
      <Glow variant="b" />
      <div className={s.top}>
        <div className={s.brand}>
          <Link href="/" aria-label="בוני בניין — דף הבית" className={s.logoLink}>
            <Image src="/images/brand/logo-white.png" alt="בוני בניין — חושבים אנשים" width={600} height={407} sizes="200px" className={s.logo} />
          </Link>
          <ul className={s.contact}>
            <li><a href={company.phoneShortHref}><Phone /><bdi dir="ltr">{company.phoneShort}</bdi></a></li>
            <li><a href={company.phoneOfficeHref}><Phone /><bdi dir="ltr">{company.phoneOffice}</bdi></a></li>
            <li><a href={`mailto:${company.email}`}><Mail />{company.email}</a></li>
            <li><span><Pin />{company.address}</span></li>
          </ul>
        </div>
        <nav className={s.col} aria-label="ניווט באתר">
          <p className={s.h}>ניווט באתר</p>
          <ul>
            <li><Link href="/">עמוד הבית</Link></li>
            <li><Link href="/about">אודות</Link></li>
            <li><Link href="/projects">פרויקטים</Link></li>
            <li><Link href="/urban-renewal">התחדשות עירונית</Link></li>
            <li><Link href="/#contact">צור קשר</Link></li>
          </ul>
        </nav>
        <nav className={s.col} aria-label="פרויקטים בשיווק">
          <p className={s.h}>פרויקטים בשיווק</p>
          <ul>
            {marketing.map((p) => <li key={p.id}><Link href={`/projects/${p.id}`}>{p.title}{p.city ? `, ${p.city}` : ''}</Link></li>)}
          </ul>
        </nav>
        <div className={s.col}>
          <p className={s.h}>דיירים</p>
          <ul>
            <li><a href={company.residentPortal} target="_blank" rel="noopener">פורטל דיירים <External /><span className="sr-only"> (נפתח בחלון חדש)</span></a></li>
            <li><Link href="/urban-renewal#renewal-contact">בדיקת בניין להתחדשות</Link></li>
          </ul>
          <div className={s.social}>
            <a href={company.social.facebook} target="_blank" rel="noopener" aria-label="פייסבוק"><Social kind="facebook" /></a>
            <a href={company.social.instagram} target="_blank" rel="noopener" aria-label="אינסטגרם"><Social kind="instagram" /></a>
            <a href={company.social.youtube} target="_blank" rel="noopener" aria-label="יוטיוב"><Social kind="youtube" /></a>
          </div>
        </div>
      </div>
      <div className={s.legal}>
        <span>© <bdi>{new Date().getFullYear()}</bdi> כל הזכויות שמורות לבוני בניין.</span>
        <span className={s.disclaimer}>ההדמיות והתמונות באתר הן להמחשה בלבד.</span>
        <span className={s.legalLinks}>
          <a href={company.legal.accessibility} target="_blank" rel="noopener">הצהרת נגישות</a>
          <a href={company.legal.privacy} target="_blank" rel="noopener">מדיניות פרטיות</a>
        </span>
      </div>
    </footer>
  );
}

const Mail = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" stroke="currentColor" strokeWidth="1.2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" stroke="currentColor" strokeWidth="1.2" /></svg>
);
