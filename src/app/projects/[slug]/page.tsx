import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { projects, getProject, relatedProjects } from '@/lib/projects';
import ProjectHero from '@/components/project/ProjectHero';
import Gallery from '@/components/project/Gallery';
import ProjectCard from '@/components/ProjectCard';
import ContactForm from '@/components/ContactForm';
import RevealScope from '@/components/Reveal';
import { Arrow, External, Pin } from '@/components/Icons';
import s from './page.module.css';

export function generateStaticParams() { return projects.map((p) => ({ slug: p.id })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = getProject(slug);
  if (!p) return {};
  return { title: `${p.title}${p.city ? ' ' + p.city : ''}`, description: p.description[0]?.slice(0, 160), openGraph: { images: p.images[0] ? [p.images[0].src] : [] } };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug); if (!p) notFound();
  const list = projects.filter((x) => x.kind === p.kind);
  const idx = list.findIndex((x) => x.id === p.id);
  const next = list[(idx + 1) % list.length];
  const related = relatedProjects(p, 3);
  const facts: [string, string | null][] = [
    ['כתובת', p.address], ['עיר', p.city], ['סטטוס', p.statusLabel], ['סה״כ יחידות דיור', p.facts.units], ['מספר בניינים', p.facts.buildings],
    ['מספר קומות', p.facts.floors], ['שטח', p.facts.area], ['אדריכלים', p.facts.architect], ['יזמים', p.facts.developer], ['סוג פרויקט', p.renewal],
  ];
  const mapsQ = encodeURIComponent([p.address, p.address?.includes(p.city ?? '') ? '' : p.city].filter(Boolean).join(' '));
  return (
    <>
      <ProjectHero p={p} />
      <RevealScope as="section" className={`section ${s.body}`}>
        <div className={`wrap ${s.grid}`}>
          <div className={s.desc}>
            {p.description.map((d, i) => <p key={i} className={i === 0 ? 'statement' : s.para} data-r="fade" data-delay={String(i * 0.06)}>{d}</p>)}
            {p.status !== 'delivered' && (
              <p className={s.note} data-r="fade">הסטטוס והפרטים מבוססים על המידע המפורסם באתר החברה ועשויים להשתנות. לזמינות דירות ולמידע עדכני — פנו לצוות המכירות.</p>
            )}
          </div>
          <dl className={s.facts} data-r="fade" data-delay="0.1">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className={s.fact}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
            {p.address && (
              <div className={s.fact}><dt>מיקום</dt><dd><a className={s.maps} href={`https://www.google.com/maps/search/?api=1&query=${mapsQ}`} target="_blank" rel="noopener"><Pin /> פתיחה במפות <External /><span className="sr-only"> (נפתח בחלון חדש)</span></a></dd></div>
            )}
          </dl>
        </div>
      </RevealScope>

      {p.images.length > 1 && (
        <section className={`section ${s.gallery}`} aria-labelledby="g-title">
          <div className="wrap">
            <div className={s.gHead}><h2 id="g-title" className="h2">גלריית <strong className="strong">פרויקט</strong></h2><span className="caption"><bdi>{p.images.length - 1}</bdi> תמונות · הדמיות וצילומים מאתר החברה</span></div>
            <Gallery images={p.images.slice(1)} title={p.title} />
          </div>
        </section>
      )}

      <section className={`section ${s.inq} on-ink`} aria-labelledby="inq-title">
        <div className={`wrap ${s.inqGrid}`}>
          <div>
            <p className="eyebrow">{p.kind === 'commercial' ? 'פנייה' : 'מתעניינים?'}</p>
            <h2 id="inq-title" className={s.inqH}>{p.kind === 'commercial' ? 'נשמח לשמוע' : 'לפרטים על'}<br /><strong>{p.kind === 'commercial' ? 'על הפרויקט הבא.' : p.title + '.'}</strong></h2>
          </div>
          <ContactForm project={p.title + (p.city ? ' — ' + p.city : '')} defaultInquiry={p.kind === 'commercial' ? 'other' : 'purchase'} />
        </div>
      </section>

      {related.length > 0 && (
        <section className={`section ${s.related}`} aria-labelledby="rel-title">
          <div className="wrap">
            <div className={s.relHead}>
              <h2 id="rel-title" className="h2">פרויקטים <strong className="strong">נוספים</strong></h2>
              <Link href={`/projects/${next.id}`} className="link-arrow">לפרויקט הבא: {next.title} <Arrow className="" /></Link>
            </div>
            <div className={s.relGrid}>
              {related.map((r) => <ProjectCard key={r.id} p={r} ratio="4 / 3" sizes="(max-width: 767px) 100vw, 30vw" />)}
            </div>
            <p className={`caption ${s.source}`}>מקור המידע: <a href={p.source} target="_blank" rel="noopener">עמוד הפרויקט באתר בוני בניין</a></p>
          </div>
        </section>
      )}
    </>
  );
}
