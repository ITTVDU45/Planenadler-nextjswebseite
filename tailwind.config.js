/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-playfair)', 'ui-serif', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'hero-background': "url('/images/hero.jpg')",
      },
      keyframes: {
        'choice-check-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '55%': { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'choice-check-pop':
          'choice-check-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
    },
  },
  plugins: [],
};
