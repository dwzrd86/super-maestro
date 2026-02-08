'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { themes, DEFAULT_THEME } from '@/themes';
import type { Theme, ThemeName } from '@/themes/types';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

function applyThemeCSS(theme: Theme) {
  const root = document.documentElement;
  const c = theme.colors;

  root.style.setProperty('--sm-primary', c.primary);
  root.style.setProperty('--sm-primary-hover', c.primaryHover);
  root.style.setProperty('--sm-primary-muted', c.primaryMuted);
  root.style.setProperty('--sm-accent', c.accent);
  root.style.setProperty('--sm-accent-hover', c.accentHover);

  root.style.setProperty('--sm-bg-primary', c.bgPrimary);
  root.style.setProperty('--sm-bg-secondary', c.bgSecondary);
  root.style.setProperty('--sm-bg-card', c.bgCard);
  root.style.setProperty('--sm-bg-card-hover', c.bgCardHover);
  root.style.setProperty('--sm-bg-sidebar', c.bgSidebar);

  root.style.setProperty('--sm-border', c.border);
  root.style.setProperty('--sm-border-muted', c.borderMuted);

  root.style.setProperty('--sm-text-primary', c.textPrimary);
  root.style.setProperty('--sm-text-secondary', c.textSecondary);
  root.style.setProperty('--sm-text-muted', c.textMuted);
  root.style.setProperty('--sm-text-inverse', c.textInverse);

  root.style.setProperty('--sm-success', c.success);
  root.style.setProperty('--sm-success-bg', c.successBg);
  root.style.setProperty('--sm-warning', c.warning);
  root.style.setProperty('--sm-warning-bg', c.warningBg);
  root.style.setProperty('--sm-error', c.error);
  root.style.setProperty('--sm-error-bg', c.errorBg);
  root.style.setProperty('--sm-info', c.info);
  root.style.setProperty('--sm-info-bg', c.infoBg);

  root.style.setProperty('--sm-coin-gold', c.coinGold);
  root.style.setProperty('--sm-star-yellow', c.starYellow);
  root.style.setProperty('--sm-pipe-green', c.pipeGreen);
  root.style.setProperty('--sm-power-red', c.powerRed);

  root.style.setProperty('--sm-font-heading', theme.fontHeading);
  root.style.setProperty('--sm-font-body', theme.fontBody);

  // Set data attribute for CSS targeting
  root.setAttribute('data-theme', theme.name);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem('sm-theme') as ThemeName | null;
    if (saved && themes[saved]) {
      setThemeName(saved);
    }
  }, []);

  useEffect(() => {
    applyThemeCSS(themes[themeName]);
  }, [themeName]);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem('sm-theme', name);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
