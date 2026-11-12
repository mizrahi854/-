import type { Metadata } from 'next';
import NxHero from '@/components/nx/NxHero';
import { AboutStory, AboutBand, AboutWhy, AboutDepartments } from '@/components/about/AboutScenes';
import Management from '@/components/home/Management';
import ContactFrame from '@/components/nx/ContactFrame';
import { nxFonts } from '@/lib/fonts';
import { story } from '@/data/company';

export const metadata: Metadata = { title: 'אודות', description: 'בוני בניין — חברה משפחתית ליזמות ובנייה מאז 1972. שלושה דורות, הנהלה, מחלקות והסמכות.' };

/** About — opens with the shared page hero (same as urban renewal), then the site's dark/light rhythm. */
export default function About() {
  return (
    <div className={`nx nx-atmos ${nxFonts}`}>
      <NxHero id="ab-title" kicker="ABOUT BONEI BINYAN" lines={['מורשת משפחתית', 'של יזמות ובנייה.']} image="/images/about/c46-c48-twin.jpg" alt="שני בנייני C46 ו־C48 בחדרה, בשעת ערב עם חלונות מוארים" pos="50% 55%" lead={story.today} />
      <AboutStory />
      <AboutBand />
      <Management showLink={false} />
      <AboutWhy />
      <AboutDepartments />
      <ContactFrame id="about-contact" />
    </div>
  );
}
