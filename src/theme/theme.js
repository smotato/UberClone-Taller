// AI-assisted: see docs/AI_LOG.md #3

export const colors = {
  // Brand
  primary: '#000000',
  primaryPressed: '#1F1F1F',
  textOnPrimary: '#FFFFFF',
  accent: '#276EF1',
  accentSoft: '#E8F0FE',

  // Surfaces
  background: '#F6F6F6',
  surface: '#FFFFFF',
  surfaceMuted: '#EEEEEE',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Text
  text: '#101010',
  textSecondary: '#545454',
  textMuted: '#8A8A8A',
  textDisabled: '#B5B5B5',

  // Borders
  border: '#E2E2E2',
  borderStrong: '#CFCFCF',

  // Disabled controls
  disabledBackground: '#E8E8E8',

  // Feedback
  success: '#05944F',
  successSoft: '#E6F4EA',
  warning: '#FFC043',
  warningSoft: '#FFF4D6',
  error: '#E11900',
  errorSoft: '#FDECEA',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
}

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
}

const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
}

const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
}

export const typography = {
  fontSize,
  fontWeight,

  // Ready-to-spread text presets: <Text style={typography.title}>
  display: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.heavy,
    lineHeight: 40,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: 22,
  },
  bodyStrong: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: 22,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: 18,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: 16,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    lineHeight: 16,
    letterSpacing: 1,
  },
  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.heavy,
    lineHeight: 20,
  },
}

// Shadows include elevation for Android and shadow* props for iOS
export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
}

// Fixed component sizes shared across screens
export const sizes = {
  inputHeight: 52,
  buttonHeight: 52,
  iconSm: 20,
  iconMd: 24,
  iconLg: 34,
  avatarLg: 96,
}

export default { colors, spacing, radius, typography, shadows, sizes }