/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1e3a5f',
          50: '#f0f5fa',
          100: '#e1ecf6',
          200: '#c5d9ee',
          300: '#99bddf',
          400: '#6497cc',
          500: '#3d77b5',
          600: '#2b5f97',
          700: '#244c79',
          800: '#1e3a5f',
          900: '#152d4a',
          950: '#0d1d31',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#2f588f',
          700: '#254773',
          800: '#1b3455',
          850: '#172d4a',
          900: '#12233a',
          950: '#0c1829',
        },
      },
    },
  },
  plugins: [],
};
