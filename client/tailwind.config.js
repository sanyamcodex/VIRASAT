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
        // Supporting neutrals — text hierarchy
        charcoal: 'var(--color-charcoal)', // #2B2B2B — body text
        stone: 'var(--color-stone)', // #8B8B8B — muted text / borders
        // Sparing accent — badges / success states only
        forest: 'var(--color-forest)', // #355E3B — success / verified
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'], // headings
        body: ['Inter', 'system-ui', 'sans-serif'], // body
      },
      // Editorial spacing scale — generous, rhythmic whitespace
      spacing: {
        18: '4.5rem', // 72px
        22: '5.5rem', // 88px
        26: '6.5rem', // 104px
        30: '7.5rem', // 120px
      },
      // Softer, premium corner radii
      borderRadius: {
        card: '0.875rem', // 14px — product / story cards
        pill: '9999px', // badges, chips, CTAs
      },
      // Warm, layered elevation tokens (mirror src/index.css)
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        polaroid: 'var(--shadow-polaroid)',
      },
    },
  },
  plugins: [],
};
