import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { Arrow } from '@/components/Icons';

export default function NotFound() {
  return (
    <PageHero eyebrow="404" lines={['העמוד', 'לא נמצא.']} lead="ייתכן שהקישור השתנה. אפשר לחזור לדף הבית או לעבור לרשימת הפרויקטים.">
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href="/" className="btn btn--light">לדף הבית <Arrow /></Link>
        <Link href="/projects" className="link-arrow">לכל הפרויקטים <Arrow className="" /></Link>
      </div>
    </PageHero>
  );
}
