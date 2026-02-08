'use client';

import { useState, useEffect } from 'react';

/**
 * CoinCounter — Displays token/cost usage as collectible coins.
 * Animates when the count changes (coin flip effect).
 */
export function CoinCounter({ count, label = 'Coins' }: { count: number; label?: string }) {
  const [displayCount, setDisplayCount] = useState(count);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (count !== displayCount) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayCount(count);
        setAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [count, displayCount]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          flex h-6 w-6 items-center justify-center rounded-full text-sm
          ${animating ? 'animate-coin-spin' : ''}
        `}
        style={{
          background: 'var(--sm-coin-gold)',
          color: 'var(--sm-text-inverse)',
          boxShadow: '0 0 6px var(--sm-coin-gold)',
        }}
      >
        $
      </div>
      <span
        className="font-heading text-xs tabular-nums"
        style={{ color: 'var(--sm-coin-gold)' }}
      >
        {displayCount.toLocaleString()}
      </span>
      <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
        {label}
      </span>
    </div>
  );
}
