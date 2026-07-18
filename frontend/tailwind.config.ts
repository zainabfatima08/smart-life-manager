import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '.dark'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#050711',
        nebula: '#0f172a',
      },
      fontFamily: {
        primary: ['Geist', 'system-ui'],
      },
    },
  },
  plugins: [],
};

export default config;
