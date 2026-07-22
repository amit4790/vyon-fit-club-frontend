/**
 * VYON FIT CLUB - Design Tokens
 * Complete design system configuration
 */

// ============================================================
// COLOR PALETTE
// ============================================================

export const colors = {
  // Primary Brand
  primary: '#6A0D25',
  primaryDark: '#4A0819',

  // Backgrounds
  bgPrimary: '#0F0F10',
  bgSecondary: '#151518',
  bgCard: '#1A1A1D',

  // Borders
  borderLight: '#2A2A2E',

  // Text
  textPrimary: '#F5F5F5',
  textSecondary: '#B8B8B8',

  // Neutral
  chrome: '#C7C9CC',
  accent: '#B0B5BD',

  // Semantic
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
}

// ============================================================
// TYPOGRAPHY
// ============================================================

export const typography = {
  // Font family
  fontFamily: 'Inter, system-ui, sans-serif',

  // Sizes
  pageTitle: {
    size: '2.5rem',
    lineHeight: '1.2',
    weight: 700,
  },
  sectionTitle: {
    size: '1.875rem',
    lineHeight: '1.3',
    weight: 600,
  },
  cardTitle: {
    size: '1.25rem',
    lineHeight: '1.4',
    weight: 600,
  },
  body: {
    size: '1rem',
    lineHeight: '1.5',
    weight: 400,
  },
  caption: {
    size: '0.875rem',
    lineHeight: '1.4',
    weight: 500,
  },
  label: {
    size: '0.75rem',
    lineHeight: '1.3',
    weight: 600,
  },
}

// ============================================================
// SPACING SCALE
// ============================================================

export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '2.5rem',
  '2xl': '3rem',
}

// ============================================================
// BORDER RADIUS
// ============================================================

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
}

// ============================================================
// SHADOWS
// ============================================================

export const shadows = {
  card: '0 1px 3px rgba(0, 0, 0, 0.3)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.4)',
  elevated: '0 10px 30px rgba(0, 0, 0, 0.5)',
}

// ============================================================
// TRANSITIONS
// ============================================================

export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
}

// ============================================================
// BREAKPOINTS (Responsive Design)
// ============================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// ============================================================
// COMPONENT VARIANTS
// ============================================================

export const buttonVariants = {
  primary: 'bg-primary text-white hover:bg-primaryDark',
  secondary: 'bg-bgCard text-textPrimary border border-borderLight hover:bg-bgSecondary',
  outline: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white',
  danger: 'bg-danger text-white hover:bg-red-700',
}

export const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-base',
}

export const badgeVariants = {
  active: 'bg-success bg-opacity-20 text-success',
  expired: 'bg-danger bg-opacity-20 text-danger',
  pending: 'bg-warning bg-opacity-20 text-warning',
  success: 'bg-success bg-opacity-20 text-success',
}

// ============================================================
// Z-INDEX SCALE
// ============================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  backdrop: 40,
  offcanvas: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
}

// ============================================================
// DESIGN SYSTEM EXPORT
// ============================================================

export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  buttonVariants,
  buttonSizes,
  badgeVariants,
  zIndex,
}

export default designSystem
