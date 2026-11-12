// Brand assets: logo, hero, team portraits, media thumbs (all from bonei.co.il).
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process'; import sharp from 'sharp';
const RAW = '_references/raw'; const OUT = 'public/images'; fs.mkdirSync(OUT + '/team', { recursive: true }); fs.mkdirSync(OUT + '/media', { recursive: true }); fs.mkdirSync(OUT + '/brand', { recursive: true });
const get = (u) => { const f = path.join(RAW, 'b_' + decodeURIComponent(u).split('/').pop().replace(/[^\w.\-]/g, '_')); if (!fs.existsSync(f)) execFileSync('curl', ['-sL', '-A', 'Mozilla/5.0', '-o', f, encodeURI(decodeURI(u))]); return f; };
const U = 'https://bonei.co.il/wp-content/uploads/';
// Logo (negative = white). Trim, export png + svg-free webp
const logo = get(U + '2024/10/BoneyBinyan_LogoNeg-RGB.png');
await sharp(logo).trim().resize({ width: 600 }).png({ compressionLevel: 9 }).toFile(OUT + '/brand/logo-white.png');
await sharp(logo).trim().resize({ width: 600 }).negate({ alpha: false }).png().toFile(OUT + '/brand/logo-ink-raw.png');
const pos = get(U + '2024/10/BoneyBinyan_Logo-RGB.png');
await sharp(pos).trim().resize({ width: 600 }).png({ compressionLevel: 9 }).toFile(OUT + '/brand/logo-color.png');
// Logo mark only (top part) for emblems
const lm = await sharp(OUT + '/brand/logo-white.png').metadata();
await sharp(OUT + '/brand/logo-white.png').extract({ left: Math.round(lm.width * 0.36), top: 0, width: Math.round(lm.width * 0.28), height: Math.round(lm.height * 0.29) }).trim().png().toFile(OUT + '/brand/mark-white.png');
// Hero: original Hahashmonaim 23 render, upscaled cleanly for large screens (no new content)
await sharp('public/images/p/hahashmonaim-23/00.jpg').resize({ width: 2200, kernel: 'lanczos3' }).sharpen({ sigma: 0.6 }).jpeg({ quality: 84, mozjpeg: true }).toFile(OUT + '/brand/hero-hashmonaim-2200.jpg');
await sharp('public/images/p/hahashmonaim-23/00.jpg').jpeg({ quality: 82, mozjpeg: true }).toFile(OUT + '/brand/hero-hashmonaim-1280.jpg');
const team = { haim: '2024/12/TOM6499-1.jpg', alon: '2024/12/TOM6763-1.jpg', noam: '2024/12/TOM6716-1.jpg', avner: '2024/12/TOM6562-1.jpg', roi: '2025/12/TOM_0416_3.jpg' };
for (const [k, u] of Object.entries(team)) { const i = await sharp(get(U + u)).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/team/${k}.jpg`); console.log(k, i.width, i.height); }
const media = { safety: '2025/01/468867092_1380688059935530_7719024800765837980_n.jpg', raft: '2025/01/466383290_1365169951487341_7323686790237938642_n.jpg', neve: '2025/01/466375438_1365169948154008_626964176890053985_n.jpg', maccabi: '2024/12/Macabi_51_Raanana_C_01_print.jpg' };
for (const [k, u] of Object.entries(media)) { const i = await sharp(get(U + u)).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/media/${k}.jpg`); console.log(k, i.width, i.height); }
