'use client';

import { useState, useEffect } from 'react';

/**
 * AchievementToast — Popup notification when an achievement is unlocked.
 * Plays the classic "achievement unlocked" slide-in animation.
 */
export function AchievementToast({
  icon,
  name,
  description,
  show,
  onClose,
}: {
  icon: string;
  name: string;
  description: string;
  show: boolean;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-xl px-6 py-4
        transition-all duration-300
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      style={{
        background: 'var(--sm-bg-card)',
        border: '2px solid var(--sm-star-yellow)',
        boxShadow: '0 0 20px var(--sm-star-yellow), 0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Star burst effect */}
      <div className="relative">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl animate-achievement-pop"
          style={{ background: 'var(--sm-warning-bg)' }}
        >
          {icon}
        </div>
        <div className="absolute inset-0 animate-ping rounded-lg opacity-20"
          style={{ background: 'var(--sm-star-yellow)' }}
        />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span
            className="font-heading text-[10px] uppercase tracking-wider"
            style={{ color: 'var(--sm-star-yellow)' }}
          >
            Achievement Unlocked!
          </span>
        </div>
        <p
          className="font-bold"
          style={{ color: 'var(--sm-text-primary)' }}
        >
          {name}
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--sm-text-secondary)' }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * AchievementBadge — Static display of an achievement (earned or locked).
 */
export function AchievementBadge({
  icon,
  name,
  unlocked = false,
}: {
  icon: string;
  name: string;
  unlocked?: boolean;
}) {
  return (
    <div
      className={`
        flex flex-col items-center gap-1 rounded-lg p-2 transition-all
        ${unlocked ? '' : 'opacity-30 grayscale'}
      `}
      title={name}
    >
      <span className="text-xl">{icon}</span>
      <span
        className="text-center text-[9px] leading-tight"
        style={{ color: 'var(--sm-text-secondary)' }}
      >
        {name}
      </span>
    </div>
  );
}
