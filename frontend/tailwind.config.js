/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050709',
        surface: '#090D12',
        'surface-elevated': '#0D131A',
        'surface-border': '#141C24',
        'surface-border-active': '#1E2D3D',
        cyan: {
          accent: '#00C7D4',
          hover: '#18DCE8',
          glow: 'rgba(0, 199, 212, 0.15)',
          dim: 'rgba(0, 199, 212, 0.08)',
        },
        primary: '#F3F4F6',
        secondary: '#7E8B9B',
        muted: '#4B5563',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        widest: '.2em',
        tightest: '-.03em',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}


