/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        gold:     'var(--gold)',
        'gold-soft': 'var(--gold-soft)',
        'gold-pale': 'var(--gold-pale)',
        ink:      'var(--ink)',
        muted:    'var(--muted)',
        subtle:   'var(--subtle)',
        surface:  'var(--surface)',
        'bg-warm': 'var(--bg-warm)',
      },
      borderRadius: {
        'xl':  'var(--r-xl)',
        '2xl': 'var(--r-lg)',
        '3xl': '36px',
        '4xl': '48px',
      },
      animation: {
        'fade-up':  'fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':  'fadeIn 0.5s ease both',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
