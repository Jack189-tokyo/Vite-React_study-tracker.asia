/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        study: {
          light: '#C39BFF',
          DEFAULT: '#7C3AED',
          dark: '#5B21B6',
        },
        'study-border-20': '#7C3AED33',
        'study-border-30': '#7C3AED4D',
        'study-border-40': '#7C3AED66',
      },
    },
  },
  plugins: [],
}
