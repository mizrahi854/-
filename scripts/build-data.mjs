// Normalizes scraped bonei.co.il project data into src/data/projects.json (source URL kept per project).
import fs from 'node:fs';
const m = JSON.parse(fs.readFileSync('_references/assets-manifest.json', 'utf8'));
const STATUS = { 'פרויקטים-בשיווק-he': ['marketing', 'בשיווק'], 'פרויקטים-בתכנון-he': ['planning', 'בתכנון'], 'פרויקטים-מאוכלסים-he': ['occupied', 'מאוכלס'], 'נמסר-he': ['delivered', 'נמסר'] };
const CITY_OVERRIDE = { 'har-sinai-8': 'רעננה', gardenia: 'רעננה', 'ale-bnei-brak': 'בני ברק', 'shaar-hanegev': 'שער הנגב', 'mateh-binyamin': 'מטה בנימין', 'volvo-honda-jaguar': null, klimotech: null, 'avtalion-school': null, 'pestalozzi-tel-aviv': 'תל אביב-יפו', 'hassan-arfa': 'תל אביב-יפו', 'mond-center': 'תל מונד', 'kugel-holon': 'חולון', 'harokmim-holon': 'חולון' };
const out = m.map((p) => {
  const [status, statusLabel] = STATUS[p.status];
  const f = { ...p.facts };
  if (p.id === 'avtalion-school') { f['אדריכלים'] = f['מס׳ קומות']; f['יזמים'] = 'עיריית בני ברק'; delete f['מס׳ קומות']; }
  if (p.id === 'maccabi-47') delete f['שטח'];
  // merge short description fragments into paragraphs
  const paras = []; let buf = '';
  for (const l of p.desc) { buf = buf ? buf + ' ' + l : l; if (l.length > 40 || /[.!]$/.test(l)) { paras.push(buf.replace(/\s+/g, ' ').trim()); buf = ''; } }
  if (buf) paras.push(buf.trim());
  let city = CITY_OVERRIDE[p.id];
  if (city === undefined) {
    const addr = f['כתובת'];
    if (addr && addr.includes(',')) city = addr.split(',').pop().trim();
    else { const t = p.title.split('–'); city = t.length > 1 ? t.pop().trim() : null; }
  }
  if (city === 'בלינסון 7') city = 'כפר סבא';
  const title = p.kind === 'commercial' ? p.title.split('–')[0].trim() : p.title.replace(' – C-collection', '');
  const images = p.images.filter((im) => im.w / im.h < 2.4).map(({ src, w, h }) => ({ src, w, h }));
  const text = paras.join(' ');
  const renewal = /תמ"א 38\/1/.test(text) ? 'תמ"א 38/1' : /תמ"א 38\/2/.test(text) ? 'תמ"א 38/2' : /הריסה ובנייה|הרסה את הבניין/.test(text) ? 'הריסה ובנייה מחדש' : /התחדשות עירונית/.test(text) ? 'התחדשות עירונית' : null;
  return {
    id: p.id, kind: p.kind, status, statusLabel, title,
    subtitle: p.id === 'c-collection' ? 'C-collection' : p.id === 'gardenia' ? 'ההגנה 89-93' : null,
    city, address: f['כתובת'] || null,
    facts: { units: f['סה״כ יח״ד'] || null, buildings: f['מס׳ בניינים'] || null, floors: f['מס׳ קומות'] || null, architect: (f['אדריכלים'] || '').replace(/\s+/g, ' ') || null, developer: f['יזמים'] || null, area: f['שטח'] || null },
    renewal, description: paras, images, source: p.url,
  };
});
fs.writeFileSync('src/data/projects.json', JSON.stringify(out, null, 1));
for (const p of out) console.log(p.id, p.kind[0], p.status, p.city, p.renewal || '', p.images.length, p.description.length);
