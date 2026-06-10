// Cafe Locco design tokens — derived from the genuine Figma design.
// Source of truth: figma-reference/src/app/components/*.tsx
// Aesthetic: ultra-premium dark hospitality. Signature accent: gold #D4AF37.

export const Colors = {
  background: '#0A0A0A',
  surface: '#171717',
  surfaceElevated: '#252525', // genuine Figma elevated surface

  border: '#2A2A2A',
  borderSubtle: '#1E1E1E',

  // Genuine Cafe Locco gold (Figma: #D4AF37 + rgba(212,175,55,*) glows/borders)
  gold: '#D4AF37',
  goldLight: '#E6C75C',
  goldDark: '#A8862A',
  goldBorder: 'rgba(212, 175, 55, 0.3)',
  goldBorderSoft: 'rgba(212, 175, 55, 0.2)',
  goldGlow: 'rgba(212, 175, 55, 0.15)',

  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8B8', // genuine Figma secondary / silver text
  textMuted: 'rgba(255, 255, 255, 0.5)',

  success: '#4CAF84',
  error: '#E05555',
  warning: '#E0A055',
  info: '#5599E0',

  overlay: 'rgba(0,0,0,0.6)',
  overlayHeavy: 'rgba(0,0,0,0.85)',
} as const;

// Genuine letter-spacing scale used across the Figma screens (uppercase luxury type)
export const Tracking = {
  tight: 0.5,
  normal: 1,
  wide: 2,
  wider: 3,
} as const;

export type ColorKey = keyof typeof Colors;
