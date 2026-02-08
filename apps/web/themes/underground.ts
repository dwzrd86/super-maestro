import { Theme } from './types';

/**
 * Underground Theme — Terminal-focused, green-on-black.
 * For the hacker-minded user who lives in the terminal.
 */
export const undergroundTheme: Theme = {
  name: 'underground',
  label: 'Underground',
  description: 'Terminal-focused, green-on-black hacker aesthetic',
  colors: {
    primary: '#22c55e',
    primaryHover: '#16a34a',
    primaryMuted: '#052e16',
    accent: '#22c55e',
    accentHover: '#16a34a',

    bgPrimary: '#000000',
    bgSecondary: '#0a0a0a',
    bgCard: '#0f0f0f',
    bgCardHover: '#1a1a1a',
    bgSidebar: '#000000',

    border: '#1a2e1a',
    borderMuted: '#0f1a0f',

    textPrimary: '#22c55e',
    textSecondary: '#16a34a',
    textMuted: '#0d5c2a',
    textInverse: '#000000',

    success: '#4ade80',
    successBg: '#052e16',
    warning: '#fbbf24',
    warningBg: '#1a1a00',
    error: '#ef4444',
    errorBg: '#1a0000',
    info: '#22c55e',
    infoBg: '#001a0a',

    coinGold: '#fbbf24',
    starYellow: '#fbbf24',
    pipeGreen: '#4ade80',
    powerRed: '#ef4444',
  },
  fontHeading: "var(--font-mono), 'JetBrains Mono', monospace",
  fontBody: "var(--font-mono), 'JetBrains Mono', monospace",
};
