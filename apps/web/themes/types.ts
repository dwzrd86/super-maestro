/**
 * Super Maestro Theme System
 * 4 themes inspired by retro gaming worlds.
 */

export type ThemeName = 'classic' | 'modern' | 'dark-world' | 'underground';

export interface ThemeColors {
  // Primary brand
  primary: string;
  primaryHover: string;
  primaryMuted: string;
  accent: string;
  accentHover: string;

  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgCardHover: string;
  bgSidebar: string;

  // Borders
  border: string;
  borderMuted: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Status
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;

  // Game-specific
  coinGold: string;
  starYellow: string;
  pipeGreen: string;
  powerRed: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  colors: ThemeColors;
  fontHeading: string;
  fontBody: string;
}
