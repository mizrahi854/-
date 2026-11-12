// Media/updates listed on https://bonei.co.il/מדיה/ (WP posts). External links point to the original publications.
export interface MediaItem { date: string; title: string; outlet: string; href: string; img?: string }
export const media: MediaItem[] = [
  { date: '2026-05-14', title: 'שלושה פנטהאוזים ב־30 מיליון שקל — בוני בניין מכרה מעל 42 אלף שקל למ״ר', outlet: 'TheMarker', href: 'https://www.themarker.com/labels/themasters/2026-05-04/ty-article-labels/0000019d-f2aa-d369-a19d-f3ef78c80000' },
  { date: '2024-12-11', title: 'בוני בניין משיקה לשיווק את פרויקט Gardenia במרכז השקט של רעננה', outlet: 'מקומי', href: 'https://mikumi.co.il/real-estate-news/%D7%91%D7%95%D7%A0%D7%99-%D7%91%D7%A0%D7%99%D7%99%D7%9F-%D7%9E%D7%A9%D7%99%D7%A7%D7%94-%D7%9C%D7%A9%D7%99%D7%95%D7%95%D7%A7-%D7%90%D7%AA/', img: '/images/p/gardenia/03.jpg' },
  { date: '2024-12-05', title: 'קבלת כוכב שלישי בתוכנית הכוכבים בבטיחות', outlet: 'פייסבוק בוני בניין', href: 'https://www.facebook.com/boneibinyan/', img: '/images/media/safety.jpg' },
  { date: '2024-12-05', title: 'רחוב מכבי ברעננה מתחדש: עשרות דירות חדשות במקום הבניין הישן', outlet: 'mynet רעננה', href: 'https://raanana.mynet.co.il/real_estate/article/rk1vycaq1x', img: '/images/media/maccabi.jpg' },
  { date: '2024-11-14', title: 'הסתיימה בהצלחה יציקת הרפסודה בפרויקט מכבי 51 רעננה', outlet: 'פייסבוק בוני בניין', href: 'https://www.facebook.com/boneibinyan/', img: '/images/media/raft.jpg' },
  { date: '2024-09-06', title: 'מדברים נדל״ן: אלון מידן על התחדשות עירונית, בנייה ומורשת משפחתית', outlet: 'YouTube', href: 'https://www.youtube.com/watch?v=ta41lQeKhAY' },
];

/** No verified testimonials exist on the source site. Add real, approved quotes here; the component renders only when this is non-empty. */
export interface Testimonial { quote: string; name: string; project?: string }
export const testimonials: Testimonial[] = [];
