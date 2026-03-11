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
    },
  },
  plugins: [],
};
