"use client";
import { useId } from "react";

const TILE = { rings: [60, 60], diamonds: [56, 56], bars: [48, 48], fans: [64, 48] };

function Tile({ pattern, c }) {
  const [a, b, d, e] = c;
  if (pattern === "diamonds")
    return (
      <>
        <rect width="56" height="56" fill={a} />
        <path d="M28 3 53 28 28 53 3 28Z" fill={b} />
        <path d="M28 13 43 28 28 43 13 28Z" fill={d} />
        <circle cx="28" cy="28" r="5" fill={e} />
        {[[0, 0], [56, 0], [0, 56], [56, 56]].map(([x, y]) => (
          <circle key={x + "-" + y} cx={x} cy={y} r="7" fill={d} />
        ))}
      </>
    );
  if (pattern === "bars")
    return (
      <>
        <rect width="48" height="48" fill={a} />
        <rect width="14" height="48" fill={b} />
        <rect x="18" width="5" height="48" fill={d} />
        <rect x="27" width="3" height="48" fill={e} />
        <rect x="34" y="6" width="10" height="10" fill={e} />
        <rect x="34" y="32" width="10" height="10" fill={b} />
      </>
    );
  if (pattern === "fans")
    return (
      <>
        <rect width="64" height="48" fill={a} />
        <circle cx="32" cy="48" r="34" fill={b} />
        <circle cx="32" cy="48" r="26" fill={d} />
        <circle cx="32" cy="48" r="18" fill={e} />
        <circle cx="32" cy="48" r="10" fill={b} />
        <circle cx="32" cy="48" r="4" fill={a} />
        {[0, 64].map((x) => (
          <g key={x}>
            <circle cx={x} cy="0" r="20" fill={d} />
            <circle cx={x} cy="0" r="12" fill={e} />
            <circle cx={x} cy="0" r="6" fill={b} />
          </g>
        ))}
      </>
    );
  // rings (default)
  return (
    <>
      <rect width="60" height="60" fill={a} />
      <circle cx="30" cy="30" r="27" fill={b} />
      <circle cx="30" cy="30" r="19" fill={d} />
      <circle cx="30" cy="30" r="11" fill={e} />
      <circle cx="30" cy="30" r="4" fill={a} />
      {[[0, 0], [60, 0], [0, 60], [60, 60]].map(([x, y]) => (
        <circle key={x + "-" + y} cx={x} cy={y} r="9" fill={d} />
      ))}
    </>
  );
}

const GARMENT =
  "M152 38 Q200 92 248 38 L304 58 L368 196 L322 222 L296 156 L304 516 Q200 546 96 516 L104 156 L78 222 L32 196 L96 58 Z";

/** Procedurally drawn Ankara kaftan. If variant.image is set, the photo is shown instead. */
export default function ProductArt({ variant, className = "" }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (variant.image) {
    const imageScale = Math.min(175, Math.max(100, Number(variant.imageScale) || 100));
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={variant.image} alt={variant.name} draggable={false} style={{ scale: imageScale / 100 }} className={`object-contain drop-shadow-[0_22px_28px_rgba(0,0,0,0.45)] ${className}`} />;
  }

  const pal = variant.palette?.length >= 4 ? variant.palette : ["#E8A317", "#C2410C", "#1F2A44", "#FFF3D6"];
  const [tw, th] = TILE[variant.pattern] || TILE.rings;
  const pat = `pat${uid}`;
  const shade = `shade${uid}`;
  const shadow = `shadow${uid}`;

  return (
    <svg viewBox="0 0 400 570" role="img" aria-label={`${variant.name} Ankara kaftan`} className={className}>
      <defs>
        <pattern id={pat} width={tw} height={th} patternUnits="userSpaceOnUse" patternTransform="scale(1.15) rotate(6)">
          <Tile pattern={variant.pattern} c={pal} />
        </pattern>
        <linearGradient id={shade} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
        <filter id={shadow} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="22" stdDeviation="16" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter={`url(#${shadow})`}>
        <path d={GARMENT} fill={`url(#${pat})`} />
      </g>
      <path d={GARMENT} fill={`url(#${shade})`} />
      {/* folds */}
      <g fill="none" stroke="#000" strokeOpacity="0.14" strokeWidth="2.5" strokeLinecap="round">
        <path d="M140 170 Q132 340 126 512" />
        <path d="M262 170 Q270 340 276 512" />
        <path d="M96 62 L104 156" />
        <path d="M304 62 L296 156" />
      </g>
      {/* neckline, placket, hem trim */}
      <path d="M152 38 Q200 92 248 38 Q200 66 152 38Z" fill="#000" fillOpacity="0.55" />
      <path d="M200 84 L200 360" stroke="#000" strokeOpacity="0.22" strokeWidth="2" />
      {[110, 150, 190, 230].map((y) => (
        <circle key={y} cx="200" cy={y} r="3.5" fill={pal[3]} fillOpacity="0.9" />
      ))}
      <path d="M99 506 Q200 534 301 506" fill="none" stroke={pal[3]} strokeWidth="7" strokeLinecap="round" />
      <path d="M36 193 L78 217 M364 193 L322 217" stroke={pal[3]} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/** Square pattern swatch used in the story section. */
export function Swatch({ variant, className = "" }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pal = variant.palette?.length >= 4 ? variant.palette : ["#E8A317", "#C2410C", "#1F2A44", "#FFF3D6"];
  const [tw, th] = TILE[variant.pattern] || TILE.rings;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`${variant.name} pattern`} className={className}>
      <defs>
        <pattern id={`sw${uid}`} width={tw} height={th} patternUnits="userSpaceOnUse" patternTransform="scale(1.3) rotate(6)">
          <Tile pattern={variant.pattern} c={pal} />
        </pattern>
      </defs>
      <rect width="200" height="200" rx="22" fill={`url(#sw${uid})`} />
    </svg>
  );
}
