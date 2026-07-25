/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        'brand-gold': '#d4af37',
        'travel-gold': '#D4AF37',
        'travel-ocean': '#0A4D68',
        'travel-teal': '#088395',
        'travel-white': '#FEFEFE',
        'travel-orange': '#FF6B35',
      },
    },
  },
  plugins: [],
};
