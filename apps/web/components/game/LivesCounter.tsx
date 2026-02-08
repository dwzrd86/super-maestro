'use client';

/**
 * LivesCounter — Shows retry budget as hearts/lives.
 */
export function LivesCounter({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`text-sm transition-all ${
            i < current ? 'scale-100' : 'scale-75 opacity-30 grayscale'
          }`}
          style={{ color: i < current ? 'var(--sm-power-red)' : undefined }}
        >
          {i < current ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  );
}
