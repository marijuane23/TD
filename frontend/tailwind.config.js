/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        celebrate: {
          blue: '#2f6bff',
          gold: '#ffb020',
          rose: '#ff5f8f',
          mint: '#39e0c4',
          paleGold: '#ffe08a',
          paleBlue: '#9bc0ff',
        },
        bisu: {
          blue: {
            DEFAULT: '#1E3A8A',
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
          gold: {
            DEFAULT: '#F59E0B',
            50: '#fffbeb',
            100: '#fef3c7',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
          },
          green: {
            DEFAULT: '#059669',
            50: '#ecfdf5',
            100: '#d1fae5',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
          },
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
