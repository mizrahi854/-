export const Arrow = ({ className = 'arrow' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 30 10" fill="none" aria-hidden="true">
    <path d="M30 5H1.2M5.5 0.8 1.2 5l4.3 4.2" stroke="currentColor" strokeWidth="1" />
  </svg>
);
export const ArrowDown = () => (
  <svg viewBox="0 0 20 30" width="20" height="30" fill="none" aria-hidden="true">
    <path d="M10 0v28M2 20l8 8 8-8" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
export const Close = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M4 4l16 16M20 4 4 20" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
export const Phone = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
export const External = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
    <path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7 9" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);
export const Pin = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
    <path d="M8 15s5-4.6 5-8.5A5 5 0 0 0 3 6.5C3 10.4 8 15 8 15Z" stroke="currentColor" strokeWidth="1.1" /><circle cx="8" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);
export const Social = ({ kind }: { kind: 'facebook' | 'instagram' | 'youtube' }) => {
  if (kind === 'facebook') return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.6V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.4H7.6V13h2.7v8h3.2Z"/></svg>;
  if (kind === 'instagram') return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.3"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>;
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>;
};
