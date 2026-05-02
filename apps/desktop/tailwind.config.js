/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        amber: { 500: '#f59e0b', 600: '#d97706' },
        orange: { 500: '#f97316' },
        navy: { DEFAULT: '#2c3e6b', dark: '#1e2d52', deeper: '#0a0f1e' },
        slate: { 500: '#64748b' },
      },
      fontFamily: {
        sora: ['Sora', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Sora', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn: '14px',
        input: '12px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #f59e0b, #f97316)',
        'gradient-navy': 'linear-gradient(180deg, #2c3e6b, #1e2d52)',
      },
    },
  },
  plugins: [],
};
