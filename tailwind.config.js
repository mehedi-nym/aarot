/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf8ef',
          100: '#d4edd9',
          200: '#adddb8',
          300: '#7ec58d',
          400: '#53a966',
          500: '#378c4a',
          600: '#286f3a',
          700: '#225a31',
          800: '#1d4929',
          900: '#183c23',
        },
        soil: '#6b4f3b',
        mango: '#f5ab35',
        clay: '#fff6ea',
        ink: '#172217',
      },
      boxShadow: {
        soft: '0 18px 55px rgba(31, 63, 39, 0.12)',
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(23,34,23,0.04) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
