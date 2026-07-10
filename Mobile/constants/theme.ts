/**
 * FloraX Premium Design System
 * Unified dark-mode color palette and design tokens
 */

import { Platform } from 'react-native';

// ──────────────────────────────────────────────
//  Core Palette
// ──────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  bg: {
    primary:   '#080d10',   // deep navy-black
    card:      '#0f1923',   // dark card
    elevated:  '#131f2a',   // slightly lighter card
    surface:   '#1a2a38',   // surface elements
    glass:     'rgba(255,255,255,0.04)',
  },
  // Brand – Emerald Green
  brand: {
    50:  '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Accent – Sky Blue
  accent: {
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
  },
  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  danger:  '#ef4444',
  // Text
  text: {
    primary:   '#e2e8f0',
    secondary: '#94a3b8',
    muted:     '#475569',
    inverse:   '#080d10',
  },
  // Borders
  border: {
    subtle:  'rgba(255,255,255,0.06)',
    default: 'rgba(255,255,255,0.10)',
    accent:  '#10b981',
  },
};

// For expo-router / Colors import compat
export const Colors = {
  light: {
    text:             COLORS.text.primary,
    background:       COLORS.bg.primary,
    tint:             COLORS.brand[500],
    icon:             COLORS.text.secondary,
    tabIconDefault:   COLORS.text.muted,
    tabIconSelected:  COLORS.brand[500],
  },
  dark: {
    text:             COLORS.text.primary,
    background:       COLORS.bg.primary,
    tint:             COLORS.brand[500],
    icon:             COLORS.text.secondary,
    tabIconDefault:   COLORS.text.muted,
    tabIconSelected:  COLORS.brand[500],
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
