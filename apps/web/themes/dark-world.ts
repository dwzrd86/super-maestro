import { Theme } from './types';

/**
 * Dark World Theme — Dark mode with neon pixel accents.
 * Inspired by underground castle levels with glowing elements.
 */
export const darkWorldTheme: Theme = {
  name: 'dark-world',
  label: 'Dark World',
  description: 'Dark mode with neon pixel accents',
  colors: {
    primary: '#a855f7',
    primaryHover: '#9333ea',
    primaryMuted: '#3b0764',
    accent: '#06b6d4',
    accentHover: '#0891b2',

    bgPrimary: '#09090b',
    bgSecondary: '#18181b',
    bgCard: '#1c1c22',
    bgCardHover: '#27272a',
    bgSidebar: '#09090b',

    border: '#27272a',
    borderMuted: '#1c1c22',

    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#52525b',
    textInverse: '#09090b',

    success: '#4ade80',
    successBg: '#052e16',
    warning: '#facc15',
    warningBg: '#422006',
    error: '#f87171',
    errorBg: '#450a0a',
    info: '#38bdf8',
    infoBg: '#082f49',

    coinGold: '#facc15',
    starYellow: '#fde047',
    pipeGreen: '#4ade80',
    powerRed: '#f87171',
  },
  fontHeading: "'Press Start 2P', cursive",
  fontBody: "'Inter', system-ui, sans-serif",
};
