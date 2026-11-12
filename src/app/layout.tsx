import type { Metadata, Viewport } from 'next';
import { Karantina, Assistant } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import TransitionProvider from '@/components/Transition';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Display: Karantina (OFL) — licensed stand-in for Emerald's commercial "Mikmoret". Body: Assistant (OFL).
const karantina = Karantina({ subsets: ['hebrew', 'latin'], weight: ['300', '400', '700'], variable: '--f-karantina', display: 'swap' });
const assistant = Assistant({ subsets: ['hebrew', 'latin'], variable: '--f-assistant', display: 'swap' }); // variable font: same rendering, one file per subset

export const metadata: Metadata = {
  metadataBase: new URL('https://bonei.co.il'),
  title: { default: 'בוני בניין | חושבים אנשים — יזמות ובנייה מאז 1972', template: '%s | בוני בניין' },
  description: 'בוני בניין — חברה משפחתית ליזמות ובנייה מאז 1972. פרויקטי מגורים והתחדשות עירונית ברעננה, כפר סבא, הרצליה וחדרה, ומבני ציבור ברחבי הארץ.',
  icons: { icon: '/images/brand/mark-white.png' },
  openGraph: { locale: 'he_IL', type: 'website', siteName: 'בוני בניין' },
};

export const viewport: Viewport = { themeColor: '#24223f', width: 'device-width', initialScale: 1 };

const motionBoot = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion');if(sessionStorage.getItem('bonei:seen'))document.documentElement.classList.add('seen')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${karantina.variable} ${assistant.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBoot }} />
        <link rel="preload" href="/images/brand/logo-white.png" as="image" />
      </head>
      <body>
        <a href="#main" className="skip-link">דילוג לתוכן</a>
        <SmoothScroll>
          <TransitionProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </TransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
