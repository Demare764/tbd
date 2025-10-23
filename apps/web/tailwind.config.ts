import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fade: {
          bg: '#0a0a0a',
          gray: '#9CA3AF',
          red: '#EF4444',
          whiteout: '#ffffff'
        }
      }
    }
  },
  plugins: []
} satisfies Config
