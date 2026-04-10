import React from 'react';

/**
 * Official GBLI Circular Seal — for certificates & formal documents
 * Flat vector, gold + navy only, no gradients
 * Outer ring text: "GLOBAL BIBLICAL LEADERSHIP INSTITUTE"
 * Center: Cross over Globe, Open Book at bottom, EST. 2026
 */
export default function GBLISeal({ size = 160, dark = false }) {
  const c = size / 2;
  const gold = '#FBBF24';
  const navy = '#1E1B4B';

  const bg = dark ? navy : '#FFFBEB';
  const ring = dark ? gold : navy;
  const symbol = dark ? gold : navy;
  const crossColor = gold;
  const bookColor = dark ? gold : navy;

  // Outer radius for text ring
  const outerR = c - size * 0.03;
  const innerR = c - size * 0.14;
  const globeR = size * 0.22;

  // Helper to place text along a circle arc
  function circleText(text, radius, startAngle, sweep) {
    const chars = text.split('');
    const angleStep = sweep / Math.max(chars.length - 1, 1);
    return chars.map((ch, i) => {
      const angle = startAngle + i * angleStep;
      const rad = (angle * Math.PI) / 180;
      const x = c + radius * Math.cos(rad);
      const y = c + radius * Math.sin(rad);
      return (
        <text
          key={i}
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.058}
          fontWeight="700"
          fontFamily="'Montserrat', 'Inter', sans-serif"
          letterSpacing="0.5"
          fill={ring}
          transform={`rotate(${angle + 90}, ${x}, ${y})`}
        >
          {ch}
        </text>
      );
    });
  }

  const topText = 'GLOBAL BIBLICAL LEADERSHIP INSTITUTE';
  const bottomText = '✦  EST. 2026  ✦';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GBLI Official Seal"
    >
      {/* Background */}
      <circle cx={c} cy={c} r={c - 1} fill={bg} />

      {/* Outer ring border (double) */}
      <circle cx={c} cy={c} r={c - size * 0.02} stroke={ring} strokeWidth={size * 0.022} fill="none" />
      <circle cx={c} cy={c} r={c - size * 0.1} stroke={ring} strokeWidth={size * 0.01} fill="none" />

      {/* Top arc text */}
      {circleText(topText, outerR - size * 0.075, -155, 130)}

      {/* Bottom arc text */}
      {circleText(bottomText, outerR - size * 0.075, 35, 110)}

      {/* Decorative dots at 3 & 9 o'clock */}
      <circle cx={c - outerR + size * 0.075} cy={c} r={size * 0.018} fill={gold} />
      <circle cx={c + outerR - size * 0.075} cy={c} r={size * 0.018} fill={gold} />

      {/* ── Globe ── */}
      <circle cx={c} cy={c - size * 0.04} r={globeR} stroke={symbol} strokeWidth={size * 0.022} fill="none" />
      {/* Equator */}
      <ellipse cx={c} cy={c - size * 0.04} rx={globeR} ry={globeR * 0.22} stroke={symbol} strokeWidth={size * 0.014} fill="none" opacity={0.6} />
      {/* Meridian */}
      <ellipse cx={c} cy={c - size * 0.04} rx={globeR * 0.5} ry={globeR} stroke={symbol} strokeWidth={size * 0.014} fill="none" opacity={0.6} />

      {/* ── Bold Cross ── */}
      {/* Vertical */}
      <rect
        x={c - size * 0.033}
        y={c - size * 0.04 - globeR * 0.65}
        width={size * 0.066}
        height={globeR * 1.3}
        fill={crossColor}
        rx={size * 0.01}
      />
      {/* Horizontal */}
      <rect
        x={c - globeR * 0.58}
        y={c - size * 0.04 - size * 0.063}
        width={globeR * 1.16}
        height={size * 0.066}
        fill={crossColor}
        rx={size * 0.01}
      />

      {/* ── Open Book ── */}
      <path
        d={`M ${c} ${c + size * 0.2}
            C ${c - globeR * 0.12} ${c + size * 0.2} ${c - globeR * 0.6} ${c + size * 0.17} ${c - globeR * 0.65} ${c + size * 0.32}
            L ${c} ${c + size * 0.32}
            Z`}
        fill={bookColor}
        opacity={0.85}
      />
      <path
        d={`M ${c} ${c + size * 0.2}
            C ${c + globeR * 0.12} ${c + size * 0.2} ${c + globeR * 0.6} ${c + size * 0.17} ${c + globeR * 0.65} ${c + size * 0.32}
            L ${c} ${c + size * 0.32}
            Z`}
        fill={bookColor}
        opacity={0.85}
      />
      {/* Spine */}
      <line
        x1={c} y1={c + size * 0.18}
        x2={c} y2={c + size * 0.33}
        stroke={gold}
        strokeWidth={size * 0.02}
        strokeLinecap="round"
      />
    </svg>
  );
}