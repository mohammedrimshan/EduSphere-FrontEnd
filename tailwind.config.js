// tailwind.config.js
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'spin-fast': 'spin 0.8s linear infinite',
        'progress': 'progress 1.5s ease-in-out infinite',
        'modal-enter': 'modal-enter 0.2s ease-out',
      },
      screens: {
        'forced-colors': { raw: '(forced-colors: active)' }
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '50%': { width: '70%' },
          '100%': { width: '100%' },
        },
        'modal-enter': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};
