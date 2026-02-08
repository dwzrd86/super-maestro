export { classicTheme } from './classic';
export { modernTheme } from './modern';
export { darkWorldTheme } from './dark-world';
export { undergroundTheme } from './underground';
export type { Theme, ThemeName, ThemeColors } from './types';

import { classicTheme } from './classic';
import { modernTheme } from './modern';
import { darkWorldTheme } from './dark-world';
import { undergroundTheme } from './underground';
import { Theme, ThemeName } from './types';

export const themes: Record<ThemeName, Theme> = {
  classic: classicTheme,
  modern: modernTheme,
  'dark-world': darkWorldTheme,
  underground: undergroundTheme,
};

export const themeList: Theme[] = Object.values(themes);
export const DEFAULT_THEME: ThemeName = 'classic';
