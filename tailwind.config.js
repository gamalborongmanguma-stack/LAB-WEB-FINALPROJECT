module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#0a0b0e',
        panel: '#13151a',
        line: '#272b34',
        silver: { 100: '#f1f3f6', 200: '#e0e3e8', 300: '#c9cdd5', 400: '#9ba1ac', 500: '#6d7480' },
      },
    },
  },
  plugins: [],
};
