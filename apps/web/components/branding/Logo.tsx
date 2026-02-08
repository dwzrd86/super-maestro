'use client';

/**
 * Super Maestro Logo — Pixel star + conductor baton motif.
 * Pure SVG, no external assets needed.
 */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Background block */}
      <rect width="32" height="32" rx="6" fill="var(--sm-primary)" />

      {/* Pixel Star */}
      <rect x="14" y="6" width="4" height="4" fill="var(--sm-star-yellow)" />
      <rect x="10" y="10" width="4" height="4" fill="var(--sm-star-yellow)" />
      <rect x="14" y="10" width="4" height="4" fill="var(--sm-star-yellow)" />
      <rect x="18" y="10" width="4" height="4" fill="var(--sm-star-yellow)" />
      <rect x="14" y="14" width="4" height="4" fill="var(--sm-star-yellow)" />
      <rect x="6" y="10" width="4" height="4" fill="var(--sm-star-yellow)" opacity="0.7" />
      <rect x="22" y="10" width="4" height="4" fill="var(--sm-star-yellow)" opacity="0.7" />

      {/* Baton diagonal */}
      <rect x="11" y="18" width="3" height="3" fill="white" rx="0.5" />
      <rect x="14" y="21" width="3" height="3" fill="white" rx="0.5" />
      <rect x="17" y="24" width="3" height="3" fill="white" rx="0.5" />

      {/* Baton tip glow */}
      <rect x="8" y="15" width="3" height="3" fill="white" opacity="0.8" rx="0.5" />
    </svg>
  );
}

/**
 * Super Maestro "SM" Monogram — 8-bit pixel style.
 */
export function LogoMonogram({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="4" fill="var(--sm-primary)" />
      {/* S pixel letter */}
      <rect x="3" y="5" width="2" height="2" fill="white" />
      <rect x="5" y="5" width="2" height="2" fill="white" />
      <rect x="7" y="5" width="2" height="2" fill="white" />
      <rect x="3" y="7" width="2" height="2" fill="white" />
      <rect x="3" y="9" width="2" height="2" fill="white" />
      <rect x="5" y="9" width="2" height="2" fill="white" />
      <rect x="7" y="9" width="2" height="2" fill="white" />
      <rect x="7" y="11" width="2" height="2" fill="white" />
      <rect x="3" y="13" width="2" height="2" fill="white" />
      <rect x="5" y="13" width="2" height="2" fill="white" />
      <rect x="7" y="13" width="2" height="2" fill="white" />
      {/* M pixel letter */}
      <rect x="11" y="5" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="11" y="7" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="11" y="9" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="11" y="11" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="11" y="13" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="13" y="7" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="15" y="9" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="17" y="7" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="19" y="5" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="19" y="7" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="19" y="9" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="19" y="11" width="2" height="2" fill="var(--sm-star-yellow)" />
      <rect x="19" y="13" width="2" height="2" fill="var(--sm-star-yellow)" />
    </svg>
  );
}
