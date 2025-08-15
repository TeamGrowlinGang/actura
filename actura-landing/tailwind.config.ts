import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2a74ff',
          dark: '#1f55c8',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
        body: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        navbar: '0 10px 30px rgba(0,0,0,0.08) inset, 0 1px 2px rgba(255,255,255,0.3) inset',
      },
    },
  },
  plugins: [],
} satisfies Config;


