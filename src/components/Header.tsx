'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { company } from '@/data/company';
import { useLenis } from './SmoothScroll';
import { Close, External, Phone } from './Icons';
import { ensureGsap, prefersReducedMotion } from '@/lib/motion';
import s from './Header.module.css';
import { NAV } from '@/data/nav';


export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const th = isHome ? window.innerHeight * 0.42 : 48;
      setSolid(window.scrollY > th);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const p = panel.current; if (!p) return;
    const { gsap } = ensureGsap();
    if (open) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      if (!prefersReducedMotion()) {
        gsap.fromTo(p, { clipPath: 'polygon(100% 0, 100% 0, 100% 0, 100% 0)' }, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 0.8, ease: 'expo.inOut' });
        gsap.fromTo(p.querySelectorAll('[data-m]'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.3 });
        gsap.fromTo(p.querySelectorAll('[data-mf]'), { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.55, stagger: 0.04 });
      }
      p.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
        if (e.key === 'Tab') {
          const f = [...p.querySelectorAll<HTMLElement>('a, button')];
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
  }, [open, lenis]);

  const close = () => { setOpen(false); btn.current?.focus(); };

  return (
    <>
      <header className={`${s.header} ${solid ? s.solid : ''} ${isHome ? s.home : ''}`} data-open={open || undefined}>
        <div className={s.inner}>
          <button ref={btn} className={s.menuBtn} aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(true)}>
            <span className="sr-only">פתיחת תפריט מלא</span>
            <span className={s.burger} aria-hidden="true"><i /><i /><i /></span>
          </button>
          <nav className={s.nav} aria-label="ניווט ראשי">
            <ul>
              {[{ href: '/', label: 'דף הבית' }, ...NAV].map((n) => (
                <li key={n.href}><Link href={n.href} className={s.link} aria-current={(n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)) ? 'page' : undefined}>{n.label}</Link></li>
              ))}
            </ul>
            <a href={company.residentPortal} target="_blank" rel="noopener" className={`${s.link} ${s.portal}`}>פורטל דיירים<span className="sr-only"> (נפתח בחלון חדש)</span></a>
            <a href={company.phoneShortHref} className={s.phone}><Phone /><bdi dir="ltr">{company.phoneShort}</bdi></a>
          </nav>
          <Link href="/" className={s.logo} aria-label="בוני בניין — דף הבית">
            <Image src="/images/brand/logo-white.png" alt="בוני בניין — חושבים אנשים" width={600} height={407} priority sizes="160px" />
          </Link>
        </div>
      </header>

      <div id="site-menu" ref={panel} className={`${s.menu} on-ink`} role="dialog" aria-modal="true" aria-label="תפריט" hidden={!open}>
        <div className={s.menuTop}>
          <Link href="/" className={s.menuLogo} onClick={close} aria-label="דף הבית">
            <Image src="/images/brand/logo-white.png" alt="" width={600} height={407} sizes="120px" />
          </Link>
          <button className={s.closeBtn} onClick={close}><Close /><span className="sr-only">סגירת התפריט</span></button>
        </div>
        <div className={s.menuGrid}>
          <ul className={s.menuMain}>
            {[{ href: '/', label: 'דף הבית' }, ...NAV].map((n, i) => (
              <li key={n.href}><Link href={n.href} onClick={close}><span className={s.mNum} aria-hidden="true">0{i + 1}</span><span className={s.mClip}><span data-m>{n.label}</span></span></Link></li>
            ))}
          </ul>
          <div className={s.menuSide}>
            <div data-mf>
              <p className={s.mHead}>פרויקטים</p>
              <ul>
                <li><Link href="/projects?status=marketing" onClick={close}>פרויקטים בשיווק</Link></li>
                <li><Link href="/projects?status=planning" onClick={close}>פרויקטים בתכנון</Link></li>
                <li><Link href="/projects?status=occupied" onClick={close}>פרויקטים מאוכלסים</Link></li>
                <li><Link href="/projects?type=commercial" onClick={close}>מבני ציבור ומסחר</Link></li>
              </ul>
            </div>
            <div data-mf>
              <p className={s.mHead}>החברה</p>
              <ul>
                <li><Link href="/about#management" onClick={close}>הנהלה</Link></li>
                <li><Link href="/#updates" onClick={close}>עדכונים ומדיה</Link></li>
                <li><a href={company.residentPortal} target="_blank" rel="noopener">פורטל דיירים <External /></a></li>
              </ul>
            </div>
            <div data-mf>
              <p className={s.mHead}>יצירת קשר</p>
              <ul>
                <li><a href={company.phoneShortHref}><bdi dir="ltr">{company.phoneShort}</bdi></a></li>
                <li><a href={company.phoneOfficeHref}><bdi dir="ltr">{company.phoneOffice}</bdi></a></li>
                <li><a href={`mailto:${company.email}`}>{company.email}</a></li>
                <li>{company.address}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
