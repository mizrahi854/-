// Downloads original project imagery from bonei.co.il and writes optimized copies + a data manifest.
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
const ROOT = process.cwd();
const SRC = path.join(ROOT, '_references/src');
const RAW = path.join(ROOT, '_references/raw'); fs.mkdirSync(RAW, { recursive: true });
const OUT = path.join(ROOT, 'public/images'); fs.mkdirSync(OUT, { recursive: true });
const projects = JSON.parse(fs.readFileSync(path.join(SRC, '_projects.json'), 'utf8'));
const SLUGS = {"מכבי-5":"maccabi-5","בורוכוב-35":"borochov-35","c46-c48-c-collection":"c-collection","בורוכוב-39":"borochov-39","המעלות-7":"hamaalot-7","הר-סיני-8":"har-sinai-8","מכבי-51":"maccabi-51","יגאל-אלון-43":"yigal-alon-43","ההגנה-89-91-93":"gardenia","החורש-18":"hahoresh-18","מבצע-קדש-1-3-5":"mivtza-kadesh","בורוכוב-37":"borochov-37","בר-אילן-25":"bar-ilan-25","שברץ-21":"schwartz-21","החשמונאים-23":"hahashmonaim-23","מכבי-22":"maccabi-22","בר-אילן-42":"bar-ilan-42","אליעזר-יפה-17":"eliezer-yafeh-17","אליעזר-יפה-13":"eliezer-yafeh-13","בילינסון-6":"beilinson-6","המעלות-6":"hamaalot-6","המעלות-4":"hamaalot-4","דב-הז-28":"dov-hoz-28","הגליל-52":"hagalil-52","בילינסון-7":"beilinson-7","מכבי-47":"maccabi-47","ישיבה-תיכונית-אשדוד":"yeshiva-ashdod","פסטלוצי-תל-אביב":"pestalozzi-tel-aviv","מרכז-שיקומי-עמותת-עלה-בני-ברק":"ale-bnei-brak","מוסך-מרכזי-וולוו-הונדה-יגואר":"volvo-honda-jaguar","בית-קלימוטק":"klimotech","בניין-הרוקמים-חולון":"harokmim-holon","מבנה-משרדים-מועצה-אזורית-מטה-בנימין":"mateh-binyamin","מרכז-מסחרי-מונד-סנטר-תל-מונד":"mond-center","בית-ספר-ואודיטוריום-קוגל-חולון":"kugel-holon","קרית-החינוך-שער-הנגב":"shaar-hanegev","היכל-התרבות-מודיעין":"modiin-culture-hall","אולם-ספורט-חסן-ערפה-תל-אביב-יפו":"hassan-arfa","בית-ספר-אבטליון-באר-יהושע":"avtalion-school","תיכון-אביב-רעננה":"aviv-raanana","בית-הספר-פעמונים-רעננה":"paamonim-raanana","בית-הספר-האומנים-רמלה":"haomanim-ramla","מתחם-ספריה-ומתנס-עירוניים-רחובות":"rehovot-library"};
function dl(url) {
  const name = decodeURIComponent(url.split('/').slice(-3).join('_'));
  const f = path.join(RAW, name.replace(/[^\w.\-֐-׿]/g, '_'));
  if (!fs.existsSync(f) || fs.statSync(f).size < 1000) {
    execFileSync('curl', ['-sL', '-A', 'Mozilla/5.0', '-o', f, encodeURI(url)]);
  }
  return f;
}
async function processImg(url, dest, maxW) {
  const f = dl(url);
  try {
    const img = sharp(f).rotate();
    const meta = await img.metadata();
    if (!meta.width || meta.width < 500) return null;
    const w = Math.min(maxW, meta.width);
    const info = await img.resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(dest);
    return { w: info.width, h: info.height, origW: meta.width };
  } catch (e) { console.log('bad', url, e.message); return null; }
}
const manifest = [];
for (const p of projects) {
  const slug = SLUGS[p.slug]; if (!slug) { console.log('noslug', p.slug); continue; }
  const html = fs.readFileSync(path.join(SRC, p.slug + '.html'), 'utf8');
  const og = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  const list = [];
  const add = (u) => { if (!u) return; u = u.replace(/-\d+x\d+(\.\w+)$/, '$1'); if (/\.png$/i.test(u) && u !== og) return; if (!list.includes(u)) list.push(u); };
  add(og); p.imgs.forEach(add);
  const dir = path.join(OUT, 'p', slug); fs.mkdirSync(dir, { recursive: true });
  const images = [];
  for (const u of list.slice(0, 16)) {
    const n = String(images.length).padStart(2, '0');
    const r = await processImg(u, path.join(dir, n + '.jpg'), 2400);
    if (r) images.push({ src: `/images/p/${slug}/${n}.jpg`, w: r.w, h: r.h, source: u });
  }
  manifest.push({ ...p, id: slug, images });
  console.log(slug, images.length, images[0] && `${images[0].w}x${images[0].h} (orig ${images[0].origW ?? ''})`);
}
fs.writeFileSync(path.join(ROOT, '_references/assets-manifest.json'), JSON.stringify(manifest, null, 1));
