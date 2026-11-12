import raw from '@/data/projects.json';

export type ProjectStatus = 'marketing' | 'planning' | 'occupied' | 'delivered';
export type ProjectKind = 'residential' | 'commercial';
export interface ProjectImage { src: string; w: number; h: number }
export interface Project {
  id: string;
  kind: ProjectKind;
  status: ProjectStatus;
  statusLabel: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  address: string | null;
  facts: { units: string | null; buildings: string | null; floors: string | null; architect: string | null; developer: string | null; area: string | null };
  renewal: string | null;
  description: string[];
  images: ProjectImage[];
  /** Page on bonei.co.il the data was extracted from */
  source: string;
}

// Remove internal placeholder copy that exists on the source site (e.g. "נדרש מידע נוסף…")
const clean = (p: Project): Project => ({
  ...p,
  description: p.description
    .map((d) => d.replace(/נדרש מידע נוסף[^.]*\.?/g, '').trim())
    .filter((d) => d.length > 2),
});

export const projects: Project[] = (raw as Project[]).map(clean);

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  marketing: 'בשיווק',
  planning: 'בתכנון',
  occupied: 'מאוכלס',
  delivered: 'נמסר',
};

export const getProject = (id: string) => projects.find((p) => p.id === id);
export const residential = projects.filter((p) => p.kind === 'residential');
export const commercial = projects.filter((p) => p.kind === 'commercial');
export const cover = (p: Project) => p.images[0] ?? null;

export function projectLine(p: Project) {
  const parts: string[] = [];
  if (p.facts.units) parts.push(`${p.facts.units} יח״ד`);
  if (p.facts.floors) parts.push(`${p.facts.floors} קומות`);
  if (p.facts.area) parts.push(p.facts.area);
  if (p.facts.architect) parts.push(p.facts.architect);
  return parts.join(' · ');
}

export function relatedProjects(p: Project, n = 3) {
  const pool = projects.filter((x) => x.id !== p.id && x.kind === p.kind && x.images.length);
  const same = pool.filter((x) => x.city === p.city);
  const rest = pool.filter((x) => x.city !== p.city && x.status === p.status);
  return [...same, ...rest].slice(0, n);
}
