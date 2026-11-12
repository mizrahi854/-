/**
 * Short rule beside a heading/kicker. Lines only — no diamonds.
 * `start`/`end` are kept for call-site compatibility and are ignored.
 */
export default function Orn({ children, className = '', lines = 'both' }: { children?: React.ReactNode; className?: string; start?: boolean; end?: boolean; lines?: 'both' | 'start' | 'end' | 'none' }) {
  return (
    <div className={`nx-orn ${className}`} data-orn>
      {(lines === 'both' || lines === 'start') && <span className="nx-orn__line" aria-hidden="true" data-orn-line style={{ ['--o' as string]: 'left' }} />}
      {children}
      {(lines === 'both' || lines === 'end') && <span className="nx-orn__line" aria-hidden="true" data-orn-line style={{ ['--o' as string]: 'right' }} />}
    </div>
  );
}
