import React from 'react';

/**
 * Official GBLI Logo Mark
 * Minimal flat vector — Globe outline + Bold centered Cross + Open Book base
 * Colors: Deep Navy #1E1B4B, Royal Indigo #312E81, Faith Gold #FBBF24
 */
export default function GBLILogo({ size = 96, dark = false }) {
  const c = size / 2;
  const r = size * 0.36;
  const gold = '#FBBF24';
  const navy = '#1E1B4B';

  const globeColor = dark ? gold : navy;
  const crossColor = gold;
  const bookColor = dark ? gold : navy;
  const bookOpacity = dark ? 0.9 : 0.85;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GBLI Logo"
    >
      {/* ── Globe outline circle ── */}
      <circle
        cx={c} cy={c - size * 0.04}
        r={r}
        stroke={globeColor}
        strokeWidth={size * 0.028}
        fill="none"
      />

      {/* Globe equator line */}
      <ellipse
        cx={c} cy={c - size * 0.04}
        rx={r} ry={r * 0.2}
        stroke={globeColor}
        strokeWidth={size * 0.018}
        fill="none"
        opacity={0.55}
      />

      {/* Globe meridian (vertical ellipse) */}
      <ellipse
        cx={c} cy={c - size * 0.04}
        rx={r * 0.5} ry={r}
        stroke={globeColor}
        strokeWidth={size * 0.018}
        fill="none"
        opacity={0.55}
      />

      {/* ── Bold Gold Cross (centered inside globe) ── */}
      {/* Vertical bar */}
      <rect
        x={c - size * 0.038}
        y={c - size * 0.04 - r * 0.62}
        width={size * 0.076}
        height={r * 1.24}
        fill={crossColor}
        rx={size * 0.012}
      />
      {/* Horizontal bar */}
      <rect
        x={c - r * 0.52}
        y={c - size * 0.04 - size * 0.078}
        width={r * 1.04}
        height={size * 0.076}
        fill={crossColor}
        rx={size * 0.012}
      />

      {/* ── Open Book base ── */}
      {/* Left page */}
      <path
        d={`M ${c} ${c + size * 0.32}
            C ${c - r * 0.15} ${c + size * 0.32} ${c - r * 0.65} ${c + size * 0.28} ${c - r * 0.7} ${c + size * 0.46}
            L ${c} ${c + size * 0.46}
            Z`}
        fill={bookColor}
        opacity={bookOpacity}
      />
      {/* Right page */}
      <path
        d={`M ${c} ${c + size * 0.32}
            C ${c + r * 0.15} ${c + size * 0.32} ${c + r * 0.65} ${c + size * 0.28} ${c + r * 0.7} ${c + size * 0.46}
            L ${c} ${c + size * 0.46}
            Z`}
        fill={bookColor}
        opacity={bookOpacity}
      />
      {/* Book spine line */}
      <line
        x1={c} y1={c + size * 0.30}
        x2={c} y2={c + size * 0.47}
        stroke={gold}
        strokeWidth={size * 0.022}
        strokeLinecap="round"
      />
    </svg>
  );
}