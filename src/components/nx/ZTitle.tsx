/** Heading split into word spans for `revealTitle`. The accessible name stays the full text. */
export default function ZTitle({ lines, id, className = '', lineClass = [], as: Tag = 'h2' }: { lines: string[]; id?: string; className?: string; lineClass?: string[]; as?: 'h1' | 'h2' | 'h3' }) {
  return (
    <Tag id={id} className={className} aria-label={lines.join(' ')}>
      {lines.map((l, i) => (
        <span key={i} className={`zt-l ${lineClass[i] ?? ''}`} aria-hidden="true">
          {l.split(' ').map((w, j) => <span key={j} className="zt-w" data-zw>{w}</span>)}
        </span>
      ))}
    </Tag>
  );
}
