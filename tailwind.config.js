/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './html/**/*.html', './*.js', './js/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Ubuntu', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
