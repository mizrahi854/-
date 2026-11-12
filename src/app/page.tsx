import HeroSequence from '@/components/home/HeroSequence';
import MarketingProjects from '@/components/home/MarketingProjects';
import Domains from '@/components/nx/Domains';
import BuildScene from '@/components/nx/BuildScene';
import QualityMark from '@/components/home/QualityMark';
import AboutSplit from '@/components/nx/AboutSplit';
import OurStory from '@/components/home/OurStory';
import Management from '@/components/home/Management';
import ContactFrame from '@/components/nx/ContactFrame';
import { stages } from '@/data/company';

export default function Home() {
  return (
    <>
      {/* 01–02 · approved hero + cloud transition — frozen, untouched */}
      <HeroSequence />
      {/* 03 · hand-over point: #intro slides under the clouds */}
      <MarketingProjects />
      <Domains />
      {/* frame → finished home, driven by scroll; same component as /urban-renewal */}
      <BuildScene id="home-build" large glow="c" kicker="FROM FRAME TO HOME" titleLines={['משלד', 'לבית']} stages={stages}
        cta={{ title: 'ובניין קיים? מחדשים אותו.', text: 'התחדשות עירונית עם יזם וקבלן מבצע תחת קורת גג אחת — מהבדיקה הראשונה ועד המפתח.', label: 'להתחדשות עירונית', href: '/urban-renewal' }} />
      <QualityMark />
      <OurStory />
      <AboutSplit />
      <Management />
      <ContactFrame />
    </>
  );
}
