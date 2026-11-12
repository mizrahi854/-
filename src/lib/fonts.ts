import { Heebo, Marcellus } from 'next/font/google';

/**
 * Faces for the post-hero layer only. Applied through `nxFonts` on each new
 * section root (never on <html>/<body>), so the frozen hero keeps its exact
 * Karantina + Assistant rendering.
 *  - Marcellus: Latin display, stands in for Emerald's flared Roman headings.
 *  - Heebo: Hebrew text face matched to the approved about mock (width/x-height).
 */
export const latin = Marcellus({ subsets: ['latin'], weight: '400', variable: '--f-latin', display: 'swap' });
export const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--f-heebo', display: 'swap' }); // variable font: one file per subset
export const nxFonts = `${latin.variable} ${heebo.variable}`;
