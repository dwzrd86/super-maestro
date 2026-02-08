import { Theme } from './types';

/**
 * Modern Theme — Clean professional dashboard (current AgentForge look evolved).
 */
export const modernTheme: Theme = {
  name: 'modern',
  label: 'Modern',
  description: 'Clean professional dashboard with subtle game accents',
  colors: {
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryMuted: '#DBEAFE',
    accent: '#8B5CF6',
    accentHover: '#7C3AED',

    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    bgCard: '#ffffff',
    bgCardHover: '#f1f5f9',
    bgSidebar: '#ffffff',

    border: '#e2e8f0',
    borderMuted: '#f1f5f9',

    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',

    success: '#22c55e',
    successBg: '#f0fdf4',
    warning: '#eab308',
    warningBg: '#fefce8',
    error: '#ef4444',
    errorBg: '#fef2f2',
    info: '#3b82f6',
    infoBg: '#eff6ff',

    coinGold: '#ECC94B',
    starYellow: '#FBBF24',
    pipeGreen: '#22c55e',
    powerRed: '#ef4444',
  },
  fontHeading: "'Inter', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif",
};
