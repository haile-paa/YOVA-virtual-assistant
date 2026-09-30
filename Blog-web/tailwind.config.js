/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1c1510', bg1: '#261d16', bg2: '#31261d',
        line: 'rgba(246,236,221,0.10)', line2: 'rgba(246,236,221,0.20)',
        cream: '#f6ecdd', muted: '#b5a695', muted2: '#7d6f60',
        amber: '#f4b942', amber2: '#d58a1f', ink: '#2a1c0c',
      },
      fontFamily: {
        disp: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: { cta: 'linear-gradient(100deg,#f4c04a 0%,#d58a1f 100%)' },
      boxShadow: { glow: '0 8px 28px -8px rgba(244,185,66,0.5)' },
      maxWidth: { wrap: '1160px' },
      keyframes: { marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } } },
      animation: { marquee: 'marquee 40s linear infinite' },
    },
  },
  plugins: [],
}
