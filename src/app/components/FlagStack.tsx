/**
 * A small vertical stack of flags: European Union, Germany, NRW and Herdecke.
 * All drawn as inline SVG (sharp at any size, no assets). Herdecke is shown in
 * its civil flag colours (red-white) — deliberately NOT its coat of arms, which
 * is a protected municipal emblem and would imply an official affiliation.
 */
const STAR =
  'M0,-1 L-0.225,-0.309 L-0.951,-0.309 L-0.363,0.118 L-0.588,0.809 L0,0.382 L0.588,0.809 L0.363,0.118 L0.951,-0.309 L0.225,-0.309 Z';

const STAR_POS: [number, number][] = [
  [18, 5], [21.5, 5.9], [24.1, 8.5], [25, 12], [24.1, 15.5], [21.5, 18.1],
  [18, 19], [14.5, 18.1], [11.9, 15.5], [11, 12], [11.9, 8.5], [14.5, 5.9],
];

export function FlagStack({ className }: { className?: string } = {}) {
  return (
    <div className={className ? `flag-stack ${className}` : 'flag-stack'}>
      {/* Europäische Union */}
      <svg className="flag" viewBox="0 0 36 24" role="img" aria-label="Europäische Union">
        <title>Europäische Union</title>
        <rect width="36" height="24" fill="#003399" />
        <defs>
          <path id="hd-star" d={STAR} fill="#FFCC00" />
        </defs>
        {STAR_POS.map(([x, y], i) => (
          <use key={i} href="#hd-star" transform={`translate(${x} ${y}) scale(1.25)`} />
        ))}
      </svg>

      {/* Deutschland */}
      <svg className="flag" viewBox="0 0 36 24" role="img" aria-label="Deutschland">
        <title>Deutschland</title>
        <rect width="36" height="8" fill="#000000" />
        <rect width="36" height="8" y="8" fill="#DD0000" />
        <rect width="36" height="8" y="16" fill="#FFCE00" />
      </svg>

      {/* Nordrhein-Westfalen */}
      <svg className="flag" viewBox="0 0 36 24" role="img" aria-label="Nordrhein-Westfalen">
        <title>Nordrhein-Westfalen</title>
        <rect width="36" height="8" fill="#009A44" />
        <rect width="36" height="8" y="8" fill="#FFFFFF" />
        <rect width="36" height="8" y="16" fill="#DA121A" />
      </svg>

      {/* Herdecke (Flaggenfarben Rot-Weiß) */}
      <svg className="flag" viewBox="0 0 36 24" role="img" aria-label="Herdecke">
        <title>Herdecke</title>
        <rect width="36" height="12" fill="#DA121A" />
        <rect width="36" height="12" y="12" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
