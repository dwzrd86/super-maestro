'use client';

/**
 * PowerUpBadge — Displays an agent skill as a collectible power-up.
 * Rarity affects the glow and border style.
 */
export function PowerUpBadge({
  name,
  icon,
  rarity = 'common',
  equipped = false,
}: {
  name: string;
  icon: string;
  rarity?: 'common' | 'rare' | 'legendary';
  equipped?: boolean;
}) {
  const rarityStyles = {
    common: {
      border: 'var(--sm-border)',
      glow: 'none',
      label: 'Common',
    },
    rare: {
      border: 'var(--sm-info)',
      glow: '0 0 8px var(--sm-info)',
      label: 'Rare',
    },
    legendary: {
      border: 'var(--sm-star-yellow)',
      glow: '0 0 12px var(--sm-star-yellow)',
      label: 'Legendary',
    },
  };

  const style = rarityStyles[rarity];

  return (
    <div
      className={`
        relative flex flex-col items-center gap-1.5 rounded-lg p-3 transition-all duration-200
        ${equipped ? 'ring-2 ring-offset-2' : ''}
        hover:scale-105 cursor-pointer
      `}
      style={{
        background: 'var(--sm-bg-card)',
        border: `2px solid ${style.border}`,
        boxShadow: style.glow,
      }}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className="text-center text-[10px] font-medium leading-tight"
        style={{ color: 'var(--sm-text-primary)' }}
      >
        {name}
      </span>
      <span
        className="text-[8px] uppercase tracking-wider"
        style={{ color: style.border }}
      >
        {style.label}
      </span>
      {equipped && (
        <div
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px]"
          style={{ background: 'var(--sm-success)', color: 'var(--sm-text-inverse)' }}
        >
          E
        </div>
      )}
    </div>
  );
}
