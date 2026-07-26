export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          DEFAULT: '#6A0D25',
          dark: '#4A0819',
        },
        // Backgrounds
        bg: {
          primary: '#0F0F10',
          secondary: '#151518',
          card: '#1A1A1D',
        },
        // Borders
        border: {
          light: '#2A2A2E',
        },
        // Text
        text: {
          primary: '#C3C3C3',
          secondary: '#B8B8B8',
        },
        // Chrome/Neutral
        chrome: '#C7C9CC',
        accent: '#B0B5BD',
        // Semantic Colors
        success: '#2ECC71',
        warning: '#F39C12',
        danger: '#E74C3C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'section-title': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'card-title': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label': ['0.75rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4)',
        elevated: '0 10px 30px rgba(0, 0, 0, 0.5)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
