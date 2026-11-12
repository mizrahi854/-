import type { Metadata } from 'next';
import { RenewalHero, RenewalStory, RenewalProjects, RenewalSupport, RenewalFaq, StoryBar } from '@/components/renewal/RenewalScenes';
import RenewalProcess from '@/components/renewal/RenewalProcess';
import AboutSplit from '@/components/nx/AboutSplit';
import ContactFrame from '@/components/nx/ContactFrame';
import { nxFonts } from '@/lib/fonts';

export const metadata: Metadata = { title: 'התחדשות עירונית', description: 'התחדשות עירונית עם בוני בניין: תמ״א 38 והריסה ובנייה מחדש ברעננה, כפר סבא, רמת השרון והרצליה — יזם וקבלן מבצע תחת קורת גג אחת.' };

/** Structure after emeraldltd.co.il/urban-renewal, with Bonei content, photography and colour only. */
export default function UrbanRenewal() {
  return (
    <div className={`nx nx-atmos ${nxFonts}`}>
      <RenewalHero />
      <RenewalStory />
      <RenewalProjects />
      <RenewalSupport />
      <RenewalProcess />
      <RenewalFaq />
      <StoryBar />
      <AboutSplit id="about-renewal" />
      <ContactFrame id="renewal-contact" defaultInquiry="renewal" title="בואו נבדוק את הבניין שלכם" sub="השאירו פרטים וכתובת, ונציג מחטיבת ההתחדשות העירונית יחזור אליכם." />
    </div>
  );
}
