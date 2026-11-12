import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProjectsArchive from '@/components/ProjectsArchive';
import Domains from '@/components/nx/Domains';

export const metadata: Metadata = { title: 'פרויקטים', description: 'כל פרויקטי בוני בניין: מגורים בשיווק, בתכנון ומאוכלסים, ומבני ציבור ומסחר שנמסרו.' };

export default function ProjectsPage() {
  return (
    <>
      <Suspense fallback={<div style={{ minHeight: '100svh', background: 'var(--nx-bg)' }} />}>
        <ProjectsArchive />
      </Suspense>
      <Domains id="domains-archive" />
    </>
  );
}
