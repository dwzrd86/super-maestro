import { Theme } from './types';

/**
 * Classic Theme — Full retro pixel aesthetic with 8-bit accents.
 * Primary palette: Red, Gold, Blue, Green from the vision doc.
 */
export const classicTheme: Theme = {
  name: 'classic',
  label: 'Classic',
  description: 'Full retro pixel aesthetic with 8-bit accents',
  colors: {
    primary: '#E53E3E',
    primaryHover: '#C53030',
    primaryMuted: '#FED7D7',
    accent: '#ECC94B',
    accentHover: '#D69E2E',

    bgPrimary: '#1a1a2e',
    bgSecondary: '#16213e',
    bgCard: '#0f3460',
    bgCardHover: '#1a4a7a',
    bgSidebar: '#0a0a1a',

    border: '#2a2a4a',
    borderMuted: '#1a1a3a',

    textPrimary: '#f0f0f0',
    textSecondary: '#a0a0c0',
    textMuted: '#6a6a8a',
    textInverse: '#1a1a2e',

    success: '#48BB78',
    successBg: '#1a3a2a',
    warning: '#ECC94B',
    warningBg: '#3a3a1a',
    error: '#E53E3E',
    errorBg: '#3a1a1a',
    info: '#3B82F6',
    infoBg: '#1a2a3a',

    coinGold: '#ECC94B',
    starYellow: '#FBBF24',
    pipeGreen: '#48BB78',
    powerRed: '#E53E3E',
  },
  fontHeading: "'Press Start 2P', cursive",
  fontBody: "'Inter', system-ui, sans-serif",
};
