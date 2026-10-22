/** @type {import('tailwindcss').Config} */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.js'],
  theme: {
    extend: {
      colors: {
        base: v('base'), surface: v('surface'), raised: v('raised'), line: v('line'),
        ink: v('ink'), body: v('body'), muted: v('muted'),
        signal: v('signal'), amber: v('amber'), good: v('good'), bad: v('bad'),
      },
      fontFamily: {
        display: ['var(--f-display, "Bricolage Grotesque")', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['var(--f-body, "Instrument Sans")', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: { shell: '1240px' },
      borderRadius: { '4xl': '2rem' },
      transitionTimingFunction: { out: 'cubic-bezier(.16,1,.3,1)' },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: .35 } },
      },
      animation: { marquee: 'marquee 40s linear infinite', pulseDot: 'pulseDot 2s ease-in-out infinite' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
