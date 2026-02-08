'use client';

import { useTheme } from './ThemeProvider';
import { themeList } from '@/themes';

/**
 * ThemeToggle — Lets users switch between Super Maestro themes.
 * Shows theme options as pixel-styled selection cards.
 */
export function ThemeToggle() {
  const { themeName, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      {themeList.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          title={t.description}
          className={`
            relative flex h-8 w-8 items-center justify-center rounded-lg
            border-2 transition-all duration-200
            ${themeName === t.name
              ? 'border-[var(--sm-primary)] shadow-[0_0_8px_var(--sm-primary)]'
              : 'border-[var(--sm-border)] hover:border-[var(--sm-text-muted)]'
            }
          `}
          style={{ background: t.colors.bgPrimary }}
        >
          <div
            className="h-4 w-4 rounded-sm"
            style={{ background: t.colors.primary }}
          />
          {themeName === t.name && (
            <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--sm-star-yellow)]" />
          )}
        </button>
      ))}
    </div>
  );
}
