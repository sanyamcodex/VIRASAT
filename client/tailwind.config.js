/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // VIRASAT design tokens (WeaveHand-inspired). Values mirror the
      // CSS variables declared in src/index.css so they stay in sync.
      colors: {
        navy: 'var(--color-navy)', // #1B2A4A — primary / nav
        terracotta: 'var(--color-terracotta)', // #C9622B — accent / CTA
        cream: 'var(--color-cream)', // #F7F2E9 — background
        gold: 'var(--color-gold)', // #C9A24B — highlights / badges
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'], // headings
        body: ['Inter', 'system-ui', 'sans-serif'], // body
      },
    },
  },
  plugins: [],
};
