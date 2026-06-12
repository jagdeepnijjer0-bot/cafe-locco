import { Platform } from 'react-native';

// Cafe Locco typography & spacing — matches the cafelocco.com website + menu PDF,
// which use Helvetica Neue throughout (uppercase, letter-spaced headings).
// iOS uses the native Helvetica Neue; web/Android fall back to a sans stack so
// the brand never renders as serif. Weight is applied via fontWeight in Text.
const HELVETICA = Platform.select({
  ios: 'Helvetica Neue',
  web: 'Helvetica Neue, Helvetica, Arial, sans-serif',
  default: 'sans-serif',
}) as string;

export const Fonts = {
  family: HELVETICA,
  // legacy keys kept so existing imports keep working — all map to Helvetica Neue
  serif: HELVETICA,
  serifBold: HELVETICA,
  body: HELVETICA,
  bodyMedium: HELVETICA,
  bodySemiBold: HELVETICA,
} as const;

export const Weights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;
