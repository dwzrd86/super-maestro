'use client';

/**
 * ProgressPipe — A progress bar styled as a game pipe.
 * Used for task completion, level progress, etc.
 */
export function ProgressPipe({
  progress,
  label,
  showPercent = true,
}: {
  progress: number;
  label?: string;
  showPercent?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between">
          <span className="text-xs" style={{ color: 'var(--sm-text-secondary)' }}>
            {label}
          </span>
          {showPercent && (
            <span className="font-heading text-[10px]" style={{ color: 'var(--sm-pipe-green)' }}>
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className="h-3 w-full overflow-hidden rounded-full"
        style={{
          background: 'var(--sm-bg-secondary)',
          border: '1px solid var(--sm-border)',
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background: clamped === 100
              ? 'var(--sm-star-yellow)'
              : 'var(--sm-pipe-green)',
            boxShadow: clamped > 0
              ? `0 0 8px ${clamped === 100 ? 'var(--sm-star-yellow)' : 'var(--sm-pipe-green)'}`
              : 'none',
          }}
        />
      </div>
    </div>
  );
}
