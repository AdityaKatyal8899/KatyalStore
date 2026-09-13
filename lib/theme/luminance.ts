/**
 * KatyalStore Ambient Luminance Theme Engine
 * Provides continuous mathematical interpolation of UI color variables
 * from 0% (OLED Void) to 100% (Daylight Cream).
 */

export interface ThemeTier {
  percentage: number;
  label: string;
  icon: string;
  bg: [number, number, number];
  surface: [number, number, number];
  surfaceElevated: [number, number, number];
  textPrimary: [number, number, number];
  textSecondary: [number, number, number];
  border: [number, number, number];
  shadow: string;
  gridAlpha: number;
  gridDark: boolean;
  isDark: boolean;
}

export const THEME_TIERS: ThemeTier[] = [
  {
    percentage: 0,
    label: 'OLED Void',
    icon: '🌑',
    bg: [6, 8, 12],
    surface: [16, 20, 28],
    surfaceElevated: [24, 30, 42],
    textPrimary: [248, 250, 252],
    textSecondary: [148, 163, 184],
    border: [60, 70, 88],
    shadow: '0 0 0 0 rgba(0,0,0,0)',
    gridAlpha: 0.05,
    gridDark: false,
    isDark: true,
  },
  {
    percentage: 25,
    label: 'Midnight Slate',
    icon: '🌘',
    bg: [15, 20, 30],
    surface: [26, 34, 48],
    surfaceElevated: [38, 48, 68],
    textPrimary: [241, 245, 249],
    textSecondary: [148, 163, 184],
    border: [75, 88, 112],
    shadow: '4px 4px 0px 0px rgba(0,0,0,0.8)',
    gridAlpha: 0.06,
    gridDark: false,
    isDark: true,
  },
  {
    percentage: 50,
    label: 'Charcoal Dusk',
    icon: '🌗',
    bg: [36, 42, 54],
    surface: [48, 56, 72],
    surfaceElevated: [64, 74, 95],
    textPrimary: [255, 255, 255],
    textSecondary: [203, 213, 225],
    border: [100, 116, 139],
    shadow: '4px 4px 0px 0px rgba(0,0,0,0.7)',
    gridAlpha: 0.08,
    gridDark: false,
    isDark: true,
  },
  {
    percentage: 75,
    label: 'Warm Sepia',
    icon: '🌖',
    bg: [233, 226, 213],
    surface: [246, 241, 230],
    surfaceElevated: [253, 250, 244],
    textPrimary: [20, 20, 20],
    textSecondary: [75, 85, 99],
    border: [30, 30, 30],
    shadow: '4px 4px 0px 0px #1e1e1e',
    gridAlpha: 0.05,
    gridDark: true,
    isDark: false,
  },
  {
    percentage: 100,
    label: 'Daylight Cream',
    icon: '☀️',
    bg: [253, 251, 247],
    surface: [255, 255, 255],
    surfaceElevated: [255, 255, 255],
    textPrimary: [0, 0, 0],
    textSecondary: [55, 65, 81],
    border: [0, 0, 0],
    shadow: '4px 4px 0px 0px #000000',
    gridAlpha: 0.05,
    gridDark: true,
    isDark: false,
  },
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

function rgbStr(c: [number, number, number]): string {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function getTierForPercentage(percentage: number): ThemeTier {
  const clamped = Math.max(0, Math.min(100, percentage));
  if (clamped <= 12) return THEME_TIERS[0];
  if (clamped <= 37) return THEME_TIERS[1];
  if (clamped <= 62) return THEME_TIERS[2];
  if (clamped <= 87) return THEME_TIERS[3];
  return THEME_TIERS[4];
}

export function computeThemeValues(percentage: number) {
  const p = Math.max(0, Math.min(100, percentage));

  // Find surrounding tiers
  let lowerTier = THEME_TIERS[0];
  let upperTier = THEME_TIERS[THEME_TIERS.length - 1];

  for (let i = 0; i < THEME_TIERS.length - 1; i++) {
    if (p >= THEME_TIERS[i].percentage && p <= THEME_TIERS[i + 1].percentage) {
      lowerTier = THEME_TIERS[i];
      upperTier = THEME_TIERS[i + 1];
      break;
    }
  }

  const range = upperTier.percentage - lowerTier.percentage;
  const t = range === 0 ? 0 : (p - lowerTier.percentage) / range;

  const bg = lerpColor(lowerTier.bg, upperTier.bg, t);
  const surface = lerpColor(lowerTier.surface, upperTier.surface, t);
  const surfaceElevated = lerpColor(lowerTier.surfaceElevated, upperTier.surfaceElevated, t);
  const textPrimary = lerpColor(lowerTier.textPrimary, upperTier.textPrimary, t);
  const textSecondary = lerpColor(lowerTier.textSecondary, upperTier.textSecondary, t);
  const border = lerpColor(lowerTier.border, upperTier.border, t);

  const isDark = p < 65;
  const gridAlpha = lowerTier.gridAlpha + (upperTier.gridAlpha - lowerTier.gridAlpha) * t;
  const gridRgb = isDark ? '255, 255, 255' : '0, 0, 0';
  const gridColor = `rgba(${gridRgb}, ${gridAlpha.toFixed(3)})`;
  
  const shadowColor = isDark 
    ? `rgba(0, 0, 0, ${(0.6 + (1 - p / 100) * 0.3).toFixed(2)})` 
    : 'rgba(0, 0, 0, 1)';

  return {
    percentage: p,
    isDark,
    bg: rgbStr(bg),
    surface: rgbStr(surface),
    surfaceElevated: rgbStr(surfaceElevated),
    textPrimary: rgbStr(textPrimary),
    textSecondary: rgbStr(textSecondary),
    border: rgbStr(border),
    gridColor,
    shadowColor,
    tier: getTierForPercentage(p),
  };
}

export const STORAGE_KEY = 'katyalstore_luminance';

export function applyLuminance(percentage: number) {
  if (typeof window === 'undefined') return;

  const values = computeThemeValues(percentage);
  const root = document.documentElement;

  root.style.setProperty('--theme-bg', values.bg);
  root.style.setProperty('--theme-surface', values.surface);
  root.style.setProperty('--theme-surface-elevated', values.surfaceElevated);
  root.style.setProperty('--theme-text-primary', values.textPrimary);
  root.style.setProperty('--theme-text-secondary', values.textSecondary);
  root.style.setProperty('--theme-border', values.border);
  root.style.setProperty('--theme-grid-color', values.gridColor);
  root.style.setProperty('--theme-shadow-color', values.shadowColor);
  root.style.setProperty('--theme-luminance', `${values.percentage}%`);

  if (values.isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme-mode', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme-mode', 'light');
  }

  try {
    localStorage.setItem(STORAGE_KEY, percentage.toString());
  } catch {
    // ignore quota/security errors
  }
}

export function getSavedLuminance(): number {
  if (typeof window === 'undefined') return 100;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return 100;
}
